import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import GroupMember from "@/lib/models/GroupMember";
import QueueItem from "@/lib/models/QueueItem";
import SessionState from "@/lib/models/SessionState";
import GroupClient from "@/components/GroupClient";

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  const membership = await GroupMember.findOne({ groupId, userId: user._id });
  if (!membership) redirect("/groups");
  const group = await Group.findById(groupId);
  const queue = await QueueItem.find({ groupId, status: { $ne: "removed" } }).populate("songId").populate("addedBy", "name email image").sort({ order: 1 });
  const state = await SessionState.findOne({ groupId }).populate("controllerId", "name email image");
  return <><Nav /><main className="mx-auto max-w-7xl space-y-6 px-6 py-8"><div><p className="text-neon-blue">Group stage</p><h1 className="text-4xl font-black">{group?.name}</h1><p className="text-white/60">{group?.description}</p></div><GroupClient groupId={groupId} initialQueue={JSON.parse(JSON.stringify(queue))} initialState={JSON.parse(JSON.stringify(state))} userId={user.id} role={membership.role} /></main></>;
}
