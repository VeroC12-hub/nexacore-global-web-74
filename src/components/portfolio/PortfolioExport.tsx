import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Image, 
  Share2, 
  Mail, 
  Link2, 
  Printer,
  FileDown,
  Presentation,
  Globe,
  Settings,
  Eye,
  Copy,
  Check,
  X,
  Filter,
  Calendar,
  User,
  Building2,
  Tag,
  Star
} from 'lucide-react';
import { PortfolioFilters } from './AdvancedPortfolioSearch';

interface PortfolioExportProps {
  filters: PortfolioFilters;
  projectCount: number;
  onClose: () => void;
  className?: string;
}

export default function PortfolioExport({ 
  filters, 
  projectCount, 
  onClose, 
  className = "" 
}: PortfolioExportProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'powerpoint' | 'web' | 'excel'>('pdf');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [includeTeamInfo, setIncludeTeamInfo] = useState(true);
  const [customTitle, setCustomTitle] = useState('NexaCore Portfolio Showcase');
  const [customDescription, setCustomDescription] = useState('Professional portfolio showcase featuring our latest projects and innovations.');
  const [shareMethod, setShareMethod] = useState<'link' | 'email' | 'download'>('download');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [exporting, setExporting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);

  const getActiveFilters = () => {
    const active = [];
    if (filters.searchTerm) active.push(`Search: "${filters.searchTerm}"`);
    if (filters.services.length) active.push(`Services: ${filters.services.join(', ')}`);
    if (filters.tags.length) active.push(`Tags: ${filters.tags.join(', ')}`);
    if (filters.dateRange !== 'all') active.push(`Date: ${filters.dateRange}`);
    if (filters.featuredOnly) active.push('Featured only');
    if (filters.showClientName) active.push('Client names visible');
    if (filters.fileTypes.length) active.push(`File types: ${filters.fileTypes.join(', ')}`);
    return active;
  };

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    return `${baseUrl}/portfolio/advanced?filters=${encodedFilters}&view=public`;
  };

  const handleCopyUrl = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        format: exportFormat,
        filters,
        options: {
          includeImages,
          includeMetrics,
          includeFiles,
          includeTeamInfo,
        },
        metadata: {
          title: customTitle,
          description: customDescription,
          exportDate: new Date().toISOString(),
          projectCount
        }
      };

      // In a real implementation, this would generate and download the file
      console.log('Export data:', exportData);
      
      // Simulate file download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-export-${Date.now()}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (shareMethod === 'link') {
      handleCopyUrl();
    } else if (shareMethod === 'email') {
      const url = generateShareUrl();
      const subject = encodeURIComponent(customTitle);
      const body = encodeURIComponent(
        `${customDescription}\n\nView the portfolio: ${url}\n\nFilters applied: ${getActiveFilters().join(', ')}`
      );
      window.open(`mailto:${emailRecipients}?subject=${subject}&body=${body}`);
    } else {
      await handleExport();
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'powerpoint': return <Presentation className="h-5 w-5" />;
      case 'web': return <Globe className="h-5 w-5" />;
      case 'excel': return <FileDown className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'pdf': return 'Professional PDF document with project summaries and images';
      case 'powerpoint': return 'PowerPoint presentation ready for meetings and proposals';
      case 'web': return 'Interactive web page that can be shared via link';
      case 'excel': return 'Spreadsheet with detailed project data and metrics';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Export Portfolio</CardTitle>
            <p className="text-gray-600 mt-1">
              Export {projectCount} projects with current filters applied
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Active Filters Summary */}
          {getActiveFilters().length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Filter className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-semibold text-blue-900">Active Filters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getActiveFilters().map((filter, index) => (
                  <Badge key={index} variant="outline" className="text-blue-800 border-blue-300">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Export Format</Label>
                <p className="text-sm text-gray-600 mb-3">Choose how you want to export your portfolio</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'pdf', label: 'PDF Document', icon: FileText },
                  { value: 'powerpoint', label: 'PowerPoint Presentation', icon: Presentation },
                  { value: 'web', label: 'Web Page', icon: Globe },
                  { value: 'excel', label: 'Excel Spreadsheet', icon: FileDown }
                ].map((format) => (
                  <div 
                    key={format.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      exportFormat === format.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat(format.value as any)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${
                        exportFormat === format.value ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <format.icon className={`h-5 w-5 ${
                          exportFormat === format.value ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-gray-600">
                          {getFormatDescription(format.value)}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        exportFormat === format.value 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {exportFormat === format.value && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Export Options</Label>
                <p className="text-sm text-gray-600 mb-3">Customize what to include in your export</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeImages" 
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked === true)}
                  />
                  <Label htmlFor="includeImages" className="flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Include project images
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeMetrics" 
                    checked={includeMetrics}
                    onCheckedChange={(checked) => setIncludeMetrics(checked === true)}
                  />
                  <Label htmlFor="includeMetrics" className="flex items-center">
                    <Presentation className="h-4 w-4 mr-2" />
                    Include project metrics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeFiles" 
                    checked={includeFiles}
                    onCheckedChange={(checked) => setIncludeFiles(checked === true)}
                  />
                  <Label htmlFor="includeFiles" className="flex items-center">
                    <FileDown className="h-4 w-4 mr-2" />
                    Include downloadable files
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTeamInfo" 
                    checked={includeTeamInfo}
                    onCheckedChange={(checked) => setIncludeTeamInfo(checked === true)}
                  />
                  <Label htmlFor="includeTeamInfo" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Include team information
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Customization */}
              <div className="space-y-3">
                <Label className="font-medium">Customization</Label>
                
                <div>
                  <Label htmlFor="customTitle" className="text-sm">Title</Label>
                  <Input
                    id="customTitle"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="customDescription" className="text-sm">Description</Label>
                  <Textarea
                    id="customDescription"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="border-t pt-6">
            <Label className="text-base font-semibold">Share Method</Label>
            <p className="text-sm text-gray-600 mb-4">How would you like to share this portfolio?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Button
                variant={shareMethod === 'download' ? 'default' : 'outline'}
                onClick={() => setShareMethod('download')}
                className="justify-start h-auto p-4"
              >
                <Download className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Download</div>
                  <div className="text-sm opacity-75">Save to your device</div>
                </div>
              </Button>

              <Button
                variant={shareMethod === 'link' ? 'default' : 'outline'}
                onClick={() => setShareMethod('link')}
                className="justify-start h-auto p-4"
              >
                <Link2 className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Share Link</div>
                  <div className="text-sm opacity-75">Generate shareable URL</div>
                </div>
              </Button>

              <Button
                variant={shareMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setShareMethod('email')}
                className="justify-start h-auto p-4"
              >
                <Mail className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-sm opacity-75">Send via email</div>
                </div>
              </Button>
            </div>

            {shareMethod === 'email' && (
              <div className="mb-4">
                <Label htmlFor="emailRecipients" className="text-sm">Email Recipients</Label>
                <Input
                  id="emailRecipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {shareUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      {urlCopied ? 'URL copied to clipboard!' : 'Shareable URL generated'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyUrl}
                    className="text-green-600 border-green-300"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="text-xs text-green-700 mt-2 font-mono bg-green-100 p-2 rounded">
                  {shareUrl}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              {shareMethod === 'link' && (
                <Button variant="outline" onClick={handleCopyUrl}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Link
                </Button>
              )}
              
              <Button onClick={handleShare} disabled={exporting}>
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    {shareMethod === 'download' && <Download className="h-4 w-4 mr-2" />}
                    {shareMethod === 'email' && <Mail className="h-4 w-4 mr-2" />}
                    {shareMethod === 'link' && <Share2 className="h-4 w-4 mr-2" />}
                    {shareMethod === 'download' ? 'Export' : 'Share'} Portfolio
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}