// =====================================================
// Proposal PDF Generation Service
// Matches ERP Export Styling Exactly
// =====================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Proposal } from '@/types/proposal';
import { format } from 'date-fns';
import { getLetterheadImage, addLetterheadToPage, LETTERHEAD } from '@/utils/pdfLetterhead';

// Extend jsPDF type to include autotable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// NexaCore Brand Colors
const COLORS = {
  teal: [0, 152, 166] as [number, number, number],
  navy: [30, 58, 95] as [number, number, number],
  lime: [205, 220, 57] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [250, 252, 254] as [number, number, number],
  mediumGray: [240, 245, 248] as [number, number, number],
  darkGray: [100, 100, 100] as [number, number, number],
  textGray: [60, 60, 60] as [number, number, number],
};

export class ProposalPDFGenerator {
  private doc: jsPDF;
  private proposal: Proposal;
  private pageWidth: number;
  private pageHeight: number;
  private yPos: number = 20;
  private brandColors: typeof COLORS;
  private letterheadImg: string | null = null;

  constructor(proposal: Proposal) {
    this.proposal = proposal;
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;

    // Use custom branding if enabled
    if (proposal.use_custom_branding && proposal.branding_config) {
      const config = proposal.branding_config;
      this.brandColors = {
        ...COLORS,
        teal: this.hexToRgb(config.colors.primary),
        navy: this.hexToRgb(config.colors.secondary),
        lime: this.hexToRgb(config.colors.accent),
      };
    } else {
      this.brandColors = COLORS;
    }
  }

  /**
   * Generate complete proposal PDF (async to load letterhead)
   */
  public async generate(): Promise<jsPDF> {
    this.letterheadImg = await getLetterheadImage();

    this.addCoverPage();
    this.addTableOfContents();
    this.addExecutiveSummary();
    this.addScopeOfWork();
    this.addMethodology();
    this.addDeliverables();
    this.addTeamBios();
    this.addRiskAnalysis();
    this.addSuccessMetrics();
    this.addCustomSections();
    this.addPricingAndTimeline();
    this.addTermsAndConditions();

    return this.doc;
  }

  /**
   * Download the generated PDF
   */
  public download(): void {
    const fileName = `${this.proposal.proposal_number}_${this.proposal.client_name.replace(/\s+/g, '_')}.pdf`;
    this.doc.save(fileName);
  }

  /**
   * Get PDF as blob for preview
   */
  public getBlob(): Blob {
    return this.doc.output('blob');
  }

  /**
   * Add cover page with letterhead background
   */
  private addCoverPage(): void {
    addLetterheadToPage(this.doc, this.letterheadImg);
    this.yPos = LETTERHEAD.CONTENT_TOP;

    // Document type
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.brandColors.navy);
    this.doc.text('PROJECT PROPOSAL', 14, this.yPos);
    this.yPos += 8;

    // Tagline
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(...COLORS.darkGray);
    this.doc.text('Engineering Global Innovation with Excellence', 14, this.yPos);
    this.yPos += 15;

    // Proposal number and date (centered)
    const centerX = this.pageWidth / 2;
    this.doc.setFillColor(...this.brandColors.teal);
    this.doc.rect(14, this.yPos, this.pageWidth - 28, 12, 'F');
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text(this.proposal.proposal_number, centerX, this.yPos + 8, { align: 'center' });
    this.yPos += 25;

