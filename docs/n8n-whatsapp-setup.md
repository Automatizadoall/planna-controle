# Integração WhatsApp - Planna via n8n

Este documento explica como configurar a integração do WhatsApp com o Planna usando n8n.

## 📋 Pré-requisitos

1. **n8n** instalado e rodando (self-hosted ou cloud)
2. **Evolution API** ou outro provider de WhatsApp (Twilio, etc)
3. **Supabase** com as migrations aplicadas

## 🔧 Configuração

### 1. Variáveis de Ambiente no n8n

Configure as seguintes variáveis em **Settings > Variables**:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do seu projeto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service Role Key (não a anon key!) | `eyJhbGc...` |
| `WHATSAPP_API_URL` | URL da API do WhatsApp | `http://localhost:8080` |
| `WHATSAPP_INSTANCE` | Nome da instância | `planna` |
| `WHATSAPP_API_KEY` | API Key do provider | `sua-api-key` |

### 2. Importar o Workflow

1. Acesse o n8n
2. Clique em **Import from File**
3. Selecione o arquivo `docs/n8n-whatsapp-workflow.json`
4. Revise os nodes e ajuste conforme necessário

### 3. Configurar Webhook no WhatsApp Provider

#### Evolution API

```bash
# Endpoint do webhook n8n
POST https://seu-n8n.com/webhook/whatsapp-transaction

# Configurar no Evolution API
curl -X POST "http://localhost:8080/webhook/set/planna" \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-n8n.com/webhook/whatsapp-transaction",
    "webhook_by_events": false,
    "events": ["MESSAGES_UPSERT"]
  }'
```

## 📱 Como Usar

### Formatos de Mensagem Aceitos

O usuário pode enviar mensagens no WhatsApp nos seguintes formatos:

#### Despesas (default)
```
gastei 50 mercado
paguei 120 conta de luz
45.90 uber
comprei 200 remédio
```

#### Receitas
```
recebi 5000 salário
entrada 500 freelance
ganhei 100 cashback
```

### Fluxo de Funcionamento

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUÁRIO ENVIA MENSAGEM                       │
│                    "gastei 50 mercado"                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WEBHOOK RECEBE                              │
│              Extrai: phone + mensagem                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUSCA USUÁRIO (RPC)                            │
│         get_user_by_phone('+5511999998888')                      │
│    Retorna: user_id, default_account_id, full_name               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
         ENCONTROU                      NÃO ENCONTROU
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   PROCESSA MENSAGEM     │    │   ENVIA ERRO            │
│   Extrai: tipo, valor,  │    │   "Número não           │
│   descrição             │    │    cadastrado"          │
└─────────────────────────┘    └─────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRIA TRANSAÇÃO                                │
│             INSERT na tabela transactions                        │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ENVIA CONFIRMAÇÃO                               │
│     "✅ Transação registrada! 💸 Saída - Mercado - R$ 50"       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Segurança

### Service Role Key

A `SUPABASE_SERVICE_KEY` tem acesso total ao banco. Certifique-se de:

- ✅ Nunca expor no frontend
- ✅ Usar apenas no backend (n8n)
- ✅ Rotacionar periodicamente
- ✅ Manter o n8n protegido com autenticação

### Validações

O workflow inclui validações para:

- ✅ Usuário existe (telefone cadastrado)
- ✅ Usuário tem conta padrão definida
- ✅ Valor é numérico e positivo
- ✅ Mensagem contém informações mínimas

## 🎯 Personalização

### Adicionar Categorização Automática

Você pode expandir o node "Processar Mensagem" para categorizar automaticamente:

```javascript
// Mapeamento de palavras-chave para categorias
const categoryMap = {
  'mercado': 'uuid-categoria-alimentacao',
  'supermercado': 'uuid-categoria-alimentacao',
  'uber': 'uuid-categoria-transporte',
  '99': 'uuid-categoria-transporte',
  'salário': 'uuid-categoria-salario',
  'freelance': 'uuid-categoria-renda-extra',
};

// Detecta categoria pela descrição
let category_id = null;
for (const [keyword, catId] of Object.entries(categoryMap)) {
  if (description.toLowerCase().includes(keyword)) {
    category_id = catId;
    break;
  }
}
```

### Adicionar Confirmação Antes de Salvar

Se quiser que o usuário confirme antes de salvar:

1. Adicione um node para enviar preview
2. Armazene o estado em Redis/memória
3. Aguarde resposta "sim" ou "não"
4. Só então crie a transação

## 🐛 Troubleshooting

### Erro: "Número não cadastrado"

1. Verifique se o usuário adicionou o telefone no perfil
2. Confirme que o formato é internacional (+5511...)
3. Teste a RPC diretamente no Supabase

### Erro: "Não consegui entender"

1. Verifique se a mensagem contém um valor numérico
2. Confirme que o usuário tem uma conta padrão definida
3. Veja os logs do n8n para detalhes

### Transação não aparece no app

1. Verifique se o `user_id` e `account_id` estão corretos
2. Confira as RLS policies no Supabase
3. Verifique os logs de erro no n8n

## 📊 Funções RPC Disponíveis

### get_user_by_phone

```sql
SELECT * FROM get_user_by_phone('+5511999998888');
```

**Retorna:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| user_id | UUID | ID do usuário |
| full_name | TEXT | Nome completo |
| email | TEXT | Email |
| default_account_id | UUID | ID da conta padrão |
| default_account_name | TEXT | Nome da conta padrão |
| default_account_type | account_type | Tipo da conta |

### get_accounts_by_phone

```sql
SELECT * FROM get_accounts_by_phone('+5511999998888');
```

**Retorna:** Lista de todas as contas do usuário (para futura funcionalidade de escolher conta).


