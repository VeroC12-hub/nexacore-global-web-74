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
import { getLetterheadImage, addLetterheadToPage, newLetterheadPage, LETTERHEAD } from '@/utils/pdfLetterhead';
import { parseContent, renderContentToPDF, NAVY } from '@/utils/pdfContentRenderer';

interface ERPTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  project_id: string;
  project_title?: string;
  due_date: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

interface TaskExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ERPTask[];
  filteredTasks: ERPTask[];
  singleTask?: ERPTask | null;
}

export function TaskExportModal({ isOpen, onClose, tasks, filteredTasks, singleTask }: TaskExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeAllTasks, setIncludeAllTasks] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  // Determine available tasks for selection
  const availableTasks = includeAllTasks ? tasks : filteredTasks;

  // If singleTask is provided, export only that task
  // Otherwise export selected tasks, or all available if none selected
  const tasksToExport = singleTask
    ? [singleTask]
    : selectedTaskIds.length > 0
      ? availableTasks.filter(t => selectedTaskIds.includes(t.id))
      : availableTasks;

  // Calculate statistics
  const getStatistics = () => {
    const total = tasksToExport.length;
    const completed = tasksToExport.filter(t => t.status === 'completed').length;
    const inProgress = tasksToExport.filter(t => t.status === 'in_progress').length;
    const todo = tasksToExport.filter(t => t.status === 'todo').length;
    const review = tasksToExport.filter(t => t.status === 'review').length;

    const urgent = tasksToExport.filter(t => t.priority === 'urgent').length;
    const high = tasksToExport.filter(t => t.priority === 'high').length;
    const medium = tasksToExport.filter(t => t.priority === 'medium').length;
    const low = tasksToExport.filter(t => t.priority === 'low').length;

    const totalEstimatedHours = tasksToExport.reduce((sum, t) => sum + t.estimated_hours, 0);
    const totalActualHours = tasksToExport.reduce((sum, t) => sum + t.actual_hours, 0);

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return {
      total,
      completed,
      inProgress,
      todo,
      review,
      urgent,
      high,
      medium,
      low,
      totalEstimatedHours,
      totalActualHours,
      completionRate
    };
  };

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'review': 'In Review',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const stats = getStatistics();
      let csvContent = '';

      // Add header information
      csvContent += `NexaCore Innovations - Task Report\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Total Tasks: ${stats.total}\n\n`;

      // Add statistics if enabled
      if (includeStatistics) {
        csvContent += `TASK STATISTICS\n`;
        csvContent += `Completion Rate,${stats.completionRate}%\n`;
        csvContent += `Completed,${stats.completed}\n`;
        csvContent += `In Progress,${stats.inProgress}\n`;
        csvContent += `To Do,${stats.todo}\n`;
        csvContent += `In Review,${stats.review}\n\n`;

        csvContent += `PRIORITY BREAKDOWN\n`;
        csvContent += `Urgent,${stats.urgent}\n`;
        csvContent += `High,${stats.high}\n`;
        csvContent += `Medium,${stats.medium}\n`;
        csvContent += `Low,${stats.low}\n\n`;

        csvContent += `HOURS TRACKING\n`;
        csvContent += `Total Estimated Hours,${stats.totalEstimatedHours}\n`;
        csvContent += `Total Actual Hours,${stats.totalActualHours}\n`;
        csvContent += `Variance,${stats.totalActualHours - stats.totalEstimatedHours}\n\n`;
      }

      // Add task details header
      csvContent += `TASK DETAILS\n`;
      csvContent += `Title,Description,Status,Priority,Assignee,Project,Due Date,Estimated Hours,Actual Hours,Created Date\n`;

      // Add task rows
      tasksToExport.forEach(task => {
        const row = [
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          formatStatus(task.status),
          formatPriority(task.priority),
          `"${task.assignee || 'Unassigned'}"`,
          `"${task.project_title || 'N/A'}"`,
          formatDate(task.due_date),
          task.estimated_hours,
          task.actual_hours,
          formatDate(task.created_at)
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `NexaCore_Tasks_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${stats.total} tasks to CSV`);
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
          ['NexaCore Innovations - Task Report'],
          ['Generated:', new Date().toLocaleString()],
          [''],
          ['SUMMARY STATISTICS'],
          ['Total Tasks', stats.total],
          ['Completion Rate', `${stats.completionRate}%`],
          [''],
          ['STATUS BREAKDOWN'],
          ['Completed', stats.completed],
          ['In Progress', stats.inProgress],
          ['To Do', stats.todo],
          ['In Review', stats.review],
          [''],
          ['PRIORITY BREAKDOWN'],
          ['Urgent', stats.urgent],
          ['High', stats.high],
          ['Medium', stats.medium],
          ['Low', stats.low],
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

      // Create tasks worksheet
      const taskData = tasksToExport.map(task => ({
        'Title': task.title,
        'Description': task.description,
        'Status': formatStatus(task.status),
        'Priority': formatPriority(task.priority),
        'Assignee': task.assignee || 'Unassigned',
        'Project': task.project_title || 'N/A',
        'Due Date': formatDate(task.due_date),
        'Estimated Hours': task.estimated_hours,
        'Actual Hours': task.actual_hours,
        'Variance': task.actual_hours - task.estimated_hours,
        'Created Date': formatDate(task.created_at)
      }));

      const taskWorksheet = XLSX.utils.json_to_sheet(taskData);

      // Set column widths
      taskWorksheet['!cols'] = [
        { wch: 30 }, // Title
        { wch: 50 }, // Description
        { wch: 15 }, // Status
        { wch: 12 }, // Priority
        { wch: 20 }, // Assignee
        { wch: 25 }, // Project
        { wch: 15 }, // Due Date
        { wch: 15 }, // Estimated Hours
        { wch: 15 }, // Actual Hours
        { wch: 12 }, // Variance
        { wch: 15 }  // Created Date
      ];

      XLSX.utils.book_append_sheet(workbook, taskWorksheet, 'Tasks');

      // Save file
      const fileName = `NexaCore_Tasks_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(`Exported ${stats.total} tasks to Excel`);
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
      let yPos = LETTERHEAD.CONTENT_TOP;

      // Define colors matching company branding
      const tealColor: [number, number, number] = [0, 152, 166]; // #0098A6
      const navyColor: [number, number, number] = [30, 58, 95]; // #1E3A5F

      // Add letterhead to cover page
      addLetterheadToPage(doc, letterheadImg);

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.text('Task Management Report', LETTERHEAD.MARGIN_LEFT, yPos);
      yPos += 6;

      // Add tagline
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Engineering Global Innovation with Excellence', LETTERHEAD.MARGIN_LEFT, yPos);
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
      })}`, LETTERHEAD.MARGIN_LEFT, yPos);
      yPos += 4;
      doc.text(`Report Type: ${includeStatistics ? 'Comprehensive with Statistics' : 'Task List Only'}`, LETTERHEAD.MARGIN_LEFT, yPos);
      yPos += 4;
      doc.text(`Tasks: ${stats.total} | Layout: ${viewMode === 'compact' && tasksToExport.length > 1 ? 'Compact' : 'Detailed'}`, LETTERHEAD.MARGIN_LEFT, yPos);
      yPos += 10;

      // Choose between compact and detailed view
      if (viewMode === 'compact' && tasksToExport.length > 1) {
        // COMPACT VIEW - All tasks in grouped table
        doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
        doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 4, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 10, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('ALL TASKS - GROUPED VIEW', pageWidth / 2, yPos + 2, { align: 'center' });
        yPos += 12;

        // Create comprehensive table with all task information
        const compactTableData = tasksToExport.map(task => [
          task.title,
          task.description || 'No description',
          task.assignee || 'Unassigned',
          task.project_title || 'N/A',
          formatStatus(task.status),
          formatPriority(task.priority),
          formatDate(task.due_date),
          task.estimated_hours.toString(),
          task.actual_hours.toString()
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Task', 'Description', 'Assignee', 'Project', 'Status', 'Priority', 'Due Date', 'Est.', 'Act.']],
          body: compactTableData,
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
          headStyles: {
            fillColor: tealColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8
          },
          alternateRowStyles: { fillColor: [250, 252, 254] },
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            lineColor: [200, 210, 220],
            lineWidth: 0.3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 32 },  // Task
            1: { cellWidth: 40 },  // Description
            2: { cellWidth: 18 },  // Assignee
            3: { cellWidth: 18 },  // Project
            4: { cellWidth: 14 },  // Status
            5: { cellWidth: 12 },  // Priority
            6: { cellWidth: 18 },  // Due Date
            7: { cellWidth: 11 },  // Est.
            8: { cellWidth: 11 }   // Act.
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
      } else {
        // DETAILED VIEW - Individual sections for each task
        tasksToExport.forEach((task, index) => {
          // Start each task on a new page (except the first which uses the cover page)
          if (index > 0) {
            yPos = newLetterheadPage(doc, letterheadImg);
          }

          // ── Task header banner ──
          doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
          doc.rect(LETTERHEAD.MARGIN_LEFT, yPos, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 10, 'F');
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          const taskHeader = tasksToExport.length === 1 ? 'TASK INFORMATION' : `TASK ${index + 1} OF ${tasksToExport.length}`;
          doc.text(taskHeader, pageWidth / 2, yPos + 6, { align: 'center' });
          yPos += 14;

          // ── Task title (standalone, prominent) ──
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
          const titleLines = doc.splitTextToSize(task.title, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT);
          doc.text(titleLines, LETTERHEAD.MARGIN_LEFT, yPos);
          yPos += titleLines.length * 5.5 + 4;

          // ── Metadata table (compact, NO description) ──
          const labelW = 35;
          const valW = (pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT - labelW * 2) / 2;
          const metadataRows = [
            [
              { content: 'ASSIGNED TO', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: task.assignee || 'Unassigned' },
              { content: 'PROJECT', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: task.project_title || 'N/A' },
            ],
            [
              { content: 'STATUS', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: formatStatus(task.status) },
              { content: 'PRIORITY', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: formatPriority(task.priority) },
            ],
            [
              { content: 'DUE DATE', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: formatDate(task.due_date) },
              { content: 'CREATED', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: formatDate(task.created_at) },
            ],
            [
              { content: 'ESTIMATED', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: task.estimated_hours + ' hrs' },
              { content: 'ACTUAL', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              { content: task.actual_hours + ' hrs' },
            ],
            [
              { content: 'VARIANCE', styles: { fontStyle: 'bold' as const, fillColor: [240, 245, 248] } },
              {
                content: `${task.actual_hours - task.estimated_hours} hrs`,
                styles: {
                  textColor: task.actual_hours > task.estimated_hours ? [220, 38, 38] as [number, number, number] : [21, 128, 61] as [number, number, number],
                  fontStyle: 'bold' as const,
                },
              },
              { content: '', styles: { fillColor: [255, 255, 255] } },
              { content: '' },
            ],
          ];

          autoTable(doc, {
            startY: yPos,
            body: metadataRows as any,
            theme: 'grid',
            margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
            styles: {
              fontSize: 8.5,
              cellPadding: 2.5,
              lineColor: [210, 218, 225],
              lineWidth: 0.25,
            },
            columnStyles: {
              0: { cellWidth: labelW, fontStyle: 'bold', textColor: NAVY, halign: 'right', fontSize: 7.5 },
              1: { cellWidth: valW, textColor: [40, 40, 40] },
              2: { cellWidth: labelW, fontStyle: 'bold', textColor: NAVY, halign: 'right', fontSize: 7.5 },
              3: { cellWidth: valW, textColor: [40, 40, 40] },
            },
            willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); },
          });

          yPos = (doc as any).lastAutoTable.finalY + 6;

          // ── Description: parse and render with proper formatting ──
          if (task.description && task.description.trim()) {
            // Section header for description
            if (yPos > pageHeight - LETTERHEAD.CONTENT_BOTTOM - 20) {
              yPos = newLetterheadPage(doc, letterheadImg);
            }
            doc.setFillColor(245, 250, 252);
            doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 2, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 8, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
            doc.text('DESCRIPTION', LETTERHEAD.MARGIN_LEFT + 2, yPos + 3);
            yPos += 10;

            // Parse description into structured blocks and render
            const blocks = parseContent(task.description);
            yPos = renderContentToPDF(doc, blocks, yPos, letterheadImg);
          }

          yPos += 6;
        });
      }

      // Add statistics section AFTER tasks if enabled
      if (includeStatistics) {
        // Add new page for statistics
        doc.addPage();
        addLetterheadToPage(doc, letterheadImg);

        yPos = LETTERHEAD.CONTENT_TOP;
        // Summary section with background
        doc.setFillColor(245, 250, 252);
        doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 4, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('SUMMARY STATISTICS', LETTERHEAD.MARGIN_LEFT, yPos + 2);
        yPos += 11;

        // Statistics table with company colors
        const statsTableData = [
          ['Metric', 'Value'],
          ['Completion Rate', `${stats.completionRate}%`],
          ['Completed Tasks', stats.completed.toString()],
          ['In Progress', stats.inProgress.toString()],
          ['To Do', stats.todo.toString()],
          ['In Review', stats.review.toString()]
        ];

        autoTable(doc, {
          startY: yPos,
          head: [statsTableData[0]],
          body: statsTableData.slice(1),
          theme: 'grid',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
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
        doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 4, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('PRIORITY BREAKDOWN', LETTERHEAD.MARGIN_LEFT, yPos + 2);
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
          margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
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
        doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 4, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('HOURS TRACKING', LETTERHEAD.MARGIN_LEFT, yPos + 2);
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
          margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
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

      // Add a quick reference summary table only if exporting multiple tasks
      if (tasksToExport.length > 1) {
        // Check if we need a new page for the summary
        if (yPos > pageHeight - LETTERHEAD.CONTENT_BOTTOM - 80) {
          doc.addPage();
          addLetterheadToPage(doc, letterheadImg);
          yPos = LETTERHEAD.CONTENT_TOP;
        }

        doc.setFillColor(245, 250, 252);
        doc.rect(LETTERHEAD.MARGIN_LEFT, yPos - 4, pageWidth - LETTERHEAD.MARGIN_LEFT - LETTERHEAD.MARGIN_RIGHT, 9, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
        doc.text('QUICK REFERENCE SUMMARY', LETTERHEAD.MARGIN_LEFT, yPos + 2);
        yPos += 11;

        const taskTableData = tasksToExport.map(task => [
          task.title.substring(0, 35) + (task.title.length > 35 ? '...' : ''),
          task.project_title?.substring(0, 25) || 'N/A',
          task.assignee?.substring(0, 25) || 'Unassigned',
          formatStatus(task.status),
          formatPriority(task.priority),
          formatDate(task.due_date)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Task', 'Project', 'Assignee', 'Status', 'Priority', 'Due Date']],
          body: taskTableData,
          theme: 'striped',
          margin: { top: LETTERHEAD.CONTENT_TOP, right: LETTERHEAD.MARGIN_RIGHT, bottom: LETTERHEAD.CONTENT_BOTTOM, left: LETTERHEAD.MARGIN_LEFT },
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
            0: { cellWidth: 50 },  // Task
            1: { cellWidth: 28 },  // Project
            2: { cellWidth: 28 },  // Assignee
            3: { cellWidth: 20 },  // Status
            4: { cellWidth: 18 },  // Priority
            5: { cellWidth: 30 }   // Due Date
          },
          willDrawPage: () => { addLetterheadToPage(doc, letterheadImg); }
        });
      }

      // Save file
      const fileName = `NexaCore_Tasks_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`Exported ${stats.total} tasks to PDF`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
      return false;
    }
  };

  // Task selection helpers
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    setSelectedTaskIds(availableTasks.map(t => t.id));
  };

  const deselectAllTasks = () => {
    setSelectedTaskIds([]);
  };

  // Handle export
  const handleExport = async () => {
    if (tasksToExport.length === 0) {
      toast.error('No tasks to export');
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
      toast.error('Failed to export tasks');
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
            Export Tasks Report
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive task report for your supervisor
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
                    <div className="text-xs text-muted-foreground">Professional report for supervisors</div>
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

            {singleTask ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <FileDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Single Task Export</span>
                </div>
                <div className="text-xs text-blue-600">
                  Exporting: <span className="font-semibold">{singleTask.title}</span>
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Status: {formatStatus(singleTask.status)} | Priority: {formatPriority(singleTask.priority)}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-tasks"
                      checked={includeAllTasks}
                      onCheckedChange={(checked) => {
                        setIncludeAllTasks(checked as boolean);
                        setSelectedTaskIds([]); // Reset selection when toggling
                      }}
                    />
                    <Label htmlFor="all-tasks" className="text-sm cursor-pointer">
                      Use all tasks ({tasks.length} total)
                    </Label>
                  </div>
                  {!includeAllTasks && (
                    <div className="text-xs text-muted-foreground">
                      {filteredTasks.length} filtered
                    </div>
                  )}
                </div>

                {/* Task Selection */}
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Select Tasks to Export</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllTasks}
                        className="h-6 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllTasks}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  {availableTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                      />
                      <Label
                        htmlFor={`task-${task.id}`}
                        className="text-xs cursor-pointer flex-1 truncate"
                      >
                        {task.title}
                      </Label>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* View Mode for PDF (only for multiple tasks) */}
            {!singleTask && tasksToExport.length > 1 && exportFormat === 'pdf' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">PDF Layout</Label>
                <RadioGroup value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed" className="text-xs cursor-pointer">
                      Detailed View - Full information for each task (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="compact" />
                    <Label htmlFor="compact" className="text-xs cursor-pointer">
                      Compact View - All tasks in grouped table format
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
              {tasksToExport.length} task{tasksToExport.length !== 1 ? 's' : ''} will be exported
              {includeStatistics && ' with statistics'}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || tasksToExport.length === 0}>
            {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
