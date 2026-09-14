import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowerCase: true
  },

  hashedPassword: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowerCase: true
  },

  displayName: {
    type: String,
    required: true,
    trime: true
  },

  avatarUrl: {
    type: String // to link the CDN to display avatar
  },

  avatarId: {
    type: String // CLoudinary public_id to delete avatar
  },

  bio: {
    type: String,
    maxLength: 500
  },

  phone: {
    type: String,
    sparse: true // allow null, but it would be unique when save
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;