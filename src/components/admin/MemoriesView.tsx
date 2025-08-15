'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Brain, Upload, Search, X, FileText, Database, Network } from 'lucide-react';
import { Memory } from '@/types/admin';
import { memoriesAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MemoryFormData {
  name: string;
  type: 'vector' | 'graph' | 'document' | 'rag';
  description: string;
  provider?: string;
  configuration: Record<string, unknown>;
  status: 'active' | 'inactive' | 'indexing';
  [key: string]: unknown;
}

interface ImportFormData {
  data: Array<{
    content: string;
    type: string;
  }>;
  [key: string]: unknown;
}

export default function MemoriesView() {
  const { hasRole } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [importing, setImporting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'vector' | 'graph' | 'document' | 'rag'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'indexing'>('all');
  
  const [formData, setFormData] = useState<MemoryFormData>({
    name: '',
    type: 'vector',
    description: '',
    provider: '',
    configuration: {},
    status: 'active',
  });

  const [importFormData, setImportFormData] = useState<ImportFormData>({
    data: [{ content: '', type: 'text' }]
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  const lastFetchSignatureRef = useRef<string>('');

  // Load memories from API
  const loadMemories = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: pagination.perPage };
      
      if (search) params.name = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const signature = JSON.stringify(params);
      if (lastFetchSignatureRef.current === signature) {
        return;
      }
      lastFetchSignatureRef.current = signature;

      const response = await memoriesAPI.getAll(params);
      
      if (response.success && response.data) {
        setMemories(response.data as Memory[]);
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
      console.error('Error loading memories:', error);
      toast.error('Erro ao carregar memórias');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage]);

  // Initial load
  useEffect(() => {
    if (hasRole('admin')) {
      loadMemories();
    }
  }, [hasRole, loadMemories]);

  // Handle filter changes
  useEffect(() => {
    if (!hasRole('admin')) return;
    loadMemories(1, searchQuery);
  }, [typeFilter, statusFilter, hasRole, loadMemories, searchQuery]);

  // Handle search
  useEffect(() => {
    if (!hasRole('admin')) return;
    
    const timeoutId = setTimeout(() => {
      loadMemories(1, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasRole, loadMemories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingMemory) {
        setUpdating(true);
        const response = await memoriesAPI.update(editingMemory.id, formData);
        
        if (response.success) {
          setMemories(prev => prev.map(memory => 
            memory.id === editingMemory.id 
              ? { ...memory, ...formData, updatedAt: new Date().toISOString() }
              : memory
          ));
          toast.success('Memória atualizada com sucesso');
          resetForm();
        }
      } else {
        setCreating(true);
        const response = await memoriesAPI.create(formData);
        
        if (response.success && response.data) {
          const newMemory = response.data as Memory;
          setMemories(prev => [...prev, newMemory]);
          toast.success('Memória criada com sucesso');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating/updating memory:', error);
      toast.error('Erro ao salvar memória');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      name: memory.name,
      type: memory.type,
      description: memory.description,
      provider: memory.provider || '',
      configuration: memory.configuration || {},
      status: memory.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (memory: Memory) => {
    if (!confirm(`Tem certeza que deseja excluir a memória "${memory.name}"?`)) {
      return;
    }

    try {
      setDeleting(memory.id);
      const response = await memoriesAPI.delete(memory.id);
      
      if (response.success) {
        setMemories(prev => prev.filter(m => m.id !== memory.id));
        toast.success('Memória excluída com sucesso');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Erro ao excluir memória');
    } finally {
      setDeleting(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMemory || importFormData.data.length === 0) {
      toast.error('Selecione uma memória e adicione pelo menos um documento');
      return;
    }

    try {
      setImporting(selectedMemory.id);
      const response = await memoriesAPI.import(selectedMemory.id, importFormData);
      
      if (response.success) {
        toast.success('Documentos importados com sucesso');
        setShowImportModal(false);
        setImportFormData({ data: [{ content: '', type: 'text' }] });
        setSelectedMemory(null);
        // Reload memories to update document count
        loadMemories();
      }
    } catch (error) {
      console.error('Error importing documents:', error);
      toast.error('Erro ao importar documentos');
    } finally {
      setImporting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMemory(null);
    setFormData({
      name: '',
      type: 'vector',
      description: '',
      provider: '',
      configuration: {},
      status: 'active',
    });
  };

  const addImportField = () => {
    setImportFormData(prev => ({
      ...prev,
      data: [...prev.data, { content: '', type: 'text' }]
    }));
  };

  const updateImportField = (index: number, field: 'content' | 'type', value: string) => {
    setImportFormData(prev => ({
      ...prev,
      data: prev.data.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeImportField = (index: number) => {
    setImportFormData(prev => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index)
    }));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vector': return 'Vector DB';
      case 'graph': return 'Grafo';
      case 'document': return 'Documentos';
      case 'rag': return 'RAG';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vector': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'graph': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'document': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rag': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'indexing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'indexing': return 'Indexando';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vector': return <Database className="w-4 h-4" />;
      case 'graph': return <Network className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'rag': return <Brain className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  // Helper functions for configuration management
  const addConfigurationField = () => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, '': '' }
    }));
  };

  const updateConfigurationField = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [key]: value }
    }));
  };

  const removeConfigurationField = (key: string) => {
    setFormData(prev => {
      const newConfiguration = { ...prev.configuration };
      delete newConfiguration[key];
      return { ...prev, configuration: newConfiguration };
    });
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-12">
        <Brain className="mx-auto h-12 w-12 text-gray-400" />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Memórias</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie sistemas de memória e conhecimento do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Memória
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar memórias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'vector' | 'graph' | 'document' | 'rag')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          <option value="vector">Vector DB</option>
          <option value="graph">Grafo</option>
          <option value="document">Documentos</option>
          <option value="rag">RAG</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'indexing')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="indexing">Indexando</option>
        </select>
      </div>

      {/* Memories List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
            Carregando memórias...
          </div>
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      {getTypeIcon(memory.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {memory.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                        {getTypeIcon(memory.type)}
                        <span className="ml-1">{getTypeLabel(memory.type)}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(memory.status)}`}>
                        {getStatusLabel(memory.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedMemory(memory);
                      setShowImportModal(true);
                    }}
                    disabled={importing === memory.id}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                    title="Importar documentos"
                  >
                    {importing === memory.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(memory)}
                    disabled={updating}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    title="Editar memória"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(memory)}
                    disabled={deleting === memory.id}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Excluir memória"
                  >
                    {deleting === memory.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              {memory.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {memory.description}
                </p>
              )}

              {/* Provider */}
              {memory.provider && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Provedor:</strong> {memory.provider}
                  </p>
                </div>
              )}

              {/* Configuration */}
              {Object.keys(memory.configuration || {}).length > 0 && (
                <div className="border-t dark:border-gray-600 pt-3 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configuração:</h4>
                  <div className="space-y-1">
                    {Object.entries(memory.configuration || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(memory.configuration || {}).length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{Object.keys(memory.configuration || {}).length - 3} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="border-t dark:border-gray-600 pt-3">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Documentos: {memory.documentsCount}</span>
                  {memory.lastIndexed && (
                    <span>Última indexação: {new Date(memory.lastIndexed).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Criado em {new Date(memory.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'Nenhuma memória encontrada' : 'Nenhuma memória'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando a primeira memória do sistema.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
            {pagination.total} memórias
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadMemories(pagination.currentPage - 1, searchQuery)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {pagination.currentPage} de {pagination.lastPage}
            </span>
            <button
              onClick={() => loadMemories(pagination.currentPage + 1, searchQuery)}
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
                  {editingMemory ? 'Editar Memória' : 'Nova Memória'}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'vector' | 'graph' | 'document' | 'rag' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="vector">Vector DB</option>
                      <option value="graph">Grafo</option>
                      <option value="document">Documentos</option>
                      <option value="rag">RAG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provedor
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="Ex: Pinecone, Neo4j, OpenSearch"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'indexing' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="indexing">Indexando</option>
                  </select>
                </div>

                {/* Configuration Fields */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Configuração
                    </label>
                    <button
                      type="button"
                      onClick={addConfigurationField}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      + Adicionar campo
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.configuration).map(([key, value]) => (
                      <div key={key} className="flex space-x-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newConfiguration = { ...formData.configuration };
                            delete newConfiguration[key];
                            newConfiguration[e.target.value] = value;
                            setFormData(prev => ({ ...prev, configuration: newConfiguration }));
                          }}
                          placeholder="Chave"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={String(value)}
                          onChange={(e) => updateConfigurationField(key, e.target.value)}
                          placeholder="Valor"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeConfigurationField(key)}
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
                      editingMemory ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Importar Documentos para {selectedMemory?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedMemory(null);
                    setImportFormData({ data: [{ content: '', type: 'text' }] });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Documentos
                    </label>
                    <button
                      type="button"
                      onClick={addImportField}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      + Adicionar documento
                    </button>
                  </div>
                  <div className="space-y-3">
                    {importFormData.data.map((doc, index) => (
                      <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-md p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Conteúdo *
                            </label>
                            <textarea
                              value={doc.content}
                              onChange={(e) => updateImportField(index, 'content', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tipo
                            </label>
                            <input
                              type="text"
                              value={doc.type}
                              onChange={(e) => updateImportField(index, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        {importFormData.data.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImportField(index)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remover documento
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedMemory(null);
                      setImportFormData({ data: [{ content: '', type: 'text' }] });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={importing === selectedMemory?.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {importing === selectedMemory?.id ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Importando...
                      </div>
                    ) : (
                      'Importar Documentos'
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
