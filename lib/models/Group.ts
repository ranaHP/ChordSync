import { Schema, model, models, Types } from "mongoose";

const GroupSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Group || model("Group", GroupSchema);
