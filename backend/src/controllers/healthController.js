'use strict';

/**
 * @desc    Health check – confirms the API is running
 * @route   GET /health
 * @access  Public
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickCart Live Backend Running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
