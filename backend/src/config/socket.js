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
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
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

module.exports = { initSocket, getIO };
