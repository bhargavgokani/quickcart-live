import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProductDetailView extends StatelessWidget {
  const ProductDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    // Get product data passed as argument
    final Map<String, dynamic>? product = Get.arguments as Map<String, dynamic>?;

    if (product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('Product details not found.')),
      );
    }

    final String name = product['name'] ?? 'N/A';
    final String description = product['description'] ?? '';
    final double price = (product['price'] as num?)?.toDouble() ?? 0.0;
    final int stock = (product['stock'] as num?)?.toInt() ?? 0;
    final String? imageUrl = product['image'] as String?;

    return Scaffold(
      appBar: AppBar(
        title: Text(name),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Product Image (with fallback)
            Container(
              height: 250,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(16),
              ),
              child: imageUrl != null && imageUrl.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            const Icon(Icons.shopping_bag, size: 80, color: Colors.grey),
                      ),
                    )
                  : const Icon(Icons.shopping_bag, size: 80, color: Colors.grey),
            ),
            const SizedBox(height: 24),

            // Product Name
            Text(
              name,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Product Price
            Text(
              '\$${price.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 20,
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Product Stock Alert
            Row(
              children: [
                Icon(
                  stock > 0 ? Icons.check_circle_outline : Icons.error_outline,
                  color: stock > 0 ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  stock > 0 ? '$stock items available' : 'Out of Stock',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: stock > 0 ? Colors.green : Colors.red,
                  ),
                ),
              ],
            ),
            const Divider(height: 40),

            // Product Description Title
            const Text(
              'Description',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Product Description Body
            Text(
              description,
              style: const TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
            ),
            const SizedBox(height: 40),

            // BUY Button (does nothing for now)
            ElevatedButton(
              onPressed: stock > 0 ? () {} : null,
              child: Text(stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'),
            ),
          ],
        ),
      ),
    );
  }
}
