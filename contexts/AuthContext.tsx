'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/auth-service';
import { db } from '../lib/database-service';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userName: string;
  setUserName: (name: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  handleLogout: () => Promise<void>;
  signIn: typeof auth.signIn;
  signUp: typeof auth.signUp;
  signOut: typeof auth.signOut;
  signInWithGoogle: typeof auth.signInWithGoogle;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userName: 'Invitado',
  setUserName: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
  authMode: 'login',
  setAuthMode: () => {},
  apiKey: '',
  setApiKey: () => {},
  handleLogout: async () => {},
  signIn: async () => ({ data: { user: null, session: null }, error: null } as any),
  signUp: async () => ({ data: { user: null, session: null }, error: null } as any),
  signOut: async () => ({ error: null }),
  signInWithGoogle: async () => ({ data: { provider: 'google', url: '' }, error: null } as any),
} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Invitado');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [apiKey, setApiKey] = useState('');

  // Handle User Session Logic (merged from useAuth hook)
  const handleUserSession = async (currentUser: User) => {
    setUser(currentUser);
    // Try to get profile
    try {
        const profile = await db.getUserProfile(currentUser.id);
        
        if (profile) {
            setUserName(profile.name);
            if (profile.preferences?.apiKey) {
                setApiKey(profile.preferences.apiKey);
            }
        } else {
            // If no profile exists but we have a user (e.g. first login), create it
            // We use metadata from the user object if available
            const name = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Usuario';
            const email = currentUser.email || '';
            const newProfile = await db.createUserProfile(currentUser.id, name, email);
            if (newProfile) {
                setUserName(newProfile.name);
            }
        }
    } catch (e) {
        console.error("Error fetching profile", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
        try {
            const { session } = await auth.getSession();
            if (session?.user) {
                handleUserSession(session.user);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error("Auth init error", e);
            setLoading(false);
        }
    };

    initAuth();

    // Listen for changes
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            handleUserSession(session.user);
        } else {
            setUser(null);
            setUserName('Invitado');
            // Don't clear API Key if it's local
            // setApiKey(''); 
            setLoading(false);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // API Key persistence
  useEffect(() => {
    const savedApiKey = localStorage.getItem('nexa_settings_apikey') || process.env.NEXT_PUBLIC_NEXA_API_KEY || '';
    if (savedApiKey && !apiKey) setApiKey(savedApiKey);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem('nexa_settings_apikey', apiKey);
  }, [apiKey]);

  const saveApiKey = async (key: string) => {
    setApiKey(key);
    localStorage.setItem('nexa_settings_apikey', key);
    if (user) {
        await db.updateUserPreferences(user.id, { apiKey: key });
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const value = {
    user,
    loading,
    userName,
    setUserName,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    apiKey,
    setApiKey: saveApiKey,
    handleLogout,
    signIn: auth.signIn.bind(auth),
    signUp: auth.signUp.bind(auth),
    signOut: auth.signOut.bind(auth),
    signInWithGoogle: auth.signInWithGoogle.bind(auth),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
