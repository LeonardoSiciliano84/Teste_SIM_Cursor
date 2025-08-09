-- ===================================
-- SCRIPT DE CONFIGURAÇÃO SUPABASE
-- FELKA TRANSPORTES
-- ===================================

-- Ativar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ===================================

-- Ativar Row Level Security nas tabelas principais
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS external_persons ENABLE ROW LEVEL SECURITY;

-- ===================================
-- POLÍTICAS DE ACESSO
-- ===================================

-- Política para usuários - apenas usuários autenticados podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

-- Política para veículos - usuários autenticados podem ver todos os veículos
CREATE POLICY "Authenticated users can view vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para funcionários - usuários autenticados podem ver todos os funcionários
CREATE POLICY "Authenticated users can view employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para pessoas externas - usuários autenticados podem ver todas
CREATE POLICY "Authenticated users can view external persons" ON external_persons
    FOR SELECT USING (auth.role() = 'authenticated');

-- ===================================
-- FUNÇÕES AUXILIARES
-- ===================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM users
        WHERE id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter dados do usuário atual
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS users AS $$
DECLARE
    current_user_data users;
BEGIN
    SELECT * INTO current_user_data
    FROM users
    WHERE id::text = auth.uid()::text;
    
    RETURN current_user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- TRIGGERS E ATUALIZAÇÕES AUTOMÁTICAS
-- ===================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at nas tabelas (se a coluna existir)
-- Nota: Ajustar conforme o schema atual

-- ===================================
-- INSERIR USUÁRIO ADMINISTRADOR PADRÃO
-- ===================================

-- Inserir usuário admin padrão (ajustar conforme necessário)
INSERT INTO users (id, email, name, role, created_at)
VALUES (
    gen_random_uuid(),
    'admin@felka.com.br',
    'Administrador FELKA',
    'admin',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ===================================
-- CONFIGURAÇÕES DE STORAGE (OPCIONAL)
-- ===================================

-- Criar bucket para uploads se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('felka-uploads', 'felka-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Política para uploads - usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'felka-uploads' AND
        auth.role() = 'authenticated'
    );

-- Política para visualizar uploads - usuários autenticados podem ver
CREATE POLICY "Authenticated users can view uploads" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'felka-uploads' AND
        auth.role() = 'authenticated'
    );

-- ===================================
-- VIEWS ÚTEIS
-- ===================================

-- View com estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM vehicles WHERE status = 'Ativo') as active_vehicles,
    (SELECT COUNT(*) FROM employees WHERE status = 'ativo') as total_drivers,
    0 as today_trips, -- Ajustar conforme tabela de viagens
    0 as monthly_revenue -- Ajustar conforme tabela financeira
;

-- ===================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ===================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema FELKA Transportes';
COMMENT ON TABLE vehicles IS 'Tabela de veículos da frota';
COMMENT ON TABLE employees IS 'Tabela de funcionários da empresa';

-- ===================================
-- FINALIZAÇÃO
-- ===================================

-- Confirmar que as configurações foram aplicadas
SELECT 'Configuração do Supabase concluída com sucesso!' as status;