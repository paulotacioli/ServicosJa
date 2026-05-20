# ServiçoJá

Marketplace de serviços domésticos com matching estilo Tinder.

Stack:
- **Backend:** NestJS + Prisma + JWT + SQLite (trocável por PostgreSQL)
- **Frontend:** React + Vite + TailwindCSS
- **DB:** SQLite (arquivo local, zero setup)

## Como rodar

Você precisa do **Node.js 18+** instalado (https://nodejs.org).

### 1. Backend (terminal 1)

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

API sobe em `http://localhost:3000`.

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

App abre em `http://localhost:5173`.

### 3. Testar

Você verá os dois apps lado a lado (Solicitante e Prestador). O seed já cria:
- 1 solicitante (`maria@demo.com` / senha `demo`)
- 2 prestadores (`joao@demo.com` e `carlos@demo.com` / senha `demo`)
- 2 serviços abertos para você swipar

## Estrutura

```
servicoja/
├── backend/        NestJS API
│   ├── prisma/     Schema, migrations e seed
│   └── src/        Módulos da API
└── frontend/       React + Vite app
    └── src/        Telas e componentes
```

## Migrando para PostgreSQL

Em `backend/prisma/schema.prisma`, troque:
```prisma
datasource db {
  provider = "postgresql"   // era "sqlite"
  url      = env("DATABASE_URL")
}
```

E ajuste `backend/.env`:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/servicoja"
```

Depois rode `npx prisma migrate dev`.

## Próximos passos para produção

- Upload de fotos: trocar mock por S3/Cloudinary
- Push: integrar Firebase Cloud Messaging
- Validação de WhatsApp: integrar Twilio ou WhatsApp Business API
- Deploy: backend no Railway/Render, frontend no Vercel/Netlify
