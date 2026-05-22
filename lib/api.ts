import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import GroupMember from "@/lib/models/GroupMember";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireMember(groupId: string) {
  const user = await requireUser();
  if (!Types.ObjectId.isValid(groupId)) throw new Error("Invalid group");
  const membership = await GroupMember.findOne({ groupId, userId: user._id });
  if (!membership) throw new Error("Forbidden");
  return { user, membership };
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message.startsWith("Invalid") ? 400 : 500;
  return NextResponse.json({ error: message }, { status });
}

export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}
