'use strict';

/**
 * Socket.IO event name constants.
 * Import this constant wherever a socket event string is needed –
 * never hardcode event names directly.
 */
const SOCKET_EVENTS = {
  STOCK_UPDATED: 'stockUpdated',
  PRODUCT_CREATED: 'productCreated',
  PRODUCT_UPDATED: 'productUpdated',
  PRODUCT_DELETED: 'productDeleted',
};

module.exports = SOCKET_EVENTS;
