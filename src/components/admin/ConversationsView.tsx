'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Play, Pause, CheckCircle, AlertCircle, X, Edit, Trash2, Search, Users, Calendar, Clock } from 'lucide-react';
import { Conversation } from '@/types/admin';
import { conversationsAPI } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ConversationFormData {
  title: string;
  context: string;
  narrative: string;
  status: 'active' | 'archived' | 'processing';
  [key: string]: unknown;
}

interface TranscriptFormData {
  speakerId: number;
  content: string;
  confidence?: number;
  timestamp: string;
  [key: string]: unknown;
}

interface SummaryFormData {
  content: string;
  type: 'automatic' | 'manual' | 'ai_generated';
  aiGenerated?: boolean;
  timestamp: string;
  [key: string]: unknown;
}

interface KnowledgeFormData {
  content: string;
  type: string;
  tags?: string[];
  confidence?: number;
  timestamp: string;
  [key: string]: unknown;
}

export default function ConversationsView() {
  const { hasRole } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'archived' | 'deleted'>('all');
  
  const [formData, setFormData] = useState<ConversationFormData>({
    title: '',
    context: '',
    narrative: '',
    status: 'active',
  });

  const [transcriptFormData, setTranscriptFormData] = useState<TranscriptFormData>({
    speakerId: 1,
    content: '',
    confidence: 0.95,
    timestamp: new Date().toISOString(),
  });

  const [summaryFormData, setSummaryFormData] = useState<SummaryFormData>({
    content: '',
    type: 'manual',
    aiGenerated: false,
    timestamp: new Date().toISOString(),
  });

  const [knowledgeFormData, setKnowledgeFormData] = useState<KnowledgeFormData>({
    content: '',
    type: 'insight',
    tags: [],
    confidence: 0.9,
    timestamp: new Date().toISOString(),
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  // Load conversations from API
  const loadConversations = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: pagination.perPage };
      
      if (search) params.title = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await conversationsAPI.getAll(params);
      
      if (response.success && response.data) {
        setConversations(response.data as Conversation[]);
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
      console.error('Error loading conversations:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage, statusFilter]);

  // Initial load
  useEffect(() => {
    if (hasRole('admin')) {
      loadConversations();
    }
  }, [hasRole, loadConversations]);

  // Handle search
  useEffect(() => {
    if (!hasRole('admin')) return;
    
    const timeoutId = setTimeout(() => {
      loadConversations(1, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasRole, loadConversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      if (selectedConversation) {
        setUpdating(true);
        const response = await conversationsAPI.update(selectedConversation.id, formData);
        
        if (response.success) {
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, ...formData, updatedAt: new Date().toISOString() }
              : conv
          ));
          toast.success('Conversa atualizada com sucesso');
          resetForm();
        }
      } else {
        setCreating(true);
        const response = await conversationsAPI.create(formData);
        
        if (response.success && response.data) {
          const newConversation = response.data as Conversation;
          setConversations(prev => [...prev, newConversation]);
          toast.success('Conversa criada com sucesso');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error creating/updating conversation:', error);
      toast.error('Erro ao salvar conversa');
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  const handleDelete = async (conversation: Conversation) => {
    if (!confirm(`Tem certeza que deseja excluir a conversa "${conversation.title}"?`)) {
      return;
    }

    try {
      setDeleting(conversation.id);
      const response = await conversationsAPI.delete(conversation.id);
      
      if (response.success) {
        setConversations(prev => prev.filter(c => c.id !== conversation.id));
        toast.success('Conversa excluída com sucesso');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Erro ao excluir conversa');
    } finally {
      setDeleting(null);
    }
  };

  const handleAddTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcriptFormData.content.trim() || !selectedConversation) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      const response = await conversationsAPI.addTranscript(selectedConversation.id, transcriptFormData);
      
      if (response.success) {
        toast.success('Transcrição adicionada com sucesso');
        setShowTranscriptModal(false);
        setTranscriptFormData({
          speakerId: 1,
          content: '',
          confidence: 0.95,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding transcript:', error);
      toast.error('Erro ao adicionar transcrição');
    }
  };

  const handleAddSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summaryFormData.content.trim() || !selectedConversation) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      const response = await conversationsAPI.addSummary(selectedConversation.id, summaryFormData);
      
      if (response.success) {
        toast.success('Resumo adicionado com sucesso');
        setShowSummaryModal(false);
        setSummaryFormData({
          content: '',
          type: 'manual',
          aiGenerated: false,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding summary:', error);
      toast.error('Erro ao adicionar resumo');
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!knowledgeFormData.content.trim() || !selectedConversation) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      const response = await conversationsAPI.addKnowledge(selectedConversation.id, knowledgeFormData);
      
      if (response.success) {
        toast.success('Conhecimento adicionado com sucesso');
        setShowKnowledgeModal(false);
        setKnowledgeFormData({
          content: '',
          type: 'insight',
          tags: [],
          confidence: 0.9,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding knowledge:', error);
      toast.error('Erro ao adicionar conhecimento');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedConversation(null);
    setFormData({
      title: '',
      context: '',
      narrative: '',
      status: 'active',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'deleted': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'archived': return 'Arquivada';
      case 'deleted': return 'Excluída';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'archived': return <CheckCircle className="w-4 h-4" />;
      case 'deleted': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conversas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie conversas e extraia insights do sistema
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'archived' | 'deleted')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="paused">Pausadas</option>
          <option value="archived">Arquivadas</option>
          <option value="deleted">Excluídas</option>
        </select>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
            Carregando conversas...
          </div>
        </div>
      ) : conversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {conversation.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {getStatusIcon(conversation.status)}
                      <span className="ml-1">{getStatusLabel(conversation.status)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedConversation(conversation)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Ver detalhes"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setFormData({
                        title: conversation.title,
                        context: conversation.context,
                        narrative: conversation.narrative || '',
                        status: conversation.status,
                      });
                      setShowForm(true);
                    }}
                    disabled={updating}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                    title="Editar conversa"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(conversation)}
                    disabled={deleting === conversation.id}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    title="Excluir conversa"
                  >
                    {deleting === conversation.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Context */}
              {conversation.context && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Contexto:</strong> {conversation.context}
                </p>
              )}

              {/* Narrative */}
              {conversation.narrative && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Narrativa:</strong> {conversation.narrative}
                </p>
              )}

              {/* Participants */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Users className="w-4 h-4 mr-1" />
                {conversation.conversationParticipants?.length || 0} participante{(conversation.conversationParticipants?.length || 0) !== 1 ? 's' : ''}
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(conversation.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery || statusFilter !== 'all' ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Comece criando a primeira conversa.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
            {pagination.total} conversas
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadConversations(pagination.currentPage - 1, searchQuery)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {pagination.currentPage} de {pagination.lastPage}
            </span>
            <button
              onClick={() => loadConversations(pagination.currentPage + 1, searchQuery)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Conversation Details Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes da Conversa: {selectedConversation.title}
                </h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contexto</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedConversation.context}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Narrativa</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedConversation.narrative || 'Nenhuma narrativa'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Participantes</h4>
                    <div className="space-y-2">
                      {selectedConversation.conversationParticipants?.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {participant.identity.name} ({participant.identity.type})
                          </span>
                        </div>
                      )) || <p className="text-gray-500">Nenhum participante</p>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowTranscriptModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Adicionar Transcrição
                  </button>
                  
                  <button
                    onClick={() => setShowSummaryModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Adicionar Resumo
                  </button>
                  
                  <button
                    onClick={() => setShowKnowledgeModal(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Adicionar Conhecimento
                  </button>
                </div>
              </div>
            </div>
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
                  {selectedConversation ? 'Editar Conversa' : 'Nova Conversa'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contexto
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Narrativa
                  </label>
                  <textarea
                    value={formData.narrative}
                    onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' | 'processing' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Ativa</option>
                    <option value="archived">Arquivada</option>
                    <option value="processing">Processando</option>
                  </select>
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
                      selectedConversation ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Transcrição
              </h3>
              
              <form onSubmit={handleAddTranscript} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID do Falante
                  </label>
                  <input
                    type="number"
                    value={transcriptFormData.speakerId}
                    onChange={(e) => setTranscriptFormData(prev => ({ ...prev, speakerId: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conteúdo *
                  </label>
                  <textarea
                    value={transcriptFormData.content}
                    onChange={(e) => setTranscriptFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confiança
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={transcriptFormData.confidence}
                    onChange={(e) => setTranscriptFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTranscriptModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Resumo
              </h3>
              
              <form onSubmit={handleAddSummary} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conteúdo *
                  </label>
                  <textarea
                    value={summaryFormData.content}
                    onChange={(e) => setSummaryFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={summaryFormData.type}
                    onChange={(e) => setSummaryFormData(prev => ({ ...prev, type: e.target.value as 'automatic' | 'manual' | 'ai_generated' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="automatic">Automático</option>
                    <option value="manual">Manual</option>
                    <option value="ai_generated">Gerado por IA</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="aiGenerated"
                    checked={summaryFormData.aiGenerated}
                    onChange={(e) => setSummaryFormData(prev => ({ ...prev, aiGenerated: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="aiGenerated" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Gerado por IA
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSummaryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Conhecimento
              </h3>
              
              <form onSubmit={handleAddKnowledge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conteúdo *
                  </label>
                  <textarea
                    value={knowledgeFormData.content}
                    onChange={(e) => setKnowledgeFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <input
                    type="text"
                    value={knowledgeFormData.type}
                    onChange={(e) => setKnowledgeFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={knowledgeFormData.tags?.join(', ') || ''}
                    onChange={(e) => setKnowledgeFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confiança
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={knowledgeFormData.confidence}
                    onChange={(e) => setKnowledgeFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowKnowledgeModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                  >
                    Adicionar
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
