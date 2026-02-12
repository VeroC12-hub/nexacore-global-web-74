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
export const TEAL: [number, number, number] = [0, 152, 166];
export const NAVY: [number, number, number] = [30, 58, 95];
export const OLIVE: [number, number, number] = [139, 154, 46];
export const TEXT_GRAY: [number, number, number] = [55, 65, 81];

// ── Parsed block types ──────────────────────────────
export interface ParsedBlock {
  type: 'heading' | 'paragraph' | 'table' | 'list';
  content: string;
  rows?: string[][];
  items?: string[];
  level?: number; // 1 = h1, 2 = h2, 3 = h3
  listType?: 'ordered' | 'unordered';
}

// ── Inline text segment (for bold/italic rendering) ─
interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Match **bold**, *italic*, __bold__, _italic_
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false, italic: false });
    }
    if (match[2] || match[3]) {
      // **bold** or __bold__
      segments.push({ text: match[2] || match[3], bold: true, italic: false });
    } else if (match[4] || match[5]) {
      // *italic* or _italic_
      segments.push({ text: match[4] || match[5], bold: false, italic: true });
    }
    lastIndex = match.index + match[0].length;
  }
  // Remaining plain text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false, italic: false });
  }
  if (segments.length === 0) {
    segments.push({ text, bold: false, italic: false });
  }
  return segments;
}

// ── Content parser ──────────────────────────────────

function isTableLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.includes('|') && t.split('|').filter(c => c.trim()).length >= 2) return true;
  if (t.includes('\t') && t.split('\t').length >= 2) return true;
  return false;
}

function isBulletItem(line: string): boolean {
  return /^\s*[-*•]\s+/.test(line);
}

function isNumberedItem(line: string): boolean {
  return /^\s*\d+[.\)]\s+/.test(line);
}

function isListItem(line: string): boolean {
  return isBulletItem(line) || isNumberedItem(line);
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^#{1,3}\s+/.test(trimmed)) return true;
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length > 2 &&
    trimmed.length < 80 &&
    /[A-Z]/.test(trimmed) &&
    !/[|,\t]/.test(trimmed)
  ) return true;
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
      const firstIsNumbered = isNumberedItem(line);
      while (i < lines.length) {
        if (lines[i].trim() === '') { i++; break; }
        if (isListItem(lines[i])) {
          const itemText = lines[i]
            .replace(/^\s*[-*•]\s+/, '')
            .replace(/^\s*\d+[.\)]\s+/, '')
            .trim();
          items.push(itemText);
          i++;
        } else if (/^\s{2,}/.test(lines[i]) && items.length > 0) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        } else {
          break;
        }
      }
      if (items.length > 0) {
        blocks.push({
          type: 'list',
          content: '',
          items,
          listType: firstIsNumbered ? 'ordered' : 'unordered',
        });
      }
      continue;
    }

    // ── Paragraph ──
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

function ensureSpace(ctx: RenderContext, y: number, needed: number): number {
  if (y + needed > ctx.maxY) {
    return newLetterheadPage(ctx.doc, ctx.letterheadImg);
  }
  return y;
}

/** Render inline-formatted text at (x, y). Returns the Y after rendering all wrapped lines. */
function renderInlineText(
  ctx: RenderContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = 9,
  lineHeight: number = 4,
): number {
  const { doc } = ctx;
  const segments = parseInlineFormatting(text);

  // If no formatting, render simply with word wrap
  const hasFormatting = segments.some(s => s.bold || s.italic);
  if (!hasFormatting) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    const wrapped: string[] = doc.splitTextToSize(text, maxWidth);
    for (const line of wrapped) {
      y = ensureSpace(ctx, y, lineHeight + 1);
      doc.text(line, x, y);
      y += lineHeight;
    }
    return y;
  }

  // With formatting: render segment by segment, wrapping manually
  // Flatten all segments into a single string for splitting, then re-apply formatting
  const plainText = segments.map(s => s.text).join('');
  const wrapped: string[] = doc.splitTextToSize(plainText, maxWidth);

  // Map character positions to segments
  let segCharMap: { char: string; bold: boolean; italic: boolean }[] = [];
  for (const seg of segments) {
    for (const ch of seg.text) {
      segCharMap.push({ char: ch, bold: seg.bold, italic: seg.italic });
    }
  }

  let charIdx = 0;
  for (const wrappedLine of wrapped) {
    y = ensureSpace(ctx, y, lineHeight + 1);
    let curX = x;
    let runText = '';
    let runBold = false;
    let runItalic = false;

    const flushRun = () => {
      if (!runText) return;
      const style = runBold ? 'bold' : runItalic ? 'italic' : 'normal';
      doc.setFont('helvetica', style);
      doc.setFontSize(fontSize);
      doc.text(runText, curX, y);
      curX += doc.getTextWidth(runText);
      runText = '';
    };

    for (const ch of wrappedLine) {
      if (charIdx < segCharMap.length) {
        const mapped = segCharMap[charIdx];
        if (mapped.bold !== runBold || mapped.italic !== runItalic) {
          flushRun();
          runBold = mapped.bold;
          runItalic = mapped.italic;
        }
        runText += ch;
        charIdx++;
      } else {
        runText += ch;
      }
    }
    flushRun();
    // Skip whitespace that splitTextToSize may have consumed
    while (charIdx < segCharMap.length && segCharMap[charIdx].char === ' ') {
      charIdx++;
    }
    y += lineHeight;
  }
  return y;
}

