// app/page.tsx (예시)
import { PrismaClient, Article, Prisma } from '@prisma/client';
import { format } from 'date-fns';
import SearchForm from '../components/SearchForm';

const prisma = new PrismaClient();

export default async function Page({
                                     searchParams,
                                   }: {
  searchParams?: Promise<{
    outlet?: string;
    date?: string;
    search?: string;
  }>;
}) {
  const data = searchParams ? await searchParams : {};

  const outlet = data.outlet;
  const date = data.date;
  const search = data.search;

  // 날짜 계산
  const today = date ? new Date(date) : new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const where: Prisma.ArticleWhereInput = {
    pubDate: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  if (outlet && outlet.trim() !== '') {
    where.source = outlet;
  }
  if (search && search.trim() !== '') {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  // DB 조회
  const articles: Article[] = await prisma.article.findMany({
    where,
    orderBy: { pubDate: 'desc' },
  });

  // 전체 언론사 목록
  const outletsData = await prisma.article.findMany({
    select: { source: true },
    distinct: ['source'],
  });
  const outlets: string[] = outletsData.map((o) => o.source);

  return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-center mb-6">뉴스 목록</h1>
          <SearchForm
              initialOutlet={outlet || ''}
              initialDate={format(today, 'yyyy-MM-dd')}
              initialSearch={search || ''}
              outlets={outlets}
          />
          <ul className="space-y-6">
            {articles.map((article) => (
                <li key={article.id} className="bg-white p-6 rounded shadow">
                  <h3 className="text-xl font-semibold mb-2">
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {article.source} | {new Date(article.pubDate).toLocaleString()}
                  </p>

                  {/* HTML 태그 보존된 content를 dangerouslySetInnerHTML로 출력 */}
                  <div
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: article.content || '' }}
                  />
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}