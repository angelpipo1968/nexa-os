import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AI Drawer Template',
      themeMode: ThemeMode.system, // 🔥 MODO AUTOMÁTICO
      theme: _lightTheme,
      darkTheme: _darkTheme,
      home: const HomePage(),
    );
  }
}

// 🌞 Tema Claro
final ThemeData _lightTheme = ThemeData(
  brightness: Brightness.light,
  scaffoldBackgroundColor: const Color(0xFFF7F7F7),
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.deepPurple,
    brightness: Brightness.light,
  ),
);

// 🌙 Tema Oscuro
final ThemeData _darkTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: const Color(0xFF0F0F12),
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.deepPurple,
    brightness: Brightness.dark,
  ),
);

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Drawer Style"),
      ),
      drawer: const AiDrawer(),
      body: const Center(
        child: Text("Contenido principal"),
      ),
    );
  }
}

class AiDrawer extends StatelessWidget {
  const AiDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Drawer(
      width: 290,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // HEADER estilo Qwen
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF4A3CC7), const Color(0xFF6A5AE0)]
                    : [const Color(0xFF6A5AE0), const Color(0xFF8F7BFF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(24),
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: Colors.white,
                  child: Text(
                    "AI",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.deepPurple.shade600,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "NEXA Assistant",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Tu IA personal",
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                )
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ITEMS estilo tarjeta
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _drawerCard(
                  context,
                  icon: Icons.home_rounded,
                  title: "Inicio",
                  onTap: () => Navigator.pop(context),
                ),
                _drawerCard(
                  context,
                  icon: Icons.chat_bubble_rounded,
                  title: "Conversaciones",
                  onTap: () {},
                ),
                _drawerCard(
                  context,
                  icon: Icons.settings_rounded,
                  title: "Configuración",
                  onTap: () {},
                ),
                _drawerCard(
                  context,
                  icon: Icons.info_outline_rounded,
                  title: "Acerca de",
                  onTap: () {},
                ),
              ],
            ),
          ),

          // FOOTER
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              "NEXA AI • 2026",
              style: TextStyle(
                color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                fontSize: 13,
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _drawerCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 0,
      color: isDark ? const Color(0xFF1A1A1E) : Colors.white,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isDark ? Colors.deepPurple.shade200 : Colors.deepPurple.shade400,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        onTap: onTap,
      ),
    );
  }
}
