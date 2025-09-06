// src/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many login attempts, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 OTP attempts per windowMs
  message: {
    error: "Too many OTP attempts, please try again later"
  }
});

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration requests per hour
  message: {
    error: "Too many registration attempts, please try again later"
  }
});