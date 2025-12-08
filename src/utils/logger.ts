import { config } from '../config.js';

export class Logger {
  private static isDebug = config.debug;

  static log(message: string, ...args: any[]) {
    if (this.isDebug) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]) {
    if (this.isDebug) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.isDebug) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  static agent(action: string, details?: any) {
    if (this.isDebug) {
      console.log(`\n🤖 [AGENT] ${action}`);
      if (details) {
        console.log(JSON.stringify(details, null, 2));
      }
    }
  }

  static tool(toolName: string, input: any, output?: any) {
    if (this.isDebug) {
      console.log(`\n🔧 [TOOL] ${toolName}`);
      console.log(`   입력:`, input);
      if (output) {
        console.log(`   출력:`, typeof output === 'string' ? output.substring(0, 200) + '...' : output);
      }
    }
  }

  static search(query: string, source: string) {
    if (this.isDebug) {
      console.log(`\n🔍 [SEARCH] ${source}`);
      console.log(`   쿼리: "${query}"`);
    }
  }
}

