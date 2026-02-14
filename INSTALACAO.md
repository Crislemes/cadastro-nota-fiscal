# 🚀 Guia de Instalação - Sistema de Nota Fiscal com SQLite

## 📋 O que foi implementado?

✅ Backend Node.js + Express + SQLite  
✅ API REST completa  
✅ Conexão real com banco de dados `oficina.db`  
✅ Frontend atualizado para usar a API  

---

## 🔧 Passo a Passo de Instalação

### **1. Criar o Banco de Dados**

```bash
# Criar pasta do banco
mkdir C:\database

# Abrir SQLite (instale se não tiver: https://www.sqlite.org/download.html)
sqlite3 C:\database\oficina.db
```

Dentro do SQLite, execute:

```sql
CREATE TABLE clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    telefone TEXT,
    endereco TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE veiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placa TEXT,
    ano TEXT,
    modelo TEXT,
    cliente_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE notas_fiscais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nota TEXT UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    veiculo_id INTEGER,
    valor_mao_de_obra REAL DEFAULT 0,
    total_pecas REAL DEFAULT 0,
    valor_total REAL NOT NULL,
    observacoes TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
);

CREATE TABLE itens_nota_fiscal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nota_fiscal_id INTEGER NOT NULL,
    nome_peca TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id) ON DELETE CASCADE
);

.quit
```

### **2. Instalar Dependências do Backend**

```bash
cd backend
npm install
```

### **3. Iniciar o Backend**

```bash
# Na pasta backend
npm start
```

Você verá:
```
🚀 Backend rodando em http://localhost:3001
📊 Banco de dados: C:\database\oficina.db
```

### **4. Iniciar o Frontend**

Em outro terminal:

```bash
# Na pasta raiz do projeto
npm run dev
```

---

## ✅ Testando a Conexão

1. Acesse `http://localhost:5173`
2. Crie uma nova nota fiscal
3. Salve os dados
4. Verifique no banco:

```bash
sqlite3 C:\database\oficina.db
SELECT * FROM clientes;
SELECT * FROM notas_fiscais;
.quit
```

Agora os dados estarão salvos no banco SQLite! 🎉

---

## 🔄 Fluxo de Dados

```
Frontend (React) → API (Express) → SQLite (oficina.db)
     ↓                  ↓                ↓
  localhost:5173   localhost:3001   C:\database\oficina.db
```

---

## 📡 Endpoints da API

- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar clientes
- `POST /api/veiculos` - Criar veículo
- `POST /api/notas-fiscais` - Criar nota fiscal
- `GET /api/notas-fiscais` - Listar notas
- `GET /api/notas-fiscais/:id` - Buscar nota por ID
- `PUT /api/notas-fiscais/:id` - Atualizar nota
- `DELETE /api/notas-fiscais/:id` - Excluir nota
- `GET /api/notas-fiscais/buscar/:nome` - Buscar por cliente

---

## ⚠️ Importante

- O backend deve estar rodando na porta **3001**
- O frontend deve estar rodando na porta **5173**
- O banco deve estar em `C:\database\oficina.db`
- Mantenha ambos os servidores rodando simultaneamente

---

## 🐛 Solução de Problemas

### Erro: "Failed to fetch"
- Verifique se o backend está rodando
- Confirme a porta 3001

### Erro: "SQLITE_CANTOPEN"
- Verifique se a pasta `C:\database` existe
- Confirme as permissões de escrita

### Dados não aparecem
- Limpe o localStorage do navegador (F12 → Application → Local Storage → Clear)
- Reinicie o backend
