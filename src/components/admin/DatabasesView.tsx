'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Database, Wifi, WifiOff, AlertCircle, Search, X, TestTube } from 'lucide-react';
import { DatabaseConnection } from '@/types/admin';
import { databasesAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DatabaseFormData {
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error';
  metadata: Record<string, unknown>;
  [key: string]: unknown;
}

export default function DatabasesView() {
  const { hasRole } = useAuth();
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<DatabaseConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  
  // Flag to prevent multiple initial loads
  const [hasInitialized, setHasInitialized] = useState(false);
  const lastFetchSignatureRef = useRef<string>('');
  
  const [formData, setFormData] = useState<DatabaseFormData>({
    name: '',
    type: 'postgresql',
    connectionString: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    status: 'connected',
    metadata: {},
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  // Load databases from API
  const loadDatabases = useCallback(async (page = 1, search = '', type = 'all', status = 'all') => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: pagination.perPage };
      
      if (search) params.name = search;
      if (type !== 'all') params.type = type;
      if (status !== 'all') params.status = status;

      const signature = JSON.stringify(params);
      if (lastFetchSignatureRef.current === signature) {
        return;
      }
      lastFetchSignatureRef.current = signature;

      const response = await databasesAPI.getAll(params);
      
      if (response.success && response.data) {
        setDatabases(response.data as DatabaseConnection[]);
        if (response.meta) {
          setPagination({
            currentPage: response.meta.currentPage,
            perPage: response.meta.perPage,
            total: response.meta.total,
            lastPage: response.meta.lastPage,
          });
        }
      }
    } catch (error) {
      console.error('Error loading databases:', error);
      toast.error('Erro ao carregar bancos de dados');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage]);

  // Single useEffect to handle all changes
  useEffect(() => {
    if (!hasRole('admin')) return;
    
    if (!hasInitialized) {
      setHasInitialized(true);
      loadDatabases(1, '', 'all', 'all');
      return;
    }
    
    const timeoutId = setTimeout(() => {
      loadDatabases(1, searchQuery, typeFilter, statusFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [hasRole, hasInitialized, searchQuery, typeFilter, statusFilter, loadDatabases]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingDatabase) {
        setUpdating(true);
        const response = await databasesAPI.update(editingDatabase.id, formData);
        
        if (response.success) {
          setDatabases(prev => prev.map(db => 
            db.id === editingDatabase.id 
              ? { ...db, ...formData, updatedAt: new Date().toISOString() }
              : db
          ));
          toast.success('Banco de dados atualizado com sucesso');
          resetForm();
        }
      } else {
        setCreating(true);
        const response = await databasesAPI.create(formData);
        
        if (response.success && response.data) {
          const newDatabase = response.data as DatabaseConnection;
          setDatabases(prev => [...prev, newDatabase]);
          toast.success('Banco de dados criado com sucesso');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating/updating database:', error);
      toast.error('Erro ao salvar banco de dados');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (database: DatabaseConnection) => {
    setEditingDatabase(database);
    setFormData({
      name: database.name,
      type: database.type,
      connectionString: database.connectionString || '',
      host: database.host || '',
      port: database.port || 5432,
      database: database.database || '',
      username: database.username || '',
      status: database.status,
      metadata: database.metadata || {},
    });
    setShowForm(true);
  };

  const handleDelete = async (database: DatabaseConnection) => {
    if (!confirm(`Tem certeza que deseja excluir o banco de dados "${database.name}"?`)) {
      return;
    }

    try {
      setDeleting(database.id);
      const response = await databasesAPI.delete(database.id);
      
      if (response.success) {
        setDatabases(prev => prev.filter(db => db.id !== database.id));
        toast.success('Banco de dados excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting database:', error);
      toast.error('Erro ao excluir banco de dados');
    } finally {
      setDeleting(null);
    }
  };

  const handleTest = async (database: DatabaseConnection) => {
    try {
      setTesting(database.id);
      const response = await databasesAPI.test(database.id);
      
      if (response.success) {
        toast.success(`Conexão com ${database.name} testada com sucesso`);
      }
    } catch (error) {
      console.error('Error testing database:', error);
      toast.error('Erro ao testar conexão');
    } finally {
      setTesting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDatabase(null);
    setFormData({
      name: '',
      type: 'postgresql',
      connectionString: '',
      host: '',
      port: 5432,
      database: '',
      username: '',
      status: 'connected',
      metadata: {},
    });
  };

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
      case 'elasticsearch': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Helper functions for metadata management
  const addMetadataField = () => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, '': '' }
    }));
  };

  const updateMetadataField = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const removeMetadataField = (key: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return { ...prev, metadata: newMetadata };
    });
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-12">
        <Database className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Acesso Negado
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Você não tem permissão para acessar esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bancos de Dados</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie conexões com bancos de dados do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banco
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar bancos de dados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="redis">Redis</option>
          <option value="elasticsearch">Elasticsearch</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'connected' | 'disconnected' | 'error')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="connected">Conectados</option>
          <option value="disconnected">Desconectados</option>
          <option value="error">Com erro</option>
        </select>
      </div>

      {/* Databases List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
            Carregando bancos de dados...
          </div>
        </div>
      ) : databases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((database) => (
            <div key={database.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {database.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(database.type)}`}>
                        {getTypeLabel(database.type)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(database.status)}`}>
                        {getStatusIcon(database.status)}
                        <span className="ml-1">{getStatusLabel(database.status)}</span>
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
                      <TestTube className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(database)}
                    disabled={updating}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    title="Editar banco de dados"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(database)}
                    disabled={deleting === database.id}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Excluir banco de dados"
                  >
                    {deleting === database.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Connection Details */}
              {database.connectionString ? (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>String de Conexão:</strong> {database.connectionString}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  {database.host && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Host:</strong> {database.host}
                    </p>
                  )}
                  {database.port && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Porta:</strong> {database.port}
                    </p>
                  )}
                  {database.database && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Banco:</strong> {database.database}
                    </p>
                  )}
                  {database.username && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Usuário:</strong> {database.username}
                    </p>
                  )}
                </div>
              )}

              {/* Metadata */}
              {Object.keys(database.metadata || {}).length > 0 && (
                <div className="border-t dark:border-gray-600 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadados:</h4>
                  <div className="space-y-1">
                    {Object.entries(database.metadata || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(database.metadata || {}).length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{Object.keys(database.metadata || {}).length - 3} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Check */}
              {database.lastCheck && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Última verificação: {new Date(database.lastCheck).toLocaleDateString('pt-BR')}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Criado em {new Date(database.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Database className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'Nenhum banco de dados encontrado' : 'Nenhum banco de dados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando a primeira conexão com banco de dados.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
            {pagination.total} bancos de dados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadDatabases(pagination.currentPage - 1, searchQuery)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {pagination.currentPage} de {pagination.lastPage}
            </span>
            <button
              onClick={() => loadDatabases(pagination.currentPage + 1, searchQuery)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingDatabase ? 'Editar Banco de Dados' : 'Novo Banco de Dados'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="redis">Redis</option>
                      <option value="elasticsearch">Elasticsearch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    String de Conexão
                  </label>
                  <input
                    type="text"
                    value={formData.connectionString}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionString: e.target.value }))}
                    placeholder="postgresql://user:pass@localhost:5432/db"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ou preencha os campos individuais abaixo
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Host
                    </label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Porta
                    </label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Banco
                    </label>
                    <input
                      type="text"
                      value={formData.database}
                      onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="mydb"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Usuário
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'connected' | 'disconnected' | 'error' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="connected">Conectado</option>
                    <option value="disconnected">Desconectado</option>
                    <option value="error">Erro</option>
                  </select>
                </div>

                {/* Metadata Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Metadados
                    </label>
                    <button
                      type="button"
                      onClick={addMetadataField}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      + Adicionar campo
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.metadata).map(([key, value]) => (
                      <div key={key} className="flex space-x-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newMetadata = { ...formData.metadata };
                            delete newMetadata[key];
                            newMetadata[e.target.value] = value;
                            setFormData(prev => ({ ...prev, metadata: newMetadata }));
                          }}
                          placeholder="Chave"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) => updateMetadataField(key, e.target.value)}
                          placeholder="Valor"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeMetadataField(key)}
                          className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {creating || updating ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {updating ? 'Atualizando...' : 'Criando...'}
                      </div>
                    ) : (
                      editingDatabase ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
