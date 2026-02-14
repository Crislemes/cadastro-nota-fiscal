import { useState } from "react";
import { Toaster } from "sonner";
import { Home } from "./pages/Home";
import { InvoiceForm } from "./pages/InvoiceForm";
import { ViewInvoice } from "./pages/ViewInvoice";

type Page = 'home' | 'form' | 'view' | 'edit';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const handleNavigateToForm = () => {
    setSelectedInvoiceId(null);
    setCurrentPage('form');
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
    setSelectedInvoiceId(null);
  };

  const handleViewInvoice = (id: number) => {
    setSelectedInvoiceId(id);
    setCurrentPage('view');
  };

  const handleEditInvoice = (id: number) => {
    setSelectedInvoiceId(id);
    setCurrentPage('edit');
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      
      {currentPage === 'home' && (
        <Home 
          onNavigateToForm={handleNavigateToForm}
          onViewInvoice={handleViewInvoice}
          onEditInvoice={handleEditInvoice}
        />
      )}

      {currentPage === 'form' && (
        <InvoiceForm onBack={handleNavigateToHome} />
      )}

      {currentPage === 'edit' && selectedInvoiceId && (
        <InvoiceForm 
          onBack={handleNavigateToHome}
          editInvoiceId={selectedInvoiceId}
        />
      )}

      {currentPage === 'view' && selectedInvoiceId && (
        <ViewInvoice 
          invoiceId={selectedInvoiceId}
          onBack={handleNavigateToHome}
        />
      )}
    </>
  );
}

export default App;