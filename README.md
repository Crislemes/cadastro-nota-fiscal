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
cd ..
```

### 2. Executar em Desenvolvimento

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Electron
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

## 📁 Estrutura do Projeto

```
Cadastro de Nota Fiscal/
├── frontend/          # React + Vite
│   ├── src/
│   └── dist/         (gerado pelo build)
├── build/            # Ícones do app
├── main.js           # Electron + Backend integrado
├── preload.js        # Segurança Electron
└── package.json      # Configuração Electron
```

## ✨ Funcionalidades

- ✅ Aplicativo desktop offline
- ✅ Banco SQLite local
- ✅ Geração de PDF
- ✅ Sem necessidade de internet
- ✅ Instalador Windows

## 💾 Dados

Os dados ficam salvos em:
```
C:\Users\[Usuario]\AppData\Roaming\nota-fiscal-desktop\oficina.db
```

---

A&C Centro Automotivo © 2026
