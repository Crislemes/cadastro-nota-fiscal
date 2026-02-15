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
  const margin = 20;
  let y = margin + 5;

  // CABEÇALHO - Logo (80x80px = ~28x28mm)
  const img = new Image();
  img.src = logoImage;
  doc.addImage(img, 'PNG', margin, y, 28, 28);

  // Informações da Empresa ao lado do logo
  const textX = margin + 32;
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('A&C CENTRO AUTOMOTIVO', textX, y + 8);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81); // gray-700
  doc.text('NOTA FISCAL DE SERVIÇO', textX, y + 15);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text('Serviços Mecânicos', textX, y + 20);

  y += 32;

  // Linha divisória gradiente (simulada com azul claro)
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // INFORMAÇÕES DE CONTATO - Fundo azul claro
  const contactBoxHeight = 20;
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(margin, y, pageWidth - 2 * margin, contactBoxHeight, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('INFORMAÇÕES DE CONTATO', margin + 3, y + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81); // gray-700
  doc.text('Alessandro da Silva | (31) 9.9911-2667', margin + 3, y + 10);
  doc.text('cristimaria77@gmail.com', margin + 3, y + 14);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text('A&C Centro Automotivo - Sistema de Gestão de Notas Fiscais', margin + 3, y + 18);

  y += contactBoxHeight + 6;

  // DATA DE EMISSÃO - Alinhada à direita
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // gray-500
  const dateLabel = 'Data de Emissão: ';
  const dateLabelWidth = doc.getTextWidth(dateLabel);
  const dateValueWidth = doc.getTextWidth(currentDate);
  doc.text(dateLabel, pageWidth - margin - dateLabelWidth - dateValueWidth, y);
  doc.setTextColor(55, 65, 81); // gray-700
  doc.text(currentDate, pageWidth - margin - dateValueWidth, y);

  y += 8;

  // DADOS DO CLIENTE
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text('DADOS DO CLIENTE', margin, y);
  
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.3);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81); // gray-700
  doc.text(`Nome: ${data.clientData.name}`, margin, y);

  y += 8;

  // DADOS DO VEÍCULO
  if (data.vehicleData.plate || data.vehicleData.year || data.vehicleData.model) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('DADOS DO VEÍCULO', margin, y);
    
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81); // gray-700
    const vehicleInfo = [];
    if (data.vehicleData.plate) vehicleInfo.push(`Placa: ${data.vehicleData.plate}`);
    if (data.vehicleData.year) vehicleInfo.push(`Ano: ${data.vehicleData.year}`);
    if (data.vehicleData.model) vehicleInfo.push(`Modelo: ${data.vehicleData.model}`);
    doc.text(vehicleInfo.join(' | '), margin, y);

    y += 8;
  }

  // PEÇAS UTILIZADAS
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text('PEÇAS UTILIZADAS', margin, y);
  
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);

  y += 6;

  // TABELA DE PEÇAS
  if (data.parts.length > 0) {
    const tableStartY = y;
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = {
      desc: tableWidth * 0.50,
      qty: tableWidth * 0.12,
      unit: tableWidth * 0.19,
      subtotal: tableWidth * 0.19
    };

    // Borda externa da tabela
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, tableStartY, tableWidth, 0, 3, 3, 'S'); // Será ajustado depois

    // Cabeçalho da tabela
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(margin, y, tableWidth, 7, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81); // gray-700
    doc.text('Descrição', margin + 3, y + 4.5);
    doc.text('Qtd', margin + colWidths.desc + colWidths.qty / 2, y + 4.5, { align: 'center' });
    doc.text('Valor Unit.', margin + colWidths.desc + colWidths.qty + colWidths.unit - 3, y + 4.5, { align: 'right' });
    doc.text('Subtotal', margin + tableWidth - 3, y + 4.5, { align: 'right' });

    y += 7;

    // Linhas de dados
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81); // gray-700
    data.parts.forEach((part, index) => {
      if (index > 0) {
        doc.setDrawColor(243, 244, 246); // gray-100
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
      }
      
      y += 5;
      doc.text(part.name, margin + 3, y);
      doc.text(part.quantity.toString(), margin + colWidths.desc + colWidths.qty / 2, y, { align: 'center' });
      doc.text(formatCurrency(part.unitPrice), margin + colWidths.desc + colWidths.qty + colWidths.unit - 3, y, { align: 'right' });
      doc.text(formatCurrency(part.quantity * part.unitPrice), margin + tableWidth - 3, y, { align: 'right' });
      y += 2;
    });

    // Borda externa completa da tabela
    const tableHeight = y - tableStartY;
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, tableStartY, tableWidth, tableHeight, 3, 3, 'S');
  }

  y += 6;

  // TOTAIS
  const totalsX = pageWidth - margin - 60;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128); // gray-600
  doc.text('Total das Peças:', totalsX, y);
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text(formatCurrency(data.partsTotal), pageWidth - margin - 3, y, { align: 'right' });

  y += 5;
  doc.setTextColor(107, 114, 128); // gray-600
  doc.text('Mão de Obra:', totalsX, y);
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text(formatCurrency(data.laborCost), pageWidth - margin - 3, y, { align: 'right' });

  y += 7;

  // VALOR TOTAL - Fundo azul gradiente
  const totalBoxHeight = 12;
  doc.setFillColor(37, 99, 235); // blue-600
  doc.roundedRect(margin, y, pageWidth - 2 * margin, totalBoxHeight, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // white
  doc.text('VALOR TOTAL:', margin + 3, y + 8);
  
  doc.setFontSize(18);
  doc.text(formatCurrency(data.total), pageWidth - margin - 3, y + 8, { align: 'right' });

  y += totalBoxHeight + 6;

  // OBSERVAÇÕES
  if (data.observations) {
    const obsLines = doc.splitTextToSize(data.observations, pageWidth - 2 * margin - 10);
    const obsHeight = Math.max(16, obsLines.length * 4 + 8);
    
    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(margin, y, pageWidth - 2 * margin, obsHeight, 3, 3, 'F');
    
    // Borda esquerda amarela
    doc.setDrawColor(251, 191, 36); // amber-400
    doc.setLineWidth(3);
    doc.line(margin, y + 1, margin, y + obsHeight - 1);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 53, 15); // amber-900
    doc.text('OBSERVAÇÕES', margin + 5, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text(obsLines, margin + 5, y + 9);
    
    y += obsHeight + 6;
  }

  // RODAPÉ
  const footerY = pageHeight - 20;
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('AGRADECEMOS A PREFERÊNCIA!', pageWidth / 2, footerY + 5, { align: 'center' });

  const fileName = `nota_fiscal_${data.clientData.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
