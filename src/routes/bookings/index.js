import { Router } from "express";
import { bookingCollection, servicesCollection } from "../../config/db.js";
import { stripe } from "../../config/stripe.js";
import { ObjectId } from "mongodb";
import { checkAuthenticatedUser, verifyRole } from "../../middleware/auth.js";

const router = Router();

router.post(
  "/create-checkout-session",
  checkAuthenticatedUser,
  async (req, res) => {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: "Payments are not configured",
      });
    }
    const payload = req.body;
    // console.log(payload, "payload");

    // payload = { serviceId: ObjectId, userEmail: "user@example.com" }
    // console.log(payload.serviceId, "serviceId");

    // Step-1: Check if the service exists in the database
    const service = await servicesCollection.findOne({
      _id: new ObjectId(payload.serviceId),
    });
    if (!service) {
      // throw new Error("Service not found");
      return res.status(404).json({ error: "Service not found" });
    }
    // console.log(service, "service");

    //   // Step-2: Create a booking in the database with status "pending"
    const booking = {
      serviceId: payload.serviceId,
      userEmail: payload.userEmail,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date(),
    };
    const bookingCreateResult = await bookingCollection.insertOne(booking);
    // console.log(bookingCreateResult, "bookingCreateResult");

    // Step-3: Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // price: service.price,
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
              description: service.description,
            },

            unit_amount: parseInt(service.price * 0.00804 * 100), // Convert BDT to USD and then to cents
          },

          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/booking/success?bookingId=${bookingCreateResult.insertedId.toString()}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/cancel`,
      mode: "payment",
      metadata: {
        bookingId: bookingCreateResult.insertedId.toString(),
        userId: payload.userId,
      },
    });

    // console.log(session, "session");

    res.send({
      success: true,
      message: "Checkout session created",
      data: {
        redirectUrl: session.url,
      },
    });
  },
);



router.get("/", checkAuthenticatedUser, verifyRole(["admin", "branchManager"]), async (req, res) => {
  const userEmail = req.user.email;

  try {
    const bookings = await bookingCollection
      .find({ userEmail })
      .toArray();

    res.send({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
})

export default router;
