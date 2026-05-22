import "dotenv/config";
import { prisma } from "../lib/prisma";

const templates = [
  ["Moonlit Kadella", "Nira Jay", "Singlish", "Baila", "Upbeat", "D", 118, ["singlish", "baila", "campfire"]],
  ["River Lanterns", "Maya Stone", "English", "Folk", "Acoustic", "G", 92, ["folk", "soft", "harmony"]],
  ["Dil Ka Safar", "Arun Vale", "Hindi-style", "Ballad", "Acoustic", "Em", 76, ["romantic", "travel", "warm"]],
  ["Colombo Rain", "The Coconut Trio", "Singlish", "Pop", "Groove", "C", 104, ["rain", "city", "pop"]],
  ["Firefly Road", "Lena Hart", "English", "Country", "Singalong", "A", 110, ["road", "chorus", "bright"]],
  ["Sitaare Aaj", "Kavi Noor", "Hindi-style", "Pop", "Dance", "F#m", 122, ["stars", "dance", "night"]],
  ["Tea Hills Echo", "Samadi Perera", "Singlish", "Folk", "Waltz", "G", 84, ["hills", "echo", "gentle"]],
  ["Neon Harbour", "East Pier", "English", "Rock", "Anthem", "E", 128, ["rock", "neon", "harbour"]],
  ["Raahi Re", "Nilan Kapoor", "Hindi-style", "Folk", "Road", "Am", 88, ["journey", "folk", "clap"]],
  ["Golden Strings", "Ava Miles", "English", "Soul", "Slow Jam", "Bb", 70, ["soul", "gold", "late-night"]]
] as const;

function sheet(title: string, key: string) {
  return `[Intro]\n${key}   ${key}sus4   ${key}\n\n[Verse]\n${key}                 G\nWe gather where the warm lights glow\nD                    A\nHands keep time while the night moves slow\n\n[Chorus]\nG              D\n${title} rising to the sky\nA              ${key}\nFriends in rhythm, hearts unwound`;
}

async function main() {
  await prisma.song.deleteMany();
  await prisma.song.createMany({
    data: templates.map(([title, singer, language, category, type, key, tempo, tags]) => ({
      title,
      singer,
      language,
      category,
      type,
      key,
      tempo,
      tags: tags.join(","),
      lyricsWithChords: sheet(title, key)
    }))
  });
  console.log(`Seeded ${templates.length} songs to MySQL.`);
}

main().finally(async () => prisma.$disconnect());
