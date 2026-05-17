"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ChordSheet from "@/components/ChordSheet";
import { getPusherClient } from "@/lib/realtime-client";

type QueueItem = { _id: string; status: string; songId: { title: string; singer: string; key: string; tempo: number; lyricsWithChords: string } };
type State = { controllerId?: { _id: string; name?: string; email: string }; scrollPercent: number; endingAt?: string; controlRequests?: { userId: string; status: string }[] } | null;

export default function SessionClient({ groupId, userId, initialQueue, initialState, role }: { groupId: string; userId: string; initialQueue: QueueItem[]; initialState: State; role: string }) {
  const [queue, setQueue] = useState(initialQueue);
  const [state, setState] = useState(initialState);
  const [countdown, setCountdown] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const current = queue.find((i) => i.status === "current");
  const next = useMemo(() => queue.find((i) => i.status === "upcoming"), [queue]);
  const isController = state?.controllerId?._id === userId;
  const isAdmin = ["owner", "admin"].includes(role);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`group-${groupId}`);
    channel.bind("queue:update", (d: { queue: QueueItem[] }) => setQueue(d.queue));
    channel.bind("session:update", (d: { state: State }) => setState(d.state));
    channel.bind("scroll:update", (d: { scrollPercent: number }) => {
      if (isController || !scroller.current) return;
      const max = scroller.current.scrollHeight - scroller.current.clientHeight;
      scroller.current.scrollTo({ top: (max * d.scrollPercent) / 100, behavior: "smooth" });
    });
    return () => { pusher.unsubscribe(`group-${groupId}`); pusher.disconnect(); };
  }, [groupId, isController]);

  useEffect(() => {
    if (!state?.endingAt) { setCountdown(null); return; }
    const timer = setInterval(() => setCountdown(Math.max(0, Math.ceil((new Date(state.endingAt!).getTime() - Date.now()) / 1000))), 500);
    return () => clearInterval(timer);
  }, [state?.endingAt]);

  async function patch(action: string, extra = {}) {
    const res = await fetch(`/api/groups/${groupId}/session`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    if (res.ok) setState(await res.json()); else toast.error((await res.json()).error || "Action failed");
  }
  async function nextSong() {
    await fetch(`/api/groups/${groupId}/queue`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "next" }) });
  }
  function onScroll() {
    if (!isController || !scroller.current) return;
    const max = scroller.current.scrollHeight - scroller.current.clientHeight;
    const scrollPercent = max <= 0 ? 0 : (scroller.current.scrollTop / max) * 100;
    window.clearTimeout((onScroll as unknown as { t?: number }).t);
    (onScroll as unknown as { t?: number }).t = window.setTimeout(() => patch("scroll", { scrollPercent }), 80);
  }
  function enterFullscreen() { document.documentElement.requestFullscreen?.(); }

  return (
    <main className="min-h-screen bg-stage-radial">
      <div className="fixed left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-5 py-3 backdrop-blur">
        <div><p className="text-xs uppercase tracking-[.25em] text-neon-blue">Performance mode</p><h1 className="font-black">{current?.songId.title || "No current song"}</h1></div>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span className="rounded-full bg-neon-amber/20 px-3 py-2 text-neon-amber">{isController ? "You control scroll" : `Controller: ${state?.controllerId?.name || "Open"}`}</span><button className="stage-button-secondary" onClick={enterFullscreen}>Enter fullscreen</button><button className="stage-button-secondary" onClick={() => patch("request-control")}>Request Control</button>{(isController || isAdmin) && <button className="stage-button-secondary" onClick={() => patch("end-minute")}>End in 1 Min</button>}{(isController || isAdmin) && <button className="stage-button" onClick={nextSong}>Next Song Full</button>}</div>
      </div>
      <div ref={scroller} onScroll={onScroll} className={`h-screen overflow-y-auto px-5 pb-20 pt-28 ${isController ? "" : "pointer-events-none"}`}>
        <AnimatePresence mode="wait">
          {countdown !== null && next ? (
            <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-[calc(100vh-8rem)] grid-rows-2 gap-4">
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 opacity-70"><p className="mb-2 text-neon-pink">Ending in {countdown}s</p><ChordSheet large text={current?.songId.lyricsWithChords || ""} /></section>
              <section className="rounded-3xl border border-neon-blue/30 bg-neon-blue/10 p-6 shadow-cyan"><p className="mb-2 text-neon-blue">Next preview: {next.songId.title}</p><ChordSheet large text={next.songId.lyricsWithChords} /></section>
            </motion.div>
          ) : (
            <motion.section key={current?._id || "empty"} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-black/35 p-8 shadow-glow md:p-12">
              {current ? <><div className="mb-10"><p className="text-neon-blue">{current.songId.singer} • Key {current.songId.key} • {current.songId.tempo} BPM</p><h2 className="text-5xl font-black md:text-7xl">{current.songId.title}</h2></div><ChordSheet large text={current.songId.lyricsWithChords} /></> : <p className="py-32 text-center text-3xl text-white/50">Waiting for the group to start a session.</p>}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
