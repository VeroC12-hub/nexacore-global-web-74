// =====================================================
// Quote PDF Generator
// Generates professional quotations with NexaCore letterhead
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

interface QuoteData {
  id: string;
  price: number;
  currency: string;
  scope: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  service_type?: string;
}

interface QuoteRequestData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  service_type: string;
  description: string;
  tier?: string;
  budget_estimate?: number;
}

// ── Generator ───────────────────────────────────────

export async function generateQuotePDF(
  quote: QuoteData,
  request?: QuoteRequestData | null,
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT;
  const leftM = LETTERHEAD.MARGIN_LEFT;
  const rightEdge = pageWidth - LETTERHEAD.MARGIN_RIGHT;
  const maxY = maxContentY(doc);

  const letterheadImg = await getLetterheadImage();
  addLetterheadToPage(doc, letterheadImg);

  let y = LETTERHEAD.CONTENT_TOP;

  // ── Title ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('QUOTATION', leftM, y);
  y += 4;

  // Teal accent bar
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(leftM, y, contentWidth, 1.2, 'F');
  y += 8;

  // ── Prepared For Box ──
  const boxH = request?.company ? 42 : 36;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(leftM, y, contentWidth, boxH, 2, 2, 'F');
  doc.setDrawColor(210, 215, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftM, y, contentWidth, boxH, 2, 2, 'S');

  const boxLeft = leftM + 5;
  let by = y + 7;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('PREPARED FOR', boxLeft, by);
  by += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(request?.full_name || 'Client', boxLeft, by);
  by += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);

  if (request?.company) {
    doc.text(request.company, boxLeft, by);
    by += 4;
  }
  doc.text(request?.email || '', boxLeft, by);

  // Right side of box: phone, country
  const boxRight = leftM + contentWidth / 2 + 5;
  let bry = y + 13;
  if (request?.phone) {
    doc.text(`Phone: ${request.phone}`, boxRight, bry);
    bry += 4;
  }
  if (request?.country) {
    doc.text(`Country: ${request.country}`, boxRight, bry);
  }

  y += boxH + 8;

  // ── Quote Details Table ──
  const detailRows: string[][] = [
    ['Service Type', quote.service_type || request?.service_type || 'N/A'],
    ['Investment', `${quote.currency} ${quote.price.toLocaleString()}`],
    ['Timeline', quote.timeline || 'To be determined'],
    ['Date Issued', format(new Date(quote.created_at), 'MMMM dd, yyyy')],
  ];
  if (quote.expires_at) {
    detailRows.push(['Valid Until', format(new Date(quote.expires_at), 'MMMM dd, yyyy')]);
  }
  if (request?.tier) {
    detailRows.push(['Service Tier', request.tier]);
  }

  autoTable(doc, {
    startY: y,
    body: detailRows,
    theme: 'striped',
    margin: { left: leftM, right: LETTERHEAD.MARGIN_RIGHT },
    tableWidth: contentWidth,
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 35 },
      1: { textColor: [55, 65, 81] },
    },
    headStyles: { fillColor: TEAL },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Scope Section ──
  if (quote.scope) {
    if (y + 16 > maxY) {
      y = newLetterheadPage(doc, letterheadImg);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text('Project Scope', leftM, y);
    y += 1;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.6);
    doc.line(leftM, y + 3, leftM + contentWidth, y + 3);
    y += 7;

    const scopeBlocks = parseContent(quote.scope);
    y = renderContentToPDF(doc, scopeBlocks, y, letterheadImg);
    y += 3;
  }

  // ── Deliverables Section ──
  if (quote.deliverables && quote.deliverables.length > 0) {
    if (y + 16 > maxY) {
      y = newLetterheadPage(doc, letterheadImg);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text('Deliverables', leftM, y);
    y += 1;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.6);
    doc.line(leftM, y + 3, leftM + contentWidth, y + 3);
    y += 7;

    // Render as bullet list
    const bulletText = quote.deliverables.map(d => `- ${d}`).join('\n');
    const delBlocks = parseContent(bulletText);
    y = renderContentToPDF(doc, delBlocks, y, letterheadImg);
    y += 3;
  }

  // ── Terms Section ──
  if (quote.terms) {
    if (y + 16 > maxY) {
      y = newLetterheadPage(doc, letterheadImg);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text('Terms & Conditions', leftM, y);
    y += 1;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.6);
    doc.line(leftM, y + 3, leftM + contentWidth, y + 3);
    y += 7;

    const termsBlocks = parseContent(quote.terms);
    y = renderContentToPDF(doc, termsBlocks, y, letterheadImg);
    y += 3;
  }

  // ── Acceptance Section ──
  if (y + 50 > maxY) {
    y = newLetterheadPage(doc, letterheadImg);
  }
  y += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('Acceptance', leftM, y);
  y += 1;
  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.6);
  doc.line(leftM, y + 3, leftM + contentWidth, y + 3);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text(
    'By signing below, you accept the terms and conditions outlined in this quotation.',
    leftM,
    y,
  );
  y += 12;

  // Signature lines
  const sigLineWidth = contentWidth * 0.4;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  // Client signature
  doc.line(leftM, y, leftM + sigLineWidth, y);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Client Signature', leftM, y + 4);
  doc.text('Date: ____________________', leftM, y + 9);

  // NexaCore signature
  const sigRight = rightEdge - sigLineWidth;
  doc.line(sigRight, y, rightEdge, y);
  doc.text('NexaCore Innovations', sigRight, y + 4);
  doc.text('Date: ____________________', sigRight, y + 9);

  y += 18;

  // ── Validity Footer ──
  if (quote.expires_at) {
    if (y + 10 > maxY) {
      y = newLetterheadPage(doc, letterheadImg);
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.text(
      `This quotation is valid until ${format(new Date(quote.expires_at), 'MMMM dd, yyyy')}.`,
      leftM + contentWidth / 2,
      y,
      { align: 'center' },
    );
  }

  // Save
  const clientName = (request?.full_name || 'Client').replace(/\s+/g, '_');
  const filename = `NexaCore_Quote_${clientName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}
