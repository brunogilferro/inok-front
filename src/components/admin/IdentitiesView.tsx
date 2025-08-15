'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, User, Bot, Users, Search, RefreshCw } from 'lucide-react';
import { identitiesAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import Image from 'next/image';

interface Identity {
  id: number;
  name: string;
  type: 'human' | 'ai' | 'agent';
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface IdentityFormData {
  name: string;
  type: 'human' | 'ai' | 'agent';
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata: Record<string, unknown>;
}

export default function IdentitiesView() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'human' | 'ai' | 'agent'>('all');
  
  // Simple ref to prevent multiple loads
  const hasLoaded = useRef(false);
  
  const [formData, setFormData] = useState<IdentityFormData>({
    name: '',
    type: 'human',
    avatar: '',
    status: 'active',
    metadata: {},
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  // Load identities from API
  const lastFetchSignatureRef = useRef<string>('');

  const loadIdentities = useCallback(async (page = 1, search = '', type = 'all', limit = 20) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit };
      
      if (search) params.name = search;
      if (type && type !== 'all') params.type = type;

      const signature = JSON.stringify(params);
      if (lastFetchSignatureRef.current === signature) {
        return;
      }
      lastFetchSignatureRef.current = signature;

      const response = await identitiesAPI.getAll(params);
      
      if (response.success && response.data) {
        setIdentities(response.data as Identity[]);
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
      console.error('Error loading identities:', error);
      toast.error('Erro ao carregar identidades');
    } finally {
      setLoading(false);
    }
  }, []);

    // Simple useEffect - only runs once
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadIdentities(1, '', 'all');
    }
  }, [loadIdentities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      type: formData.type,
      avatar: formData.avatar || null,
      status: formData.status,
      metadata: formData.metadata,
    };

    try {
      if (editingIdentity) {
        setUpdating(true);
        const response = await identitiesAPI.update(editingIdentity.id, payload);
        
        if (response.success) {
          toast.success('Identidade atualizada com sucesso!');
          setIdentities(prev => prev.map(identity => 
            identity.id === editingIdentity.id 
              ? { ...identity, ...payload, updatedAt: new Date().toISOString() }
              : identity
          ));
        }
      } else {
        setCreating(true);
        const response = await identitiesAPI.create(payload);
        
        if (response.success && response.data) {
          toast.success('Identidade criada com sucesso!');
          await loadIdentities(pagination.currentPage, searchQuery, typeFilter);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error submitting identity:', error);
      toast.error(editingIdentity ? 'Erro ao atualizar identidade' : 'Erro ao criar identidade');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleEdit = (identity: Identity) => {
    setEditingIdentity(identity);
    setFormData({
      name: identity.name,
      type: identity.type,
      avatar: identity.avatar || '',
      status: identity.status,
      metadata: identity.metadata || {},
    });
    setShowForm(true);
  };

  const handleDelete = async (identity: Identity) => {
    if (!confirm(`Tem certeza que deseja excluir a identidade "${identity.name}"?`)) {
      return;
    }

    try {
      setDeleting(identity.id);
      const response = await identitiesAPI.delete(identity.id);
      
      if (response.success) {
        toast.success('Identidade excluída com sucesso!');
        setIdentities(prev => prev.filter(i => i.id !== identity.id));
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (identities.length === 1 && pagination.currentPage > 1) {
          loadIdentities(pagination.currentPage - 1, searchQuery, typeFilter);
        }
      }
    } catch (error) {
      console.error('Error deleting identity:', error);
      toast.error('Erro ao excluir identidade');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingIdentity(null);
    setFormData({
      name: '',
      type: 'human',
      avatar: '',
      status: 'active',
      metadata: {},
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'human': return User;
      case 'ai': return Bot;
      case 'agent': return Users;
      default: return User;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'human': return 'Humano';
      case 'ai': return 'IA';
      case 'agent': return 'Agente';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ai': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'agent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Helper functions for metadata management
  const addMetadataField = () => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, '': '' }
    }));
  };

  const updateMetadataField = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      if (oldKey !== newKey) {
        delete newMetadata[oldKey];
      }
      newMetadata[newKey] = value;
      return { ...prev, metadata: newMetadata };
    });
  };

  const removeMetadataField = (key: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return { ...prev, metadata: newMetadata };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Identidades</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie identidades, agentes e usuários do sistema</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadIdentities(pagination.currentPage, searchQuery, typeFilter)}
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
            Nova Identidade
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'human' | 'ai' | 'agent')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Todos os tipos</option>
          <option value="human">Humanos</option>
          <option value="ai">IAs</option>
          <option value="agent">Agentes</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingIdentity ? 'Editar Identidade' : 'Nova Identidade'}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'human' | 'ai' | 'agent' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={creating || updating}
                  >
                    <option value="human">Humano</option>
                    <option value="ai">IA</option>
                    <option value="agent">Agente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avatar (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="https://exemplo.com/avatar.jpg"
                    disabled={creating || updating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'suspended' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    disabled={creating || updating}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>

              {/* Metadata Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Metadados
                  </label>
                  <button
                    type="button"
                    onClick={addMetadataField}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={creating || updating}
                  >
                    + Adicionar Campo
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.entries(formData.metadata).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Chave"
                        value={key}
                        onChange={(e) => updateMetadataField(key, e.target.value, value as string)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={creating || updating}
                      />
                      <input
                        type="text"
                        placeholder="Valor"
                        value={value as string}
                        onChange={(e) => updateMetadataField(key, key, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={creating || updating}
                      />
                      <button
                        type="button"
                        onClick={() => removeMetadataField(key)}
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
                  {editingIdentity ? 'Atualizar' : 'Criar'}
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
            <p className="text-gray-600 dark:text-gray-400">Carregando identidades...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Identities Grid */}
          {identities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {identities.map((identity) => {
                const TypeIcon = getTypeIcon(identity.type);
                return (
                  <div key={identity.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {identity.avatar ? (
                            <Image
                              src={identity.avatar}
                              alt={identity.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`${identity.avatar ? 'hidden' : ''} w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center`}>
                            <TypeIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {identity.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(identity.type)}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {getTypeLabel(identity.type)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(identity.status)}`}>
                              {identity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(identity)}
                          disabled={updating}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(identity)}
                          disabled={deleting === identity.id}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          {deleting === identity.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    {Object.keys(identity.metadata).length > 0 && (
                      <div className="border-t dark:border-gray-600 pt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadados:</h4>
                        <div className="space-y-1">
                          {Object.entries(identity.metadata).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{key}:</span>
                              <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                          {Object.keys(identity.metadata).length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{Object.keys(identity.metadata).length - 3} mais...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Criado em {new Date(identity.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchQuery || typeFilter !== 'all' ? 'Nenhuma identidade encontrada' : 'Nenhuma identidade'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando a primeira identidade.'}
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Identidade
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => loadIdentities(pagination.currentPage - 1, searchQuery, typeFilter)}
                  disabled={pagination.currentPage <= 1 || loading}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => loadIdentities(pagination.currentPage + 1, searchQuery, typeFilter)}
                  disabled={pagination.currentPage >= pagination.lastPage || loading}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
              
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{' '}
                    <span className="font-medium">{((pagination.currentPage - 1) * pagination.perPage) + 1}</span>
                    {' '}até{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => loadIdentities(pagination.currentPage - 1, searchQuery, typeFilter)}
                      disabled={pagination.currentPage <= 1 || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => loadIdentities(pagination.currentPage + 1, searchQuery, typeFilter)}
                      disabled={pagination.currentPage >= pagination.lastPage || loading}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
