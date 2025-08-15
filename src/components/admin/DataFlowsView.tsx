'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, GitBranch, Play, Pause, AlertCircle, CheckCircle, Search, X, Clock, Calendar, Zap } from 'lucide-react';
import { DataFlow } from '@/types/admin';
import { flowsAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DataFlowFormData {
  name: string;
  description: string;
  source: string;
  destination: string;
  transformations: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
  schedule: string;
  status: 'active' | 'inactive' | 'running' | 'error';
  [key: string]: unknown;
}



export default function DataFlowsView() {
  const { hasRole } = useAuth();
  const [flows, setFlows] = useState<DataFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [executing, setExecuting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DataFlow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'running' | 'error'>('all');
  
  const [formData, setFormData] = useState<DataFlowFormData>({
    name: '',
    description: '',
    source: '',
    destination: '',
    transformations: [],
    schedule: '0 2 * * *',
    status: 'active',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  // Load data flows from API
  const loadDataFlows = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: pagination.perPage };
      
      if (search) params.name = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await flowsAPI.getAll(params);
      
      if (response.success && response.data) {
        setFlows(response.data as DataFlow[]);
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
      console.error('Error loading data flows:', error);
      toast.error('Erro ao carregar fluxos de dados');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage]);

  // Initial load
  useEffect(() => {
    if (hasRole('admin')) {
      loadDataFlows();
    }
  }, [hasRole, loadDataFlows]);

  // Handle filter changes
  useEffect(() => {
    if (!hasRole('admin')) return;
    loadDataFlows(1, searchQuery);
  }, [statusFilter, hasRole, loadDataFlows, searchQuery]);

  // Handle search
  useEffect(() => {
    if (!hasRole('admin')) return;
    
    const timeoutId = setTimeout(() => {
      loadDataFlows(1, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasRole, loadDataFlows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingFlow) {
        setUpdating(true);
        const response = await flowsAPI.update(editingFlow.id, formData);
        
        if (response.success) {
          setFlows(prev => prev.map(flow => 
            flow.id === editingFlow.id 
              ? { ...flow, ...formData, updatedAt: new Date().toISOString() }
              : flow
          ));
          toast.success('Fluxo de dados atualizado com sucesso');
          resetForm();
        }
      } else {
        setCreating(true);
        const response = await flowsAPI.create(formData);
        
        if (response.success && response.data) {
          const newFlow = response.data as DataFlow;
          setFlows(prev => [...prev, newFlow]);
          toast.success('Fluxo de dados criado com sucesso');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating/updating data flow:', error);
      toast.error('Erro ao salvar fluxo de dados');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (flow: DataFlow) => {
    setEditingFlow(flow);
    setFormData({
      name: flow.name,
      description: flow.description || '',
      source: flow.source || '',
      destination: flow.destination || '',
      transformations: flow.transformations || [],
      schedule: flow.schedule || '0 2 * * *',
      status: flow.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (flow: DataFlow) => {
    if (!confirm(`Tem certeza que deseja excluir o fluxo "${flow.name}"?`)) {
      return;
    }

    try {
      setDeleting(flow.id);
      const response = await flowsAPI.delete(flow.id);
      
      if (response.success) {
        setFlows(prev => prev.filter(f => f.id !== flow.id));
        toast.success('Fluxo de dados excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting data flow:', error);
      toast.error('Erro ao excluir fluxo de dados');
    } finally {
      setDeleting(null);
    }
  };

  const handleExecute = async (flow: DataFlow) => {
    try {
      setExecuting(flow.id);
      const response = await flowsAPI.execute(flow.id);
      
      if (response.success) {
        toast.success(`Fluxo "${flow.name}" executado com sucesso`);
        // Reload flows to update lastRun and nextRun
        loadDataFlows();
      }
    } catch (error) {
      console.error('Error executing data flow:', error);
      toast.error('Erro ao executar fluxo de dados');
    } finally {
      setExecuting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFlow(null);
    setFormData({
      name: '',
      description: '',
      source: '',
      destination: '',
      transformations: [],
      schedule: '0 2 * * *',
      status: 'active',
    });
  };

  // Helper functions for transformations management
  const addTransformation = () => {
    setFormData(prev => ({
      ...prev,
      transformations: [...prev.transformations, { type: '', config: {} }]
    }));
  };

  const updateTransformation = (index: number, field: 'type' | 'config', value: string | Record<string, unknown>) => {
    setFormData(prev => ({
      ...prev,
      transformations: prev.transformations.map((trans, i) => 
        i === index ? { ...trans, [field]: value } : trans
      )
    }));
  };

  const removeTransformation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      transformations: prev.transformations.filter((_, i) => i !== index)
    }));
  };

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

  const formatSchedule = (schedule: string) => {
    if (schedule === 'real-time' || schedule === 'continuous') {
      return 'Tempo real';
    }
    // Basic cron format display
    return schedule;
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-12">
        <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fluxos de Dados</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie pipelines de processamento e transformação de dados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Fluxo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar fluxos de dados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'running' | 'error')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="running">Executando</option>
          <option value="error">Com erro</option>
        </select>
      </div>

      {/* Data Flows List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
            Carregando fluxos de dados...
          </div>
        </div>
      ) : flows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <div key={flow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {flow.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                        {getStatusIcon(flow.status)}
                        <span className="ml-1">{getStatusLabel(flow.status)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleExecute(flow)}
                    disabled={executing === flow.id}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                    title="Executar fluxo"
                  >
                    {executing === flow.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(flow)}
                    disabled={updating}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    title="Editar fluxo"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(flow)}
                    disabled={deleting === flow.id}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Excluir fluxo"
                  >
                    {deleting === flow.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              {flow.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {flow.description}
                </p>
              )}

              {/* Source and Destination */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Origem:</span>
                  {flow.source}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Destino:</span>
                  {flow.destination}
                </div>
              </div>

              {/* Transformations */}
              {flow.transformations && flow.transformations.length > 0 && (
                <div className="border-t dark:border-gray-600 pt-3 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transformações:</h4>
                  <div className="space-y-1">
                    {flow.transformations.slice(0, 3).map((trans, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{trans.type}</span>
                        {Object.keys(trans.config || {}).length > 0 && (
                          <span className="text-gray-400 dark:text-gray-500 ml-2">
                            ({Object.keys(trans.config || {}).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                    {flow.transformations.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{flow.transformations.length - 3} mais...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule and Timing */}
              <div className="border-t dark:border-gray-600 pt-3">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Agendamento: {formatSchedule(flow.schedule || '')}</span>
                  </div>
                </div>
                {flow.lastRun && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Última execução: {new Date(flow.lastRun).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {flow.nextRun && flow.nextRun !== 'continuous' && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Próxima execução: {new Date(flow.nextRun).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Criado em {new Date(flow.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery || statusFilter !== 'all' ? 'Nenhum fluxo de dados encontrado' : 'Nenhum fluxo de dados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando o primeiro pipeline de dados.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
            {pagination.total} fluxos de dados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadDataFlows(pagination.currentPage - 1, searchQuery)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {pagination.currentPage} de {pagination.lastPage}
            </span>
            <button
              onClick={() => loadDataFlows(pagination.currentPage + 1, searchQuery)}
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
                  {editingFlow ? 'Editar Fluxo de Dados' : 'Novo Fluxo de Dados'}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'running' | 'error' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Origem *
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="Ex: CRM API, Database, File"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Destino *
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Ex: Data Warehouse, Analytics DB"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agendamento (Cron)
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="0 2 * * * (diário às 2h) ou 'real-time'"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use formato cron (0 2 * * *) ou &apos;real-time&apos; para execução contínua
                  </p>
                </div>

                {/* Transformations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transformações
                    </label>
                    <button
                      type="button"
                      onClick={addTransformation}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      + Adicionar transformação
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.transformations.map((trans, index) => (
                      <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-md p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tipo
                            </label>
                            <input
                              type="text"
                              value={trans.type}
                              onChange={(e) => updateTransformation(index, 'type', e.target.value)}
                              placeholder="Ex: validation, normalization, enrichment"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Configuração
                            </label>
                            <input
                              type="text"
                              value={JSON.stringify(trans.config)}
                              onChange={(e) => {
                                try {
                                  const config = JSON.parse(e.target.value);
                                  updateTransformation(index, 'config', config);
                                } catch {
                                  // Invalid JSON, ignore
                                }
                              }}
                              placeholder='{"key": "value"}'
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        {formData.transformations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTransformation(index)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remover transformação
                          </button>
                        )}
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
                      editingFlow ? 'Atualizar' : 'Criar'
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
