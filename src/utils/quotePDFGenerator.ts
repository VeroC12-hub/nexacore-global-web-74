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

/** Draw a filled navy section-header banner, return y after it. */
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

/** Render a teal micro-label then a value in dark-gray. Returns next y. */
function drawMetaRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  align: 'left' | 'right' = 'right',
): number {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text(label.toUpperCase(), x, y, { align });
  y += 4;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text(value, x, y, { align });
  return y + 5.5;
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

  // ── First safe baseline ──────────────────────────
  // CONTENT_TOP = 46mm is the top edge of the safe zone.
  // jsPDF y = baseline. 18pt cap-height ≈ 4.6mm → baseline at 52 puts
  // cap tops at ~47.4mm, safely below the letterhead header graphic.
  let y = LETTERHEAD.CONTENT_TOP + 6; // 52mm

  const shortId = quote.id.slice(-8).toUpperCase();
  const issueDate = format(new Date(quote.created_at), 'dd MMM yyyy');
  const validDate = quote.expires_at
    ? format(new Date(quote.expires_at), 'dd MMM yyyy')
    : null;

  // ── Left: "QUOTATION" title ──────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('QUOTATION', leftM, y);

  // ── Right: stacked meta, all flowing downward from same start y ──
  let metaY = y;
  metaY = drawMetaRow(doc, 'Quote Ref', `#${shortId}`, rightEdge, metaY, 'right');
  metaY = drawMetaRow(doc, 'Date Issued', issueDate, rightEdge, metaY, 'right');
  if (validDate) {
    metaY = drawMetaRow(doc, 'Valid Until', validDate, rightEdge, metaY, 'right');
  }

  // ── Teal rule — drawn AFTER all header content ───
  // Sits 5mm below whichever side is taller.
  y = Math.max(y + 8, metaY + 2);
  doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.setLineWidth(0.8);
  doc.line(leftM, y, rightEdge, y);
  y += 9;

  // ── Two-Column: Prepared For / From ─────────────
  const colRight = leftM + contentWidth * 0.55;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.text('PREPARED FOR', leftM, y);
  doc.text('FROM', colRight, y);
  y += 5;

  // Left — client
  let leftY = y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(request?.full_name || 'Client', leftM, leftY);
  leftY += 5.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  if (request?.company) { doc.text(request.company, leftM, leftY); leftY += 4.5; }
  if (request?.email)   { doc.text(request.email,   leftM, leftY); leftY += 4.5; }
  if (request?.phone)   { doc.text(request.phone,   leftM, leftY); leftY += 4.5; }
  if (request?.country) { doc.text(request.country, leftM, leftY); leftY += 4.5; }

  // Right — NexaCore
  let rightY = y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('NexaCore Innovations', colRight, rightY);
  rightY += 5.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text('Accra, Ghana',                 colRight, rightY); rightY += 4.5;
  doc.text('nexacoreinnovations.com',      colRight, rightY); rightY += 4.5;
  doc.text('info@nexacoreinnovations.com', colRight, rightY); rightY += 4.5;

  y = Math.max(leftY, rightY) + 5;

  // Thin separator
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.3);
  doc.line(leftM, y - 2, rightEdge, y - 2);

  // ── Quote Summary Table ──────────────────────────
  const detailRows: string[][] = [
    ['Service Type',      quote.service_type || request?.service_type || 'N/A'],
    ['Total Investment',  `${quote.currency} ${quote.price.toLocaleString()}`],
    ['Project Timeline',  quote.timeline || 'To be determined'],
    ['Date Issued',       issueDate],
  ];
  if (validDate)      detailRows.push(['Valid Until',   validDate]);
  if (request?.tier)  detailRows.push(['Service Tier',  request.tier]);

  autoTable(doc, {
    startY: y,
    body: detailRows,
    theme: 'plain',
    margin: { left: leftM, right: LETTERHEAD.MARGIN_RIGHT },
    tableWidth: contentWidth,
    styles: { fontSize: 9, cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 } },
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

  if (quote.scope) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Project Scope', leftM, contentWidth, y);
    y = renderContentToPDF(doc, parseContent(quote.scope), y, letterheadImg);
    y += 6;
  }

  if (quote.deliverables && quote.deliverables.length > 0) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Deliverables', leftM, contentWidth, y);
    const bulletText = quote.deliverables.filter(d => d.trim()).map(d => `- ${d}`).join('\n');
    y = renderContentToPDF(doc, parseContent(bulletText), y, letterheadImg);
    y += 6;
  }

  if (quote.terms) {
    if (y + 20 > maxY) y = newLetterheadPage(doc, letterheadImg);
    y = drawSectionBanner(doc, 'Terms & Conditions', leftM, contentWidth, y);
    y = renderContentToPDF(doc, parseContent(quote.terms), y, letterheadImg);
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
  y += 12;

  const sigW = contentWidth * 0.38;

  doc.setDrawColor(170, 175, 185);
  doc.setLineWidth(0.4);
  doc.line(leftM, y, leftM + sigW, y);
  doc.setFontSize(8);
  doc.setTextColor(130, 135, 145);
  doc.text('Client Signature', leftM, y + 4.5);
  doc.text('Date: ______________________', leftM, y + 9);

  const sigRightX = rightEdge - sigW;
  doc.line(sigRightX, y, rightEdge, y);
  doc.text('Authorised Signatory — NexaCore', sigRightX, y + 4.5);
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
