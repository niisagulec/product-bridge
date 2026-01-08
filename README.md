# Product Bridge (Fullstack)

Bu repo **NestJS (backend)** + **React/Vite (frontend)** ile geliştirilmiş bir fullstack uygulamadır.

## Projenin amacı

Ürünleri; **marka**, **ürün tipi** ve **platform** kırılımlarında yönetip, bir ürünün farklı platformlardaki kayıtlarını ilişkilendirmeyi (“product bridge”) hedefler. Kullanıcı tarafında **kimlik doğrulama** ve **favorileme** gibi temel akışları sağlar.

## Klasörler

- `backend/`: NestJS API (PostgreSQL + TypeORM)
- `frontend/`: React UI (Vite)

## Gereksinimler

- Node.js (öneri: LTS)
- npm
- PostgreSQL

## Hızlı başlangıç (lokal)

### 1) Backend ortam değişkenleri

`backend/env.example` dosyasını kopyalayıp `backend/.env` oluşturun:

```bash
cd backend
cp env.example .env
```

Gerekirse `.env` içindeki değerleri düzenleyin (özellikle `JWT_SECRET` ve PostgreSQL bilgileri).

### 2) Frontend ortam değişkenleri

`frontend/env.example` dosyasını kopyalayıp `frontend/.env` oluşturun:

```bash
cd frontend
cp env.example .env
```

Varsayılan olarak frontend API’yi `http://localhost:3000` adresinden çağırır (`VITE_API_BASE_URL`).

### 3) Bağımlılıkları yükleyin

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 4) Uygulamayı çalıştırın

Backend (API):

```bash
cd backend
npm run start:dev
```

Frontend (UI):

```bash
cd frontend
npm run dev
```

## Varsayılan adresler

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Notlar

- Backend, PostgreSQL bağlantı bilgilerini `backend/.env` içinden okur ve TypeORM tarafında `synchronize: true` olduğu için ilk çalıştırmada şemayı otomatik senkronize eder.
- Backend CORS varsayılanı `http://localhost:5173`’tür (gerekirse `CORS_ORIGIN` ile değiştirin).

