import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Song from "@/lib/models/Song";
import { errorResponse, requireUser, serialize } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const filter: Record<string, unknown> = {};
    for (const key of ["singer", "language", "category", "type", "key"] as const) {
      const value = searchParams.get(key);
      if (value) filter[key] = value;
    }
    const tag = searchParams.get("tag");
    if (tag) filter.tags = tag;
    if (q) filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { singer: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } }
    ];
    const songs = await Song.find(filter).sort({ title: 1 }).limit(80);
    return NextResponse.json(serialize(songs));
  } catch (error) { return errorResponse(error); }
}

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const body = await req.json();
    const song = await Song.create(body);
    return NextResponse.json(serialize(song), { status: 201 });
  } catch (error) { return errorResponse(error); }
}
