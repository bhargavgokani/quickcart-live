import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../constants/app_constants.dart';

class StorageService extends GetxService {
  final GetStorage _storage = GetStorage();

  Future<StorageService> init() async {
    await GetStorage.init();
    return this;
  }

  Future<void> saveToken(String token) async {
    await _storage.write(AppConstants.tokenKey, token);
  }

  String? getToken() {
    return _storage.read<String>(AppConstants.tokenKey);
  }

  Future<void> removeToken() async {
    await _storage.remove(AppConstants.tokenKey);
  }

  Future<void> saveUser(Map<String, dynamic> user) async {
    await _storage.write(AppConstants.userKey, user);
  }

  Map<String, dynamic>? getUser() {
    final data = _storage.read(AppConstants.userKey);
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    return null;
  }

  Future<void> clear() async {
    await _storage.erase();
  }
}
