import Stripe from "stripe";

// Stripe is optional for local development; payment endpoints require a configured key.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
