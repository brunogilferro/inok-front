'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatContainer from '@/components/chat/ChatContainer';
import AdminPanel from '@/components/admin/AdminPanel';
import I18nProvider from '@/components/I18nProvider';
import { MessageSquare, Settings } from 'lucide-react';

export default function MainPage() {
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <I18nProvider>
      <div className="h-screen">
        {/* View Toggle */}
        <div className="fixed top-4 right-4 z-50 flex space-x-2">
          <button
            onClick={() => setCurrentView('chat')}
            className={`p-3 rounded-lg shadow-lg transition-all ${
              currentView === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Interface de Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`p-3 rounded-lg shadow-lg transition-all ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title="Painel Administrativo"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {currentView === 'chat' ? <ChatContainer /> : <AdminPanel />}
      </div>
    </I18nProvider>
  );
}