import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [image, setImage] = useState(null);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("role", formData.role);
      if (image) formDataObj.append("image", image);

      const { data } = await axios.post("http://localhost:4000/api/auth/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("🎉 Registration successful!", { position: "top-right", autoClose: 2000, theme: "dark" });

        // Login and navigate
        login(data.token);
        setTimeout(() => {
          navigate(data.user.role === "admin" ? "/admin" : "/");
        }, 2000);
      } else {
        toast.error(`⚠️ ${data.message}`, { position: "top-right", autoClose: 3000, theme: "dark" });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed!";
      toast.error(`🚨 ${errorMessage}`, { position: "top-right", autoClose: 3000, theme: "dark" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative px-4">
      <ToastContainer />

      {/* Glowing Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 opacity-20 blur-3xl"></div>

      <div className="relative bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full transition-all hover:shadow-blue-500/50 transform hover:scale-105 duration-300">
        {/* Neon Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 rounded-xl pointer-events-none"></div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-white mb-6">🚀 Register</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <select
            name="role"
            className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 transition-all"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">Attendee</option>
            <option value="admin">Event Organizer</option>
          </select>

          {/* Image Upload */}
          <div className="relative flex items-center space-x-2 bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-lg transform hover:scale-105 transition-all">
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-white w-full cursor-pointer" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition-all hover:shadow-blue-500/50"
          >
            Register ✨
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-sm mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
