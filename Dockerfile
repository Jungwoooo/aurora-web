# 1. 포장지 준비 단계 (무거운 툴 다 가져와서 빌드만 딱 하고 버릴 용도)
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 파일 먼저 복사해서 설치 (캐시 활용으로 속도 UP!)
COPY package*.json ./
RUN npm install

# 나머지 소스코드 다 가져와서 Nuxt3 빌드! (.output 폴더가 생성됨)
COPY . .
RUN npm run build

# ==========================================

# 2. 실제 실행 단계 (아주 가벼운 상태로 실행만 하는 용도)
FROM node:20-alpine
WORKDIR /app

# 1번 단계에서 예쁘게 포장된 '.output' 폴더만 쏙 빼옵니다!
COPY --from=builder /app/.output ./.output

# AWS 서버가 밖에서 들어올 수 있게 문(0.0.0.0)을 열어줍니다.
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Nuxt3 엔진(Nitro) 실행 명령어!
CMD ["node", ".output/server/index.mjs"]