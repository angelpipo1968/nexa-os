import { useState, useEffect } from 'react';

export function useUIState() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMatrix, setShowMatrix] = useState(true);
    const [isEvolved, setIsEvolved] = useState(false);
    const [uiScale, setUiScale] = useState(1);
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [activeAppParams, setActiveAppParams] = useState<any>(null);
    const [showConversations, setShowConversations] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [showAllApps, setShowAllApps] = useState(false);
    const [menuExpanded, setMenuExpanded] = useState(false);
    const [wallpaper, setWallpaper] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Notificación de Evolución y carga de estados locales
        const hasSeenEvolution = localStorage.getItem('nexa_evolution_seen_v2');
        if (localStorage.getItem('nexa_is_evolved') === 'true') {
            setIsEvolved(true);
        }
        const savedScale = localStorage.getItem('nexa_settings_uiscale');
        if (savedScale) setUiScale(parseFloat(savedScale));
    }, []);

    useEffect(() => { localStorage.setItem('nexa_settings_uiscale', uiScale.toString()); }, [uiScale]);
    useEffect(() => { localStorage.setItem('nexa_is_evolved', String(isEvolved)); }, [isEvolved]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleSettings = () => setShowSettings(!showSettings);

    return {
        sidebarOpen, setSidebarOpen, toggleSidebar,
        showSettings, setShowSettings, toggleSettings,
        showMatrix, setShowMatrix,
        isEvolved, setIsEvolved,
        uiScale, setUiScale,
        activeApp, setActiveApp,
        activeAppParams, setActiveAppParams,
        showConversations, setShowConversations,
        showUploadMenu, setShowUploadMenu,
        showAllApps, setShowAllApps,
        menuExpanded, setMenuExpanded,
        wallpaper, setWallpaper,
        mounted
    };
}
