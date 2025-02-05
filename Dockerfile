# Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.json 및 package-lock.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 전체 소스 복사
COPY . .

# Prisma 클라이언트 생성 및 마이그레이션 실행
RUN npx prisma generate
RUN npx prisma migrate deploy

# Next.js 앱 빌드
RUN npm run build

# 3000 포트 오픈
EXPOSE 3000

# 커스텀 서버 실행
CMD ["npx", "ts-node", "server.ts"]
