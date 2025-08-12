'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, GitBranch, Play, Pause, AlertCircle, CheckCircle, Settings, Eye, Copy } from 'lucide-react';
import { DataFlow, FlowNode } from '@/types/admin';

export default function DataFlowsView() {
  const [flows, setFlows] = useState<DataFlow[]>([
    {
      id: '1',
      name: 'ETL Diário',
      description: 'Processamento diário de dados de vendas e métricas',
      type: 'etl',
      status: 'active',
      nodes: [
        { id: '1', type: 'input', name: 'Database Source', parameters: { table: 'sales' }, connections: ['2'] },
        { id: '2', type: 'process', name: 'Data Transform', parameters: { operations: ['clean', 'aggregate'] }, connections: ['3'] },
        { id: '3', type: 'output', name: 'Data Warehouse', parameters: { target: 'analytics_db' }, connections: [] },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Streaming Analytics',
      description: 'Processamento em tempo real de eventos do sistema',
      type: 'streaming',
      status: 'active',
      nodes: [
        { id: '1', type: 'input', name: 'Event Stream', parameters: { source: 'kafka' }, connections: ['2'] },
        { id: '2', type: 'process', name: 'Real-time Process', parameters: { window: '5m' }, connections: ['3'] },
        { id: '3', type: 'output', name: 'Dashboard', parameters: { format: 'websocket' }, connections: [] },
      ],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12'),
    },
    {
      id: '3',
      name: 'Batch Processing',
      description: 'Processamento em lote de arquivos de log',
      type: 'batch',
      status: 'inactive',
      nodes: [
        { id: '1', type: 'input', name: 'File Input', parameters: { pattern: '*.log' }, connections: ['2'] },
        { id: '2', type: 'process', name: 'Log Parser', parameters: { format: 'json' }, connections: ['3'] },
        { id: '3', type: 'output', name: 'Elasticsearch', parameters: { index: 'logs' }, connections: [] },
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-13'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DataFlow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'etl' as const,
    description: '',
    nodes: [] as FlowNode[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFlow) {
      setFlows(prev => prev.map(flow => 
        flow.id === editingFlow.id 
          ? { ...flow, ...formData, updatedAt: new Date() }
          : flow
      ));
    } else {
      const newFlow: DataFlow = {
        id: Date.now().toString(),
        ...formData,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFlows(prev => [...prev, newFlow]);
    }
    
    setShowForm(false);
    setEditingFlow(null);
    setFormData({ name: '', type: 'etl', description: '', nodes: [] });
  };

  const handleEdit = (flow: DataFlow) => {
    setEditingFlow(flow);
    setFormData({
      name: flow.name,
      type: flow.type,
      description: flow.description,
      nodes: flow.nodes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      setFlows(prev => prev.filter(flow => flow.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setFlows(prev => prev.map(flow => 
      flow.id === id 
        ? { ...flow, status: flow.status === 'active' ? 'inactive' : 'active', updatedAt: new Date() }
        : flow
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
      case 'etl':
        return 'ETL';
      case 'streaming':
        return 'Streaming';
      case 'batch':
        return 'Batch';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'etl':
        return 'bg-blue-100 text-blue-800';
      case 'streaming':
        return 'bg-green-100 text-green-800';
      case 'batch':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFlowDiagram = (nodes: FlowNode[]) => {
    return (
      <div className="flex items-center justify-center space-x-2 py-2">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex items-center">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              node.type === 'input' ? 'bg-green-100 text-green-800' :
              node.type === 'process' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {node.name}
            </div>
            {index < nodes.length - 1 && (
              <div className="mx-2 text-gray-400">→</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const addNode = () => {
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type: 'process',
      name: 'Novo Nó',
      parameters: {},
      connections: [],
    };
    setFormData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  };

  const removeNode = (nodeId: string) => {
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
    }));
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    setFormData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxos de Dados</h1>
          <p className="text-gray-600">Configure fluxos e integrações de dados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Fluxo
        </button>
      </div>

      {/* Flows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{flow.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(flow.type)}`}>
                      {getTypeLabel(flow.type)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(flow.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(flow.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(flow.id)}
                  className={`p-2 rounded-md ${
                    flow.status === 'active' 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {flow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleEdit(flow)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(flow.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {flow.description && (
              <p className="mt-3 text-gray-600 text-sm">{flow.description}</p>
            )}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fluxo</h4>
              {renderFlowDiagram(flow.nodes)}
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Nós:</span>
                <span className="font-medium text-gray-900">{flow.nodes.length}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Criado em {flow.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {flow.updatedAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingFlow ? 'Editar Fluxo' : 'Novo Fluxo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: ETL Diário"
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
                    <option value="etl">ETL</option>
                    <option value="streaming">Streaming</option>
                    <option value="batch">Batch</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o propósito deste fluxo"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nós do Fluxo
                  </label>
                  <button
                    type="button"
                    onClick={addNode}
                    className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Nó
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.nodes.map((node, index) => (
                    <div key={node.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                          <input
                            type="text"
                            value={node.name}
                            onChange={(e) => updateNode(node.id, { name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                          <select
                            value={node.type}
                            onChange={(e) => updateNode(node.id, { type: e.target.value as any })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="input">Input</option>
                            <option value="process">Process</option>
                            <option value="output">Output</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeNode(node.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Parâmetros (JSON)</label>
                        <textarea
                          value={JSON.stringify(node.parameters, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              updateNode(node.id, { parameters: parsed });
                            } catch (error) {
                              // Ignore invalid JSON while typing
                            }
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder='{"key": "value"}'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFlow(null);
                    setFormData({ name: '', type: 'etl', description: '', nodes: [] });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingFlow ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {flows.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum fluxo</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro fluxo de dados.</p>
        </div>
      )}
    </div>
  );
}
