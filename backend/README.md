# Backend (NestJS API)

Bu klasör, **NestJS** ile yazılmış backend API’yi içerir. Veritabanı olarak **PostgreSQL** kullanır ve **TypeORM** ile bağlanır.

## Gereksinimler

- Node.js (öneri: LTS)
- npm
- PostgreSQL

## Ortam değişkenleri (.env)

`env.example` dosyasını kopyalayıp `.env` oluşturun:

```bash
cp env.example .env
```

`env.example` içindeki başlıca değişkenler:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN` (opsiyonel, varsayılan: `http://localhost:5173`)

## Kurulum

```bash
npm install
```

## Çalıştırma

Backend **3000** portunda çalışır.

```bash
# geliştirme (watch)
npm run start:dev
```

```bash
# prod build
npm run build

# prod run
npm run start:prod
```

## Test / Lint

```bash
npm run test
npm run test:e2e
npm run lint
```

## Notlar

- TypeORM tarafında `synchronize: true` açık olduğu için, tabloları ilk çalıştırmada otomatik oluşturur/günceller (lokal geliştirme için uygun; prod ortamında kontrollü migration tercih edilir).
