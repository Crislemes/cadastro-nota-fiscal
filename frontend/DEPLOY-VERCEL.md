# 🚀 Deploy Frontend no Vercel

## 📋 Passo a Passo

### 1. Preparar Repositório Git

```bash
cd frontend
git init
git add .
git commit -m "Frontend pronto para deploy"
```

### 2. Criar Conta no Vercel

- Acesse: https://vercel.com
- Crie uma conta gratuita
- Conecte sua conta GitHub/GitLab

### 3. Importar Projeto

1. Clique em **"Add New..."** → **"Project"**
2. Conecte seu repositório
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (se o repo tiver backend também)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4. Variáveis de Ambiente

Não é necessário configurar nada - a URL da API já está configurada automaticamente.

### 5. Deploy

- Clique em **"Deploy"**
- Aguarde o build (2-3 minutos)
- Copie a URL gerada (ex: `https://seu-projeto.vercel.app`)

---

## ✅ Verificar

Após o deploy:
- Acesse a URL do Vercel
- Teste criar uma nota fiscal
- Verifique se está salvando no backend do Render

---

## 🔄 Atualizações Automáticas

Sempre que fizer push no repositório, o Vercel fará deploy automático! 🎉

---

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o backend no Render está com `app.use(cors())`

### API não responde
- Confirme que a URL da API está correta em `src/app/services/database.ts`
- Verifique se o backend no Render está rodando

### Build falha
- Verifique os logs no dashboard do Vercel
- Confirme que todas as dependências estão no `package.json`
