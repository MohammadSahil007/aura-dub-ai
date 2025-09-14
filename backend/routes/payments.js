// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const pool = require('../db');

router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; // set when creating session
    const credits = Number(session.metadata.credits || 0);
    // update DB: user_credits & credit_transactions
    await pool.query('INSERT INTO credit_transactions (user_id, change_amount, reason, provider, provider_payment_id) VALUES ($1,$2,$3,$4,$5)', [userId, credits, 'purchase', 'stripe', session.payment_intent]);
    await pool.query('INSERT INTO user_credits (user_id, balance) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET balance = user_credits.balance + $2', [userId, credits]);
  }
  res.json({ received: true });
});

module.exports = router;
