# Instruções Git - Configuração do Remote Origin

**Data:** 07 de Janeiro de 2025

## Status Atual
- Remote origin atual: `https://github.com/LeonardoSiciliano84/S.I.M`
- Novo remote desejado: `https://github.com/LeonardoSiciliano84/Teste_SIM_Cursor.git`
- Problema: Arquivo `.git/config` com lock impedindo alterações

## Comandos para Executar no Terminal

### 1. Primeiro, remover locks do git (se necessário)
```bash
cd /home/runner/workspace
rm -f .git/config.lock .git/index.lock
```

### 2. Verificar remote atual
```bash
git remote -v
```

### 3. Alterar URL do remote origin
```bash
git remote set-url origin https://github.com/LeonardoSiciliano84/Teste_SIM_Cursor.git
```

### 4. Verificar se a alteração foi feita
```bash
git remote -v
```

### 5. Fazer commit das alterações recentes
```bash
git add -A
git commit -m "feat: Restaurar sistema de veículos original com 3 abas de visualização

- Restaurada estrutura original do VehicleList com navegação interna
- Removidas rotas separadas desnecessárias (/vehicles/:id)
- Mantida funcionalidade existente: VehicleList → VehicleDetails/VehicleForm
- Adicionadas 3 abas de visualização:
  * Grade: Layout em cards (original)
  * Lista: Formato tabela profissional
  * Classificação: Agrupamento por categoria
- Preservadas todas as funcionalidades: Ver Detalhes, Novo Veículo, Editar
- Sistema funcionando corretamente como antes, mas com visualizações aprimoradas"
```

### 6. Push para o novo repositório
```bash
git push -u origin main
```

## Alternativamente (Se houver conflitos)

Se o repositório `Teste_SIM_Cursor` for novo e vazio, você pode fazer:

```bash
git push -u origin main --force
```

⚠️ **Atenção**: O `--force` irá sobrescrever o histórico do repositório remoto.

## Arquivos Importantes Criados
- `git-commit-restauracao-veiculos.md` - Documentação detalhada das mudanças
- `git-push-instructions.md` - Este arquivo com instruções
- `replit.md` - Atualizado com as mudanças recentes

## Sistema Pronto
✅ Sistema de veículos restaurado e funcionando
✅ 3 abas de visualização implementadas
✅ Todas as funcionalidades preservadas
✅ Documentação completa criada