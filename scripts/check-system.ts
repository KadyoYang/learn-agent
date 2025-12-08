#!/usr/bin/env tsx
import { execSync } from 'child_process';

interface SystemInfo {
  hostMemory: number; // GB
  dockerMemory: number; // GB
  availableMemory: number; // GB
  currentModels: string[];
}

interface ModelRecommendation {
  name: string;
  size: string;
  memoryRequired: number; // GB
  description: string;
  recommended: boolean;
}

async function getSystemInfo(): Promise<SystemInfo> {
  try {
    // 호스트 메모리 확인
    const hostMemOutput = execSync('sysctl hw.memsize', { encoding: 'utf-8' });
    const hostMemory = parseInt(hostMemOutput.split(':')[1].trim()) / 1024 / 1024 / 1024;

    // Docker 메모리 확인
    const dockerInfo = execSync('docker info 2>&1 | grep "Total Memory"', { encoding: 'utf-8' });
    const dockerMemoryMatch = dockerInfo.match(/([\d.]+)\s*GiB/i);
    const dockerMemory = dockerMemoryMatch ? parseFloat(dockerMemoryMatch[1]) : 0;

    // 컨테이너 사용 가능 메모리 확인
    const containerMem = execSync(
      'docker exec serina-ollama free -h 2>/dev/null | grep Mem || echo "0"',
      { encoding: 'utf-8' }
    );
    const availableMatch = containerMem.match(/available:\s*([\d.]+)\s*Gi/i);
    const availableMemory = availableMatch ? parseFloat(availableMatch[1]) : dockerMemory * 0.8;

    // 현재 모델 목록
    const modelsOutput = execSync('docker exec serina-ollama ollama list 2>&1', { encoding: 'utf-8' });
    const currentModels = modelsOutput
      .split('\n')
      .slice(1)
      .filter(line => line.trim())
      .map(line => line.split(/\s+/)[0])
      .filter(Boolean);

    return {
      hostMemory,
      dockerMemory,
      availableMemory,
      currentModels,
    };
  } catch (error) {
    console.error('시스템 정보 확인 실패:', error);
    return {
      hostMemory: 16,
      dockerMemory: 8,
      availableMemory: 6,
      currentModels: [],
    };
  }
}

function getRecommendations(availableMemory: number): ModelRecommendation[] {
  const recommendations: ModelRecommendation[] = [
    {
      name: 'qwen2.5:3b',
      size: '~2.0 GB',
      memoryRequired: 2.5,
      description: '한국어 지원 우수, ReAct 성능 좋음, 3B 모델 중 최고',
      recommended: availableMemory >= 2.5 && availableMemory < 4,
    },
    {
      name: 'phi3:mini',
      size: '~2.3 GB',
      memoryRequired: 2.5,
      description: 'Microsoft 경량 모델, 빠르고 효율적',
      recommended: availableMemory >= 2.5 && availableMemory < 4,
    },
    {
      name: 'gemma:2b',
      size: '~1.7 GB',
      memoryRequired: 2.0,
      description: '가장 작음, 하지만 ReAct 일관성 낮음',
      recommended: availableMemory < 2.5,
    },
    {
      name: 'gemma:7b',
      size: '~5.0 GB',
      memoryRequired: 6.4,
      description: '성능 우수, ReAct 잘 따름, 메모리 많이 필요',
      recommended: availableMemory >= 6.4,
    },
    {
      name: 'llama3.1:8b',
      size: '~4.7 GB',
      memoryRequired: 6.0,
      description: '최신 기능, 좋은 성능',
      recommended: availableMemory >= 6.0 && availableMemory < 6.4,
    },
    {
      name: 'mistral:7b',
      size: '~4.1 GB',
      memoryRequired: 5.5,
      description: '균형잡힌 성능',
      recommended: availableMemory >= 5.5 && availableMemory < 6.0,
    },
  ];

  return recommendations.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.memoryRequired - b.memoryRequired;
  });
}

async function main() {
  console.log('\n🔍 시스템 정보 확인 중...\n');

  const systemInfo = await getSystemInfo();

  console.log('📊 시스템 정보:');
  console.log(`   호스트 메모리: ${systemInfo.hostMemory.toFixed(1)} GB`);
  console.log(`   Docker 할당 메모리: ${systemInfo.dockerMemory.toFixed(1)} GB`);
  console.log(`   사용 가능 메모리: ${systemInfo.availableMemory.toFixed(1)} GB`);
  console.log(`   현재 다운로드된 모델: ${systemInfo.currentModels.join(', ') || '없음'}\n`);

  const recommendations = getRecommendations(systemInfo.availableMemory);
  const recommended = recommendations.find(r => r.recommended);

  console.log('💡 모델 추천:\n');

  if (recommended) {
    console.log(`✅ 추천 모델: ${recommended.name}`);
    console.log(`   크기: ${recommended.size}`);
    console.log(`   필요 메모리: ${recommended.memoryRequired} GB`);
    console.log(`   설명: ${recommended.description}\n`);

    console.log('📝 .env 파일에 다음을 설정하세요:');
    console.log(`   OLLAMA_MODEL=${recommended.name}\n`);

    console.log('다운로드 명령어:');
    console.log(`   pnpm ollama:pull ${recommended.name}\n`);
  } else {
    console.log('⚠️  사용 가능한 메모리가 부족합니다.');
    console.log('   Docker Desktop 메모리 할당을 늘리거나 더 작은 모델을 사용하세요.\n');
  }

  console.log('📋 모든 모델 옵션:\n');
  recommendations.forEach((model, index) => {
    const status = model.recommended ? '✅ 추천' : systemInfo.availableMemory >= model.memoryRequired ? '✅ 가능' : '❌ 부족';
    console.log(`${index + 1}. ${model.name} (${model.size})`);
    console.log(`   ${status} - 필요: ${model.memoryRequired} GB`);
    console.log(`   ${model.description}\n`);
  });
}

main().catch(console.error);

