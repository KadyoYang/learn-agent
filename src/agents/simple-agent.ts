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
    return `You are a research assistant. Your job is to search the web and provide accurate information.

Available tool:
- search: Search the web for information using DuckDuckGo

CRITICAL RULES:
1. ALWAYS use the "search" tool (exactly "search" without any commas or extra characters) to find information
2. NEVER make up information - always use the search tool first
3. After calling the tool, wait for the Observation (the tool result will be provided automatically)
4. NEVER write "Observation:" yourself - the system will provide it
5. After seeing the Observation, write "Thought:" then "Final Answer:"
6. For Action Input, use JSON format: {"query": "your search query"}
7. IMPORTANT: Use exactly "search" as the Action name, nothing else

Examples:
- "Python이 뭐야?" → Action: search, Action Input: {"query": "Python programming language"}
- "최신 AI 뉴스 알려줘" → Action: search, Action Input: {"query": "latest AI news 2025"}
- "TypeScript란?" → Action: search, Action Input: {"query": "TypeScript programming language"}`;
  }

  async initialize() {
    await this.initializeAgent(this.getTools());
  }
}

