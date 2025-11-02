const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Port = process.env.PORT || 5000;
const URI = process.env.MONGO_URL;
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors({
  origin: ["https://task-bb49.vercel.app"], // Change later to Vercel URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(bodyParser.json());

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

mongoose
  .connect(URI)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(Port, () => console.log(`Server running on ${Port}`));
  })
  .catch((err) => console.error(" MongoDB connection error:", err));

// --- Auth middleware
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain { id: user._id }
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

//  LOGIN API
app.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, id: user._id },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// signup API
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// Get details of the currently logged in user
app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (exclude password)
app.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// Update user (only name & email) - no password updates here
app.put("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Name and email are required for update" });
    }

    // Check email uniqueness if email changed
    const existing = await User.findOne({ email, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
app.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
