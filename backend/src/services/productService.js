'use strict';

const Product = require('../models/Product');

/**
 * Returns all active products sorted by newest first.
 *
 * @returns {Promise<Array>}
 */
const getAllProducts = async () => {
  return Product.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Returns a single active product by ID.
 * Throws 404 if not found or inactive.
 *
 * @param {string} id - Product ObjectId string.
 * @returns {Promise<object>}
 */
const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, isActive: true });
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  return product;
};

/**
 * Creates a new product.
 * Validation is enforced by the Mongoose schema.
 *
 * @param {{ name: string, description: string, price: number, stock: number, image?: string }} data
 * @returns {Promise<object>}
 */
const createProduct = async ({ name, description, price, stock, image }) => {
  const product = await Product.create({ name, description, price, stock, image });
  return product;
};

/**
 * Updates an existing product by ID.
 * Only the supplied fields are updated.
 * Throws 404 if the product does not exist.
 *
 * @param {string} id
 * @param {{ name?, description?, price?, stock?, image? }} updates
 * @returns {Promise<object>}
 */
const updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['name', 'description', 'price', 'stock', 'image'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      product[field] = updates[field];
    }
  });

  await product.save(); // triggers schema validation
  return product;
};

/**
 * Soft-deletes a product by setting isActive = false.
 * Never removes the document from the database.
 * Throws 404 if the product does not exist.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  product.isActive = false;
  await product.save();
  return product;
};

/**
 * Updates the stock of a product.
 * Throws 404 if not found.
 * Throws 400 if the new stock value is invalid.
 *
 * @param {string} id
 * @param {number} stock - New stock value (>= 0).
 * @returns {Promise<object>}
 */
const updateStock = async (id, stock) => {
  if (stock === undefined || stock === null) {
    const err = new Error('Stock value is required.');
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    const err = new Error('Stock must be a non-negative whole number.');
    err.statusCode = 400;
    throw err;
  }

  const product = await Product.findById(id);
  if (!product) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  product.stock = stock;
  await product.save();
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
