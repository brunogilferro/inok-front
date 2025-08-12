'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, User, Bot, Users } from 'lucide-react';
import { Identity } from '@/types/admin';

export default function IdentitiesView() {
  const [identities, setIdentities] = useState<Identity[]>([
    {
      id: '1',
      name: 'João Silva',
      type: 'human',
      description: 'Analista de negócios',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'GPT-4 Assistant',
      type: 'ai',
      description: 'Assistente de IA para suporte ao cliente',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Sistema de Análise',
      type: 'agent',
      description: 'Agente automatizado para análise de dados',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'human' as const,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIdentity) {
      // Update existing identity
      setIdentities(prev => prev.map(id => 
        id.id === editingIdentity.id 
          ? { ...id, ...formData, updatedAt: new Date() }
          : id
      ));
    } else {
      // Create new identity
      const newIdentity: Identity = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setIdentities(prev => [...prev, newIdentity]);
    }
    
    setShowForm(false);
    setEditingIdentity(null);
    setFormData({ name: '', type: 'human', description: '' });
  };

  const handleEdit = (identity: Identity) => {
    setEditingIdentity(identity);
    setFormData({
      name: identity.name,
      type: identity.type,
      description: identity.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta identidade?')) {
      setIdentities(prev => prev.filter(id => id.id !== id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'human':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'ai':
        return <Bot className="h-5 w-5 text-green-600" />;
      case 'agent':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'human':
        return 'Humano';
      case 'ai':
        return 'IA';
      case 'agent':
        return 'Agente';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identidades</h1>
          <p className="text-gray-600">Gerencie agentes, humanos e AIs do sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Identidade
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingIdentity ? 'Editar Identidade' : 'Nova Identidade'}
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
                  <option value="human">Humano</option>
                  <option value="ai">IA</option>
                  <option value="agent">Agente</option>
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
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingIdentity(null);
                    setFormData({ name: '', type: 'human', description: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingIdentity ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Identities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {identities.map((identity) => (
          <div
            key={identity.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {identity.avatar ? (
                  <img
                    src={identity.avatar}
                    alt={identity.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {getTypeIcon(identity.type)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{identity.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(identity.type)}
                    <span className="text-sm text-gray-600">{getTypeLabel(identity.type)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(identity)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(identity.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {identity.description && (
              <p className="mt-3 text-gray-600 text-sm">{identity.description}</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Criado em {identity.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {identity.updatedAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {identities.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma identidade</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira identidade.</p>
        </div>
      )}
    </div>
  );
}
