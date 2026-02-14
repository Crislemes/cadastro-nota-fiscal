// Serviço de banco de dados SQLite via API Backend
const API_URL = import.meta.env.PROD 
  ? 'https://nota-fiscal-backend.onrender.com/api'
  : 'http://localhost:3001/api';

export interface Cliente {
  id?: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  endereco: string;
  criado_em?: string;
}

export interface Veiculo {
  id?: number;
  placa: string;
  ano: string;
  modelo: string;
  cliente_id?: number;
  criado_em?: string;
}

export interface NotaFiscal {
  id?: number;
  numero_nota: string;
  cliente_id: number;
  veiculo_id?: number;
  valor_mao_de_obra: number;
  total_pecas: number;
  valor_total: number;
  observacoes: string;
  status: string;
  criado_em?: string;
  cliente_nome?: string;
}

export interface ItemNotaFiscal {
  id?: number;
  nota_fiscal_id: number;
  nome_peca: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

class DatabaseService {
  async salvarCliente(cliente: Cliente): Promise<number> {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });
    const data = await response.json();
    return data.id;
  }

  async salvarVeiculo(veiculo: Veiculo): Promise<number> {
    const response = await fetch(`${API_URL}/veiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veiculo),
    });
    const data = await response.json();
    return data.id;
  }

  async salvarNotaFiscal(nota: NotaFiscal, itens: ItemNotaFiscal[]): Promise<number> {
    const response = await fetch(`${API_URL}/notas-fiscais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nota, itens }),
    });
    const data = await response.json();
    return data.id;
  }

  async getClientes(): Promise<Cliente[]> {
    const response = await fetch(`${API_URL}/clientes`);
    return response.json();
  }

  async getNotasFiscais(): Promise<NotaFiscal[]> {
    try {
      const response = await fetch(`${API_URL}/notas-fiscais`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Notas da API:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      return [];
    }
  }

  async getNotaFiscalById(id: number): Promise<NotaFiscal | null> {
    const response = await fetch(`${API_URL}/notas-fiscais/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async getItensByNotaId(notaId: number): Promise<ItemNotaFiscal[]> {
    const response = await fetch(`${API_URL}/notas-fiscais/${notaId}/itens`);
    return response.json();
  }

  async getClienteById(id: number): Promise<Cliente | null> {
    const response = await fetch(`${API_URL}/clientes/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async getVeiculoById(id: number): Promise<Veiculo | null> {
    const response = await fetch(`${API_URL}/veiculos/${id}`);
    if (!response.ok) return null;
    return response.json();
  }

  async buscarNotasPorCliente(nomeCliente: string): Promise<NotaFiscal[]> {
    const response = await fetch(`${API_URL}/notas-fiscais/buscar/${encodeURIComponent(nomeCliente)}`);
    return response.json();
  }

  async excluirNotaFiscal(id: number): Promise<void> {
    await fetch(`${API_URL}/notas-fiscais/${id}`, {
      method: 'DELETE',
    });
  }

  async atualizarNotaFiscal(id: number, nota: Partial<NotaFiscal>, itens: ItemNotaFiscal[]): Promise<void> {
    await fetch(`${API_URL}/notas-fiscais/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nota, itens }),
    });
  }

  gerarNumeroNota(): string {
    const numero = Math.floor(Math.random() * 999999) + 1;
    return `NF${String(numero).padStart(6, '0')}`;
  }

  // Métodos auxiliares mantidos para compatibilidade
  getVeiculos(): Veiculo[] {
    return [];
  }

  getItensNotaFiscal(): ItemNotaFiscal[] {
    return [];
  }
}

export const db = new DatabaseService();
