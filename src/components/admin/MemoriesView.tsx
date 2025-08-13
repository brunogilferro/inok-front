'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Brain, Upload, RefreshCw } from 'lucide-react';

interface Memory {
  id: number;
  name: string;
  type: 'vector' | 'graph' | 'document';
  description: string;
  provider: string;
  configuration: Record<string, unknown>;
  status: 'active' | 'inactive' | 'indexing';
  documentsCount: number;
  lastIndexed: string;
  createdAt: string;
  updatedAt: string;
}

export default function MemoriesView() {
  const [memories] = useState<Memory[]>([
    {
      id: 1,
      name: 'Base de Conhecimento Corporativo',
      type: 'vector',
      description: 'Documentos, manuais e procedimentos da empresa',
      provider: 'Pinecone',
      configuration: { dimension: 1536, metric: 'cosine' },
      status: 'active',
      documentsCount: 1250,
      lastIndexed: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'FAQ Automatizado',
      type: 'document',
      description: 'Base de perguntas e respostas frequentes',
      provider: 'OpenSearch',
      configuration: { index: 'faq', shards: 1 },
      status: 'active',
      documentsCount: 890,
      lastIndexed: '2024-01-14T15:20:00Z',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-14T15:20:00Z'
    },
    {
      id: 3,
      name: 'Grafo de Relacionamentos',
      type: 'graph',
      description: 'Mapeamento de entidades e relacionamentos',
      provider: 'Neo4j',
      configuration: { nodes: 5000, relationships: 12000 },
      status: 'indexing',
      documentsCount: 0,
      lastIndexed: '2024-01-13T08:00:00Z',
      createdAt: '2024-01-13T00:00:00Z',
      updatedAt: '2024-01-13T08:00:00Z'
    }
  ]);

  const [loading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [importing, setImporting] = useState<number | null>(null);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vector': return 'Vector DB';
      case 'graph': return 'Grafo';
      case 'document': return 'Documentos';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vector': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'graph': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'document': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
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

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setShowForm(true);
  };

  const handleDelete = async (memory: Memory) => {
    if (confirm(`Tem certeza que deseja excluir a memória "${memory.name}"?`)) {
      // Implementation for delete
      console.error('Deleting memory:', memory.id);
    }
  };

  const handleImport = async (memory: Memory) => {
    setImporting(memory.id);
    // Simulate import process
    setTimeout(() => {
      setImporting(null);
      alert(`Importação iniciada para "${memory.name}"`);
    }, 2000);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMemory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Memórias</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie bases de conhecimento e sistemas RAG</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => console.error('Refreshing memories')}
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
            Nova Memória
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando memórias...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Memories Grid */}
          {memories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory) => (
                <div key={memory.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {memory.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {memory.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleImport(memory)}
                        disabled={importing === memory.id}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                        title="Importar dados"
                      >
                        {importing === memory.id ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(memory)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(memory)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Type and Status */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                      {getTypeLabel(memory.type)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(memory.status)}`}>
                      {getStatusLabel(memory.status)}
                    </span>
                  </div>

                  {/* Provider and Stats */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{memory.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Documentos:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{memory.documentsCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  {Object.keys(memory.configuration).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configuração:</h4>
                      <div className="space-y-1">
                        {Object.entries(memory.configuration).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                            <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(memory.configuration).length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{Object.keys(memory.configuration).length - 2} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Indexed */}
                  <div className="border-t dark:border-gray-600 pt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Última indexação: {new Date(memory.lastIndexed).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma memória</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando a primeira base de conhecimento.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Memória
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
              {editingMemory ? 'Editar Memória' : 'Nova Memória'}
            </h2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingMemory?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    defaultValue={editingMemory?.type || 'vector'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="vector">Vector DB</option>
                    <option value="graph">Grafo</option>
                    <option value="document">Documentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  defaultValue={editingMemory?.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provider *
                  </label>
                  <input
                    type="text"
                    defaultValue={editingMemory?.provider || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ex: Pinecone, OpenSearch, Neo4j"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    defaultValue={editingMemory?.status || 'inactive'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="indexing">Indexando</option>
                  </select>
                </div>
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
                  {editingMemory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
