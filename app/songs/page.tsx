import Nav from "@/components/Nav";
import SongSearch from "@/components/SongSearch";

export default function SongsPage() {
  return <><Nav /><main className="mx-auto max-w-7xl space-y-6 px-6 py-8"><div><p className="text-neon-blue">Library</p><h1 className="text-4xl font-black">Songs and chord sheets</h1><p className="mt-2 text-white/60">Filter by singer, language, type, category, key, and tags. Seed data uses original placeholder lyrics.</p></div><SongSearch /></main></>;
}
