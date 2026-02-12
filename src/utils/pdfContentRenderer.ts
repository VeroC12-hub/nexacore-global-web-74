// =====================================================
// PDF Content Renderer
// Parses structured text (markdown-like) and renders it
// professionally in jsPDF with headings, tables, lists,
// and paragraphs. Used by all export modals.
// =====================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LETTERHEAD,
  addLetterheadToPage,
  newLetterheadPage,
  maxContentY,
} from './pdfLetterhead';

// ── Brand colors ────────────────────────────────────
const TEAL: [number, number, number] = [0, 152, 166];
const NAVY: [number, number, number] = [30, 58, 95];
const OLIVE: [number, number, number] = [139, 154, 46];

// ── Parsed block types ──────────────────────────────
export interface ParsedBlock {
  type: 'heading' | 'paragraph' | 'table' | 'list';
  content: string;
  rows?: string[][];
  items?: string[];
  level?: number; // 1 = h1, 2 = h2, 3 = h3
}

// ── Content parser ──────────────────────────────────
// Detects headings, tables, bullet/numbered lists, paragraphs

function isTableLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.includes('|') && t.split('|').filter(c => c.trim()).length >= 2) return true;
  if (t.includes('\t') && t.split('\t').length >= 2) return true;
  return false;
}

function isListItem(line: string): boolean {
  return /^\s*[-*•]\s+/.test(line) || /^\s*\d+[\.\)]\s+/.test(line);
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  // Markdown-style headings
  if (/^#{1,3}\s+/.test(trimmed)) return true;
  // ALL-CAPS headings (e.g. "EXECUTIVE SUMMARY")
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length > 2 &&
    trimmed.length < 80 &&
    /[A-Z]/.test(trimmed) &&
    !/[|,\t]/.test(trimmed)
  ) return true;
  // Numbered section headings like "1. Executive Summary" or "2.3 Events System"
  if (/^\d+(\.\d+)*\.?\s+[A-Z]/.test(trimmed) && trimmed.length < 80) return true;
  return false;
}

export function parseContent(raw: string): ParsedBlock[] {
  const lines = raw.split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (line.trim() === '') { i++; continue; }

    // ── Heading detection ──
    if (isHeadingLine(line)) {
      const trimmed = line.trim();
      let level = 2;
      let text = trimmed;
      if (trimmed.startsWith('###')) { level = 3; text = trimmed.replace(/^###\s*/, ''); }
      else if (trimmed.startsWith('##')) { level = 2; text = trimmed.replace(/^##\s*/, ''); }
      else if (trimmed.startsWith('#')) { level = 1; text = trimmed.replace(/^#\s*/, ''); }
      else if (/^\d+\.\s+/.test(trimmed)) { level = 1; text = trimmed; }
      else if (/^\d+\.\d+/.test(trimmed)) { level = 2; text = trimmed; }
      else { level = 1; } // ALL-CAPS
      blocks.push({ type: 'heading', content: text, level });
      i++;
      continue;
    }

    // ── Table detection ──
    if (isTableLine(line)) {
      const tableRows: string[][] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur === '') { i++; continue; }
        // Skip markdown separator lines (---|---|---)
        if (/^[\s\-|:]+$/.test(cur) && cur.includes('-')) { i++; continue; }
        if (!isTableLine(lines[i])) break;

        let cells: string[];
        if (cur.includes('|')) {
          cells = cur.split('|').map(c => c.trim()).filter((c, idx, arr) => {
            if (idx === 0 && c === '') return false;
            if (idx === arr.length - 1 && c === '') return false;
            return true;
          });
        } else {
          cells = cur.split('\t').map(c => c.trim());
        }
        if (cells.length >= 2) tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', content: '', rows: tableRows });
      }
      continue;
    }

    // ── List detection ──
    if (isListItem(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        if (lines[i].trim() === '') { i++; break; }
        if (isListItem(lines[i])) {
          const itemText = lines[i]
            .replace(/^\s*[-*•]\s+/, '')
            .replace(/^\s*\d+[\.\)]\s+/, '')
            .trim();
          items.push(itemText);
          i++;
        } else if (/^\s{2,}/.test(lines[i]) && items.length > 0) {
          // Continuation of previous item
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else {
          break;
        }
      }
      if (items.length > 0) {
        blocks.push({ type: 'list', content: '', items });
      }
      continue;
    }

    // ── Paragraph: collect consecutive non-empty, non-special lines ──
    let para = line.trim();
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !isTableLine(lines[i]) &&
      !isListItem(lines[i]) &&
      !isHeadingLine(lines[i])
    ) {
      para += ' ' + lines[i].trim();
      i++;
    }
    blocks.push({ type: 'paragraph', content: para });
  }

  return blocks;
}

// ── jsPDF Renderer ──────────────────────────────────

interface RenderContext {
  doc: jsPDF;
  letterheadImg: string | null;
  pageWidth: number;
  leftMargin: number;
  rightMargin: number;
  contentWidth: number;
  maxY: number;
}

/** Check if we need a new page; if so, add one with letterhead and return new Y. */
function ensureSpace(ctx: RenderContext, y: number, needed: number): number {
  if (y + needed > ctx.maxY) {
    return newLetterheadPage(ctx.doc, ctx.letterheadImg);
  }
  return y;
}

function renderHeading(ctx: RenderContext, block: ParsedBlock, y: number): number {
  const { doc } = ctx;
  const level = block.level || 2;

  // Space before heading
  y = ensureSpace(ctx, y, 16);
  y += level === 1 ? 6 : 3;

  if (level === 1) {
    // Major heading: navy, bold, with teal underline
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    const textLines = doc.splitTextToSize(block.content, ctx.contentWidth);
    doc.text(textLines, ctx.leftMargin, y);
    y += textLines.length * 5;
    // Teal underline
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.6);
    doc.line(ctx.leftMargin, y, ctx.leftMargin + ctx.contentWidth, y);
    y += 4;
  } else if (level === 2) {
    // Sub-heading: teal, bold
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    const textLines = doc.splitTextToSize(block.content, ctx.contentWidth);
    doc.text(textLines, ctx.leftMargin, y);
    y += textLines.length * 4.5 + 2;
  } else {
    // Minor heading: dark gray, bold
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    const textLines = doc.splitTextToSize(block.content, ctx.contentWidth);
    doc.text(textLines, ctx.leftMargin, y);
    y += textLines.length * 4 + 2;
  }

  return y;
}

function renderParagraph(ctx: RenderContext, block: ParsedBlock, y: number): number {
  const { doc } = ctx;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);

  const textLines: string[] = doc.splitTextToSize(block.content, ctx.contentWidth);
  const lineHeight = 4;

  for (let li = 0; li < textLines.length; li++) {
    y = ensureSpace(ctx, y, lineHeight + 1);
    doc.text(textLines[li], ctx.leftMargin, y);
    y += lineHeight;
  }
  y += 3; // paragraph spacing
  return y;
}

