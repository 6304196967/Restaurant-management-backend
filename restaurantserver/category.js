import dotenv from "dotenv";
import { Router } from "express";
import express from "express";
import { Category } from "./db.js";

dotenv.config();

const CategoryRouter = Router();
const app = express();
app.use(express.json());

// ✅ Get All Categories
CategoryRouter.get("/getcategories", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// ✅ Add New Category
CategoryRouter.post("/addcategory", async (req, res) => {
  const { name, img } = req.body; // ✅ Corrected field names

  if (!name || !img) {
    return res.status(400).json({ message: "Category name and image URL are required" });
  }

  try {
    const newCategory = new Category({ name, img }); // ✅ Save with image
    await newCategory.save();
    res.status(201).json({ message: "Category added successfully!" });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Failed to add category" });
  }
});

// ✅ Delete Category
CategoryRouter.delete("/deletecategory/:name", async (req, res) => {
  const { name } = req.params; // ✅ Get category name from params

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = await Category.deleteOne({ name });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

export default CategoryRouter;
