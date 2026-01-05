import React, { useState } from 'react';
import { X, Folder, FileText, Image as ImageIcon, Video, Music, HardDrive, ChevronRight, Search, Download, Trash2, Home } from 'lucide-react';

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_FILES = {
  root: [
    { id: 'docs', name: 'Documentos', type: 'folder', items: 3 },
    { id: 'imgs', name: 'Imágenes', type: 'folder', items: 12 },
    { id: 'vids', name: 'Videos', type: 'folder', items: 4 },
    { id: 'sys', name: 'Sistema', type: 'folder', items: 15 },
    { id: 'readme', name: 'LEEME.txt', type: 'file', size: '2 KB' },
  ],
  docs: [
    { id: 'd1', name: 'Proyecto_NEXA.pdf', type: 'file', size: '4.5 MB' },
    { id: 'd2', name: 'Notas_Reunion.txt', type: 'file', size: '12 KB' },
    { id: 'd3', name: 'Presupuesto_2026.xlsx', type: 'file', size: '1.2 MB' },
  ],
  imgs: [
    { id: 'i1', name: 'Logo_NEXA.png', type: 'file', size: '240 KB' },
    { id: 'i2', name: 'Screenshot_001.jpg', type: 'file', size: '1.8 MB' },
    { id: 'i3', name: 'Diseño_UI.png', type: 'file', size: '3.1 MB' },
  ],
  vids: [
    { id: 'v1', name: 'Demo_App.mp4', type: 'file', size: '450 MB' },
  ]
};

export default function FileManager({ isOpen, onClose }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCurrentFiles = () => {
    const currentFolderId = currentPath[currentPath.length - 1];
    // @ts-ignore
    return MOCK_FILES[currentFolderId] || [];
  };

  const handleNavigate = (folderId: string) => {
    // @ts-ignore
    if (MOCK_FILES[folderId]) {
      setCurrentPath([...currentPath, folderId]);
      setSelectedFile(null);
    }
  };

  const handleGoBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const getFileIcon = (name: string, type: string) => {
    if (type === 'folder') return <Folder className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />;
    if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon className="w-10 h-10 text-purple-400" />;
    if (name.endsWith('.mp4')) return <Video className="w-10 h-10 text-red-400" />;
    if (name.endsWith('.pdf')) return <FileText className="w-10 h-10 text-orange-400" />;
    return <FileText className="w-10 h-10 text-gray-400" />;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-slate-700 shadow-md">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Gestor de Archivos</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1e293b]/50 border-b border-slate-700">
        <button 
          onClick={handleGoBack}
          disabled={currentPath.length <= 1}
          className={`p-1.5 rounded-lg ${currentPath.length <= 1 ? 'text-gray-600' : 'hover:bg-white/10 text-white'}`}
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        
        <div className="flex-1 bg-black/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 text-gray-400">
          <Home className="w-4 h-4" />
          {currentPath.map((p, i) => (
             <React.Fragment key={p}>
               {i > 0 && <span>/</span>}
               <span className={i === currentPath.length - 1 ? 'text-white' : ''}>
                 {p === 'root' ? 'Inicio' : p}
               </span>
             </React.Fragment>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-black/20 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm w-48 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#1e293b]/30 border-r border-slate-700 p-2 hidden sm:flex flex-col gap-1">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400">
            <Home className="w-4 h-4" /> Inicio
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400">
            <Download className="w-4 h-4" /> Descargas
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400">
            <Trash2 className="w-4 h-4" /> Papelera
          </button>
          <div className="my-2 border-t border-white/10"></div>
          <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicaciones</div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400">
            <HardDrive className="w-4 h-4" /> Disco Local (C:)
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#0f172a]">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {getCurrentFiles().map((file: any) => (
              <div 
                key={file.id}
                onClick={() => file.type === 'folder' ? handleNavigate(file.id) : setSelectedFile(file.id)}
                onDoubleClick={() => file.type === 'folder' && handleNavigate(file.id)}
                className={`
                  group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer
                  ${selectedFile === file.id 
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
                    : 'bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b] hover:border-white/10'
                  }
                `}
              >
                <div className="transition-transform group-hover:scale-110 duration-200">
                  {getFileIcon(file.name, file.type)}
                </div>
                <div className="text-center w-full">
                  <p className="text-sm font-medium truncate w-full">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{file.size || `${file.items} items`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#1e293b] border-t border-slate-700 px-4 py-2 text-xs text-gray-400 flex justify-between">
        <span>{getCurrentFiles().length} elementos</span>
        <span>{selectedFile ? '1 elemento seleccionado' : ''}</span>
      </div>
    </div>
  );
}
