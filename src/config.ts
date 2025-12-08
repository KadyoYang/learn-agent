import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ollama: {
    model: process.env.OLLAMA_MODEL || 'gemma:2b',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
  debug: process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production',
} as const;

