# Sublease - Plataforma de Sublocação de Consultórios

Este é um projeto [Next.js](https://nextjs.org) para uma plataforma de sublocação de consultórios médicos.

## Configuração do Ambiente

Antes de executar o projeto, você precisa configurar as variáveis de ambiente:

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```bash
# Google Maps API Key (obrigatório para mapas interativos)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps_aqui

# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nmxcqiwslkuvdydlsolm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1yVaOKJDGvInFb6z0m-eaA_NFPd0NwN

# Service Role Key (para operações administrativas)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teGNxaXdzbGt1dmR5ZGxzb2xtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5ODc1MSwiZXhwIjoyMDczNzc0NzUxfQ.PYA1g3dYA9bMwWyj66B48g6alyl-Oi_XNEPM8oM2gJ0
```

### Como obter a chave do Google Maps:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Maps JavaScript API"
4. Vá em "Credenciais" e crie uma chave de API
5. Configure as restrições de domínio conforme necessário

## Getting Started

Primeiro, instale as dependências e execute o servidor de desenvolvimento:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
