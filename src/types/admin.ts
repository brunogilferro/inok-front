// Identity types
export interface Identity {
  id: number;
  name: string;
  type: 'human' | 'ai' | 'agent';
  description?: string;
  metadata: Record<string, unknown>;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Conversation types
export interface ConversationParticipant {
  id: number;
  conversationId: number;
  identityId: number;
  createdAt: string;
  updatedAt: string;
  identity: Identity;
}

export interface Conversation {
  id: number;
  title: string;
  context: string;
  narrative?: string;
  status: 'active' | 'archived' | 'processing';
  conversationParticipants: ConversationParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptEntry {
  id: number;
  conversationId: number;
  speakerId: number;
  content: string;
  confidence?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Summary {
  id: number;
  conversationId: number;
  type: 'conversation' | 'topic' | 'action_items';
  content: string;
  keyPoints?: string[];
  aiGenerated?: boolean;
  timestamp: string;
}

export interface Knowledge {
  id: number;
  conversationId: number;
  content: string;
  type: string;
  tags?: string[];
  confidence?: number;
  timestamp: string;
}

// Agent types
export interface Agent {
  id: number;
  name: string;
  type: 'llm' | 'custom' | 'integration';
  status: 'active' | 'inactive' | 'error';
  parameters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Database types
export interface DatabaseConnection {
  id: number;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastCheck?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Memory types
export interface Memory {
  id: number;
  name: string;
  description: string;
  type: 'vector' | 'graph' | 'document' | 'rag';
  provider?: string;
  configuration?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'indexing';
  documentsCount: number;
  lastIndexed?: string;
  createdAt: string;
  updatedAt: string;
}

// Data Flow types
export interface DataFlow {
  id: number;
  name: string;
  description: string;
  type: 'etl' | 'stream' | 'batch';
  source?: string;
  destination?: string;
  transformations?: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
  schedule?: string;
  status: 'active' | 'inactive' | 'running' | 'error';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
