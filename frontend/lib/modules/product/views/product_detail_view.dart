import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/product_controller.dart';

class ProductDetailView extends StatelessWidget {
  const ProductDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    // Get product data passed as argument from listing
    final Map<String, dynamic>? initialProduct = Get.arguments as Map<String, dynamic>?;

    if (initialProduct == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('Product details not found.')),
      );
    }

    final String productId = initialProduct['_id'] ?? '';
    final productController = Get.find<ProductController>();

    return Scaffold(
      appBar: AppBar(
        title: Obx(() {
          final product = productController.products.firstWhereOrNull((p) => p['_id'] == productId) ?? initialProduct;
          return Text(product['name'] ?? 'Product Details');
        }),
      ),
      body: SafeArea(
        child: Obx(() {
          // Reactively sync changes to this specific product (e.g. stock level updates from Socket.IO)
          final product = productController.products.firstWhereOrNull((p) => p['_id'] == productId) ?? initialProduct;
          
          final String name = product['name'] ?? 'N/A';
          final String description = product['description'] ?? '';
          final double price = (product['price'] as num?)?.toDouble() ?? 0.0;
          final int stock = (product['stock'] as num?)?.toInt() ?? 0;
          final String? imageUrl = product['image'] as String?;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Product Image Container
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

                // Product Title
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

                // Product Availability/Stock Indicator
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

                // Description Title
                const Text(
                  'Description',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),

                // Description Text
                Text(
                  description,
                  style: const TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
                ),
                const SizedBox(height: 40),

                // Buy Action Button
                productController.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton(
                        onPressed: stock > 0
                            ? () => _handleBuyPress(context, productController, productId)
                            : null,
                        child: Text(stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'),
                      ),
              ],
            ),
          );
        }),
      ),
    );
  }

  void _handleBuyPress(BuildContext context, ProductController controller, String productId) {
    controller.purchaseProduct(productId, (success, error) {
      if (success) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Purchase Successful'),
            content: const Text('Thank you! Your order has been placed successfully.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Get.back(); // Navigate back to Dashboard
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      } else {
        final bool isOutOfStock = error != null &&
            (error.toLowerCase().contains('out of stock') ||
                error.toLowerCase().contains('no longer available'));

        if (isOutOfStock) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: const Text('Out Of Stock'),
              content: const Text('Sorry, another customer purchased the last available item.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog
                    Get.back(); // Navigate back to Dashboard
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        } else {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Error'),
              content: Text(error ?? 'An unexpected error occurred.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    });
  }
}
