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