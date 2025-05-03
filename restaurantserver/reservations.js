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

reservationRouter.get("/allreservations", async (req, res) => {
    const email = req.headers.email;

    if (!email) {
        return res.status(400).json({ message: "Email header is missing" });
    }

    try {
        let reservations;
        if (email === "admin@gmail.com") {
            reservations = await Reservation.find(); // Fetch all reservations for admin
        } else {
            reservations = await Reservation.find({ email: email }); // Fetch reservations for specific email
        }

        if (reservations.length === 0) {
            return res.status(404).json({ message: "No reservations found" });
        }

        res.status(200).json(reservations);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ message: "Failed to fetch reservations" });
    }
});
// In your reservation router file (e.g., reservationRouter.js)
reservationRouter.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const email = req.headers.email;

    if (!email) {
        return res.status(400).json({ message: "Email header is missing" });
    }

    // Validate the status
    const validStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status provided" });
    }

    try {
        // Find the reservation
        const reservation = await Reservation.findById(id);
        
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Check if the user is authorized to update this reservation
        // Admin can update any reservation, regular users can only update their own
        if (email !== "admin@gmail.com" && reservation.email !== email) {
            return res.status(403).json({ message: "Not authorized to update this reservation" });
        }

        // Update the status
        reservation.status = status;
        await reservation.save();

        res.status(200).json({
            message: "Reservation status updated successfully",
            updatedReservation: reservation
        });
    } catch (error) {
        console.error("Error updating reservation status:", error);
        res.status(500).json({ message: "Failed to update reservation status" });
    }
});
export default reservationRouter;
