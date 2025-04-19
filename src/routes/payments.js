const express = require("express");
const paymentRouter = express.Router();
const order = require("../models/order");
const { plans, payfast_redirect_url } = require("../utils/constants");
const { userAuth } = require("../middlewares/auth");
const crypto = require("crypto");
const { default: axios } = require("axios");

paymentRouter.post("/create-payment", userAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    const selectedPlan = plans[plan.toLowerCase()];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const orderId = crypto.randomUUID();
    const newOrder = new order({
      userId: req.user._id,
      plan,
      price: selectedPlan.price,
      orderId,
    });

    await newOrder.save();
    const redirectUrl = payfast_redirect_url(selectedPlan, orderId);
    res.json({ redirectUrl, orderId });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

paymentRouter.post(
  "/payment/webhook",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    try {
      const data = req.body;
      // Convert IPN data to x-www-form-urlencoded format using URLSearchParams
      const formData = new URLSearchParams();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      // Decide PayFast validation URL
      const validationUrl =
        process.env.PAYFAST_MODE === "sandbox"
          ? "https://sandbox.payfast.co.za/eng/query/validate"
          : "https://www.payfast.co.za/eng/query/validate";

      // Post back to PayFast to verify
      const response = await axios.post(validationUrl, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data === "VALID") {
        const orderId = data.custom_str1;
        const foundOrder = await order.findOne({ orderId });

        if (!foundOrder) return res.status(404).send("Order not found");

        // You can add more checks here (amount, merchant_id, etc.)
        if (data.payment_status === "COMPLETE") {
          foundOrder.status = "paid";
        } else {
          foundOrder.status = "failed";
        }

        await foundOrder.save();
        return res.status(200).send("IPN Verified and Order Updated");
      } else {
        console.warn("Invalid IPN received from PayFast");
        return res.status(400).send("Invalid IPN");
      }
    } catch (err) {
      console.error("IPN ERROR:", err);
      return res.status(500).send("Error verifying IPN");
    }
  }
);

// Step 5: Optional - Get Order Status API
// router.get("/order/:orderId", async (req, res) => {
//     try {
//       const order = await Order.findOne({ orderId: req.params.orderId });
//       if (!order) return res.status(404).json({ message: "Order not found" });
//       res.json({ status: order.status });
//     } catch (err) {
//       res.status(500).json({ message: "Error fetching order status" });
//     }
//   });

//   module.exports = router;

module.exports = paymentRouter;
