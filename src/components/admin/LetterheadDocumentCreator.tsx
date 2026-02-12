import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Printer, Eye, ClipboardPaste, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getLetterheadImage } from '@/utils/pdfLetterhead';

interface ParsedBlock {
  type: 'heading' | 'paragraph' | 'table' | 'list';
  content: string;
  rows?: string[][];
  items?: string[];
  level?: number;
}

/**
 * Parses raw pasted text into structured blocks.
 * Detects: headings, tables (tab/pipe/comma separated), bullet/numbered lists, paragraphs.
 */
function parseContent(raw: string): ParsedBlock[] {
  const lines = raw.split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Skip empty lines
    if (line.trim() === '') { i++; continue; }

    // Detect heading: all-caps line, line with # prefix, or short bold-looking line
    if (
      /^#{1,3}\s+/.test(line) ||
      (line === line.toUpperCase() && line.length > 2 && line.length < 80 && /[A-Z]/.test(line) && !/[|,\t]/.test(line))
    ) {
      const level = line.startsWith('###') ? 3 : line.startsWith('##') ? 2 : line.startsWith('#') ? 1 : 1;
      const text = line.replace(/^#{1,3}\s*/, '').trim();
      blocks.push({ type: 'heading', content: text, level });
      i++;
      continue;
    }

    // Detect table: lines containing tabs or pipes (at least 2 columns)
    const isTableLine = (l: string) => {
      const trimmed = l.trim();
      if (!trimmed) return false;
      // Pipe-delimited
      if (trimmed.includes('|') && trimmed.split('|').filter(c => c.trim()).length >= 2) return true;
      // Tab-delimited
      if (trimmed.includes('\t') && trimmed.split('\t').length >= 2) return true;
      return false;
    };

    if (isTableLine(line)) {
      const tableRows: string[][] = [];
      while (i < lines.length && (isTableLine(lines[i]) || lines[i].trim() === '' || /^[\s\-|:]+$/.test(lines[i].trim()))) {
        const currentLine = lines[i].trim();
        // Skip markdown table separator lines (---|---|---)
        if (/^[\s\-|:]+$/.test(currentLine) && currentLine.includes('-')) { i++; continue; }
        if (currentLine === '') { i++; continue; }

        let cells: string[];
        if (currentLine.includes('|')) {
          cells = currentLine.split('|').map(c => c.trim()).filter((c, idx, arr) => {
            // Filter out empty first/last from |col1|col2|
            if (idx === 0 && c === '') return false;
            if (idx === arr.length - 1 && c === '') return false;
            return true;
          });
        } else {
          cells = currentLine.split('\t').map(c => c.trim());
        }
        if (cells.length >= 2) tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) {
        blocks.push({ type: 'table', content: '', rows: tableRows });
      }
      continue;
    }

    // Detect list: lines starting with -, *, •, or numbered (1. 2. etc)
    const isListItem = (l: string) => /^\s*[-*•]\s+/.test(l) || /^\s*\d+[\.\)]\s+/.test(l);

    if (isListItem(line)) {
      const items: string[] = [];
      while (i < lines.length && (isListItem(lines[i]) || (lines[i].trim() !== '' && /^\s{2,}/.test(lines[i]) && items.length > 0))) {
        const itemText = lines[i].replace(/^\s*[-*•]\s+/, '').replace(/^\s*\d+[\.\)]\s+/, '').trim();
        if (isListItem(lines[i])) {
          items.push(itemText);
        } else {
          // Continuation of previous item
          items[items.length - 1] += ' ' + lines[i].trim();
        }
        i++;
      }
      blocks.push({ type: 'list', content: '', items });
      continue;
    }

    // Otherwise it's a paragraph - collect consecutive non-empty lines
    let para = line;
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !isTableLine(lines[i]) && !isListItem(lines[i]) && !/^#{1,3}\s+/.test(lines[i]) && !(lines[i] === lines[i].toUpperCase() && lines[i].length > 2 && lines[i].length < 80 && /[A-Z]/.test(lines[i]))) {
      para += ' ' + lines[i].trim();
      i++;
    }
    blocks.push({ type: 'paragraph', content: para.trim() });
  }

  return blocks;
}

