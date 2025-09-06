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

// ... your existing routes ...

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/login.html?error=google_auth_failed",
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
      
      // Redirect to a success page with token
      // In a real app, you'd redirect to your frontend
      res.redirect(`/auth-success.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email
      }))}`);
    } catch (err) {
      console.error("JWT Error:", err);
      res.redirect("/login.html?error=auth_failed");
    }
  }
);

module.exports = router;