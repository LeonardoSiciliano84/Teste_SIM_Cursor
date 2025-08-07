# FELKA Transportes - Sistema Integrado de Gestão

## 📋 Visão Geral

O FELKA Transportes é um sistema completo de gestão empresarial desenvolvido especificamente para empresas de transporte e logística. O sistema integra todas as operações essenciais em uma plataforma moderna e intuitiva.

## 🚀 Funcionalidades Principais

### 👥 Gestão de Recursos Humanos
- **Cadastro Completo de Colaboradores**: Dados pessoais, profissionais e documentação
- **Gestão de Ocorrências**: Advertências, suspensões, atestados médicos
- **Controle de Documentos**: Rastreamento de vencimentos e notificações automáticas
- **Gestão de Pessoas Externas**: Sistema para terceiros, clientes e seguranças

### 🚛 Gestão de Veículos
- **Cadastro Detalhado**: Informações técnicas, financeiras e documentação
- **3 Visualizações**: Grade (cards), Lista (tabela) e Classificação (agrupada)
- **Controle Financeiro**: Progresso de pagamentos e valores FIPE
- **Relatórios em PDF**: Fichas completas com identidade visual FELKA

### 🔧 Manutenção Preventiva
- **Sistema Baseado em Quilometragem**: Status automático por KM rodados
- **Controle de Custos**: 8 categorias predefinidas (Mecânica, Elétrica, etc.)
- **Gestão de Pneus**: Controle completo do ciclo de vida dos pneus
- **Check-lists de Motoristas**: Monitoramento de condições dos veículos

### 🔐 Controle de Acesso
- **Sistema CPF/QR Code**: Substituição completa do reconhecimento facial
- **Gestão de Visitantes**: Busca e cadastro por CPF
- **Portal do Segurança**: Interface mobile otimizada para tablets
- **Logs Completos**: Rastreamento de entradas/saídas

### 📅 Agendamento de Cargas
- **Interface Visual**: Calendário interativo com slots de tempo
- **Gestão de Horários**: Controle de disponibilidade em tempo real
- **Notificações**: Email automático para clientes e gestores
- **Política de Cancelamento**: Janela de 3 horas para alterações

### 📊 Dashboard e Relatórios
- **KPIs em Tempo Real**: Indicadores principais da operação
- **Visualizações Dinâmicas**: Gráficos e métricas atualizadas
- **Exportações**: XLSX para dados e PDF com identidade FELKA
- **TV Smart**: Módulo otimizado para displays grandes

### 📂 Importação de Dados
- **Planilhas Excel**: Sistema completo de validação e importação
- **Mapeamento de Campos**: Interface intuitiva para configuração
- **Validação Robusta**: Detecção de duplicatas e erros

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** + TypeScript
- **Vite** para build otimizado
- **shadcn/ui** + Tailwind CSS para interface moderna
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento
- **React Hook Form** + Zod para formulários

### Backend
- **Express.js** + TypeScript
- **Drizzle ORM** para banco de dados
- **PostgreSQL** (Neon serverless)
- **Multer** para upload de arquivos
- **PDFKit** para geração de relatórios

### Infraestrutura
- **Replit** para desenvolvimento e hosting
- **PostgreSQL** para persistência de dados
- **Sistema de sessões** baseado em PostgreSQL

## 🎨 Identidade Visual

- **Cor Principal**: #0C29AB (Azul FELKA)
- **Logo Corporativa**: Aplicada em todos os PDFs e documentos
- **Interface Consistente**: Padrão visual em todo o sistema
- **Responsivo**: Otimizado para desktop, tablet e mobile

## 📱 Portais Específicos

### Portal do Motorista
- **Seleção de Veículo**: Interface touch-friendly
- **Gestão de Pranchas**: Sistema persistente de serviços
- **Documentos**: Acesso a documentação do veículo
- **Comunicação**: Canal direto com manutenção

### Portal do Segurança
- **Controle de Acesso**: Interface mobile otimizada
- **Gestão de Veículos**: Entrada/saída do pátio
- **Visitantes**: Cadastro e controle de terceiros
- **Logs em Tempo Real**: Monitoramento de acessos

## 🏗️ Arquitetura do Sistema

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
├── server/          # Backend Express
│   ├── routes.ts    # Rotas da API
│   ├── storage.ts   # Camada de dados
│   └── db.ts        # Configuração do banco
├── shared/          # Código compartilhado
│   └── schema.ts    # Esquemas do banco de dados
└── migrations/      # Migrações do banco
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta no Replit (recomendado)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/LeonardoSiciliano84/Teste_SIM_Cursor.git
cd Teste_SIM_Cursor

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações
npm run db:push

# Inicie o servidor
npm run dev
```

## 📝 Configuração

### Variáveis de Ambiente
```env
DATABASE_URL=sua_url_do_postgresql
SESSION_SECRET=sua_chave_secreta_de_sessao
```

### Banco de Dados
O sistema utiliza PostgreSQL com Drizzle ORM. As tabelas são criadas automaticamente na primeira execução.

## 🔄 Atualizações Recentes (Janeiro 2025)

- ✅ Sistema de veículos restaurado com navegação baseada em componentes
- ✅ 3 abas de visualização implementadas (Grade, Lista, Classificação)
- ✅ Controle de acesso completo com CPF/QR Code
- ✅ Módulo de agendamento de cargas finalizado
- ✅ Sistema de importação via planilhas Excel
- ✅ Manutenção preventiva baseada em quilometragem
- ✅ Gestão completa de pneus e custos
- ✅ Portal do segurança mobile-friendly
- ✅ Menu hierárquico com responsividade

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais oficiais da FELKA Transportes.

## 📄 Licença

Sistema proprietário da FELKA Transportes. Todos os direitos reservados.

---

**FELKA Transportes** - Tecnologia a serviço da logística