import { Agent } from '@mastra/core/agent';
import { Tool } from '@mastra/core/tools';
import { AgentConfig } from '../types.js';
import { createOllamaLLM } from '../llm/ollama.js';
import { Logger } from '../utils/logger.js';

export abstract class BaseAgent {
  protected agent: Agent | null = null;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  protected async initializeAgent(tools: Record<string, Tool<any, any, any, any, any>>) {
    Logger.agent(`에이전트 초기화 시작: ${this.config.name}`, {
      tools: Object.keys(tools),
      model: this.config.model,
    });

    const llm = createOllamaLLM(this.config.model, this.config.temperature);
    const systemPrompt = this.getSystemPrompt();

    this.agent = new Agent({
      name: this.config.name,
      instructions: systemPrompt,
      model: llm,
      tools,
    });

    Logger.agent(`에이전트 초기화 완료: ${this.config.name}`);
  }

  async invoke(input: string): Promise<string> {
    if (!this.agent) {
      throw new Error('Agent가 초기화되지 않았습니다. initializeAgent()를 먼저 호출하세요.');
    }

    try {
      Logger.agent(`요청 수신: ${this.config.name}`, { input });
      
      // AI SDK v4 모델 호환성을 위해 generateLegacy 사용
      const result = await this.agent.generateLegacy(input);
      
      Logger.agent(`응답 완료: ${this.config.name}`, { 
        outputLength: result.text?.length || 0 
      });
      
      return result.text || '';
    } catch (error) {
      Logger.error(`에이전트 실행 오류: ${this.config.name}`, error);
      throw new Error(
        `에이전트 실행 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }

  abstract getTools(): Record<string, Tool<any, any, any, any, any>>;
  abstract getSystemPrompt(): string;
}

