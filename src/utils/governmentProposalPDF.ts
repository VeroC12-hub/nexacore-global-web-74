import jsPDF from 'jspdf';

// ── Brand colours (matching the original PDF exactly) ──────────────────────
const NAVY   : [number,number,number] = [20,  44,  84];
const TEAL   : [number,number,number] = [0,  152, 166];
const OLIVE  : [number,number,number] = [180,200,  30];
const WHITE  : [number,number,number] = [255,255, 255];
const LGRAY  : [number,number,number] = [248,249, 250];
const MGRAY  : [number,number,number] = [220,228, 235];
const TEXT   : [number,number,number] = [40,  50,  65];
const MUTED  : [number,number,number] = [100,110, 125];

const PW = 210;   // page width  mm
const PH = 297;   // page height mm
const ML = 15;    // margin left
const MR = 15;    // margin right
const CW = PW - ML - MR;  // content width

// ── Low-level helpers ───────────────────────────────────────────────────────

function rgb(doc: jsPDF, fill: [number,number,number]) {
  doc.setFillColor(...fill);
}

function stroke(doc: jsPDF, c: [number,number,number]) {
  doc.setDrawColor(...c);
}

function fc(doc: jsPDF, c: [number,number,number]) {
  doc.setTextColor(...c);
}

/** Draw bottom-right stacked corner decoration (matches original PDF) */
function cornerDeco(doc: jsPDF) {
  // outer teal wedge
  doc.setFillColor(...TEAL);
  doc.triangle(PW - 38, PH, PW, PH - 52, PW, PH, 'F');
  // middle navy wedge
  doc.setFillColor(...NAVY);
  doc.triangle(PW - 22, PH, PW, PH - 32, PW, PH, 'F');
  // front olive wedge
  doc.setFillColor(...OLIVE);
  doc.triangle(PW - 14, PH, PW, PH - 20, PW, PH, 'F');
}

/** Page header: globe icon + URL left, "Page XX" right, separator line */
function pageHeader(doc: jsPDF, pageNum: number) {
  // Globe circle
  doc.setFillColor(...TEAL);
  doc.circle(ML + 3, 8, 3, 'F');
  doc.setFillColor(...WHITE);
  doc.circle(ML + 3, 8, 2, 'S');

  fc(doc, MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('www.nexacore-innovations.com', ML + 9, 9.5);

  doc.text(`Page ${String(pageNum).padStart(2, '0')}`, PW - MR, 9.5, { align: 'right' });

  stroke(doc, MGRAY);
  doc.setLineWidth(0.3);
  doc.line(ML, 12, PW - MR, 12);
}

/** Large bold section title (matches the big navy headings in the original) */
function sectionTitle(doc: jsPDF, title: string, y = 22): number {
  fc(doc, NAVY);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(title, ML, y);
  return y + 14;
}

/** Arrow-in-circle icon used in TOC and service headings */
function arrowIcon(doc: jsPDF, x: number, y: number) {
  stroke(doc, TEAL);
  doc.setLineWidth(0.6);
  doc.circle(x, y, 4, 'S');
  fc(doc, TEAL);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('↗', x - 2, y + 1.5);
}

/** Filled teal image-placeholder rectangle */
function imgPlaceholder(doc: jsPDF, x: number, y: number, w: number, h: number) {
  rgb(doc, TEAL);
  doc.rect(x, y, w, h, 'F');
  rgb(doc, [0, 120, 135]);
  doc.rect(x, y, w, h / 4, 'F');
  // subtle grid lines to look like a photo
  stroke(doc, [0, 130, 145]);
  doc.setLineWidth(0.2);
  for (let i = 1; i < 4; i++) {
    doc.line(x, y + (h / 4) * i, x + w, y + (h / 4) * i);
  }
}

/** Dotted leader line for TOC */
function dotLeader(doc: jsPDF, x1: number, x2: number, y: number) {
  stroke(doc, MGRAY);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([0.5, 1.5], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
}

/** Wrapped paragraph */
function para(doc: jsPDF, text: string, x: number, y: number, maxW: number,
              size = 9, colour: [number,number,number] = TEXT, lineH = 5.5): number {
  fc(doc, colour);
  doc.setFontSize(size);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y, { lineHeightFactor: 1.4 });
  return y + lines.length * lineH;
}

/** Bold label */
function label(doc: jsPDF, text: string, x: number, y: number, size = 10): number {
  fc(doc, NAVY);
  doc.setFontSize(size);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x, y);
  return y + size * 0.45 + 2;
}

