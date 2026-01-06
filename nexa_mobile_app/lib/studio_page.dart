import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:file_selector/file_selector.dart';
import 'ai_drawer.dart';
import 'ai_input_bar.dart';
import 'logo_forge.dart';
import 'media_studio.dart';
import 'app_registry.dart';

class StudioPage extends StatefulWidget {
  const StudioPage({super.key});

  @override
  State<StudioPage> createState() => _StudioPageState();
}

class _StudioPageState extends State<StudioPage> {
  // Configuración del Estudio
  ThemeMode _themeMode = ThemeMode.system;
  String _hintText = "How can I help you today?";
  bool _showTools = true;
  bool _showSuggestions = true;
  bool _showPreview = false; // Estado para la vista dividida
  bool _isMobilePreview = true; // Estado para alternar entre Desktop y Mobile en Preview
  double _previewWidth = 375; // Ancho inicial (Móvil)
  double _previewHeight = 700; // Alto inicial
  bool _showResizeControls = false; // Mostrar sliders
  bool _showResizeControls = false; // Mostrar sliders
  
  // Nuevo Estado: App Activa (ID from registry)
  String? _activeAppId;

  // Nuevo Estado: Apps Habilitadas (Todas activas por defecto)
  final Set<String> _enabledApps = {
    'chatbot', 'nexa_creator', 'logo_forge', 'media_studio', 
    'living_machine', 'security', 'web_dev', 'research', 'terminal'
  };

  bool _isListening = false; // Estado del micrófono

  // Backend Configuration
  String _backendUrl = kIsWeb ? "http://localhost:8087" : "http://10.0.2.2:8087";
  final TextEditingController _backendUrlController = TextEditingController();

  Color _accentColor = const Color(0xFF2563EB); // Default Blue

