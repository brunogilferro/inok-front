'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, GitBranch, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react';
import { DataFlow } from '@/types/admin';

export default function DataFlowsView() {
  const [flows] = useState<DataFlow[]>([
    {
      id: 1,
      name: 'Sync Customer Data',
      description: 'Sincronização diária de dados de clientes do CRM',
      source: 'CRM API',
      destination: 'Data Warehouse',
      transformations: [
        { type: 'validation', config: { required_fields: ['email', 'name'] } },
        { type: 'normalization', config: { format: 'standard' } }
      ],
      schedule: '0 2 * * *',
      status: 'active',
      lastRun: '2024-01-15T02:00:00Z',
      nextRun: '2024-01-16T02:00:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T02:00:00Z'
    },
    {
      id: 2,
      name: 'Process Analytics Events',
      description: 'Processamento em tempo real de eventos de analytics',
      source: 'Event Stream',
      destination: 'Analytics DB',
      transformations: [
        { type: 'enrichment', config: { add_metadata: true } },
        { type: 'filtering', config: { exclude_bots: true } }
      ],
      schedule: 'real-time',
      status: 'running',
      lastRun: '2024-01-15T10:30:00Z',
      nextRun: 'continuous',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  ]);

  const [loading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DataFlow | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Pause className="w-4 h-4" />;
      case 'running': return <Play className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'running': return 'Executando';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  const handleEdit = (flow: DataFlow) => {
    setEditingFlow(flow);
    setShowForm(true);
  };

  const handleDelete = async (flow: DataFlow) => {
    if (confirm(`Tem certeza que deseja excluir o fluxo "${flow.name}"?`)) {
      // Implementation for delete
      console.warn('Deleting flow:', flow.id);
    }
  };

  const handleExecute = async (flow: DataFlow) => {
    // Implementation for execute
    console.warn('Executing flow:', flow.id);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFlow(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fluxos de Dados</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure e monitore fluxos de transformação de dados</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Fluxo
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando fluxos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Flows Grid */}
          {flows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flows.map((flow) => (
                <div key={flow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {flow.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {flow.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleExecute(flow)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Executar fluxo"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(flow)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(flow)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                      {getStatusIcon(flow.status)}
                      <span className="ml-1">{getStatusLabel(flow.status)}</span>
                    </span>
                  </div>

                  {/* Source -> Destination */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{flow.source}</span>
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{flow.destination}</span>
                    </div>
                  </div>

                  {/* Transformations */}
                  {flow.transformations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transformações:</h4>
                      <div className="space-y-1">
                        {flow.transformations.slice(0, 2).map((transform, _index) => (
                          <div key={transform.type} className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{transform.type}</span>
                          </div>
                        ))}
                        {flow.transformations.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{flow.transformations.length - 2} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Schedule and Last Run */}
                  <div className="border-t dark:border-gray-600 pt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Schedule: {flow.schedule}</div>
                      <div>Última exec: {new Date(flow.lastRun).toLocaleDateString('pt-BR')}</div>
                      <div>Próxima: {flow.nextRun === 'continuous' ? 'Contínuo' : new Date(flow.nextRun).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum fluxo</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando o primeiro fluxo de dados.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Fluxo
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
              {editingFlow ? 'Editar Fluxo' : 'Novo Fluxo'}
            </h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingFlow?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    defaultValue={editingFlow?.status || 'inactive'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="running">Executando</option>
                    <option value="error">Erro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  defaultValue={editingFlow?.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Origem *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingFlow?.source || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destino *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingFlow?.destination || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agendamento
                </label>
                <input
                  type="text"
                  defaultValue={editingFlow?.schedule || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Ex: 0 2 * * * (cron format) ou real-time"
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
                  {editingFlow ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
