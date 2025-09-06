// src/routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { 
  register, 
  login, 
  verifyOtp, 
  resendOtp 
} = require("../controllers/authController");
const { validateRegistration, validateLogin } = require("../middleware/validation");
const { registerLimiter, loginLimiter, otpLimiter } = require("../middleware/rateLimiter");

// Registration route
router.post("/register", registerLimiter, validateRegistration, register);

// Login route  
router.post("/login", loginLimiter, validateLogin, login);

// OTP verification route
router.post("/verify-otp", otpLimiter, verifyOtp);

// Resend OTP route
router.post("/resend-otp", otpLimiter, resendOtp);

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/register.html?error=google_auth_failed",
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT for the authenticated user
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Redirect to dashboard with token
      res.redirect(`/auth-success.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email
      }))}`);
    } catch (err) {
      console.error("JWT Error:", err);
      res.redirect("/register.html?error=auth_failed");
    }
  }
);

module.exports = router;