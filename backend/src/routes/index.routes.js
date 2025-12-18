// src/routes/index.routes.js
const express = require('express');
const router = express.Router();

const aiRoutes = require('./ai.routes');

// Route for all AI/Quiz generation endpoints
router.use('/ai', aiRoutes);

module.exports = router;