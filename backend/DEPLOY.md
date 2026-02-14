# 🚀 Deploy Backend no Render

## Passos

1. Acesse https://render.com e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório
4. Configure:
   - **Name**: `nota-fiscal-backend`
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Clique em **"Create Web Service"**

## Pronto!

Sua API estará disponível em: `https://nota-fiscal-backend.onrender.com`

Copie essa URL e atualize em `frontend/src/app/services/database.ts`

Deploys automáticos a cada push no repositório.
