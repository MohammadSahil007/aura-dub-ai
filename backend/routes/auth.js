// backend/routes/auth.js
const express = require('express');
const fetch = require('node-fetch');
const { google } = require('googleapis');
const router = express.Router();
const jwt = require('jsonwebtoken');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_CALLBACK,
  JWT_SECRET
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_CALLBACK
);

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly', 'openid', 'email', 'profile'];

router.get('/google', (req, res) => {
  const state = req.query.state || '/';
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, state });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // fetch user info
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userinfo = await oauth2.userinfo.get();
    // userinfo.data contains email, id, name

    // Upsert user in DB (pseudo)
    // const user = await upsertUser(userinfo.data);

    const payload = { userId: userinfo.data.id, email: userinfo.data.email };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // store tokens metadata in DB with user for proof (refresh token may be required)
    // saveOAuthTokens(user.id, { tokens, profile: userinfo.data });

    // redirect back to front-end with token
    res.redirect(`${process.env.FRONTEND_ORIGIN}/auth-success?token=${jwtToken}`);
  } catch (err) {
    console.error('Google callback error', err);
    res.status(500).send('Auth error');
  }
});

module.exports = router;