/** Bullet point */
function bullet(doc: jsPDF, text: string, x: number, y: number, maxW: number,
                size = 9): number {
  fc(doc, TEAL);
  doc.setFontSize(size + 2);
  doc.text('•', x, y);
  const ny = para(doc, text, x + 6, y, maxW - 6, size);
  return ny + 1;
}

// ── PAGE BUILDERS ────────────────────────────────────────────────────────────

function buildCover(doc: jsPDF) {
  // ── Logo text top-left ──
  fc(doc, NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXAC', ML, 20);
  doc.setFillColor(...TEAL);
  doc.circle(ML + 28, 17, 3.5, 'F');
  fc(doc, WHITE);
  doc.setFontSize(8);
  doc.text('RE', ML + 25.5, 18.5);
  fc(doc, NAVY);
  doc.setFontSize(11);
  doc.text('     INNOVATIONS', ML + 7, 24);
  doc.setLineWidth(0.4);
  stroke(doc, NAVY);
  doc.line(ML, 26, ML + 60, 26);

  // letter-spaced subtitle under logo
  fc(doc, NAVY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('I  N  N  O  V  A  T  I  O  N  S', ML + 2, 30);

  // ── Big title ──
  fc(doc, NAVY);
  doc.setFontSize(52);
  doc.setFont('helvetica', 'bold');
  doc.text('Proposal', ML, 80);

  // ── Subtitle ──
  fc(doc, TEXT);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const sub = 'Positioning Ghana as a Regional Hub for\nDigital Engineering & Design';
  doc.text(sub, ML, 92);

  // ── Tagline ──
  fc(doc, MUTED);
  doc.setFontSize(11);
  doc.text('Engineering Global Innovation with Excellence', ML, 108);

  // ── Cover image placeholder ──
  imgPlaceholder(doc, 0, 118, PW * 0.68, 100);

  // right-side colour bars (original design element)
  doc.setFillColor(...TEAL);
  doc.rect(PW * 0.68, 118, 18, 100, 'F');
  doc.setFillColor(...[0, 100, 120] as [number,number,number]);
  doc.rect(PW * 0.68 + 18, 118, 12, 100, 'F');
  doc.setFillColor(...OLIVE);
  doc.rect(PW * 0.68 + 30, 118, 10, 100, 'F');

  // ── PREPARED FOR block ──
  fc(doc, NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR :', ML, 230);

  fc(doc, TEXT);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Hon. Sam George', ML, 238);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('Minister of Communications & Digitalisation, Ghana', ML, 244);

  // ── Submitted by ──
  fc(doc, MUTED);
  doc.setFontSize(8);
  doc.text('Submitted by: NexaCore Innovations  ·  In collaboration with: Autodesk', ML, 255);

  // year bottom-left
  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 8);

  // corner deco
  cornerDeco(doc);
}

function buildTOC(doc: jsPDF) {
  pageHeader(doc, 1);
  let y = sectionTitle(doc, 'Table of Contents', 30);
  y += 8;

  const items = [
    { title: 'Introduction',       page: '2' },
    { title: 'Company Overview',   page: '3' },
    { title: 'The Opportunity',    page: '4' },
    { title: 'What We Propose',    page: '5' },
    { title: 'Why This Matters',   page: '7' },
    { title: 'Our Request',        page: '8' },
    { title: 'Contact Us',         page: '9' },
  ];

  items.forEach(item => {
    arrowIcon(doc, ML + 4, y);
    fc(doc, NAVY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, ML + 12, y + 1.5);
    dotLeader(doc, ML + 70, PW - MR - 12, y + 1);
    fc(doc, NAVY);
    doc.setFontSize(12);
    doc.text(item.page, PW - MR, y + 1.5, { align: 'right' });
    y += 18;
  });

  // year
  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);

  cornerDeco(doc);
}

function buildIntroduction(doc: jsPDF) {
  pageHeader(doc, 2);
  sectionTitle(doc, 'Introduction', 24);

  // Left: image placeholder
  imgPlaceholder(doc, ML, 40, 90, 65);

  // Right: intro text (column)
  const rx = ML + 95;
  const rw = CW - 95;
  let ry = 42;

  ry = para(doc, 'NexaCore Innovations, in collaboration with Autodesk — a global leader in engineering and design technology — proposes a simple but strategic initiative to help Ghana strengthen its digital engineering capacity across professionals, universities, and public institutions.', rx, ry, rw);
  ry += 4;
  ry = para(doc, 'Our goal is to support Ghana in becoming a West African hub for modern digital design and infrastructure delivery.', rx, ry, rw);

  // Team members (bottom right)
  ry += 8;
  // Benjamin Agbesi
  doc.setFillColor(...MGRAY);
  doc.circle(rx + 8, ry + 4, 7, 'F');
  fc(doc, MUTED);
  doc.setFontSize(14);
  doc.text('BA', rx + 4, ry + 6);
  label(doc, 'Benjamin Agbesi', rx + 18, ry + 2, 10);
  fc(doc, MUTED);
  doc.setFontSize(8);
  doc.text('Co-Founder', rx + 18, ry + 8);
  doc.text('Operations Manager', rx + 18, ry + 13);
  ry += 22;

  // Godwin Ocloo
  doc.setFillColor(...MGRAY);
  doc.circle(rx + 8, ry + 4, 7, 'F');
  fc(doc, MUTED);
  doc.setFontSize(14);
  doc.text('GO', rx + 4, ry + 6);
  label(doc, 'Godwin Ocloo', rx + 18, ry + 2, 10);
  fc(doc, MUTED);
  doc.setFontSize(8);
  doc.text('Co-Founder', rx + 18, ry + 8);
  doc.text('Project Manager', rx + 18, ry + 13);

  // Bottom full-width intro text
  let by = 116;
  fc(doc, TEXT);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Welcome to NexaCore Innovations!', ML, by);
  by += 6;
  by = para(doc, "We're excited to present this proposal to the Ministry of Communications & Digitalisation. NexaCore blends innovation, technical expertise, and strategic insight to deliver smart, scalable solutions that position Ghana as Africa's foremost digital engineering nation.", ML, by, CW);

  by += 6;
  // Two info boxes
  const bw = (CW - 8) / 2;
  doc.setFillColor(...LGRAY);
  doc.rect(ML, by, bw, 42, 'F');
  doc.setFillColor(...[230, 242, 244] as [number,number,number]);
  doc.rect(ML + bw + 8, by, bw, 42, 'F');

  label(doc, 'Our Collaboration', ML + 3, by + 7, 9);
  para(doc, 'NexaCore collaborates with Autodesk to bring certified digital engineering programs and innovation to Africa\'s educational and industrial sectors.', ML + 3, by + 13, bw - 6, 8.5);

  label(doc, 'Our Proposal', ML + bw + 11, by + 7, 9);
  para(doc, "We propose to deliver digital engineering services to Ghana's professional bodies, universities, and public institutions — coordinating with all relevant stakeholders.", ML + bw + 11, by + 13, bw - 6, 8.5);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildCompanyOverview(doc: jsPDF) {
  pageHeader(doc, 3);
  sectionTitle(doc, 'Company Overview', 24);

  // full-width image
  imgPlaceholder(doc, ML, 38, CW, 52);

  let y = 98;

  // Two column: About Us | Mission + Vision
  const lw = CW * 0.48;
  const rx = ML + lw + 8;
  const rw = CW - lw - 8;

  // About Us
  arrowIcon(doc, ML + 5, y);
  label(doc, 'About Us', ML + 13, y + 2, 11);
  y += 10;
  para(doc, 'NexaCore Innovations is a technology and engineering company focused on delivering digital solutions that help businesses work smarter and more efficiently. The company provides end-to-end technology support across software development, AI and automation, system integration, and creative product design. Our approach combines technical expertise, problem-solving, and innovation to deliver measurable impact.', ML, y, lw, 9);

  // Mission
  let ry = 98;
  arrowIcon(doc, rx + 5, ry);
  label(doc, 'Mission', rx + 13, ry + 2, 11);
  ry += 10;
  ry = para(doc, 'To design and deploy innovative technology solutions that drive digital transformation, sustainability, and operational excellence across industries.', rx, ry, rw, 9);
  ry += 6;

  // Vision
  arrowIcon(doc, rx + 5, ry);
  label(doc, 'Vision', rx + 13, ry + 2, 11);
  ry += 10;
  para(doc, 'To become a trusted technology partner in Africa and beyond, helping organizations transition into smarter, data-driven operations.', rx, ry, rw, 9);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildOpportunity(doc: jsPDF) {
  pageHeader(doc, 4);
  sectionTitle(doc, 'The Opportunity', 24);

  // teal accent bar
  doc.setFillColor(...TEAL);
  doc.rect(ML, 36, 4, 52, 'F');

  let y = 38;
  y = para(doc, 'Ghana is experiencing steady growth in infrastructure, urban development, and digital transformation. However, much of the world now designs and delivers infrastructure using advanced digital platforms that improve efficiency, reduce waste, and enhance transparency.', ML + 8, y, CW - 8, 10);
  y += 4;
  y = para(doc, 'Across the world, governments are adopting digital engineering systems to:', ML + 8, y, CW - 8, 10);
  y += 3;

  const items = [
    'Reduce project delays',
    'Improve cost control',
    'Enhance coordination across ministries',
    'Ensure better infrastructure planning',
  ];
  items.forEach(item => { y = bullet(doc, item, ML + 8, y, CW - 8, 10); });

  y += 4;
  y = para(doc, 'Ghana has the talent and institutions to achieve this, but there is currently no coordinated national framework to drive structured adoption and training.', ML + 8, y, CW - 8, 10);

  y += 6;
  // Highlight box
  doc.setFillColor(...[230, 247, 249] as [number,number,number]);
  doc.rect(ML, y, CW, 14, 'F');
  doc.setFillColor(...TEAL);
  doc.rect(ML, y, 4, 14, 'F');
  fc(doc, NAVY);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('This presents an opportunity.', ML + 10, y + 9);

  y += 20;

  // image placeholder below
  imgPlaceholder(doc, ML, y, CW, 60);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildWhatWePropose1(doc: jsPDF) {
  pageHeader(doc, 5);
  sectionTitle(doc, 'What We Propose', 24);

  fc(doc, MUTED);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Simple Framework', ML, 36);

  // ── Pillar 1 ──
  let y = 44;
  arrowIcon(doc, ML + 5, y);
  label(doc, '1.  Support for Professional Bodies and Agencies', ML + 13, y + 2, 11);
  y += 10;

  const lw = CW * 0.56;
  const rx = ML + lw + 8;
  const rw = CW - lw - 8;

  // left text
  let ly = y;
  ly = para(doc, 'Working with institutions such as the:', ML, ly, lw);
  ly += 2;
  ly = bullet(doc, 'Ghana Institution of Engineering', ML, ly, lw);
  ly = bullet(doc, 'Ghana Institute of Architects', ML, ly, lw);
  ly += 2;
  para(doc, 'to introduce structured digital upskilling programs and modern design standards that align with global best practices.', ML, ly, lw);

  // right image
  imgPlaceholder(doc, rx, y, rw, 48);

  y += 56;

  // ── Pillar 2 ──
  arrowIcon(doc, ML + 5, y);
  label(doc, '2.  Strengthening Universities and Technical Institutions', ML + 13, y + 2, 11);
  y += 10;

  // left image
  imgPlaceholder(doc, ML, y, lw, 52);

  // right text
  let ry2 = y;
  ry2 = para(doc, 'Supporting universities and technical institutions to bridge the gap between theory and practice by:', rx, ry2, rw);
  ry2 += 2;
  ry2 = bullet(doc, 'Enhancing digital design training', rx, ry2, rw);
  ry2 = bullet(doc, 'Providing internationally recognized certifications', rx, ry2, rw);
  ry2 = bullet(doc, 'Preparing students for modern infrastructure and technology-driven industries', rx, ry2, rw);
  ry2 += 2;
  para(doc, 'This will improve graduate employability and position Ghanaian talent competitively on the global stage.', rx, ry2, rw);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildWhatWePropose2(doc: jsPDF) {
  pageHeader(doc, 6);
  sectionTitle(doc, 'What We Propose', 24);

  // ── Pillar 3 ──
  let y = 36;
  arrowIcon(doc, ML + 5, y);
  label(doc, '3.  Hosting International Digital Design Competitions in Ghana', ML + 13, y + 2, 11);
  y += 10;

  // image full width
  imgPlaceholder(doc, ML, y, CW, 55);
  y += 62;

  // teal accent
  doc.setFillColor(...TEAL);
  doc.rect(ML, y, 4, 42, 'F');

  y = para(doc, 'Currently, major global engineering and design competitions are hosted in regions such as the United States and Germany.', ML + 8, y, CW - 8, 10);
  y += 4;
  para(doc, 'With the right support, Ghana can host similar international competitions, attracting regional participation, showcasing local talent, and positioning the country as a continental innovation hub.', ML + 8, y, CW - 8, 10);

  // grow up tagline
  fc(doc, NAVY);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('grow with Ghana!', ML, PH - 30);

  cornerDeco(doc);
}

function buildWhyThisMatters(doc: jsPDF) {
  pageHeader(doc, 7);
  sectionTitle(doc, 'Why This Matters', 24);

  // image
  imgPlaceholder(doc, ML, 36, CW, 60);

  let y = 104;
  para(doc, 'This initiative will:', ML, y, CW, 10);
  y += 8;

  const points = [
    'Support national digital transformation goals.',
    'Improve infrastructure planning and execution.',
    'Create opportunities for youth in high-value digital careers.',
    "Enhance Ghana's reputation as a forward-thinking technology-driven nation.",
  ];
  points.forEach(p => { y = bullet(doc, p, ML, y, CW, 10); y += 1; });

  y += 6;
  // Bold standout quote
  doc.setFillColor(...[230, 247, 249] as [number,number,number]);
  doc.rect(ML, y - 3, CW, 18, 'F');
  doc.setFillColor(...TEAL);
  doc.rect(ML, y - 3, 4, 18, 'F');
  fc(doc, NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const q = 'It is not merely a software initiative — it is a capacity-building\nand national positioning strategy.';
  doc.text(q, ML + 8, y + 5);

  y += 24;

  // Why NexaCore sub-section
  arrowIcon(doc, ML + 5, y);
  label(doc, 'Why NexaCore Innovations', ML + 13, y + 2, 11);
  y += 10;

  const wlw = (CW - 8) / 2;
  const why = [
    ['Autodesk Collaboration', 'Working in collaboration with Autodesk to deliver internationally recognized digital engineering solutions.'],
    ['WorldSkills Experience', 'Our team has competed in WorldSkills competitions — we bring global engineering standards to Ghana.'],
    ['Local Implementation Ready', 'Based in Accra, NexaCore is ready to coordinate with all relevant stakeholders immediately.'],
    ['Proven Track Record', '50+ projects delivered, 25+ global clients, certified engineering and software professionals.'],
  ];

  why.forEach(([title, desc], i) => {
    const cx = ML + (i % 2) * (wlw + 8);
    const cy = y + Math.floor(i / 2) * 18;
    doc.setFillColor(...LGRAY);
    doc.rect(cx, cy, wlw, 16, 'F');
    fc(doc, TEAL);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, cx + 3, cy + 6);
    fc(doc, TEXT);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(desc, wlw - 6);
    doc.text(lines, cx + 3, cy + 11);
  });

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildRequest(doc: jsPDF) {
  pageHeader(doc, 8);
  sectionTitle(doc, 'Our Request', 24);

  // image
  imgPlaceholder(doc, ML, 36, CW, 60);

  let y = 104;

  // teal accent line
  doc.setFillColor(...TEAL);
  doc.rect(ML, y, 4, 52, 'F');

  y = para(doc, 'We respectfully request the opportunity to briefly present this concept in person and explore how it can align with the Ministry\'s broader digital innovation agenda.', ML + 8, y, CW - 8, 10.5);
  y += 6;
  y = para(doc, 'NexaCore Innovations is prepared to serve as a local implementation partner and coordinate with relevant stakeholders to ensure practical and measurable outcomes.', ML + 8, y, CW - 8, 10.5);

  y += 10;

  // Contact prompt box
  doc.setFillColor(...NAVY);
  doc.rect(ML, y, CW, 22, 'F');
  fc(doc, WHITE);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Schedule a Meeting', ML + 6, y + 9);
  fc(doc, [180, 210, 220] as [number,number,number]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('info@nexacore-innovations.com  ·  +233 20 962 8907', ML + 6, y + 17);

  fc(doc, MUTED);
  doc.setFontSize(9);
  doc.text('2025', ML, PH - 18);
  cornerDeco(doc);
}

function buildContact(doc: jsPDF) {
  // Logo top
  fc(doc, NAVY);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NEXAC', ML, 22);
  doc.setFillColor(...TEAL);
  doc.circle(ML + 55, 19, 6, 'F');
  fc(doc, WHITE);
  doc.setFontSize(10);
  doc.text('RE', ML + 52, 21);
  stroke(doc, NAVY);
  doc.setLineWidth(0.5);
  doc.line(ML, 26, ML + 105, 26);
  fc(doc, NAVY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('I  N  N  O  V  A  T  I  O  N  S', ML + 5, 30);

  // image
  imgPlaceholder(doc, ML, 38, CW, 60);

  // right colour bar on image
  doc.setFillColor(...TEAL);
  doc.rect(ML + CW * 0.65, 38, CW * 0.15, 60, 'F');
  doc.setFillColor(...OLIVE);
  doc.rect(ML + CW * 0.80, 38, CW * 0.20, 60, 'F');

  // Contact Us title
  fc(doc, NAVY);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('Contact Us', ML, 118);

  const contacts = [
    { icon: '⊕', label: 'Website',      value: 'www.nexacore-innovations.com' },
    { icon: '☎', label: 'Phone',        value: '+233 20 9628 907 / +233 50 1588 710' },
    { icon: '✉', label: 'E-mail',       value: 'info@nexacore-innovations.com' },
    { icon: '⚑', label: 'Social Media', value: 'NexaCore Innovations' },
    { icon: '◎', label: 'Location',     value: 'Dawhenya, Accra Ghana' },
  ];

  let cy = 130;
  contacts.forEach((c, i) => {
    if (i > 0) {
      stroke(doc, MGRAY);
      doc.setLineWidth(0.2);
      doc.line(ML, cy - 2, PW - MR, cy - 2);
    }
    // icon circle
    stroke(doc, TEAL);
    doc.setLineWidth(0.5);
    doc.circle(ML + 5, cy + 3, 5, 'S');
    fc(doc, TEAL);
    doc.setFontSize(9);
    doc.text(c.icon, ML + 2.5, cy + 5);

    fc(doc, NAVY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(c.label, ML + 14, cy + 5);

    fc(doc, TEXT);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(c.value, ML + 55, cy + 5);

    cy += 14;
  });

  cornerDeco(doc);
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function generateGovernmentProposalPDF(): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  buildCover(doc);

  doc.addPage(); buildTOC(doc);
  doc.addPage(); buildIntroduction(doc);
  doc.addPage(); buildCompanyOverview(doc);
  doc.addPage(); buildOpportunity(doc);
  doc.addPage(); buildWhatWePropose1(doc);
  doc.addPage(); buildWhatWePropose2(doc);
  doc.addPage(); buildWhyThisMatters(doc);
  doc.addPage(); buildRequest(doc);
  doc.addPage(); buildContact(doc);

  doc.save('Proposal-Ghana-Digital-Hub-NexaCore.pdf');
}
