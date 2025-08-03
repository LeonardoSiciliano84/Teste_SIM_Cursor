# FELKA Transportes - Sistema de Gestão Integrado

## 🚛 Visão Geral

Sistema abrangente de gestão de transportes desenvolvido para a FELKA Transportes, oferecendo controle completo de veículos, motoristas, rotas, reservas e análises. Construído com React no frontend e Express.js no backend, apresenta uma interface moderna usando shadcn/ui e Drizzle ORM para funcionalidades CRUD completas.

## 🎯 Funcionalidades Principais

### 🚗 Gestão de Veículos
- **CRUD Completo**: Cadastro, edição e exclusão de veículos
- **Informações Detalhadas**: Dados principais, financeiros, documentação e técnicos organizados em abas
- **Controle de Documentos**: Upload e gerenciamento de documentos com rastreamento de vencimento
- **Relatórios PDF**: Geração de relatórios com marca FELKA e dados corporativos
- **Exportação XLSX**: Relatórios exportáveis em formato Excel

### 👥 Gestão de RH e Departamento Pessoal
- **Cadastro Completo de Colaboradores**: Dados pessoais, profissionais e documentos
- **Gestão de Documentos**: Controle de vencimentos com alertas visuais
- **Sistema de Ocorrências**: Advertências, suspensões, atestados médicos com geração de PDF
- **Portal do Motorista**: Interface mobile otimizada para motoristas
- **Controle de Acesso**: Sistema baseado em CPF e QR Code

### 🔧 Sistema de Manutenção Integrado
- **Kanban de Processos**: Fluxo completo em 4 estágios (Aberto → Em Andamento → Aguardando → Concluído)
- **Lançamento de Custos**: Sistema completo com 8 classificações predefinidas
- **Controle de Pneus**: Módulo integrado para gestão completa do ciclo de vida dos pneus
- **Rastreabilidade Total**: Histórico completo de todas as operações

### 🛞 Módulo de Controle de Pneus
- **Dashboard Dinâmico**: Indicadores em tempo real (Total, Em Uso, Recapagem, Alertas)
- **Cadastro de Pneus**: Número do fogo, marca, modelo, medida, tipo, valor de compra
- **Movimentações**: Entrada, instalação, rodízio, recapagem, descarte, venda, perda
- **Sistema de Rodízios**: Controle de trocas entre eixos e lados
- **Gestão de Recapagens**: Controle de vida útil e empresas recapadoras
- **Alertas Automáticos**: Sistema de notificações para rodízios e recapagens necessárias
- **Relatórios Exportáveis**: Dados em formato XLSX com filtros configuráveis

### 🚪 Controle de Acesso
- **Sistema CPF/QR Code**: Substituição completa do reconhecimento facial
- **Gestão de Visitantes**: Busca e cadastro baseado em CPF
- **Controle de Funcionários**: QR Code automático para todos os colaboradores
- **Portal do Segurança**: Interface mobile otimizada para operações de portaria
- **Controle de Veículos**: Entrada e saída de veículos com rastreamento completo
- **Logs Detalhados**: Histórico completo de acessos separado por abas

### 📊 Dashboard e Analytics
- **KPIs em Tempo Real**: Veículos, motoristas, rotas ativas
- **Gráficos de Receita**: Análise mensal e tendências
- **Estatísticas de Manutenção**: OS abertas, em andamento, concluídas
- **Indicadores de Pneus**: Status, alertas e movimentações

## 🏗️ Arquitetura Técnica

### Frontend
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (baseado em Radix UI)
- **Estilização**: Tailwind CSS
- **Gerenciamento de Estado**: TanStack Query
- **Roteamento**: Wouter
- **Formulários**: React Hook Form com validação Zod

### Backend
- **Framework**: Express.js com TypeScript
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL (configurado para Neon serverless)
- **Sessões**: PostgreSQL session store com connect-pg-simple
- **Padrão API**: Endpoints REST

### Banco de Dados
#### Tabelas Principais:
- **users**: Sistema de usuários com roles (admin, user, driver)
- **vehicles**: Gestão completa de veículos
- **drivers**: Cadastro de motoristas
- **employees**: Sistema de RH completo
- **maintenance_requests**: Ordens de serviço de manutenção
- **cost_entries**: Lançamentos de custos de manutenção
- **tires**: Cadastro de pneus
- **tire_movements**: Movimentações de pneus
- **tire_rotations**: Rodízios de pneus
- **tire_alerts**: Sistema de alertas automáticos
- **access_logs**: Logs de controle de acesso
- **vehicle_access_logs**: Controle de entrada/saída de veículos

## 🎨 Identidade Visual

