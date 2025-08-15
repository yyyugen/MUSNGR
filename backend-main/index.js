const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { google } = require('googleapis');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/create-video', upload.fields([{ name: 'audio' }, { name: 'image' }]), async (req, res) => {
  const audio = req.files['audio'][0];
  const image = req.files['image'][0];
  const output = path.join('uploads', `${Date.now()}-output.mp4`);
  const { accessToken, title, description } = req.body;

  ffmpeg()
    .addInput(image.path)
    .loop()
    .addInput(audio.path)
    .outputOptions('-shortest')
    .output(output)
    .on('end', async () => {
      try {
        const youtube = google.youtube({
          version: 'v3',
          auth: accessToken,
        });

        const response = await youtube.videos.insert({
          part: 'snippet,status',
          requestBody: {
            snippet: {
              title: title || 'Uploaded by Musngr',
              description: description || '',
            },
            status: {
              privacyStatus: 'private',
            },
          },
          media: {
            body: fs.createReadStream(output),
          },
        });

        fs.unlinkSync(audio.path);
        fs.unlinkSync(image.path);
        fs.unlinkSync(output);

        res.json({ videoId: response.data.id, url: `https://youtu.be/${response.data.id}` });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    })
    .run();
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
}); 