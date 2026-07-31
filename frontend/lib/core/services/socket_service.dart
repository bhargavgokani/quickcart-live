import 'package:get/get.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/app_config.dart';
import '../utils/logger_util.dart';

class SocketService extends GetxService {
  static SocketService get to => Get.find();
  io.Socket? _socket;

  io.Socket? get socket => _socket;

  void connect() {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket']) // for Flutter, websocket transport is highly recommended
          .disableAutoConnect()
          .build(),
    );

    _socket?.connect();

    _socket?.onConnect((_) {
      Logger.info('Socket Connected: ${_socket?.id}');
    });

    _socket?.onDisconnect((_) {
      Logger.info('Socket Disconnected');
    });

    _socket?.onConnectError((err) {
      Logger.error('Socket Connection Error: $err');
    });
  }

  void disconnect() {
    _socket?.disconnect();
  }

  void listen(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  @override
  void onClose() {
    disconnect();
    super.onClose();
  }
}
