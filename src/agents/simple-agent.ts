import { BaseAgent } from './base.js';
// Tool 타입은 BaseAgent에서 정의됨
type Tool = any;
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

  getTools(): Tool[] {
    return [webSearchTool];
  }

  getSystemPrompt(): string {
    // LangChain의 ReAct 프롬프트가 이미 형식을 정의하므로 최소한의 지시만
    return `You are a research assistant. You MUST use the search tool to answer questions. Never answer without searching first.`;
  }

  async initialize() {
    await this.initializeAgent(this.getTools());
  }
}

