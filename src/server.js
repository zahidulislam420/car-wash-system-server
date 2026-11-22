import "dotenv/config";
import app from "./app.js";
import { closeMongoDB, connectToMongoDB } from "./config/database.js";

const port = Number(process.env.PORT) || 5000;

try {
  const database = await connectToMongoDB();
  app.locals.database = database;
  const server = app.listen(port, () => console.log(`Server listening on port ${port}`));

  async function shutdown() {
    server.close(async () => {
      await closeMongoDB();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Unable to start server:", error.message);
  process.exit(1);
}
