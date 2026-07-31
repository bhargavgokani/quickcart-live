# QuickCart Live - Project Context

## Project Overview

QuickCart Live is a flash-sale shopping application where multiple customers can purchase products simultaneously.

The core requirement is to ensure the backend NEVER oversells stock.

If only one product is left and multiple customers try to purchase at the same time, exactly one order should succeed and all others should receive an Out of Stock response.

This project is an MVP built for a technical assessment. Simplicity, correctness, code quality, and architecture are more important than UI.

---

# Tech Stack

## Frontend

- Flutter (Latest Stable)
- GetX (State Management + Navigation + Dependency Injection)
- http
- socket_io_client
- get_storage

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Socket.IO
- bcrypt
- dotenv
- cors
- helmet
- morgan

---

# Project Structure

quickcart-live/

    frontend/
        Flutter Project

    backend/
        Node Backend

---

# Backend Folder Structure

backend/

src/

config/

controllers/

middleware/

models/

routes/

services/

socket/

utils/

tests/

app.js

server.js

package.json

---

# Flutter Folder Structure

frontend/lib/

core/

config/

bindings/

controllers/

models/

services/

routes/

modules/

widgets/

utils/

main.dart

---

# User Roles

ADMIN

CUSTOMER

Authorization must be enforced on the backend.

Never rely on Flutter UI to restrict permissions.

---

# Database Collections

users

products

orders

Only these three collections are required.

---

# Authentication

JWT Authentication

Bearer Token

Passwords must be hashed using bcrypt.

---

# Product

Fields

- name
- description
- price
- stock
- imageUrl (optional)
- isActive
- timestamps

---

# Order

Fields

- userId
- productId
- quantity
- priceAtPurchase
- status
- createdAt

---

# Users

Fields

- name
- email
- password
- role

---

# API Response Format

Success

{
    "success": true,
    "message": "",
    "data": {}
}

Failure

{
    "success": false,
    "message": ""
}

Use this response structure everywhere.

---

# Socket Events

Server Emits

stockUpdated

productCreated

productUpdated

productDeleted

Clients listen to these events and update UI immediately.

No polling.

---

# Business Rules

Customers can

- Register
- Login
- View Products
- Purchase Products

Admins can

- Create Products
- Update Products
- Delete Products
- Manage Stock

---

# Checkout Rules

Checkout is the most important feature.

Requirements

- Never oversell.
- Never create duplicate orders.
- Stock never becomes negative.
- Multiple simultaneous requests must be handled safely.

---

# Backend Architecture

Routes

↓

Controllers

↓

Services

↓

Models

Controllers should never contain business logic.

Services contain all business logic.

---

# Flutter Architecture

UI

↓

Controller (GetX)

↓

Service

↓

API

Controllers should not contain API implementation.

Services handle API communication.

---

# Coding Standards

- Use async/await
- Never use callbacks
- Keep functions small
- Proper error handling
- Reusable code
- Consistent naming
- Clean folder structure

---

# State Management

GetX only.

No Provider.

No Riverpod.

---

# UI

Default Material widgets are acceptable.

Do not spend unnecessary time polishing UI.

Functionality is the priority.

---

# Testing

Backend

- Jest
- Supertest

Flutter

- Widget Tests
- Unit Tests

---

# Deployment

Backend

Render

Database

MongoDB Atlas

Frontend

APK generated from Flutter

---

# Important Rule

Do NOT change architecture unless explicitly instructed.

Every implementation must follow this document.

# AI Development Rules

- Implement only the requested feature.
- Never modify unrelated files.
- Never change folder structure.
- Never rename existing APIs.
- Follow PROJECT_CONTEXT.md strictly.
- Keep code modular and production-like.
- If a required dependency is missing, install it instead of replacing existing code.
- Preserve backward compatibility with previously generated code.