// src/models/User.js
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  nickname: { 
    type: String, 
    unique: true,
    sparse: true, // allows null values to be non-unique
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  passwordHash: { 
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: { 
    type: String,
    sparse: true
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otpCode: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);