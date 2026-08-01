# QuickCart Live - API Documentation

Base URL: `https://quickcart-live.onrender.com/api/v1`

---

## 1. Authentication

### Register Account
* **Method**: `POST`
* **Route**: `/auth/register`
* **Authentication**: `None`
* **Description**: Registers a new customer account.
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "6a6d01bcb9c57eec1e79639",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER"
    }
  }
  ```

### Secure Login
* **Method**: `POST`
* **Route**: `/auth/login`
* **Authentication**: `None`
* **Description**: Auths credentials and sets authorization cookies and returns session metadata.
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "6a6d01bcb9c57eec1e79639",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "CUSTOMER"
      }
    }
  }
  ```

---

## 2. Products Catalog

### Get All Products
* **Method**: `GET`
* **Route**: `/products`
* **Authentication**: `None`
* **Description**: Returns all active products in stock.
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6a6dc6ccd5da2f9c54bfe077",
        "name": "Premium Gadget",
        "description": "High quality tech gadget.",
        "price": 99.99,
        "stock": 42,
        "image": "https://example.com/gadget.png",
        "isActive": true
      }
    ]
  }
  ```

### Get Product Details
* **Method**: `GET`
* **Route**: `/products/:id`
* **Authentication**: `None`
* **Description**: Fetch individual product parameters.
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a6dc6ccd5da2f9c54bfe077",
      "name": "Premium Gadget",
      "description": "High quality tech gadget.",
      "price": 99.99,
      "stock": 42,
      "image": "https://example.com/gadget.png",
      "isActive": true
    }
  }
  ```

### Create Product
* **Method**: `POST`
* **Route**: `/products`
* **Authentication**: `JWT Bearer Token (ADMIN only)`
* **Description**: Register a new inventory item.
* **Request Body**:
  ```json
  {
    "name": "New Gadget",
    "description": "Advanced gadget.",
    "price": 149.99,
    "stock": 25,
    "image": "https://example.com/new.png"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": { ... }
  }
  ```

### Update Product
* **Method**: `PUT`
* **Route**: `/products/:id`
* **Authentication**: `JWT Bearer Token (ADMIN only)`
* **Description**: Modify existing product specifications.
* **Request Body**:
  ```json
  {
    "price": 139.99,
    "stock": 20
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": { ... }
  }
  ```

### Soft Delete Product
* **Method**: `DELETE`
* **Route**: `/products/:id`
* **Authentication**: `JWT Bearer Token (ADMIN only)`
* **Description**: Sets `isActive: false` on the product record.
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product soft-deleted successfully"
  }
  ```

---

## 3. Checkout & Orders

### Purchase Product (Checkout)
* **Method**: `POST`
* **Route**: `/checkout`
* **Authentication**: `JWT Bearer Token (CUSTOMER only)`
* **Description**: Purchases a single item unit. Updates inventory stock levels atomically.
* **Request Body**:
  ```json
  {
    "productId": "6a6dc6ccd5da2f9c54bfe077"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "orderId": "6a6d01bcb9c57eec1e79639",
      "user": "6a6d01bcb9c57eec1e79638",
      "product": "6a6dc6ccd5da2f9c54bfe077",
      "quantity": 1,
      "unitPrice": 99.99,
      "totalPrice": 99.99,
      "status": "SUCCESS",
      "purchasedAt": "2026-08-01T10:47:30.000Z"
    }
  }
  ```

### Get Order History
* **Method**: `GET`
* **Route**: `/orders`
* **Authentication**: `JWT Bearer Token (CUSTOMER only)`
* **Description**: Fetches order history for the authenticated customer.
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6a6d01bcb9c57eec1e79639",
        "product": {
          "_id": "6a6dc6ccd5da2f9c54bfe077",
          "name": "Premium Gadget"
        },
        "totalPrice": 99.99,
        "status": "SUCCESS",
        "purchasedAt": "2026-08-01T10:47:30.000Z"
      }
    ]
  }
  ```
