import { ChatOllama } from '@langchain/ollama';
import { config } from '../config.js';

export function createOllamaLLM(model?: string, temperature = 0.3) {
  // ReAct 에이전트는 더 낮은 temperature가 도구 호출 일관성을 높임
  // gemma:2b 같은 작은 모델은 낮은 temperature로 더 결정론적인 출력 생성
  return new ChatOllama({
    model: model || config.ollama.model,
    baseUrl: config.ollama.baseUrl,
    temperature,
  });
}

