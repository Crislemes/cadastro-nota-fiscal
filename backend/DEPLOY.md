# 🚀 Guia de Deploy no Render

## ✅ Alterações Realizadas

1. **Porta Dinâmica**: `const PORT = process.env.PORT || 3001`
2. **Banco SQLite Relativo**: `const dbPath = join(__dirname, 'oficina.db')`
3. **CORS Aberto**: `app.use(cors())`
4. **Inicialização Automática**: Script `init-db.js` cria o banco na primeira execução

---

## 📋 Passo a Passo para Deploy

### 1. Preparar o Repositório Git

```bash
cd backend
git init
git add .
git commit -m "Backend pronto para deploy"
```

### 2. Criar Conta no Render

- Acesse: https://render.com
- Crie uma conta gratuita
- Conecte sua conta GitHub/GitLab

### 3. Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório
3. Configure:
   - **Name**: `nota-fiscal-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 4. Variáveis de Ambiente (Opcional)

Não é necessário configurar `PORT` - o Render define automaticamente.

### 5. Deploy

- Clique em **"Create Web Service"**
- Aguarde o build e deploy (3-5 minutos)
- Copie a URL gerada (ex: `https://nota-fiscal-backend.onrender.com`)

---

## 🔧 Atualizar Frontend

Após o deploy, atualize a URL da API no frontend:

```typescript
// src/app/services/database.ts
const API_URL = 'https://nota-fiscal-backend.onrender.com/api';
```

---

## ⚠️ Importante

- O banco SQLite será criado automaticamente no primeiro acesso
- Os dados serão perdidos se o serviço for reiniciado (limitação do plano Free)
- Para persistência, considere usar PostgreSQL do Render

---

## 🧪 Testar a API

```bash
# Testar se está funcionando
curl https://sua-url.onrender.com/api/clientes
```

---

## 📊 Monitoramento

- Acesse o dashboard do Render para ver logs
- Verifique erros em tempo real
- Monitore uso de recursos

---

## 🔄 Atualizações Futuras

Sempre que fizer alterações:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

O Render fará deploy automático! 🎉
