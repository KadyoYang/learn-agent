import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import { ToolResult } from '../types.js';
import { Logger } from '../utils/logger.js';

// Wikipedia + DuckDuckGo API 사용
async function searchWeb(query: string): Promise<ToolResult> {
  Logger.search(query, 'Wikipedia & DuckDuckGo');
  try {
    // 1. Wikipedia 검색 시도 (더 신뢰성 있음)
    try {
      const wikiResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: query,
          srlimit: 3,
          origin: '*',
        },
        headers: {
          'User-Agent': 'Serina-Agent/0.1.0 (Educational Project)',
        },
        timeout: 10000,
      });

      if (wikiResponse.data?.query?.search?.length > 0) {
        const results = wikiResponse.data.query.search.map((item: any) => ({
          title: item.title,
          snippet: item.snippet.replace(/<[^>]+>/g, ''), // HTML 태그 제거
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
        }));

        return {
          success: true,
          data: {
            results: results,
            query: query,
            source: 'Wikipedia',
          },
        };
      }
    } catch (wikiError) {
      Logger.warn(`Wikipedia 검색 실패: ${wikiError}`);
    }

    // 2. DuckDuckGo Instant Answer API 시도
    const ddgResponse = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1',
      },
      timeout: 10000,
    });

    const data = ddgResponse.data;
    
    // Abstract 결과가 있으면 반환
    if (data.AbstractText) {
      return {
        success: true,
        data: {
          abstract: data.AbstractText,
          url: data.AbstractURL,
          heading: data.Heading,
          source: 'DuckDuckGo Instant Answer',
        },
      };
    }

    // RelatedTopics가 있으면 반환
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics.slice(0, 5).map((topic: any) => {
        if (topic.Text) {
          return {
            text: topic.Text,
            url: topic.FirstURL,
          };
        }
        return null;
      }).filter(Boolean);

      if (topics.length > 0) {
        return {
          success: true,
          data: {
            relatedTopics: topics,
            source: 'DuckDuckGo Related Topics',
          },
        };
      }
    }

    return {
      success: false,
      error: '검색 결과를 찾을 수 없습니다. 다른 검색어를 시도해보세요.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '웹 검색 중 오류가 발생했습니다.',
    };
  }
}

export const webSearchTool = new Tool({
  id: 'search',
  description: 'Search the web for information using DuckDuckGo. Use this tool to find latest news, technical information, and answers to general questions.',
  inputSchema: z.object({
    query: z.string().describe('The search query or keywords to search for'),
  }),
  execute: async ({ context }) => {
    const query = context.query;
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

