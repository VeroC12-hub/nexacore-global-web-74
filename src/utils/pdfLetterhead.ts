// =====================================================
// Shared PDF Letterhead Utility
// Loads NexaCore letterhead PDF, renders to image,
// and provides helpers for all jsPDF generators.
// =====================================================

import jsPDF from 'jspdf';

let cachedLetterhead: string | null = null;
let loadPromise: Promise<string | null> | null = null;

/** Safe content area inside the letterhead (mm) */
export const LETTERHEAD = {
  MARGIN_LEFT: 16,
  MARGIN_RIGHT: 16,
  CONTENT_TOP: 52,
  CONTENT_BOTTOM: 38,
} as const;

/** Dynamically inject a script tag and wait for it to load */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Load the NexaCore letterhead PDF → render to JPEG base64 → cache.
 * Returns null on failure (graceful degradation).
 */
export async function getLetterheadImage(): Promise<string | null> {
  if (cachedLetterhead) return cachedLetterhead;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      await loadScript('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js');

      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) return null;

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument('/Nexaletterhead.pdf').promise;
      const page = await pdf.getPage(1);
      const scale = 3;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      cachedLetterhead = canvas.toDataURL('image/jpeg', 0.92);
      return cachedLetterhead;
    } catch (e) {
      console.warn('Could not load letterhead:', e);
      return null;
    }
  })();

  return loadPromise;
}

/** Add the letterhead image as a full-page background */
export function addLetterheadToPage(doc: jsPDF, letterheadImg: string | null): void {
  if (!letterheadImg) return;
  const pw = doc.internal.pageSize.width;
  const ph = doc.internal.pageSize.height;
  doc.addImage(letterheadImg, 'JPEG', 0, 0, pw, ph);
}

/** Start a new page with letterhead background, returns CONTENT_TOP y position */
export function newLetterheadPage(doc: jsPDF, letterheadImg: string | null): number {
  doc.addPage();
  addLetterheadToPage(doc, letterheadImg);
  return LETTERHEAD.CONTENT_TOP;
}

/** Check if content fits; if not, add a new page with letterhead */
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

/** Max Y position for content (above footer) */
export function maxContentY(doc: jsPDF): number {
  return doc.internal.pageSize.height - LETTERHEAD.CONTENT_BOTTOM;
}

/** Usable content width between left/right margins */
export function letterheadContentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.width - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT;
}

/**
 * Returns didDrawPage callback for autoTable that applies letterhead background.
 * Use in autoTable options: didDrawPage: letterheadDidDrawPage(doc, letterheadImg)
 */
export function letterheadDidDrawPage(doc: jsPDF, letterheadImg: string | null) {
  return () => {
    addLetterheadToPage(doc, letterheadImg);
  };
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
