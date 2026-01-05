import React from 'react';
import { APP_REGISTRY } from '../lib/appRegistry';
import { X } from 'lucide-react';

interface AppLauncherProps {
    appId: string | null;
    params?: any;
    onClose: () => void;
    onSwitchApp?: (appId: string, params?: any) => void;
    isOpen: boolean;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({
    appId,
    params,
    onClose,
    onSwitchApp,
    isOpen
}) => {
    if (!appId || !isOpen) return null;

    const appDef = APP_REGISTRY[appId];

    if (!appDef) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center">
                    <h2 className="text-xl text-red-500 mb-2">Error de Aplicación</h2>
                    <p className="text-gray-300">La aplicación &quot;{appId}&quot; no se encuentra en el registro.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const Component = appDef.component;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full h-full max-w-7xl max-h-[95vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header de la App (Opcional, si la app no tiene el suyo propio) */}
                {!params?.hideHeader && (
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex-1 w-full h-full overflow-hidden">
                    <Component
                        isOpen={true}
                        onClose={onClose}
                        onSwitchApp={onSwitchApp}
                        {...params}
                    />
                </div>
            </div>
        </div>
    );
};
