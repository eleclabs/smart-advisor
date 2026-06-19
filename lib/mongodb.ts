import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

if (!globalThis.mongoose) {
  globalThis.mongoose = {
    conn: null,
    promise: null
  };
}

const cached = globalThis.mongoose;

export async function connectDB() {

  if (cached.conn)
    return cached.conn;

  if (!cached.promise) {

    cached.promise = mongoose.connect(
      MONGODB_URI
    );

  }

  cached.conn = await cached.promise;

  return cached.conn;
}

