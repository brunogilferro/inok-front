'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Bot, Play, Search, X } from 'lucide-react';
import { Agent } from '@/types/admin';
import { agentsAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

interface AgentFormData {
  name: string;
  type: 'agent';
  description: string;
  avatar?: string;
  metadata: Record<string, unknown>;
  status: 'active' | 'inactive' | 'training';
  [key: string]: unknown;
}

export default function AgentsView() {
  const { hasRole } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'agent'>('all');
  
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    type: 'agent',
    description: '',
    avatar: '',
    metadata: {},
    status: 'active',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  // Load agents from API
  const loadAgents = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: pagination.perPage };
      
      if (search) params.name = search;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await agentsAPI.getAll(params);
      
      if (response.success && response.data) {
        setAgents(response.data as Agent[]);
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
      console.error('Error loading agents:', error);
      toast.error('Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage, typeFilter]);

  // Initial load
  useEffect(() => {
    if (hasRole('admin')) {
      loadAgents();
    }
  }, [hasRole, loadAgents]);

  // Handle search
  useEffect(() => {
    if (!hasRole('admin')) return;
    
    const timeoutId = setTimeout(() => {
      loadAgents(1, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasRole, loadAgents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingAgent) {
        setUpdating(true);
        const response = await agentsAPI.update(editingAgent.id, formData);
        
        if (response.success) {
          setAgents(prev => prev.map(agent => 
            agent.id === editingAgent.id 
              ? { ...agent, ...formData, updatedAt: new Date().toISOString() }
              : agent
          ));
          toast.success('Agente atualizado com sucesso');
          resetForm();
        }
      } else {
        setCreating(true);
        const response = await agentsAPI.create(formData);
        
        if (response.success && response.data) {
          const newAgent = response.data as Agent;
          setAgents(prev => [...prev, newAgent]);
          toast.success('Agente criado com sucesso');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating/updating agent:', error);
      toast.error('Erro ao salvar agente');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      type: agent.type,
      description: agent.description,
      avatar: agent.avatar || '',
      metadata: agent.metadata || {},
      status: agent.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Tem certeza que deseja excluir o agente "${agent.name}"?`)) {
      return;
    }

    try {
      setDeleting(agent.id);
      const response = await agentsAPI.delete(agent.id);
      
      if (response.success) {
        setAgents(prev => prev.filter(a => a.id !== agent.id));
        toast.success('Agente excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Erro ao excluir agente');
    } finally {
      setDeleting(null);
    }
  };

  const handleTest = async (agent: Agent) => {
    try {
      setTesting(agent.id);
      const response = await agentsAPI.test(agent.id);
      
      if (response.success) {
        toast.success(`Agente "${agent.name}" testado com sucesso`);
      }
    } catch (error) {
      console.error('Error testing agent:', error);
      toast.error('Erro ao testar agente');
    } finally {
      setTesting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAgent(null);
    setFormData({
      name: '',
      type: 'agent',
      description: '',
      avatar: '',
      metadata: {},
      status: 'active',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agent': return 'Agente IA';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'training': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'training': return 'Treinando';
      default: return status;
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
        <Bot className="mx-auto h-12 w-12 text-gray-400" />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agentes IA</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os agentes de inteligência artificial do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'agent')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          <option value="agent">Agentes IA</option>
        </select>
      </div>

      {/* Agents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
            Carregando agentes...
          </div>
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {agent.avatar ? (
                      <Image
                        src={agent.avatar}
                        alt={agent.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}>
                        <Bot className="w-3 h-3 mr-1" />
                        {getTypeLabel(agent.type)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {getStatusLabel(agent.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleTest(agent)}
                    disabled={testing === agent.id}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                    title="Testar agente"
                  >
                    {testing === agent.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(agent)}
                    disabled={updating}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    title="Editar agente"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent)}
                    disabled={deleting === agent.id}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Excluir agente"
                  >
                    {deleting === agent.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              {agent.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {agent.description}
                </p>
              )}

              {/* Metadata */}
              {Object.keys(agent.metadata || {}).length > 0 && (
                <div className="border-t dark:border-gray-600 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadados:</h4>
                  <div className="space-y-1">
                    {Object.entries(agent.metadata || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                    {Object.keys(agent.metadata || {}).length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{Object.keys(agent.metadata || {}).length - 3} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Criado em {new Date(agent.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery || typeFilter !== 'all' ? 'Nenhum agente encontrado' : 'Nenhum agente'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || typeFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando o primeiro agente IA.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
            {pagination.total} agentes
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadAgents(pagination.currentPage - 1, searchQuery)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {pagination.currentPage} de {pagination.lastPage}
            </span>
            <button
              onClick={() => loadAgents(pagination.currentPage + 1, searchQuery)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {editingAgent ? 'Editar Agente' : 'Novo Agente'}
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
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'training' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="training">Treinando</option>
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
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://exemplo.com/avatar.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      editingAgent ? 'Atualizar' : 'Criar'
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
