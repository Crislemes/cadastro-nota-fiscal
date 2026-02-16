import { createContext, useContext, useState, ReactNode } from 'react';

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
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Omit<Client, 'id' | 'createdAt'>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    // Verifica duplicação por nome + telefone
    const duplicate = clients.find(
      c => c.name.toLowerCase() === client.name.toLowerCase() && 
           c.phone === client.phone
    );
    
    if (duplicate) {
      throw new Error('Cliente com mesmo nome e telefone já cadastrado');
    }
    
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...clients, newClient];
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  const updateClient = (id: string, client: Omit<Client, 'id' | 'createdAt'>) => {
    const updated = clients.map(c => 
      c.id === id ? { ...client, id, createdAt: c.createdAt } : c
    );
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  const getClientById = (id: string) => {
    return clients.find(c => c.id === id);
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
  };

  const updateInvoice = (id: string, invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const updated = invoices.map(inv => 
      inv.id === id ? { ...invoice, id, createdAt: inv.createdAt } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        invoices,
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
