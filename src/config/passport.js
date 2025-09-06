// src/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Google Profile:", profile); // For debugging
    
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.isVerified = true; // Google emails are pre-verified
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = await User.create({
      fullName: profile.displayName,
      email: profile.emails[0].value.toLowerCase(),
      googleId: profile.id,
      isVerified: true
    });
    
    return done(null, user);
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;