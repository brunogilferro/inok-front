'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Database, Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Database as DatabaseType } from '@/types/admin';

export default function DatabasesView() {
  const [databases, setDatabases] = useState<DatabaseType[]>([
    {
      id: '1',
      name: 'PostgreSQL Principal',
      type: 'postgresql',
      connectionString: 'postgresql://user:pass@localhost:5432/main_db',
      status: 'connected',
      lastSync: new Date('2024-01-15T10:30:00'),
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'MongoDB Analytics',
      type: 'mongodb',
      connectionString: 'mongodb://localhost:27017/analytics',
      status: 'connected',
      lastSync: new Date('2024-01-15T09:15:00'),
      createdAt: new Date('2024-01-05'),
    },
    {
      id: '3',
      name: 'Redis Cache',
      type: 'redis',
      connectionString: 'redis://localhost:6379',
      status: 'error',
      lastSync: new Date('2024-01-14T16:45:00'),
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '4',
      name: 'Vector Database',
      type: 'vector',
      connectionString: 'http://localhost:6333',
      status: 'disconnected',
      lastSync: new Date('2024-01-13T14:20:00'),
      createdAt: new Date('2024-01-12'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<DatabaseType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as const,
    connectionString: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDatabase) {
      setDatabases(prev => prev.map(db => 
        db.id === editingDatabase.id 
          ? { ...db, ...formData, updatedAt: new Date() }
          : db
      ));
    } else {
      const newDatabase: DatabaseType = {
        id: Date.now().toString(),
        ...formData,
        status: 'disconnected',
        lastSync: new Date(),
        createdAt: new Date(),
      };
      setDatabases(prev => [...prev, newDatabase]);
    }
    
    setShowForm(false);
    setEditingDatabase(null);
    setFormData({ name: '', type: 'postgresql', connectionString: '' });
  };

  const handleEdit = (database: DatabaseType) => {
    setEditingDatabase(database);
    setFormData({
      name: database.name,
      type: database.type,
      connectionString: database.connectionString,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banco de dados?')) {
      setDatabases(prev => prev.filter(db => db.id !== id));
    }
  };

  const testConnection = (id: string) => {
    // Simular teste de conexão
    setDatabases(prev => prev.map(db => 
      db.id === id 
        ? { ...db, status: 'connected', lastSync: new Date() }
        : db
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'postgresql':
        return 'PostgreSQL';
      case 'mongodb':
        return 'MongoDB';
      case 'mysql':
        return 'MySQL';
      case 'redis':
        return 'Redis';
      case 'vector':
        return 'Vector DB';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'postgresql':
        return 'bg-blue-100 text-blue-800';
      case 'mongodb':
        return 'bg-green-100 text-green-800';
      case 'mysql':
        return 'bg-orange-100 text-orange-800';
      case 'redis':
        return 'bg-red-100 text-red-800';
      case 'vector':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskConnectionString = (connectionString: string) => {
    try {
      const url = new URL(connectionString);
      if (url.password) {
        url.password = '***';
      }
      return url.toString();
    } catch {
      // Se não for uma URL válida, mascarar senhas de outras formas
      return connectionString.replace(/:([^@]+)@/g, ':***@');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bancos de Dados</h1>
          <p className="text-gray-600">Gerencie conexões e status dos bancos de dados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conexão
        </button>
      </div>

      {/* Databases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((database) => (
          <div
            key={database.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{database.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(database.type)}`}>
                      {getTypeLabel(database.type)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(database.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(database.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => testConnection(database.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                  title="Testar Conexão"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(database)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(database.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">String de Conexão</h4>
              <div className="bg-gray-50 rounded p-3">
                <code className="text-xs text-gray-600 break-all">
                  {maskConnectionString(database.connectionString)}
                </code>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última sincronização:</span>
                <span className="text-gray-900">
                  {database.lastSync.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Criado em {database.createdAt.toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingDatabase ? 'Editar Banco de Dados' : 'Nova Conexão'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Banco Principal"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="mysql">MySQL</option>
                  <option value="redis">Redis</option>
                  <option value="vector">Vector Database</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  String de Conexão
                </label>
                <input
                  type="text"
                  value={formData.connectionString}
                  onChange={(e) => setFormData(prev => ({ ...prev, connectionString: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="postgresql://user:pass@localhost:5432/db"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inclua credenciais se necessário
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDatabase(null);
                    setFormData({ name: '', type: 'postgresql', connectionString: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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

      {databases.length === 0 && (
        <div className="text-center py-12">
          <Database className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum banco de dados</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira conexão.</p>
        </div>
      )}
    </div>
  );
}
