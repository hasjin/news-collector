// lib/fetchRSS.ts
import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';
import he from 'he';
import sanitizeHtml from 'sanitize-html';

interface Feed {
    source: string;
    url: string;
}

const prisma = new PrismaClient();
const parser = new Parser();

/**
 * 불완전 엔티티도 처리하기 위한 함수
 */
function decodeCustomEntities(text: string): string {
    let decoded = he.decode(text);
    const customMap: Record<string, string> = {
        'hellip;': '…',
        'quot;': '"',
        'apos;': "'",
        'amp;': '&',
        '#039;': "'",
        // 필요시 추가
    };

    for (const [badEntity, realChar] of Object.entries(customMap)) {
        decoded = decoded.replace(new RegExp(badEntity, 'g'), realChar);
    }
    return decoded;
}

// 각 태그마다 허용할 속성
const allowedTags = [
    'p', 'b', 'i', 'strong', 'em', 'u', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'img', 'a', 'ul', 'ol', 'li', 'br', 'hr', 'span', 'div',
    // ...상황에 따라 추가
];
const allowedAttributes = {
    // 각 태그별 허용 속성
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    table: ['border', 'cellpadding', 'cellspacing', 'width', 'height'],
    '*': ['style'], // 모든 태그에 style 허용
};

function sanitizeContent(raw: string): string {
    return sanitizeHtml(raw, {
        allowedTags,
        allowedAttributes,
        // 허용된 태그 외에는 제거
        // 스크립트, iframe 등 제거
    });
}

const feeds: Feed[] = [
    { source: 'YTN(연합뉴스TV)', url: 'http://www.yonhapnewstv.co.kr/category/news/politics/feed/' },
    { source: 'YNA(연합뉴스)', url: 'https://www.yna.co.kr/rss/politics.xml' },

];

/**
 * RSS 피드 파싱 + DB 삽입
 * HTML 태그(이미지, 테이블 등)를 보존하고 싶으므로
 * sanitizeHtml로 XSS 위험 요소를 걸러낸 후 DB에 저장
 */
export async function fetchRSSFeeds(): Promise<void> {
    for (const feed of feeds) {
        console.log(`[INFO] 피드 가져오는 중: ${feed.source} (${feed.url})`);
        try {
            const parsed = await parser.parseURL(feed.url);
            console.log(`[INFO] "${feed.source}" 기사 수: ${parsed.items.length}`);

            for (const item of parsed.items) {
                let content = item.contentSnippet || item.content || '';
                // 1) 엔티티 디코딩
                content = decodeCustomEntities(content);
                // 2) 불필요한 script 등 제거하되 <img>, <table> 등 허용
                content = sanitizeContent(content);

                // 제목도 마찬가지 (태그가 들어올 일은 적지만 혹시 모르니)
                let title = decodeCustomEntities(item.title || '');
                // 제목에는 굳이 <img> 등이 들어가지 않을 테니
                // sanitize해서 태그 제거/허용 원하는 대로 적용
                title = sanitizeHtml(title, {
                    allowedTags: [],       // 제목은 태그 전부 제거
                    allowedAttributes: {},
                });

                const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

                // DB 저장
                try {
                    await prisma.article.create({
                        data: {
                            title,     // 깔끔히 정제된 제목
                            link: item.link || '',
                            content,   // <img>, <table> 등이 포함된 본문
                            pubDate: pubDate,
                            source: feed.source,
                        },
                    });
                    console.log(`[INSERT] ${feed.source} | ${title.slice(0, 30)}...`);
                } catch {
                    console.log(`[DUPLICATE] ${feed.source} | ${title.slice(0, 30)}...`);
                }
            }
        } catch (error) {
            console.error(`[ERROR] 피드 불러오기 오류: ${feed.source} (${feed.url}):`, error);
        }
    }
}