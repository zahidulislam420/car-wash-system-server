import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient } from 'mongodb';

const app = express();

app.use(cors());
app.use(express.json());



const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
if (!mongoUri) {
  throw new Error("Set MONGODB_URI or DB_URI in your .env file");
}
const client = new MongoClient(mongoUri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("Could not connect to MongoDB:", err);
    throw err;
  }
}

app.get("/services", async (req, res) => {
  try {
    const result = await servicesCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Failed to fetch services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

const connectedClient = await connectToMongoDB();

const db = connectedClient.db(process.env.MONGODB_DATABASE || "ph-car-wash-system");
const usersCollection = db.collection("users");
const bookingsCollection = db.collection("bookings");
const branchesCollection = db.collection("branches");
const servicesCollection = db.collection("services");


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
