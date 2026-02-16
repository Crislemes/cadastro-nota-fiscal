# 📋 Sistema de Nota Fiscal - Desktop

Aplicativo desktop offline para cadastro de notas fiscais com autenticação e interface moderna.

## ✨ Funcionalidades

- ✅ Sistema de login com autenticação segura (bcrypt)
- ✅ Dashboard com estatísticas
- ✅ Cadastro de clientes e veículos
- ✅ Gestão de notas fiscais
- ✅ Geração de PDF
- ✅ Banco SQLite local
- ✅ Interface moderna (Figma + Tailwind CSS)
- ✅ Aplicativo desktop offline
- ✅ Instalador Windows

## 🔐 Credenciais Padrão

```
Login: admin
Senha: admin123
```

## 🚀 Desenvolvimento

### 1. Instalar Dependências

```bash
# Raiz (Electron + Backend)
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
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Componentes UI
│   │   │   ├── context/     # AuthContext, DataContext
│   │   │   ├── pages/       # Login, Dashboard, etc
│   │   │   └── utils/       # Formatters, PDF
│   │   └── styles/
│   └── dist/         (gerado pelo build)
├── build/            # Ícones do app
├── main.js           # Electron + Backend (Express + SQLite)
├── preload.js        # Segurança Electron
├── package.json      # Configuração Electron
├── MIGRACAO_BANCO.md # Documentação do banco
└── IMPLEMENTACAO.md  # Detalhes da implementação
```

## 🗄️ Banco de Dados

### Estrutura:

- **USUARIOS** - Autenticação (login, senha_hash)
- **CLIENTES** - Dados dos clientes
- **VEICULOS** - Veículos dos clientes
- **NOTAS_FISCAIS** - Notas fiscais / Serviços
- **PECAS** - Peças das notas fiscais

### Relacionamentos:

```
CLIENTES (1) → (N) VEICULOS
CLIENTES (1) → (N) NOTAS_FISCAIS
VEICULOS (1) → (N) NOTAS_FISCAIS
NOTAS_FISCAIS (1) → (N) PECAS
```

### Localização:

```
C:\Users\[Usuario]\AppData\Roaming\nota-fiscal-desktop\oficina.db
```

## 🔧 Acesso ao Banco (DBeaver)

1. Abra o DBeaver
2. Nova Conexão → SQLite
3. Path: `C:\Users\[Usuario]\AppData\Roaming\nota-fiscal-desktop\oficina.db`
4. Teste e conecte

⚠️ **Importante:** Feche o aplicativo antes de editar no DBeaver

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login

### Clientes
- `GET /api/clientes` - Listar
- `POST /api/clientes` - Criar
- `GET /api/clientes/:id` - Buscar
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Veículos
- `POST /api/veiculos` - Criar
- `GET /api/veiculos/:id` - Buscar
- `GET /api/clientes/:id/veiculos` - Listar por cliente

### Notas Fiscais
- `GET /api/notas-fiscais` - Listar
- `POST /api/notas-fiscais` - Criar
- `GET /api/notas-fiscais/:id` - Buscar
- `PUT /api/notas-fiscais/:id` - Atualizar
- `DELETE /api/notas-fiscais/:id` - Deletar
- `GET /api/notas-fiscais/:id/pecas` - Listar peças
- `GET /api/notas-fiscais/buscar/:nome` - Buscar por nome

## 🛠️ Tecnologias

### Backend
- Electron
- Express.js
- SQLite (better-sqlite3)
- bcryptjs (hash de senhas)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- Radix UI
- Lucide React
- Sonner (toast)
- jsPDF + html2canvas

## 📚 Documentação Adicional

- [MIGRACAO_BANCO.md](./MIGRACAO_BANCO.md) - Detalhes da estrutura do banco
- [IMPLEMENTACAO.md](./IMPLEMENTACAO.md) - Resumo das implementações

---

A&C Centro Automotivo © 2026