    // Client information box
    this.doc.setFillColor(...COLORS.mediumGray);
    this.doc.rect(14, this.yPos, this.pageWidth - 28, 45, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.brandColors.navy);
    this.doc.text('PREPARED FOR:', 20, this.yPos + 10);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.textGray);
    this.doc.text(this.proposal.client_name, 20, this.yPos + 20);

    if (this.proposal.client_company) {
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(this.proposal.client_company, 20, this.yPos + 28);
    }

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.proposal.client_email, 20, this.yPos + 36);

    this.yPos += 60;

    // Proposal title (centered, large)
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.brandColors.navy);
    const titleLines = this.doc.splitTextToSize(this.proposal.title, this.pageWidth - 40);
    titleLines.forEach((line: string) => {
      this.doc.text(line, centerX, this.yPos, { align: 'center' });
      this.yPos += 8;
    });
    this.yPos += 10;

    // Key details
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textGray);

    const details = [
      `Service Type: ${this.proposal.service_type}`,
      `Total Investment: ${this.proposal.currency} ${this.proposal.total_price.toLocaleString()}`,
      `Timeline: ${this.proposal.timeline || 'To be determined'}`,
      `Prepared: ${format(new Date(this.proposal.created_at), 'MMMM dd, yyyy')}`,
    ];

    if (this.proposal.valid_until) {
      details.push(`Valid Until: ${format(new Date(this.proposal.valid_until), 'MMMM dd, yyyy')}`);
    }

    details.forEach(detail => {
      this.doc.text(detail, centerX, this.yPos, { align: 'center' });
      this.yPos += 7;
    });

    // Add new page for content
    this.doc.addPage();
    addLetterheadToPage(this.doc, this.letterheadImg);
    this.yPos = LETTERHEAD.CONTENT_TOP;
  }

  /**
   * Add table of contents
   */
  private addTableOfContents(): void {
    this.addSectionHeader('TABLE OF CONTENTS');

    const tocItems = [
      '1. Executive Summary',
      '2. Scope of Work',
      '3. Methodology',
      '4. Deliverables',
    ];

    if (this.proposal.team_bios?.members && this.proposal.team_bios.members.length > 0) {
      tocItems.push('5. Team Members');
    }

    if (this.proposal.risk_analysis?.risks && this.proposal.risk_analysis.risks.length > 0) {
      tocItems.push('6. Risk Analysis');
    }

    if (this.proposal.success_metrics?.kpis && this.proposal.success_metrics.kpis.length > 0) {
      tocItems.push('7. Success Metrics');
    }

    if (this.proposal.custom_sections && this.proposal.custom_sections.length > 0) {
      this.proposal.custom_sections.forEach((section, index) => {
        tocItems.push(`${tocItems.length + 1}. ${section.title}`);
      });
    }

    tocItems.push(`${tocItems.length + 1}. Pricing & Timeline`);
    tocItems.push(`${tocItems.length + 1}. Terms & Conditions`);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textGray);

    tocItems.forEach(item => {
      this.doc.text(item, 20, this.yPos);
      this.yPos += 8;
    });

    this.yPos += 10;
    this.checkPageBreak();
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(): void {
    if (!this.proposal.executive_summary?.overview) return;

    this.addSectionHeader('EXECUTIVE SUMMARY');

    // Overview
    if (this.proposal.executive_summary.overview) {
      this.addSubheader('Overview');
      this.addParagraph(this.proposal.executive_summary.overview);
    }

    // Key Benefits
    if (this.proposal.executive_summary.key_benefits &&
        this.proposal.executive_summary.key_benefits.length > 0 &&
        this.proposal.executive_summary.key_benefits.some(b => b.trim())) {
      this.addSubheader('Key Benefits');
      this.proposal.executive_summary.key_benefits
        .filter(benefit => benefit.trim())
        .forEach(benefit => {
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(...COLORS.textGray);
          this.doc.text('•', 20, this.yPos);
          const lines = this.doc.splitTextToSize(benefit, this.pageWidth - 50);
          lines.forEach((line: string) => {
            this.doc.text(line, 28, this.yPos);
            this.yPos += 6;
          });
          this.yPos += 2;
          this.checkPageBreak();
        });
      this.yPos += 5;
    }

    // Investment Summary
    if (this.proposal.executive_summary.investment_summary) {
      this.addSubheader('Investment Summary');
      this.addParagraph(this.proposal.executive_summary.investment_summary);
    }

    this.yPos += 10;
  }

  /**
   * Add scope of work section
   */
  private addScopeOfWork(): void {
    if (!this.proposal.scope_of_work?.description) return;

    this.addSectionHeader('SCOPE OF WORK');

    if (this.proposal.scope_of_work.description) {
      this.addParagraph(this.proposal.scope_of_work.description);
    }

    if (this.proposal.scope_of_work.inclusions &&
        this.proposal.scope_of_work.inclusions.length > 0 &&
        this.proposal.scope_of_work.inclusions.some(i => i.trim())) {
      this.addSubheader('What\'s Included');
      this.addBulletList(this.proposal.scope_of_work.inclusions.filter(i => i.trim()));
    }

    if (this.proposal.scope_of_work.exclusions &&
        this.proposal.scope_of_work.exclusions.length > 0 &&
        this.proposal.scope_of_work.exclusions.some(e => e.trim())) {
      this.addSubheader('Out of Scope');
      this.addBulletList(this.proposal.scope_of_work.exclusions.filter(e => e.trim()));
    }

    this.yPos += 10;
  }

  /**
   * Add methodology section
   */
  private addMethodology(): void {
    if (!this.proposal.methodology?.approach) return;

    this.addSectionHeader('METHODOLOGY');

    if (this.proposal.methodology.approach) {
      this.addParagraph(this.proposal.methodology.approach);
    }

    if (this.proposal.methodology.phases && this.proposal.methodology.phases.length > 0) {
      this.addSubheader('Project Phases');

      this.proposal.methodology.phases.forEach((phase, index) => {
        this.checkPageBreak(50);

        this.doc.setFillColor(...this.brandColors.mediumGray);
        this.doc.rect(20, this.yPos - 2, this.pageWidth - 40, 8, 'F');

        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.brandColors.navy);
        this.doc.text(`Phase ${phase.phase_number}: ${phase.title}`, 24, this.yPos + 4);
        this.yPos += 12;

        if (phase.description) {
          this.addParagraph(phase.description, 24);
        }

        if (phase.duration) {
          this.doc.setFontSize(9);
          this.doc.setFont('helvetica', 'italic');
          this.doc.setTextColor(...COLORS.darkGray);
          this.doc.text(`Duration: ${phase.duration}`, 24, this.yPos);
          this.yPos += 8;
        }
      });
    }

    if (this.proposal.methodology.tools_technologies &&
        this.proposal.methodology.tools_technologies.length > 0 &&
        this.proposal.methodology.tools_technologies.some(t => t.trim())) {
      this.addSubheader('Tools & Technologies');
      this.addBulletList(this.proposal.methodology.tools_technologies.filter(t => t.trim()));
    }

    this.yPos += 10;
  }

  /**
   * Add deliverables section
   */
  private addDeliverables(): void {
    if (!this.proposal.deliverables?.items || this.proposal.deliverables.items.length === 0) return;

    this.addSectionHeader('DELIVERABLES');

    const tableData = this.proposal.deliverables.items.map((item, index) => [
      `${index + 1}`,
      item.title,
      item.description || '-',
      item.format || '-',
      item.delivery_date ? format(new Date(item.delivery_date), 'MMM dd, yyyy') : 'TBD'
    ]);

    autoTable(this.doc, {
      startY: this.yPos,
      head: [['#', 'Deliverable', 'Description', 'Format', 'Delivery Date']],
      body: tableData,
      theme: 'grid',
      margin: { top: LETTERHEAD.CONTENT_TOP, left: LETTERHEAD.MARGIN_LEFT, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM },
      willDrawPage: this.getDidDrawPage(),
      headStyles: {
        fillColor: this.brandColors.teal,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 210, 220],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45 },
        2: { cellWidth: 65 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });

    this.yPos = this.doc.lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  /**
   * Add team bios section
   */
  private addTeamBios(): void {
    if (!this.proposal.team_bios?.members || this.proposal.team_bios.members.length === 0) return;

    this.addSectionHeader('TEAM MEMBERS');

    this.proposal.team_bios.members.forEach((member, index) => {
      this.checkPageBreak(40);

      this.doc.setFillColor(...this.brandColors.mediumGray);
      this.doc.rect(20, this.yPos - 2, this.pageWidth - 40, 8, 'F');

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.brandColors.navy);
      this.doc.text(`${member.name} - ${member.role}`, 24, this.yPos + 4);
      this.yPos += 12;

      if (member.bio) {
        this.addParagraph(member.bio, 24);
      }

      if (member.expertise && member.expertise.length > 0) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...COLORS.darkGray);
        this.doc.text('Expertise:', 24, this.yPos);
        this.yPos += 6;

        this.doc.setFont('helvetica', 'normal');
        const expertiseText = member.expertise.join(', ');
        const lines = this.doc.splitTextToSize(expertiseText, this.pageWidth - 55);
        lines.forEach((line: string) => {
          this.doc.text(line, 24, this.yPos);
          this.yPos += 5;
        });
        this.yPos += 6;
      }
    });

    this.yPos += 10;
  }

  /**
   * Add risk analysis section
   */
  private addRiskAnalysis(): void {
    if (!this.proposal.risk_analysis?.risks || this.proposal.risk_analysis.risks.length === 0) return;

    this.addSectionHeader('RISK ANALYSIS');

    const tableData = this.proposal.risk_analysis.risks.map(risk => [
      risk.title,
      risk.description,
      risk.impact.toUpperCase(),
      risk.probability.toUpperCase(),
      risk.mitigation_strategy
    ]);

    autoTable(this.doc, {
      startY: this.yPos,
      head: [['Risk', 'Description', 'Impact', 'Probability', 'Mitigation Strategy']],
      body: tableData,
      theme: 'grid',
      margin: { top: LETTERHEAD.CONTENT_TOP, left: LETTERHEAD.MARGIN_LEFT, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM },
      willDrawPage: this.getDidDrawPage(),
      headStyles: {
        fillColor: this.brandColors.teal,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 210, 220],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 50 }
      }
    });

    this.yPos = this.doc.lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  /**
   * Add success metrics section
   */
  private addSuccessMetrics(): void {
    if (!this.proposal.success_metrics?.kpis || this.proposal.success_metrics.kpis.length === 0) return;

    this.addSectionHeader('SUCCESS METRICS');

    if (this.proposal.success_metrics.measurement_approach) {
      this.addParagraph(this.proposal.success_metrics.measurement_approach);
      this.yPos += 5;
    }

    this.addSubheader('Key Performance Indicators');

    const tableData = this.proposal.success_metrics.kpis.map((kpi, index) => [
      `${index + 1}`,
      kpi.name,
      kpi.description,
      kpi.target,
      kpi.measurement_method
    ]);

    autoTable(this.doc, {
      startY: this.yPos,
      head: [['#', 'KPI', 'Description', 'Target', 'Measurement Method']],
      body: tableData,
      theme: 'grid',
      margin: { top: LETTERHEAD.CONTENT_TOP, left: LETTERHEAD.MARGIN_LEFT, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM },
      willDrawPage: this.getDidDrawPage(),
      headStyles: {
        fillColor: this.brandColors.teal,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 210, 220],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 }
      }
    });

    this.yPos = this.doc.lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  /**
   * Add custom sections
   */
  private addCustomSections(): void {
    if (!this.proposal.custom_sections || this.proposal.custom_sections.length === 0) return;

    this.proposal.custom_sections
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        this.addSectionHeader(section.title.toUpperCase());
        this.addParagraph(section.content);
        this.yPos += 10;
      });
  }

  /**
   * Add pricing and timeline section
   */
  private addPricingAndTimeline(): void {
    this.addSectionHeader('PRICING & TIMELINE');

    const pricingData = [
      ['Service Type', this.proposal.service_type],
      ['Total Investment', `${this.proposal.currency} ${this.proposal.total_price.toLocaleString()}`],
      ['Timeline', this.proposal.timeline || 'To be determined'],
    ];

    if (this.proposal.estimated_start_date) {
      pricingData.push(['Estimated Start', format(new Date(this.proposal.estimated_start_date), 'MMMM dd, yyyy')]);
    }

    if (this.proposal.estimated_end_date) {
      pricingData.push(['Estimated Completion', format(new Date(this.proposal.estimated_end_date), 'MMMM dd, yyyy')]);
    }

    if (this.proposal.valid_until) {
      pricingData.push(['Proposal Valid Until', format(new Date(this.proposal.valid_until), 'MMMM dd, yyyy')]);
    }

    autoTable(this.doc, {
      startY: this.yPos,
      body: pricingData,
      theme: 'grid',
      margin: { top: LETTERHEAD.CONTENT_TOP, left: LETTERHEAD.MARGIN_LEFT, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM },
      willDrawPage: this.getDidDrawPage(),
      styles: {
        fontSize: 10,
        cellPadding: 4,
        lineColor: [200, 210, 220],
        lineWidth: 0.3
      },
      columnStyles: {
        0: {
          cellWidth: 60,
          fontStyle: 'bold',
          fillColor: COLORS.mediumGray
        },
        1: {
          cellWidth: 115,
          fontSize: 11
        }
      }
    });

    this.yPos = this.doc.lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  /**
   * Add terms and conditions section
   */
  private addTermsAndConditions(): void {
    if (!this.proposal.terms_and_conditions) return;

    this.addSectionHeader('TERMS & CONDITIONS');
    this.addParagraph(this.proposal.terms_and_conditions);
    this.yPos += 10;
  }

  // Helper methods

  private addSectionHeader(title: string): void {
    this.checkPageBreak(30);

    this.doc.setFillColor(...this.brandColors.teal);
    this.doc.rect(14, this.yPos - 2, this.pageWidth - 28, 10, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...COLORS.white);
    this.doc.text(title, this.pageWidth / 2, this.yPos + 5, { align: 'center' });

    this.yPos += 15;
  }

  private addSubheader(title: string): void {
    this.checkPageBreak(20);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.brandColors.navy);
    this.doc.text(title, 20, this.yPos);

    this.yPos += 8;
  }

  private addParagraph(text: string, leftMargin: number = 20): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...COLORS.textGray);

    const lines = this.doc.splitTextToSize(text, this.pageWidth - leftMargin - 20);
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, leftMargin, this.yPos);
      this.yPos += 6;
    });

    this.yPos += 4;
  }

  private addBulletList(items: string[]): void {
    items.forEach(item => {
      this.checkPageBreak();

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.textGray);
      this.doc.text('•', 20, this.yPos);

      const lines = this.doc.splitTextToSize(item, this.pageWidth - 50);
      lines.forEach((line: string) => {
        this.doc.text(line, 28, this.yPos);
        this.yPos += 6;
      });

      this.yPos += 2;
    });

    this.yPos += 4;
  }

  private checkPageBreak(requiredSpace: number = 30): void {
    const maxY = this.pageHeight - LETTERHEAD.CONTENT_BOTTOM;
    if (this.yPos > maxY - requiredSpace) {
      this.doc.addPage();
      addLetterheadToPage(this.doc, this.letterheadImg);
      this.yPos = LETTERHEAD.CONTENT_TOP;
    }
  }

  /** Get the didDrawPage callback for autoTable that adds letterhead to new pages */
  private getDidDrawPage() {
    return () => {
      addLetterheadToPage(this.doc, this.letterheadImg);
    };
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 152, 166]; // Default to teal
  }
}

/**
 * Generate and download proposal PDF
 */
export async function generateProposalPDF(proposal: Proposal): Promise<void> {
  const generator = new ProposalPDFGenerator(proposal);
  await generator.generate();
  generator.download();
}

/**
 * Generate proposal PDF and return blob for preview
 */
export async function generateProposalPDFBlob(proposal: Proposal): Promise<Blob> {
  const generator = new ProposalPDFGenerator(proposal);
  await generator.generate();
  return generator.getBlob();
}
