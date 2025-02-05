## Getting Started

First, install all requirements:

```bash
npm install
```

Then, make docker image

```bash
docker build -t news-collector .
```

And run docker

```bash
docker run -p 3000:3000 news-collector
```

### 뉴스 사이트 추가하기
[fetchRSS.ts](lib/fetchRSS.ts)
파일의 feeds 에 배열 형태로 추가 해주면 됨

### RSS는 어디서 찾는가?
각 신문사나 뉴스 페이지에서 RSS 서비스와 관련된 페이지가 있을 경우 해당 페이지에서 URL을 찾아 넣으면 됨
