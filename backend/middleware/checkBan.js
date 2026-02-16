import User from "../models/User.js";

export const checkBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user?.banned) {
      return res.status(403).json({
        message: "Account is banned",
      });
    }

    next();
  } catch (err) {
    console.error("BAN MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
