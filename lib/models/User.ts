import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  image: String,
  emailVerified: Date,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.User || model("User", UserSchema);
