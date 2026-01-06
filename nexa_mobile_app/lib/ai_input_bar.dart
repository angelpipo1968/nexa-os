import 'package:flutter/material.dart';

class AiInputBar extends StatefulWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onMic;
  final VoidCallback onStop;
  final VoidCallback? onVideoUpload; // Callback para subir video
  
  // Customization Properties
  final String hintText;
  final bool showTools;
  final bool showSuggestions;
  final Color? accentColor;

  const AiInputBar({
    super.key,
    required this.controller,
    required this.onSend,
    required this.onMic,
    required this.onStop,
    this.onVideoUpload,
    this.hintText = "How can I help you today?",
    this.showTools = true,
    this.showSuggestions = true,
    this.accentColor,
  });

  @override
  State<AiInputBar> createState() => _AiInputBarState();
}

class _AiInputBarState extends State<AiInputBar> {
  // Datos de las sugerencias para poder reordenarlas
  String? _selectedApp; // Para rastrear la aplicación seleccionada
  final List<Map<String, dynamic>> _suggestionData = [
    {'label': "Image Edit", 'icon': Icons.brush_outlined},
    {'label': "Web Dev", 'icon': Icons.code},
    {'label': "Learn", 'icon': Icons.school_outlined},
    {'label': "Deep Research", 'icon': Icons.science_outlined},
    {'label': "Image Gen", 'icon': Icons.image_outlined},
    {'label': "Video Gen", 'icon': Icons.videocam_outlined},
    {'label': "Artifacts", 'icon': Icons.article_outlined},
    {'label': "Travel", 'icon': Icons.flight_outlined},
    {'label': "Analyze", 'icon': Icons.analytics_outlined},
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth > 600;
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final Color cardColor = isDark ? const Color(0xFF2A2A2E) : const Color(0xFFF2F2F7);
        final Color textColor = isDark ? Colors.white : Colors.black87;
        final Color iconColor = isDark ? Colors.white70 : Colors.black54;
        final Color activeColor = widget.accentColor ?? (isDark ? const Color(0xFF3C82F6) : const Color(0xFF2563EB));

        // Construir la lista de sugerencias con desplazamiento horizontal
        Widget buildSuggestionList() {
          return ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            itemCount: _suggestionData.length,
            itemBuilder: (context, index) {
              final data = _suggestionData[index];
              final isSelected = _selectedApp == data['label'];
              return Container(
                margin: const EdgeInsets.only(right: 8), // Margen para separar chips
                child: _SuggestionChip(
                  label: data['label'],
                  icon: data['icon'],
                  isDark: isDark,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      if (_selectedApp == data['label']) {
                        _selectedApp = null; // Deseleccionar si ya estaba seleccionado
                      } else {
                        _selectedApp = data['label'];
                        // Opcional: Actualizar el hintText o notificar al padre
                        print("Selected app: ${data['label']}");
                      }
                    });
                  },
                ),
              );
            },
          );
        }

        return SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: isDesktop ? 900 : double.infinity),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: isDesktop ? CrossAxisAlignment.start : CrossAxisAlignment.center,
                children: [
                  // 1. SUGGESTIONS (MÓVIL: ARRIBA)
                  if (widget.showSuggestions && !isDesktop)
                    Container(
                      height: 50, // Altura aumentada para permitir arrastre cómodo
                      margin: const EdgeInsets.only(bottom: 8),
                      child: buildSuggestionList(),
                    ),

                  // 2. INPUT AREA (Tarjeta grande)
                  Container(
                    margin: EdgeInsets.symmetric(
                      horizontal: isDesktop ? 16 : 8, 
                      vertical: isDesktop ? 8 : 4
                    ),
                    padding: EdgeInsets.all(isDesktop ? 16 : 10),
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? Colors.white10 : Colors.black12,
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // TextField
                        TextField(
                          controller: widget.controller,
                          minLines: 1,
                          maxLines: 5,
                          style: TextStyle(color: textColor, fontSize: 16),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: widget.hintText,
                            hintStyle: TextStyle(color: isDark ? Colors.white38 : Colors.black38),
                            contentPadding: EdgeInsets.zero,
                            isDense: true,
                          ),
                        ),
                        
                        if (widget.showTools) ...[
                          SizedBox(height: isDesktop ? 0 : 8), // Espacio mínimo en móvil
                          // Tools Row with Fixed Right Actions
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              // Scrollable Tools (Left)
                              Expanded(
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: Row(
                                    children: [
                                      // Plus Button (Left)
                                      _CircleIconButton(
                                        icon: Icons.add,
                                        color: isDark ? Colors.white12 : Colors.black12,
                                        iconColor: iconColor,
                                        onTap: () => _showAttachmentMenu(context, isDark),
                                      ),
                                      const SizedBox(width: 8),
                                      
                                      // Tool Chips
                                      _ToolChip(label: "Thinking", icon: Icons.psychology_outlined, isDark: isDark),
                                      const SizedBox(width: 8),
                                      _ToolChip(label: "Search", icon: Icons.language, isDark: isDark),
                                      const SizedBox(width: 8),
                                      _ToolChip(label: "MCP", icon: Icons.extension_outlined, isDark: isDark),
                                    ],
                                  ),
                                ),
                              ),
                              
                              const SizedBox(width: 8),
                              
                              // Right Side Actions (Mic + Send)
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Mic Button
                                  GestureDetector(
                                    onTap: widget.onMic,
                                    child: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(Icons.mic, color: iconColor, size: 20),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  // Send Button (Blue Arrow)
                                  GestureDetector(
                                    onTap: widget.onSend,
                                    child: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: activeColor,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.arrow_upward, color: Colors.white, size: 20),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  // 3. SUGGESTIONS (PC: ABAJO)
                  if (widget.showSuggestions && isDesktop)
                    Container(
                      height: 50,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      child: buildSuggestionList(),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showAttachmentMenu(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.black12,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _AttachmentOption(
                  icon: Icons.audio_file,
                  label: "Audio",
                  color: Colors.orange,
                  isDark: isDark,
                  onTap: () {},
                ),
                _AttachmentOption(
                  icon: Icons.videocam,
                  label: "Video",
                  color: Colors.pink,
                  isDark: isDark,
                  onTap: () {
                    Navigator.pop(context); // Cerrar menú
                    widget.onVideoUpload?.call(); // Llamar callback
                  },
                ),
                _AttachmentOption(
                  icon: Icons.image,
                  label: "Imagen",
                  color: Colors.purple,
                  isDark: isDark,
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _AttachmentOption(
                  icon: Icons.insert_drive_file,
                  label: "Archivos",
                  color: Colors.blue,
                  isDark: isDark,
                  onTap: () {},
                ),
                const SizedBox(width: 40), // Space between items
                _AttachmentOption(
                  icon: Icons.camera_alt,
                  label: "Cámara",
                  color: Colors.green,
                  isDark: isDark,
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _AttachmentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _AttachmentOption({
    required this.icon,
    required this.label,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}

class _ToolChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isDark;

  const _ToolChip({required this.label, required this.icon, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white12 : Colors.black12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: isDark ? Colors.white70 : Colors.black87),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isDark;
  final bool isSelected;
  final VoidCallback? onTap;

  const _SuggestionChip({
    required this.label,
    required this.icon,
    required this.isDark,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final selectedColor = isDark ? Colors.blueAccent.withOpacity(0.3) : Colors.blue.shade100;
    final selectedBorderColor = isDark ? Colors.blueAccent : Colors.blue;
    final defaultColor = isDark ? const Color(0xFF1A1A1E) : Colors.white;

    // Nota: El margin se ha movido al Container padre en ReorderableListView
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? selectedColor : defaultColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected 
                ? selectedBorderColor 
                : (isDark ? Colors.white12 : Colors.black12),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: [
            if (!isDark && !isSelected)
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 2,
                offset: const Offset(0, 1),
              ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon, 
              size: 16, 
              color: isSelected 
                  ? (isDark ? Colors.white : Colors.blue.shade900)
                  : (isDark ? Colors.blueAccent.shade100 : Colors.blue.shade700),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? (isDark ? Colors.white : Colors.blue.shade900)
                    : (isDark ? Colors.white70 : Colors.black87),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color iconColor;
  final VoidCallback onTap;

  const _CircleIconButton({required this.icon, required this.color, required this.iconColor, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: 18),
      ),
    );
  }
}