function renderHeading(ctx: RenderContext, block: ParsedBlock, y: number): number {
  const { doc } = ctx;
  const level = block.level || 2;

  y = ensureSpace(ctx, y, 16);
  y += level === 1 ? 5 : 3;

  if (level === 1) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    const textLines = doc.splitTextToSize(block.content, ctx.contentWidth);
    doc.text(textLines, ctx.leftMargin, y);
    y += textLines.length * 5;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.setLineWidth(0.6);
    doc.line(ctx.leftMargin, y, ctx.leftMargin + ctx.contentWidth, y);
    y += 4;
  } else if (level === 2) {
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    const textLines = doc.splitTextToSize(block.content, ctx.contentWidth);
    doc.text(textLines, ctx.leftMargin, y);
    y += textLines.length * 4.5 + 2;
  } else {
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
  y = renderInlineText(ctx, block.content, ctx.leftMargin, y, ctx.contentWidth, 9, 4);
  y += 3;
  return y;
}

function renderTable(ctx: RenderContext, block: ParsedBlock, y: number): number {
  if (!block.rows || block.rows.length === 0) return y;

  y = ensureSpace(ctx, y, 20);
  y += 2;

  const hasHeader = block.rows.length > 1;
  const headRow = hasHeader ? [block.rows[0]] : undefined;
  const bodyRows = hasHeader ? block.rows.slice(1) : block.rows;
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
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [55, 65, 81],
      lineColor: [210, 215, 220],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableWidth: numCols <= 3 ? availWidth * 0.75 : availWidth,
    styles: {
      overflow: 'linebreak',
      lineColor: [210, 215, 220],
      lineWidth: 0.3,
    },
    willDrawPage: () => { addLetterheadToPage(ctx.doc, ctx.letterheadImg); },
  });

  y = (ctx.doc as any).lastAutoTable.finalY + 5;
  return y;
}

function renderList(ctx: RenderContext, block: ParsedBlock, y: number): number {
  if (!block.items || block.items.length === 0) return y;

  const { doc } = ctx;
  const isOrdered = block.listType === 'ordered';
  const markerX = ctx.leftMargin + 3;
  const textX = ctx.leftMargin + 10;
  const textWidth = ctx.contentWidth - 10;
  const lineHeight = 4;

  doc.setFontSize(9);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);

  for (let idx = 0; idx < block.items.length; idx++) {
    const item = block.items[idx];
    const plainText = item.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
    const textLines: string[] = doc.splitTextToSize(plainText, textWidth);
    const itemHeight = textLines.length * lineHeight + 1;

    y = ensureSpace(ctx, y, itemHeight);

    if (isOrdered) {
      // Numbered marker
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      doc.text(`${idx + 1}.`, markerX, y);
    } else {
      // Bullet marker (teal dot)
      doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
      doc.circle(markerX + 1, y - 1, 0.8, 'F');
    }

    // Render item text with inline formatting
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    y = renderInlineText(ctx, item, textX, y, textWidth, 9, lineHeight);
    y += 0.5;
  }
  y += 2;
  return y;
}

/**
 * Render structured content blocks into a jsPDF document.
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
