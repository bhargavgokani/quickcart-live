'use strict';

const {
  checkout,
  getCustomerOrders,
  getAllOrders: fetchAllOrders,
} = require('../services/orderService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Purchase exactly one unit of a product (flash-sale checkout)
 * @route   POST /api/v1/checkout
 * @access  CUSTOMER only (protect + authorize(ROLES.CUSTOMER))
 */
const processCheckout = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required.' });
  }

  const { order, remainingStock } = await checkout(req.user._id, productId);

  return successResponse(res, 201, 'Purchase successful.', {
    order,
    remainingStock,
  });
};

/**
 * @desc    Get logged-in customer's order history
 * @route   GET /api/v1/orders
 * @access  CUSTOMER only
 */
const getMyOrders = async (req, res) => {
  const orders = await getCustomerOrders(req.user._id);
  return successResponse(res, 200, 'Orders retrieved successfully.', orders);
};

/**
 * @desc    Get all orders in the system
 * @route   GET /api/v1/orders/all
 * @access  ADMIN only
 */
const getAllOrders = async (req, res) => {
  const orders = await fetchAllOrders();
  return successResponse(res, 200, 'All orders retrieved successfully.', orders);
};

module.exports = { processCheckout, getMyOrders, getAllOrders };
