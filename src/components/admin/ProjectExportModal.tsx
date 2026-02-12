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
import { getLetterheadImage, addLetterheadToPage, LETTERHEAD } from '@/utils/pdfLetterhead';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  deadline: string;
  estimated_completion: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  budget: number;
  spent_amount: number;
  service_type: string;
  team_members: string[];
  progress: number;
  created_at: string;
  updated_at: string;
  completion_percentage: number;
  estimated_hours: number;
  actual_hours: number;
}

interface ProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  filteredProjects: Project[];
  singleProject?: Project | null;
}

export function ProjectExportModal({ isOpen, onClose, projects, filteredProjects, singleProject }: ProjectExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeAllProjects, setIncludeAllProjects] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  // Determine available projects for selection
  const availableProjects = includeAllProjects ? projects : filteredProjects;

  // If singleProject is provided, export only that project
  // Otherwise export selected projects, or all available if none selected
  const projectsToExport = singleProject
    ? [singleProject]
    : selectedProjectIds.length > 0
      ? availableProjects.filter(p => selectedProjectIds.includes(p.id))
      : availableProjects;

  // Calculate statistics
  const getStatistics = () => {
    const total = projectsToExport.length;
    const completed = projectsToExport.filter(p => p.status === 'completed').length;
    const inProgress = projectsToExport.filter(p => p.status === 'in_progress').length;
    const planning = projectsToExport.filter(p => p.status === 'planning').length;
    const onHold = projectsToExport.filter(p => p.status === 'on_hold').length;
    const review = projectsToExport.filter(p => p.status === 'review').length;
    const cancelled = projectsToExport.filter(p => p.status === 'cancelled').length;

    const urgent = projectsToExport.filter(p => p.priority === 'urgent').length;
    const high = projectsToExport.filter(p => p.priority === 'high').length;
    const medium = projectsToExport.filter(p => p.priority === 'medium').length;
    const low = projectsToExport.filter(p => p.priority === 'low').length;

    const totalBudget = projectsToExport.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projectsToExport.reduce((sum, p) => sum + (p.spent_amount || 0), 0);
    const totalEstimatedHours = projectsToExport.reduce((sum, p) => sum + (p.estimated_hours || 0), 0);
    const totalActualHours = projectsToExport.reduce((sum, p) => sum + (p.actual_hours || 0), 0);
    const averageProgress = total > 0 ? (projectsToExport.reduce((sum, p) => sum + p.completion_percentage, 0) / total).toFixed(1) : '0';

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return {
      total,
      completed,
      inProgress,
      planning,
      onHold,
      review,
      cancelled,
      urgent,
      high,
      medium,
      low,
      totalBudget,
      totalSpent,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      averageProgress
    };
  };

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'planning': 'Planning',
      'in_progress': 'In Progress',
      'on_hold': 'On Hold',
      'review': 'In Review',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const stats = getStatistics();
      let csvContent = '';

      // Add header information
      csvContent += `NexaCore Innovations - Project Report\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Projects: ${stats.total}\n\n`;

      // Add statistics if enabled
      if (includeStatistics) {
        csvContent += `PROJECT STATISTICS\n`;
        csvContent += `Completion Rate,${stats.completionRate}%\n`;
        csvContent += `Average Progress,${stats.averageProgress}%\n`;
        csvContent += `Completed,${stats.completed}\n`;
        csvContent += `In Progress,${stats.inProgress}\n`;
        csvContent += `Planning,${stats.planning}\n`;
        csvContent += `On Hold,${stats.onHold}\n`;
        csvContent += `In Review,${stats.review}\n`;
        csvContent += `Cancelled,${stats.cancelled}\n\n`;

        csvContent += `PRIORITY BREAKDOWN\n`;
        csvContent += `Urgent,${stats.urgent}\n`;
        csvContent += `High,${stats.high}\n`;
        csvContent += `Medium,${stats.medium}\n`;
        csvContent += `Low,${stats.low}\n\n`;

        csvContent += `FINANCIAL SUMMARY\n`;
        csvContent += `Total Budget,$${stats.totalBudget.toLocaleString()}\n`;
        csvContent += `Total Spent,$${stats.totalSpent.toLocaleString()}\n`;
        csvContent += `Remaining,$${(stats.totalBudget - stats.totalSpent).toLocaleString()}\n\n`;

        csvContent += `HOURS TRACKING\n`;
        csvContent += `Total Estimated Hours,${stats.totalEstimatedHours}\n`;
        csvContent += `Total Actual Hours,${stats.totalActualHours}\n`;
        csvContent += `Variance,${stats.totalActualHours - stats.totalEstimatedHours}\n\n`;
      }

      // Add project details header
      csvContent += `PROJECT DETAILS\n`;
      csvContent += `Title,Description,Client,Status,Priority,Service Type,Budget,Spent,Progress,Start Date,End Date,Deadline,Estimated Hours,Actual Hours,Team Size\n`;

      // Add project rows
      projectsToExport.forEach(project => {
        const row = [
          `"${project.title.replace(/"/g, '""')}"`,
          `"${(project.description || '').replace(/"/g, '""')}"`,
          `"${project.client_name || 'Unknown'}"`,
          formatStatus(project.status),
          formatPriority(project.priority),
          `"${project.service_type}"`,
          project.budget || 0,
          project.spent_amount || 0,
          `${project.completion_percentage}%`,
          formatDate(project.start_date),
          formatDate(project.end_date),
          formatDate(project.deadline || project.estimated_completion),
          project.estimated_hours || 0,
          project.actual_hours || 0,
          project.team_members?.length || 0
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `NexaCore_Projects_${new Date().toISOString().split('T')[0]}.csv`;

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

  // Export to Excel
  const exportToExcel = () => {
    try {
      const stats = getStatistics();
      const workbook = XLSX.utils.book_new();

      // Create statistics worksheet if enabled
      if (includeStatistics) {
        const statsData = [
          ['NexaCore Innovations - Project Report'],
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
          ['Planning', stats.planning],
          ['On Hold', stats.onHold],
          ['In Review', stats.review],
          ['Cancelled', stats.cancelled],
          [''],
          ['PRIORITY BREAKDOWN'],
          ['Urgent', stats.urgent],
          ['High', stats.high],
          ['Medium', stats.medium],
          ['Low', stats.low],
          [''],
          ['FINANCIAL SUMMARY'],
          ['Total Budget', `$${stats.totalBudget.toLocaleString()}`],
          ['Total Spent', `$${stats.totalSpent.toLocaleString()}`],
          ['Remaining', `$${(stats.totalBudget - stats.totalSpent).toLocaleString()}`],
          ['Budget Utilization', `${((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}%`],
          [''],
          ['HOURS TRACKING'],
          ['Total Estimated Hours', stats.totalEstimatedHours],
          ['Total Actual Hours', stats.totalActualHours],
          ['Variance', stats.totalActualHours - stats.totalEstimatedHours]
        ];

        const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);

        // Set column widths
        statsWorksheet['!cols'] = [
          { wch: 25 },
          { wch: 20 }
        ];

        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistics');
      }

      // Create projects worksheet
      const projectData = projectsToExport.map(project => ({
        'Title': project.title,
        'Description': project.description || '',
        'Client': project.client_name || 'Unknown',
        'Email': project.client_email || '',
        'Status': formatStatus(project.status),
        'Priority': formatPriority(project.priority),
        'Service Type': project.service_type,
        'Budget': project.budget || 0,
        'Spent': project.spent_amount || 0,
        'Remaining': (project.budget || 0) - (project.spent_amount || 0),
        'Progress %': project.completion_percentage,
        'Start Date': formatDate(project.start_date),
        'End Date': formatDate(project.end_date),
        'Deadline': formatDate(project.deadline || project.estimated_completion),
        'Estimated Hours': project.estimated_hours || 0,
        'Actual Hours': project.actual_hours || 0,
        'Team Size': project.team_members?.length || 0
      }));

      const projectWorksheet = XLSX.utils.json_to_sheet(projectData);

      // Set column widths
      projectWorksheet['!cols'] = [
        { wch: 30 }, // Title
        { wch: 50 }, // Description
        { wch: 25 }, // Client
        { wch: 30 }, // Email
        { wch: 15 }, // Status
        { wch: 12 }, // Priority
        { wch: 20 }, // Service Type
        { wch: 15 }, // Budget
        { wch: 15 }, // Spent
        { wch: 15 }, // Remaining
        { wch: 12 }, // Progress %
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 15 }, // Deadline
        { wch: 15 }, // Estimated Hours
        { wch: 15 }, // Actual Hours
        { wch: 12 }  // Team Size
      ];

      XLSX.utils.book_append_sheet(workbook, projectWorksheet, 'Projects');

      // Save file
      const fileName = `NexaCore_Projects_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`Exported ${stats.total} projects to Excel`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
      return false;
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const stats = getStatistics();
      const letterheadImg = await getLetterheadImage();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      addLetterheadToPage(doc, letterheadImg);
      let yPos = LETTERHEAD.CONTENT_TOP;

      // Define colors matching company branding
      const tealColor: [number, number, number] = [0, 152, 166]; // #0098A6
      const limeColor: [number, number, number] = [205, 220, 57]; // #CDDC39
      const navyColor: [number, number, number] = [30, 58, 95]; // #1E3A5F

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text('Project Management Report', 14, yPos);
      yPos += 6;

      // Add tagline
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Engineering Global Innovation with Excellence', 14, yPos);
      yPos += 8;

      // Add report info with styling
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

      // Choose between compact and detailed view
      if (viewMode === 'compact' && projectsToExport.length > 1) {
        // COMPACT VIEW - All projects in grouped table
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.rect(14, yPos - 4, pageWidth - 28, 10, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('ALL PROJECTS - GROUPED VIEW', pageWidth / 2, yPos + 2, { align: 'center' });
        yPos += 12;

        // Create comprehensive table with all project information
        const compactTableData = projectsToExport.map(project => [
          project.title,
          project.client_name || 'Unknown',
          project.service_type,
          formatStatus(project.status),
          formatPriority(project.priority),
          `${project.completion_percentage}%`,
          `$${(project.budget || 0).toLocaleString()}`,
          formatDate(project.deadline || project.estimated_completion)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Project', 'Client', 'Service', 'Status', 'Priority', 'Progress', 'Budget', 'Deadline']],
          body: compactTableData,
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
            0: { cellWidth: 45 },  // Project
            1: { cellWidth: 30 },  // Client
            2: { cellWidth: 28 },  // Service
            3: { cellWidth: 22 },  // Status
            4: { cellWidth: 18 },  // Priority
            5: { cellWidth: 16 },  // Progress
            6: { cellWidth: 20 },  // Budget
            7: { cellWidth: 22 }   // Deadline
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
      } else {
        // DETAILED VIEW - Individual sections for each project
        projectsToExport.forEach((project, index) => {
          // Check if we need a new page (reserve more space for content)
          if (yPos > pageHeight - LETTERHEAD.CONTENT_BOTTOM - 60) {
            doc.addPage();
            addLetterheadToPage(doc, letterheadImg);
            yPos = LETTERHEAD.CONTENT_TOP;
          }

          // Project header with number and professional styling
          doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
          doc.rect(14, yPos, pageWidth - 28, 10, 'F');
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          const projectHeader = projectsToExport.length === 1 ? 'PROJECT INFORMATION' : `PROJECT ${index + 1} OF ${projectsToExport.length}`;
          doc.text(projectHeader, pageWidth / 2, yPos + 6, { align: 'center' });
          yPos += 14;

          // Project Details Table with professional grid layout
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
              { content: 'CLIENT', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `${project.client_name || 'Unknown'} (${project.client_email || 'N/A'})` }
            ],
            [
              { content: 'SERVICE TYPE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: project.service_type }
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
              { content: `${project.completion_percentage}%` }
            ],
            [
              { content: 'BUDGET', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `$${(project.budget || 0).toLocaleString()}` }
            ],
            [
              { content: 'SPENT AMOUNT', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `$${(project.spent_amount || 0).toLocaleString()}` }
            ],
            [
              { content: 'REMAINING BUDGET', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              {
                content: `$${((project.budget || 0) - (project.spent_amount || 0)).toLocaleString()}`,
                styles: {
                  textColor: (project.budget || 0) - (project.spent_amount || 0) < 0 ? [220, 38, 38] : [21, 128, 61]
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
              { content: 'DEADLINE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: formatDate(project.deadline || project.estimated_completion) }
            ],
            [
              { content: 'ESTIMATED HOURS', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `${project.estimated_hours || 0} hours` }
            ],
            [
              { content: 'ACTUAL HOURS', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `${project.actual_hours || 0} hours` }
            ],
            [
              { content: 'HOURS VARIANCE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              {
                content: `${(project.actual_hours || 0) - (project.estimated_hours || 0)} hours`,
                styles: {
                  textColor: (project.actual_hours || 0) > (project.estimated_hours || 0) ? [220, 38, 38] : [21, 128, 61]
                }
              }
            ],
            [
              { content: 'TEAM SIZE', styles: { fontStyle: 'bold', fillColor: [240, 245, 248] } },
              { content: `${project.team_members?.length || 0} members` }
            ]
          ];

          autoTable(doc, {
            startY: yPos,
            body: detailsData as any,
            theme: 'grid',
            margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
            },
            didParseCell: function(data) {
              // Ensure text wraps properly in description cells
              if (data.row.index === 1 && data.column.index === 1) {
                data.cell.styles.cellPadding = { top: 3, right: 3, bottom: 3, left: 3 };
              }
            },
            willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
          });

          yPos = (doc as any).lastAutoTable.finalY + 12;

          // Ensure we're not too close to bottom before adding separator
          if (yPos > pageHeight - LETTERHEAD.CONTENT_BOTTOM - 60 && index < projectsToExport.length - 1) {
            doc.addPage();
            addLetterheadToPage(doc, letterheadImg);
            yPos = LETTERHEAD.CONTENT_TOP;
          }

          // Add separator line between projects (except for the last project)
          if (index < projectsToExport.length - 1) {
            doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
            doc.setLineWidth(0.5);
            doc.line(14, yPos, pageWidth - 14, yPos);
            yPos += 12;
          }
        });
      }

      // Add statistics section AFTER projects if enabled
      if (includeStatistics) {
        // Add new page for statistics
        doc.addPage();
        addLetterheadToPage(doc, letterheadImg);

        yPos = LETTERHEAD.CONTENT_TOP;
        // Summary section with background
        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('SUMMARY STATISTICS', 16, yPos + 2);
        yPos += 11;

        // Statistics table with company colors
        const statsTableData = [
          ['Metric', 'Value'],
          ['Total Projects', stats.total.toString()],
          ['Completion Rate', `${stats.completionRate}%`],
          ['Average Progress', `${stats.averageProgress}%`],
          ['Completed', stats.completed.toString()],
          ['In Progress', stats.inProgress.toString()],
          ['Planning', stats.planning.toString()],
          ['On Hold', stats.onHold.toString()],
          ['In Review', stats.review.toString()],
          ['Cancelled', stats.cancelled.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [statsTableData[0]],
          body: statsTableData.slice(1),
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Priority breakdown section
        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('PRIORITY BREAKDOWN', 16, yPos + 2);
        yPos += 11;

        const priorityTableData = [
          ['Priority', 'Count'],
          ['Urgent', stats.urgent.toString()],
          ['High', stats.high.toString()],
          ['Medium', stats.medium.toString()],
          ['Low', stats.low.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [priorityTableData[0]],
          body: priorityTableData.slice(1),
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Financial summary section
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
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Hours tracking section
        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('HOURS TRACKING', 16, yPos + 2);
        yPos += 11;

        const hoursTableData = [
          ['Metric', 'Hours'],
          ['Estimated Hours', stats.totalEstimatedHours.toFixed(1)],
          ['Actual Hours', stats.totalActualHours.toFixed(1)],
          ['Variance', (stats.totalActualHours - stats.totalEstimatedHours).toFixed(1)]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [hoursTableData[0]],
          body: hoursTableData.slice(1),
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add a quick reference summary table only if exporting multiple projects
      if (projectsToExport.length > 1) {
        // Check if we need a new page for the summary
        if (yPos > pageHeight - LETTERHEAD.CONTENT_BOTTOM - 60) {
          doc.addPage();
          addLetterheadToPage(doc, letterheadImg);
          yPos = LETTERHEAD.CONTENT_TOP;
        }

        doc.setFillColor(245, 250, 252);
        doc.rect(14, yPos - 4, pageWidth - 28, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('QUICK REFERENCE SUMMARY', 16, yPos + 2);
        yPos += 11;

        const projectTableData = projectsToExport.map(project => [
          project.title.substring(0, 35) + (project.title.length > 35 ? '...' : ''),
          project.client_name?.substring(0, 25) || 'Unknown',
          formatStatus(project.status),
          formatPriority(project.priority),
          `${project.completion_percentage}%`,
          formatDate(project.deadline || project.estimated_completion)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Project', 'Client', 'Status', 'Priority', 'Progress', 'Deadline']],
          body: projectTableData,
          theme: 'striped',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: 14, bottom: LETTERHEAD.CONTENT_BOTTOM, left: 14 },
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
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 50 },  // Project
            1: { cellWidth: 35 },  // Client
            2: { cellWidth: 25 },  // Status
            3: { cellWidth: 20 },  // Priority
            4: { cellWidth: 20 },  // Progress
            5: { cellWidth: 28 }   // Deadline
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });
      }

      // Save file
      const fileName = `NexaCore_Projects_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`Exported ${stats.total} projects to PDF`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
      return false;
    }
  };

  // Project selection helpers
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

  // Handle export
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
          success = await exportToPDF();
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
            Export Projects Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive project report with statistics and details
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
                        setSelectedProjectIds([]); // Reset selection when toggling
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

                {/* Project Selection */}
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
                        project.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
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

            {/* View Mode for PDF (only for multiple projects) */}
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
