import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const checkAuthenticatedUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  const parseToken = token.split(" ")[1]; // Assuming the token is in the format "Bearer <token>"

  // console.log({ parseToken });

  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${env.CLIENT_URL}/api/auth/jwks`),
    );
    const { payload } = await jwtVerify(parseToken, JWKS, {
      issuer: env.CLIENT_URL, // Should match your JWT issuer, which is the BASE_URL
      audience: env.CLIENT_URL, // Should match your JWT audience, which is the BASE_URL by default
    });
    // console.log(payload, "payload");
    req.user = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      branch: payload.branch || null, // Default to null if branch is not present
      id: payload.id,
    };
  } catch (e) {
    throw new ApiError(401, "Unauthorized: Invalid token");
  }
  next();
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    console.log(req.user, "req.user from verifyRole middleware");

    // Authenticated user role from the token
    const role = req.user?.role;

    if (roles.includes(role)) {
      next();
    } else {
      throw new ApiError(
        403,
        "Forbidden: You do not have the required role to access this resource",
      );
    }
  };
};
