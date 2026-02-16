# 🔄 Migração do Banco de Dados

## Nova Estrutura Implementada

### ✅ Mudanças Realizadas

#### 1. **Tabela USUARIOS** (Nova)
```sql
CREATE TABLE usuarios (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- ✅ Senhas com hash bcrypt (nunca salvas em texto puro)
- ✅ Usuário padrão: `admin` / `admin123`

#### 2. **Tabela CLIENTES** (Atualizada)
```sql
CREATE TABLE clientes (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,  -- Antes: id
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  endereco TEXT,
  observacoes TEXT,  -- NOVO CAMPO
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- ✅ Renomeado `id` → `id_cliente`
- ✅ Adicionado campo `observacoes`

#### 3. **Tabela VEICULOS** (Atualizada)
```sql
CREATE TABLE veiculos (
  id_veiculo INTEGER PRIMARY KEY AUTOINCREMENT,  -- Antes: id
  id_cliente INTEGER NOT NULL,  -- Antes: cliente_id
  placa TEXT,
  modelo TEXT,
  marca TEXT,  -- NOVO CAMPO
  ano TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);
```
- ✅ Renomeado `id` → `id_veiculo`
- ✅ Renomeado `cliente_id` → `id_cliente`
- ✅ Adicionado campo `marca`
- ✅ Adicionado `ON DELETE CASCADE`

#### 4. **Tabela NOTAS_FISCAIS** (Atualizada)
```sql
CREATE TABLE notas_fiscais (
  id_nota INTEGER PRIMARY KEY AUTOINCREMENT,  -- Antes: id
  numero_nota TEXT UNIQUE NOT NULL,
  id_cliente INTEGER NOT NULL,  -- Antes: cliente_id
  id_veiculo INTEGER,  -- Antes: veiculo_id
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,  -- NOVO CAMPO
  valor_mao_de_obra REAL DEFAULT 0,
  total_pecas REAL DEFAULT 0,
  valor_total REAL NOT NULL,
  observacoes TEXT,
  status TEXT DEFAULT 'active',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_veiculo) REFERENCES veiculos(id_veiculo)
);
```
- ✅ Renomeado `id` → `id_nota`
- ✅ Renomeado `cliente_id` → `id_cliente`
- ✅ Renomeado `veiculo_id` → `id_veiculo`
- ✅ Adicionado campo `data_emissao`

#### 5. **Tabela PECAS** (Renomeada)
```sql
CREATE TABLE pecas (  -- Antes: itens_nota_fiscal
  id_peca INTEGER PRIMARY KEY AUTOINCREMENT,  -- Antes: id
  id_nota INTEGER NOT NULL,  -- Antes: nota_fiscal_id
  descricao TEXT NOT NULL,  -- Antes: nome_peca
  quantidade INTEGER NOT NULL,
  valor_unitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_nota) REFERENCES notas_fiscais(id_nota) ON DELETE CASCADE
);
```
- ✅ Renomeada `itens_nota_fiscal` → `pecas`
- ✅ Renomeado `id` → `id_peca`
- ✅ Renomeado `nota_fiscal_id` → `id_nota`
- ✅ Renomeado `nome_peca` → `descricao`

---

## 🔐 Autenticação

### Credenciais Padrão
- **Login:** `admin`
- **Senha:** `admin123`

### Segurança
- ✅ Senhas armazenadas com **bcrypt** (hash)
- ✅ Nunca salvas em texto puro
- ✅ Endpoint de autenticação: `POST /api/auth/login`

---

## 📊 Relacionamentos

```
CLIENTES (1) ──→ (N) VEICULOS
    │
    └──→ (N) NOTAS_FISCAIS
              │
              └──→ (N) PECAS

VEICULOS (1) ──→ (N) NOTAS_FISCAIS
```

---

## ⚠️ Importante

### Banco Antigo
Se você tinha dados no banco antigo, eles **NÃO serão migrados automaticamente**.

### Opções:
1. **Começar do zero** (recomendado para desenvolvimento)
2. **Migrar manualmente** via SQL no DBeaver

### Localização do Banco
```
C:\Users\[SeuUsuario]\AppData\Roaming\nota-fiscal-desktop\oficina.db
```

Para começar do zero, basta **deletar o arquivo** `oficina.db` e reiniciar o aplicativo.

---

## 🚀 Próximos Passos

1. Instalar dependências:
```bash
npm install
cd frontend
npm install
cd ..
```

2. Executar em desenvolvimento:
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Electron
npm run desktop:dev
```

3. Fazer login com: `admin` / `admin123`

---

**A&C Centro Automotivo © 2026**