function renderBlocksToHTML(blocks: ParsedBlock[], docTitle: string, docDate: string, letterheadDataUrl: string | null): string {
  let body = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        const tag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4';
        body += `<${tag} class="doc-heading">${block.content}</${tag}>\n`;
        break;

      case 'paragraph':
        body += `<p class="doc-para">${block.content}</p>\n`;
        break;

      case 'table':
        body += '<table class="doc-table">\n';
        if (block.rows && block.rows.length > 0) {
          body += '  <thead><tr>';
          block.rows[0].forEach(cell => { body += `<th>${cell}</th>`; });
          body += '</tr></thead>\n  <tbody>\n';
          for (let r = 1; r < block.rows.length; r++) {
            body += '    <tr>';
            block.rows[r].forEach(cell => { body += `<td>${cell}</td>`; });
            body += '</tr>\n';
          }
          body += '  </tbody>\n';
        }
        body += '</table>\n';
        break;

      case 'list':
        body += '<ul class="doc-list">\n';
        block.items?.forEach(item => { body += `  <li>${item}</li>\n`; });
        body += '</ul>\n';
        break;
    }
  }

  // Use actual letterhead PDF image as background if available
  const bgStyle = letterheadDataUrl
    ? `background-image: url('${letterheadDataUrl}'); background-size: 100% 100%; background-repeat: no-repeat;`
    : 'background: white;';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle || 'Document'} - NexaCore Innovations</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
      color: #2d3748;
      background: #d0d5dc;
      padding: 20px;
      line-height: 1.6;
      font-size: 13px;
    }

    /* ─── PAGE: Uses actual letterhead PDF as background ─── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 20px;
      ${bgStyle}
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── CONTENT AREA: positioned within letterhead safe margins ─── */
    /* Top ~46mm below header, bottom ~30mm above footer, sides ~18mm */
    .content {
      padding: 44mm 20mm 32mm;
      position: relative;
      z-index: 1;
      flex: 1;
    }
    .doc-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2.5px solid #0098A6;
      padding-bottom: 10px;
      margin-bottom: 22px;
    }
    .doc-title-bar h2 {
      font-size: 19px; font-weight: 700;
      color: #1E3A5F;
    }
    .doc-title-bar .doc-date {
      font-size: 11px; color: #718096;
    }

    /* Headings */
    .doc-heading {
      color: #1E3A5F;
      margin: 18px 0 8px;
      padding-bottom: 4px;
    }
    h2.doc-heading {
      font-size: 15px;
      border-bottom: 2px solid #0098A6;
      padding-bottom: 5px;
    }
    h3.doc-heading { font-size: 13.5px; color: #0098A6; }
    h4.doc-heading { font-size: 12.5px; color: #4a5568; }

    /* Paragraphs */
    .doc-para {
      margin-bottom: 10px;
      color: #374151;
      text-align: justify;
      line-height: 1.65;
    }

    /* Tables */
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px;
      font-size: 12px;
    }
    .doc-table th {
      background: #0098A6;
      color: white;
      padding: 9px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
    }
    .doc-table tbody tr:nth-child(even) { background: rgba(249, 250, 251, 0.85); }

    /* Lists */
    .doc-list {
      margin: 8px 0 14px;
      padding-left: 20px;
    }
    .doc-list li {
      margin-bottom: 5px;
      color: #374151;
      line-height: 1.5;
    }
    .doc-list li::marker {
      color: #0098A6;
    }

    @media print {
      body { background: white; padding: 0; margin: 0; }
      .page {
        box-shadow: none;
        min-height: auto;
        width: 100%;
        margin: 0;
        page-break-after: always;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="content">
      <div class="doc-title-bar">
        <h2>${docTitle || 'Document'}</h2>
        <span class="doc-date">${docDate}</span>
      </div>
      ${body}
    </div>
  </div>

  <script>
    const btn = document.createElement('button');
    btn.innerHTML = '&#x1F5A8; Print / Save as PDF';
    btn.className = 'no-print';
    btn.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#0098A6,#1E3A5F);color:#fff;border:none;padding:12px 28px;border-radius:25px;cursor:pointer;font-weight:600;z-index:1000;box-shadow:0 4px 15px rgba(0,152,166,0.3);font-size:14px;';
    btn.onclick = () => window.print();
    document.body.appendChild(btn);
  </script>
</body>
</html>`;
}

export const LetterheadDocumentCreator: React.FC = () => {
  const [rawContent, setRawContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [parsedBlocks, setParsedBlocks] = useState<ParsedBlock[]>([]);
  const [letterheadImg, setLetterheadImg] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Pre-load the actual letterhead PDF as a background image
  useEffect(() => {
    getLetterheadImage().then(img => {
      if (img) setLetterheadImg(img);
    });
  }, []);

  const handleParse = () => {
    if (!rawContent.trim()) {
      toast.error('Please paste some content first');
      return;
    }
    const blocks = parseContent(rawContent);
    setParsedBlocks(blocks);
    setShowPreview(true);

    // Render into iframe
    setTimeout(() => {
      if (previewRef.current) {
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        const html = renderBlocksToHTML(blocks, docTitle || 'Document', dateStr, letterheadImg);
        const doc = previewRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    }, 100);

    toast.success(`Parsed ${blocks.length} content blocks`);
  };

  const handlePrint = () => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.print();
    }
  };

  const handleOpenInNewTab = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const html = renderBlocksToHTML(parsedBlocks, docTitle || 'Document', dateStr, letterheadImg);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleReset = () => {
    setRawContent('');
    setDocTitle('');
    setShowPreview(false);
    setParsedBlocks([]);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawContent(text);
        toast.success('Content pasted from clipboard');
      } else {
        toast.error('Clipboard is empty');
      }
    } catch {
      toast.error('Could not access clipboard. Please paste manually (Ctrl+V)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Letterhead Document Creator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste any content and it will be formatted on the NexaCore letterhead. Tables, lists, and headings are detected automatically.
          </p>
        </div>
        {showPreview && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        )}
      </div>

      {!showPreview ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardPaste className="h-5 w-5 text-teal-600" />
              Paste Your Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                placeholder="e.g. Project Proposal, Meeting Minutes, Invoice..."
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="content">Content</Label>
                <Button variant="ghost" size="sm" onClick={handlePasteFromClipboard} className="gap-1 text-xs h-7">
                  <ClipboardPaste className="h-3 w-3" />
                  Paste from Clipboard
                </Button>
              </div>
              <Textarea
                id="content"
                placeholder={`Paste anything here — the system will automatically detect and format:\n\n• Tables (tab-separated, pipe-separated, or CSV)\n• Bullet and numbered lists\n• Headings (ALL CAPS lines or # Markdown headings)\n• Paragraphs\n\nExample table:\nItem\tQty\tPrice\nWidget A\t10\t$50\nWidget B\t5\t$120`}
                value={rawContent}
                onChange={e => setRawContent(e.target.value)}
                className="mt-1 min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleParse} className="gap-2 bg-gradient-to-r from-[#1E3A5F] to-[#0098A6] hover:opacity-90">
                <Eye className="h-4 w-4" />
                Preview on Letterhead
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700">Tips for best results:</p>
              <p>- Use <strong>tabs</strong> or <strong>pipes (|)</strong> between columns for tables</p>
              <p>- Write headings in <strong>ALL CAPS</strong> or use <strong># Heading</strong> format</p>
              <p>- Start list items with <strong>-</strong>, <strong>*</strong>, or <strong>1.</strong></p>
              <p>- Separate sections with a blank line</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-[#1E3A5F] to-[#0098A6] hover:opacity-90">
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={handleOpenInNewTab} className="gap-2">
              <FileText className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2">
              <ClipboardPaste className="h-4 w-4" />
              Edit Content
            </Button>
          </div>

          {/* Preview iframe */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <iframe
                ref={previewRef}
                className="w-full border-0"
                style={{ height: '900px' }}
                title="Letterhead Preview"
              />
            </CardContent>
          </Card>

          {/* Parsed blocks summary */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-gray-500">
                Detected: {parsedBlocks.filter(b => b.type === 'heading').length} headings,{' '}
                {parsedBlocks.filter(b => b.type === 'table').length} tables,{' '}
                {parsedBlocks.filter(b => b.type === 'list').length} lists,{' '}
                {parsedBlocks.filter(b => b.type === 'paragraph').length} paragraphs
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LetterheadDocumentCreator;
