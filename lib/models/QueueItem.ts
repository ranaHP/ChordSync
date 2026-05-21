import { Schema, model, models, Types } from "mongoose";

const QueueItemSchema = new Schema({
  groupId: { type: Types.ObjectId, ref: "Group", required: true, index: true },
  songId: { type: Types.ObjectId, ref: "Song", required: true },
  addedBy: { type: Types.ObjectId, ref: "User", required: true },
  order: { type: Number, required: true },
  status: { type: String, enum: ["upcoming", "current", "played", "removed"], default: "upcoming", index: true }
}, { timestamps: true });
QueueItemSchema.index({ groupId: 1, order: 1 });
export default models.QueueItem || model("QueueItem", QueueItemSchema);
