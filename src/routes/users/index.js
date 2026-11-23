import { Router } from "express";
import { ObjectId } from "mongodb";
import { usersCollection } from "../../config/db.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { checkAuthenticatedUser, verifyRole } from "../../middleware/auth.js";

// Mounted at /api/users

// The roles and branches a user can have.
const ROLES = ["admin", "user", "branchManager"];
const BRANCHES = ["Dhaka", "Chittagong", "Khulna", "Sylhet"];

const router = Router();

router.get(
  "/",
  checkAuthenticatedUser,
  verifyRole(["admin"]),
  async (req, res) => {
    console.log(req.user, "req user from middleware");
    const result = await usersCollection.find().toArray();

    // res.send({success: true, message: "Users fetched successfully", data: res});
    sendSuccess(res, result, "Users fetched successfully");
  },
);

// PATCH /users/:id
// Changes one user's role. Body: { role, branch }.
// The branch is only kept for branch managers; everyone else gets null.
router.patch("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, "User not found");
  }

  const { role, branch } = req.body;

  if (!ROLES.includes(role)) {
    throw new ApiError(400, "Role must be admin, user or branchManager");
  }

  let newBranch = null;
  if (role === "branchManager") {
    if (!BRANCHES.includes(branch)) {
      throw new ApiError(400, "Choose a valid branch for a branch manager");
    }
    newBranch = branch;
  }

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role, branch: newBranch, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "User not found");
  }

  sendSuccess(res, null, "User updated successfully");
});

export default router;
