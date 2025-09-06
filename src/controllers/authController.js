// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Generate secure OTP
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Register with email verification
exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12); // Increased salt rounds
    
    // Generate email verification OTP
    const otp = generateSecureOTP();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    const user = await User.create({ 
      fullName: fullName.trim(), 
      email: email.toLowerCase(), 
      passwordHash: hash,
      otpCode: otp,
      otpExpires: otpExpires
    });

    await sendEmail(
      user.email, 
      "Verify Your Email - Calmspace", 
      `Welcome to Calmspace!\n\nYour email verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
    );

    res.json({ 
      message: "Registration successful. Please check your email for verification code.", 
      userId: user._id,
      status: "pending-email-verification"
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login with account lockout
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ error: "Account temporarily locked due to too many failed attempts" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        error: "Email not verified. Please verify your email first.",
        userId: user._id,
        status: "email-not-verified"
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    
    if (!valid) {
      // Increment failed attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      }
      
      await user.save();
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Reset login attempts on successful password verification
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Generate login OTP
    const otp = generateSecureOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes
    await user.save();

    await sendEmail(
      user.email, 
      "Your Login Code - Calmspace", 
      `Your login verification code is: ${otp}\n\nThis code will expire in 5 minutes.`
    );

    res.json({ status: "pending-otp", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Verify OTP (works for both email verification and login)
exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  
  try {
    const user = await User.findById(userId);
    
    if (!user || user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    
    // If this was email verification
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      return res.json({ 
        status: "email-verified", 
        message: "Email verified successfully. You can now login." 
      });
    }

    // If this was login OTP, issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Increased token validity
    );

    await user.save();

    res.json({
      status: "success",
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email,
        nickname: user.nickname 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { userId } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateSecureOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000);
    await user.save();

    const subject = user.isVerified ? "Your New Login Code" : "Your New Verification Code";
    await sendEmail(user.email, subject, `Your new verification code is: ${otp}`);

    res.json({ message: "New OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};