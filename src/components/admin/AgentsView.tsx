'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bot, Play, RefreshCw, Search } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  type: 'llm' | 'custom' | 'integration';
  parameters: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

interface AgentFormData {
  name: string;
  type: 'llm' | 'custom' | 'integration';
  parameters: Record<string, unknown>;
  status: 'active' | 'inactive' | 'error';
}

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: 'GPT-4 Assistant',
      type: 'llm',
      parameters: {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        system_prompt: 'Você é um assistente útil e preciso.'
      },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Claude Assistant',
      type: 'llm',
      parameters: {
        model: 'claude-3',
        temperature: 0.5,
        max_tokens: 1500,
        system_prompt: 'Você é um assistente especializado em análise de dados.'
      },
      status: 'active',
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z'
    },
    {
      id: 3,
      name: 'Integration Bot',
      type: 'integration',
      parameters: {
        webhook_url: 'https://api.example.com/webhook',
        auth_token: '***hidden***',
        timeout: 30
      },
      status: 'inactive',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    type: 'llm',
    parameters: {},
    status: 'active',
  });

  const [pagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 3,
    lastPage: 1,
  });

  // Load agents (mock data for now)
  const loadAgents = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      if (editingAgent) {
        setUpdating(true);
        // Simulate API update
        setTimeout(() => {
          setAgents(prev => prev.map(agent => 
            agent.id === editingAgent.id 
              ? { ...agent, ...formData, updatedAt: new Date().toISOString() }
              : agent
          ));
          setUpdating(false);
          resetForm();
        }, 1000);
      } else {
        setCreating(true);
        // Simulate API create
        setTimeout(() => {
          const newAgent: Agent = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setAgents(prev => [...prev, newAgent]);
          setCreating(false);
          resetForm();
        }, 1000);
      }
    } catch (_error) {
      // Error handling
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      type: agent.type,
      parameters: agent.parameters,
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
      // Simulate API delete
      setTimeout(() => {
        setAgents(prev => prev.filter(a => a.id !== agent.id));
        setDeleting(null);
      }, 1000);
    } catch (_error) {
      setDeleting(null);
    }
  };

  const handleTest = async (agent: Agent) => {
    setTesting(agent.id);
    // Simulate API test
    setTimeout(() => {
      setTesting(null);
      alert(`Teste do agente "${agent.name}" executado com sucesso!`);
    }, 2000);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAgent(null);
    setFormData({
      name: '',
      type: 'llm',
      parameters: {},
      status: 'active',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'llm': return 'LLM';
      case 'custom': return 'Personalizado';
      case 'integration': return 'Integração';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'llm': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'custom': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'integration': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  // Helper functions for parameters management
  const addParameterField = () => {
    setFormData(prev => ({
      ...prev,
      parameters: { ...prev.parameters, '': '' }
    }));
  };

  const updateParameterField = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const newParameters = { ...prev.parameters };
      if (oldKey !== newKey) {
        delete newParameters[oldKey];
      }
      newParameters[newKey] = value;
      return { ...prev, parameters: newParameters };
    });
  };

  const removeParameterField = (key: string) => {
    setFormData(prev => {
      const newParameters = { ...prev.parameters };
      delete newParameters[key];
      return { ...prev, parameters: newParameters };
    });
  };

  // Filter agents based on search
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agentes</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure e gerencie agentes de IA</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadAgents}
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
            Novo Agente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Pesquisar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingAgent ? 'Editar Agente' : 'Novo Agente'}
            </h2>
            
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    disabled={creating || updating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'llm' | 'custom' | 'integration' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={creating || updating}
                  >
                    <option value="llm">LLM</option>
                    <option value="custom">Personalizado</option>
                    <option value="integration">Integração</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'error' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={creating || updating}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="error">Erro</option>
                </select>
              </div>

              {/* Parameters Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Parâmetros
                  </label>
                  <button
                    type="button"
                    onClick={addParameterField}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={creating || updating}
                  >
                    + Adicionar Parâmetro
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(formData.parameters).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Chave"
                        value={key}
                        onChange={(e) => updateParameterField(key, e.target.value, value as string)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={creating || updating}
                      />
                      <input
                        type="text"
                        placeholder="Valor"
                        value={value as string}
                        onChange={(e) => updateParameterField(key, key, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={creating || updating}
                      />
                      <button
                        type="button"
                        onClick={() => removeParameterField(key)}
                        className="px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        disabled={creating || updating}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={creating || updating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {(creating || updating) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {editingAgent ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando agentes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Agents Grid */}
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {agent.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}>
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
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(agent)}
                        disabled={deleting === agent.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        {deleting === agent.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Parameters */}
                  {Object.keys(agent.parameters).length > 0 && (
                    <div className="border-t dark:border-gray-600 pt-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parâmetros:</h4>
                      <div className="space-y-1">
                        {Object.entries(agent.parameters).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                              {typeof value === 'string' && value.includes('***') ? value : String(value)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(agent.parameters).length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{Object.keys(agent.parameters).length - 3} mais...
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
                {searchQuery ? 'Nenhum agente encontrado' : 'Nenhum agente'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? 'Tente ajustar o termo de busca.' 
                  : 'Comece criando o primeiro agente.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agente
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Página {pagination.currentPage} de {pagination.lastPage}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
