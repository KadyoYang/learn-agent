import { Command } from 'commander';
import { ResearchAgent } from '../agents/simple-agent.js';
import { Logger } from '../utils/logger.js';

const program = new Command();

program
  .name('serina')
  .description('로컬 LLM 기반 조사 에이전트')
  .version('0.1.0');

program
  .command('research')
  .description('조사 요청하기')
  .option('-q, --query <text>', '조사할 주제 (단일 쿼리 모드)')
  .action(async (options) => {
    const agent = new ResearchAgent();
    await agent.initialize();

    // 단일 쿼리 모드
    if (options.query) {
      try {
        console.log(`\n🔍 조사 중...\n`);
        const response = await agent.invoke(options.query);
        console.log(`\n${response}\n`);
        return;
      } catch (error) {
        console.error(`\n❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`);
        process.exit(1);
      }
    }

    // 대화형 모드
    console.log(`\n🔍 조사 에이전트가 준비되었습니다.`);
    console.log('   조사할 주제를 입력하세요.');
    console.log('   종료하려면 "exit" 또는 "quit"를 입력하세요.\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = () => {
      rl.question('> ', async (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
          console.log('\n👋 안녕히 가세요!\n');
          rl.close();
          return;
        }

        if (!input.trim()) {
          askQuestion();
          return;
        }

        try {
          console.log('\n🔍 조사 중...\n');
          const response = await agent.invoke(input);
          console.log(`\n${response}\n`);
        } catch (error) {
          console.error(`\n❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n`);
        }

        askQuestion();
      });
    };

    askQuestion();
  });

program.parse();
