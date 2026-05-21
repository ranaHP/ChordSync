import { Schema, model, models, Types } from "mongoose";

const ControlRequestSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { _id: false });

const SessionStateSchema = new Schema({
  groupId: { type: Types.ObjectId, ref: "Group", required: true, unique: true, index: true },
  currentQueueItemId: { type: Types.ObjectId, ref: "QueueItem" },
  controllerId: { type: Types.ObjectId, ref: "User" },
  scrollPercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  endingAt: Date,
  controlRequests: [ControlRequestSchema]
}, { timestamps: true });

export default models.SessionState || model("SessionState", SessionStateSchema);
