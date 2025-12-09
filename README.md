# Serina - 로컬 LLM 기반 조사 에이전트

**Mastra + Ollama**를 활용한 로컬 LLM 기반 조사 에이전트입니다. DuckDuckGo를 통해 웹 검색을 수행합니다.

## 기능

- 🔍 **웹 검색**: DuckDuckGo를 통한 정보 조사
- 🤖 **로컬 LLM**: Ollama를 사용한 완전 로컬 실행
- ⚙️ **간단한 설정**: `.env` 파일로 모델 및 설정 관리
- 🚀 **Mastra 프레임워크**: TypeScript 친화적 AI 에이전트 프레임워크

## 사전 요구사항

1. **Docker & Docker Compose** (Ollama 실행용)
   ```bash
   brew install docker docker-compose
   ```

2. **Node.js** (v22 LTS)
   ```bash
   nvm use
   ```

3. **pnpm**
   ```bash
   brew install pnpm
   ```

## 설치

### 1. Ollama Docker 컨테이너 실행

```bash
# Docker Compose로 Ollama 시작
docker-compose up -d

# 모델 다운로드 (예: gemma:2b)
docker exec -it serina-ollama ollama pull gemma:2b
```

### 2. 프로젝트 의존성 설치

```bash
pnpm install
pnpm build
```

### 3. 환경변수 설정

`.env` 파일 생성:

```env
# Ollama 설정
OLLAMA_MODEL=gemma:2b
OLLAMA_BASE_URL=http://localhost:11434

# 디버그 모드 (선택적)
DEBUG=true
```

## 사용 방법

```bash
# 단일 조사 요청
pnpm dev research -q "Python이 뭐야?"

# 대화형 모드
pnpm dev research
```

## 프로젝트 구조

```
serina/
├── src/
│   ├── agents/
│   │   ├── base.ts          # 기본 에이전트 클래스
│   │   └── simple-agent.ts  # 조사 에이전트
│   ├── tools/
│   │   └── web-search.ts    # DuckDuckGo 검색 툴
│   ├── llm/
│   │   └── ollama.ts        # Ollama 통합
│   ├── cli/
│   │   └── index.ts         # CLI 인터페이스
│   └── config.ts            # 환경변수 설정
├── docker-compose.yml
└── package.json
```

## Docker 관리

```bash
# Ollama 시작
pnpm ollama:up

# Ollama 중지
pnpm ollama:down

# Ollama 로그
pnpm ollama:logs

# 모델 다운로드
docker exec -it serina-ollama ollama pull gemma:2b
```

## 라이선스

MIT
