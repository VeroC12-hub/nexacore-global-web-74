// =====================================================
// Shared PDF Letterhead Utility
// Draws NexaCore letterhead programmatically using jsPDF
// No external dependencies (no pdf.js, no CDN).
// =====================================================

import jsPDF from 'jspdf';

// ── Brand colours (from actual letterhead) ──────────
const TEAL: [number, number, number] = [0, 152, 166];     // left header triangle
const OLIVE: [number, number, number] = [190, 198, 0];    // right header triangle
const FOOTER_BAR: [number, number, number] = [0, 152, 166];
const WATERMARK_GREY: [number, number, number] = [210, 215, 210]; // very faint watermark
const FOOTER_TEXT: [number, number, number] = [80, 80, 80];

// ── Layout constants (A4 portrait = 210 × 297 mm) ──
export const LETTERHEAD = {
  MARGIN_LEFT: 16,
  MARGIN_RIGHT: 16,
  CONTENT_TOP: 48,      // below header area + logo
  CONTENT_BOTTOM: 32,   // above footer contact info
} as const;

// ── Cached logo image ───────────────────────────────
let cachedLogo: string | null = null;
let logoPromise: Promise<string | null> | null = null;

/** Load /nexacore-logo.png as a base64 data URL and cache it. */
export async function loadLogoImage(): Promise<string | null> {
  if (cachedLogo) return cachedLogo;
  if (logoPromise) return logoPromise;

  logoPromise = (async () => {
    try {
      const resp = await fetch('/nexacore-logo.png');
      if (!resp.ok) return null;
      const blob = await resp.blob();
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          cachedLogo = reader.result as string;
          resolve(cachedLogo);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  })();

  return logoPromise;
}

// ── Drawing helpers ─────────────────────────────────

/** Draw the coloured header triangles at the top of the page. */
function drawHeader(doc: jsPDF) {
  const pw = doc.internal.pageSize.width;

  // Teal triangle — top-left corner
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  (doc as any).triangle(0, 0, pw * 0.52, 0, 0, 36, 'F');

  // Olive/yellow-green triangle — top-right corner
  doc.setFillColor(OLIVE[0], OLIVE[1], OLIVE[2]);
  (doc as any).triangle(pw * 0.38, 0, pw, 0, pw, 36, 'F');
}

/** Draw the NexaCore logo image (if loaded). */
function drawLogo(doc: jsPDF, logoImg: string | null) {
  if (logoImg) {
    // Logo sits just below the header bar, left-aligned
    doc.addImage(logoImg, 'PNG', 12, 28, 42, 14);
  } else {
    // Text fallback when logo image is unavailable
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.text('NEXACORE', 14, 38);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('I N N O V A T I O N S', 14, 42);
  }
}

/** Draw faint watermark logos diagonally across the body. */
function drawWatermarks(doc: jsPDF) {
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(WATERMARK_GREY[0], WATERMARK_GREY[1], WATERMARK_GREY[2]);

  // Alternating left-right pattern matching the actual letterhead
  const positions = [
    { x: pw * 0.55, y: 78 },
    { x: pw * 0.15, y: 115 },
    { x: pw * 0.55, y: 148 },
    { x: pw * 0.15, y: 182 },
    { x: pw * 0.55, y: 215 },
    { x: pw * 0.15, y: 228 },
    { x: pw * 0.55, y: 245 },
    { x: pw * 0.15, y: 258 },
    { x: pw * 0.55, y: 268 },
  ];

  for (const pos of positions) {
    if (pos.y < ph - LETTERHEAD.CONTENT_BOTTOM - 5) {
      doc.text('NEXACORE', pos.x, pos.y);
      doc.setFontSize(6);
      doc.text('I N N O V A T I O N S', pos.x, pos.y + 5);
      doc.setFontSize(18);
    }
  }
}

/** Draw the footer with contact info and bottom coloured bar. */
function drawFooter(doc: jsPDF) {
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  const footerTop = ph - 24;

  // Thin separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, footerTop, pw - 14, footerTop);

  // Contact info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(FOOTER_TEXT[0], FOOTER_TEXT[1], FOOTER_TEXT[2]);

  // Left column
  doc.text('+233-50-1588-710 / +233-20-9628-907', 20, footerTop + 7);
  doc.text('info@nexacore-innovations.com', 20, footerTop + 12);

  // Right column
  doc.text('Accra, Ghana', pw - 20, footerTop + 7, { align: 'right' });
  doc.text('www.nexacore-innovations.com', pw - 20, footerTop + 12, { align: 'right' });

  // Bottom coloured bar (gradient effect with two rects)
  const barY = ph - 5;
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(0, barY, pw * 0.5, 5, 'F');
  doc.setFillColor(OLIVE[0], OLIVE[1], OLIVE[2]);
  doc.rect(pw * 0.5, barY, pw * 0.5, 5, 'F');
}

// ── Public API ──────────────────────────────────────

/**
 * Pre-load everything needed for letterhead rendering.
 * Call once before generating a PDF. Returns the logo data URL (or null).
 */
export async function getLetterheadImage(): Promise<string | null> {
  return loadLogoImage();
}

/**
 * Draw the full letterhead (header, logo, watermarks, footer) on the current page.
 * MUST be called BEFORE drawing any content on the page so it stays behind.
 */
export function addLetterheadToPage(doc: jsPDF, logoImg: string | null): void {
  drawHeader(doc);
  drawLogo(doc, logoImg);
  drawWatermarks(doc);
  drawFooter(doc);
}

/** Start a new page with letterhead, returns CONTENT_TOP y position. */
export function newLetterheadPage(doc: jsPDF, logoImg: string | null): number {
  doc.addPage();
  addLetterheadToPage(doc, logoImg);
  return LETTERHEAD.CONTENT_TOP;
}

/** Check if content fits; if not, add a new page with letterhead. */
export function checkLetterheadPageBreak(
  doc: jsPDF,
  y: number,
  neededSpace: number,
  logoImg: string | null
): number {
  const max = doc.internal.pageSize.height - LETTERHEAD.CONTENT_BOTTOM;
  if (y + neededSpace > max) {
    return newLetterheadPage(doc, logoImg);
  }
  return y;
}

/** Max Y position for content (above footer). */
export function maxContentY(doc: jsPDF): number {
  return doc.internal.pageSize.height - LETTERHEAD.CONTENT_BOTTOM;
}

/** Usable content width between left/right margins. */
export function letterheadContentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.width - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT;
}

/**
 * Returns a willDrawPage callback for autoTable that applies letterhead.
 * Use: willDrawPage: letterheadAutoTableHook(doc, logoImg)
 *
 * IMPORTANT: Use willDrawPage (NOT didDrawPage) so the background is
 * drawn BEFORE content, keeping it behind tables/text.
 */
export function letterheadAutoTableHook(doc: jsPDF, logoImg: string | null) {
  return () => {
    addLetterheadToPage(doc, logoImg);
  };
}

/** @deprecated Use letterheadAutoTableHook with willDrawPage instead. */
export function letterheadDidDrawPage(doc: jsPDF, logoImg: string | null) {
  return letterheadAutoTableHook(doc, logoImg);
}

/**
 * Returns autoTable margin config for letterhead-safe content area.
 */
export function letterheadTableMargins() {
  return {
    top: LETTERHEAD.CONTENT_TOP,
    right: LETTERHEAD.MARGIN_RIGHT,
    bottom: LETTERHEAD.CONTENT_BOTTOM,
    left: LETTERHEAD.MARGIN_LEFT,
  };
}
