'use strict';

const Product = require('../models/Product');
const { Order } = require('../models/Order');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CHECKOUT SERVICE – THE CORE ANTI-OVERSELL IMPLEMENTATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The strategy used here is a single atomic MongoDB operation:
 *
 *   findOneAndUpdate(
 *     { _id, isActive: true, stock: { $gt: 0 } },   ← guard
 *     { $inc: { stock: -1 } },                        ← decrement
 *     { new: true }
 *   )
 *
 * Why this is safe:
 *   - MongoDB executes document-level write operations atomically.
 *   - The condition `stock: { $gt: 0 }` and the `$inc: { stock: -1 }` are
 *     applied as a single database operation with no window between read and
 *     write. No other process can slip in between them.
 *   - If 100 requests arrive simultaneously with stock = 10, exactly 10 will
 *     receive a non-null document (one per decrement), and the other 90 will
 *     get null because the condition no longer matches.
 *   - Stock can never go below 0 because the update only fires when stock > 0.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Executes a flash-sale checkout for exactly one unit of the given product.
 *
 * Steps:
 *  1. Atomically decrement stock by 1 if stock > 0 and product is active.
 *  2. If the atomic update returns null → product doesn't exist, is inactive,
 *     or is out of stock. Return the appropriate error.
 *  3. Create an Order document referencing the user and product.
 *  4. Return the created order and remaining stock.
 *
 * @param {string} userId      - ObjectId string of the authenticated user.
 * @param {string} productId   - ObjectId string of the product to purchase.
 * @returns {Promise<{ order: object, remainingStock: number }>}
 */
const checkout = async (userId, productId) => {
  // ── Step 1: Validate product exists and is active before attempting checkout ──
  const productExists = await Product.findOne({ _id: productId });
  if (!productExists) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!productExists.isActive) {
    const err = new Error('Product is not available.');
    err.statusCode = 400;
    throw err;
  }

  // ── Step 2: Atomic stock decrement ───────────────────────────────────────────
  // This is the ONLY place stock is decremented. It is a single atomic
  // MongoDB operation — no race condition possible.
  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
      stock: { $gt: 0 },   // Guard: only proceed if stock > 0
    },
    {
      $inc: { stock: -1 }, // Atomically decrement by exactly 1
    },
    {
      new: true,           // Return the document AFTER the update
    }
  );

  // ── Step 3: If null → out of stock (all stock consumed) ─────────────────────
  if (!updatedProduct) {
    const err = new Error('Out of Stock. This product is no longer available.');
    err.statusCode = 409;
    throw err;
  }

  // ── Step 4: Create the order (only after stock was successfully reserved) ────
  const unitPrice = updatedProduct.price;
  const quantity = 1; // Flash-sale: exactly one unit per purchase

  const order = await Order.create({
    user: userId,
    product: productId,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    purchasedAt: new Date(),
  });

  return {
    order: await order.populate('product', 'name price image'),
    remainingStock: updatedProduct.stock,
  };
};

/**
 * Returns all orders belonging to a specific customer, newest first.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
const getCustomerOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate('product', 'name price image')
    .sort({ purchasedAt: -1 });
};

/**
 * Returns all orders in the system (ADMIN use). Newest first.
 *
 * @returns {Promise<Array>}
 */
const getAllOrders = async () => {
  return Order.find({})
    .populate('user', 'name email')
    .populate('product', 'name price image')
    .sort({ purchasedAt: -1 });
};

module.exports = { checkout, getCustomerOrders, getAllOrders };
