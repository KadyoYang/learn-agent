import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { ToolResult } from '../types.js';
import { Logger } from '../utils/logger.js';

// DuckDuckGo Instant Answer API 사용 (API 키 불필요)
async function searchWeb(query: string): Promise<ToolResult> {
  Logger.search(query, 'DuckDuckGo');
  try {
    // DuckDuckGo Instant Answer API
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1',
      },
      timeout: 10000,
    });

    const data = response.data;
    
    // 결과가 있으면 반환
    if (data.AbstractText) {
      return {
        success: true,
        data: {
          abstract: data.AbstractText,
          url: data.AbstractURL,
          heading: data.Heading,
        },
      };
    }

    // Abstract가 없으면 RelatedTopics에서 정보 추출
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics.slice(0, 3).map((topic: any) => ({
        text: topic.Text || topic.FirstURL,
        url: topic.FirstURL,
      }));

      return {
        success: true,
        data: {
          relatedTopics: topics,
        },
      };
    }

    return {
      success: false,
      error: '검색 결과를 찾을 수 없습니다.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '웹 검색 중 오류가 발생했습니다.',
    };
  }
}

const baseWebSearchTool = new DynamicStructuredTool({
  name: 'search',
  description: 'Search the web for information using DuckDuckGo. Use this tool to find latest news, technical information, and answers to general questions.',
  schema: z.object({
    query: z.string().describe('The search query or keywords to search for'),
  }),
  func: async ({ query }) => {
    Logger.tool('search', { query });
    const result = await searchWeb(query);
    if (result.success) {
      const output = JSON.stringify(result.data, null, 2);
      Logger.tool('search', { query }, output);
      return output;
    }
    Logger.warn(`웹 검색 실패: ${result.error}`);
    return `오류: ${result.error}`;
  },
});

// 문자열 입력을 자동으로 객체로 변환하는 래퍼
export const webSearchTool = {
  ...baseWebSearchTool,
  async call(arg: string | { query: string }, ...args: any[]) {
    const normalizedArg = typeof arg === 'string' ? { query: arg } : arg;
    return baseWebSearchTool.call(normalizedArg as { query: string }, ...args);
  },
} as typeof baseWebSearchTool;

