import dotenv from "dotenv";
import { Router } from "express";
import express from "express";
import { Feedback } from "./db.js";
import { User } from "./db.js"; 
dotenv.config();

const feedbackRouter = Router();
const app = express();
app.use(express.json());

// ✅ Add or Update Feedback
feedbackRouter.post("/addfeedback", async (req, res) => {
  const { email, feedback, rating, itemName, orderId } = req.body;

  // ✅ Basic validation
  if (!email || !feedback || !rating || !orderId || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid feedback data" });
  }

  try {
    // ✅ Check if the feedback for the same order and item already exists
    const existingFeedback = await Feedback.findOne({
      email,
      itemName,
      orderId,
    });

    if (existingFeedback) {
      // ✅ Update existing feedback if found
      existingFeedback.feedback = feedback;
      existingFeedback.rating = rating;
      await existingFeedback.save();
      return res.status(200).json({
        message: "Feedback updated successfully! 🎉",
        feedback: existingFeedback,
      });
    } else {
      // ✅ Create new feedback if not found
      const newFeedback = new Feedback({
        email,
        feedback,
        rating,
        itemName,
        orderId,
      });

      // ✅ Save feedback to DB
      await newFeedback.save();
      res.status(201).json({
        message: "Feedback added successfully! 🎉",
        feedback: newFeedback,
      });
    }
  } catch (err) {
    console.error("Feedback add error:", err);
    res.status(500).json({ message: "Failed to add or update feedback" });
  }
});

// ✅ Get feedbacks based on email, orderId, and itemName
feedbackRouter.get("/getfeedbacks", async (req, res) => {
  const { email, orderId, itemName } = req.query;

  // ✅ Basic validation
  if (!email || !orderId || !itemName) {
    return res
      .status(400)
      .json({ message: "Invalid query parameters for feedback" });
  }

  try {
    // ✅ Check if feedback exists for that email, orderId, and itemName
    const feedback = await Feedback.findOne({
      email,
      orderId,
      itemName,
    });

    if (feedback) {
      res.status(200).json(feedback);
    } else {
      return res.status(200).json({
        message: "No feedback found for this order and item!",
    });
    }
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

feedbackRouter.delete("/deletefeedback", async (req, res) => {
  const { email, orderId, itemName } = req.query;

  // ✅ Basic validation
  if (!email || !orderId || !itemName) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }

  try {
    // ✅ Delete feedback based on email, orderId, and itemName
    const deletedFeedback = await Feedback.findOneAndDelete({
      email,
      orderId,
      itemName,
    });

    if (deletedFeedback) {
      res.status(200).json({ message: "Feedback deleted successfully!" });
    } else {
      res.status(404).json({ message: "No feedback found to delete!" });
    }
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});
feedbackRouter.get('/admin/feedbacks', async (req, res) => {
  try {
    const userEmail = req.query.email; // reading from query string

    if (userEmail !== 'admin@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
feedbackRouter.get("/item/:itemName", async (req, res) => {
  try {
    const { itemName } = req.params;

    const feedbacks = await Feedback.find({ itemName });

    const enrichedFeedbacks = await Promise.all(
      feedbacks.map(async (fb) => {
        const foundUser = await User.findOne({ email: fb.email }, "username");
        return {
          ...fb.toObject(),
          username: foundUser?.username || "Anonymous",
        };
      })
    );
    console.log("Enriched Feedbacks:", enrichedFeedbacks);
    const averageRating =
      enrichedFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
        enrichedFeedbacks.length || 0;
    console.log("Average Rating:", averageRating);
    res.json({ reviews: enrichedFeedbacks, averageRating });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

export default feedbackRouter;
