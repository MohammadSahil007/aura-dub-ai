// backend/routes/jobs.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getVideoChannelId } = require('../lib/youtubeVerify');
const consentMiddleware = require('../middleware/consent');
const rateLimit = require('../middleware/rateLimit');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    } else if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
    return null;
  } catch (e) { return null; }
}

router.post('/submit-youtube', rateLimit, consentMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing url' });

    // enforce 5 minutes limit in job metadata
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    // get channel id for the video
    const videoChannelId = await getVideoChannelId(YOUTUBE_API_KEY, youtubeId);

    // TODO: fetch user's channel ids from stored OAuth metadata; for now assume we have it:
    // const userChannels = await getUserChannelIds(userId); -> array of channel ids from stored OAuth
    const userChannels = await getUserChannelIdsFromDB(userId); // implement this query

    const isOwner = userChannels.includes(videoChannelId);

    if (!isOwner) {
      // If not owner, optionally reject or ask for upload/proof
      return res.status(403).json({ error: 'You are not the owner of this YouTube video. Upload original file or provide proof.' });
    }

    // create job record (DB)
    const job = await createJob({
      user_id: userId,
      platform: 'youtube',
      source_url: url,
      minutes_requested: 5,
      oauth_channel_id: videoChannelId
    });

    // enqueue job (your worker queue - e.g., Bull)
    await enqueueJob(job.id);

    res.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
