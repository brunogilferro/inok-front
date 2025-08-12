'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Bot, Settings, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react';
import { Agent } from '@/types/admin';

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'GPT-4 Assistant',
      type: 'llm',
      parameters: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'Você é um assistente útil e amigável.',
      },
      status: 'active',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Claude-3 Sonnet',
      type: 'llm',
      parameters: {
        model: 'claude-3-sonnet',
        temperature: 0.5,
        maxTokens: 2000,
        systemPrompt: 'Você é um assistente especializado em análise de dados.',
      },
      status: 'active',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
    {
      id: '3',
      name: 'Data Processor',
      type: 'custom',
      parameters: {
        batchSize: 100,
        timeout: 30000,
        retryAttempts: 3,
      },
      status: 'inactive',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'llm' as const,
    parameters: {} as Record<string, any>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAgent) {
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent.id 
          ? { ...agent, ...formData, updatedAt: new Date() }
          : agent
      ));
    } else {
      const newAgent: Agent = {
        id: Date.now().toString(),
        ...formData,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAgents(prev => [...prev, newAgent]);
    }
    
    setShowForm(false);
    setEditingAgent(null);
    setFormData({ name: '', type: 'llm', parameters: {} });
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      type: agent.type,
      parameters: agent.parameters,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
      setAgents(prev => prev.filter(agent => agent.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active', updatedAt: new Date() }
        : agent
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'llm':
        return 'LLM';
      case 'custom':
        return 'Customizado';
      case 'integration':
        return 'Integração';
      default:
        return type;
    }
  };

  const renderParameters = (parameters: Record<string, any>) => {
    return Object.entries(parameters).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="font-medium text-gray-700">{key}:</span>
        <span className="text-gray-600 ml-1">
          {typeof value === 'string' ? value : JSON.stringify(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
          <p className="text-gray-600">Configure parâmetros e gerencie os agentes do sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Agente
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{getTypeLabel(agent.type)}</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(agent.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(agent.id)}
                  className={`p-2 rounded-md ${
                    agent.status === 'active' 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleEdit(agent)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Parâmetros</h4>
              <div className="bg-gray-50 rounded p-3 space-y-1">
                {renderParameters(agent.parameters)}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Criado em {agent.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {agent.updatedAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingAgent ? 'Editar Agente' : 'Novo Agente'}
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
                  <option value="llm">LLM</option>
                  <option value="custom">Customizado</option>
                  <option value="integration">Integração</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parâmetros (JSON)
                </label>
                <textarea
                  value={JSON.stringify(formData.parameters, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, parameters: parsed }));
                    } catch (error) {
                      // Ignore invalid JSON while typing
                    }
                  }}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"model": "gpt-4", "temperature": 0.7}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite os parâmetros em formato JSON válido
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgent(null);
                    setFormData({ name: '', type: 'llm', parameters: {} });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingAgent ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {agents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agente</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro agente.</p>
        </div>
      )}
    </div>
  );
}
