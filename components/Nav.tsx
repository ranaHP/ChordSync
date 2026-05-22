import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/AuthButton";

export default async function Nav() {
  const session = await auth();
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/dashboard" className="text-2xl font-black tracking-tight">Chord<span className="text-neon-amber">Sync</span></Link>
      <div className="flex items-center gap-3 text-sm text-white/70">
        <Link href="/groups" className="hover:text-white">Groups</Link>
        <Link href="/songs" className="hover:text-white">Songs</Link>
        {session?.user ? <SignOutButton /> : <Link href="/login" className="stage-button-secondary">Login</Link>}
      </div>
    </nav>
  );
}
