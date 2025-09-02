import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Code, 
  File,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Array<{ id: string; title: string }>;
}

interface FileWithMetadata extends File {
  id: string;
  category: string;
  accessLevel: string;
  description: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export function FileUploadModal({ isOpen, onClose, onSuccess, projects }: FileUploadModalProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const filesWithMetadata: FileWithMetadata[] = newFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      category: getFileCategory(file),
      accessLevel: 'client',
      description: '',
      uploadProgress: 0,
      uploadStatus: 'pending'
    }));
    
    setFiles(prev => [...prev, ...filesWithMetadata]);
  };

  const getFileCategory = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'document';
    if (['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json'].includes(ext || '')) return 'code';
    if (['psd', 'ai', 'figma', 'sketch'].includes(ext || '')) return 'design';
    return 'general';
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'code': return <Code className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const updateFileMetadata = (fileId: string, field: keyof FileWithMetadata, value: any) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (!selectedProject || files.length === 0) {
      toast.error('Please select a project and add files');
      return;
    }

    setUploading(true);
    
    for (const file of files) {
      try {
        updateFileMetadata(file.id, 'uploadStatus', 'uploading');
        
        // Create a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${file.id}.${fileExt}`;
        const filePath = `project-files/${selectedProject}/${fileName}`;

        // Simulate upload progress (in real implementation, you'd use Supabase storage)
        for (let progress = 0; progress <= 100; progress += 20) {
          updateFileMetadata(file.id, 'uploadProgress', progress);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Insert file record into database
        const { data: { user } } = await supabase.auth.getUser();
        const { error: dbError } = await supabase
          .from('project_files')
          .insert([{
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_path: filePath,
            category: file.category,
            access_level: file.accessLevel,
            project_id: selectedProject,
            uploaded_by: user?.id,
            description: file.description || null
          }]);

        if (dbError) throw dbError;

        updateFileMetadata(file.id, 'uploadStatus', 'completed');
        
      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileMetadata(file.id, 'uploadStatus', 'error');
        updateFileMetadata(file.id, 'errorMessage', error.message);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    
    // Check if all files uploaded successfully
    const allCompleted = files.every(file => file.uploadStatus === 'completed');
    if (allCompleted) {
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      onSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    setFiles([]);
    setSelectedProject('');
    setDragActive(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </DialogTitle>
          <DialogDescription>
            Upload files to a project. Files will be organized and made accessible based on your settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse to upload
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Images, Documents, Code files, Design files (Max 10MB each)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.js,.jsx,.ts,.tsx,.css,.html,.json,.psd,.ai"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Files to Upload ({files.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getFileIcon(file.category)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.category}
                            </Badge>
                            {file.uploadStatus === 'completed' && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            {file.uploadStatus === 'error' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      {file.uploadStatus === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {file.uploadStatus === 'uploading' && (
                      <Progress value={file.uploadProgress} className="h-2" />
                    )}

                    {file.uploadStatus === 'error' && file.errorMessage && (
                      <p className="text-sm text-red-500">{file.errorMessage}</p>
                    )}

                    {file.uploadStatus === 'pending' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Access Level</Label>
                          <Select 
                            value={file.accessLevel} 
                            onValueChange={(value) => updateFileMetadata(file.id, 'accessLevel', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="client">Client Access</SelectItem>
                              <SelectItem value="internal">Internal Only</SelectItem>
                              <SelectItem value="restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <Select 
                            value={file.category} 
                            onValueChange={(value) => updateFileMetadata(file.id, 'category', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="code">Code</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {file.uploadStatus === 'pending' && (
                      <div className="space-y-1">
                        <Label className="text-xs">Description (Optional)</Label>
                        <Input
                          placeholder="Add a description for this file..."
                          className="h-8 text-xs"
                          value={file.description}
                          onChange={(e) => updateFileMetadata(file.id, 'description', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={uploadFiles} 
            disabled={!selectedProject || files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}