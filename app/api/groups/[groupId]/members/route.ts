import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import GroupMember from "@/lib/models/GroupMember";
import { errorResponse, requireMember, serialize } from "@/lib/api";
import { publishGroup } from "@/lib/realtime";

export async function GET(_: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    await requireMember(groupId);
    const members = await GroupMember.find({ groupId }).populate("userId", "name email image").sort({ role: 1 });
    return NextResponse.json(serialize(members));
  } catch (error) { return errorResponse(error); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { membership } = await requireMember(groupId);
    if (!["owner", "admin"].includes(membership.role)) throw new Error("Forbidden");
    const { query, userId } = await req.json();
    let user = userId ? await User.findById(userId) : null;
    if (!user && query) user = await User.findOne({ $or: [{ email: query.toLowerCase() }, { name: { $regex: query, $options: "i" } }] });
    if (!user) throw new Error("Invalid user not found");
    const member = await GroupMember.findOneAndUpdate({ groupId, userId: user._id }, { $setOnInsert: { role: "member", joinedAt: new Date() } }, { upsert: true, new: true }).populate("userId", "name email image");
    await publishGroup(groupId, "members:update", { member: serialize(member) });
    return NextResponse.json(serialize(member), { status: 201 });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const { membership } = await requireMember(groupId);
    if (!["owner", "admin"].includes(membership.role)) throw new Error("Forbidden");
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) throw new Error("Invalid user");
    await GroupMember.deleteOne({ groupId, userId, role: { $ne: "owner" } });
    await publishGroup(groupId, "members:update", {});
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
