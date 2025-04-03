import dotenv from "dotenv";
import { Router } from "express";
import express from "express";
import { z } from "zod";
import { Menu } from "./db.js";

dotenv.config();
const MenuRouter = Router();
const app = express();
app.use(express.json());

// ✅ Add Item Route
MenuRouter.post("/additem", async (req, res) => {
  const requiredBody = z.object({
    name: z.string(),
    price: z.number().int(),
    image: z.string(),
    description: z.string(),
    type: z.string(),
    isTrending: z.boolean().optional().default(false),
  });

  const parsedBody = requiredBody.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedBody.error.errors,
    });
  }

  const { name, price, image, description, type, isTrending } = req.body;
  try {
    await Menu.create({ name, price, image, description, type, isTrending });
    res.status(201).json({ message: "Menu Item Added Successfully" });
  } catch (e) {
    console.error("Menu Add Error:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get Items by Category Route
MenuRouter.get("/allitems/:category", async (req, res) => {
    let { category } = req.params;
  
    // ✅ Decode the category to handle spaces correctly
    category = decodeURIComponent(category);
  
    try {
      // ✅ Find menu items by category type
      const allMenuItems = await Menu.find({ type: category });
  
      if (allMenuItems.length === 0) {
        return res.status(200).json({
          message: `No items found for category: ${category}`,
        });
      }
  
      res.status(200).json(allMenuItems);
    } catch (e) {
      console.error("Menu Fetch Error:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });


// ✅ Get Trending Dishes Route
MenuRouter.get("/allitems/trending", async (req, res) => {
  try {
    const trendingItems = await Menu.find({ isTrending: true });
    res.status(200).json(trendingItems);
  } catch (e) {
    console.error("Error fetching trending items:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
MenuRouter.delete(
  "/deleteitem/:id",
  async (req, res) => {
    const { id } = req.params;
    try {
      const deletedItem = await Menu.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json({ message: "Item deleted successfully!" });
    } catch (e) {
      console.error("Error deleting item:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default MenuRouter;
