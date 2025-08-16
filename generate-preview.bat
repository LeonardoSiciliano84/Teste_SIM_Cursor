@echo off
echo 🚀 Iniciando geração de preview...

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

REM Construir o projeto
echo 🔨 Construindo o projeto...
call npm run build

REM Preparar para deploy
echo 🌐 Preparando para deploy...
copy env.production .env.production

REM Gerar URL de preview
echo 🔗 Gerando URL de preview...
echo https://felka-transporte-preview.vercel.app

echo ✅ Preview gerado com sucesso!
echo 🌟 Acesse: https://felka-transporte-preview.vercel.app
echo.
echo Credenciais de teste:
echo - Admin: admin@felka.com / admin123
echo - User: user@felka.com / user123
echo - Driver: driver@felka.com / driver123

