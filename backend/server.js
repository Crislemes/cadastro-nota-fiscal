import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Conectar ao banco SQLite
const db = new Database('C:\\database\\oficina.db');

// CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ==================== CLIENTES ====================
app.post('/api/clientes', (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, endereco } = req.body;
    
    // Verificar se já existe
    if (cpf_cnpj) {
      const existente = db.prepare('SELECT id FROM clientes WHERE cpf_cnpj = ?').get(cpf_cnpj);
      if (existente) {
        return res.json({ id: existente.id });
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO clientes (nome, cpf_cnpj, telefone, endereco)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(nome, cpf_cnpj, telefone, endereco);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clientes', (req, res) => {
  try {
    const clientes = db.prepare('SELECT * FROM clientes ORDER BY criado_em DESC').all();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clientes/:id', (req, res) => {
  try {
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VEÍCULOS ====================
app.post('/api/veiculos', (req, res) => {
  try {
    const { placa, ano, modelo, cliente_id } = req.body;
    const stmt = db.prepare(`
      INSERT INTO veiculos (placa, ano, modelo, cliente_id)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(placa, ano, modelo, cliente_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/veiculos/:id', (req, res) => {
  try {
    const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(req.params.id);
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTAS FISCAIS ====================
app.post('/api/notas-fiscais', (req, res) => {
  try {
    const { numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status, itens } = req.body;
    
    db.exec('BEGIN TRANSACTION');
    
    const stmtNota = db.prepare(`
      INSERT INTO notas_fiscais (numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const resultNota = stmtNota.run(numero_nota, cliente_id, veiculo_id, valor_mao_de_obra, total_pecas, valor_total, observacoes, status);
    const notaId = resultNota.lastInsertRowid;
    
    const stmtItem = db.prepare(`
      INSERT INTO itens_nota_fiscal (nota_fiscal_id, nome_peca, quantidade, valor_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      stmtItem.run(notaId, item.nome_peca, item.quantidade, item.valor_unitario, item.subtotal);
    });
    
    db.exec('COMMIT');
    res.json({ id: notaId });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notas-fiscais', (req, res) => {
  try {
    const notas = db.prepare(`
      SELECT nf.*, c.nome as cliente_nome
      FROM notas_fiscais nf
      JOIN clientes c ON nf.cliente_id = c.id
      ORDER BY nf.criado_em DESC
    `).all();
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notas-fiscais/:id', (req, res) => {
  try {
    const nota = db.prepare(`
      SELECT nf.*, c.nome as cliente_nome
      FROM notas_fiscais nf
      JOIN clientes c ON nf.cliente_id = c.id
      WHERE nf.id = ?
    `).get(req.params.id);
    res.json(nota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notas-fiscais/:id/itens', (req, res) => {
  try {
    const itens = db.prepare('SELECT * FROM itens_nota_fiscal WHERE nota_fiscal_id = ?').all(req.params.id);
    res.json(itens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notas-fiscais/:id', (req, res) => {
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

app.put('/api/notas-fiscais/:id', (req, res) => {
  try {
    const { valor_mao_de_obra, total_pecas, valor_total, observacoes, itens } = req.body;
    
    db.exec('BEGIN TRANSACTION');
    
    db.prepare(`
      UPDATE notas_fiscais 
      SET valor_mao_de_obra = ?, total_pecas = ?, valor_total = ?, observacoes = ?
      WHERE id = ?
    `).run(valor_mao_de_obra, total_pecas, valor_total, observacoes, req.params.id);
    
    db.prepare('DELETE FROM itens_nota_fiscal WHERE nota_fiscal_id = ?').run(req.params.id);
    
    const stmtItem = db.prepare(`
      INSERT INTO itens_nota_fiscal (nota_fiscal_id, nome_peca, quantidade, valor_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      stmtItem.run(req.params.id, item.nome_peca, item.quantidade, item.valor_unitario, item.subtotal);
    });
    
    db.exec('COMMIT');
    res.json({ success: true });
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notas-fiscais/buscar/:nome', (req, res) => {
  try {
    const notas = db.prepare(`
      SELECT nf.*, c.nome as cliente_nome
      FROM notas_fiscais nf
      JOIN clientes c ON nf.cliente_id = c.id
      WHERE c.nome LIKE ?
      ORDER BY nf.criado_em DESC
    `).all(`%${req.params.nome}%`);
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Banco de dados: C:\\database\\oficina.db`);
});
