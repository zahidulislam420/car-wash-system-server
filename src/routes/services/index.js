import { Router } from "express";
import { ObjectId } from "mongodb";
import { sendSuccess } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { servicesCollection } from "../../config/db.js";

// Mounted at /api/services

const serviceRouter = Router();

serviceRouter.post("/", async (req, res) => {
  const data = req.body;
  console.log(data, "data");
  const result = await servicesCollection.insertOne(data);
  res.send(result);
  // sendSuccess(res, result, "Service added successfully");
});

serviceRouter.get("/", async (req, res) => {
  const queries = req.query;

  console.log(queries, "queries");

  const find = {};

  if (queries.createdBy) {
    find.createdBy = queries.createdBy;
  }
  if (queries.branch) {
    find.branch = queries.branch;
  }
  if (queries.name) {
    find.name = queries.name;
  }

  console.log(find, "find");

  const services = await servicesCollection.find(find).toArray();
  // res.send({ success: true, status: 200, result: services });
  sendSuccess(res, services, "Services fetched successfully");
});

// GET /services/:id
// Returns one service. The details page uses this.
serviceRouter.get("/:id", async (req, res) => {
  // A bad id cannot match any service, so answer "not found" right away.
  if (!ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, "Service not found");
  }

  const service = await servicesCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  sendSuccess(res, service, "Service fetched successfully");
});

export default serviceRouter;
