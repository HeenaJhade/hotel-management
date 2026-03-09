const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Room = require("../models/Room");
const { getUserFromToken } = require("../utils/helpers");

const createPaymentIntent = async (req, res) => {
  try {
    if (!req.body.metadata) {
      return res.status(400).json({ detail: "Missing metadata" });
    }

    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      specialRequests = "",
    } = req.body.metadata;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ detail: "Missing required booking fields" });
    }

    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ detail: "Authentication required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ detail: "Room not found" });
    }

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      return res.status(400).json({ detail: "Invalid date selection" });
    }

    const totalAmount = room.price * nights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        roomId: room._id.toString(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: guests.toString(),
        specialRequests,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ detail: "Payment intent failed" });
  }
};

module.exports = { createPaymentIntent };