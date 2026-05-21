export default function ChordSheet({ text, large = false }: { text: string; large?: boolean }) {
  return (
    <div className={large ? "space-y-3 text-2xl leading-relaxed md:text-4xl" : "space-y-2 text-lg leading-relaxed"}>
      {text.split("\n").map((line, index) => {
        const isChord = /^\s*(\[[A-G][^\]]*\]|[A-G](#|b)?(m|maj|min|sus|dim|aug|add)?\d*\s*)+$/.test(line.trim());
        return <div key={index} className={isChord ? "chord-line font-bold" : line.trim().startsWith("[") ? "text-neon-blue/80" : "lyric-line"}>{line || "\u00A0"}</div>;
      })}
    </div>
  );
}
