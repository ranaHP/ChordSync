import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import GroupMember from "@/lib/models/GroupMember";
import QueueItem from "@/lib/models/QueueItem";
import SessionState from "@/lib/models/SessionState";
import SessionClient from "@/components/SessionClient";

export default async function SessionPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  const membership = await GroupMember.findOne({ groupId, userId: user._id });
  if (!membership) redirect("/groups");
  const queue = await QueueItem.find({ groupId, status: { $ne: "removed" } }).populate("songId").sort({ order: 1 });
  const state = await SessionState.findOne({ groupId }).populate("controllerId", "name email image");
  return <SessionClient groupId={groupId} userId={user.id} role={membership.role} initialQueue={JSON.parse(JSON.stringify(queue))} initialState={JSON.parse(JSON.stringify(state))} />;
}
