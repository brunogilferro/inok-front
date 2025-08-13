'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LanguageSelector from '../LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Save, Plus, MessageSquare } from 'lucide-react';

export default function ChatContainer() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [savingConversation, setSavingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      content: t('chat.welcome', 'Olá! Eu sou o assistente da INOK. Como posso ajudá-lo hoje? Posso responder perguntas sobre nosso sistema de gestão de identidades, conversas, agentes e muito mais.'),
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [t]);

  // Create conversation when user sends first message
  const createConversation = async (firstMessage: string) => {
    if (!isAuthenticated) return null;

    try {
      setSavingConversation(true);
      
      const response = await fetch('/api/chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({
          title: `Chat - ${new Date().toLocaleDateString('pt-BR')}`,
          context: `Conversa iniciada com: "${firstMessage.substring(0, 100)}..."`,
        }),
      });

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        setConversationTitle(data.title);
        return data.conversationId;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error creating conversation:', errorMessage);
      toast.error('Erro ao criar conversa');
      return null;
    } finally {
      setSavingConversation(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create conversation if this is the first user message and user is authenticated
      let currentConversationId = conversationId;
      if (!conversationId && isAuthenticated && messages.length === 1) {
        currentConversationId = await createConversation(content);
      }

      // Send message to API
      const token = apiClient.getToken();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message: content,
          locale: i18n.language,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error sending message:', errorMessage);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      
      const errorMessage2: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage2]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setConversationTitle('');
    
    // Reset welcome message
    const welcomeMessage: ChatMessageType = {
      id: 'welcome-new',
      content: t('chat.welcome', 'Olá! Eu sou o assistente da INOK. Como posso ajudá-lo hoje?'),
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {conversationTitle || 'Chat INOK'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Assistente inteligente
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* New conversation button */}
          <button
            onClick={startNewConversation}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Nova conversa"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </button>

          {/* Saved indicator */}
          {conversationId && (
            <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-md">
              {savingConversation ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Salvo
            </div>
          )}

          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Authentication notice */}
      {!isAuthenticated && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            <span className="font-medium">Dica:</span> Faça login para salvar suas conversas automaticamente.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}