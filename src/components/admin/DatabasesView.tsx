'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Database, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { DatabaseConnection } from '@/types/admin';

export default function DatabasesView() {
  const [databases] = useState<DatabaseConnection[]>([
    {
      id: 1,
      name: 'Main PostgreSQL',
      type: 'postgresql',
      host: 'db.example.com',
      port: 5432,
      database: 'main_db',
      username: 'admin',
      status: 'connected',
      lastCheck: '2024-01-15T10:30:00Z',
      metadata: { version: '14.2', ssl: true },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Analytics MongoDB',
      type: 'mongodb',
      host: 'analytics.example.com',
      port: 27017,
      database: 'analytics',
      username: 'analytics_user',
      status: 'connected',
      lastCheck: '2024-01-15T10:25:00Z',
      metadata: { cluster: 'analytics-cluster' },
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-15T10:25:00Z'
    },
    {
      id: 3,
      name: 'Cache Redis',
      type: 'redis',
      host: 'cache.example.com',
      port: 6379,
      database: '0',
      username: 'cache_user',
      status: 'error',
      lastCheck: '2024-01-15T09:00:00Z',
      metadata: { memory_usage: '2GB', max_memory: '4GB' },
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z'
    }
  ]);

  const [loading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<DatabaseConnection | null>(null);
  const [testing, setTesting] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'postgresql': return 'PostgreSQL';
      case 'mysql': return 'MySQL';
      case 'mongodb': return 'MongoDB';
      case 'redis': return 'Redis';
      case 'elasticsearch': return 'Elasticsearch';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'postgresql': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'mysql': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'mongodb': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'redis': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'elasticsearch': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleEdit = (database: DatabaseConnection) => {
    setEditingDatabase(database);
    setShowForm(true);
  };

  const handleDelete = async (database: DatabaseConnection) => {
    if (confirm(`Tem certeza que deseja excluir a conexão "${database.name}"?`)) {
      // Implementation for delete
      console.error('Deleting database:', database.id);
    }
  };

  const handleTest = async (database: DatabaseConnection) => {
    setTesting(database.id);
    // Simulate connection test
    setTimeout(() => {
      setTesting(null);
      alert(`Teste de conexão para "${database.name}" executado com sucesso!`);
    }, 2000);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDatabase(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bancos de Dados</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie conexões e monitore status dos bancos de dados</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.error('Refreshing databases')}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conexão
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando bancos de dados...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Databases Grid */}
          {databases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map((database) => (
                <div key={database.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {database.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(database.type)}`}>
                            {getTypeLabel(database.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleTest(database)}
                        disabled={testing === database.id}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                        title="Testar conexão"
                      >
                        {testing === database.id ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Wifi className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(database)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(database)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
                      {getStatusIcon(database.status)}
                      <span className="ml-1">{getStatusLabel(database.status)}</span>
                    </span>
                  </div>

                  {/* Connection Details */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Host:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{database.host}:{database.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Database:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{database.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">User:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{database.username}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {Object.keys(database.metadata).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadados:</h4>
                      <div className="space-y-1">
                        {Object.entries(database.metadata).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(database.metadata).length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{Object.keys(database.metadata).length - 2} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Check */}
                  <div className="border-t dark:border-gray-600 pt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Última verificação: {new Date(database.lastCheck).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma conexão</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando a primeira conexão de banco de dados.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conexão
              </button>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingDatabase ? 'Editar Conexão' : 'Nova Conexão'}
            </h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingDatabase?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    defaultValue={editingDatabase?.type || 'postgresql'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="redis">Redis</option>
                    <option value="elasticsearch">Elasticsearch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Host *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingDatabase?.host || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Porta *
                  </label>
                  <input
                    type="number"
                    defaultValue={editingDatabase?.port || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Database *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingDatabase?.database || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingDatabase?.username || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder={editingDatabase ? 'Deixe em branco para manter atual' : 'Digite a senha'}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingDatabase ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
