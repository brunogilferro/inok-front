'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  Database, 
  Brain, 
  GitBranch,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Shield,
  UserCog
} from 'lucide-react';
import IdentitiesView from './IdentitiesView';
import ConversationsView from './ConversationsView';
import AgentsView from './AgentsView';
import DatabasesView from './DatabasesView';
import MemoriesView from './MemoriesView';
import DataFlowsView from './DataFlowsView';
import UsersView from './UsersView';
import ThemeToggle from '../chat/ThemeToggle';

type ViewType = 'identities' | 'conversations' | 'agents' | 'databases' | 'memories' | 'flows' | 'users';

export function AdminPanel() {
  const { user, logout, hasRole } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('identities');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Calculate admin role once to prevent re-renders
  const isAdmin = hasRole('admin');

  const navigationItems = useMemo(() => [
    { id: 'identities', label: 'Identidades', icon: Users, description: 'Gestão de agentes, humanos e AIs' },
    { id: 'conversations', label: 'Conversas', icon: MessageSquare, description: 'Logs, transcrições e resumos' },
    { id: 'agents', label: 'Agentes', icon: Bot, description: 'Configuração de parâmetros dos agentes' },
    { id: 'databases', label: 'Bancos de Dados', icon: Database, description: 'Conexões e status dos bancos' },
    { id: 'memories', label: 'Memórias', icon: Brain, description: 'Gestão de RAGs e bases de conhecimento' },
    { id: 'flows', label: 'Fluxos de Dados', icon: GitBranch, description: 'Configuração de fluxos e integrações' },
    ...(isAdmin ? [{ id: 'users', label: 'Usuários', icon: UserCog, description: 'Gestão de usuários do sistema' }] : []),
  ], [isAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

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
      case 'users':
        return isAdmin ? <UsersView /> : <IdentitiesView />;
      default:
        return <IdentitiesView />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'user': return 'Usuário';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">INOK Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
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
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.id === currentView)?.label}
              </h2>
            </div>
            
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden md:block text-gray-700 dark:text-gray-200">{user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user?.role || '')}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {getRoleLabel(user?.role || '')}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
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

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminPanel;
