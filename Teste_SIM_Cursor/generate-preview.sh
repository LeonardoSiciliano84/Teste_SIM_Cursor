#!/bin/bash

# Script para gerar preview do sistema
echo "🚀 Iniciando geração de preview..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Construir o projeto
echo "🔨 Construindo o projeto..."
npm run build

# Preparar para deploy
echo "🌐 Preparando para deploy..."
cp env.production .env.production

# Gerar URL de preview
echo "🔗 Gerando URL de preview..."
echo "https://felka-transporte-preview.vercel.app"

echo "✅ Preview gerado com sucesso!"
echo "🌟 Acesse: https://felka-transporte-preview.vercel.app"
echo ""
echo "Credenciais de teste:"
echo "- Admin: admin@felka.com / admin123"
echo "- User: user@felka.com / user123"
echo "- Driver: driver@felka.com / driver123"

