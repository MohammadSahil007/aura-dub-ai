const express = require("express");
const multer = require("multer");
const { separateAudio } = require("../services/audioSeparator");
const { transcribeAudio } = require("../services/speechToText");
const { translateText } = require("../services/translator");
const { synthesizeSpeech } = require("../services/textToSpeech");
const { mixAudio } = require("../services/audioMixer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/dub", upload.single("file"), async (req, res) => {
  try {
    const inputFile = req.file.path;

    // 1. Separate vocals + music
    const { vocals, background } = await separateAudio(inputFile);

    // 2. Speech-to-text
    const transcript = await transcribeAudio(vocals);

    // 3. Translate
    const translated = await translateText(transcript, "hi"); // e.g. Hindi

    // 4. TTS
    const dubbedVocals = await synthesizeSpeech(translated);

    // 5. Mix back
    const finalDub = await mixAudio(dubbedVocals, background);

    res.json({ success: true, output: finalDub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dubbing failed" });
  }
});

module.exports = router;
