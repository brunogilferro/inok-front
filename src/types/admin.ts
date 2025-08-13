// Identity types
export interface Identity {
  id: number;
  name: string;
  type: 'human' | 'ai' | 'agent';
  metadata: Record<string, unknown>;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Conversation types
export interface Conversation {
  id: number;
  title: string;
  participants: number[];
  context: string;
  narrative: string;
  status: 'active' | 'paused' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptEntry {
  id: number;
  conversationId: number;
  speakerId: number;
  content: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface Summary {
  id: number;
  conversationId: number;
  type: 'automatic' | 'manual';
  content: string;
  keyPoints: string[];
  timestamp: string;
}

// Agent types
export interface Agent {
  id: number;
  name: string;
  description: string;
  model: string;
  parameters: Record<string, unknown>;
  systemPrompt: string;
  tools: string[];
  status: 'active' | 'inactive' | 'training';
  createdAt: string;
  updatedAt: string;
}

// Database types
export interface DatabaseConnection {
  id: number;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error';
  lastCheck: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Memory types
export interface Memory {
  id: number;
  name: string;
  description: string;
  type: 'vector' | 'graph' | 'document';
  provider: string;
  configuration: Record<string, unknown>;
  status: 'active' | 'inactive' | 'indexing';
  documentsCount: number;
  lastIndexed: string;
  createdAt: string;
  updatedAt: string;
}

// Data Flow types
export interface DataFlow {
  id: number;
  name: string;
  description: string;
  source: string;
  destination: string;
  transformations: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
  schedule: string;
  status: 'active' | 'inactive' | 'running' | 'error';
  lastRun: string;
  nextRun: string;
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
