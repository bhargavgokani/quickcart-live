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
                        height: 280,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                          boxShadow: const [
                            BoxShadow(
                              color: Color.fromRGBO(0, 0, 0, 0.04),
                              blurRadius: 16,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: imageUrl != null && imageUrl.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: Image.network(
                                  imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(
                                    Icons.shopping_bag_outlined,
                                    size: 96,
                                    color: Color(0xFF94A3B8),
                                  ),
                                ),
                              )
                            : const Icon(
                                Icons.shopping_bag_outlined,
                                size: 96,
                                color: Color(0xFF94A3B8),
                              ),
                      ),
                      AppSpacing.gapLg,

                      // Product Title
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.5,
                        ),
                      ),
                      AppSpacing.gapSm,

                      // Price & Stock Chip Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '\$${price.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: stock > 0 ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: stock > 0 ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  stock > 0 ? Icons.check_circle_rounded : Icons.error_rounded,
                                  size: 16,
                                  color: stock > 0 ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  stock > 0 ? '$stock Available' : 'Out of Stock',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: stock > 0 ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 40),

                      // Description Section
                      const Text(
                        'Product Overview',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      AppSpacing.gapSm,

                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 15,
                          height: 1.6,
                          color: Color(0xFF475569),
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
                    top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
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
                            backgroundColor: stock > 0 ? Theme.of(context).primaryColor : const Color(0xFFE2E8F0),
                            disabledBackgroundColor: const Color(0xFFF1F5F9),
                            disabledForegroundColor: const Color(0xFFEF4444),
                            minimumSize: const Size(double.infinity, 54),
                          ),
                          child: Text(
                            stock > 0 ? 'BUY NOW' : 'OUT OF STOCK',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: const [
                Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 28),
                SizedBox(width: 10),
                Text('Purchase Successful', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Your order has been placed successfully.\n\nYou can continue shopping or view your order history.',
              style: TextStyle(fontSize: 14, color: Color(0xFF475569)),
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Row(
                children: const [
                  Icon(Icons.error_rounded, color: Color(0xFFEF4444), size: 28),
                  SizedBox(width: 10),
                  Text('Out Of Stock', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              content: const Text(
                'Sorry, another customer purchased the last available item.',
                style: TextStyle(fontSize: 14, color: Color(0xFF475569)),
              ),
              actions: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // Close dialog (stays on detail page)
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Text('Error'),
              content: Text(error ?? 'An unexpected error occurred.'),
              actions: [
                ElevatedButton(
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
