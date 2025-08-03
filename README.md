# FELKA Transportes - Sistema de Gestão

Sistema completo de gestão de transportes desenvolvido para a FELKA Transportes, oferecendo funcionalidades avançadas para gerenciamento de veículos, motoristas, rotas e operações.

## 🚀 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL com Drizzle ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Autenticação:** Sistema baseado em sessões
- **Estado:** TanStack Query

## 📋 Funcionalidades

### 🏢 Gestão Administrativa
- **Dashboard:** Visão geral com métricas e gráficos
- **Gestão de Veículos:** CRUD completo com múltiplas abas (Principal, Financeira, Documentação, Técnica)
- **Gestão de Motoristas:** Cadastro completo com dados da CNH e informações pessoais
- **RH:** Sistema completo de gestão de colaboradores com documentos e ocorrências
- **Relatórios:** Exportação em XLSX e PDF com marca da empresa

### 📱 Portal do Motorista
- Interface mobile-otimizada
- Seleção de veículos
- Checklist de saída com validação
- Sistema de prancha com persistência
- Comunicação de sinistros
- Acesso a documentos

### 🔧 Funcionalidades Técnicas
- **Persistência de Serviços:** Sistema de prancha com restauração automática
- **Gerenciamento de Documentos:** Upload, download e controle de vencimento
- **Geração de PDFs:** Relatórios com timbrado oficial da empresa
- **Validação:** Formulários com Zod e React Hook Form
- **Responsividade:** Interface adaptável para desktop e mobile

## 🏗️ Arquitetura

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Tipos e schemas compartilhados
├── uploads/         # Arquivos enviados
└── backups/         # Backups do sistema
```

## 🔐 Sistema de Autenticação

- **Administrador:** Acesso completo ao sistema
- **Usuário:** Acesso limitado às funcionalidades
- **Motorista:** Acesso apenas ao portal mobile

### Contas de Teste
- **Admin:** admin@felka.com / admin123
- **Motorista:** motorista@felka.com / admin123

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas

### Instalação
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Executar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
NODE_ENV=development
```

## 📝 Principais Módulos

### Gestão de Veículos
- Cadastro completo com informações técnicas e financeiras
- Controle de documentação com alertas de vencimento
- Geração de relatórios personalizados
- Sistema de manutenção integrado

### Portal do Motorista
- Checklist de saída com foto obrigatória
- Seleção automática de placas
- Sistema de prancha persistente
- Comunicação de sinistros simplificada

### Sistema de RH
- Gestão completa de colaboradores
- Controle de documentos e CNH
- Sistema de ocorrências (advertências, suspensões)
- Geração de relatórios em PDF

## 🎨 Identidade Visual

- **Cores principais:** Azul FELKA (#0C29AB)
- **Timbrado:** Logotipo oficial em PDFs
- **Interface:** Design clean e profissional
- **Idioma:** Português brasileiro

## 📄 Exportações

- **XLSX:** Todos os relatórios e listas
- **PDF:** Documentos oficiais com timbrado
- **Formato:** Dados estruturados para análise

## 🔄 Atualizações Recentes

### Versão Atual
- ✅ Corrigido campo de seleção de placas no formulário de sinistros
- ✅ Removidas colunas desnecessárias na gestão de motoristas
- ✅ Implementado modal completo de dados do motorista com CNH
- ✅ Corrigido sistema de checklist no portal do motorista
- ✅ Melhorado sistema de validação e feedback visual

## 📞 Suporte

Sistema desenvolvido para FELKA Transportes com foco em produtividade e eficiência operacional.

---

**FELKA Transportes** - Sistema de Gestão Integrado