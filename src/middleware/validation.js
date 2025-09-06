// src/middleware/validation.js
const validator = require("validator");

exports.validateRegistration = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  if (!email || !validator.isEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  // Password strength check
  if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push("Valid email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};