import { useEffect, useState } from "react";
import axios from "axios";

const Payment = ({ amount }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadRazorpay();
  }, []);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Create Order from Backend
      const { data } = await axios.post("http://localhost:4000/api/payment/create-order", {
        amount,
        currency: "INR",
      });

      if (!data.success) {
        alert("Payment failed! Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: "your_razorpay_key_id",
        amount: data.order.amount,
        currency: "INR",
        name: "EventSphere",
        description: "Event Booking Payment",
        order_id: data.order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment
            const verifyRes = await axios.post("http://localhost:4000/api/payment/verify-payment", response);

            if (verifyRes.data.success) {
              alert("✅ Payment Successful!");
            } else {
              alert("⚠️ Payment Verification Failed!");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
          }
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

export default Payment;
