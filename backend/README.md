# Backend - Sistema de Nota Fiscal

Backend Node.js + Express + SQLite para o sistema de notas fiscais.

## 📋 Pré-requisitos

- Node.js instalado
- Banco de dados SQLite em `C:\database\oficina.db`

## 🚀 Instalação

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o banco de dados (se ainda não existir):
   - Crie a pasta `C:\database\`
   - Execute o script `schema.sql` no SQLite:
   ```bash
   sqlite3 C:\database\oficina.db < schema.sql
   ```

## ▶️ Executar

```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📡 Endpoints da API

### Clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/:id` - Buscar por ID

### Veículos
- `POST /api/veiculos` - Criar veículo
- `GET /api/veiculos/:id` - Buscar por ID

### Notas Fiscais
- `POST /api/notas-fiscais` - Criar nota
- `GET /api/notas-fiscais` - Listar todas
- `GET /api/notas-fiscais/:id` - Buscar por ID
- `GET /api/notas-fiscais/:id/itens` - Buscar itens da nota
- `PUT /api/notas-fiscais/:id` - Atualizar nota
- `DELETE /api/notas-fiscais/:id` - Excluir nota
- `GET /api/notas-fiscais/buscar/:nome` - Buscar por nome do cliente

## 🔧 Configuração no Frontend

Atualize o arquivo `src/app/services/database.ts` para usar a API ao invés do localStorage.
