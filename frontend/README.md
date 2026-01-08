# Frontend (React + Vite)

Bu klasör, **React + TypeScript + Vite** ile yazılmış frontend uygulamasını içerir.

## Gereksinimler

- Node.js (öneri: LTS)
- npm

## Ortam değişkenleri (.env)

`env.example` dosyasını kopyalayıp `.env` oluşturun:

```bash
cp env.example .env
```

Kullanılan değişkenler:

- `VITE_API_BASE_URL`: Backend API base URL (varsayılan: `http://localhost:3000`)

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm run dev
```

Varsayılan olarak Vite `http://localhost:5173` üzerinde çalışır.

## Build / Preview

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```
