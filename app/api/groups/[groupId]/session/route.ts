import { NextRequest, NextResponse } from "next/server";
import QueueItem from "@/lib/models/QueueItem";
import SessionState from "@/lib/models/SessionState";
import { errorResponse, requireMember, serialize } from "@/lib/api";
import { publishGroup } from "@/lib/realtime";

async function state(groupId: string) {
  return SessionState.findOne({ groupId }).populate("controllerId", "name email image").populate({ path: "currentQueueItemId", populate: { path: "songId" } });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    await requireMember(groupId);
    return NextResponse.json(serialize(await state(groupId)));
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { user, membership } = await requireMember(groupId);
    const body = await req.json();
    const current = await SessionState.findOne({ groupId }) || await SessionState.create({ groupId });
    const isAdmin = ["owner", "admin"].includes(membership.role);
    const isController = current.controllerId?.toString() === user._id.toString();

    if (body.action === "start") {
      const first = await QueueItem.findOne({ groupId, status: { $in: ["current", "upcoming"] } }).sort({ status: 1, order: 1 });
      if (!first) throw new Error("Invalid empty queue");
      await QueueItem.updateMany({ groupId, status: "current" }, { status: "upcoming" });
      await QueueItem.updateOne({ _id: first._id }, { status: "current" });
      await SessionState.updateOne({ groupId }, { currentQueueItemId: first._id, isActive: true, controllerId: current.controllerId || user._id, scrollPercent: 0 });
    }
    if (body.action === "request-control") {
      if (!current.controllerId) await SessionState.updateOne({ groupId }, { controllerId: user._id });
      else if (!isController) await SessionState.updateOne({ groupId, "controlRequests.userId": { $ne: user._id } }, { $push: { controlRequests: { userId: user._id } } });
    }
    if (body.action === "decide-control") {
      if (!isAdmin && !isController) throw new Error("Forbidden");
      const requestUserId = body.userId;
      if (body.decision === "approved") await SessionState.updateOne({ groupId }, { controllerId: requestUserId, $set: { "controlRequests.$[r].status": "approved" } }, { arrayFilters: [{ "r.userId": requestUserId }] });
      else await SessionState.updateOne({ groupId }, { $set: { "controlRequests.$[r].status": "rejected" } }, { arrayFilters: [{ "r.userId": requestUserId }] });
    }
    if (body.action === "scroll") {
      if (!isController) throw new Error("Forbidden");
      const scrollPercent = Math.max(0, Math.min(100, Number(body.scrollPercent) || 0));
      await SessionState.updateOne({ groupId }, { scrollPercent });
      await publishGroup(groupId, "scroll:update", { scrollPercent, controllerId: user._id.toString() });
    }
    if (body.action === "end-minute") {
      if (!isAdmin && !isController) throw new Error("Forbidden");
      await SessionState.updateOne({ groupId }, { endingAt: new Date(Date.now() + 60_000) });
    }
    const updated = serialize(await state(groupId));
    await publishGroup(groupId, "session:update", { state: updated });
    return NextResponse.json(updated);
  } catch (error) { return errorResponse(error); }
}
