import { jsPDF } from 'jspdf';
import { Budget, Client, FinancialTransaction, MaintenanceRecord, Equipment } from '../types';

// Helper to format currency
const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Helper to format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const generateBudgetPDF = (budget: Budget, client: Client) => {
  const doc = new jsPDF();

  // Document header / Border
  doc.setFillColor(28, 100, 242); // Blue primary
  doc.rect(0, 0, 210, 15, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(28, 100, 242);
  doc.text('Clima Gest', 15, 35);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Soluções em Climatização e Refrigeração', 15, 41);
  doc.text('E-mail: contato@climagest.com.br', 15, 46);

  // Budget details top-right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(`ORÇAMENTO Nº ${budget.id.toUpperCase()}`, 130, 35);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${formatDate(budget.date)}`, 130, 41);
  doc.text(`Status: ${budget.status}`, 130, 46);

  // Decorative divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 52, 195, 52);

  // Customer Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 100, 242);
  doc.text('DADOS DO CLIENTE', 15, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Nome: ${client.name}`, 15, 67);
  doc.text(`Telefone: ${client.phone}`, 15, 73);
  doc.text(`Endereço: ${client.address}`, 15, 79);

  // Service Section
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 100, 242);
  doc.text('DESCRIÇÃO DOS SERVIÇOS E PRODUTOS', 15, 92);

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 97, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Serviço / Descrição', 18, 102);
  doc.text('Qtd', 130, 102);
  doc.text('Preço Unit.', 145, 102);
  doc.text('Total', 175, 102);

  let currentY = 109;

  budget.services.forEach((service) => {
    // Check page limits if too many services (for standard, we keep fit)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    // Auto-wrap text if long
    const descText = service.description;
    const splitDesc = doc.splitTextToSize(descText, 105);
    
    doc.text(splitDesc, 18, currentY);
    doc.text(service.quantity.toString(), 130, currentY);
    doc.text(formatBRL(service.price), 145, currentY);
    doc.text(formatBRL(service.price * service.quantity), 175, currentY);

    const textHeight = splitDesc.length * 5;
    currentY += Math.max(textHeight, 8);

    // Draw bottom border line
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY - 2, 195, currentY - 2);
  });

  // Calculation total
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('VALOR TOTAL:', 130, currentY);
  doc.setTextColor(34, 197, 94); // green
  doc.text(formatBRL(budget.totalValue), 165, currentY);

  // Observations Card
  currentY += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 25, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 25, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('OBSERVAÇÕES:', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const obsLines = doc.splitTextToSize(budget.observations || 'Nenhuma observação cadastrada.', 174);
  doc.text(obsLines, 18, currentY + 12);

  // Footer Signatures
  currentY += 45;
  doc.setDrawColor(203, 213, 225);
  doc.line(25, currentY, 85, currentY);
  doc.line(125, currentY, 185, currentY);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Assinatura do Técnico', 43, currentY + 5);
  doc.text('Assinatura do Cliente', 143, currentY + 5);

  // Save the budget
  doc.save(`Orcamento_${budget.id}_ClimaGest.pdf`);
};

export const generateServiceReportPDF = (record: MaintenanceRecord, client: Client, equipment: Equipment) => {
  const doc = new jsPDF();

  // Document header / Border
  doc.setFillColor(30, 41, 59); // Dark blue / slate
  doc.rect(0, 0, 210, 15, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text('Clima Gest', 15, 30);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('RELATÓRIO DE VISITA TÉCNICA E MANUTENÇÃO', 15, 37);

  // Date top right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Data: ${formatDate(record.date)}`, 140, 30);
  doc.text(`Relatório ID: #${record.id.toUpperCase()}`, 140, 35);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);

  // Section Client
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Cliente:', 15, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nome: ${client.name}`, 15, 60);
  doc.text(`Telefone: ${client.phone}`, 15, 65);
  doc.text(`Endereço: ${client.address}`, 15, 70);

  // Section Equipment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Equipamento Relacionado:', 110, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Marca: ${equipment.brand}`, 110, 60);
  doc.text(`Modelo/Tipo: ${equipment.modelType}`, 110, 65);
  doc.text(`Capacidade: ${equipment.capacityBTU} BTUs`, 110, 70);
  doc.text(`Nº de Série: ${equipment.serialNumber || 'N/A'}`, 110, 75);
  doc.text(`Localização: ${equipment.location || 'Não informada'}`, 110, 80);

  // Divider
  doc.line(15, 86, 195, 86);

  // Service details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(28, 100, 242);
  doc.text('Serviço Realizado:', 15, 95);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 100, 180, 55, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 100, 180, 55, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Tipo de Intervenção: ${record.serviceType}`, 20, 106);
  doc.text(`Valor Cobrado: ${formatBRL(record.cost)}`, 20, 111);
  doc.text(`Peças Utilizadas: ${record.partsUsed || 'Nenhuma registrada'}`, 20, 116);

  doc.text('Descrição Detalhada dos Trabalhos:', 20, 124);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const serviceLines = doc.splitTextToSize(record.description, 170);
  doc.text(serviceLines, 20, 130);

  // Image section
  let currentY = 165;
  if (record.photoBefore || record.photoAfter) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Registro Fotográfico do Dispositivo:', 15, currentY);
    
    try {
      if (record.photoBefore) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Estado Antes:', 20, currentY + 8);
        doc.addImage(record.photoBefore, 'JPEG', 20, currentY + 12, 75, 55);
      }
      if (record.photoAfter) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Estado Depois (Reparado):', 110, currentY + 8);
        doc.addImage(record.photoAfter, 'JPEG', 110, currentY + 12, 75, 55);
      }
      currentY += 75;
    } catch (e) {
      doc.setFontSize(9);
      doc.setTextColor(239, 68, 68);
      doc.text('[Erro ao renderizar imagens anexadas no PDF]', 15, currentY + 10);
      currentY += 15;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('(Sem fotos registradas para este atendimento no banco de imagens)', 15, currentY + 5);
    currentY += 15;
  }

  // Signature
  currentY += 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(65, currentY, 145, currentY);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Assinatura do Responsável Técnico pelo Atendimento', 60, currentY + 6);

  doc.save(`Ordem_Servico_${record.id}_ClimaGest.pdf`);
};

export const generateFinancialReportPDF = (transactions: FinancialTransaction[], periodText: string) => {
  const doc = new jsPDF();

  // Document header / Border
  doc.setFillColor(16, 185, 129); // Green secondary
  doc.rect(0, 0, 210, 15, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text('Clima Gest', 15, 30);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RELATÓRIO FINANCEIRO DE GESTÃO', 15, 37);

  // Period / Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Período analisado: ${periodText}`, 15, 43);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 140, 30);

  // Calcul totals
  const totalReceitas = transactions
    .filter(t => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalPendenteReceber = transactions
    .filter(t => t.type === 'receita' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.value, 0);

  const totalPendentePagar = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.value, 0);

  const lucroEfetivo = totalReceitas - totalDespesas;

  // Visual cards
  // 1. Receitas
  doc.setFillColor(240, 253, 244);
  doc.rect(15, 50, 56, 22, 'F');
  doc.setDrawColor(220, 252, 231);
  doc.rect(15, 50, 56, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 163, 74);
  doc.text('RECEITAS (PAGAS)', 18, 56);
  doc.setFontSize(12);
  doc.text(formatBRL(totalReceitas), 18, 66);

  // 2. Despesas
  doc.setFillColor(254, 242, 242);
  doc.rect(77, 50, 56, 22, 'F');
  doc.setDrawColor(254, 226, 226);
  doc.rect(77, 50, 56, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text('DESPESAS (PAGAS)', 80, 56);
  doc.setFontSize(12);
  doc.text(formatBRL(totalDespesas), 80, 66);

  // 3. Saldo Liquido
  doc.setFillColor(240, 249, 255);
  doc.rect(139, 50, 56, 22, 'F');
  doc.setDrawColor(224, 242, 254);
  doc.rect(139, 50, 56, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text('LUCRO LÍQUIDO', 142, 56);
  doc.setFontSize(12);
  doc.text(formatBRL(lucroEfetivo), 142, 66);

  // Pendings
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Pendentes a receber: ${formatBRL(totalPendenteReceber)}`, 15, 80);
  doc.text(`Contas pendentes a pagar: ${formatBRL(totalPendentePagar)}`, 110, 80);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 84, 195, 84);

  // Table of Transactions list
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('HISTÓRICO COMPLETO DE TRANSAÇÕES NO PERÍODO', 15, 92);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 96, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Data', 18, 101);
  doc.text('Descrição / Categoria', 45, 101);
  doc.text('Tipo', 125, 101);
  doc.text('Status', 145, 101);
  doc.text('Valor', 172, 101);

  let currentY = 109;

  transactions.forEach((t) => {
    if (currentY > 275) {
      doc.addPage();
      // repeat header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 15, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Data', 18, 20);
      doc.text('Descrição / Categoria', 45, 20);
      doc.text('Tipo', 125, 20);
      doc.text('Status', 145, 20);
      doc.text('Valor', 172, 20);
      currentY = 28;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    
    doc.text(formatDate(t.date), 18, currentY);
    
    // Description line
    const desc = `${t.description} (${t.category})`;
    const truncatedDesc = desc.length > 42 ? desc.substring(0, 39) + '...' : desc;
    doc.text(truncatedDesc, 45, currentY);
    
    // Type label
    if (t.type === 'receita') {
      doc.setTextColor(22, 163, 74);
      doc.text('Entrada (+)', 125, currentY);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('Saída (-)', 125, currentY);
    }

    // Status label
    doc.setTextColor(71, 85, 105);
    doc.text(t.status.toUpperCase(), 145, currentY);

    // Value
    if (t.type === 'receita') {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(formatBRL(t.value), 172, currentY);

    currentY += 8;
  });

  doc.save(`Relatorio_Financeiro_${periodText.replace(/\s+/g, '_')}_ClimaGest.pdf`);
};
