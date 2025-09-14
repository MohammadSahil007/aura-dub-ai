const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState, // 1 = connected
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("DubbingAI Backend is running 🚀");
});

// Legal docs endpoints
app.get("/docs/tos", (req, res) => {
  res.sendFile(__dirname + "/docs/TOS.md");
});

app.get("/docs/dmca", (req, res) => {
  res.sendFile(__dirname + "/docs/DMCA.md");
});

module.exports = app;
