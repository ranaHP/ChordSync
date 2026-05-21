"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getPusherClient } from "@/lib/realtime-client";
import SongSearch from "@/components/SongSearch";

type QueueItem = { _id: string; status: string; order: number; songId: { title: string; singer: string; key: string; tempo: number }; addedBy: { name?: string; email: string } };
type SessionState = { controllerId?: { _id: string; name?: string; email: string }; isActive: boolean; endingAt?: string } | null;

export default function GroupClient({ groupId, initialQueue, initialState, userId, role }: { groupId: string; initialQueue: QueueItem[]; initialState: SessionState; userId: string; role: string }) {
  const [queue, setQueue] = useState(initialQueue);
  const [state, setState] = useState(initialState);
  const [friend, setFriend] = useState("");
  const canControl = role === "owner" || role === "admin" || state?.controllerId?._id === userId;
  const current = useMemo(() => queue.find((i) => i.status === "current"), [queue]);
  const upcoming = queue.filter((i) => i.status === "upcoming");

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`group-${groupId}`);
    channel.bind("queue:update", (data: { queue: QueueItem[] }) => setQueue(data.queue));
    channel.bind("session:update", (data: { state: SessionState }) => setState(data.state));
    return () => { pusher.unsubscribe(`group-${groupId}`); pusher.disconnect(); };
  }, [groupId]);

  async function action(action: string, extra = {}) {
    const res = await fetch(`/api/groups/${groupId}/session`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    if (res.ok) setState(await res.json()); else toast.error((await res.json()).error || "Action failed");
  }
  async function queueAction(actionName: string, extra = {}) {
    const res = await fetch(`/api/groups/${groupId}/queue`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: actionName, ...extra }) });
    if (!res.ok) toast.error((await res.json()).error || "Queue update failed");
  }
  async function addFriend() {
    const res = await fetch(`/api/groups/${groupId}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: friend }) });
    if (res.ok) { toast.success("Member added"); setFriend(""); } else toast.error((await res.json()).error || "Could not add member");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <section className="space-y-6">
        <div className="stage-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm uppercase tracking-[.25em] text-neon-blue">Now playing</p><h2 className="text-3xl font-black">{current?.songId.title || "Session not started"}</h2><p className="text-white/60">Controller: {state?.controllerId?.name || state?.controllerId?.email || "Open"}</p></div>
            <Link className="stage-button" href={`/groups/${groupId}/session`}>Open Fullscreen</Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="stage-button-secondary" onClick={() => action("start")}>Start Session</button>
            <button className="stage-button-secondary" disabled={!canControl} onClick={() => queueAction("next")}>Next Song</button>
            <button className="stage-button-secondary" disabled={!canControl} onClick={() => action("end-minute")}>End Song in 1 Minute</button>
            <button className="stage-button-secondary" onClick={() => action("request-control")}>Request Control</button>
          </div>
        </div>
        <div className="stage-card p-6">
          <h3 className="mb-4 text-2xl font-bold">Queue</h3>
          {queue.length === 0 && <p className="rounded-2xl bg-black/20 p-6 text-white/50">No songs yet. Search the library and add the first anthem.</p>}
          <div className="space-y-3">{queue.map((item) => <div key={item._id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4"><div><p className="font-bold">{item.status === "current" ? "▶ " : ""}{item.songId.title}</p><p className="text-sm text-white/50">{item.songId.singer} • Added by {item.addedBy?.name || item.addedBy?.email}</p></div>{canControl && item.status !== "current" && <button onClick={() => queueAction("remove", { itemId: item._id })} className="text-sm text-red-300">Remove</button>}</div>)}</div>
        </div>
        <div className="stage-card p-6">
          <h3 className="mb-4 text-2xl font-bold">Invite friends</h3>
          <div className="flex gap-2"><input className="input" placeholder="Search name or email" value={friend} onChange={(e) => setFriend(e.target.value)} /><button className="stage-button" onClick={addFriend}>Add</button></div>
        </div>
      </section>
      <section className="stage-card p-6"><h3 className="mb-4 text-2xl font-bold">Add songs</h3><SongSearch groupId={groupId} /></section>
    </div>
  );
}
