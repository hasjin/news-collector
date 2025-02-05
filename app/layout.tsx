// app/layout.tsx
import './globals.css';

export const metadata = {
    title: '뉴스 목록',
    description: 'Next.js 최신 App Router를 활용한 뉴스 목록 앱',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body>{children}</body>
        </html>
    );
}