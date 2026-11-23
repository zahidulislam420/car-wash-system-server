import { Router } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import usersRouter from "./users/index.js";
import bookingsRouter from "./bookings/index.js";
import serviceRouter from "./services/index.js";

// All API routes live under /api (see app.js).

const router = Router();

// GET /api/health — quick check that the server is up.
router.get("/test", (req, res) => {
  sendSuccess(res, { status: "ok" }, "API is running");
});

// Keep the project's existing liveness endpoint available.
router.get("/health", (req, res) => {
  sendSuccess(res, { status: "ok" }, "API is running");
});

router.use("/users", usersRouter);
router.use("/services", serviceRouter);
router.use("/bookings", bookingsRouter);

export default router;
