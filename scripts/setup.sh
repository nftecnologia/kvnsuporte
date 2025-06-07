#!/bin/bash

echo "🚀 Setup do KVN Suporte - Sistema de Suporte Inteligente"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    print_error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
    exit 1
fi

print_status "Node.js $(node --version) encontrado"

# Instalar dependências
print_info "Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependências instaladas com sucesso"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# Copiar .env.example para .env se não existir
if [ ! -f ".env" ]; then
    print_info "Criando arquivo .env..."
    cp .env.example .env
    print_status "Arquivo .env criado"
    print_warning "IMPORTANTE: Configure as variáveis no arquivo .env antes de continuar"
else
    print_info "Arquivo .env já existe"
fi

# Verificar se DATABASE_URL está configurada
if grep -q "your_database_url_here" .env 2>/dev/null; then
    print_warning "Configure DATABASE_URL no arquivo .env"
    print_info "1. Crie um banco no Neon: https://neon.tech"
    print_info "2. Copie a URL de conexão"
    print_info "3. Cole no arquivo .env"
else
    # Gerar Prisma Client
    print_info "Gerando Prisma Client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        print_status "Prisma Client gerado"
        
        # Executar migrações se DATABASE_URL estiver configurada
        print_info "Executando migrações do banco de dados..."
        npx prisma migrate dev --name init
        
        if [ $? -eq 0 ]; then
            print_status "Migrações executadas com sucesso"
        else
            print_warning "Erro nas migrações. Verifique DATABASE_URL"
        fi
    else
        print_warning "Erro ao gerar Prisma Client"
    fi
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
print_info "Próximos passos:"
echo "1. Configure as variáveis no arquivo .env"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000"
echo ""
print_info "Para deploy em produção, consulte: DEPLOY_GUIDE.md"
echo ""
print_status "Sistema pronto para uso! 🚀"