function renderTable(ctx: RenderContext, block: ParsedBlock, y: number): number {
  if (!block.rows || block.rows.length === 0) return y;

  y = ensureSpace(ctx, y, 20);
  y += 2;

  const hasHeader = block.rows.length > 1;
  const headRow = hasHeader ? [block.rows[0]] : undefined;
  const bodyRows = hasHeader ? block.rows.slice(1) : block.rows;

  // Calculate column widths based on number of columns
  const numCols = block.rows[0].length;
  const availWidth = ctx.contentWidth;

  autoTable(ctx.doc, {
    startY: y,
    head: headRow,
    body: bodyRows,
    theme: 'grid',
    margin: {
      top: LETTERHEAD.CONTENT_TOP,
      right: ctx.rightMargin,
      bottom: LETTERHEAD.CONTENT_BOTTOM,
      left: ctx.leftMargin,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [55, 65, 81],
      lineColor: [220, 225, 230],
      lineWidth: 0.25,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableWidth: numCols <= 3 ? availWidth * 0.7 : availWidth,
    styles: { overflow: 'linebreak' },
    willDrawPage: () => { addLetterheadToPage(ctx.doc, ctx.letterheadImg); },
  });

  y = (ctx.doc as any).lastAutoTable.finalY + 5;
  return y;
}

function renderList(ctx: RenderContext, block: ParsedBlock, y: number): number {
  if (!block.items || block.items.length === 0) return y;

  const { doc } = ctx;
  const bulletX = ctx.leftMargin + 3;
  const textX = ctx.leftMargin + 8;
  const textWidth = ctx.contentWidth - 8;
  const lineHeight = 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);

  for (let idx = 0; idx < block.items.length; idx++) {
    const item = block.items[idx];
    const textLines: string[] = doc.splitTextToSize(item, textWidth);
    const itemHeight = textLines.length * lineHeight + 1;

    y = ensureSpace(ctx, y, itemHeight);

    // Draw bullet (teal dot)
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.circle(bulletX, y - 1, 0.8, 'F');

    for (let li = 0; li < textLines.length; li++) {
      doc.text(textLines[li], textX, y);
      y += lineHeight;
    }
    y += 0.5;
  }
  y += 2;
  return y;
}

/**
 * Render structured content blocks into a jsPDF document.
 * Call this after drawing any header/metadata so content starts at the given Y position.
 * Returns the final Y position after all content.
 */
export function renderContentToPDF(
  doc: jsPDF,
  blocks: ParsedBlock[],
  startY: number,
  letterheadImg: string | null
): number {
  const pageWidth = doc.internal.pageSize.width;
  const ctx: RenderContext = {
    doc,
    letterheadImg,
    pageWidth,
    leftMargin: LETTERHEAD.MARGIN_LEFT,
    rightMargin: LETTERHEAD.MARGIN_RIGHT,
    contentWidth: pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT,
    maxY: maxContentY(doc),
  };

  let y = startY;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        y = renderHeading(ctx, block, y);
        break;
      case 'paragraph':
        y = renderParagraph(ctx, block, y);
        break;
      case 'table':
        y = renderTable(ctx, block, y);
        break;
      case 'list':
        y = renderList(ctx, block, y);
        break;
    }
  }

  return y;
}
