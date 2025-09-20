const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/tos', (req, res) => {
  const tosPath = path.join(__dirname, '..', 'docs', 'TOS.md');
  if (fs.existsSync(tosPath)) {
    res.sendFile(tosPath);
  } else {
    res.status(404).send('TOS not found');
  }
});

module.exports = router;