// server.ts
import { createServer } from 'http';
import next from 'next';
import cron from 'node-cron';
import { fetchRSSFeeds } from './lib/fetchRSS';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    // 서버 시작 직후 한 번 실행
    console.log('[INIT] 서버 구동 직후 RSS 피드 업데이트를 시도합니다...');
    try {
        await fetchRSSFeeds();
        console.log('[INIT] 초기 RSS 피드 업데이트가 완료되었습니다.');
    } catch (e) {
        console.error('[INIT] 초기 RSS 피드 업데이트 중 오류 발생:', e);
    }

    // 15분마다 실행: '*/15 * * * *'
    cron.schedule('*/15 * * * *', async () => {
        console.log('RSS 피드 업데이트 시작...');
        try {
            await fetchRSSFeeds();
            console.log('RSS 피드 업데이트 완료.');
        } catch (err) {
            console.error('RSS 피드 업데이트 중 오류 발생:', err);
        }
    });

    createServer((req, res) => {
        handle(req, res);
    }).listen(3000, (err?: any) => {
        if (err) throw err;
        console.log('> http://localhost:3000 에서 실행 중');
    });
});