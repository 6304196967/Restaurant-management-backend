import dotenv from 'dotenv';
import { Router } from 'express';
import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { order } from './db.js';

dotenv.config();

const orderRouter = Router();
const app = express();
app.use(express.json());

orderRouter.post("/additem", async (req, res) => {
  const {
    email,
    items,
    totalPrice,
    paymentMode,
    customerDetails, // ✅ Get customerDetails as a single object
  } = req.body;

  // ✅ Destructure customerDetails correctly
  const {
    firstName,
    lastName,
    phoneNumber,
    altPhoneNumber,
    houseNo,
    street,
    landmark,
    district,
    mandal,
    pincode,
    state,
  } = customerDetails;

  // ✅ Basic validation
  if (
    !email ||
    !items ||
    items.length === 0 ||
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !houseNo ||
    !street ||
    !district ||
    !mandal ||
    !pincode ||
    !state ||
    !paymentMode
  ) {
    console.log("Invalid order data:", req.body);
    return res.status(400).json({ message: "Invalid order data" });
  }

  try {
    // ✅ Create a new order with all Flipkart-style details
    const newOrder = new order({
      email,
      items,
      totalPrice,
      customerDetails: {
        firstName,
        lastName,
        phoneNumber,
        altPhoneNumber: altPhoneNumber || "", // Optional
        houseNo,
        street,
        landmark: landmark || "", // Optional
        district,
        mandal,
        pincode: String(pincode), // ✅ Make pincode a string
        state,
      },
      paymentMode,
      orderDate: Date.now(), // ✅ Add orderDate explicitly
      status: "Pending", // ✅ Add default status explicitly
    });

    // ✅ Save order to DB
    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully! 🎉", order: newOrder });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Failed to place order 😢" });
  }
});



 // 🚀 Fetch all orders API
 orderRouter.get("/allorders", async (req, res) => {
  const email = req.query.email; // ✅ Get email from query params
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const userOrders = await order.find({ email });
    res.status(200).json(userOrders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


orderRouter.put("/cancel/:id", async (req, res) => {
  const { email, orderId } = req.body; // ✅ Get email and orderId
  try {
    const orderr = await order.findOne({ _id: orderId, email: email });

    if (!orderr) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (orderr.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled." });
    }

    orderr.status = "Cancelled";
    await orderr.save();

    res.status(200).json({ message: "Order cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

orderRouter.get("/adminallorders", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // 🛡️ If admin email, return all orders
    if (email === "admin@gmail.com") {
      const allOrders = await order.find();
      return res.status(200).json(allOrders);
    }

    // 👤 For regular users, return only their orders
    const userOrders = await order.find({ email });
    res.status(200).json(userOrders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
orderRouter.put("/update/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error while updating order" });
  }
});
  
export default orderRouter;