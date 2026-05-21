import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
      <div className="stage-card p-10">
        <p className="mb-4 text-sm font-bold uppercase tracking-[.4em] text-neon-blue">Live Stage Companion</p>
        <h1 className="bg-gradient-to-r from-white via-neon-amber to-neon-pink bg-clip-text text-6xl font-black text-transparent md:text-8xl">ChordSync</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">Create a group, build a shared song queue, hand off control, and keep every singer's chords scrolling in sync.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="stage-button" href={session ? "/dashboard" : "/login"}>{session ? "Open dashboard" : "Sign in with Google"}</Link>
          <Link className="stage-button-secondary" href="/songs">Browse songs</Link>
        </div>
      </div>
    </main>
  );
}
