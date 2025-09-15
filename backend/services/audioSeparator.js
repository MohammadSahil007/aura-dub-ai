// Stub for separating vocals + background
async function separateAudio(filePath) {
    // TODO: integrate Spleeter/Demucs
    return {
      vocals: "path/to/vocals.wav",
      background: "path/to/background.wav",
    };
  }
  module.exports = { separateAudio };
  