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

// ── Helpers ─────────────────────────────────────────

/** Draw a filled section-header banner and return the y after it. */
function drawSectionBanner(
  doc: jsPDF,
  label: string,
  leftM: number,
  contentWidth: number,
  y: number,
): number {
  const bannerH = 7.5;
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(leftM, y, contentWidth, bannerH, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(label.toUpperCase(), leftM + 4, y + 5.1);
  return y + bannerH + 4;
}

/** Draw a small uppercase label in teal then a value line in dark gray. Returns next y. */
function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text(label.toUpperCase(), x, y);
  y += 3.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  const lines: string[] = doc.splitTextToSize(value, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 4 + 1.5;
}

// ── Core builder (shared by save + preview) ─────────

async function buildQuoteDoc(
  quote: QuoteData,
  request?: QuoteRequestData | null,
): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT;
  const leftM = LETTERHEAD.MARGIN_LEFT;
  const rightEdge = pageWidth - LETTERHEAD.MARGIN_RIGHT;
  const maxY = maxContentY(doc);

  const letterheadImg = await getLetterheadImage();
  addLetterheadToPage(doc, letterheadImg);

  let y = LETTERHEAD.CONTENT_TOP;

  // ── Document Title Row ───────────────────────────
  // Left: "QUOTATION" large navy
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('QUOTATION', leftM, y);

  // Right: quote ID + dates stacked
  const shortId = quote.id.slice(-8).toUpperCase();
  const issueDate = format(new Date(quote.created_at), 'dd MMM yyyy');
  const validDate = quote.expires_at
    ? format(new Date(quote.expires_at), 'dd MMM yyyy')
    : null;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('QUOTE REF', rightEdge, y - 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFontSize(9);
  doc.text(`#${shortId}`, rightEdge, y - 1, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('DATE ISSUED', rightEdge, y + 4, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFontSize(9);
  doc.text(issueDate, rightEdge, y + 8, { align: 'right' });

  if (validDate) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.text('VALID UNTIL', rightEdge, y + 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.setFontSize(9);
    doc.text(validDate, rightEdge, y + 17, { align: 'right' });
  }

  y += 6;

  // Full-width teal rule
  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(leftM, y, rightEdge, y);
  y += 8;

  // ── Two-Column Client / Company Info ─────────────
  const colWidth = contentWidth * 0.5 - 4;
  const colRight = leftM + contentWidth * 0.55;

  // "Prepared For" column
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('PREPARED FOR', leftM, y);

  // "From" column
  doc.text('FROM', colRight, y);

  y += 4;

  // Client details (left)
  let leftY = y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(request?.full_name || 'Client', leftM, leftY);
  leftY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);

  if (request?.company) {
    doc.text(request.company, leftM, leftY);
    leftY += 4;
  }
  doc.text(request?.email || '', leftM, leftY);
  leftY += 4;
  if (request?.phone) {
    doc.text(request.phone, leftM, leftY);
    leftY += 4;
  }
  if (request?.country) {
    doc.text(request.country, leftM, leftY);
    leftY += 4;
  }

  // NexaCore details (right)
  let rightY = y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('NexaCore Innovations', colRight, rightY);
  rightY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text('Accra, Ghana', colRight, rightY);
  rightY += 4;
  doc.text('nexacoreinnovations.com', colRight, rightY);
  rightY += 4;
  doc.text('info@nexacoreinnovations.com', colRight, rightY);
  rightY += 4;

  y = Math.max(leftY, rightY) + 8;

  // Light separator
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.3);
  doc.line(leftM, y - 4, rightEdge, y - 4);

  // ── Quote Summary Table ──────────────────────────
  const detailRows: string[][] = [
    ['Service Type', quote.service_type || request?.service_type || 'N/A'],
    ['Total Investment', `${quote.currency} ${quote.price.toLocaleString()}`],
    ['Project Timeline', quote.timeline || 'To be determined'],
    ['Date Issued', issueDate],
  ];
  if (validDate) detailRows.push(['Valid Until', validDate]);
  if (request?.tier) detailRows.push(['Service Tier', request.tier]);

  autoTable(doc, {
    startY: y,
    body: detailRows,
    theme: 'plain',
    margin: { left: leftM, right: LETTERHEAD.MARGIN_RIGHT },
    tableWidth: contentWidth,
    styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: NAVY, cellWidth: 42, fillColor: [245, 247, 250] },
      1: { textColor: [55, 65, 81] },
    },
    alternateRowStyles: { fillColor: [250, 251, 252] },
    tableLineColor: [210, 215, 220],
    tableLineWidth: 0.3,
    willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Body Sections ────────────────────────────────

  // Project Scope
  if (quote.scope) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Project Scope', leftM, contentWidth, y);
    const scopeBlocks = parseContent(quote.scope);
    y = renderContentToPDF(doc, scopeBlocks, y, letterheadImg);
    y += 6;
  }

  // Deliverables
  if (quote.deliverables && quote.deliverables.length > 0) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Deliverables', leftM, contentWidth, y);
    const bulletText = quote.deliverables.filter(d => d.trim()).map(d => `- ${d}`).join('\n');
    const delBlocks = parseContent(bulletText);
    y = renderContentToPDF(doc, delBlocks, y, letterheadImg);
    y += 6;
  }

  // Terms & Conditions
  if (quote.terms) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Terms & Conditions', leftM, contentWidth, y);
    const termsBlocks = parseContent(quote.terms);
    y = renderContentToPDF(doc, termsBlocks, y, letterheadImg);
    y += 6;
  }

  // ── Acceptance ───────────────────────────────────
  if (y + 48 > maxY) y = newLetterheadPage(doc, letterheadImg);
  y = drawSectionBanner(doc, 'Acceptance', leftM, contentWidth, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text(
    'By signing below, you confirm acceptance of all terms and conditions outlined in this quotation.',
    leftM, y,
    { maxWidth: contentWidth },
  );
  y += 10;

  const sigW = contentWidth * 0.38;

  // Client sig
  doc.setDrawColor(170, 175, 185);
  doc.setLineWidth(0.4);
  doc.line(leftM, y, leftM + sigW, y);
  doc.setFontSize(8);
  doc.setTextColor(130, 135, 145);
  doc.text('Client Signature', leftM, y + 4);
  doc.text('Date: ______________________', leftM, y + 9);

  // NexaCore sig
  const sigRightX = rightEdge - sigW;
  doc.line(sigRightX, y, rightEdge, y);
  doc.text('Authorised Signatory — NexaCore', sigRightX, y + 4);
  doc.text('Date: ______________________', sigRightX, y + 9);

  y += 18;

  // ── Validity Note ────────────────────────────────
  if (quote.expires_at && y + 8 < maxY) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.text(
      `This quotation is valid until ${format(new Date(quote.expires_at), 'MMMM dd, yyyy')}. After this date a revised quotation may be required.`,
      leftM + contentWidth / 2,
      y,
      { align: 'center', maxWidth: contentWidth },
    );
  }

  return doc;
}

// ── Public API ───────────────────────────────────────

/** Download the quote as a PDF file. */
export async function generateQuotePDF(
  quote: QuoteData,
  request?: QuoteRequestData | null,
): Promise<void> {
  const doc = await buildQuoteDoc(quote, request);
  const clientName = (request?.full_name || 'Client').replace(/\s+/g, '_');
  const filename = `NexaCore_Quote_${clientName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

/** Return the quote as a data URL string (for iframe preview). */
export async function getQuotePDFDataUrl(
  quote: QuoteData,
  request?: QuoteRequestData | null,
): Promise<string> {
  const doc = await buildQuoteDoc(quote, request);
  return doc.output('datauristring');
}
