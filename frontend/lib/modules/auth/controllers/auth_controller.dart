import 'package:get/get.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/socket_service.dart';
import '../../../core/storage/storage_service.dart';
import '../../../core/utils/snackbar_util.dart';

class AuthController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final StorageService _storage = Get.find<StorageService>();
  final SocketService _socket = Get.find<SocketService>();

  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final Rxn<Map<String, dynamic>> _currentUser = Rxn<Map<String, dynamic>>();
  Map<String, dynamic>? get currentUser => _currentUser.value;

  @override
  void onInit() {
    super.onInit();
    final user = _storage.getUser();
    if (user != null) {
      _currentUser.value = user;
    }
  }

  /// Checks if token exists and redirects appropriately. Called by SplashView.
  void checkLogin() {
    Future.delayed(const Duration(seconds: 2), () {
      final token = _storage.getToken();
      if (token != null && token.isNotEmpty) {
        _socket.connect(); // Connect SocketService automatically on session resume
        Get.offAllNamed(Routes.dashboard);
      } else {
        Get.offAllNamed(Routes.login);
      }
    });
  }

  /// Log in with email and password
  Future<void> login(String email, String password) async {
    _isLoading.value = true;
    try {
      final data = await _authService.login(email, password);
      
      final String token = data['token'];
      final Map<String, dynamic> user = data['user'];

      await _storage.saveToken(token);
      await _storage.saveUser(user);

      _currentUser.value = user;
      _socket.connect(); // Connect SocketService on successful login

      _isLoading.value = false;
      SnackbarUtil.success('Welcome back, ${user['name']}!');
      Get.offAllNamed(Routes.dashboard);
    } catch (e) {
      _isLoading.value = false;
      SnackbarUtil.error(e.toString());
    }
  }

  /// Register a new Customer account
  Future<void> register(String name, String email, String password) async {
    _isLoading.value = true;
    try {
      await _authService.register(name, email, password);
      _isLoading.value = false;
      SnackbarUtil.success('Account created successfully! Please log in.', title: 'Registration Success');
      Get.offAllNamed(Routes.login);
    } catch (e) {
      _isLoading.value = false;
      SnackbarUtil.error(e.toString());
    }
  }

  /// Log out from session
  Future<void> logout() async {
    _isLoading.value = true;
    try {
      await _storage.clear();
      _currentUser.value = null;
      _socket.disconnect(); // Disconnect SocketService on logout
      _isLoading.value = false;
      SnackbarUtil.info('Logged out successfully.');
      Get.offAllNamed(Routes.login);
    } catch (e) {
      _isLoading.value = false;
      SnackbarUtil.error('Failed to log out: $e');
    }
  }
}
