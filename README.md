# Kvn Suporte - Sistema de Suporte Inteligente

Sistema de suporte ao cliente com IA integrada, que recebe e-mails automaticamente, cria tickets, consulta base de conhecimento e gera respostas automáticas usando OpenAI GPT-4.

## 🚀 Funcionalidades

- **Recepção de E-mails**: Webhook SendGrid para receber e-mails automaticamente
- **IA Integrada**: Geração de respostas automáticas com OpenAI GPT-4
- **Base de Conhecimento**: Busca semântica com Pinecone
- **CRM Integrado**: Gestão completa de tickets e clientes
- **Automação**: Workflows automatizados com Trigger.dev
- **Dashboard**: Interface web para gerenciar tickets

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Banco de Dados**: Neon Postgres
- **Autenticação**: NextAuth.js
- **E-mail**: SendGrid (Inbound Parse + Mail Send)
- **IA**: OpenAI GPT-4 Turbo + Embeddings
- **Vector DB**: Pinecone
- **Estado**: React Query (@tanstack/react-query)
- **Validação**: Zod + React Hook Form
- **Automação**: Trigger.dev

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd kvnsuporte
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# SendGrid
SENDGRID_API_KEY="sua-chave-sendgrid"
SENDGRID_FROM_EMAIL="suporte@seudominio.com"

# OpenAI
OPENAI_API_KEY="sua-chave-openai"

# Pinecone
PINECONE_API_KEY="sua-chave-pinecone"
PINECONE_ENVIRONMENT="seu-environment"
PINECONE_INDEX="kvn-knowledge-base"

# Trigger.dev
TRIGGER_API_KEY="sua-chave-trigger"
TRIGGER_API_URL="https://api.trigger.dev"
```

4. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

5. **Executar em desenvolvimento**
```bash
npm run dev
```

## 🔧 Configuração dos Serviços

### SendGrid
1. Crie uma conta no SendGrid
2. Gere uma API Key
3. Configure o Inbound Parse para: `https://seudominio.com/api/webhooks/inbound-email`
4. Configure o domínio de envio

### Neon Postgres
1. Crie um banco no Neon
2. Copie a URL de conexão para `DATABASE_URL`

### OpenAI
1. Crie uma conta na OpenAI
2. Gere uma API Key
3. Adicione créditos à conta

### Pinecone
1. Crie uma conta no Pinecone
2. Crie um índice com dimensão 1536 (para embeddings OpenAI)
3. Copie a API Key e environment

## 📝 Uso

### 1. Adicionando Documentos à Base de Conhecimento
```typescript
import { KnowledgeBaseService } from '@/services/knowledge-base.service';

await KnowledgeBaseService.addDocument(
  'doc-1',
  'Como usar o produto',
  'Conteúdo do documento...',
  {
    category: 'tutorial',
    filename: 'tutorial.pdf',
    fileType: 'pdf'
  }
);
```

### 2. Testando o Webhook
Envie um e-mail para o endereço configurado no SendGrid. O sistema irá:
1. Receber o e-mail
2. Criar/atualizar ticket
3. Buscar na base de conhecimento
4. Gerar resposta com IA
5. Enviar resposta automática

### 3. Acessando o Dashboard
1. Acesse `/auth/signin`
2. Faça login com suas credenciais
3. Visualize tickets em `/dashboard`

## 📊 Estrutura do Projeto

```
src/
├── app/                    # App Router Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
├── hooks/                 # React Query hooks
│   ├── useQueries/        # Hooks de consulta
│   └── useMutations/      # Hooks de mutação
├── lib/                   # Configurações
├── services/              # Serviços externos
├── types/                 # Tipos TypeScript
└── utils/                 # Utilitários
```

## 🔗 Endpoints da API

- `GET /api/webhooks/inbound-email` - Health check do webhook
- `POST /api/webhooks/inbound-email` - Receber e-mails do SendGrid
- `GET /api/auth/[...nextauth]` - Autenticação NextAuth
- `POST /api/auth/[...nextauth]` - Autenticação NextAuth

## 🐛 Troubleshooting

### Erro de Autenticação NextAuth
- Verifique se `NEXTAUTH_SECRET` está configurado
- Certifique-se que `NEXTAUTH_URL` está correto

### Erro no Banco de Dados
```bash
npx prisma db reset
npx prisma migrate dev
```

### Erro do SendGrid
- Verifique se a API Key tem permissões de envio
- Confirme se o webhook está configurado corretamente

### Erro do OpenAI
- Verifique se há créditos na conta
- Confirme se a API Key está ativa

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Railway/Fly.io
Siga a documentação específica de cada plataforma.

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato.
