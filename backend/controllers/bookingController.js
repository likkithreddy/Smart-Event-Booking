import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import QRCode from "qrcode";

// 📌 Book an Event
export const bookEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check if the user already booked the event
    const existingBooking = await Booking.findOne({ user: userId, "event.eventId": eventId });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: "You have already booked this event" });
    }

    // Generate QR Code for Check-in
    const qrData = `User: ${userId}, Event: ${eventId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Save booking with event details
    const booking = new Booking({
      event: {
        eventId: event._id,
        name: event.name,
        date: event.date,
        location: event.location,
        ticketPrice: event.ticketPrice,
        eventType: event.eventType,
        contactEmail: event.contactEmail,
        contactPhone: event.contactPhone || "N/A",
        imageUrl: event.imageUrl,
      },
      user: userId,
      qrCode,
      status: "confirmed",
    });

    await booking.save();
    res.status(201).json({ success: true, message: "Booking successful", qrCode });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 📌 Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId }).populate("event", "title date location");
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Cancel a Booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized." });
    }

    // Delete booking
    await Booking.deleteOne({ _id: bookingId });

    // Increment available seats
    await Event.findByIdAndUpdate(booking.event.eventId, { $inc: { availableSeats: 1 } });

    res.json({ success: true, message: "Booking canceled successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error canceling booking", error: error.message });
  }
};

// 📌 Admin: Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").populate("event");
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Fetch All Bookings Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📌 Admin: Verify QR Code Check-in
export const verifyQRCodeCheckIn = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Find the booking by QR Code
    const booking = await Booking.findOne({ qrCode });
    if (!booking) {
      return res.status(404).json({ message: "Invalid QR Code" });
    }

    // Mark as checked in
    booking.status = "checked-in";
    await booking.save();

    res.status(200).json({ success: true, message: "Check-in successful", booking });
  } catch (error) {
    console.error("QR Code Check-in Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
