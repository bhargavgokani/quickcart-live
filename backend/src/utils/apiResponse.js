'use strict';

/**
 * Sends a standardised success response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (default 200).
 * @param {string} message - Human-readable success message.
 * @param {*} [data] - Optional payload to include in the response.
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = undefined) => {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Sends a standardised error response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (default 500).
 * @param {string} message - Human-readable error message.
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error') => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
