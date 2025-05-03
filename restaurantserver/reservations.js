import dotenv from "dotenv";
import { Router } from "express";
import { Reservation } from "./db.js";

dotenv.config();

const reservationRouter = Router();

// ✅ Create a Reservation
reservationRouter.post("/reservation", async (req, res) => {
    const { name, email, date, time, guests, tableType, specialRequests, phone } = req.body;

    if (!name || !email || !date || !time || !guests || !tableType) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    try {
        const newReservation = new Reservation({ 
            name, 
            email, 
            phone: phone || '', // Make phone optional
            date, 
            time, 
            guests,
            tableType,
            specialRequests: specialRequests || ''
        });
        await newReservation.save();
        res.status(201).json({ message: "Reservation created successfully!" });
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Failed to create reservation" });
    }
});

// ✅ Get All Reservations
reservationRouter.get("/reservations", async (req, res) => {
    const email = req.headers.email;

    if (!email) {
        return res.status(400).json({ message: "Email header is missing" });
    }

    try {
        const reservations = await Reservation.find({ email: email });

        if (reservations.length === 0) {
            return res.status(404).json({ message: "No reservations found for the given email" });
        }

        res.status(200).json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Failed to fetch reservations" });
    }
});


reservationRouter.delete("/reservations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Reservation.findByIdAndDelete(id);
      res.status(200).json({ message: "Reservation cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      res.status(500).json({ message: "Failed to cancel reservation" });
    }
  });
  

export default reservationRouter;
