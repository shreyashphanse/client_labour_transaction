import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ CLIENT REGISTER
export const registerClient = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: "client",
    });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ LABOUR REGISTER (OTP MOCK SAFE)
export const registerLabour = async (req, res) => {
  try {
    const {
      name,
      phone,
      password, // ✅ ADDED
      skills,
      stationRange,
      expectedRate,
    } = req.body;

    if (!name || !phone || !password) {
      // ✅ UPDATED
      return res.status(400).json({ message: "Missing fields" });
    }

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ ADDED

    const user = await User.create({
      name,
      phone,
      password: hashedPassword, // ✅ ADDED
      role: "labour",
      skills,
      stationRange,
      expectedRate,
    });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
