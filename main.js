const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

let mainWindow;
let server;

Menu.setApplicationMenu(null);

function startBackend() {
  const PORT = 3001;
  const dbPath = path.join(app.getPath('userData'), 'oficina.db');
  console.log('📦 Banco:', dbPath);
  
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      telefone TEXT,
      endereco TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT,
      ano TEXT,
      modelo TEXT,
      cliente_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_nota TEXT UNIQUE NOT NULL,
      cliente_id INTEGER NOT NULL,
      veiculo_id INTEGER,
      valor_mao_de_obra REAL DEFAULT 0,
      total_pecas REAL DEFAULT 0,
      valor_total REAL NOT NULL,
      observacoes TEXT,
      status TEXT DEFAULT 'active',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
    );
    CREATE TABLE IF NOT EXISTS itens_nota_fiscal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nota_fiscal_id INTEGER NOT NULL,
      nome_peca TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      valor_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id) ON DELETE CASCADE
    );
  `);
  
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());
  
  expressApp.get('/', (req, res) => res.json({ message: '🚀 API OK' }));
  
  expressApp.post('/api/clientes', (req, res) => {
    try {
      const { nome, cpf_cnpj, telefone, endereco } = req.body;
      if (cpf_cnpj) {
        const existente = db.prepare('SELECT id FROM clientes WHERE cpf_cnpj = ?').get(cpf_cnpj);
        if (existente) return res.json({ id: existente.id });
      }
      const result = db.prepare('INSERT INTO clientes (nome, cpf_cnpj, telefone, endereco) VALUES (?, ?, ?, ?)').run(nome, cpf_cnpj, telefone, endereco);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/clientes', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM clientes ORDER BY criado_em DESC').all());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/clientes/:id', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.post('/api/veiculos', (req, res) => {
    try {
      const { placa, ano, modelo, cliente_id } = req.body;
      const result = db.prepare('INSERT INTO veiculos (placa, ano, modelo, cliente_id) VALUES (?, ?, ?, ?)').run(placa, ano, modelo, cliente_id);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/veiculos/:id', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM veiculos WHERE id = ?').get(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.post('/api/notas-fiscais', (req, res) => {
    try {
      const { numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status, itens } = req.body;
      db.exec('BEGIN TRANSACTION');
      const resultNota = db.prepare('INSERT INTO notas_fiscais (numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status);
      const notaId = resultNota.lastInsertRowid;
      const stmtItem = db.prepare('INSERT INTO itens_nota_fiscal (nota_fiscal_id, nome_peca, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
      itens.forEach(item => stmtItem.run(notaId, item.nome_peca, item.quantidade, item.valor_unitario, item.subtotal));
      db.exec('COMMIT');
      res.json({ id: notaId });
    } catch (error) {
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais', (req, res) => {
    try {
      res.json(db.prepare('SELECT nf.*, c.nome as cliente_nome FROM notas_fiscais nf JOIN clientes c ON nf.cliente_id = c.id ORDER BY nf.criado_em DESC').all());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/:id', (req, res) => {
    try {
      res.json(db.prepare('SELECT nf.*, c.nome as cliente_nome FROM notas_fiscais nf JOIN clientes c ON nf.cliente_id = c.id WHERE nf.id = ?').get(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/:id/itens', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM itens_nota_fiscal WHERE nota_fiscal_id = ?').all(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.delete('/api/notas-fiscais/:id', (req, res) => {
    try {
      db.exec('BEGIN TRANSACTION');
      db.prepare('DELETE FROM itens_nota_fiscal WHERE nota_fiscal_id = ?').run(req.params.id);
      db.prepare('DELETE FROM notas_fiscais WHERE id = ?').run(req.params.id);
      db.exec('COMMIT');
      res.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.put('/api/notas-fiscais/:id', (req, res) => {
    try {
      const { valor_mao_de_obra, total_pecas, valor_total, observacoes, itens } = req.body;
      db.exec('BEGIN TRANSACTION');
      db.prepare('UPDATE notas_fiscais SET valor_mao_de_obra = ?, total_pecas = ?, valor_total = ?, observacoes = ? WHERE id = ?').run(valor_mao_de_obra, total_pecas, valor_total, observacoes, req.params.id);
      db.prepare('DELETE FROM itens_nota_fiscal WHERE nota_fiscal_id = ?').run(req.params.id);
      const stmtItem = db.prepare('INSERT INTO itens_nota_fiscal (nota_fiscal_id, nome_peca, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
      itens.forEach(item => stmtItem.run(req.params.id, item.nome_peca, item.quantidade, item.valor_unitario, item.subtotal));
      db.exec('COMMIT');
      res.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/buscar/:nome', (req, res) => {
    try {
      res.json(db.prepare('SELECT nf.*, c.nome as cliente_nome FROM notas_fiscais nf JOIN clientes c ON nf.cliente_id = c.id WHERE c.nome LIKE ? ORDER BY nf.criado_em DESC').all(`%${req.params.nome}%`));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  server = expressApp.listen(PORT, () => console.log(`🚀 Backend na porta ${PORT}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true
  });

  mainWindow.setMenu(null);

  const isDev = !app.isPackaged;
  
  if (isDev) {
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    }, 2000);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(() => createWindow(), 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  app.quit();
});

app.on('before-quit', () => {
  if (server) server.close();
});
