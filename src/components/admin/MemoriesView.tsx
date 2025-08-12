'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Brain, FileText, Database, Play, Pause, AlertCircle, CheckCircle, Upload, Download } from 'lucide-react';
import { Memory } from '@/types/admin';

export default function MemoriesView() {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      name: 'Base de Conhecimento Corporativo',
      type: 'rag',
      description: 'Documentos, manuais e procedimentos da empresa',
      status: 'active',
      documentCount: 1250,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'FAQ Suporte',
      type: 'document',
      description: 'Perguntas frequentes e soluções para clientes',
      status: 'active',
      documentCount: 450,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12'),
    },
    {
      id: '3',
      name: 'Análise de Dados',
      type: 'vector',
      description: 'Embeddings e vetores para análise semântica',
      status: 'processing',
      documentCount: 3200,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '4',
      name: 'Treinamento IA',
      type: 'rag',
      description: 'Dados de treinamento para modelos de IA',
      status: 'inactive',
      documentCount: 890,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-13'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'rag' as const,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMemory) {
      setMemories(prev => prev.map(memory => 
        memory.id === editingMemory.id 
          ? { ...memory, ...formData, updatedAt: new Date() }
          : memory
      ));
    } else {
      const newMemory: Memory = {
        id: Date.now().toString(),
        ...formData,
        status: 'inactive',
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMemories(prev => [...prev, newMemory]);
    }
    
    setShowForm(false);
    setEditingMemory(null);
    setFormData({ name: '', type: 'rag', description: '' });
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      name: memory.name,
      type: memory.type,
      description: memory.description,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta memória?')) {
      setMemories(prev => prev.filter(memory => memory.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id 
        ? { ...memory, status: memory.status === 'active' ? 'inactive' : 'active', updatedAt: new Date() }
        : memory
    ));
  };

  const handleImport = (id: string) => {
    // Simular importação de documentos
    alert(`Funcionalidade de importação para ${memories.find(m => m.id === id)?.name} será implementada`);
  };

  const handleExport = (id: string) => {
    // Simular exportação de dados
    alert(`Funcionalidade de exportação para ${memories.find(m => m.id === id)?.name} será implementada`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-gray-600" />;
      case 'processing':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'inactive':
        return 'Inativa';
      case 'processing':
        return 'Processando';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rag':
        return 'RAG';
      case 'vector':
        return 'Vector';
      case 'document':
        return 'Documento';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rag':
        return 'bg-blue-100 text-blue-800';
      case 'vector':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rag':
        return <Brain className="h-5 w-5 text-blue-600" />;
      case 'vector':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memórias</h1>
          <p className="text-gray-600">Gerencie RAGs e bases de conhecimento</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Memória
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  {getTypeIcon(memory.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{memory.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                      {getTypeLabel(memory.type)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(memory.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(memory.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(memory.id)}
                  className={`p-2 rounded-md ${
                    memory.status === 'active' 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {memory.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleImport(memory.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                  title="Importar Documentos"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleExport(memory.id)}
                  className="p-2 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50"
                  title="Exportar Dados"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(memory)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {memory.description && (
              <p className="mt-3 text-gray-600 text-sm">{memory.description}</p>
            )}
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Documentos:</span>
                <span className="font-medium text-gray-900">{memory.documentCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Criado em {memory.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {memory.updatedAt.toLocaleDateString('pt-BR')}</span>
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
              {editingMemory ? 'Editar Memória' : 'Nova Memória'}
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
                  placeholder="Ex: Base de Conhecimento"
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
                  <option value="rag">RAG (Retrieval-Augmented Generation)</option>
                  <option value="vector">Vector Database</option>
                  <option value="document">Document Store</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o propósito desta memória"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMemory(null);
                    setFormData({ name: '', type: 'rag', description: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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

      {memories.length === 0 && (
        <div className="text-center py-12">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma memória</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira base de conhecimento.</p>
        </div>
      )}
    </div>
  );
}
