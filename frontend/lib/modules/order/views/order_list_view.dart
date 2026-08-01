import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/app_empty_state_widget.dart';
import '../../../core/widgets/app_error_widget.dart';
import '../../../core/widgets/app_loading_widget.dart';
import '../controllers/order_controller.dart';

class OrderListView extends GetView<OrderController> {
  const OrderListView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order History'),
      ),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading) {
            return const AppLoadingWidget(message: 'Fetching order history...');
          }

          if (controller.errorMessage.isNotEmpty) {
            return AppErrorWidget(
              errorMessage: controller.errorMessage.value,
              onRetry: () => controller.fetchOrders(),
            );
          }

          if (controller.orders.isEmpty) {
            return const AppEmptyStateWidget(
              title: 'No Orders Placed Yet',
              message: 'Your completed purchases and checkout receipts will appear here.',
              icon: Icons.receipt_long_outlined,
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: controller.orders.length,
            itemBuilder: (context, index) {
              final order = controller.orders[index];
              final product = order['product'] as Map<String, dynamic>?;

              final String productName = product != null ? (product['name'] ?? 'Unknown Product') : 'Deleted Product';
              final String? imageUrl = product != null ? (product['image'] as String?) : null;
              final double price = (order['totalPrice'] as num?)?.toDouble() ?? 0.0;
              final String status = order['status'] ?? 'SUCCESS';

              // Native date formatting
              String dateFormatted = 'N/A';
              final String? purchasedAtStr = order['purchasedAt'] as String?;
              if (purchasedAtStr != null) {
                try {
                  final DateTime date = DateTime.parse(purchasedAtStr).toLocal();
                  dateFormatted =
                      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
                } catch (_) {}
              }

              return Card(
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      // Thumbnail image or Icon Badge
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                        ),
                        child: imageUrl != null && imageUrl.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(
                                    Icons.shopping_bag_outlined,
                                    color: Color(0xFF2563EB),
                                    size: 28,
                                  ),
                                ),
                              )
                            : const Icon(
                                Icons.shopping_bag_outlined,
                                color: Color(0xFF2563EB),
                                size: 28,
                              ),
                      ),
                      AppSpacing.gapMd,

                      // Order Details Meta
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              productName,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Purchased: $dateFormatted',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF64748B),
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Status Chip & Price Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: status == 'SUCCESS' ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    status,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: status == 'SUCCESS' ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                    ),
                                  ),
                                ),
                                Text(
                                  '\$${price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }
}
