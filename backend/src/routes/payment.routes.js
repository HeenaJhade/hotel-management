const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/payment.controller");
const { authMiddleware } = require('../middleware/auth.middleware');

router.post("/create-payment-intent",authMiddleware, createPaymentIntent);

module.exports = router;