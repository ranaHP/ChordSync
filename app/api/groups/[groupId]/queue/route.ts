import { NextRequest, NextResponse } from "next/server";
import QueueItem from "@/lib/models/QueueItem";
import SessionState from "@/lib/models/SessionState";
import { errorResponse, requireMember, serialize } from "@/lib/api";
import { publishGroup } from "@/lib/realtime";

async function loadQueue(groupId: string) {
  return QueueItem.find({ groupId, status: { $ne: "removed" } }).populate("songId").populate("addedBy", "name email image").sort({ order: 1 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    await requireMember(groupId);
    const queue = await loadQueue(groupId);
    return NextResponse.json(serialize(queue));
  } catch (error) { return errorResponse(error); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { user } = await requireMember(groupId);
    const { songId } = await req.json();
    if (!songId) throw new Error("Invalid song");
    const last = await QueueItem.findOne({ groupId }).sort({ order: -1 });
    const item = await QueueItem.create({ groupId, songId, addedBy: user._id, order: (last?.order ?? 0) + 1 });
    const populated = await item.populate([{ path: "songId" }, { path: "addedBy", select: "name email image" }]);
    await publishGroup(groupId, "queue:update", { queue: serialize(await loadQueue(groupId)) });
    return NextResponse.json(serialize(populated), { status: 201 });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { user, membership } = await requireMember(groupId);
    const session = await SessionState.findOne({ groupId });
    const isController = session?.controllerId?.toString() === user._id.toString();
    if (!["owner", "admin"].includes(membership.role) && !isController) throw new Error("Forbidden");
    const { action, itemId, order } = await req.json();
    if (action === "remove") await QueueItem.updateOne({ _id: itemId, groupId }, { status: "removed" });
    if (action === "reorder" && Array.isArray(order)) await Promise.all(order.map((id: string, index: number) => QueueItem.updateOne({ _id: id, groupId }, { order: index + 1 })));
    if (action === "next") {
      const current = await QueueItem.findOne({ groupId, status: "current" });
      if (current) await QueueItem.updateOne({ _id: current._id }, { status: "played" });
      const next = await QueueItem.findOne({ groupId, status: "upcoming" }).sort({ order: 1 });
      if (next) {
        await QueueItem.updateOne({ _id: next._id }, { status: "current" });
        await SessionState.updateOne({ groupId }, { currentQueueItemId: next._id, endingAt: null, scrollPercent: 0, isActive: true });
      } else {
        await SessionState.updateOne({ groupId }, { currentQueueItemId: null, endingAt: null, isActive: false });
      }
    }
    const queue = serialize(await loadQueue(groupId));
    await publishGroup(groupId, "queue:update", { queue });
    await publishGroup(groupId, "session:update", { state: serialize(await SessionState.findOne({ groupId }).populate("controllerId", "name email image")) });
    return NextResponse.json({ queue });
  } catch (error) { return errorResponse(error); }
}
