const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

// ✅ Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

