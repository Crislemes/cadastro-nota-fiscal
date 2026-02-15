import jsPDF from 'jspdf';
import { formatCurrency } from './formatters';
import logoImage from '../../assets/logo-marca-oficina.png';

interface ClientData {
  name: string;
  cpfCnpj: string;
  phone: string;
  address: string;
}

interface VehicleData {
  plate: string;
  year: string;
  model: string;
}

interface Part {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  clientData: ClientData;
  vehicleData: VehicleData;
  parts: Part[];
  laborCost: number;
  observations: string;
  partsTotal: number;
  total: number;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // Container com sombra suave
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(18, 18, pageWidth - 36, pageHeight - 36, 8, 8, 'F');
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 8, 8, 'F');

  // CABEÇALHO - Logo e Informações
  const img = new Image();
  img.src = logoImage;
  doc.addImage(img, 'PNG', 25, y, 28, 28);

  // Informações da Empresa
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('A&C CENTRO AUTOMOTIVO', 58, y + 10);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text('NOTA FISCAL DE SERVIÇO', 58, y + 18);

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text('Serviços Mecânicos', 58, y + 24);

  y += 34;

  // Linha divisória gradiente
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.3);
  doc.line(25, y, pageWidth - 25, y);

  y += 8;

  // SEÇÃO 1 - Informações de Contato
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(25, y, pageWidth - 50, 22, 8, 8, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('INFORMAÇÕES DE CONTATO', 28, y + 6);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text('Alessandro da Silva | (31) 9.9911-2667', 28, y + 12);
  doc.text('cristimaria77@gmail.com', 28, y + 17);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text('A&C Centro Automotivo - Sistema de Gestão de Notas Fiscais', pageWidth / 2, y + 17, { align: 'center' });

  y += 28;

  // SEÇÃO 2 - Data de Emissão
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  const dateText = `Data de Emissão: `;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - 25 - doc.getTextWidth(dateText + currentDate), y);
  doc.setTextColor(55, 65, 81);
  doc.text(currentDate, pageWidth - 25 - doc.getTextWidth(currentDate), y);

  y += 10;

  // SEÇÃO 3 - Dados do Cliente
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('DADOS DO CLIENTE', 25, y);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(25, y + 2, pageWidth - 25, y + 2);

  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(`Nome: ${data.clientData.name}`, 25, y);

  y += 10;

  // SEÇÃO 4 - Dados do Veículo
  if (data.vehicleData.plate || data.vehicleData.year || data.vehicleData.model) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('DADOS DO VEÍCULO', 25, y);
    doc.setDrawColor(229, 231, 235);
    doc.line(25, y + 2, pageWidth - 25, y + 2);

    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    const vehicleInfo = [];
    if (data.vehicleData.plate) vehicleInfo.push(`Placa: ${data.vehicleData.plate}`);
    if (data.vehicleData.year) vehicleInfo.push(`Ano: ${data.vehicleData.year}`);
    if (data.vehicleData.model) vehicleInfo.push(`Modelo: ${data.vehicleData.model}`);
    doc.text(vehicleInfo.join(' | '), 25, y);

    y += 10;
  }

  // SEÇÃO 5 - Tabela de Peças
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('PEÇAS UTILIZADAS', 25, y);
  doc.setDrawColor(229, 231, 235);
  doc.line(25, y + 2, pageWidth - 25, y + 2);

  y += 10;

  if (data.parts.length > 0) {
    // Borda da tabela
    const tableStartY = y;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    
    // Cabeçalho da tabela
    doc.setFillColor(249, 250, 251);
    doc.rect(25, y, pageWidth - 50, 8, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Descrição', 28, y + 5.5);
    doc.text('Qtd', pageWidth - 115, y + 5.5, { align: 'center' });
    doc.text('Valor Unit.', pageWidth - 70, y + 5.5, { align: 'right' });
    doc.text('Subtotal', pageWidth - 28, y + 5.5, { align: 'right' });

    y += 8;

    // Linhas de dados
    doc.setFont('helvetica', 'normal');
    data.parts.forEach((part, index) => {
      if (index > 0) {
        doc.setDrawColor(243, 244, 246);
        doc.line(25, y, pageWidth - 25, y);
      }
      
      y += 6;
      doc.text(part.name, 28, y);
      doc.text(part.quantity.toString(), pageWidth - 115, y, { align: 'center' });
      doc.text(formatCurrency(part.unitPrice), pageWidth - 70, y, { align: 'right' });
      doc.text(formatCurrency(part.quantity * part.unitPrice), pageWidth - 28, y, { align: 'right' });
      y += 2;
    });

    // Borda externa da tabela
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(25, tableStartY, pageWidth - 50, y - tableStartY, 8, 8, 'S');
  }

  y += 10;

  // SEÇÃO 6 - Totais
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text('Total das Peças:', pageWidth - 90, y);
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(data.partsTotal), pageWidth - 28, y, { align: 'right' });

  y += 6;
  doc.setTextColor(75, 85, 99);
  doc.text('Mão de Obra:', pageWidth - 90, y);
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrency(data.laborCost), pageWidth - 28, y, { align: 'right' });

  y += 10;

  // Total Geral com gradiente azul
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(25, y, pageWidth - 50, 14, 8, 8, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL:', 28, y + 9);
  
  doc.setFontSize(22);
  doc.text(formatCurrency(data.total), pageWidth - 28, y + 9, { align: 'right' });

  y += 20;

  // SEÇÃO 7 - Observações
  if (data.observations) {
    const obsHeight = Math.max(20, doc.splitTextToSize(data.observations, pageWidth - 65).length * 5 + 10);
    
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(25, y, pageWidth - 50, obsHeight, 8, 8, 'F');
    
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(4);
    doc.line(25, y + 2, 25, y + obsHeight - 2);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 53, 15);
    doc.text('OBSERVAÇÕES', 32, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14);
    const splitObs = doc.splitTextToSize(data.observations, pageWidth - 65);
    doc.text(splitObs, 32, y + 13);
    
    y += obsHeight + 8;
  }

  // RODAPÉ
  const footerY = pageHeight - 30;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(25, footerY, pageWidth - 25, footerY);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('AGRADECEMOS A PREFERÊNCIA!', pageWidth / 2, footerY + 7, { align: 'center' });

  const fileName = `nota_fiscal_${data.clientData.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