- **Cor Corporativa**: #0C29AB (Azul FELKA)
- **Logo**: Implementação do cabeçalho oficial FELKA em PDFs
- **Idioma**: Português Brasileiro
- **Padrão de Documentos**: Cabeçalho timbrado da empresa em todos os relatórios

## 📋 Funcionalidades Recentes (Janeiro 2025)

### ✅ Sistema de Controle de Acesso Completo
- Substituição total do reconhecimento facial por sistema CPF/QR Code
- Remoção completa de dependências face-api.js
- Portal do segurança mobile-otimizado
- Controle integrado de veículos

### ✅ Módulo de Manutenção Aprimorado
- Sistema Kanban com 4 estágios funcionais
- Lançamento de custos com 8 classificações
- Cálculo automático de valores (quantidade × preço unitário)
- Remoção da aba almoxarifado conforme solicitação

### ✅ Módulo de Controle de Pneus
- Sistema completo seguindo especificações PRD
- Dashboard com indicadores dinâmicos
- 6 sub-abas organizadas: Dashboard, Cadastro, Movimentações, Rodízios, Recapagens, Alertas
- Schema completo no banco de dados
- Sistema de alertas automáticos
- Rastreabilidade total do ciclo de vida

### ✅ Portal do Motorista
- Interface mobile otimizada
- Gestão de serviços de prancha persistentes
- Acesso para admins com banner de supervisão
- Sistema de comunicação para manutenção

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas (DATABASE_URL, etc.)

### Instalação
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd felka-transport-system

# Instale as dependências
npm install

# Configure o banco de dados
npm run db:push

# Execute em desenvolvimento
npm run dev
```

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL=postgresql://[conexao_postgresql]
PGHOST=localhost
PGPORT=5432
PGDATABASE=felka_db
PGUSER=postgres
PGPASSWORD=sua_senha
```

## 📁 Estrutura do Projeto

```
felka-transport-system/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
├── server/                # Backend Express
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Interface de armazenamento
│   └── db.ts             # Configuração do banco
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas Drizzle e validações Zod
├── migrations/           # Migrações do banco
└── uploads/             # Arquivos uploadados
```

## 🔐 Sistema de Autenticação

- **Autenticação baseada em sessão**
- **Roles de usuário**: admin, user, driver
- **Controle de acesso baseado em roles**
- **Rotas protegidas**

## 📊 Relatórios e Exportações

- **Formato PDF**: Relatórios com marca FELKA e cabeçalho timbrado
- **Formato XLSX**: Todas as exportações de dados
- **Filtros Configuráveis**: Por período, status, tipo, etc.
- **Dados Autênticos**: Sem uso de dados mock ou sintéticos

## 🔧 Manutenção e Pneus

### Sistema Kanban de Manutenção
1. **Aberto**: Solicitações aguardando início
2. **Em Andamento**: Manutenções em execução
3. **Aguardando**: Pendências externas
4. **Concluído**: Serviços finalizados

### Classificações de Custos
1. Mecânica
2. Elétrica  
3. Estrutural
4. Acessórios
5. Pintura
6. Freio
7. Ar-condicionado
8. Lanternagem

### Controle de Pneus
- **Número do Fogo**: Código único e permanente
- **Tipos**: Direcional, Tração, Arrasto, Misto
- **Status**: Ativo, Em Uso, Recapagem, Perda, Vendido, Descartado
- **Movimentações**: Entrada, Instalação, Rodízio, Recapagem, Descarte, Venda, Perda
- **Alertas Automáticos**: Job diário às 03:00 para verificar limites

## 📱 Interfaces Mobile

- **Portal do Motorista**: Interface touch-friendly para motoristas
- **Portal do Segurança**: Interface otimizada para controle de acesso
- **Design Responsivo**: Adaptação automática para diferentes tamanhos de tela

## 🎯 Próximos Passos

- Implementação de APIs para conectividade com sistemas externos
- Sistema de notificações push
- Relatórios avançados com BI
- Integração com sistemas de telemetria
- App mobile nativo

## 📞 Suporte

Sistema desenvolvido especificamente para FELKA Transportes com foco em:
- **Usabilidade**: Interface intuitiva em português brasileiro
- **Confiabilidade**: Dados autênticos e rastreabilidade completa
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Manutenibilidade**: Código organizado e documentado

## 🏆 Padrões de Qualidade

- **TypeScript**: Tipagem forte em todo o projeto
- **Validação Zod**: Schemas validados no frontend e backend
- **Componentização**: Componentes reutilizáveis e modulares
- **Responsividade**: Interface adaptativa para todos os dispositivos
- **Acessibilidade**: Componentes com suporte a screen readers
- **Performance**: Otimizado com lazy loading e cache inteligente

---

**Desenvolvido com ❤️ para FELKA Transportes**  
*Sistema integrado de gestão de transportes - Janeiro 2025*