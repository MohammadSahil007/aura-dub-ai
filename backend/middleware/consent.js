// backend/middleware/consent.js
const pool = require('../db'); // your pg pool instance

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const statement = req.body.consentStatement || req.body.consent || req.headers['x-consent'];
  if (!statement) return res.status(400).json({ error: 'Consent required' });

  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;
    // Insert consent log
    await pool.query(
      `INSERT INTO consent_logs (user_id, job_id, statement, ip, user_agent) VALUES ($1, $2, $3, $4, $5)`,
      [userId, null, statement, req.ip, req.get('User-Agent')]
    );
    next();
  } catch (err) {
    console.error('Consent middleware error', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
