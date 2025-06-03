const mongoose = require("mongoose");

const MemeSchema = new mongoose.Schema({
  image: { type: String, required: true }, // base64 string or image URL
  caption: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Meme", MemeSchema);
