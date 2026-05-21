import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Group from "@/lib/models/Group";
import GroupMember from "@/lib/models/GroupMember";
import User from "@/lib/models/User";
import CreateGroup from "@/components/CreateGroup";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  const memberships = await GroupMember.find({ userId: user._id });
  const groups = await Group.find({ _id: { $in: memberships.map((m) => m.groupId) } }).sort({ updatedAt: -1 });
  return <><Nav /><main className="mx-auto max-w-7xl space-y-6 px-6 py-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-neon-blue">Groups</p><h1 className="text-4xl font-black">Your circles</h1></div><CreateGroup /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <Link key={group.id} href={`/groups/${group.id}`} className="stage-card p-6 transition hover:-translate-y-1"><h2 className="text-2xl font-bold">{group.name}</h2><p className="mt-2 text-white/60">{group.description || "Live queue ready."}</p></Link>)}</div>{groups.length === 0 && <div className="stage-card p-10 text-center text-white/60">Create your first group to start syncing.</div>}</main></>;
}
