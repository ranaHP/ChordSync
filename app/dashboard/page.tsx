import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { auth } from "@/lib/auth";
import { MotionShell } from "@/components/MotionShell";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  return <><Nav /><main className="mx-auto max-w-7xl px-6 py-10"><MotionShell className="stage-card p-8"><p className="text-neon-blue">Hello {session.user.name}</p><h1 className="mt-2 text-5xl font-black">Ready for tonight's jam?</h1><p className="mt-4 max-w-2xl text-white/60">Create a group, invite friends, add songs, and open fullscreen chord sheets with synced scrolling.</p><div className="mt-8 flex gap-3"><Link className="stage-button" href="/groups">Manage groups</Link><Link className="stage-button-secondary" href="/songs">Song library</Link></div></MotionShell></main></>;
}
