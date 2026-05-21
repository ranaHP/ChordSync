import { NextRequest, NextResponse } from "next/server";
import Group from "@/lib/models/Group";
import GroupMember from "@/lib/models/GroupMember";
import SessionState from "@/lib/models/SessionState";
import { errorResponse, requireUser, serialize } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await GroupMember.find({ userId: user._id }).select("groupId");
    const groups = await Group.find({ _id: { $in: memberships.map((m) => m.groupId) } }).sort({ updatedAt: -1 });
    return NextResponse.json(serialize(groups));
  } catch (error) { return errorResponse(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { name, description } = await req.json();
    if (!name) throw new Error("Invalid group name");
    const group = await Group.create({ name, description, ownerId: user._id });
    await GroupMember.create({ groupId: group._id, userId: user._id, role: "owner" });
    await SessionState.create({ groupId: group._id });
    return NextResponse.json(serialize(group), { status: 201 });
  } catch (error) { return errorResponse(error); }
}
