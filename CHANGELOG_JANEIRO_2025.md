# Changelog - Janeiro 2025

## [2025-01-07] - Sistema de Veículos Restaurado

### ✨ Novas Funcionalidades
- **3 Abas de Visualização no Módulo Veículos**:
  - 🔲 **Grade**: Visualização em cards (layout original)
  - 📋 **Lista**: Formato tabela profissional com colunas organizadas
  - 📊 **Classificação**: Agrupamento por categoria com estatísticas

### 🔧 Melhorias Técnicas
- Restaurada arquitetura original baseada em componentes
- Removidas rotas desnecessárias que quebravam a navegação
- Preservada navegação interna: `VehicleList → VehicleDetails/VehicleForm`
- Mantidas todas as funcionalidades existentes

### 🏗️ Arquitetura
- **Estrutura Correta**: `VehicleList` como componente principal
- **Navegação Interna**: Sem rotas separadas para detalhes
- **Compatibilidade**: 100% compatível com sistema anterior

---

## [2025-01-06] - Importação de Dados via Planilha

### ✨ Novas Funcionalidades
- **Sistema Completo de Importação Excel**:
  - 📊 Validação robusta de dados
  - 🔍 Detecção de duplicatas
  - 🗂️ Mapeamento de campos intuitivo
  - ❌ Relatório detalhado de erros

### 🏗️ Melhorias na Organização
- **Menu "Configurações"** criado
- Importação movida de "Colaboradores" para "Configurações"
- Interface mais organizada e intuitiva

---

## [2025-01-05] - Manutenção Preventiva por Quilometragem

### ✨ Transição Completa
- **Sistema Baseado em KM**: Substituição do sistema por classificação
- **Status Automático**: Calculado dinamicamente por quilometragem
  - 🟢 **Em dia**: >3000km restantes
  - 🟡 **Agendar**: 2000-3000km restantes
  - 🟠 **Em revisão**: 0-2000km restantes
  - 🔴 **Vencido**: <0km (ultrapassou)

### 🔧 Funcionalidades Técnicas
- **Check-lists de Motoristas**: Controle de quilometragem atual
- **API Endpoints**: Novas rotas para manutenção e check-lists
- **Dados de Teste**: Registros completos para validação

---

## [2025-01-04] - Menu Hierárquico e Responsividade

### 🎨 Redesign da Navegação
- **Estrutura Hierárquica**: Menu organizado em categorias
- **4 Categorias Principais**:
  - 📊 Dashboards
  - 👥 Colaboradores (5 subitens)
  - 📦 Almoxarifado
  - 🔐 Controle de Acesso

### 📱 Mobile-First
- **Menu Hamburger**: Interface touch-friendly
- **Overlay Responsivo**: Adaptação para tablets/phones
- **Indicadores Visuais**: Chevrons e estados ativos

---

## [2025-01-03] - Gestão de Pessoas Externas

### ✨ Módulo Terceiros
- **Sistema Completo**: Clientes e seguranças externos
- **Credenciais Automáticas**: Geração de login/senha
- **Notificações Email**: Envio automático de credenciais
- **Controle de Status**: Ativo/Inativo com auditoria

### 🔐 Controle de Acesso
- **Permissões por Função**: Cliente vs Segurança
- **API Endpoints**: CRUD completo
- **Interface Integrada**: "+ Novo Externo" na página colaboradores

---

## [2025-01-02] - Agendamento de Cargas

### 📅 Sistema Visual Completo
- **Calendário Interativo**: Seleção visual de horários
- **Gestão de Slots**: Controle em tempo real
- **3 Abas Funcionais**:
  - 📋 Agendamento (clientes)
  - ⚙️ Admin (gestão)
  - 📊 Relatórios

### 📧 Automações
- **PDFs Automáticos**: Confirmações com identidade FELKA
- **Emails**: Notificações para clientes e gestores
- **Política de Cancelamento**: Janela de 3 horas

### 🎨 Identidade Visual
- **Header FELKA**: Logo corporativa em todo sistema
- **Cor Padrão**: #0C29AB aplicada consistentemente
- **Branding**: Documentos com timbrado oficial

---

## [2025-01-01] - Controle de Pneus e Custos

### 🔧 Módulo de Pneus
- **5ª Aba na Manutenção**: Integração completa
- **6 Sub-abas Internas**:
  - 📊 Dashboard com KPIs
  - 📝 Cadastro de pneus
  - 🔄 Movimentações
  - 🔃 Rodízios
  - ⚠️ Alertas
  - 📈 Relatórios

### 💰 Sistema de Custos
- **8 Categorias Predefinidas**:
  - 🔧 Mecânica
  - ⚡ Elétrica  
  - 🏗️ Estrutural
  - 🛞 Pneus
  - 🛠️ Preventiva
  - 🚨 Corretiva
  - 🔍 Revisão
  - 📋 Outros

### 🧮 Automações
- **Cálculo Automático**: Quantidade × Preço Unitário
- **Rastreamento Completo**: Histórico de custos por veículo

---

## Tecnologias e Ferramentas

### Frontend
- React 18 + TypeScript
- Vite + shadcn/ui + Tailwind CSS
- TanStack Query + Wouter
- React Hook Form + Zod

### Backend  
- Express.js + TypeScript
- Drizzle ORM + PostgreSQL
- Multer + PDFKit

### Infraestrutura
- Replit Hosting
- Neon PostgreSQL
- Session Management

---

**Desenvolvido com ❤️ para FELKA Transportes**