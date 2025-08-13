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
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [savingConversation, setSavingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes in dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with a welcome message
  useEffect(() => {
    setMounted(true);
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      content: `# Bem-vindo ao INOK Memory! 🧠

Sou seu assistente IA, pronto para ajudá-lo com várias tarefas no sistema INOK. Posso:

- **Responder perguntas** sobre o sistema e suas funcionalidades
- **Explicar recursos** como identidades, conversas, agentes e memórias
- **Orientar sobre** o uso do painel administrativo
- **Ajudar com** dúvidas técnicas e processos
- **E muito mais!**

${isAuthenticated ? 
  `Olá **${user?.name}**! Suas conversas podem ser salvas automaticamente no sistema. ` : 
  'Para salvar conversas, faça login no sistema. '}

Sinta-se à vontade para me perguntar qualquer coisa. Como posso ajudá-lo hoje?`,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, [isAuthenticated, user]);

  // Create a new conversation in the backend
  const createConversation = async (firstMessage: string) => {
    if (!isAuthenticated) return null;
    
    try {
      setSavingConversation(true);
      const token = apiClient.getToken();
      
      if (!token) return null;

      const response = await fetch('/api/chat', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Chat - ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          context: `Conversa de chat iniciada com: "${firstMessage.substring(0, 100)}${firstMessage.length > 100 ? '...' : ''}"`,
        }),
      });

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
        setConversationTitle(data.title);
        toast.success('Conversa criada e será salva automaticamente');
        return data.conversationId;
      }
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('Não foi possível criar a conversa, mas você pode continuar chatando');
    } finally {
      setSavingConversation(false);
    }
    
    return null;
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Show typing indicator
    const typingMessage: ChatMessageType = {
      id: 'typing',
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // If this is the first user message and we're authenticated, create a conversation
      let currentConversationId = conversationId;
      if (!conversationId && isAuthenticated && messages.length <= 1) {
        currentConversationId = await createConversation(content);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication if available
      const token = apiClient.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          locale: i18n.language,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Replace typing message with actual response
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(assistantMessage));
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessage: ChatMessageType = {
        id: 'error-' + Date.now(),
        content: mounted ? t('chat.errorMessage', { 
          defaultValue: 'Ops! Algo deu errado. Por favor, tente novamente.' 
        }) : 'Ops! Algo deu errado. Por favor, tente novamente.',
        role: 'system',
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setConversationTitle('');
    
    // Re-add welcome message
    const welcomeMessage: ChatMessageType = {
      id: 'welcome-new',
      content: `# Nova Conversa Iniciada! 🆕

Como posso ajudá-lo desta vez?`,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INOK Memory</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {conversationTitle ? (
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {conversationTitle}
                    </span>
                  ) : (
                    'Interface de Chat com IA'
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startNewConversation}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Nova Conversa"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nova
                  </button>
                  
                  {conversationId && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Save className="w-4 h-4 mr-1" />
                      Salvo
                      {savingConversation && (
                        <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin ml-2" />
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {mounted ? t('chat.placeholder', { defaultValue: 'Digite uma mensagem...' }) : 'Digite uma mensagem...'}
                  </p>
                  <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">
                    Comece uma conversa digitando uma mensagem abaixo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="border-t bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>Dica:</strong> Faça login para salvar suas conversas e ter acesso completo ao sistema INOK.
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-4xl">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={
              isLoading 
                ? 'Aguardando resposta...' 
                : mounted 
                  ? t('chat.inputPlaceholder', { defaultValue: 'Digite sua mensagem...' })
                  : 'Digite sua mensagem...'
            }
          />
        </div>
      </div>
    </div>
  );
}