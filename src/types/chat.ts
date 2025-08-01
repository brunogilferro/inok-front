export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}