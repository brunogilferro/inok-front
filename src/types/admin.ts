export interface Identity {
  id: string;
  name: string;
  type: 'agent' | 'human' | 'ai';
  description?: string;
  avatar?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  context: string;
  participants: string[]; // IDs das identidades
  narrative: string;
  status: 'active' | 'archived' | 'processing';
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetail extends Conversation {
  transcript: TranscriptEntry[];
  summaries: Summary[];
  knowledgeBase: KnowledgeEntry[];
}

export interface TranscriptEntry {
  id: string;
  speakerId: string;
  content: string;
  timestamp: Date;
  confidence?: number;
}

export interface Summary {
  id: string;
  content: string;
  type: 'conversation' | 'topic' | 'action_items';
  timestamp: Date;
  aiGenerated: boolean;
}

export interface KnowledgeEntry {
  id: string;
  content: string;
  source: 'transcript' | 'summary' | 'manual';
  tags: string[];
  confidence: number;
  createdAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: 'llm' | 'custom' | 'integration';
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Database {
  id: string;
  name: string;
  type: 'postgresql' | 'mongodb' | 'mysql' | 'redis' | 'vector';
  connectionString: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  createdAt: Date;
}

export interface Memory {
  id: string;
  name: string;
  type: 'rag' | 'vector' | 'document';
  description: string;
  status: 'active' | 'inactive' | 'processing';
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  type: 'etl' | 'streaming' | 'batch';
  status: 'active' | 'inactive' | 'error';
  nodes: FlowNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: 'input' | 'process' | 'output';
  name: string;
  parameters: Record<string, any>;
  connections: string[]; // IDs dos nós conectados
}
