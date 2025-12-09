import { ollama } from 'ollama-ai-provider';
import { config } from '../config.js';

export function createOllamaLLM(model?: string, temperature = 0.3) {
  return ollama(model || config.ollama.model);
}

