'use client';

import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Bot, Info } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  isDarkMode?: boolean;
}

export default function ChatMessage({ message, isDarkMode = false }: ChatMessageProps) {
  const t = useTranslations('chat');

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';

  const getIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    if (isSystem) return <Info className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getRoleLabel = () => {
    if (isUser) return t('user');
    if (isSystem) return t('systemMessage');
    return t('assistant');
  };

  return (
    <div
      className={cn(
        'group relative flex w-full gap-3 p-4',
        isUser && 'justify-end',
        'animate-slide-in'
      )}
    >
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-2',
          isUser && 'items-end'
        )}
      >
        {/* Message header with role and timestamp */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs text-muted-foreground',
            isUser && 'flex-row-reverse'
          )}
        >
          <div className="flex items-center gap-1">
            {getIcon()}
            <span className="font-medium">{getRoleLabel()}</span>
          </div>
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Message content */}
        <div
          className={cn(
            'relative rounded-lg px-4 py-3 shadow-sm',
            isUser && 'bg-primary text-primary-foreground',
            isAssistant && 'bg-muted',
            isSystem && 'bg-secondary border border-border',
            'prose prose-sm max-w-none dark:prose-invert',
            isUser && 'prose-invert'
          )}
        >
          {message.isTyping ? (
            <div className="flex items-center gap-1">
              <span>{t('typing')}</span>
              <div className="flex space-x-1">
                <div className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
                <div className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
                <div className="h-1 w-1 animate-bounce rounded-full bg-current"></div>
              </div>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }: React.ComponentProps<'code'>) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  return !isInline ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f6f8fa',
                        color: isDarkMode ? '#f8f8f2' : '#24292e',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className={cn(
                        'rounded-sm bg-muted px-1.5 py-0.5 text-sm font-mono',
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="mb-2 ml-4 list-disc">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="mb-2 ml-4 list-decimal">{children}</ol>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="mb-2 border-l-4 border-border pl-4 italic">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}