'use strict';

require('dotenv').config();

// Validate required environment variables on startup
const validateEnv = require('./src/config/env');
validateEnv();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// Create the raw HTTP server so Socket.IO can share it
const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
initSocket(httpServer);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 QuickCart Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);
  httpServer.close(async () => {
    console.log('✅ HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed.');
    } catch (err) {
      console.error('❌ Error closing MongoDB connection:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled promise rejections – log and exit so the process restarts cleanly
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});
