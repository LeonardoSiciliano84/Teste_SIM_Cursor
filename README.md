# Sistema de Gestão de Transportes - FELKA

Sistema completo de gestão de frotas, motoristas, manutenção e controle de acesso para empresas de transporte.

## 🚀 Funcionalidades

- **Dashboard** - Visão geral da frota e indicadores
- **Gestão de Veículos** - Cadastro, edição e monitoramento
- **Motoristas** - Controle de motoristas e documentos
- **Manutenção** - Agendamento e controle de manutenção preventiva
- **Controle de Acesso** - Sistema de portaria com QR Code
- **Almoxarifado** - Gestão de estoque e materiais
- **Sinistros** - Registro e acompanhamento de ocorrências
- **Portal do Motorista** - Interface específica para motoristas
- **Importação de Dados** - Importação em lote via Excel

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, TypeScript
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Autenticação**: Sistema próprio com sessões
- **Upload**: Multer para arquivos

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (ou Supabase Database)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sim_felka_cursor_diretorio
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na raiz do projeto
DATABASE_URL="postgresql://postgres.project-id:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
PORT=3000
NODE_ENV=development
```

## 🚀 Execução

### Modo Desenvolvimento

**Linux/Mac:**
```bash
# Configure as variáveis de ambiente
export DATABASE_URL="postgresql://user:password@localhost:5432/testdb"
export PORT="3000"
export NODE_ENV="development"

# Execute o servidor
npm run dev
```

**Windows:**
```bash
# Configure as variáveis de ambiente
$env:DATABASE_URL="postgresql://user:password@localhost:5432/testdb"
$env:PORT="3000"
$env:NODE_ENV="development"

# Execute o servidor
npm run dev:win
```

### Modo Produção

**Linux/Mac:**
```bash
# Build do projeto
npm run build

# Execute o servidor
npm start
```

**Windows:**
```bash
# Build do projeto
npm run build

# Execute o servidor
npm run start:win
```

## 🌐 Acesso

- **URL**: http://localhost:3000
- **Credenciais de Teste**:
  - Admin: admin@felka.com / admin123
  - Motorista: joao.silva@felka.com / driver123

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e configurações
│   │   └── hooks/         # Custom hooks
├── server/                 # Backend Express
│   ├── routes.ts          # Rotas da API
│   ├── storage.ts         # Lógica de dados
│   └── db.ts             # Configuração do banco
├── shared/                # Schemas compartilhados
└── migrations/            # Migrações do banco
```

## 🔐 Autenticação

O sistema possui três níveis de acesso:
- **Admin**: Acesso completo ao sistema
- **User**: Acesso limitado às funcionalidades básicas
- **Driver**: Acesso apenas ao portal do motorista

## 📊 APIs Principais

- `GET /api/dashboard/stats` - Estatísticas do dashboard
- `GET /api/vehicles` - Lista de veículos
- `GET /api/drivers` - Lista de motoristas
- `GET /api/employees` - Lista de funcionários
- `POST /api/access-control/qrcode` - Controle de acesso via QR Code

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se a DATABASE_URL está configurada
   - Certifique-se de que o PostgreSQL está rodando

2. **Erro ENOTSUP no Windows**
   - O servidor foi configurado para usar localhost ao invés de 0.0.0.0

3. **Porta já em uso**
   - Altere a variável PORT para uma porta disponível

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request