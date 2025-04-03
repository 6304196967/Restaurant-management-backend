import express from 'express';
import mongoose from 'mongoose';
import UserRouter from './login.js';
import MenuRouter from './menu.js';
import CartRouter from "./cart.js";
import orderRouter from "./order.js";
import feedbackRouter from './feedback.js';
import CategoryRouter from './category.js';


import cors from 'cors';

const app = express();
app.use(express.json());  
app.use(cors());


app.use("/api/user", UserRouter);  
app.use("/api/menu", MenuRouter);
app.use("/api/cart", CartRouter);
app.use("/api/order", orderRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/category", CategoryRouter);

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        app.listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}
main();