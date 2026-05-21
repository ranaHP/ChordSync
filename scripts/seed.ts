import "dotenv/config";
import { dbConnect } from "../lib/mongodb";
import Song from "../lib/models/Song";

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
  ["Golden Strings", "Ava Miles", "English", "Soul", "Slow Jam", "Bb", 70, ["soul", "gold", "late-night"]],
  ["Mal Pawan", "Ruwan & Friends", "Singlish", "Classic", "Serenade", "F", 96, ["flowers", "breeze", "classic"]],
  ["Skyline Choir", "North Avenue", "English", "Pop", "Anthem", "C", 116, ["choir", "big", "uplift"]],
  ["Sapno Ki Dhun", "Ira Sen", "Hindi-style", "Indie", "Dream", "D", 82, ["dream", "indie", "soft"]],
  ["Lagoon Lights", "Blue Palm", "Singlish", "Reggae", "Island", "A", 100, ["lagoon", "reggae", "island"]],
  ["Paper Airplanes", "Jon Bell", "English", "Indie", "Acoustic", "E", 94, ["indie", "air", "friends"]],
  ["Nadi Kinare", "Riya Dev", "Hindi-style", "Ballad", "Duet", "Gm", 78, ["river", "duet", "moon"]],
  ["Drum Circle Dawn", "Kandy Collective", "Singlish", "Fusion", "Percussive", "Dm", 132, ["drums", "fusion", "dawn"]],
  ["Velvet Morning", "June Parker", "English", "Jazz", "Lounge", "Fmaj7", 66, ["jazz", "velvet", "morning"]],
  ["Chand Ki Chai", "Mira Vaan", "Hindi-style", "Cafe", "Light", "C#m", 90, ["chai", "cafe", "moon"]],
  ["Last Train Jam", "Station Seven", "English", "Blues", "Shuffle", "E", 108, ["blues", "train", "jam"]]
] as const;

function sheet(title: string, key: string) {
  return `[Intro]\n${key}   ${key}sus4   ${key}\n\n[Verse 1]\n${key}                 G\nWe gather where the warm lights glow\nD                    A\nHands keep time while the night moves slow\n${key}                 G\nEvery voice finds a place to land\nD                    A\nOne more chord and we understand\n\n[Chorus]\nG              D\nSing it out, let the room reply\nA              ${key}\n${title} rising to the sky\nG              D\nIf the words drift, follow the sound\nA              ${key}\nFriends in rhythm, hearts unwound\n\n[Bridge]\nBm             G\nSoftly now, then louder still\nD              A\nCount the beat and climb the hill\n\n[Final Chorus]\nG              D\nSing it out, let the room reply\nA              ${key}\nOne more chorus, firelight high`;
}

async function main() {
  await dbConnect();
  await Song.syncIndexes();
  await Song.deleteMany({});
  await Song.insertMany(templates.map(([title, singer, language, category, type, key, tempo, tags]) => ({ title, singer, language, category, type, key, tempo, tags, lyricsWithChords: sheet(title, key) })));
  console.log(`Seeded ${templates.length} original placeholder songs.`);
  process.exit(0);
}

main().catch((error) => { console.error(error); process.exit(1); });
