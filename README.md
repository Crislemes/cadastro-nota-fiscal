# 📋 Sistema de Cadastro de Nota Fiscal

Sistema completo para cadastro e geração de notas fiscais de serviços mecânicos.

## 📁 Estrutura do Projeto

```
Cadastro de Nota Fiscal/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── package.json
│   └── DEPLOY-VERCEL.md
│
└── backend/           # Node.js + Express + SQLite
    ├── server.js
    ├── package.json
    └── DEPLOY.md
```

## 🚀 Deploy

### Frontend (Vercel)
```bash
cd frontend
npm install
npm run build
```
Siga o guia: `frontend/DEPLOY-VERCEL.md`

### Backend (Render)
```bash
cd backend
npm install
npm start
```
Siga o guia: `backend/DEPLOY.md`

## 💻 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm start
# Roda em http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Roda em http://localhost:5173
```

## 🔗 URLs de Produção

- **Frontend**: https://seu-projeto.vercel.app
- **Backend**: https://nota-fiscal-backend.onrender.com

## 📦 Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- jsPDF

### Backend
- Node.js
- Express
- SQLite
- better-sqlite3

## ✨ Funcionalidades

- ✅ Cadastro de clientes
- ✅ Cadastro de veículos
- ✅ Gerenciamento de notas fiscais
- ✅ Controle de peças e mão de obra
- ✅ Geração de PDF
- ✅ Busca e filtros
- ✅ Edição e exclusão de notas

## 📄 Licença

Desenvolvido para A&C Centro Automotivo © 2026
