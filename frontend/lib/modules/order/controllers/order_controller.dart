import 'package:get/get.dart';
import '../../../core/services/order_service.dart';
import '../../../core/utils/snackbar_util.dart';

class OrderController extends GetxController {
  final OrderService _orderService = Get.find<OrderService>();

  final RxList<Map<String, dynamic>> orders = <Map<String, dynamic>>[].obs;
  
  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  /// Fetches customer order history from OrderService. Updates loading and error states.
  Future<void> fetchOrders() async {
    _isLoading.value = true;
    errorMessage.value = '';
    try {
      final list = await _orderService.getOrders();
      orders.assignAll(list);
      _isLoading.value = false;
    } catch (e) {
      _isLoading.value = false;
      errorMessage.value = e.toString();
      SnackbarUtil.error('Failed to load order history: $e');
    }
  }
}
