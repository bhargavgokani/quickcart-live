import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_loading_widget.dart';
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

          return Column(
            children: [
              // Scrollable Details Section
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Large Hero Image Container
                      Container(
                        height: 260,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE5E7EB), width: 1),
                        ),
                        child: imageUrl != null && imageUrl.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(
                                    Icons.shopping_bag_outlined,
                                    size: 80,
                                    color: Color(0xFF9CA3AF),
                                  ),
                                ),
                              )
                            : const Icon(
                                Icons.shopping_bag_outlined,
                                size: 80,
                                color: Color(0xFF9CA3AF),
                              ),
                      ),
                      AppSpacing.gapLg,

                      // Product Title
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                          letterSpacing: -0.3,
                        ),
                      ),
                      AppSpacing.gapSm,

                      // Price & Stock Chip Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '\$${price.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF111827),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: stock > 0 ? const Color(0xFFE6F4EA) : const Color(0xFFFCE8E6),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: stock > 0 ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  stock > 0 ? Icons.check_circle_outline_rounded : Icons.error_outline_rounded,
                                  size: 15,
                                  color: stock > 0 ? const Color(0xFF137333) : const Color(0xFFC5221F),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  stock > 0 ? '$stock Available' : 'Out of Stock',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: stock > 0 ? const Color(0xFF137333) : const Color(0xFFC5221F),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 36),

                      // Description Section
                      const Text(
                        'Description',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                        ),
                      ),
                      AppSpacing.gapSm,

                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.5,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Fixed Bottom Checkout Action Container
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    top: BorderSide(color: Color(0xFFE5E7EB), width: 1),
                  ),
                ),
                child: SafeArea(
                  top: false,
                  child: productController.isLoading
                      ? const AppLoadingWidget(message: 'Processing order...')
                      : ElevatedButton(
                          onPressed: stock > 0
                              ? () => _handleBuyPress(context, productController, productId)
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: stock > 0 ? const Color(0xFF0F172A) : const Color(0xFFE5E7EB),
                            disabledBackgroundColor: const Color(0xFFF3F4F6),
                            disabledForegroundColor: const Color(0xFFEF4444),
                            minimumSize: const Size(double.infinity, 50),
                          ),
                          child: Text(
                            stock > 0 ? 'BUY NOW' : 'OUT OF STOCK',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: stock > 0 ? Colors.white : const Color(0xFFEF4444),
                            ),
                          ),
                        ),
                ),
              ),
            ],
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: const [
                Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 24),
                SizedBox(width: 8),
                Text('Purchase Successful', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Your order has been placed successfully.\n\nYou can continue shopping or view your order history.',
              style: TextStyle(fontSize: 14, color: Color(0xFF4B5563)),
            ),
            actions: [
              OutlinedButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog (stays on detail page)
                },
                child: const Text('Continue Shopping'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Get.toNamed(Routes.orders); // Route to Order History page
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                ),
                child: const Text('View Orders'),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: const [
                  Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 24),
                  SizedBox(width: 8),
                  Text('Out Of Stock', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              content: const Text(
                'Sorry, another customer purchased the last available item.',
                style: TextStyle(fontSize: 14, color: Color(0xFF4B5563)),
              ),
              actions: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog (stays on detail page)
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                  ),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        } else {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Error'),
              content: Text(error ?? 'An unexpected error occurred.'),
              actions: [
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                  ),
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
