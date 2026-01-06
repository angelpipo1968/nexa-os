import 'package:flutter/material.dart';

class AiDrawer extends StatefulWidget {
  final VoidCallback? onOpenLogoForge;
  final VoidCallback? onOpenMediaStudio;
  final bool enableLogoForge;
  final bool enableMediaStudio;

  const AiDrawer({
    super.key, 
    this.onOpenLogoForge, 
    this.onOpenMediaStudio,
    this.enableLogoForge = true,
    this.enableMediaStudio = true,
  });

  @override
  State<AiDrawer> createState() => _AiDrawerState();
}

class _AiDrawerState extends State<AiDrawer> {
  // Estado para controlar la vista actual: 0 = Principal (Historial), 1 = Configuración
  int _viewIndex = 0;

  void _toggleView() {
    setState(() {
      _viewIndex = _viewIndex == 0 ? 1 : 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? const Color(0xFF0F0F12) : const Color(0xFFF7F7F7);

    return Drawer(
      width: 290,
      backgroundColor: backgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _viewIndex == 0
            ? _buildMainView(context, isDark)
            : _buildSettingsView(context, isDark),
      ),
    );
  }

  // VISTA PRINCIPAL: Perfil + Búsqueda + Historial
  Widget _buildMainView(BuildContext context, bool isDark) {
    return Column(
      key: const ValueKey("MainView"),
      children: [
        // 1. Header: Usuario + Flecha
        Padding(
          padding: const EdgeInsets.fromLTRB(10, 50, 20, 20),
          child: Row(
            children: [
              // Flecha para CERRAR el menú y volver a las "tres rayitas"
              IconButton(
                icon: const Icon(Icons.arrow_back, size: 24),
                color: isDark ? Colors.white70 : Colors.black54,
                onPressed: () => Navigator.pop(context),
                tooltip: "Cerrar menú",
              ),
              const SizedBox(width: 4),
              
              CircleAvatar(
                radius: 20,
                backgroundColor: isDark ? Colors.deepPurple : Colors.blueAccent,
                child: const Text("U", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  "Usuario",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ),
              // Flecha para ir a CONFIGURACIÓN
              IconButton(
                icon: const Icon(Icons.settings, size: 20),
                onPressed: _toggleView,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ],
          ),
        ),

        // 2. Barra de Búsqueda
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            height: 44,
            decoration: BoxDecoration(
              color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.search, color: isDark ? Colors.white54 : Colors.black45, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: "Buscar",
                      hintStyle: TextStyle(color: isDark ? Colors.white38 : Colors.black38),
                      isDense: true,
                    ),
                    style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 20),
        
        // 3. Lista de Historial (Chats guardados)
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 12, bottom: 8),
                child: Text(
                  "Historial",
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white54 : Colors.black54,
                  ),
                ),
              ),
              _HistoryItem(title: "Plan de Marketing", date: "Hoy", isDark: isDark),
              _HistoryItem(title: "Código Flutter", date: "Ayer", isDark: isDark),
              _HistoryItem(title: "Ideas de Viaje", date: "Lun", isDark: isDark),
              _HistoryItem(title: "Receta Pizza", date: "Dom", isDark: isDark),

        if (widget.enableLogoForge || widget.enableMediaStudio) ...[
          const Divider(height: 32),
          
          Padding(
            padding: const EdgeInsets.only(left: 12, bottom: 8),
            child: Text(
              "APLICACIONES",
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white54 : Colors.black54,
              ),
            ),
          ),
        ],

        if (widget.enableLogoForge)
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
            dense: true,
            leading: Container(
               padding: const EdgeInsets.all(6),
               decoration: BoxDecoration(
                 color: Colors.purple.withOpacity(0.2),
                 borderRadius: BorderRadius.circular(8)
               ),
               child: const Icon(Icons.auto_fix_high, color: Colors.purpleAccent, size: 18),
            ),
            title: Text("Logo Studio", style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold)),
            subtitle: Text("Diseña tu marca", style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 11)),
            onTap: () {
               Navigator.pop(context); // Cerrar drawer
               if (widget.onOpenLogoForge != null) widget.onOpenLogoForge!();
            },
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          
        if (widget.enableLogoForge && widget.enableMediaStudio)
          const SizedBox(height: 8),

        if (widget.enableMediaStudio)
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
            dense: true,
            leading: Container(
               padding: const EdgeInsets.all(6),
               decoration: BoxDecoration(
                 color: Colors.red.withOpacity(0.2),
                 borderRadius: BorderRadius.circular(8)
               ),
               child: const Icon(Icons.movie_filter, color: Colors.redAccent, size: 18),
            ),
            title: Text("Media Studio", style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold)),
            subtitle: Text("Video e Imágenes", style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 11)),
            onTap: () {
               Navigator.pop(context); // Cerrar drawer
               if (widget.onOpenMediaStudio != null) widget.onOpenMediaStudio!();
            },
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),

                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              
              const SizedBox(height: 8),

              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                dense: true,
                leading: Container(
                   padding: const EdgeInsets.all(6),
                   decoration: BoxDecoration(
                     color: Colors.red.withOpacity(0.2),
                     borderRadius: BorderRadius.circular(8)
                   ),
                   child: const Icon(Icons.movie_filter, color: Colors.redAccent, size: 18),
                ),
                title: Text("Media Studio", style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold)),
                subtitle: Text("Video e Imágenes", style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 11)),
                onTap: () {
                   Navigator.pop(context); // Cerrar drawer
                   if (widget.onOpenMediaStudio != null) widget.onOpenMediaStudio!();
                },
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // VISTA CONFIGURACIÓN: Menú completo
  Widget _buildSettingsView(BuildContext context, bool isDark) {
    return Column(
      key: const ValueKey("SettingsView"),
      children: [
        // Header con botón atrás
        Padding(
          padding: const EdgeInsets.fromLTRB(10, 50, 20, 20),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                onPressed: _toggleView,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
              const SizedBox(width: 4),
              Text(
                "Configuración",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              // 1. CUENTA
              Padding(
                padding: const EdgeInsets.only(left: 16, top: 16, bottom: 8),
                child: Text("CUENTA", style: TextStyle(color: isDark ? Colors.white54 : Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
              _SettingsTile(
                icon: Icons.login,
                title: "Iniciar Sesión",
                isDark: isDark,
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.person_add,
                title: "Inscribirse por Correo",
                isDark: isDark,
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.lock_reset,
                title: "Cambiar Contraseña",
                isDark: isDark,
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.logout,
                title: "Cerrar Sesión",
                isDark: isDark,
                color: Colors.redAccent,
                onTap: () {},
              ),

              const Divider(height: 32, indent: 20, endIndent: 20),
              
              Padding(
                padding: const EdgeInsets.only(left: 16, bottom: 8),
                child: Text("GENERAL", style: TextStyle(color: isDark ? Colors.white54 : Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
              
              // 2. Lenguaje
              _SettingsTile(
                icon: Icons.language,
                title: "Lenguaje",
                subtitle: "Español",
                isDark: isDark,
                onTap: () {},
              ),

              // 3. Tema
              _SettingsTile(
                icon: Icons.palette_outlined,
                title: "Tema",
                subtitle: "Automático",
                isDark: isDark,
                onTap: () {},
              ),

              // 4. Voz
              _SettingsTile(
                icon: Icons.mic_none,
                title: "Voz",
                subtitle: "Femenina 1",
                isDark: isDark,
                onTap: () {},
              ),

              // 5. Personalización
              _SettingsTile(
                icon: Icons.tune,
                title: "Personalización",
                isDark: isDark,
                onTap: () {},
              ),

              const Divider(height: 32, indent: 20, endIndent: 20),

              // 6. Modelo de la aplicación
              _SettingsTile(
                icon: Icons.psychology_outlined,
                title: "Modelo",
                subtitle: "Nexa GPT-4o",
                isDark: isDark,
                onTap: () {},
              ),

              // 7. Acuerdo y Privacidad
              _SettingsTile(
                icon: Icons.privacy_tip_outlined,
                title: "Privacidad",
                isDark: isDark,
                onTap: () {},
              ),

              // 8. Sobre Nosotros
              _SettingsTile(
                icon: Icons.info_outline,
                title: "Sobre Nosotros",
                isDark: isDark,
                onTap: () {},
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HistoryItem extends StatelessWidget {
  final String title;
  final String date;
  final bool isDark;

  const _HistoryItem({required this.title, required this.date, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 14)),
      subtitle: Text(date, style: TextStyle(color: isDark ? Colors.white38 : Colors.black38, fontSize: 12)),
      leading: Icon(Icons.chat_bubble_outline, size: 20, color: isDark ? Colors.white54 : Colors.black45),
      dense: true,
      onTap: () {},
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool isDark;
  final VoidCallback onTap;
  final Color? color; // Nuevo parámetro para color personalizado

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.isDark,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = color ?? (isDark ? Colors.white : Colors.black87);
    final iconColor = color ?? (isDark ? Colors.white70 : Colors.black54);

    return ListTile(
      leading: Icon(icon, color: iconColor),
      title: Text(title, style: TextStyle(color: textColor, fontWeight: FontWeight.w500)),
      subtitle: subtitle != null ? Text(subtitle!, style: TextStyle(color: isDark ? Colors.blueAccent : Colors.blue)) : null,
      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
      onTap: onTap,
    );
  }
}
