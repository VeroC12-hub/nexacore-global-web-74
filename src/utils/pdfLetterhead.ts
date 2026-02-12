// =====================================================
// Shared PDF Letterhead Utility
// Renders the actual NexaCore letterhead PDF as a
// high-quality background image for all PDF exports.
// Uses pdfjs-dist (npm) — no CDN dependency.
// =====================================================

import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker — use CDN worker matching our installed version
// (Vite can't bundle the worker inline easily, but the npm lib handles loading)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ── Layout constants (A4 portrait = 210 × 297 mm) ──
/** Safe content area inside the letterhead margins */
export const LETTERHEAD = {
  MARGIN_LEFT: 18,
  MARGIN_RIGHT: 18,
  CONTENT_TOP: 46,      // below header triangles + logo
  CONTENT_BOTTOM: 30,   // above footer contact info + bar
} as const;

// ── Cached letterhead image ─────────────────────────
let cachedLetterhead: string | null = null;
let loadPromise: Promise<string | null> | null = null;

/**
 * Load /Nexaletterhead.pdf → render page 1 to high-res canvas → JPEG data URL.
 * Cached after first successful load. Returns null on failure (graceful degradation).
 */
export async function getLetterheadImage(): Promise<string | null> {
  if (cachedLetterhead) return cachedLetterhead;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // Load the letterhead PDF from public folder
      const loadingTask = pdfjsLib.getDocument('/Nexaletterhead.pdf');
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      // Target A4 dimensions at high resolution (300dpi equivalent for print)
      // A4 is 210mm x 297mm. Ratio ~0.707.
      // We'll use a high pixel count for crisp quality.
      const A4_WIDTH_PX = 2480;
      const A4_HEIGHT_PX = 3508;

      // 1. Render PDF page to its natural size first
      const naturalViewport = page.getViewport({ scale: 1.0 });
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = naturalViewport.width;
      tempCanvas.height = naturalViewport.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      await page.render({ canvasContext: tempCtx, viewport: naturalViewport }).promise;

      // 2. Create the final A4-aspect-ratio canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = A4_WIDTH_PX;
      finalCanvas.height = A4_HEIGHT_PX;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return null;

      // 3. Calculate "cover" scaling
      // We want the image to fill the A4 canvas completely, cropping excess if needed.
      const scaleX = A4_WIDTH_PX / naturalViewport.width;
      const scaleY = A4_HEIGHT_PX / naturalViewport.height;
      const scale = Math.max(scaleX, scaleY); // "cover" uses the larger scale

      const scaledWidth = naturalViewport.width * scale;
      const scaledHeight = naturalViewport.height * scale;

      // 4. Center align (crop equally from sides or top/bottom)
      const x = (A4_WIDTH_PX - scaledWidth) / 2;
      const y = (A4_HEIGHT_PX - scaledHeight) / 2;

      // Draw temp canvas onto final canvas with calculated transform
      ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);

      // Convert to JPEG (good balance of quality vs size)
      cachedLetterhead = finalCanvas.toDataURL('image/jpeg', 0.90);
      return cachedLetterhead;
    } catch (e) {
      console.warn('Could not load letterhead PDF, falling back to plain pages:', e);
      return null;
    }
  })();

  return loadPromise;
}

// ── Public API ──────────────────────────────────────

/**
 * Add the letterhead image as a full-page background on the CURRENT page.
 * Call BEFORE drawing any content so the background stays behind text/tables.
 */
export function addLetterheadToPage(doc: jsPDF, letterheadImg: string | null): void {
  if (!letterheadImg) return;
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  doc.addImage(letterheadImg, 'JPEG', 0, 0, pw, ph);
}

/** Start a new page with letterhead background, returns CONTENT_TOP y position. */
export function newLetterheadPage(doc: jsPDF, letterheadImg: string | null): number {
  doc.addPage();
  addLetterheadToPage(doc, letterheadImg);
  return LETTERHEAD.CONTENT_TOP;
}

/** Check if content fits; if not, add a new page with letterhead. */
export function checkLetterheadPageBreak(
  doc: jsPDF,
  y: number,
  neededSpace: number,
  letterheadImg: string | null
): number {
  const max = doc.internal.pageSize.height - LETTERHEAD.CONTENT_BOTTOM;
  if (y + neededSpace > max) {
    return newLetterheadPage(doc, letterheadImg);
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
 *
 * IMPORTANT: Use with `willDrawPage` (NOT `didDrawPage`) so the background
 * is drawn BEFORE table content, keeping it behind text/tables.
 *
 * Example:
 *   autoTable(doc, {
 *     ...options,
 *     willDrawPage: letterheadAutoTableHook(doc, letterheadImg),
 *   });
 */
export function letterheadAutoTableHook(doc: jsPDF, letterheadImg: string | null) {
  return () => {
    addLetterheadToPage(doc, letterheadImg);
  };
}

/** @deprecated Use letterheadAutoTableHook with willDrawPage instead. */
export const letterheadDidDrawPage = letterheadAutoTableHook;

/** Returns autoTable margin config for letterhead-safe content area. */
export function letterheadTableMargins() {
  return {
    top: LETTERHEAD.CONTENT_TOP,
    right: LETTERHEAD.MARGIN_RIGHT,
    bottom: LETTERHEAD.CONTENT_BOTTOM,
    left: LETTERHEAD.MARGIN_LEFT,
  };
}
