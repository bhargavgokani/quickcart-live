import 'package:get/get.dart';
import '../network/api_service.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    // Note: StorageService is pre-initialised asynchronously in main.dart
    // and is already present in Get registry. We lazyPut network, auth and socket services here.
    Get.lazyPut<ApiService>(() => ApiService(), fenix: true);
    Get.lazyPut<AuthService>(() => AuthService(), fenix: true);
    Get.lazyPut<SocketService>(() => SocketService(), fenix: true);
  }
}
