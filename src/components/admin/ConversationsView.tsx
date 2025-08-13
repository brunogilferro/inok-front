'use client';

import { useState } from 'react';
import { Plus, Upload, MessageSquare, Play, Pause, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Conversation, TranscriptEntry, Summary } from '@/types/admin';

export default function ConversationsView() {
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      title: 'Conversa com Cliente A',
      context: 'Discussão sobre projeto de IA',
      participants: [1, 2],
      narrative: 'Conversa sobre implementação de chatbot',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'Reunião de Planejamento',
      context: 'Definição de requisitos do sistema',
      participants: [1, 3, 4],
      narrative: 'Alinhamento sobre funcionalidades principais',
      status: 'archived',
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-14T16:00:00Z'
    },
    {
      id: 3,
      title: 'Suporte Técnico',
      context: 'Resolução de problemas de integração',
      participants: [2, 5],
      narrative: 'Troubleshooting de API',
      status: 'paused',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T11:30:00Z'
    }
  ]);

  const [loading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  const mockTranscripts: TranscriptEntry[] = [
    {
      id: 1,
      conversationId: 1,
      speakerId: 1,
      content: 'Olá, gostaria de discutir sobre a implementação do chatbot.',
      timestamp: '2024-01-15T10:00:00Z',
      metadata: { sentiment: 'neutral' }
    },
    {
      id: 2,
      conversationId: 1,
      speakerId: 2,
      content: 'Claro! Podemos começar definindo os requisitos principais.',
      timestamp: '2024-01-15T10:01:00Z',
      metadata: { sentiment: 'positive' }
    }
  ];

  const mockSummaries: Summary[] = [
    {
      id: 1,
      conversationId: 1,
      type: 'automatic',
      content: 'Discussão sobre implementação de chatbot com foco em requisitos técnicos.',
      keyPoints: ['Chatbot', 'Requisitos', 'Implementação'],
      timestamp: '2024-01-15T10:30:00Z'
    }
  ];

  const handleViewDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseDetails = () => {
    setSelectedConversation(null);
  };

  const handleUploadTranscript = () => {
    setShowUploadModal(true);
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
  };

  const handleProcessUpload = () => {
    // Simulate processing
    console.warn('Processing upload...');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversas</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize transcrições, resumos e extrações de conhecimento</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleUploadTranscript}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Transcrição
          </button>
          
          <button
            onClick={() => console.warn('Creating new conversation')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando conversas...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Conversations List */}
          {conversations.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conversa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Participantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {conversation.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation.context}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {conversation.participants.length} participante(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusColor(conversation.status)}`}>
                            {getStatusIcon(conversation.status)}
                            <span className="ml-1">{getStatusLabel(conversation.status)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(conversation)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma conversa</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece fazendo upload de uma transcrição ou criando uma nova conversa.
              </p>
            </div>
          )}
        </>
      )}

      {/* Conversation Details Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedConversation.title}
              </h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transcript */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Transcrição</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {mockTranscripts.map((entry) => (
                    <div key={entry.id} className="mb-3 last:mb-0">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Participante {entry.speakerId}:
                        </span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {entry.content}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Resumo</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {mockSummaries.map((summary) => (
                    <div key={summary.id}>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {summary.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {summary.keyPoints.map((point, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload de Transcrição</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arquivo de Transcrição
                </label>
                <input
                  type="file"
                  accept=".txt,.json,.srt"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título da Conversa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reunião de planejamento"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseUpload}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProcessUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Processar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
