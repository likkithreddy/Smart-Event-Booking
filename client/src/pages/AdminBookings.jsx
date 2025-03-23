import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Admin login required!");
          return;
        }

        const response = await axios.get("http://localhost:4000/api/bookings", {
          headers: { Authorization: token },
        });

        setBookings(response.data.bookings || []);
      } catch (error) {
        toast.error("Error fetching bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleVerifyCheckIn = async () => {
    if (!qrCode) {
      toast.error("Enter a QR Code to verify!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:4000/api/bookings/verify",
        { qrCode },
        { headers: { Authorization: token } }
      );

      toast.success(response.data.message);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.qrCode === qrCode ? { ...booking, checkedIn: true } : booking
        )
      );
      setQrCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying QR code");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#121212]">
        <p className="text-gray-300 text-xl font-semibold">Loading bookings...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 flex flex-col items-center">
      {/* 🔹 Page Title */}
      <h2 className="text-4xl font-bold text-white text-center mb-8">📋 Admin Bookings</h2>

      {/* 🔹 QR Code Verification */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 w-full max-w-lg">
        <input
          type="text"
          placeholder="Enter QR Code"
          className="p-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 w-full"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
        />
        <button
          className="bg-green-500 px-6 py-3 text-white font-semibold rounded-lg hover:bg-green-400 transition transform hover:scale-105"
          onClick={handleVerifyCheckIn}
        >
          ✅ Verify
        </button>
      </div>

      {/* 🔹 Booking List */}
      {bookings.length === 0 ? (
        <p className="text-gray-400 text-center text-lg">No bookings found.</p>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg transition transform hover:scale-105 hover:shadow-xl"
            >
              {/* 🔹 Event Name */}
              <h3 className="text-xl font-bold text-white">{booking.event.name}</h3>

              {/* 🔹 User Info */}
              <p className="text-gray-300 mt-2">
                <span className="font-medium text-gray-400">User:</span> {booking.user.name} ({booking.user.email})
              </p>

              {/* 🔹 QR Code Display */}
              <div className="mt-3 flex justify-center">
                <img
                  src={booking.qrCode}
                  alt="QR Code"
                  className="w-24 h-24 border border-gray-600 rounded-lg"
                />
              </div>

              {/* 🔹 Check-in Status */}
              <p
                className={`mt-4 text-lg font-bold text-center px-3 py-1 rounded-md ${
                  booking.checkedIn ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {booking.checkedIn ? "✅ Checked In" : "❌ Not Checked In"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
