import express from "express";
import { 
  bookEvent, 
  getUserBookings, 
  cancelBooking, 
  getAllBookings, 
  verifyQRCodeCheckIn 
} from "../controllers/bookingController.js";
import { protect, adminMiddleware } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// 📌 User Routes
bookingRouter.post("/book", protect, bookEvent);
bookingRouter.get("/my-bookings", protect, getUserBookings);
bookingRouter.delete("/cancel/:bookingId", protect, cancelBooking);

// 📌 Admin Routes
bookingRouter.get("/", protect, adminMiddleware, getAllBookings);
bookingRouter.post("/verify", protect, adminMiddleware, verifyQRCodeCheckIn);

export default bookingRouter;
