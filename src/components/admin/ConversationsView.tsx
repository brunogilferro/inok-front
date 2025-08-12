'use client';

import { useState } from 'react';
import { Plus, Upload, MessageSquare, FileText, Brain, Send, Play, Pause, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Conversation, ConversationDetail, TranscriptEntry, Summary, KnowledgeEntry } from '@/types/admin';

export default function ConversationsView() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Reunião de Planejamento Q1',
      context: 'Reunião semanal para alinhamento de objetivos do primeiro trimestre',
      participants: ['1', '2', '3'],
      narrative: 'Discussão sobre metas, recursos necessários e cronograma de entregas',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Suporte ao Cliente - Ticket #1234',
      context: 'Atendimento ao cliente sobre problema técnico',
      participants: ['2', '4'],
      narrative: 'Cliente reportou erro no sistema, análise e solução implementada',
      status: 'archived',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for selected conversation
  const mockConversationDetail: ConversationDetail = {
    id: '1',
    title: 'Reunião de Planejamento Q1',
    context: 'Reunião semanal para alinhamento de objetivos do primeiro trimestre',
    participants: ['1', '2', '3'],
    narrative: 'Discussão sobre metas, recursos necessários e cronograma de entregas',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    transcript: [
      {
        id: '1',
        speakerId: '1',
        content: 'Bom dia, vamos começar nossa reunião de planejamento. Primeiro, vamos revisar as metas do Q1.',
        timestamp: new Date('2024-01-15T09:00:00'),
        confidence: 0.95,
      },
      {
        id: '2',
        speakerId: '2',
        content: 'Perfeito. Analisando os números, precisamos focar em aumentar a retenção de clientes em 15%.',
        timestamp: new Date('2024-01-15T09:02:00'),
        confidence: 0.92,
      },
      {
        id: '3',
        speakerId: '3',
        content: 'Concordo. Vou preparar um plano de ação detalhado para a próxima semana.',
        timestamp: new Date('2024-01-15T09:05:00'),
        confidence: 0.88,
      },
    ],
    summaries: [
      {
        id: '1',
        content: 'Reunião focou no planejamento do Q1 com ênfase na retenção de clientes e preparação de plano de ação.',
        type: 'conversation',
        timestamp: new Date('2024-01-15T09:10:00'),
        aiGenerated: true,
      },
    ],
    knowledgeBase: [
      {
        id: '1',
        content: 'Meta Q1: Aumentar retenção de clientes em 15%',
        source: 'transcript',
        tags: ['metas', 'retenção', 'Q1'],
        confidence: 0.9,
        createdAt: new Date('2024-01-15T09:10:00'),
      },
    ],
  };

  const handleNewConversation = () => {
    setShowNewConversationForm(true);
  };

  const handleImportData = () => {
    // Implementar lógica de importação
    alert('Funcionalidade de importação será implementada');
  };

  const handleProcessMessage = async () => {
    if (!processingMessage.trim()) return;
    
    setIsProcessing(true);
    
    // Simular processamento
    setTimeout(() => {
      // Adicionar mensagem processada
      const newEntry: KnowledgeEntry = {
        id: Date.now().toString(),
        content: processingMessage,
        source: 'manual',
        tags: ['processado', 'manual'],
        confidence: 0.8,
        createdAt: new Date(),
      };
      
      // Aqui você atualizaria o estado da conversa
      console.log('Nova entrada processada:', newEntry);
      
      setProcessingMessage('');
      setIsProcessing(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'archived':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
      case 'archived':
        return 'Arquivada';
      case 'processing':
        return 'Processando';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
          <p className="text-gray-600">Gerencie logs, transcrições e resumos das conversas</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImportData}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </button>
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversas Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedConversation(mockConversationDetail)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">{conversation.title}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(conversation.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(conversation.status)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{conversation.context}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{conversation.participants.length} participantes</span>
                    <span>Criado em {conversation.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Detail View */}
      {selectedConversation && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedConversation.title}</h2>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Conversation Data */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Dados Principais</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contexto</label>
                    <p className="text-sm text-gray-600 mt-1">{selectedConversation.context}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Participantes</label>
                    <p className="text-sm text-gray-600 mt-1">{selectedConversation.participants.length} participantes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Narrativa</label>
                    <p className="text-sm text-gray-600 mt-1">{selectedConversation.narrative}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedConversation.status)}
                      <span className="text-sm text-gray-600">{getStatusLabel(selectedConversation.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Transcript and Summaries */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Transcrição</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedConversation.transcript.map((entry) => (
                    <div key={entry.id} className="bg-white rounded p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Participante {entry.speakerId}</span>
                        <span>{entry.timestamp.toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-900">{entry.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Resumos</h3>
                <div className="space-y-3">
                  {selectedConversation.summaries.map((summary) => (
                    <div key={summary.id} className="bg-white rounded p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="capitalize">{summary.type}</span>
                        <span>{summary.timestamp.toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-900">{summary.content}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {summary.aiGenerated ? 'Gerado por IA' : 'Manual'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Processing Area */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Área de Processamento</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Chat de Validação</h4>
                    <div className="space-y-3">
                      <textarea
                        value={processingMessage}
                        onChange={(e) => setProcessingMessage(e.target.value)}
                        placeholder="Digite sua mensagem para processar..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleProcessMessage}
                        disabled={isProcessing || !processingMessage.trim()}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Processar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Base de Conhecimento</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedConversation.knowledgeBase.map((entry) => (
                        <div key={entry.id} className="text-xs bg-gray-100 rounded p-2">
                          <p className="text-gray-900">{entry.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-500">Confiança: {entry.confidence * 100}%</span>
                            <span className="text-gray-500">{entry.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Conversation Form Modal */}
      {showNewConversationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Nova Conversa</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Reunião de Planejamento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexto</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o contexto da conversa"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewConversationForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
