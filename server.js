const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// قراءة بيانات المستخدمين
const authData = JSON.parse(fs.readFileSync('auth.json')).users;

// Middleware للتحقق من Basic Auth
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send('Unauthorized');

  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Basic') return res.status(401).send('Unauthorized');

  const decoded = Buffer.from(credentials, 'base64').toString();
  const [user, pass] = decoded.split(':');

  const valid = authData.some(u => u.username === user && u.password === pass);
  if (valid) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// المسار اللي بيرجع m3u من Pastebin
app.get('/playlist', auth, async (req, res) => {
  try {
    const pastebinUrl = 'https:/ /pastebin.com/raw/DRyeXY9Y'; // ضع هنا رابط m3u raw
    const response = await fetch(pastebinUrl);
    const data = await response.text();
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(data);
  } catch (err) {
    console.error("Error fetching m3u:", err);
    res.status(500).send("Error fetching playlist");
  }
});

app.listen(PORT, () => {
  console.log(`IPTV server running on port ${PORT}`);
});
