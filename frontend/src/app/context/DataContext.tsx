import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  clientData: {
    name: string;
    cpfCnpj: string;
    phone: string;
    address: string;
  };
  vehicleData?: {
    plate: string;
    model: string;
    year: string;
  };
  parts: Part[];
  laborCost: number;
  observations: string;
  partsTotal: number;
  total: number;
  createdAt: string;
  status: 'draft' | 'saved';
}

interface DataContextType {
  clients: Client[];
  invoices: Invoice[];
  loadClients: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<string>;
  updateClient: (id: string, client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clientes');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((c: any) => ({
          id: c.id_cliente.toString(),
          name: c.nome,
          cpfCnpj: c.cpf_cnpj || '',
          phone: c.telefone,
          address: c.endereco || '',
          email: c.observacoes || '',
          createdAt: c.criado_em
        }));
        setClients(mapped);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notas-fiscais');
      if (response.ok) {
        const data = await response.json();
        const mapped = await Promise.all(data.map(async (nf: any) => {
          // Buscar dados completos do cliente
          const clienteResponse = await fetch(`http://localhost:3001/api/clientes/${nf.id_cliente}`);
          let clienteData = {
            name: nf.cliente_nome,
            cpfCnpj: '',
            phone: '',
            address: ''
          };
          if (clienteResponse.ok) {
            const cliente = await clienteResponse.json();
            clienteData = {
              name: cliente.nome,
              cpfCnpj: cliente.cpf_cnpj || '',
              phone: cliente.telefone || '',
              address: cliente.endereco || ''
            };
          }

          // Buscar dados do veículo
          let vehicleData = { plate: '', model: '', year: '' };
          if (nf.id_veiculo) {
            const veiculoResponse = await fetch(`http://localhost:3001/api/veiculos/${nf.id_veiculo}`);
            if (veiculoResponse.ok) {
              const veiculo = await veiculoResponse.json();
              vehicleData = {
                plate: veiculo.placa || '',
                model: veiculo.modelo || '',
                year: veiculo.ano || ''
              };
            }
          } else if (nf.veiculo_placa || nf.veiculo_modelo || nf.veiculo_ano) {
            vehicleData = {
              plate: nf.veiculo_placa || '',
              model: nf.veiculo_modelo || '',
              year: nf.veiculo_ano || ''
            };
          }

          // Buscar peças da nota
          const pecasResponse = await fetch(`http://localhost:3001/api/notas-fiscais/${nf.id_nota}/pecas`);
          let pecas = [];
          if (pecasResponse.ok) {
            const pecasData = await pecasResponse.json();
            pecas = pecasData.map((p: any) => ({
              id: p.id_peca.toString(),
              name: p.descricao,
              quantity: p.quantidade,
              unitPrice: p.valor_unitario
            }));
          }

          return {
            id: nf.id_nota.toString(),
            clientData: clienteData,
            vehicleData: vehicleData,
            parts: pecas,
            laborCost: nf.valor_mao_de_obra || 0,
            observations: nf.observacoes || '',
            partsTotal: nf.total_pecas || 0,
            total: nf.valor_total,
            createdAt: nf.data_emissao || nf.criado_em,
            status: 'saved' as const
          };
        }));
        setInvoices(mapped);
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  useEffect(() => {
    loadClients();
    loadInvoices();
  }, []);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: client.name,
          cpf_cnpj: client.cpfCnpj,
          telefone: client.phone,
          endereco: client.address,
          observacoes: client.email
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao cadastrar cliente');
      }

      const data = await response.json();
      await loadClients();
      return data.id.toString();
    } catch (error) {
      throw error;
    }
  };

  const updateClient = async (id: string, client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: client.name,
          cpf_cnpj: client.cpfCnpj,
          telefone: client.phone,
          endereco: client.address,
          observacoes: client.email
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar cliente');
      }

      await loadClients();
    } catch (error) {
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar cliente');
      }

      await loadClients();
    } catch (error) {
      throw error;
    }
  };

  const getClientById = (id: string) => {
    return clients.find(c => c.id === id);
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const cliente = clients.find(c => c.name === invoice.clientData.name);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Salvar veículo se fornecido
      let vehicleId = null;
      if (invoice.vehicleData && (invoice.vehicleData.plate || invoice.vehicleData.model)) {
        const vehicleResponse = await fetch('http://localhost:3001/api/veiculos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_cliente: parseInt(cliente.id),
            placa: invoice.vehicleData.plate,
            modelo: invoice.vehicleData.model,
            marca: invoice.vehicleData.brand || '',
            ano: invoice.vehicleData.year
          })
        });
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          vehicleId = vehicleData.id;
        }
      }

      const response = await fetch('http://localhost:3001/api/notas-fiscais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_nota: `NF-${Date.now()}`,
          id_cliente: parseInt(cliente.id),
          id_veiculo: vehicleId,
          veiculo_placa: invoice.vehicleData?.plate || '',
          veiculo_modelo: invoice.vehicleData?.model || '',
          veiculo_ano: invoice.vehicleData?.year || '',
          data_emissao: invoice.createdAt,
          valor_mao_de_obra: invoice.laborCost,
          total_pecas: invoice.partsTotal,
          valor_total: invoice.total,
          observacoes: invoice.observations,
          status: 'active',
          pecas: invoice.parts.map(p => ({
            descricao: p.name,
            quantidade: p.quantity,
            valor_unitario: p.unitPrice,
            subtotal: p.quantity * p.unitPrice
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar nota fiscal');
      }

      await loadInvoices();
    } catch (error) {
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notas-fiscais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veiculo_placa: invoice.vehicleData?.plate || '',
          veiculo_modelo: invoice.vehicleData?.model || '',
          veiculo_ano: invoice.vehicleData?.year || '',
          valor_mao_de_obra: invoice.laborCost,
          total_pecas: invoice.partsTotal,
          valor_total: invoice.total,
          observacoes: invoice.observations,
          pecas: invoice.parts.map(p => ({
            descricao: p.name,
            quantidade: p.quantity,
            valor_unitario: p.unitPrice,
            subtotal: p.quantity * p.unitPrice
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar nota fiscal');
      }

      await loadInvoices();
    } catch (error) {
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/notas-fiscais/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar nota fiscal');
      }

      await loadInvoices();
    } catch (error) {
      throw error;
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        invoices,
        loadClients,
        loadInvoices,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
