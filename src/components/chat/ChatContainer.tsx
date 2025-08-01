'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
// import { cn } from '@/lib/utils'; // Commented out as it's not used in this component

export default function ChatContainer() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    const welcomeMessage: ChatMessageType = {
      id: 'welcome',
      content: `# Welcome to INOK Memory! 🧠

I'm your AI assistant, ready to help you with various tasks. I can:

- Answer questions and provide explanations
- Help with coding and technical issues
- Assist with writing and content creation
- Analyze and process information
- And much more!

Feel free to ask me anything. What would you like to explore today?`,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, []);

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
      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          locale: locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
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
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      const errorMessage: ChatMessageType = {
        id: 'error-' + Date.now(),
        content: t('errorMessage'),
        role: 'system',
        timestamp: new Date(),
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              I
            </div>
            <div>
              <h1 className="text-lg font-semibold">INOK Memory</h1>
              <p className="text-xs text-muted-foreground">AI Chat Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">{t('placeholder')}</p>
                  <p className="text-sm mt-2">Start a conversation by typing a message below.</p>
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

      {/* Input */}
      <div className="shrink-0">
        <div className="mx-auto max-w-4xl">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}