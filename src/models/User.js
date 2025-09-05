const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
fullName: { 
    type: String, 
    required: true 
},
nickname: { 
    type: String, 
    unique: true 
},
email: { 
    type: String, 
    required: true, 
    unique: true 
},
passwordHash: { 
    type: String, 
},
googleId: { 
    type: String 
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
}
});

module.exports = mongoose.model("User", userSchema);
