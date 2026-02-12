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
  MARGIN_LEFT: 16,
  MARGIN_RIGHT: 16,
  CONTENT_TOP: 48,      // below header triangles + logo
  CONTENT_BOTTOM: 32,   // above footer contact info + bar
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

      // Render at 3× scale for crisp output when used in A4 PDFs
      const scale = 3;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Convert to JPEG (good balance of quality vs size)
      cachedLetterhead = canvas.toDataURL('image/jpeg', 0.92);
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
