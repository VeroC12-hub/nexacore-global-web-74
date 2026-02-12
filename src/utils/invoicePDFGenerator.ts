// =====================================================
// Invoice PDF Generator
// Generates professional invoices with NexaCore letterhead
// =====================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
  LETTERHEAD,
  getLetterheadImage,
  addLetterheadToPage,
  newLetterheadPage,
  maxContentY,
} from './pdfLetterhead';
import { TEAL, NAVY, TEXT_GRAY, parseContent, renderContentToPDF } from './pdfContentRenderer';

// ── Types ───────────────────────────────────────────

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  project_title?: string;
  service_type?: string;
  client_name?: string;
  client_company?: string;
  client_email?: string;
}

// ── Generator ───────────────────────────────────────

export async function generateInvoicePDF(
  invoice: InvoiceData,
  lineItems: InvoiceLineItem[],
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT;
  const leftM = LETTERHEAD.MARGIN_LEFT;
  const rightEdge = pageWidth - LETTERHEAD.MARGIN_RIGHT;
  const maxY = maxContentY(doc);

  // Load letterhead
  const letterheadImg = await getLetterheadImage();
  addLetterheadToPage(doc, letterheadImg);

  let y = LETTERHEAD.CONTENT_TOP;

  // ── Title Section ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('INVOICE', leftM, y);

  // Status badge on right
  const statusText = invoice.status.toUpperCase();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusW = doc.getTextWidth(statusText) + 10;
  const isPaid = invoice.status.toLowerCase() === 'paid';
  const statusColor: [number, number, number] = isPaid ? [34, 139, 34] : invoice.status.toLowerCase() === 'overdue' ? [220, 53, 69] : TEAL;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(rightEdge - statusW - 2, y - 7, statusW + 4, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, rightEdge - statusW / 2, y - 0.5, { align: 'center' });
  y += 4;

  // Invoice number bar
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(leftM, y, contentWidth, 9, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.invoice_number, leftM + contentWidth / 2, y + 6.5, { align: 'center' });
  y += 15;

  // ── Bill To / From Section ──
  const colWidth = contentWidth / 2 - 3;

  // Bill To
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('BILL TO', leftM, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('FROM', leftM + colWidth + 6, y);
  y += 5;

  // Client info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(invoice.client_name || 'Client', leftM, y);
  y += 4.5;

  if (invoice.client_company) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(invoice.client_company, leftM, y);
    y += 4;
  }

  if (invoice.client_email) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(invoice.client_email, leftM, y);
  }

  // NexaCore info (right column)
  let yRight = y - (invoice.client_company ? 8.5 : 4.5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('NexaCore Innovations', leftM + colWidth + 6, yRight);
  yRight += 4.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  const nexaInfo = ['Accra, Greater Accra, Ghana', '+233 209 628 907', 'nexacoreinnovations@gmail.com'];
  for (const line of nexaInfo) {
    doc.text(line, leftM + colWidth + 6, yRight);
    yRight += 4;
  }

  y = Math.max(y, yRight) + 8;

  // ── Invoice Details Table ──
  const detailRows: string[][] = [
    ['Invoice Date', format(new Date(invoice.created_at), 'MMMM dd, yyyy')],
    ['Due Date', format(new Date(invoice.due_date), 'MMMM dd, yyyy')],
  ];
  if (invoice.paid_date) {
    detailRows.push(['Paid Date', format(new Date(invoice.paid_date), 'MMMM dd, yyyy')]);
  }
  if (invoice.payment_method) {
    detailRows.push(['Payment Method', invoice.payment_method]);
  }
  if (invoice.project_title) {
    detailRows.push(['Project', invoice.project_title]);
  }
  if (invoice.service_type) {
    detailRows.push(['Service Type', invoice.service_type]);
  }

  autoTable(doc, {
    startY: y,
    body: detailRows,
    theme: 'plain',
    margin: { left: leftM, right: LETTERHEAD.MARGIN_RIGHT },
    tableWidth: contentWidth * 0.55,
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 35 },
      1: { textColor: [55, 65, 81] },
    },
    willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Invoice Title ──
  if (invoice.title) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    const titleLines = doc.splitTextToSize(invoice.title, contentWidth);
    doc.text(titleLines, leftM, y);
    y += titleLines.length * 5 + 3;
  }

  // ── Line Items Table ──
  const itemHead = [['#', 'Description', 'Qty', 'Unit Price', 'Total']];
  const itemBody = lineItems.map((item, idx) => [
    String(idx + 1),
    item.description,
    String(item.quantity),
    `${invoice.currency} ${item.unit_price.toFixed(2)}`,
    `${invoice.currency} ${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: itemHead,
    body: itemBody,
    theme: 'grid',
    margin: {
      top: LETTERHEAD.CONTENT_TOP,
      right: LETTERHEAD.MARGIN_RIGHT,
      bottom: LETTERHEAD.CONTENT_BOTTOM,
      left: leftM,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [55, 65, 81],
      lineColor: [210, 215, 220],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
    },
    styles: {
      overflow: 'linebreak',
      lineColor: [210, 215, 220],
      lineWidth: 0.3,
    },
    willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); },
  });

  y = (doc as any).lastAutoTable.finalY + 3;

  // ── Totals Section ──
  const totalsX = rightEdge - 75;
  const totalsW = 75;
  const valueX = rightEdge;

  // Check space
  if (y + 30 > maxY) {
    y = newLetterheadPage(doc, letterheadImg);
  }

  // Subtotal
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text('Subtotal', totalsX, y + 4);
  doc.text(`${invoice.currency} ${invoice.amount.toFixed(2)}`, valueX, y + 4, { align: 'right' });
  y += 7;

  // Tax
  doc.text('Tax', totalsX, y + 4);
  doc.text(`${invoice.currency} ${invoice.tax_amount.toFixed(2)}`, valueX, y + 4, { align: 'right' });
  y += 7;

  // Divider
  doc.setDrawColor(210, 215, 220);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, valueX, y);
  y += 2;

  // Total (teal background)
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.roundedRect(totalsX - 3, y, totalsW + 3, 10, 1.5, 1.5, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', totalsX, y + 7);
  doc.text(`${invoice.currency} ${invoice.total_amount.toFixed(2)}`, valueX, y + 7, { align: 'right' });
  y += 18;

  // ── Notes / Description ──
  if (invoice.description) {
    if (y + 20 > maxY) {
      y = newLetterheadPage(doc, letterheadImg);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text('Notes', leftM, y);
    y += 5;

    const blocks = parseContent(invoice.description);
    y = renderContentToPDF(doc, blocks, y, letterheadImg);
  }

  // ── Thank You Footer ──
  if (y + 15 > maxY) {
    y = newLetterheadPage(doc, letterheadImg);
  }
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('Thank you for your business!', leftM + contentWidth / 2, y, { align: 'center' });

  // Save
  const filename = `NexaCore_Invoice_${invoice.invoice_number}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}
