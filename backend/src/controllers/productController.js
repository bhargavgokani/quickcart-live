'use strict';

const productService = require('../services/productService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all active products (newest first)
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  const products = await productService.getAllProducts();
  return successResponse(res, 200, 'Products retrieved successfully.', products);
};

/**
 * @desc    Get a single active product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return successResponse(res, 200, 'Product retrieved successfully.', product);
};

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  ADMIN only
 */
const createProduct = async (req, res) => {
  const { name, description, price, stock, image } = req.body;

  if (!name || !description || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: 'name, description, price, and stock are required.',
    });
  }

  const product = await productService.createProduct({ name, description, price, stock, image });
  return successResponse(res, 201, 'Product created successfully.', product);
};

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:id
 * @access  ADMIN only
 */
const updateProduct = async (req, res) => {
  const updates = (({ name, description, price, stock, image }) =>
    Object.fromEntries(
      Object.entries({ name, description, price, stock, image }).filter(
        ([, v]) => v !== undefined
      )
    ))(req.body);

  const product = await productService.updateProduct(req.params.id, updates);
  return successResponse(res, 200, 'Product updated successfully.', product);
};

/**
 * @desc    Soft-delete a product (isActive = false)
 * @route   DELETE /api/v1/products/:id
 * @access  ADMIN only
 */
const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id);
  return successResponse(res, 200, 'Product deleted successfully.');
};

/**
 * @desc    Update stock for a product
 * @route   PATCH /api/v1/products/:id/stock
 * @access  ADMIN only
 */
const updateStock = async (req, res) => {
  const { stock } = req.body;
  const product = await productService.updateStock(req.params.id, stock);
  return successResponse(res, 200, 'Stock updated successfully.', product);
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
