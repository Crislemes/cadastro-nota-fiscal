const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

let mainWindow;
let server;

Menu.setApplicationMenu(null);

function startBackend() {
  const PORT = 3001;
  const dbPath = path.join(app.getPath('userData'), 'oficina.db');
  console.log('📦 Banco:', dbPath);
  
  const db = new Database(dbPath);
  
  // Nova estrutura do banco de dados
  db.exec(`
    -- Tabela de Usuários (autenticação)
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Clientes
    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      telefone TEXT NOT NULL,
      endereco TEXT,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nome, telefone)
    );

    -- Tabela de Veículos
    CREATE TABLE IF NOT EXISTS veiculos (
      id_veiculo INTEGER PRIMARY KEY AUTOINCREMENT,
      id_cliente INTEGER NOT NULL,
      placa TEXT,
      modelo TEXT,
      marca TEXT,
      ano TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
    );

    -- Tabela de Notas Fiscais / Serviços
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id_nota INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_nota TEXT UNIQUE NOT NULL,
      id_cliente INTEGER NOT NULL,
      id_veiculo INTEGER,
      veiculo_placa TEXT,
      veiculo_modelo TEXT,
      veiculo_ano TEXT,
      data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
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

    -- Tabela de Peças
    CREATE TABLE IF NOT EXISTS pecas (
      id_peca INTEGER PRIMARY KEY AUTOINCREMENT,
      id_nota INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      valor_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_nota) REFERENCES notas_fiscais(id_nota) ON DELETE CASCADE
    );
  `);

  // Criar usuário padrão se não existir
  try {
    const userExists = db.prepare('SELECT id_usuario FROM usuarios WHERE email = ?').get('admin@oficina.com');
    if (!userExists) {
      const senhaHash = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)').run('Administrador', 'admin@oficina.com', senhaHash);
      console.log('✅ Usuário padrão criado: admin@oficina.com / admin123');
    } else {
      console.log('✅ Usuário padrão já existe');
    }
  } catch (error) {
    console.error('Erro ao criar usuário padrão:', error);
  }

  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());
  
  expressApp.get('/', (req, res) => res.json({ message: '🚀 API OK' }));

  // ========== AUTENTICAÇÃO ==========
  expressApp.post('/api/auth/login', (req, res) => {
    try {
      const { email, senha } = req.body;
      console.log('Tentativa de login:', email);
      
      const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
      
      if (!usuario) {
        console.log('Usuário não encontrado:', email);
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }
      
      console.log('Usuário encontrado, verificando senha...');
      const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
      
      if (!senhaValida) {
        console.log('Senha inválida para:', email);
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }
      
      console.log('Login bem-sucedido:', email);
      res.json({
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: error.message });
    }
  });

  expressApp.post('/api/auth/register', (req, res) => {
    try {
      const { nome, email, senha } = req.body;
      console.log('Tentativa de registro:', email);
      
      const existe = db.prepare('SELECT id_usuario FROM usuarios WHERE email = ?').get(email);
      
      if (existe) {
        console.log('Email já cadastrado:', email);
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      
      const senhaHash = bcrypt.hashSync(senha, 10);
      const result = db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)').run(nome, email, senhaHash);
      
      console.log('Usuário cadastrado com sucesso:', email, 'ID:', result.lastInsertRowid);
      
      res.json({ 
        id: result.lastInsertRowid,
        nome,
        email
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CLIENTES ==========
  expressApp.post('/api/clientes', (req, res) => {
    try {
      const { nome, cpf_cnpj, telefone, endereco, observacoes } = req.body;
      
      // Verifica duplicação por nome + telefone (obrigatório)
      const existente = db.prepare('SELECT id_cliente FROM clientes WHERE nome = ? AND telefone = ?').get(nome, telefone);
      if (existente) {
        return res.status(400).json({ error: 'Cliente com mesmo nome e telefone já cadastrado', id: existente.id_cliente });
      }
      
      const result = db.prepare('INSERT INTO clientes (nome, cpf_cnpj, telefone, endereco, observacoes) VALUES (?, ?, ?, ?, ?)').run(nome, cpf_cnpj, telefone, endereco, observacoes);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Cliente já cadastrado' });
      } else {
        res.status(500).json({ error: error.message });
      }
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
      res.json(db.prepare('SELECT * FROM clientes WHERE id_cliente = ?').get(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  expressApp.put('/api/clientes/:id', (req, res) => {
    try {
      const { nome, cpf_cnpj, telefone, endereco, observacoes } = req.body;
      db.prepare('UPDATE clientes SET nome = ?, cpf_cnpj = ?, telefone = ?, endereco = ?, observacoes = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id_cliente = ?').run(nome, cpf_cnpj, telefone, endereco, observacoes, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  expressApp.delete('/api/clientes/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM clientes WHERE id_cliente = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========== VEÍCULOS ==========
  expressApp.post('/api/veiculos', (req, res) => {
    try {
      const { id_cliente, placa, modelo, marca, ano } = req.body;
      const result = db.prepare('INSERT INTO veiculos (id_cliente, placa, modelo, marca, ano) VALUES (?, ?, ?, ?, ?)').run(id_cliente, placa, modelo, marca, ano);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/veiculos/:id', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM veiculos WHERE id_veiculo = ?').get(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  expressApp.delete('/api/veiculos/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM veiculos WHERE id_veiculo = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  expressApp.get('/api/clientes/:id/veiculos', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM veiculos WHERE id_cliente = ? ORDER BY criado_em DESC').all(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ========== NOTAS FISCAIS ==========
  expressApp.post('/api/notas-fiscais', (req, res) => {
    try {
      const { numero_nota, id_cliente, id_veiculo, veiculo_placa, veiculo_modelo, veiculo_ano, data_emissao, valor_mao_de_obra, total_pecas, valor_total, observacoes, status, pecas } = req.body;
      db.exec('BEGIN TRANSACTION');
      const resultNota = db.prepare('INSERT INTO notas_fiscais (numero_nota, id_cliente, id_veiculo, veiculo_placa, veiculo_modelo, veiculo_ano, data_emissao, valor_mao_de_obra, total_pecas, valor_total, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(numero_nota, id_cliente, id_veiculo, veiculo_placa, veiculo_modelo, veiculo_ano, data_emissao, valor_mao_de_obra, total_pecas, valor_total, observacoes, status);
      const notaId = resultNota.lastInsertRowid;
      const stmtPeca = db.prepare('INSERT INTO pecas (id_nota, descricao, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
      pecas.forEach(peca => stmtPeca.run(notaId, peca.descricao, peca.quantidade, peca.valor_unitario, peca.subtotal));
      db.exec('COMMIT');
      res.json({ id: notaId });
    } catch (error) {
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais', (req, res) => {
    try {
      res.json(db.prepare('SELECT nf.*, c.nome as cliente_nome FROM notas_fiscais nf JOIN clientes c ON nf.id_cliente = c.id_cliente ORDER BY nf.criado_em DESC').all());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/:id', (req, res) => {
    try {
      const nota = db.prepare('SELECT nf.*, c.nome as cliente_nome, c.cpf_cnpj, c.telefone, c.endereco FROM notas_fiscais nf JOIN clientes c ON nf.id_cliente = c.id_cliente WHERE nf.id_nota = ?').get(req.params.id);
      
      if (!nota) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }

      // Buscar veículo se existir
      let veiculo = null;
      if (nota.id_veiculo) {
        veiculo = db.prepare('SELECT * FROM veiculos WHERE id_veiculo = ?').get(nota.id_veiculo);
      }

      // Buscar peças
      const pecas = db.prepare('SELECT * FROM pecas WHERE id_nota = ?').all(req.params.id);

      res.json({
        ...nota,
        veiculo,
        pecas
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/:id/pecas', (req, res) => {
    try {
      res.json(db.prepare('SELECT * FROM pecas WHERE id_nota = ?').all(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.delete('/api/notas-fiscais/:id', (req, res) => {
    try {
      db.exec('BEGIN TRANSACTION');
      db.prepare('DELETE FROM pecas WHERE id_nota = ?').run(req.params.id);
      db.prepare('DELETE FROM notas_fiscais WHERE id_nota = ?').run(req.params.id);
      db.exec('COMMIT');
      res.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.put('/api/notas-fiscais/:id', (req, res) => {
    try {
      const { veiculo_placa, veiculo_modelo, veiculo_ano, valor_mao_de_obra, total_pecas, valor_total, observacoes, pecas } = req.body;
      console.log('Atualizando nota:', req.params.id, req.body);
      db.exec('BEGIN TRANSACTION');
      db.prepare('UPDATE notas_fiscais SET veiculo_placa = ?, veiculo_modelo = ?, veiculo_ano = ?, valor_mao_de_obra = ?, total_pecas = ?, valor_total = ?, observacoes = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id_nota = ?').run(veiculo_placa, veiculo_modelo, veiculo_ano, valor_mao_de_obra, total_pecas, valor_total, observacoes, req.params.id);
      db.prepare('DELETE FROM pecas WHERE id_nota = ?').run(req.params.id);
      if (pecas && pecas.length > 0) {
        const stmtPeca = db.prepare('INSERT INTO pecas (id_nota, descricao, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
        pecas.forEach(peca => stmtPeca.run(req.params.id, peca.descricao, peca.quantidade, peca.valor_unitario, peca.subtotal));
      }
      db.exec('COMMIT');
      console.log('Nota atualizada com sucesso');
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      db.exec('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/notas-fiscais/buscar/:nome', (req, res) => {
    try {
      res.json(db.prepare('SELECT nf.*, c.nome as cliente_nome FROM notas_fiscais nf JOIN clientes c ON nf.id_cliente = c.id_cliente WHERE c.nome LIKE ? ORDER BY nf.criado_em DESC').all(`%${req.params.nome}%`));
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
    icon: path.join(__dirname, 'build', 'logo-marca-oficina.png'),
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
    const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Erro ao carregar:', err);
    });
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
