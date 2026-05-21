import { Schema, model, models, Types } from "mongoose";

const GroupMemberSchema = new Schema({
  groupId: { type: Types.ObjectId, ref: "Group", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
export default models.GroupMember || model("GroupMember", GroupMemberSchema);
