import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    event: {
      eventId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Event" },
      name: { type: String, required: true },
      description: { type: String, required: true },
      date: { type: Date, required: true },
      location: { type: String, required: true },
      ticketPrice: { type: Number, required: true },
      maxAttendees: { type: Number, required: true },
      eventType: { type: String, required: true },
      contactEmail: { type: String, required: true },
      contactPhone: { type: String, default: "N/A" }, // ✅ Default to "N/A"
      imageUrl: { type: String },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatNumber: { type: String, required: false }, // ✅ Optional seat tracking
    qrCode: { type: String, required: true, unique: true }, // ✅ Ensure QR uniqueness
    status: {
      type: String,
      enum: ["confirmed", "canceled"],
      default: "confirmed",
    },
    checkedIn: { type: Boolean, default: false }, // ✅ Track check-in without overriding status
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
