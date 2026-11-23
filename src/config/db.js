import { MongoClient } from "mongodb";
import { env } from "./env.js";

// Same database name the frontend (Better Auth) uses.
export const DB_NAME = env.DB_NAME;

const client = new MongoClient(env.DB_URI);
/** @type {import("mongodb").Db} */
let db = client.db(DB_NAME);

// Opens the connection and checks it with a ping.
// Called once at startup from src/index.js.
export async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  await db.command({ ping: 1 });
  return db;
}

export const usersCollection = db.collection("user");
export const servicesCollection = db.collection("services");
export const bookingCollection = db.collection("bookings");

export async function closeDB() {
  await client.close();
}
