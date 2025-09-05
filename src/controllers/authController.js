const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Register
exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash: hash });

    res.json({ message: "User registered", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60000);
    await user.save();

    await sendEmail(user.email, "Your OTP Code", `Your OTP code is ${otp}`);

    res.json({ status: "pending-otp", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP valid → issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
