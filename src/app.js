import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/services", serviceRoutes);


app.get("/get", (req, res) => {
  res.send("Welcome to the API. Successfully connected to the server.");
});





app.use(notFoundHandler);
app.use(errorHandler);



export default app;
