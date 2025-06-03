const express = require("express");
const Meme = require("../models/Meme");
const auth = require("../middleware/auth");

const router = express.Router();

// Post a meme (protected)
router.post("/", auth, async (req, res) => {
  try {
    const meme = new Meme({
      image: req.body.image,
      caption: req.body.caption,
      user: req.user.id
    });
    await meme.save();
    res.status(201).json(meme);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all memes (public)
router.get("/", async (req, res) => {
  const memes = await Meme.find().sort({ createdAt: -1 }).populate("user", "username");
  res.json(memes);
});

module.exports = router;
