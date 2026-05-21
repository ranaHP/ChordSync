import mongoose from "mongoose";

declare global {
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

export async function dbConnect() {
  global.mongooseConn ||= { conn: null, promise: null };
  if (global.mongooseConn.conn) return global.mongooseConn.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  global.mongooseConn.promise ||= mongoose.connect(uri, { bufferCommands: false });
  global.mongooseConn.conn = await global.mongooseConn.promise;
  return global.mongooseConn.conn;
}
