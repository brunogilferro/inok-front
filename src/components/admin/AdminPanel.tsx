'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  Database, 
  Brain, 
  GitBranch,
  Settings,
  Menu,
  X
} from 'lucide-react';
import IdentitiesView from './IdentitiesView';
import ConversationsView from './ConversationsView';
import AgentsView from './AgentsView';
import DatabasesView from './DatabasesView';
import MemoriesView from './MemoriesView';
import DataFlowsView from './DataFlowsView';

type ViewType = 'identities' | 'conversations' | 'agents' | 'databases' | 'memories' | 'flows';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>('identities');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { id: 'identities', label: 'Identidades', icon: Users, description: 'Gestão de agentes, humanos e AIs' },
    { id: 'conversations', label: 'Conversas', icon: MessageSquare, description: 'Logs, transcrições e resumos' },
    { id: 'agents', label: 'Agentes', icon: Bot, description: 'Configuração de parâmetros dos agentes' },
    { id: 'databases', label: 'Bancos de Dados', icon: Database, description: 'Conexões e status dos bancos' },
    { id: 'memories', label: 'Memórias', icon: Brain, description: 'Gestão de RAGs e bases de conhecimento' },
    { id: 'flows', label: 'Fluxos de Dados', icon: GitBranch, description: 'Configuração de fluxos e integrações' },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'identities':
        return <IdentitiesView />;
      case 'conversations':
        return <ConversationsView />;
      case 'agents':
        return <AgentsView />;
      case 'databases':
        return <DatabasesView />;
      case 'memories':
        return <MemoriesView />;
      case 'flows':
        return <DataFlowsView />;
      default:
        return <IdentitiesView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">INOK Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigationItems.find(item => item.id === currentView)?.label}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6">
          {renderCurrentView()}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