  final TextEditingController _chatController = TextEditingController();
  final TextEditingController _hintTextController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    _backendUrlController.text = _backendUrl;
  }

  // Lista de mensajes para el simulador
  final List<_ChatMessage> _messages = [];

  @override
  void initState() {
    super.initState();
    _hintTextController.text = _hintText;
  }

  Future<void> _sendMessage() async {
    if (_chatController.text.trim().isEmpty) return;
    
    final userText = _chatController.text;

    // Detect Logo Command
    if (userText.toLowerCase().contains('logo') && (userText.toLowerCase().contains('crea') || userText.toLowerCase().contains('diseña') || userText.toLowerCase().contains('make'))) {
      setState(() {
         _messages.add(_ChatMessage(text: userText, isUser: true));
         _chatController.clear();
          _activeAppId = 'logo_forge';
          _showPreview = false;
      });
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
           setState(() {
             _messages.add(_ChatMessage(text: "🎨 Abriendo **Logo Forge**. He activado el panel de diseño a la derecha.", isUser: false));
           });
        }
      });
      return;
    }

    setState(() {
      _messages.add(_ChatMessage(text: userText, isUser: true));
      _chatController.clear();
    });

    try {
      final responseText = await _fetchAIResponse(userText);
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(
            text: responseText, 
            isUser: false
          ));
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(
            text: "⚠️ No pude conectar con Qwen/Ollama.\n\n"
                  "1. Asegúrate de tener Ollama instalado y corriendo.\n"
                  "2. Ejecuta: ollama run qwen2.5-coder\n"
                  "3. Verifica que el servidor backend esté activo.\n\n"
                  "Error técnico: $e", 
            isUser: false
          ));
        });
      }
    }
  }

  Future<String> _fetchAIResponse(String input) async {
    // Usar la URL configurada dinámicamente
    String baseUrl = _backendUrl;
    
    // Construir historial de mensajes para contexto
    final history = _messages.map((m) => {
      'role': m.isUser ? 'user' : 'assistant',
      'content': m.text
    }).toList();
    
    // Añadir el mensaje actual
    history.add({'role': 'user', 'content': input});

    try {
      // Intento 1: Qwen (Preferido por el usuario)
      return await _postToAI(baseUrl, history, 'qwen2.5-coder');
    } catch (e) {
      if (kDebugMode) print("⚠️ Qwen falló ($e), intentando fallback a DeepSeek...");
      
      try {
        // Intento 2: DeepSeek R1 (Detectado en la máquina del usuario)
        return await _postToAI(baseUrl, history, 'deepseek-r1:8b');
      } catch (e2) {
        if (kDebugMode) print("⚠️ DeepSeek falló ($e2), intentando fallback a Llama3...");

        try {
           // Intento 3: Llama 3 (Detectado en la máquina del usuario)
           return await _postToAI(baseUrl, history, 'llama3:8b');
        } catch (e3) {
            // Fallback final: Modo Demo
            if (e.toString().contains("ClientException") || e.toString().contains("SocketException")) {
                await Future.delayed(const Duration(seconds: 1)); 
                return "Modo Simulación (Sin Conexión):\n\n"
                        "No pude conectar con ningún modelo local (Qwen, Deepseek, Llama).\n"
                        "Asegúrate de que 'dev-server.js' y 'ollama serve' estén corriendo.\n\n"
                        "Tu mensaje fue: $input";
            }
            rethrow;
        }
      }
    }
  }

  Future<String> _postToAI(String baseUrl, List<Map<String, String>> history, String model) async {
      final url = Uri.parse('$baseUrl/api/proxy/local');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'messages': history,
          'model': model,
          'stream': false
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices']?[0]?['message']?['content'] ?? 
               data['response'] ?? 
               "Respuesta vacía.";
      } else {
        throw Exception("Server Error (${response.statusCode}) for $model");
      }
  }

  // Simulación de subida de video
  Future<void> _handleVideoUpload() async {
    // 1. Mostrar estado de "Subiendo..."
    setState(() {
      _messages.add(_ChatMessage(
        text: "📤 Subiendo video...", 
        isUser: true
      ));
    });

    // 2. Simular delay de red
    await Future.delayed(const Duration(seconds: 2));

    // 3. Reemplazar mensaje con el video "subido"
    setState(() {
      _messages.removeLast(); // Quitar "Subiendo..."
      _messages.add(_ChatMessage(
        text: "Aquí tienes mi video demo:\n\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
        isUser: true
      ));
    });

    // 4. Respuesta automática de la IA
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
       _messages.add(_ChatMessage(
        text: "¡Qué buen video! Parece ser 'Big Buck Bunny'. ¿Quieres que lo analice o extraiga algún fotograma?", 
        isUser: false
      ));
    });
  }



  // Simulación de Micrófono (Activación)
  void _handleMicInput() {
    if (_isListening) {
      // Detener escucha
      setState(() => _isListening = false);
      return;
    }

    // Iniciar escucha (Simulada)
    setState(() {
       _isListening = true;
       _hintText = "Escuchando... (Habla ahora)";
    });

    // Simular que detecta voz después de 3 segundos
    Future.delayed(const Duration(seconds: 3), () {
       if (!mounted || !_isListening) return;
       setState(() {
          _isListening = false;
          _chatController.text = "Crear un logo para mi empresa de café"; // Ejemplo de voz a texto
          _hintText = "How can I help you today?";
       });
       // Opcional: Auto-enviar
       // _sendMessage(); 
    });
  }

  // Descargar Mensaje a Archivo
  Future<void> _downloadMessage(String content, BuildContext context) async {
    try {
      final String fileName = 'nexa_chat_${DateTime.now().millisecondsSinceEpoch}.txt';
      
      if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
         // Desktop: Usar File Selector (Guardar Como)
         final FileSaveLocation? result = await getSaveLocation(suggestedName: fileName);
         if (result == null) return; // Usuario canceló

         final Uint8List fileData = Uint8List.fromList(utf8.encode(content));
         final XFile textFile = XFile.fromData(fileData, name: fileName, mimeType: 'text/plain');
         
         await textFile.saveTo(result.path);
         
         if (context.mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('✅ Guardado en: ${result.path}')),
           );
         }
      } else {
         // Mobile Fallback (Simulación o PathProvider)
         // Por simplicidad en esta demo móvil, copia al portapapeles y notifica
         Clipboard.setData(ClipboardData(text: content));
         if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('📱 Móvil: Texto copiado (Guardar archivo requiere permisos nativos extra)')),
            );
         }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Error al guardar: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Definimos los temas aquí para que se actualicen con el estado local
    final ThemeData lightTheme = ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF7F7F7),
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: _accentColor, brightness: Brightness.light),
    );

    final ThemeData darkTheme = ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0F0F12),
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: _accentColor, brightness: Brightness.dark),
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Nexa AI Studio',
      themeMode: _themeMode,
      theme: lightTheme,
      darkTheme: darkTheme,
      home: Scaffold(
        appBar: AppBar(
          title: ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFF00C6FF), Color(0xFF0072FF)], // Gradiente Cyan a Azul Eléctrico
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ).createShader(bounds),
            child: const Text(
              "NEXA OS",
              style: TextStyle(
                fontWeight: FontWeight.w900, 
                letterSpacing: 1.5,
                color: Colors.white, // Necesario para que el ShaderMask funcione
                fontSize: 24,
              ),
            ),
          ),
          actions: [
          actions: [
          actions: [
            // Botones de Apps Habilitadas (Dynamic from Registry)
            ...AppRegistry.allApps.where((app) => _enabledApps.contains(app.id)).map((app) {
               final isActive = _activeAppId == app.id;
               return IconButton(
                  icon: Icon(app.icon, color: isActive ? app.color : Colors.grey),
                  tooltip: "Abrir ${app.name}",
                  onPressed: () {
                     setState(() {
                        if (isActive) {
                           _activeAppId = null; // Close if already active
                           _showPreview = false;
                        } else {
                           _activeAppId = app.id;
                           _showPreview = false;
                           _messages.add(_ChatMessage(text: "🚀 Iniciando **${app.name}**...", isUser: false));
                        }
                     });
                  },
               );
            }),
            // Botón de Vista Previa (Ojo)
            IconButton(
              icon: Icon(_showPreview ? Icons.visibility_off : Icons.visibility),
              onPressed: () {
                setState(() {
                  _showPreview = !_showPreview;
                });
              },
              tooltip: _showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa (Split View)",
            ),
            const SizedBox(width: 8),
            Builder(
              builder: (context) => IconButton(
                icon: const Icon(Icons.tune),
                onPressed: () => Scaffold.of(context).openEndDrawer(),
                tooltip: "Abrir Editor",
              ),
            ),
          ],
        ),
        endDrawer: _buildEditorDrawer(),
        drawer: AiDrawer(
          enabledApps: _enabledApps,
          onOpenApp: (appId) {
             setState(() {
                _activeAppId = appId;
                _showPreview = false;
             });
             final appName = AppRegistry.getApp(appId)?.name ?? "App";
             setState(() {
                _messages.add(_ChatMessage(text: "🚀 Ejecutando **$appName**...", isUser: false));
             });
          },
        ), // El drawer original
        body: LayoutBuilder(
          builder: (context, constraints) {
            bool isMobile = constraints.maxWidth < 900;
            bool isPanelActive = _activeAppId != null || _showPreview;

            // VISTA MÓVIL: Si hay panel activo, mostramos SOLO el panel (con botón atrás)
            if (isMobile && isPanelActive) {
               return Column(
                 children: [
                   Container(
                     height: 50,
                     decoration: BoxDecoration(
                       border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor)),
                       color: Theme.of(context).cardColor,
                     ),
                     child: Row(
                       children: [
                         IconButton(
                           icon: const Icon(Icons.arrow_back),
                           onPressed: () {
                             setState(() {
                               _activeAppId = null;
                               _showPreview = false;
                             });
                           },
                         ),
                         Text(
                           _activeAppId != null 
                              ? (AppRegistry.getApp(_activeAppId!)?.name ?? "App")
                              : "Vista Previa",
                           style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                         ),
                       ],
                     ),
                   ),
                   Expanded(
                     child: _activeAppId != null
                        ? (AppRegistry.getApp(_activeAppId!)?.builder(context) ?? const Center(child: Text("App Error")))
                        : _buildPreviewPanel(context),
                   ),
                 ],
               );
            }

            // VISTA DESKTOP: Split View normal
            return Row(
              children: [
                // Panel Izquierdo: Chat (Siempre visible en Desktop, o si no hay panel en Mobile)
                Expanded(
                  flex: 1,
                  child: _ChatInterface(
                    controller: _chatController,
                    messages: _messages,
                    hintText: _hintText,
                    showTools: _showTools,
                    showSuggestions: _showSuggestions,
                    accentColor: _accentColor,
                    onSend: _sendMessage,
                    onMic: _handleMicInput,
                    onStop: () => setState(() => _isListening = false),
                    onVideoUpload: _handleVideoUpload,
                    onDownload: (txt) => _downloadMessage(txt, context),
                  ),
                ),
                
                // Panel Derecho (Solo visible en Desktop si está activo)
                if (_activeAppId != null)
                   Expanded(
                     flex: 1,
                     child: AppRegistry.getApp(_activeAppId!)?.builder(context) ?? const Center(child: Text("App Error")),
                   )
                else if (_showPreview) ...[
                  const VerticalDivider(width: 1),
                  Expanded(
                    flex: 1,
                    child: _buildPreviewPanel(context),
                  ),
                ],
              ],
            );
          },
        ),
      ),
    );
  }

  // Extracted Preview Panel to avoid code duplication
  Widget _buildPreviewPanel(BuildContext context) {
    return Container(
      color: _themeMode == ThemeMode.dark ? const Color(0xFF1E1E1E) : const Color(0xFFE0E0E0),
      child: Column(
        children: [
          // Cabecera del Preview con selector de dispositivo y controles
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: _themeMode == ThemeMode.dark ? const Color(0xFF2A2A2E) : Colors.white,
              border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Simulador Virtual",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.tune, color: _showResizeControls ? _accentColor : Colors.grey),
                          onPressed: () => setState(() => _showResizeControls = !_showResizeControls),
                          tooltip: "Ajustar Medidas",
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: Icon(Icons.desktop_mac, color: !_isMobilePreview ? _accentColor : Colors.grey),
                          onPressed: () => setState(() {
                            _isMobilePreview = false;
                            _previewWidth = 1024; // Standard Desktop Width
                          }),
                          tooltip: "Vista Desktop",
                        ),
                        IconButton(
                          icon: Icon(Icons.phone_android, color: _isMobilePreview ? _accentColor : Colors.grey),
                          onPressed: () => setState(() {
                            _isMobilePreview = true;
                            _previewWidth = 375; // Standard Mobile Width
                          }),
                          tooltip: "Vista Móvil (Android)",
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => setState(() => _showPreview = false),
                          tooltip: "Cerrar Panel",
                        ),
                      ],
                    ),
                  ],
                ),
                if (_showResizeControls) ...[
                  const Divider(),
                  Row(
                    children: [
                      const Text("Ancho:", style: TextStyle(fontSize: 12)),
                      Expanded(
                        child: Slider(
                          value: _previewWidth,
                          min: 300,
                          max: 1200,
                          divisions: 90,
                          label: _previewWidth.round().toString(),
                          onChanged: (val) => setState(() => _previewWidth = val),
                        ),
                      ),
                      Text("${_previewWidth.round()}px", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Row(
                    children: [
                      const Text("Alto:    ", style: TextStyle(fontSize: 12)),
                      Expanded(
                        child: Slider(
                          value: _previewHeight,
                          min: 400,
                          max: 1000,
                          divisions: 60,
                          label: _previewHeight.round().toString(),
                          onChanged: (val) => setState(() => _previewHeight = val),
                        ),
                      ),
                      Text("${_previewHeight.round()}px", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          // Contenido del Preview
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  child: _isMobilePreview
                      ? _buildMobileFrame(context)
                      : Container(
                          width: _previewWidth,
                          height: _previewHeight,
                          margin: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Theme.of(context).scaffoldBackgroundColor,
                            border: Border.all(color: Colors.grey.withOpacity(0.5)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: _ChatInterface( // Vista Desktop completa
                            controller: TextEditingController(),
                            messages: _messages,
                            hintText: _hintText,
                            showTools: _showTools,
                            showSuggestions: _showSuggestions,
                            accentColor: _accentColor,
                            onSend: () {}, // No funcional en preview pasiva
                            onMic: () {},
                            onStop: () {},
                            onDownload: (txt) {}, // No funcional en preview
                          ),
                        ),
                ),
              ),
            ),
          ),
        ],
      );
    }
    );
  }

  Widget _buildMobileFrame(BuildContext context) {
    return Container(
      width: _previewWidth, // Ancho dinámico
      height: _previewHeight, // Alto dinámico
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
        border: Border.all(color: const Color(0xFF333333), width: 8),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          appBar: AppBar(
            title: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                colors: [Color(0xFF00C6FF), Color(0xFF0072FF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds),
              child: const Text(
                "NEXA OS",
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 1.2,
                  fontSize: 20,
                ),
              ),
            ),
            leading: IconButton(icon: const Icon(Icons.menu), onPressed: () {}),
            toolbarHeight: 50,
          ),
          body: _ChatInterface(
            controller: TextEditingController(), // Dummy controller for preview
            messages: _messages,
            hintText: _hintText,
            showTools: _showTools,
            showSuggestions: _showSuggestions,
            accentColor: _accentColor,
            onSend: () {},
            onMic: () {},
            onStop: () {},
            onDownload: (txt) {}, // No funcional en preview
          ),
        ),
      ),
    );
  }

  Widget _buildEditorDrawer() {
    return Drawer(
      width: 320,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text("Propiedades", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const Divider(),
          const SizedBox(height: 20),
          
          // Tema
          const Text("Tema", style: TextStyle(fontWeight: FontWeight.bold)),
          SegmentedButton<ThemeMode>(
            segments: const [
              ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode), label: Text("Claro")),
              ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode), label: Text("Oscuro")),
              ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.auto_mode), label: Text("Auto")),
            ],
            selected: {_themeMode},
            onSelectionChanged: (Set<ThemeMode> newSelection) {
              setState(() {
                _themeMode = newSelection.first;
              });
            },
          ),
          const SizedBox(height: 20),

          // Texto de ayuda
          const Text("Texto de ayuda", style: TextStyle(fontWeight: FontWeight.bold)),
          TextField(
            controller: _hintTextController,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            onChanged: (value) {
              setState(() {
                _hintText = value;
              });
            },
          ),
          const SizedBox(height: 20),

          // Configuración del Backend (URL)
          const Text("Servidor Backend (URL)", style: TextStyle(fontWeight: FontWeight.bold)),
          const Text("Usa tu URL de Ngrok si estás fuera de casa.", style: TextStyle(fontSize: 10, color: Colors.grey)),
          TextField(
            controller: _backendUrlController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: "http://localhost:8087",
            ),
            onChanged: (value) {
              setState(() {
                _backendUrl = value;
              });
            },
          ),
          const SizedBox(height: 20),

          // Switches
          SwitchListTile(
            title: const Text("Mostrar Herramientas"),
            value: _showTools,
            onChanged: (val) => setState(() => _showTools = val),
          ),
          SwitchListTile(
            title: const Text("Mostrar Sugerencias"),
            value: _showSuggestions,
            onChanged: (val) => setState(() => _showSuggestions = val),
          ),
          
          const SizedBox(height: 20),
          const Text("Integraciones", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Divider(),
          
          // Generate Switches Dynamically from Registry
          ...AppRegistry.allApps.map((app) {
             final isEnabled = _enabledApps.contains(app.id);
             return SwitchListTile(
               secondary: Icon(app.icon, color: app.color),
               title: Text(app.name),
               subtitle: Text(app.subtitle),
               value: isEnabled,
               onChanged: (val) {
                  setState(() {
                     if (val) {
                        _enabledApps.add(app.id);
                     } else {
                        _enabledApps.remove(app.id);
                        if (_activeAppId == app.id) {
                           _activeAppId = null; // Close if disabled
                        }
                     }
                  });
               },
             );
          }),

          const SizedBox(height: 20),
          const Text("Color de Acento", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            children: [
              _ColorButton(color: const Color(0xFF2563EB), selected: _accentColor == const Color(0xFF2563EB), onTap: () => setState(() => _accentColor = const Color(0xFF2563EB))),
              _ColorButton(color: Colors.red, selected: _accentColor == Colors.red, onTap: () => setState(() => _accentColor = Colors.red)),
              _ColorButton(color: Colors.green, selected: _accentColor == Colors.green, onTap: () => setState(() => _accentColor = Colors.green)),
              _ColorButton(color: Colors.purple, selected: _accentColor == Colors.purple, onTap: () => setState(() => _accentColor = Colors.purple)),
              _ColorButton(color: Colors.orange, selected: _accentColor == Colors.orange, onTap: () => setState(() => _accentColor = Colors.orange)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isUser;
  _ChatMessage({required this.text, required this.isUser});
}

class _ChatInterface extends StatelessWidget {
  final TextEditingController controller;
  final List<_ChatMessage> messages;
  final String hintText;
  final bool showTools;
  final bool showSuggestions;
  final Color accentColor;
  final VoidCallback onSend;
  final VoidCallback onMic;
  final VoidCallback onStop;
  final VoidCallback? onVideoUpload;
  final Function(String, BuildContext) onDownload; // Nuevo Callback

  const _ChatInterface({
    required this.controller,
    required this.messages,
    required this.hintText,
    required this.showTools,
    required this.showSuggestions,
    required this.accentColor,
    required this.onSend,
    required this.onMic,
    required this.onStop,
    this.onVideoUpload,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              return _MessageBubble(
                message: msg,
                accentColor: accentColor,
                onDownload: (txt) => onDownload(txt, context),
              );
            },
          ),
        ),
        AiInputBar(
          controller: controller,
          hintText: hintText,
          showTools: showTools,
          showSuggestions: showSuggestions,
          accentColor: accentColor,
          onSend: onSend,
          onMic: onMic,
          onStop: onStop,
          onVideoUpload: onVideoUpload,
        ),
      ],
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final _ChatMessage message;
  final Color accentColor;
  final Function(String) onDownload;

  const _MessageBubble({
    required this.message,
    required this.accentColor,
    required this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = message.isUser 
        ? accentColor 
        : (isDark ? const Color(0xFF2A2A2E) : Colors.white);
    final textColor = message.isUser 
        ? Colors.white 
        : (isDark ? Colors.white : Colors.black87);

    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        // Si es IA, quitamos padding del contenedor para manejarlo internamente
        // y poder poner la barra de herramientas "full width" si quisiéramos,
        // pero aquí lo haremos integrado.
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: message.isUser ? const Radius.circular(20) : Radius.zero,
            bottomRight: message.isUser ? Radius.zero : const Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // BARRA DE HERRAMIENTAS (Solo para IA)
            if (!message.isUser)
              Container(
                padding: const EdgeInsets.only(left: 16, right: 8, top: 8, bottom: 4),
                decoration: BoxDecoration(
                  color: isDark ? Colors.black12 : Colors.grey.withOpacity(0.05),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Espaciador para empujar iconos a la derecha
                    const Spacer(),
                    _ActionButton(
                      icon: Icons.share_outlined, 
                      tooltip: "Compartir", 
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: message.text));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Copiado para compartir'), duration: Duration(milliseconds: 1500)),
                        );
                      }
                    ),
                    const SizedBox(width: 4),
                    _ActionButton(
                      icon: Icons.download_outlined, 
                      tooltip: "Guardar en Archivo", 
                      onTap: () => onDownload(message.text),
                    ),
                    const SizedBox(width: 4),
                    _ActionButton(
                      icon: Icons.content_copy, 
                      tooltip: "Copiar", 
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: message.text));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Copiado al portapapeles'), duration: Duration(milliseconds: 1500)),
                        );
                      }
                    ),
                  ],
                ),
              ),

            // CONTENIDO DEL MENSAJE
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: _buildMessageContent(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageContent(BuildContext context) {
    // Detección simple de video
    final videoRegex = RegExp(r'(https?://.*\.(?:mp4|mov|webm))', caseSensitive: false);
    final match = videoRegex.firstMatch(message.text);

    if (match != null) {
      final videoUrl = match.group(0)!;
      final textBefore = message.text.substring(0, match.start).trim();
      final textAfter = message.text.substring(match.end).trim();

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (textBefore.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                textBefore,
                style: _textStyle(context),
              ),
            ),
          VideoMessage(videoUrl: videoUrl),
          if (textAfter.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                textAfter,
                style: _textStyle(context),
              ),
            ),
        ],
      );
    }

    return Text(
      message.text,
      style: _textStyle(context),
    );
  }

  TextStyle _textStyle(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = message.isUser 
        ? Colors.white 
        : (isDark ? Colors.white : Colors.black87);
    return TextStyle(
      color: textColor,
      fontSize: 15,
      height: 1.4,
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  const _ActionButton({required this.icon, required this.tooltip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return IconButton(
      icon: Icon(icon, size: 16),
      color: isDark ? Colors.white54 : Colors.black45,
      tooltip: tooltip,
      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
      padding: EdgeInsets.zero,
      onPressed: onTap,
    );
  }
}

class _ColorButton extends StatelessWidget {
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _ColorButton({required this.color, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: selected ? Border.all(color: Colors.white, width: 3) : null,
          boxShadow: [if (selected) const BoxShadow(color: Colors.black26, blurRadius: 4)],
        ),
        child: selected ? const Icon(Icons.check, color: Colors.white) : null,
      ),
    );
  }
}
