import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../middleware/uploadMiddleware.js";


// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let imageUrl = ""; // Default image URL (optional)

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email is already registered!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle Image Upload if file is provided
    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    // Create user with image URL
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      image: imageUrl, // Store uploaded image URL
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data!" });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server Error!", error: error.message });
  }
};


// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error!", error: error.message });
  }
};

// @desc    Get User Profile (Protected Route)
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error!", error: error.message });
  }
};
