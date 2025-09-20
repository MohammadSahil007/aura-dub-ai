const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check token and attach user to request
const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user without password field, using userId from token
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;