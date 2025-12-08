import { ChatOllama } from '@langchain/ollama';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// Tool 타입은 LangChain의 DynamicStructuredTool을 기반으로 함
type Tool = any;
import { AgentConfig } from '../types.js';
import { createOllamaLLM } from '../llm/ollama.js';
import { Logger } from '../utils/logger.js';
import { config } from '../config.js';

export abstract class BaseAgent {
  protected llm: ChatOllama;
  protected executor: AgentExecutor | null = null;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.llm = createOllamaLLM(config.model, config.temperature);
  }

  protected async initializeAgent(tools: Tool[]) {
    Logger.agent(`에이전트 초기화 시작: ${this.config.name}`, {
      tools: tools.map(t => t.name),
      model: this.config.model,
    });

    // LangChain Hub에서 기본 ReAct 프롬프트 가져오기
    const prompt = await pull<ChatPromptTemplate>('hwchase17/react');

    const agent = await createReactAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    this.executor = new AgentExecutor({
      agent,
      tools,
      verbose: config.debug, // 디버그 모드에서 LangChain 내부 로깅 활성화
      maxIterations: 10, // 조사 작업은 더 많은 반복이 필요할 수 있음
    });

    Logger.agent(`에이전트 초기화 완료: ${this.config.name}`);
  }

  async invoke(input: string): Promise<string> {
    if (!this.executor) {
      throw new Error('Agent가 초기화되지 않았습니다. initializeAgent()를 먼저 호출하세요.');
    }

    try {
      Logger.agent(`요청 수신: ${this.config.name}`, { input });
      
      // system prompt를 입력에 포함
      const systemPrompt = this.getSystemPrompt();
      const enhancedInput = `${systemPrompt}\n\nUser question: ${input}`;
      
      Logger.log(`System Prompt: ${systemPrompt.substring(0, 100)}...`);
      
      // AgentExecutor가 agent_scratchpad를 자동으로 관리
      const result = await this.executor.invoke({ input: enhancedInput });
      
      Logger.agent(`응답 완료: ${this.config.name}`, { 
        outputLength: result.output?.length || 0 
      });
      
      return result.output;
    } catch (error) {
      Logger.error(`에이전트 실행 오류: ${this.config.name}`, error);
      throw new Error(
        `에이전트 실행 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }

  abstract getTools(): Tool[];
  abstract getSystemPrompt(): string;
}

