export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  model?: string;
  temperature?: number;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

