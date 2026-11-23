// One-time backfill: give existing branch managers a default branch.
//
// Only touches users with role "branchManager" whose branch is missing or empty.
// It never overwrites a branch that is already set.
//
// Usage (run from the server folder, where .env lives):
//   node scripts/backfill-branch-managers.js           dry run: lists the users, writes nothing
//   node scripts/backfill-branch-managers.js --apply   sets branch = "Dhaka" on those users

import "dotenv/config";
import { MongoClient } from "mongodb";

const DB_NAME = "ph-car-wash-system"; // same database the frontend (Better Auth) uses
const DEFAULT_BRANCH = "Dhaka";
const apply = process.argv.includes("--apply");

// Branch managers without a branch: field missing, null, or empty string.
const needsBranch = {
  role: "branchManager",
  $or: [{ branch: { $exists: false } }, { branch: null }, { branch: "" }],
};

if (!process.env.DB_URI) {
  console.error("DB_URI is not set. Run this from the server folder, where .env lives.");
  process.exit(1);
}

const client = new MongoClient(process.env.DB_URI);

try {
  await client.connect();
  const users = client.db(DB_NAME).collection("user");

  const totalManagers = await users.countDocuments({ role: "branchManager" });
  const targets = await users.find(needsBranch, { projection: { _id: 1, name: 1 } }).toArray();
  console.log(`Branch managers: ${totalManagers}. Without a branch: ${targets.length}.`);

  for (const user of targets) {
    console.log(`  - ${user.name ?? "(no name)"} (${user._id})`);
  }

  if (!apply) {
    console.log(`Dry run: nothing written. Re-run with --apply to set branch = "${DEFAULT_BRANCH}" on ${targets.length} user(s).`);
  } else if (targets.length === 0) {
    console.log("Nothing to update.");
  } else {
    // Update by the exact ids we just listed, so nothing else can be touched.
    const result = await users.updateMany(
      { _id: { $in: targets.map((user) => user._id) } },
      { $set: { branch: DEFAULT_BRANCH, updatedAt: new Date() } }
    );
    console.log(`Updated ${result.modifiedCount} user(s): branch = "${DEFAULT_BRANCH}".`);
  }
} catch (err) {
  console.error("Backfill failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
