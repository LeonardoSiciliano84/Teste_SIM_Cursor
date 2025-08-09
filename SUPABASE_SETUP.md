# 🚀 Configuração Supabase - FELKA Transportes

## 📋 **Pré-requisitos**

1. **Conta no Supabase:** https://supabase.com
2. **Projeto criado** no dashboard do Supabase
3. **Acesso aos dados de conexão** do projeto

---

## 🔑 **1. Obter Credenciais do Supabase**

### **Acesse o Dashboard:**
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto **FELKA Transportes**
3. Navegue para **Settings → API**

### **Copie as seguintes informações:**

#### **📍 Project URL**
```
https://seu-projeto-id.supabase.co
```
- **Localização:** Settings → API → Project URL

#### **🔓 Anon/Public Key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Localização:** Settings → API → Project API keys → anon/public
- **Uso:** Frontend (seguro para exposição)

#### **🔒 Service Role Key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Localização:** Settings → API → Project API keys → service_role
- **Uso:** Backend (NUNCA expor no frontend!)

#### **🗄️ Database URL**
```
postgresql://postgres:[senha]@db.seu-projeto-id.supabase.co:5432/postgres
```
- **Localização:** Settings → Database → Connection string
- **Formato:** Substitua `[senha]` pela sua senha do banco

---

## ⚙️ **2. Configurar Variáveis de Ambiente**

### **Crie o arquivo `.env`:**
```bash
cp .env.supabase.example .env
```

### **Edite o arquivo `.env` com suas credenciais:**
```env
# ===================================
# SUPABASE - FELKA TRANSPORTES
# ===================================

SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:sua_senha@db.seu-projeto-id.supabase.co:5432/postgres

# Configurações adicionais
SESSION_SECRET=sua_chave_secreta_forte_de_32_caracteres
NODE_ENV=development
```

### **Para o Frontend (Vite), crie `.env.local`:**
```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ **3. Configurar Banco de Dados**

### **Opção A: Aplicar Schema Automaticamente (Drizzle)**
```bash
# Aplicar migrações existentes
npm run db:push
```

### **Opção B: Executar Script SQL Manual**
1. Acesse **SQL Editor** no dashboard do Supabase
2. Cole o conteúdo de `scripts/setup-supabase.sql`
3. Execute o script

### **Opção C: Usar Migration Existente**
```bash
# Se já existe migration
cat migrations/0000_wakeful_ogun.sql | psql "postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres"
```

---

## 🔧 **4. Configurar Autenticação**

### **No Dashboard do Supabase:**
1. Vá para **Authentication → Settings**
2. Configure **Site URL:** `http://localhost:5173` (dev) ou seu domínio (prod)
3. Adicione **Redirect URLs:** 
   - `http://localhost:5173/auth/callback`
   - `https://seudominio.com/auth/callback`

### **Habilitar Provedores de Auth (opcional):**
- **Email/Password:** ✅ Já habilitado
- **Google, GitHub, etc.:** Configure conforme necessário

---

## 🛡️ **5. Configurar Políticas de Segurança (RLS)**

### **Row Level Security já configurado no script SQL:**
- ✅ **Users:** Usuários veem apenas seus dados
- ✅ **Vehicles:** Usuários autenticados veem todos
- ✅ **Employees:** Usuários autenticados veem todos
- ✅ **External Persons:** Usuários autenticados veem todos

### **Verificar Políticas:**
1. Acesse **SQL Editor**
2. Execute: `SELECT * FROM dashboard_stats;`
3. Deve retornar dados sem erro

---

## 📦 **6. Configurar Storage (Opcional)**

### **Para Upload de Arquivos:**
1. Vá para **Storage**
2. Verifique se bucket `felka-uploads` foi criado
3. Configure políticas de acesso conforme necessário

---

## 🚀 **7. Testar Configuração**

### **Backend:**
```bash
npm run dev
```
- Deve conectar sem erros de DATABASE_URL

### **Frontend:**
```bash
npx vite
```
- Deve carregar sem warnings de Supabase

### **Teste Manual:**
1. Acesse `http://localhost:5173`
2. Faça login com `admin@felka.com.br`
3. Verifique se dados carregam do Supabase

---

## ❌ **8. Solução de Problemas**

### **Erro: "Invalid API Key"**
- ✅ Verifique se copiou as chaves corretamente
- ✅ Confirme que está usando anon_key no frontend
- ✅ Confirme que está usando service_role_key no backend

### **Erro: "Connection refused"**
- ✅ Verifique se DATABASE_URL está correto
- ✅ Confirme senha do banco de dados
- ✅ Teste conexão direta com psql

### **Erro: "Row Level Security"**
- ✅ Execute o script `setup-supabase.sql`
- ✅ Verifique se usuário tem permissões adequadas

### **Erro: "Auth Session"**
- ✅ Configure Site URL correto no Supabase
- ✅ Adicione Redirect URLs necessárias

---

## 📞 **9. Suporte**

### **Logs e Debug:**
```bash
# Ver logs do backend
npm run dev 2>&1 | grep -E "(error|Error|ERROR)"

# Ver logs do frontend  
npx vite 2>&1 | grep -E "(error|Error|ERROR)"
```

### **Teste de Conexão:**
```bash
# Testar conexão PostgreSQL
psql "postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres" -c "SELECT 1;"
```

### **Verificar Configuração:**
```javascript
// No console do browser
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase configurado:', !!window.supabase);
```

---

## ✅ **10. Checklist Final**

- [ ] ✅ Projeto criado no Supabase
- [ ] ✅ Credenciais copiadas e configuradas em `.env`
- [ ] ✅ Schema aplicado no banco de dados
- [ ] ✅ Políticas RLS configuradas
- [ ] ✅ Site URL configurado na autenticação
- [ ] ✅ Backend conecta sem erros
- [ ] ✅ Frontend carrega corretamente
- [ ] ✅ Login funciona com usuário admin
- [ ] ✅ Dados são exibidos no dashboard

---

**🎉 Configuração concluída! FELKA Transportes está pronto para usar o Supabase!**