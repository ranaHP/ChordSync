"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ChordSheet from "@/components/ChordSheet";

type Song = { _id: string; title: string; singer: string; language: string; category: string; type: string; key: string; tempo: number; tags: string[]; lyricsWithChords: string };

export default function SongSearch({ groupId }: { groupId?: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/songs?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then((r) => r.json()).then(setSongs).catch(() => null).finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [q]);
  async function add(songId: string) {
    if (!groupId) return;
    const res = await fetch(`/api/groups/${groupId}/queue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ songId }) });
    if (res.ok) toast.success("Song added to queue"); else toast.error("Could not add song");
  }
  return (
    <section className="space-y-5">
      <input className="input" placeholder="Search by title, singer, language, key, tag..." value={q} onChange={(e) => setQ(e.target.value)} />
      {loading && <p className="text-white/50">Tuning the library...</p>}
      {!loading && songs.length === 0 && <div className="stage-card p-8 text-center text-white/60">No songs found. Try a different key, singer, tag, or language.</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {songs.map((song) => (
          <article key={song._id} className="stage-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="text-xl font-bold">{song.title}</h3><p className="text-sm text-white/60">{song.singer} • {song.language} • {song.key} • {song.tempo} BPM</p></div>
              {groupId && <button className="stage-button-secondary shrink-0" onClick={() => add(song._id)}>Add</button>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{song.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60">#{tag}</span>)}</div>
            <details className="mt-4"><summary className="cursor-pointer text-neon-blue">Preview chords</summary><div className="mt-3 max-h-72 overflow-auto rounded-2xl bg-black/30 p-4"><ChordSheet text={song.lyricsWithChords} /></div></details>
          </article>
        ))}
      </div>
    </section>
  );
}
