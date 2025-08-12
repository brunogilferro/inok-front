'use client';

import { useState } from 'react';
import ChatContainer from '@/components/chat/ChatContainer';
import AdminPanel from '@/components/admin/AdminPanel';
import I18nProvider from '@/components/I18nProvider';
import { MessageSquare, Settings } from 'lucide-react';

export default function MainPage() {
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');

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
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Chat Interface"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`p-3 rounded-lg shadow-lg transition-all ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Admin Panel"
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