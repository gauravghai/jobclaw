import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "jobglobe";

interface CachedMongo {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongo: CachedMongo | undefined;
}

const cached: CachedMongo = global._mongo || { client: null, promise: null };
if (!global._mongo) global._mongo = cached;

export async function getDb(): Promise<Db> {
  if (cached.client) return cached.client.db(DB_NAME);
  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI, { maxPoolSize: 10 });
  }
  cached.client = await cached.promise;
  return cached.client.db(DB_NAME);
}
