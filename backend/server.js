require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Attach rate limiter (you can scope later if you want)
app.use(rateLimit);

// Basic health
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

// Routes (ensure these files exist)
app.use('/auth', require('./routes/auth'));
app.use('/docs', require('./routes/docs'));

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});