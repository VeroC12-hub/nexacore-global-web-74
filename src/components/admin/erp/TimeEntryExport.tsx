import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  user_name: string;
  project_title: string;
  task_title?: string;
  description: string;
  date?: string;
  created_at: string;
  hours: number;
  rate: number;
  billable: boolean;
  status: string;
}

interface TimeEntryExportProps {
  timeEntries: TimeEntry[];
  projects: Array<{ id: string; title: string }>;
  users: Array<{ id: string; name: string }>;
}

export function TimeEntryExport({ timeEntries, projects, users }: TimeEntryExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    project: 'all',
    user: 'all',
    billableOnly: false,
    approvedOnly: true,
    groupByProject: true
  });

  const exportToCSV = () => {
    try {
      // Filter entries based on criteria
      let filtered = timeEntries.filter(entry => {
        const entryDate = entry.date || entry.created_at.split('T')[0];

        if (filters.startDate && entryDate < filters.startDate) return false;
        if (filters.endDate && entryDate > filters.endDate) return false;
        if (filters.project !== 'all' && entry.project_title !== filters.project) return false;
        if (filters.user !== 'all' && entry.user_name !== filters.user) return false;
        if (filters.billableOnly && !entry.billable) return false;
        if (filters.approvedOnly && entry.status !== 'approved') return false;

        return true;
      });

      if (filtered.length === 0) {
        toast.error('No time entries match the selected filters');
        return;
      }

      // Generate CSV content
      let csvContent = '';

      if (filters.groupByProject) {
        // Group by project for client billing
        const byProject = filtered.reduce((acc, entry) => {
          if (!acc[entry.project_title]) {
            acc[entry.project_title] = [];
          }
          acc[entry.project_title].push(entry);
          return acc;
        }, {} as Record<string, TimeEntry[]>);

        Object.entries(byProject).forEach(([projectTitle, entries]) => {
          csvContent += `\n"PROJECT: ${projectTitle}"\n`;
          csvContent += '"Date","User","Task","Description","Hours","Rate","Amount","Status"\n';

          let projectTotal = 0;
          let projectHours = 0;

          entries.forEach(entry => {
            const amount = entry.hours * entry.rate;
            projectTotal += amount;
            projectHours += entry.hours;

            csvContent += `"${entry.date || entry.created_at.split('T')[0]}","${entry.user_name}","${entry.task_title || 'N/A'}","${entry.description.replace(/"/g, '""')}",${entry.hours},${entry.rate},${amount.toFixed(2)},"${entry.status}"\n`;
          });

          csvContent += `\n"SUBTOTAL:","","","",${projectHours.toFixed(2)},"","$${projectTotal.toFixed(2)}",""\n`;
        });

        // Grand total
        const grandTotal = filtered.reduce((sum, e) => sum + (e.hours * e.rate), 0);
        const grandHours = filtered.reduce((sum, e) => sum + e.hours, 0);
        csvContent += `\n"GRAND TOTAL:","","","",${grandHours.toFixed(2)},"","$${grandTotal.toFixed(2)}",""\n`;

      } else {
        // Simple chronological export
        csvContent = '"Date","User","Project","Task","Description","Hours","Rate","Amount","Billable","Status"\n';

        filtered.forEach(entry => {
          const amount = entry.hours * entry.rate;
          csvContent += `"${entry.date || entry.created_at.split('T')[0]}","${entry.user_name}","${entry.project_title}","${entry.task_title || 'N/A'}","${entry.description.replace(/"/g, '""')}",${entry.hours},${entry.rate},${amount.toFixed(2)},"${entry.billable ? 'Yes' : 'No'}","${entry.status}"\n`;
        });

        // Totals
        const totalHours = filtered.reduce((sum, e) => sum + e.hours, 0);
        const totalAmount = filtered.reduce((sum, e) => sum + (e.hours * e.rate), 0);
        csvContent += `\n"TOTALS:","","","","",${totalHours.toFixed(2)},"","$${totalAmount.toFixed(2)}","",""\n`;
      }

      // Download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const filename = `time_entries_${filters.startDate || 'all'}_to_${filters.endDate || 'all'}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filtered.length} time entries to ${filename}`);
      setIsOpen(false);

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export time entries');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Export Time Entries
          </DialogTitle>
          <DialogDescription>
            Export time entries to CSV for billing, payroll, or reporting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={filters.project}
                onValueChange={(value) => setFilters({ ...filters, project: value })}
              >
                <SelectTrigger id="project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.title}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select
                value={filters.user}
                onValueChange={(value) => setFilters({ ...filters, user: value })}
              >
                <SelectTrigger id="user">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="billableOnly"
                checked={filters.billableOnly}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, billableOnly: checked as boolean })
                }
              />
              <Label htmlFor="billableOnly" className="cursor-pointer">
                Billable entries only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="approvedOnly"
                checked={filters.approvedOnly}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, approvedOnly: checked as boolean })
                }
              />
              <Label htmlFor="approvedOnly" className="cursor-pointer">
                Approved entries only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="groupByProject"
                checked={filters.groupByProject}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, groupByProject: checked as boolean })
                }
              />
              <Label htmlFor="groupByProject" className="cursor-pointer">
                Group by project (for client invoicing)
              </Label>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
