import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { FileDown, FileSpreadsheet, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ERPProject {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  project_type: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ERPProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ERPProject[];
  filteredProjects: ERPProject[];
  singleProject?: ERPProject | null;
}

export function ERPProjectExportModal({ isOpen, onClose, projects, filteredProjects, singleProject }: ERPProjectExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeAllProjects, setIncludeAllProjects] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  const availableProjects = includeAllProjects ? projects : filteredProjects;

  const projectsToExport = singleProject
    ? [singleProject]
    : selectedProjectIds.length > 0
      ? availableProjects.filter(p => selectedProjectIds.includes(p.id))
      : availableProjects;

  const getDepartmentLabel = (department: string) => {
    const labels: Record<string, string> = {
      'cad_engineering': 'CAD Design & Engineering',
      'civil_engineering': 'Civil Engineering',
      'architecture': 'Architecture',
      'software_development': 'Software Development',
      'ai_ml': 'AI/ML Solutions',
      'digital_services': 'Digital Services',
      'consulting': 'Professional Consulting',
      'operations': 'Operations',
      'finance': 'Finance',
      'hr': 'Human Resources',
      'marketing': 'Marketing & Sales'
    };
    return labels[department] || department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatistics = () => {
    const total = projectsToExport.length;
    const completed = projectsToExport.filter(p => p.status === 'completed').length;
    const inProgress = projectsToExport.filter(p => p.status === 'in_progress').length;
    const pending = projectsToExport.filter(p => p.status === 'pending').length;
    const onHold = projectsToExport.filter(p => p.status === 'on_hold').length;
    const cancelled = projectsToExport.filter(p => p.status === 'cancelled').length;

    const high = projectsToExport.filter(p => p.priority === 'high').length;
    const medium = projectsToExport.filter(p => p.priority === 'medium').length;
    const low = projectsToExport.filter(p => p.priority === 'low').length;

    const totalBudget = projectsToExport.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projectsToExport.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
    const averageProgress = total > 0 ? (projectsToExport.reduce((sum, p) => sum + p.progress, 0) / total).toFixed(1) : '0';

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      cancelled,
      high,
      medium,
      low,
      totalBudget,
      totalSpent,
      completionRate,
      averageProgress
    };
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatPriority = (priority: string) => {
    return priority.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportToCSV = () => {
    try {
      const stats = getStatistics();
      let csvContent = '';

      csvContent += `NexaCore Innovations - ERP Project Report\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Projects: ${stats.total}\n\n`;

      if (includeStatistics) {
        csvContent += `PROJECT STATISTICS\n`;
        csvContent += `Completion Rate,${stats.completionRate}%\n`;
        csvContent += `Average Progress,${stats.averageProgress}%\n`;
        csvContent += `Completed,${stats.completed}\n`;
        csvContent += `In Progress,${stats.inProgress}\n`;
        csvContent += `Pending,${stats.pending}\n`;
        csvContent += `On Hold,${stats.onHold}\n`;
        csvContent += `Cancelled,${stats.cancelled}\n\n`;

        csvContent += `PRIORITY BREAKDOWN\n`;
        csvContent += `High,${stats.high}\n`;
        csvContent += `Medium,${stats.medium}\n`;
        csvContent += `Low,${stats.low}\n\n`;

        csvContent += `FINANCIAL SUMMARY\n`;
        csvContent += `Total Budget,$${stats.totalBudget.toLocaleString()}\n`;
        csvContent += `Total Spent,$${stats.totalSpent.toLocaleString()}\n`;
        csvContent += `Remaining,$${(stats.totalBudget - stats.totalSpent).toLocaleString()}\n\n`;
      }

      csvContent += `PROJECT DETAILS\n`;
      csvContent += `Title,Description,Department,Status,Priority,Type,Budget,Spent,Progress,Start Date,End Date,Active\n`;

      projectsToExport.forEach(project => {
        const row = [
          `"${project.title.replace(/"/g, '""')}"`,
          `"${(project.description || '').replace(/"/g, '""')}"`,
          `"${getDepartmentLabel(project.department)}"`,
          formatStatus(project.status),
          formatPriority(project.priority),
          `"${project.project_type || 'N/A'}"`,
          project.budget || 0,
          project.actual_cost || 0,
          `${project.progress}%`,
          formatDate(project.start_date),
          formatDate(project.end_date),
          project.is_active ? 'Yes' : 'No'
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `NexaCore_ERP_Projects_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${stats.total} projects to CSV`);
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export to CSV');
      return false;
    }
  };

  const exportToExcel = () => {
    try {
      const stats = getStatistics();
      const workbook = XLSX.utils.book_new();

      if (includeStatistics) {
        const statsData = [
          ['NexaCore Innovations - ERP Project Report'],
          ['Generated:', new Date().toLocaleString()],
          [''],
          ['SUMMARY STATISTICS'],
          ['Total Projects', stats.total],
          ['Completion Rate', `${stats.completionRate}%`],
          ['Average Progress', `${stats.averageProgress}%`],
          [''],
          ['STATUS BREAKDOWN'],
          ['Completed', stats.completed],
          ['In Progress', stats.inProgress],
          ['Pending', stats.pending],
          ['On Hold', stats.onHold],
          ['Cancelled', stats.cancelled],
          [''],
          ['PRIORITY BREAKDOWN'],
          ['High', stats.high],
          ['Medium', stats.medium],
          ['Low', stats.low],
          [''],
          ['FINANCIAL SUMMARY'],
          ['Total Budget', `$${stats.totalBudget.toLocaleString()}`],
          ['Total Spent', `$${stats.totalSpent.toLocaleString()}`],
          ['Remaining', `$${(stats.totalBudget - stats.totalSpent).toLocaleString()}`],
          ['Budget Utilization', `${((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}%`]
        ];

        const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
        statsWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistics');
      }

      const projectData = projectsToExport.map(project => ({
        'Title': project.title,
        'Description': project.description || '',
        'Department': getDepartmentLabel(project.department),
        'Status': formatStatus(project.status),
        'Priority': formatPriority(project.priority),
        'Type': project.project_type || 'N/A',
        'Budget': project.budget || 0,
        'Spent': project.actual_cost || 0,
        'Remaining': (project.budget || 0) - (project.actual_cost || 0),
        'Progress %': project.progress,
        'Start Date': formatDate(project.start_date),
        'End Date': formatDate(project.end_date),
        'Active': project.is_active ? 'Yes' : 'No'
      }));

      const projectWorksheet = XLSX.utils.json_to_sheet(projectData);
      projectWorksheet['!cols'] = [
        { wch: 30 }, { wch: 50 }, { wch: 25 }, { wch: 15 }, { wch: 12 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 10 }
      ];

      XLSX.utils.book_append_sheet(workbook, projectWorksheet, 'Projects');

      const fileName = `NexaCore_ERP_Projects_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`Exported ${stats.total} projects to Excel`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
      return false;
    }
  };

  const exportToPDF = () => {
    try {
      const stats = getStatistics();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPos = 20;

      const tealColor: [number, number, number] = [0, 152, 166];
      const limeColor: [number, number, number] = [205, 220, 57];
      const navyColor: [number, number, number] = [30, 58, 95];

      doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
      doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 30, 'F');
      doc.setFillColor(limeColor[0], limeColor[1], limeColor[2]);
      doc.triangle(pageWidth - 50, 0, pageWidth - 40, 0, pageWidth, 40, 'F');

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
      doc.text('NEXACORE', 14, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text('I N N O V A T I O N S', 14, yPos);
      yPos += 8;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text('ERP Project Management Report', 14, yPos);
      yPos += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Engineering Global Innovation with Excellence', 14, yPos);
      yPos += 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Generated: ${new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 14, yPos);
      yPos += 4;
      doc.text(`Report Type: ${includeStatistics ? 'Comprehensive with Statistics' : 'Project List Only'}`, 14, yPos);
      yPos += 4;
      doc.text(`Projects: ${stats.total} | Layout: ${viewMode === 'compact' && projectsToExport.length > 1 ? 'Compact' : 'Detailed'}`, 14, yPos);
      yPos += 10;

      if (viewMode === 'compact' && projectsToExport.length > 1) {
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.rect(14, yPos - 4, pageWidth - 28, 10, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('ALL PROJECTS - GROUPED VIEW', pageWidth / 2, yPos + 2, { align: 'center' });
        yPos += 12;

        const compactTableData = projectsToExport.map(project => [
          project.title,
          getDepartmentLabel(project.department),
          formatStatus(project.status),
          formatPriority(project.priority),
          `${project.progress}%`,
          `$${(project.budget || 0).toLocaleString()}`,
          formatDate(project.end_date)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Project', 'Department', 'Status', 'Priority', 'Progress', 'Budget', 'Due Date']],
          body: compactTableData,
          theme: 'grid',
          margin: { top: 20, right: 14, bottom: 20, left: 14 },
          headStyles: {
            fillColor: tealColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8
          },
          alternateRowStyles: { fillColor: [250, 252, 254] },
          styles: {
            fontSize: 7,
            cellPadding: 2.5,
            lineColor: [200, 210, 220],
            lineWidth: 0.3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 35 },
            2: { cellWidth: 22 },
            3: { cellWidth: 18 },
            4: { cellWidth: 16 },
            5: { cellWidth: 22 },
            6: { cellWidth: 25 }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
      } else {
        projectsToExport.forEach((project, index) => {
          if (yPos > pageHeight - 100) {
            doc.addPage();
            doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
            doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 30, 'F');
            doc.setFillColor(limeColor[0], limeColor[1], limeColor[2]);
            doc.triangle(pageWidth - 50, 0, pageWidth - 40, 0, pageWidth, 40, 'F');
            yPos = 20;
          }

          doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
          doc.rect(14, yPos, pageWidth - 28, 10, 'F');
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          const projectHeader = projectsToExport.length === 1 ? 'PROJECT INFORMATION' : `PROJECT ${index + 1} OF ${projectsToExport.length}`;
          doc.text(projectHeader, pageWidth / 2, yPos + 6, { align: 'center' });
          yPos += 14;

          const detailsData = [
            [
              { content: 'PROJECT NAME', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: project.title, styles: { fontStyle: 'bold', fontSize: 11 } }
            ],
            [
              { content: 'DESCRIPTION', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: project.description || 'No description provided' }
            ],
            [
              { content: 'DEPARTMENT', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: getDepartmentLabel(project.department) }
            ],
            [
              { content: 'PROJECT TYPE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: project.project_type || 'N/A' }
            ],
            [
              { content: 'STATUS', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: formatStatus(project.status) }
            ],
            [
              { content: 'PRIORITY', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: formatPriority(project.priority) }
            ],
            [
              { content: 'PROGRESS', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `${project.progress}%` }
            ],
            [
              { content: 'BUDGET', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `$${(project.budget || 0).toLocaleString()}` }
            ],
            [
              { content: 'SPENT AMOUNT', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `$${(project.actual_cost || 0).toLocaleString()}` }
            ],
            [
              { content: 'REMAINING BUDGET', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              {
                content: `$${((project.budget || 0) - (project.actual_cost || 0)).toLocaleString()}`,
                styles: {
                  textColor: (project.budget || 0) - (project.actual_cost || 0) < 0 ? [220, 38, 38] : [21, 128, 61]
                }
              }
            ],
            [
              { content: 'START DATE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: formatDate(project.start_date) }
            ],
            [
              { content: 'END DATE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: formatDate(project.end_date) }
            ],
            [
              { content: 'ACTIVE STATUS', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: project.is_active ? 'Active' : 'Inactive' }
            ]
          ];

          autoTable(doc, {
            startY: yPos,
            body: detailsData as any,
            theme: 'grid',
            margin: { top: 20, right: 14, bottom: 20, left: 14 },
            styles: {
              fontSize: 9,
              cellPadding: 3,
              lineColor: [200, 210, 220],
              lineWidth: 0.3,
              overflow: 'linebreak'
            },
            columnStyles: {
              0: {
                cellWidth: 45,
                fontStyle: 'bold',
                textColor: [30, 58, 95],
                halign: 'right',
                valign: 'top',
                fontSize: 8
              },
              1: {
                cellWidth: pageWidth - 73,
                textColor: [40, 40, 40],
                valign: 'top'
              }
            }
          });

          yPos = (doc as any).lastAutoTable.finalY + 12;

          if (yPos > pageHeight - 30 && index < projectsToExport.length - 1) {
            doc.addPage();
            doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
            doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 30, 'F');
            doc.setFillColor(limeColor[0], limeColor[1], limeColor[2]);
            doc.triangle(pageWidth - 50, 0, pageWidth - 40, 0, pageWidth, 40, 'F');
            yPos = 20;
          }

          if (index < projectsToExport.length - 1) {
            doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
            doc.setLineWidth(0.5);
            doc.line(14, yPos, pageWidth - 14, yPos);
            yPos += 12;
          }
        });
      }

      if (includeStatistics) {
        doc.addPage();
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 30, 'F');
        doc.setFillColor(limeColor[0], limeColor[1], limeColor[2]);
        doc.triangle(pageWidth - 50, 0, pageWidth - 40, 0, pageWidth, 40, 'F');

        yPos = 20;
        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('SUMMARY STATISTICS', 16, yPos + 2);
        yPos += 11;

        const statsTableData = [
          ['Metric', 'Value'],
          ['Total Projects', stats.total.toString()],
          ['Completion Rate', `${stats.completionRate}%`],
          ['Average Progress', `${stats.averageProgress}%`],
          ['Completed', stats.completed.toString()],
          ['In Progress', stats.inProgress.toString()],
          ['Pending', stats.pending.toString()],
          ['On Hold', stats.onHold.toString()],
          ['Cancelled', stats.cancelled.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [statsTableData[0]],
          body: statsTableData.slice(1),
          theme: 'grid',
          margin: { top: 20, right: 14, bottom: 20, left: 14 },
          headStyles: {
            fillColor: tealColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          alternateRowStyles: { fillColor: [250, 252, 254] },
          styles: {
            fontSize: 8,
            cellPadding: 3
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('PRIORITY BREAKDOWN', 16, yPos + 2);
        yPos += 11;

        const priorityTableData = [
          ['Priority', 'Count'],
          ['High', stats.high.toString()],
          ['Medium', stats.medium.toString()],
          ['Low', stats.low.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [priorityTableData[0]],
          body: priorityTableData.slice(1),
          theme: 'grid',
          margin: { top: 20, right: 14, bottom: 20, left: 14 },
          headStyles: {
            fillColor: tealColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          alternateRowStyles: { fillColor: [250, 252, 254] },
          styles: {
            fontSize: 8,
            cellPadding: 3
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('FINANCIAL SUMMARY', 16, yPos + 2);
        yPos += 11;

        const financialTableData = [
          ['Metric', 'Amount'],
          ['Total Budget', `$${stats.totalBudget.toLocaleString()}`],
          ['Total Spent', `$${stats.totalSpent.toLocaleString()}`],
          ['Remaining', `$${(stats.totalBudget - stats.totalSpent).toLocaleString()}`],
          ['Budget Utilization', `${((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}%`]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [financialTableData[0]],
          body: financialTableData.slice(1),
          theme: 'grid',
          margin: { top: 20, right: 14, bottom: 20, left: 14 },
          headStyles: {
            fillColor: tealColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
          },
          alternateRowStyles: { fillColor: [250, 252, 254] },
          styles: {
            fontSize: 8,
            cellPadding: 3
          }
        });
      }

      // Add footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text('© 2025 NexaCore Innovations. All rights reserved.', 14, pageHeight - 7);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
        doc.text('www.nexacore-innovations.com', pageWidth - 14, pageHeight - 7, { align: 'right' });
        doc.setFontSize(7);
        doc.text('Accra, Ghana', 14, pageHeight - 3);
        doc.text('info@nexacore-innovations.com', pageWidth / 2, pageHeight - 3, { align: 'center' });
        doc.text('+233-50-1588-710', pageWidth - 14, pageHeight - 3, { align: 'right' });
      }

      const fileName = `NexaCore_ERP_Projects_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`Exported ${stats.total} projects to PDF`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
      return false;
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    setSelectedProjectIds(availableProjects.map(p => p.id));
  };

  const deselectAllProjects = () => {
    setSelectedProjectIds([]);
  };

  const handleExport = async () => {
    if (projectsToExport.length === 0) {
      toast.error('No projects to export');
      return;
    }

    setIsExporting(true);

    try {
      let success = false;

      switch (exportFormat) {
        case 'csv':
          success = exportToCSV();
          break;
        case 'excel':
          success = exportToExcel();
          break;
        case 'pdf':
          success = exportToPDF();
          break;
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export projects');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-blue-500" />
            Export ERP Projects Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive ERP project report with statistics and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-xs text-muted-foreground">Best for detailed analysis and manipulation</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">PDF (.pdf)</div>
                    <div className="text-xs text-muted-foreground">Professional report for stakeholders</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-xs text-muted-foreground">Simple format for spreadsheet apps</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Options</Label>

            {singleProject ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <FileDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Single Project Export</span>
                </div>
                <div className="text-xs text-blue-600">
                  Exporting: <span className="font-semibold">{singleProject.title}</span>
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Status: {formatStatus(singleProject.status)} | Priority: {formatPriority(singleProject.priority)}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-projects"
                      checked={includeAllProjects}
                      onCheckedChange={(checked) => {
                        setIncludeAllProjects(checked as boolean);
                        setSelectedProjectIds([]);
                      }}
                    />
                    <Label htmlFor="all-projects" className="text-sm cursor-pointer">
                      Use all projects ({projects.length} total)
                    </Label>
                  </div>
                  {!includeAllProjects && (
                    <div className="text-xs text-muted-foreground">
                      {filteredProjects.length} filtered
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Select Projects to Export</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllProjects}
                        className="h-6 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllProjects}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  {availableProjects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={selectedProjectIds.includes(project.id)}
                        onCheckedChange={() => toggleProjectSelection(project.id)}
                      />
                      <Label
                        htmlFor={`project-${project.id}`}
                        className="text-xs cursor-pointer flex-1 truncate"
                      >
                        {project.title}
                      </Label>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        project.priority === 'high' ? 'bg-red-100 text-red-700' :
                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {formatPriority(project.priority)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!singleProject && projectsToExport.length > 1 && exportFormat === 'pdf' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">PDF Layout</Label>
                <RadioGroup value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed" className="text-xs cursor-pointer">
                      Detailed View - Full information for each project (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="compact" />
                    <Label htmlFor="compact" className="text-xs cursor-pointer">
                      Compact View - All projects in grouped table format
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="statistics"
                checked={includeStatistics}
                onCheckedChange={(checked) => setIncludeStatistics(checked as boolean)}
              />
              <Label htmlFor="statistics" className="text-sm cursor-pointer">
                Include summary statistics and analytics
              </Label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">Export Summary</div>
            <div className="text-xs text-blue-700">
              {projectsToExport.length} project{projectsToExport.length !== 1 ? 's' : ''} will be exported
              {includeStatistics && ' with statistics'}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || projectsToExport.length === 0}>
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
