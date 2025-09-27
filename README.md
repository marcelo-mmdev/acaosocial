Merged Project

Instructions:
1. Copy .env.example to .env.local and set DATABASE_URL, NEXTAUTH_SECRET
2. npm install
3. npx prisma generate
4. npx prisma db push
5. npm run dev

Use Prisma Studio to create initial admin user or add a /api/seed route.


## Modificações automáticas pelo assistente
- Substituído API /api/pessoas para usar Prisma/MySQL
- Adicionado upload API para gravar imagens em /public/uploads
- Adicionado formatPhone util em src/lib/formatPhone.ts
- Adicionado script de seed em src/scripts/seed.ts
- Corrigido potenciais erros de undefined nos componentes (recomenda-se revisar).

### Como usar
1. Copie `.env.example` para `.env.local` e configure DATABASE_URL (Hostgator) e NEXTAUTH_SECRET
2. npm install
3. npx prisma generate
4. npx prisma db push
5. npx ts-node ./src/scripts/seed.ts (ou compilar)
6. npm run dev


## Backend endpoints added
- /api/users (GET, POST)
- /api/users/[id] (GET, PUT, DELETE)
- /api/deliveries (GET, POST)
- /api/pessoas supports search, pagination, sort via query params
- /api/pessoas/[id]/qrcode returns QR dataURL


## Novas funções finais
- Validação de CPF no front-end (src/lib/cpf.ts) usada em /pessoas
- Impressão da carteirinha via botão 'Imprimir Carteirinha' na página de detalhe (/pessoas/[id])
- Leitor QR robusto usando html5-qrcode (página /qrcode)

# instalar dependências (se faltar)
npm install

# gerar prisma client
npx prisma generate

# aplicar schema sem migrations (síncrono)
npx prisma db push

# abrir prisma studio para ver dados
npx prisma studio

# seed (opcional)
npx tsx prisma/seed.ts

# rodar dev
npm run dev

