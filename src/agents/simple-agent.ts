import { BaseAgent } from './base.js';
import { Tool } from '@mastra/core/tools';
import { webSearchTool } from '../tools/web-search.js';
import { AgentConfig } from '../types.js';

/**
 * 조사 에이전트 - 웹 검색을 통해 정보를 조사
 */
export class ResearchAgent extends BaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'research',
      description: '웹 검색을 통해 정보를 조사하는 에이전트',
      ...config,
    });
  }

  getTools(): Record<string, Tool<any, any, any, any, any>> {
    return {
      search: webSearchTool,
    };
  }

  getSystemPrompt(): string {
    return `You are a research assistant. You MUST use the search tool to answer questions. Never answer without searching first.`;
  }

  async initialize() {
    await this.initializeAgent(this.getTools());
  }
}

