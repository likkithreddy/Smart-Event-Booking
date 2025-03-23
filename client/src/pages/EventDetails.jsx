import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SeatMap3D from "../components/SeatMap3D"; // Importing the 3D Seating Component

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState(localStorage.getItem(`qrCode-${id}`) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/api/events/${id}`);
        console.log("Event Data:", data);
        setEvent(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookNow = async () => {
    console.log("🚀 Booking process started...");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("⚠️ You need to log in to book a ticket.");
        return;
      }

      // Step 1: Create an order for Razorpay
      console.log("🔄 Creating order for payment...");
      const response = await axios.post(
        `http://localhost:4000/api/payment/create-order`,
        { amount: event.ticketPrice, currency: "INR" }
      );

      console.log("✅ Order Response:", response.data);
      if (!response.data.success) {
        toast.error("⚠️ Payment initialization failed. Please try again.");
        return;
      }

      // Step 2: Check if Razorpay SDK is loaded
      if (!window.Razorpay) {
        toast.error("⚠️ Razorpay SDK not loaded. Please refresh the page.");
        console.error("🚨 Razorpay SDK is missing.");
        return;
      }

      // Step 3: Initialize Razorpay
      console.log("📌 Initializing Razorpay...");
      const options = {
        key: "rzp_test_3f0I7n5bUDZpPG", // Replace with your Razorpay Key
        amount: response.data.order.amount, // Amount in paise
        currency: "INR",
        name: "EventSphere",
        description: `Booking for ${event.name}`,
        order_id: response.data.order.id,
        handler: async function (response) {
          console.log("💰 Razorpay Payment Response:", response);
          try {
            // Step 4: Verify Payment
            console.log("🔍 Verifying payment...");
            const verifyRes = await axios.post(
              "http://localhost:4000/api/payment/verify-payment",
              response
            );
            console.log("✅ Payment Verification Response:", verifyRes.data);

            if (verifyRes.data.success) {
              toast.success("🎉 Payment successful! Booking your ticket...");
              
              // Step 5: Book the ticket
              console.log("🎟 Booking ticket...");
              const { data: bookingData } = await axios.post(
                `http://localhost:4000/api/bookings/book`,
                { eventId: id },
                { headers: { Authorization: `${token}` } }
              );
              console.log("📩 Booking Response:", bookingData);

              if (bookingData.success) {
                toast.success(bookingData.message);
                if (bookingData.qrCode) {
                  setQrCode(bookingData.qrCode);
                  localStorage.setItem(`qrCode-${id}`, bookingData.qrCode);
                }
              } else {
                toast.error(bookingData.message);
              }
            } else {
              toast.error("⚠️ Payment verification failed.");
            }
          } catch (error) {
            console.error("❌ Error verifying payment:", error);
            toast.error("⚠️ Error verifying payment.");
          }
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      console.log("🛠 Razorpay Options:", options);
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on("payment.failed", function (response) {
        console.error("❌ Payment Failed:", response.error);
        toast.error("⚠️ Payment Failed! Check console for details.");
      });

      // Open Razorpay UI
      console.log("🛒 Opening Razorpay UI...");
      razorpay.open();
    } catch (error) {
      console.error("🚨 Error processing payment:", error);
      toast.error(error.response?.data?.message || "⚠️ Error processing payment.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return <p className="text-center text-gray-400">Event not found.</p>;
  }

  return (
    <div className="bg-[#121212] min-h-screen p-6 flex justify-center items-center">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-3xl bg-gray-900 bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-md border border-gray-700 w-full">
        {event.imageUrl && (
          <img src={event.imageUrl} alt="Event" className="w-full h-56 object-cover rounded-lg mb-4" />
        )}
        <h2 className="text-3xl font-bold text-white">{event.name}</h2>
        <p className="text-gray-300 mt-2">{event.description}</p>

        <div className="mt-4">
          <p className="text-gray-400"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
          <p className="text-gray-400"><strong>Location:</strong> {event.location}</p>
          <p className="text-gray-400"><strong>Ticket Price:</strong> {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : "Free"}</p>
          <p className="text-gray-400"><strong>Max Attendees:</strong> {event.maxAttendees}</p>
          <p className="text-gray-400"><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
        </div>

        {/* Sponsors Section */}
        {event.sponsors?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white text-lg font-semibold mb-2">Sponsors:</h3>
            <div className="flex flex-wrap gap-4">
              {event.sponsors.map((sponsor, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                  {sponsor.logoUrl && (
                    <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 w-8 object-cover rounded" />
                  )}
                  <p className="text-gray-300">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3D Seating Arrangement */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">Seating Arrangement</h3>
          <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
            <SeatMap3D eventId={id} />
          </div>
        </div>

        <button onClick={handleBookNow} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg text-white mt-6 transition-all">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
