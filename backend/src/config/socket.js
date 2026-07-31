'use strict';

const { Server } = require('socket.io');

let io;

/**
 * Initialises Socket.IO on top of an existing HTTP server.
 * @param {import('http').Server} httpServer - The Node.js HTTP server instance.
 * @returns {import('socket.io').Server} The configured Socket.IO server.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client Connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Returns the existing Socket.IO instance.
 * Must be called after initSocket().
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialised. Call initSocket() first.');
  }
  return io;
};

/**
 * Broadcasts an event to all connected Socket.IO clients.
 * Safe to call even if Socket.IO is not initialised (e.g. during testing).
 * @param {string} event - Event name from src/constants/socketEvents.js
 * @param {object} payload - Event payload
 */
const emitEvent = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = { initSocket, getIO, emitEvent };
