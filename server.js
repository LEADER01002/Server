const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// قراءة بيانات المستخدمين من auth.json
const rawData = fs.readFileSync('auth.json');
const authData = JSON.parse(rawData).users;

// Middleware للتحقق من Authorization Header
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send('Unauthorized');

  const [type, credentials] = authHeader.split(' ');
  if (type !== 'Basic') return res.status(401).send('Unauthorized');

  const decoded = Buffer.from(credentials, 'base64').toString();
  const [user, pass] = decoded.split(':');

  const valid = authData.some(u => u.username === user && u.password === pass);
  if (valid) next();
  else res.status(401).send('Unauthorized');
}

// مسار الـ m3u
app.get('/playlist', auth, async (req, res) => {
  try {
    const pastebinUrl = 'https://pastebin.com/raw/XXXXXX'; // ضع رابط m3u هنا
    const response = await fetch(pastebinUrl);
    const data = await response.text();
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(data);
  } catch (err) {
    res.status(500).send('Error fetching playlist');
  }
});

app.listen(PORT, () => {
  console.log(`IPTV server running on port ${PORT}`);
});