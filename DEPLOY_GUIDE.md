# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO - KVN SUPORTE

## ✅ PRÉ-REQUISITOS
- Sistema funcionando em desenvolvimento ✅
- Conta GitHub ✅
- Repositório criado ✅

---

## 🌐 DEPLOY NA VERCEL (RECOMENDADO)

### **PASSO 1: Criar Conta na Vercel**
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Autorize a Vercel a acessar seus repositórios

### **PASSO 2: Importar Projeto**
1. No dashboard Vercel, clique em "New Project"
2. Selecione o repositório `kvnsuporte`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

### **PASSO 3: Configurar Variáveis de Ambiente**

⚠️ **IMPORTANTE**: Configure TODAS as variáveis antes do primeiro deploy!

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth (OBRIGATÓRIO para produção)
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=chave_secreta_super_longa_64_caracteres_minimo

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=suporte@seudominio.com

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# Pinecone
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=kvn-knowledge-base
```

### **PASSO 4: Deploy**
1. Clique em "Deploy"
2. Aguarde o build (3-5 minutos)
3. ✅ Deploy concluído!

---

## 🔧 CONFIGURAÇÕES PÓS-DEPLOY

### **1. 📧 Configurar SendGrid para Produção**

#### **A. Configurar Domínio**
1. No SendGrid Dashboard → Settings → Sender Authentication
2. Authenticate Your Domain
3. Adicione seu domínio (ex: `seudominio.com`)
4. Configure DNS records:
   - SPF: `v=spf1 include:sendgrid.net ~all`
   - DKIM: (SendGrid fornecerá as chaves)

#### **B. Configurar Webhook**
1. SendGrid → Settings → Mail Settings → Inbound Parse
2. Add Host & URL:
   - **Hostname**: `mail.seudominio.com`
   - **URL**: `https://seu-app.vercel.app/api/webhooks/inbound-email`
   - **Check Spam**: ✅
   - **Send Raw**: ✅

#### **C. Configurar DNS para E-mail**
Adicione estes records DNS no seu provedor:
```dns
# MX Record
mail.seudominio.com    MX    10    mx.sendgrid.net

# CNAME (se necessário)
email.seudominio.com   CNAME    sendgrid.net
```

### **2. 🗄️ Migrar Banco para Produção**

#### **Opção A: Usar Mesmo Neon Database**
- Use a mesma `DATABASE_URL` de desenvolvimento
- **Vantagem**: Já tem dados de teste
- **Desvantagem**: Dados misturados

#### **Opção B: Criar Novo Database (Recomendado)**
1. Neon Dashboard → Create New Database
2. Nome: `kvnsuporte-production`
3. Copie a nova `DATABASE_URL`
4. Atualize no Vercel:
   ```bash
   # Na Vercel Dashboard → Settings → Environment Variables
   DATABASE_URL=nova_url_producao
   ```
5. Redeploy para aplicar migrações

### **3. 🤖 Adicionar Documentos à Base de Conhecimento**

Acesse: `https://seu-app.vercel.app/api/test-pinecone`

Adicione documentos importantes:
- FAQ da empresa
- Manuais de produtos
- Políticas de atendimento
- Procedimentos padrão

### **4. 🔐 Gerar NEXTAUTH_SECRET Seguro**

```bash
# Use este comando para gerar uma chave segura:
openssl rand -base64 32

# Ou online: https://generate-secret.vercel.app/32
```

⚠️ **NUNCA use a mesma chave de desenvolvimento em produção!**

---

## ✅ VERIFICAÇÕES FINAIS

### **Checklist Pós-Deploy:**

- [ ] ✅ Site acessível via HTTPS
- [ ] ✅ Login/cadastro funcionando  
- [ ] ✅ Dashboard carregando
- [ ] ✅ Status do banco: "Conectado"
- [ ] ✅ Webhook SendGrid configurado
- [ ] ✅ E-mail de teste funcionando
- [ ] ✅ Base de conhecimento populada
- [ ] ✅ Variáveis de ambiente configuradas

### **URLs para Testar:**
- `https://seu-app.vercel.app` - Homepage
- `https://seu-app.vercel.app/auth/signin` - Login
- `https://seu-app.vercel.app/signup` - Cadastro
- `https://seu-app.vercel.app/dashboard` - Dashboard
- `https://seu-app.vercel.app/api/status/database` - Status do banco

---

## 🐛 TROUBLESHOOTING PRODUÇÃO

### **Erro 500 - Internal Server Error**
1. Vercel Dashboard → Functions → View Logs
2. Verifique se todas as env vars estão configuradas
3. Confirme se `DATABASE_URL` está correta

### **Erro de Autenticação NextAuth**
1. Confirme `NEXTAUTH_URL` = URL exata do Vercel
2. Gere novo `NEXTAUTH_SECRET`
3. Redeploy após mudanças

### **SendGrid não recebe e-mails**
1. Teste o webhook: `curl -X POST https://seu-app.vercel.app/api/webhooks/inbound-email`
2. Verifique DNS: `nslookup mail.seudominio.com`
3. SendGrid Activity Feed para logs

### **Base de conhecimento vazia**
1. Acesse `/api/test-pinecone`
2. Adicione pelo menos 1 documento
3. Teste busca na interface

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. **📊 Monitoramento**
   - Configure alertas Vercel
   - Monitor de uptime (UptimeRobot)

2. **🔒 Segurança**
   - Implementar rate limiting
   - Logs de auditoria
   - Backup automático

3. **⚡ Performance**
   - CDN para assets
   - Cache strategies
   - Database indexing

4. **📈 Analytics**
   - Google Analytics
   - User behavior tracking
   - Performance metrics

---

## 🏆 SISTEMA PRONTO PARA PRODUÇÃO!

Após seguir este guia, seu sistema KVN Suporte estará:
- ✅ Rodando em produção na Vercel
- ✅ Recebendo e-mails reais via SendGrid
- ✅ Processando com IA (OpenAI)
- ✅ Respondendo automaticamente
- ✅ Monitorado e funcional

**🎉 Parabéns! Seu sistema está no ar!** 🚀
