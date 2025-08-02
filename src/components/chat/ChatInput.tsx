'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    setMounted(true);
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
            placeholder={mounted ? t('chat.placeholder') : 'Type a message...'}
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
          <span className="sr-only">{mounted ? t('chat.send') : 'Send'}</span>
        </Button>
      </form>
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        <span className="hidden sm:inline">{mounted ? t('chat.enterToSend') : 'Enter to send, Shift+Enter for new line'}</span>
        <span className="sm:hidden">{mounted ? t('chat.tapToSend') : 'Tap send or use Enter'}</span>
      </div>
    </div>
  );
}