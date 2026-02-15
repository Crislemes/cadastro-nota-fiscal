# 📋 Sistema de Nota Fiscal - Desktop

Aplicativo desktop offline para cadastro de notas fiscais.

## 🚀 Desenvolvimento

### 1. Instalar Dependências

```bash
# Raiz (Electron)
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
cd ..
```

### 2. Executar em Desenvolvimento

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Electron
npm run desktop:dev
```

## 📦 Gerar Instalador Windows

```bash
# 1. Build do frontend
npm run build:frontend

# 2. Gerar instalador
npm run desktop:build
```

O instalador `.exe` estará em `dist-desktop/`

## ✨ Funcionalidades

- ✅ Aplicativo desktop offline
- ✅ Banco SQLite local
- ✅ Geração de PDF
- ✅ Sem necessidade de internet
- ✅ Instalador Windows

---

A&C Centro Automotivo © 2026
