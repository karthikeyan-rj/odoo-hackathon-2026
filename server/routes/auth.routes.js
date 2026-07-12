const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET || "assetflow-secret",
    { expiresIn: "8h" }
  );
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "An account already exists for this email." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "Employee",
      status: "Active",
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: { ...user.toObject(), passwordHash: undefined } });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken(user);
    return res.status(200).json({ token, user: { ...user.toObject(), passwordHash: undefined } });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
