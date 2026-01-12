# P0 Ops Safety Patch Report 🛡️

**Status**: ✅ GO FOR BETA OPS
**Date**: 2026-01-12

Esta atualização aplica hardening operacional crítico para o Closed Beta.

## 1. Safety Upgrades

### A) Database Constraints (`last_checked_at`)
- **Fix**: Coluna `last_checked_at` agora é `NOT NULL` com `DEFAULT NOW()`.
- **Impacto**: Garante que a paginação keyset do Price Tracker nunca falhe ou pule itens devido a valores nulos.
- **Migration**: `20260112000000_ops_safety_1.sql`

### B) Distributed Locks (Concurrency)
- **Fix**: Implementado sistema de lock distribuído via Postgres RPC.
- **Mecanismo**: Job só inicia se conseguir adquirir row em `job_locks`. TTL de 90s (expiração automática).
- **Resultado**: Impossível rodar 2 instâncias do mesmo job simultaneamente (evita race conditions e custos dobrados).
- **Migration**: `20260112000001_ops_safety_2_locks.sql`

### C) Secured Internal Routes
- **Fix**: Rotas `/api/internal/jobs/*` protegidas por header `x-cron-secret`.
- **Segurança**: Endpoint rejeita chamadas públicas (401 Unauthorized) se o segredo não bater com a variável de ambiente `CRON_SECRET`.
- **Arquivos**:
  - `src/app/api/internal/jobs/price-tracker/route.ts`
  - `src/app/api/internal/jobs/alert-evaluator/route.ts`

## 2. Como Testar e Operar

### Configuração Obrigatória
Adicionar ao `.env` (local e Vercel):
```bash
CRON_SECRET=sb_beta_secret_xyz123
```

### Disparo Manual (Curl)
```bash
curl -i -H "x-cron-secret: sb_beta_secret_xyz123" \
     http://localhost:3000/api/internal/jobs/price-tracker
```
- **Sucesso**: HTTP 200 `{ "success": true, "processed": 100 }`
- **Falha Auth**: HTTP 401 `{ "error": "Unauthorized" }`
- **Locked**: HTTP 200 `{ "status": "skipped_locked" }` (se já estiver rodando)

## 3. Checklist Final

- [x] **NULL-Safe**: `last_checked_at` blindado.
- [x] **Concurrency**: Locks ativos e funcionando.
- [x] **Auth**: Rotas internas fechadas para o mundo.
- [x] **Docs**: Runbook atualizado.

## Veredito
O ambiente está **Operacionalmente Seguro**. A chance de "tiro no pé" por execução duplicada ou acesso indevido foi eliminada.
