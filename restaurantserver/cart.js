import dotenv from 'dotenv';
import { Router } from 'express';
import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Cart } from './db.js';

dotenv.config();

const CartRouter = Router();
const app = express();
app.use(express.json());

CartRouter.post('/additem', async (req, res) => {
    // ✅ Updated schema to include 'image'
    const requiredBody = z.object({
        email: z.string().email(),
        name: z.string(),
        price: z.number().int(),
        quantity: z.number().int().min(1),
        image: z.string().url(), // ✅ Validate image URL
    });

    try {
        // Validate request body
        const { email, name, price, quantity, image } = requiredBody.parse(req.body);

        // Check if the user's cart exists
        let userCart = await Cart.findOne({ email });

        if (!userCart) {
            // ✅ If no cart exists, create a new one
            userCart = new Cart({
                email,
                items: [{ name, price, quantity, image }], // Include image in the item
                totalPrice: price * quantity,
            });
        } else {
            // ✅ Check if item already exists in the cart
            const existingItem = userCart.items.find((item) => item.name === name);

            if (existingItem) {
                // ✅ If item exists, update quantity and price
                existingItem.quantity += quantity;
            } else {
                // ✅ Otherwise, add new item with image
                userCart.items.push({ name, price, quantity, image });
            }

            // ✅ Update total price
            userCart.totalPrice = userCart.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        }

        // ✅ Save the updated cart
        await userCart.save();

        res.status(200).json({ message: "Item added to cart", cart: userCart });
    } catch (error) {
        res.status(400).json({ error: error.errors || "Invalid request" });
    }
});

// ✅ Get cart items route
CartRouter.get('/cartitems', async (req, res) => {
    try {
        const { email } = req.query; // Use query parameters for GET
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const userCart = await Cart.findOne({ email });

        if (!userCart) {
            return res.status(404).json({ message: "Cart not found" });
        } else {
            res.status(200).json({ cart: userCart });
        }
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
CartRouter.delete("/removeitem", async (req, res) => {
    const { email, name } = req.query;
  
    if (!email || !name) {
      return res.status(400).json({ message: "Email and item name are required." });
    }
  
    try {
      // Find the cart by email
      const cart = await Cart.findOne({ email });
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found for this user." });
      }
  
      // Filter out the item to be removed
      const updatedItems = cart.items.filter((item) => item.name !== name);
  
      // Check if item exists before trying to remove
      if (cart.items.length === updatedItems.length) {
        return res.status(404).json({ message: "Item not found in the cart." });
      }
  
      // Update the cart with the remaining items
      cart.items = updatedItems;
  
      // Recalculate total price after removing the item
      const newTotalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      cart.totalPrice = newTotalPrice;
  
      // Save the updated cart
      await cart.save();
  
      res.status(200).json({
        message: "Item removed successfully.",
        cart,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  CartRouter.post("/removecart", async (req, res) => {
    const requiredBody = z.object({
      email: z.string().email(),
      name: z.string().optional(),
    });
  
    try {
      const { email, name } = requiredBody.parse(req.body);
  
      let userCart = await Cart.findOne({ email });
      if (!userCart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      if (name) {
        // Remove specific item
        userCart.items = userCart.items.filter((item) => item.name !== name);
      } else {
        // Clear cart
        userCart.items = [];
        userCart.totalPrice = 0;
      }
  
      userCart.totalPrice = userCart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
  
      await userCart.save();
      res.status(200).json({
        message: name ? "Item removed from cart" : "Cart cleared successfully",
        cart: userCart,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      res.status(500).json({ message: "Failed to remove item or clear cart" });
    }
  });
  
export default CartRouter;
