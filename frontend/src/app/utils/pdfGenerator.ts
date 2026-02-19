import jsPDF from 'jspdf';
import { formatCurrency } from './formatters';
import logoImage from '../../assets/logo-pdf.png';

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface VehicleData {
  plate: string;
  model: string;
  year: string;
}

interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  clientData: ClientData;
  vehicleData?: VehicleData;
  parts: Part[];
  laborCost: number;
  observations: string;
  partsTotal: number;
  total: number;
  createdAt: string;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Adicionar logo
  try {
    const img = new Image();
    img.src = logoImage;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    doc.addImage(img, 'PNG', 15, yPosition, 24, 24);
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('A&C CENTRO AUTOMOTIVO', 45, yPosition + 8);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('NOTA FISCAL DE SERVIÇO', 45, yPosition + 15);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Serviços Mecânicos', 45, yPosition + 20);

  // Linha separadora
  yPosition += 28;
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // Informações de Contato
  yPosition += 8;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(15, yPosition, pageWidth - 30, 20, 2, 2, 'F');
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('INFORMAÇÕES DE CONTATO', 18, yPosition);
  
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(8);
  doc.text('Alessandro da Silva | (31) 9.9911-2667', 18, yPosition);
  
  yPosition += 4;
  doc.text('cristimaria077@gmail.com', 18, yPosition);

  // Data de Emissão
  yPosition += 10;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  const invoiceDate = new Date(data.createdAt).toLocaleDateString('pt-BR');
  doc.text(`Data de Emissão: ${invoiceDate}`, pageWidth - 15, yPosition, { align: 'right' });

  // Dados do Cliente
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DADOS DO CLIENTE', 15, yPosition);
  
  yPosition += 1;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  
  yPosition += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(`Nome: ${data.clientData.name}`, 15, yPosition);

  // Dados do Veículo
  if (data.vehicleData && (data.vehicleData.plate || data.vehicleData.model || data.vehicleData.year)) {
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DADOS DO VEÍCULO', 15, yPosition);
    
    yPosition += 1;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    const vehicleInfo = `Placa: ${data.vehicleData.plate || 'N/A'} | Ano: ${data.vehicleData.year || 'N/A'} | Modelo: ${data.vehicleData.model || 'N/A'}`;
    doc.text(vehicleInfo, 15, yPosition);
  }

  // Peças Utilizadas
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PEÇAS UTILIZADAS', 15, yPosition);
  
  yPosition += 1;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  if (data.parts.length > 0) {
    yPosition += 6;
    
    // Cabeçalho da tabela
    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPosition - 4, pageWidth - 30, 7, 'F');
    
    doc.setDrawColor(229, 231, 235);
    doc.rect(15, yPosition - 4, pageWidth - 30, 7, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Nome da Peça', 18, yPosition);
    doc.text('Qtd', 120, yPosition, { align: 'center' });
    doc.text('Valor Unit.', 150, yPosition, { align: 'right' });
    doc.text('Subtotal', pageWidth - 18, yPosition, { align: 'right' });
    
    yPosition += 7;
    
    // Itens
    doc.setFont('helvetica', 'normal');
    data.parts.forEach((part, index) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(55, 65, 81);
      doc.text(part.name, 18, yPosition);
      doc.text(part.quantity.toString(), 120, yPosition, { align: 'center' });
      doc.text(formatCurrency(part.unitPrice), 150, yPosition, { align: 'right' });
      doc.text(formatCurrency(part.quantity * part.unitPrice), pageWidth - 18, yPosition, { align: 'right' });
      
      yPosition += 6;
      
      if (index < data.parts.length - 1) {
        doc.setDrawColor(243, 244, 246);
        doc.line(15, yPosition - 3, pageWidth - 15, yPosition - 3);
      }
    });
    
    // Mão de Obra
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPosition - 3, pageWidth - 15, yPosition - 3);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Mão de Obra:', 18, yPosition);
    doc.text(formatCurrency(data.laborCost), pageWidth - 18, yPosition, { align: 'right' });
    
    yPosition += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
  }
  
  // Total Final
  yPosition += 8;
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(15, yPosition - 4, pageWidth - 30, 12, 2, 2, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL:', 18, yPosition + 3);
  
  doc.setFontSize(14);
  doc.text(formatCurrency(data.total), pageWidth - 18, yPosition + 3, { align: 'right' });

  // Observações
  if (data.observations) {
    yPosition += 16;
    doc.setFillColor(254, 252, 232);
    const obsHeight = 15;
    doc.roundedRect(15, yPosition - 4, pageWidth - 30, obsHeight, 2, 2, 'F');
    
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(2);
    doc.line(15, yPosition - 4, 15, yPosition - 4 + obsHeight);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 53, 15);
    doc.text('OBSERVAÇÕES', 20, yPosition);
    
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14);
    const splitObs = doc.splitTextToSize(data.observations, pageWidth - 40);
    doc.text(splitObs, 20, yPosition);
  }

  // Rodapé
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('AGRADECEMOS A PREFERÊNCIA!', pageWidth / 2, footerY + 6, { align: 'center' });

  // Salvar PDF
  const fileName = `nota_fiscal_${data.clientData.name.replace(/\s+/g, '_')}_${invoiceDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
