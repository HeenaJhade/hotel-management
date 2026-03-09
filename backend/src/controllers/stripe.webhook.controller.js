const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Notification = require("../models/Notification");
const { sendBookingConfirmationEmail } = require("../services/email.service");

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.log("❌ Webhook signature failed.");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    try {

      // 🔒 Prevent duplicate booking
      const existingBooking = await Booking.findOne({
        paymentIntentId: paymentIntent.id
      });

      if (existingBooking) {
        console.log("Booking already exists");
        return res.json({ received: true });
      }

      const checkInDate  = new Date(metadata.checkIn);
      const checkOutDate = new Date(metadata.checkOut);

      const nights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      const bookingId =
        `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

      const booking = new Booking({
        bookingId,
        userId: metadata.userId,
        userEmail: metadata.userEmail,
        userName: metadata.userName,
        roomId: metadata.roomId,
        roomNumber: metadata.roomNumber,
        roomType: metadata.roomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: Number(metadata.guests),
        nights,
        totalAmount: paymentIntent.amount / 100,
        status: "confirmed",
        paymentStatus: "paid",
        paymentIntentId: paymentIntent.id,
        specialRequests: metadata.specialRequests,
      });

      await booking.save();

      const notification = new Notification({
        id: `NT${Date.now()}`,
        userId: metadata.userId,
        message: `Booking confirmed for ${metadata.roomType} - Room ${metadata.roomNumber}`,
        type: "booking",
        isRead: false,
      });

      await notification.save();

      await sendBookingConfirmationEmail(metadata.userEmail, {
        guestName: metadata.userName,
        bookingId,
        roomType: metadata.roomType,
        roomNumber: metadata.roomNumber,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount: paymentIntent.amount / 100,
      });

      console.log("✅ Booking created via webhook");

    } catch (err) {
      console.error("Webhook booking error:", err);
    }
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };