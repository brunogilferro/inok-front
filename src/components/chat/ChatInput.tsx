'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, className }: ChatInputProps) {
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={cn('border-t border-border bg-background p-4', className)}>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            disabled={disabled}
            className={cn(
              'min-h-[44px] max-h-[200px] resize-none border-0 bg-muted/50 focus:bg-muted/70 transition-colors',
              'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground'
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={!canSend}
          size="icon"
          className={cn(
            'h-11 w-11 shrink-0 transition-all',
            canSend
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">{t('send')}</span>
        </Button>
      </form>
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        <span className="hidden sm:inline">Enter to send, Shift+Enter for new line</span>
        <span className="sm:hidden">Tap send or use Enter</span>
      </div>
    </div>
  );
}