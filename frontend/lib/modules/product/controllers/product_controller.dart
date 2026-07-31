import 'package:get/get.dart';
import '../../../core/services/product_service.dart';
import '../../../core/utils/snackbar_util.dart';

class ProductController extends GetxController {
  final ProductService _productService = Get.find<ProductService>();

  final RxList<Map<String, dynamic>> products = <Map<String, dynamic>>[].obs;
  
  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  /// Fetches products from the service. Updates loading and error states.
  Future<void> fetchProducts() async {
    _isLoading.value = true;
    errorMessage.value = '';
    try {
      final list = await _productService.getProducts();
      products.assignAll(list);
      _isLoading.value = false;
    } catch (e) {
      _isLoading.value = false;
      errorMessage.value = e.toString();
      SnackbarUtil.error('Failed to load products: $e');
    }
  }

  /// Performs a silent refresh of the product list (for pull-to-refresh indicator).
  Future<void> refreshProducts() async {
    errorMessage.value = '';
    try {
      final list = await _productService.getProducts();
      products.assignAll(list);
    } catch (e) {
      errorMessage.value = e.toString();
      SnackbarUtil.error('Failed to refresh products: $e');
    }
  }
}
