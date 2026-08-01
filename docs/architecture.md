# QuickCart Live - System Architecture

This document describes the architectural decisions, structural design, and runtime workflows implemented across the QuickCart Live application.

---

## System Flow Overview

The system operates on a client-server model connected via a unified HTTP and WebSocket channel:

```
[ Flutter Client (M3 App) ]
         │
         ├──► (REST API) ────► [ Express App ] ──► [ Services Layer ] ──► [ MongoDB Atlas ]
         │
         └──◄ (WebSockets) ◄── [ Socket.IO Server ]
```

### Flow Lifecycle
1. **Request Gateway**: The Flutter application executes REST calls (`http`) or connects to socket namespaces (`socket_io_client`).
2. **Web Framework**: Express coordinates requests, passes them through global validation and authorization filters (JWT checks, validation checks), and routes them.
3. **Services Layer**: Controllers parse incoming data and delegate operations to dedicated domain services (e.g. `productService`, `orderService`). All business calculations and database mutations live here.
4. **Database Storage**: MongoDB handles data mutations atomically.
5. **Real-time Broadcast**: Upon successful checkout or catalog updates, services trigger event broadcasts through Socket.IO to instantly notify all connected client listeners.

---

## Architectural Choices & Rationale

### 1. Flutter + GetX (State Management & DI)
* **High Performance**: GetX operates independently of the Flutter build context. It accesses controllers directly from the memory registry, preventing unnecessary widget rebuilds.
* **Unified State Management**: GetX combines reactive state variables (`.obs`), dependency injection (`Get.find`, `Get.lazyPut`), and context-less routing (`Get.toNamed`, `Get.offAllNamed`) into a cohesive toolset, reducing boilerplate.
* **Separation of Concerns**: Controllers act as thin view-models mediating between services (HTTP data flows) and UI views, keeping components highly testable.

### 2. MongoDB Atlas (Database Layer)
* **JSON-Friendly Document Schema**: Since frontend client calls and backend APIs communicate in JSON, MongoDB stores and retrieves data in BSON natively, eliminating Object-Relational Impedance mismatch.
* **Horizontal Scalability**: MongoDB's sharding and replica set structures allow the database to scale out horizontally as traffic volumes expand.
* **Atomic Mutation Support**: Supports find-and-modify operators (`findOneAndUpdate`) which allow validation and updates to run in a single atomic database operation.

### 3. Socket.IO (Real-time Layer)
* **Auto-Reconnection**: Socket.IO handles disconnection and network state adjustments automatically.
* **Low Overhead**: Employs WebSocket channels instead of periodic REST pooling, minimizing client battery usage and backend process loads.
* **Room-based Partitioning**: Supports rooms and namespaces, which will allow us to easily partition customer/admin message groups in future expansions.

### 4. Atomic Checkout Logic (Concurrency Guard)
* **Prevention of Overselling**: In high-concurrency situations (e.g. flash sales where 100 users try to buy the last 10 items), a standard `get stock -> check if > 0 -> decrement stock` flow causes race conditions.
* **Database Level Atomic Operation**: By executing a Mongoose `findOneAndUpdate()` operation with a conditional `stock: { $gt: 0 }` filter:
  ```javascript
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
  ```
  MongoDB guarantees that checking availability (`stock: { $gt: 0 }`) and decrementing the stock (`$inc: { stock: -1 }`) are executed as a single atomic operation at the document level. If stock is exhausted, the query yields `null` and aborts checkout without modifying any document, guaranteeing zero overselling.
