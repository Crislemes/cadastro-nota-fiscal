import jsPDF from 'jspdf';
import { formatCurrency } from './formatters';

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  clientData: ClientData;
  parts: Part[];
  laborCost: number;
  observations: string;
  partsTotal: number;
  total: number;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Carregar e adicionar logo
  try {
    const logoUrl = 'figma:asset/e75648d651905af815f53d6711c8e8e3df032e74.png';
    // Adicionar logo no topo centralizada
    const logoWidth = 50;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2;
    
    // Criar retângulo de fundo azul claro
    doc.setFillColor(239, 246, 255); // bg-blue-50
    doc.roundedRect((pageWidth - 60) / 2, yPosition - 5, 60, 18, 2, 2, 'F');
    
    // Adicionar borda azul
    doc.setDrawColor(37, 99, 235); // border-blue-600
    doc.setLineWidth(0.8);
    doc.roundedRect((pageWidth - 60) / 2, yPosition - 5, 60, 18, 2, 2, 'S');
    
    // Cabeçalho de texto estilizado com a cor azul
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Azul #2563eb
    doc.text('A&C', pageWidth / 2, yPosition + 2, { align: 'center' });
    
    yPosition += 7;
    doc.setFontSize(11);
    doc.text('CENTRO AUTOMOTIVO', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
    yPosition = 20;
  }

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Azul
  doc.text('NOTA FISCAL DE SERVIÇO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Serviços Mecânicos', pageWidth / 2, yPosition, { align: 'center' });
  
  // Data de emissão
  yPosition += 8;
  doc.setFontSize(9);
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data de Emissão: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
  
  // Linha separadora
  yPosition += 6;
  doc.setLineWidth(0.5);
  doc.setDrawColor(37, 99, 235);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  doc.setDrawColor(0, 0, 0);
  
  // Dados do Cliente
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 15, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.clientData.name}`, 15, yPosition);
  
  yPosition += 6;
  doc.text(`CPF/CNPJ: ${data.clientData.cpfCnpj}`, 15, yPosition);
  
  yPosition += 6;
  doc.text(`Telefone: ${data.clientData.phone}`, 15, yPosition);
  
  yPosition += 6;
  doc.text(`Endereço: ${data.clientData.address}`, 15, yPosition);
  
  // Linha separadora
  yPosition += 8;
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  
  // Peças Utilizadas
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PEÇAS UTILIZADAS', 15, yPosition);
  
  if (data.parts.length > 0) {
    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    // Cabeçalho da tabela
    doc.text('Descrição', 15, yPosition);
    doc.text('Qtd', 120, yPosition);
    doc.text('Valor Unit.', 140, yPosition);
    doc.text('Subtotal', 170, yPosition);
    
    yPosition += 2;
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    
    // Itens
    doc.setFont('helvetica', 'normal');
    data.parts.forEach((part) => {
      yPosition += 6;
      
      // Verificar se precisa de nova página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(part.name, 15, yPosition);
      doc.text(part.quantity.toString(), 120, yPosition);
      doc.text(formatCurrency(part.unitPrice), 140, yPosition);
      doc.text(formatCurrency(part.quantity * part.unitPrice), 170, yPosition);
    });
    
    yPosition += 2;
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Total das Peças:', 120, yPosition);
    doc.text(formatCurrency(data.partsTotal), 170, yPosition);
  } else {
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma peça utilizada', 15, yPosition);
  }
  
  // Mão de Obra
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Mão de Obra:', 120, yPosition);
  doc.text(formatCurrency(data.laborCost), 170, yPosition);
  
  // Total
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFillColor(37, 99, 235); // Azul
  doc.rect(15, yPosition - 4, pageWidth - 30, 10, 'F');
  doc.setTextColor(255, 255, 255); // Branco
  doc.text('VALOR TOTAL:', 120, yPosition + 2);
  doc.text(formatCurrency(data.total), 170, yPosition + 2);
  doc.setTextColor(0, 0, 0); // Resetar para preto
  
  // Observações
  if (data.observations) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 15, yPosition);
    
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 30);
    doc.text(splitObservations, 15, yPosition);
  }
  
  // Rodapé
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'A&C Centro Automotivo - Sistema de Gestão de Notas Fiscais',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  
  // Salvar PDF
  const fileName = `nota_fiscal_${data.clientData.name.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};