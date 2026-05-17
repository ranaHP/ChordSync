import { Schema, model, models } from "mongoose";

const SongSchema = new Schema({
  title: { type: String, required: true, index: "text" },
  singer: { type: String, required: true, index: true },
  language: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  key: { type: String, required: true, index: true },
  tempo: { type: Number, required: true },
  lyricsWithChords: { type: String, required: true },
  tags: [{ type: String, index: true }]
}, { timestamps: true });
SongSchema.index({ title: "text", singer: "text", tags: "text" });
export default models.Song || model("Song", SongSchema);
