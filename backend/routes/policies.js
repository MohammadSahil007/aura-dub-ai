const express = require("express");
const router = express.Router();

// Example: Terms of Service
router.get("/terms", (req, res) => {
  res.json({
    service: "DubbingAI",
    terms: "These are the terms of service for using DubbingAI. No misuse, respect copyright..."
  });
});

// Example: Privacy Policy
router.get("/privacy", (req, res) => {
  res.json({
    service: "DubbingAI",
    privacy: "We value your privacy. Data is protected under standard encryption and not shared with third parties."
  });
});

// Example: Copyright Handling
router.get("/copyright", (req, res) => {
  res.json({
    notice: "If you believe your copyright has been infringed, submit a report at /api/policies/report"
  });
});

router.post("/report", (req, res) => {
  // In production, save this to DB with user’s complaint
  res.json({ status: "received", message: "Your copyright issue report has been submitted" });
});

module.exports = router;
