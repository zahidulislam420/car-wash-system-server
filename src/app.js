import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { stripe } from "./config/stripe.js";
import { bookingCollection } from "./config/db.js";
import { ObjectId } from "mongodb";

// Builds the Express app. Does not start listening (see src/index.js).

const app = express();

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Payments are not configured",
      });
    }
    // After payment, Stripe sends an event here.

    // step-1: Get the raw event body and Stripe's signature header.
    // req.body is a Buffer (from express.raw above); constructEvent needs it unparsed.
    const stripeEvent = req.body;
    const signature = req.headers["stripe-signature"];

    // step-2: Verify the signature so only genuine Stripe events are accepted.
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        stripeEvent,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (e) {
      console.log("Stripe webhook verification failed:", e.message);
      return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    // step-3: Handle the event types we care about.
    console.log("Stripe event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // bookingId was attached as metadata in POST /bookings/create-checkout-session.
      console.log(
        "Payment completed for booking:",
        session.metadata?.bookingId,
      );
      // Update the booking status in the database.
      await bookingCollection.updateOne(
        { _id: new ObjectId(session.metadata?.bookingId) },
        { $set: { status: "confirmed", paymentStatus: "paid" } },
      );
    }

    // step-4: Acknowledge receipt. Without a response Stripe times out and retries.
    res.json({ received: true });
  },
);

// Only the frontend origin may call this API from a browser.
app.use(cors({ origin: env.CLIENT_URL }));

// Parse JSON request bodies.
app.use(express.json());

app.use("/api", routes);

// Must come after all routes.
app.use(notFound);
app.use(errorHandler);

export default app;
