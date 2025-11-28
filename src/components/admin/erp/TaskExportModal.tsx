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
}

export function TaskExportModal({ isOpen, onClose, tasks, filteredTasks }: TaskExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [includeAllTasks, setIncludeAllTasks] = useState(false);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const tasksToExport = includeAllTasks ? tasks : filteredTasks;

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
          `"${task.description.replace(/"/g, '""')}"`,
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
  const exportToPDF = () => {
    try {
      const stats = getStatistics();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20;

      // Add header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('NexaCore Innovations', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setFontSize(14);
      doc.text('Task Management Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Add report info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Tasks: ${stats.total}`, 14, yPos);
      yPos += 10;

      // Add statistics if enabled
      if (includeStatistics) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Statistics', 14, yPos);
        yPos += 8;

        // Statistics table
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
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Priority breakdown
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Priority Breakdown', 14, yPos);
        yPos += 8;

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
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Hours tracking
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Hours Tracking', 14, yPos);
        yPos += 8;

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
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 }
        });

        // Add new page for tasks
        doc.addPage();
        yPos = 20;
      }

      // Add tasks table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Details', 14, yPos);
      yPos += 8;

      const taskTableData = tasksToExport.map(task => [
        task.title.substring(0, 30) + (task.title.length > 30 ? '...' : ''),
        formatStatus(task.status),
        formatPriority(task.priority),
        task.assignee || 'Unassigned',
        formatDate(task.due_date),
        task.estimated_hours.toString(),
        task.actual_hours.toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Est. Hrs', 'Actual Hrs']],
        body: taskTableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 25 },
          5: { cellWidth: 18 },
          6: { cellWidth: 18 }
        }
      });

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          'NexaCore Innovations - Confidential',
          14,
          doc.internal.pageSize.height - 10
        );
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
          success = exportToPDF();
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
      <DialogContent className="sm:max-w-md">
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-tasks"
                checked={includeAllTasks}
                onCheckedChange={(checked) => setIncludeAllTasks(checked as boolean)}
              />
              <Label htmlFor="all-tasks" className="text-sm cursor-pointer">
                Export all tasks ({tasks.length} total)
              </Label>
            </div>

            {!includeAllTasks && (
              <div className="text-xs text-muted-foreground ml-6">
                Currently exporting {filteredTasks.length} filtered task{filteredTasks.length !== 1 ? 's' : ''}
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
