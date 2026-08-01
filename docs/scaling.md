# QuickCart Live - Scaling & System Architecture Design

This document analyzes scaling strategies, architectural bottlenecks, and future structural adaptations required to transition the QuickCart Live application from a MVP to supporting **10,000+ concurrent users**.

---

## 1. Primary Scaling Strategy (Horizontal vs Vertical)

To scale effectively, the system will employ a **Horizontal Scaling** strategy:

```
                  [ Load Balancer (Nginx / AWS ALB) ]
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  [ Node.js Instance 1 ]    [ Node.js Instance 2 ]    [ Node.js Instance 3 ]
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                            [ Redis Adapter ]
                                   │
                      ┌────────────┴────────────┐
                      ▼                         ▼
            [ MongoDB Replica Set ]      [ Cache Layer (Redis) ]
```

* **Express API Nodes**: Run multiple stateless Node.js process instances behind a Load Balancer.
* **Database Cluster**: Upgrade to a MongoDB replica set with a primary write node and multiple read-only secondary replica nodes.

---

## 2. Load Balancer Integration
A high-performance reverse proxy / load balancer (such as **Nginx**, **HAProxy**, or **AWS Application Load Balancer**) will be placed in front of the API nodes.
* **SSL Offloading**: The Load Balancer terminates incoming SSL/TLS connections, relieving backend Node.js server processes from compute-heavy encryption tasks.
* **Routing Algorithm**: Configure **Least Connections** or **IP Hash** (sticky sessions) if required, though stateless design makes simple Round Robin highly efficient.

---

## 3. Caching Strategy (Redis Integration)
Database reads are often a major scaling bottleneck. We will introduce **Redis** as a caching layer:
* **Product Catalog Cache**: Cache `GET /products` output inside Redis. Because catalogs change infrequently compared to order volumes, we can serve thousands of catalog requests directly from Redis memory (with sub-millisecond response times).
* **Cache Invalidation**: Set cache expirations (TTL) and clear cached lists whenever an admin inserts, updates, or deletes a product.
* **Session Cache**: If session profiles grow beyond thin JWTs, cache active sessions inside Redis to bypass MongoDB checks.

---

## 4. Socket.IO Scaling (Redis Adapter)
Scaling Socket.IO across multiple horizontal nodes requires synchronizing event broadcasts.
* **The Problem**: A client connected to Node Instance A will not receive event broadcasts emitted by Node Instance B.
* **The Solution**: Integrate the `@socket.io/redis-adapter`. This connects all Node.js Socket.IO instances to a shared Redis Pub/Sub channel. When Node Instance B emits a stock update, the Redis adapter propagates it across Instance A and Instance C, ensuring all connected global clients are synchronized in real-time.

---

## 5. MongoDB Optimization (Index Designs)
Database lookup latencies must remain constant as record counts expand.
* **Indexes**: Create indexes on frequently queried fields to prevent costly full-collection scans:
  * `User`: Unique index on `email` (for quick login/registration lookups).
  * `Product`: Single-field index on `isActive` and compound index on `_id` + `isActive`.
  * `Order`: Compound index on `user` + `purchasedAt` (to retrieve a customer's history quickly).

---

## 6. Background Workers & Message Queues
During high-traffic events, processing non-critical tasks synchronously during checkout increases API response times.
* **Asynchronous Queue**: Introduce **BullMQ** or **RabbitMQ**.
* **Flow Separation**:
  1. REST API processes checkout atomically, updates inventory stock, and returns a successful response instantly.
  2. The server pushes checkout metadata to the queue.
  3. Background worker tasks consume queue messages and execute non-blocking post-purchase operations (e.g. generating PDFs, emailing receipts, calculating analytics).
  
---

## 7. Bottlenecks & Resolutions Summary

| Area | Potential Bottleneck | Resolution |
|------|----------------------|------------|
| **Database Reads** | Product catalog checks during heavy traffic. | Cache the product list in Redis. |
| **Real-time Synchronization** | Multi-node environments missing cross-server socket broadcasts. | Socket.IO Redis Adapter for event synchronization. |
| **Checkout Concurrency** | Race conditions during high-volume purchasing. | Maintain Mongoose atomic `findOneAndUpdate()` operations with conditional stock checking. |
| **Emailing / Billing** | Slow HTTP checkout transactions due to synchronous mail sends. | Offload mail actions to background workers via message queues. |
