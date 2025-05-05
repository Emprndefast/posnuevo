const express = require('express');
const axios = require('axios');
const router = express.Router();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post('/huggingface', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      data: error.response?.data,
    });
  }
});

module.exports = router; 