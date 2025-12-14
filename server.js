const express = require("express");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// اقرأ ملف اليوزرات
const authData = JSON.parse(fs.readFileSync("./auth.json", "utf8"));

function checkAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="IPTV"');
    return res.status(401).send("Unauthorized");
  }

  const base64 = auth.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const [username, password] = decoded.split(":");

  const valid = authData.users.find(
    (u) => u.username === username && u.password === password
  );

  if (!valid) {
    return res.status(401).send("Unauthorized");
  }

  next();
}

app.get("/playlist", checkAuth, async (req, res) => {
  try {
    const pastebinRaw =
      "https:/ /pastebin.com/raw/DRyeXY9Y";

    const response = await fetch(pastebinRaw);
    const data = await response.text();

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.send(data);
  } catch (err) {
    res.status(500).send("Error loading playlist");
  }
});

app.listen(PORT, () => {
  console.log("IPTV Server running on port", PORT);
});
