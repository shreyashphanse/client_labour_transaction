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
      password,
      skills,
      stationFrom, // ✅ NEW
      stationTo, // ✅ NEW
      expectedRate,
      dob, // ✅ Optional but recommended
    } = req.body;

    /* ✅ HARD VALIDATION */
    const VALID_STATIONS = ["Vasai", "Nalasopara", "Virar"];

    if (
      !VALID_STATIONS.includes(stationFrom) ||
      !VALID_STATIONS.includes(stationTo)
    ) {
      return res.status(400).json({ message: "Invalid stations" });
    }

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!stationFrom || !stationTo) {
      return res.status(400).json({ message: "Station range required" });
    }

    if (!skills || skills.length === 0) {
      return res.status(400).json({ message: "At least one skill required" });
    }

    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "labour",

      skills,

      /* ✅ CRITICAL FIX 🔥 */
      stationRange: {
        start: stationFrom,
        end: stationTo,
      },

      expectedRate,
      dob,
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

    if (user.banned) {
      return res.status(403).json({
        message: "Account banned. Contact support.",
      });
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
