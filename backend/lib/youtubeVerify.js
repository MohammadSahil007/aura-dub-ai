// backend/lib/youtubeVerify.js
const fetch = require('node-fetch');

async function getVideoChannelId(youtubeApiKey, videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`;
  const r = await fetch(url);
  const data = await r.json();
  if (!data.items || data.items.length === 0) return null;
  return data.items[0].snippet.channelId;
}

module.exports = { getVideoChannelId };
