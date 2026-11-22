import { Router } from "express";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const services = await req.app.locals.database.collection("services").find().toArray();
    res.json(services);
  } catch (error) {
    next(error);
  }
});

export default router;
