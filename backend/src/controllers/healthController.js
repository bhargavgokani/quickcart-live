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
  });
};

module.exports = { getHealth };
