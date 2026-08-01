'use strict';

// Load env vars first so every subsequent require() can access them
require('dotenv').config();

// Patches Express to forward async errors to next() automatically
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Middleware
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

// Routes – centralised v1 index
const v1Routes = require('./src/routes/index');

const app = express();

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());

// Parse allowed origins dynamically from CLIENT_URL (supports comma-separated list and wildcards)
const getCorsOriginOption = () => {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) return 'http://localhost:3000';

  const origins = clientUrl.split(',').map((o) => o.trim());
  
  return (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    if (origins.includes(origin) || origins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
};

app.use(
  cors({
    origin: getCorsOriginOption(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger – 'dev' in development, 'tiny' in production for concise logs
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// ─── Body & Cookie Parsers ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── API Routes ───────────────────────────────────────────────────────────────
// All v1 routes are registered inside src/routes/index.js
app.use('/api/v1', v1Routes);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
