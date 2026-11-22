import { MongoClient } from "mongodb";

let client;

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI || process.env.DB_URI;
  if (!uri) throw new Error("MONGODB_URI must be set in the environment");

  client = new MongoClient(uri);
  await client.connect();
  const database = client.db(process.env.MONGODB_DATABASE || "ph-car-wash-system");
  console.log(`Connected to MongoDB database: ${database.databaseName}`);
  return database;
}

export async function closeMongoDB() {
  if (client) await client.close();
}
