// server.js
require('dotenv').config(); // Load .env file
const express = require('express');
const cors = require('cors');
const allRoutes = require('./src/routes/index.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---

// 1. CORS
// In production, restrict this to your frontend domain
app.use(cors({
  origin: '*',
}));

// 2. Body Parser
app.use(express.json());

// 3. Health Check
app.get('/', (req, res) => {
  res.status(200).send('AI Proxy Server is running!');
});

// --- Routes Definition ---

// Prefix all API routes with /api/v1
app.use('/api/v1', allRoutes);

// --- Server Start ---

app.listen(PORT, () => {
  console.log(`AI proxy server running on port ${PORT}`);
  console.log(`Quiz endpoint: http://localhost:${PORT}/api/v1/ai/generate-quiz`);
  console.log(`Feedback endpoint: http://localhost:${PORT}/api/v1/ai/generate-feedback`);
});
