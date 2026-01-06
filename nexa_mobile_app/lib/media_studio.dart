import 'package:flutter/material.dart';
import 'video_message.dart';

class MediaStudio extends StatefulWidget {
  const MediaStudio({super.key});

  @override
  State<MediaStudio> createState() => _MediaStudioState();
}

class _MediaStudioState extends State<MediaStudio> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Image Gen State
  final _imagePromptController = TextEditingController();
  bool _isGeneratingImage = false;
  String? _generatedImageUrl;

  // Video Gen State
  final _videoPromptController = TextEditingController();
  bool _isGeneratingVideo = false;
  String? _generatedVideoUrl;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _imagePromptController.dispose();
    _videoPromptController.dispose();
    super.dispose();
  }

  // --- ACTIONS ---

  void _generateImage() {
    setState(() => _isGeneratingImage = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isGeneratingImage = false;
          // Placeholder random image
          _generatedImageUrl = "https://picsum.photos/400/300?random=${DateTime.now().millisecondsSinceEpoch}";
        });
      }
    });
  }

  void _generateVideo() {
    setState(() => _isGeneratingVideo = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isGeneratingVideo = false;
          // Sample video URL
          _generatedVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Column(
        children: [
          Container(
             color: Theme.of(context).cardColor,
             child: TabBar(
               controller: _tabController,
               labelColor: Theme.of(context).primaryColor,
               unselectedLabelColor: Colors.grey,
               indicatorColor: Theme.of(context).primaryColor,
               tabs: const [
                 Tab(icon: Icon(Icons.image), text: "Image Gen"),
                 Tab(icon: Icon(Icons.videocam), text: "Video Gen"),
               ],
             ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildImageTab(),
                _buildVideoTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageTab() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
           const Text("Generador de Imágenes", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
           const SizedBox(height: 10),
           TextField(
             controller: _imagePromptController,
             decoration: const InputDecoration(
               labelText: "Describe tu imagen...",
               border: OutlineInputBorder(),
               prefixIcon: Icon(Icons.brush),
             ),
             maxLines: 2,
           ),
           const SizedBox(height: 16),
           ElevatedButton.icon(
             icon: _isGeneratingImage 
               ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) 
               : const Icon(Icons.auto_awesome),
             label: Text(_isGeneratingImage ? "Generando..." : "Crear Imagen"),
             onPressed: _isGeneratingImage ? null : _generateImage,
             style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
           ),
           const SizedBox(height: 24),
           Expanded(
             child: Center(
               child: _generatedImageUrl == null
                 ? const Column(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       Icon(Icons.image_not_supported_outlined, size: 64, color: Colors.grey),
                       SizedBox(height: 10),
                       Text("Tu obra maestra aparecerá aquí", style: TextStyle(color: Colors.grey)),
                     ],
                   )
                 : ClipRRect(
                     borderRadius: BorderRadius.circular(16),
                     child: Image.network(_generatedImageUrl!, fit: BoxFit.cover),
                   ),
             ),
           ),
        ],
      ),
    );
  }

  Widget _buildVideoTab() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
           const Text("Generador de Video", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
           const SizedBox(height: 10),
           TextField(
             controller: _videoPromptController,
             decoration: const InputDecoration(
               labelText: "Guion o descripción del video...",
               border: OutlineInputBorder(),
               prefixIcon: Icon(Icons.movie_creation),
             ),
             maxLines: 2,
           ),
           const SizedBox(height: 16),
           ElevatedButton.icon(
             icon: _isGeneratingVideo
               ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) 
               : const Icon(Icons.videocam),
             label: Text(_isGeneratingVideo ? "Renderizando..." : "Generar Video"),
             onPressed: _isGeneratingVideo ? null : _generateVideo,
             style: ElevatedButton.styleFrom(
               padding: const EdgeInsets.symmetric(vertical: 16),
               backgroundColor: Colors.redAccent,
               foregroundColor: Colors.white,
             ),
           ),
           const SizedBox(height: 24),
           Expanded(
             child: Center(
                child: _generatedVideoUrl == null
                 ? const Column(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       Icon(Icons.video_library_outlined, size: 64, color: Colors.grey),
                       SizedBox(height: 10),
                       Text("Tu video aparecerá aquí", style: TextStyle(color: Colors.grey)),
                     ],
                   )
                 : VideoMessage(videoUrl: _generatedVideoUrl!), // Reusing your existing component
             ),
           ),
        ],
      ),
    );
  }
}
