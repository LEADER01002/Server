const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// قراءة اليوزرات
const authData = JSON.parse(fs.readFileSync('auth.json')).users;

// Basic Auth
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const [type, encoded] = authHeader.split(' ');
  if (type !== 'Basic') return res.sendStatus(401);

  const decoded = Buffer.from(encoded, 'base64').toString();
  const [user, pass] = decoded.split(':');

  const ok = authData.some(u => u.username === user && u.password === pass);
  if (!ok) return res.sendStatus(401);

  next();
}

// playlist
app.get('/playlist', auth, async (req, res) => {
  try {
    const pastebinUrl = 'https:/ /pastebin.com/raw/DRyeXY9Y'; // رابطك
    const response = await fetch(pastebinUrl);
    const data = await response.text();

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(data);
  } catch (e) {
    res.status(500).send('Error fetching m3u');
  }
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
