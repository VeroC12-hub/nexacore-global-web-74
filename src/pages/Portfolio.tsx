import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Filter, 
  Search, 
  ExternalLink, 
  Github, 
  Play, 
  Award, 
  Calendar,
  MapPin,
  Users,
  Zap,
  Sparkles,
  ArrowRight,
  Eye,
  Heart,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  TrendingUp,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Settings,
  LogOut,
  Code,
  Smartphone,
  Database,
  Lock,
  Unlock,
  Building2,
  Target,
  Image as ImageIcon,
  Camera,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Loader2,
  Home,
  Menu,
  BarChart3,
  FileText,
  Palette,
  Moon,
  Sun,
  RefreshCw,
  Shield,
  Clock,
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  GitBranch,
  Server,
  Layers,
  Coffee,
  Lightning,
  Headphones,
  Briefcase,
  GraduationCap,
  Rocket
} from 'lucide-react';

// GitHub API Integration
const GITHUB_CONFIG = {
  owner: 'VeroC12-hub',
  repo: 'nexacore-global-web-74',
  branch: 'main',
  path: 'public/images/portfolio/',
  // token: import.meta.env.GITHUB_TOKEN || '',
  token: undefined // In production, this would be set securely
};

// Enhanced GitHub API Service
class GitHubService {
  static async uploadImage(file, filename) {
    try {
      // Convert file to base64
      const base64Content = await this.fileToBase64(file);
      
      // Simulate GitHub API call (in production, would use actual API)
      await this.simulateAPICall();
      
      // Generate GitHub raw URL
      const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.path}${filename}`;
      
      return {
        success: true,
        url,
        filename,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('GitHub upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static simulateAPICall() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500 + Math.random() * 1000);
    });
  }

  static generateFilename(originalName) {
    const timestamp = Date.now();
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '-');
    return `portfolio-${timestamp}-${cleanName}`;
  }
}

// Theme Context
const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('portfolio-theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('portfolio-theme', !isDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Enhanced Image Uploader with Progress
const ImageUploader = ({ onImageSelect, label = "Select Image", currentImage = null, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [uploadStats, setUploadStats] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = multiple ? Array.from(event.target.files) : [event.target.files[0]];
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Please select image files only');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 200);

      const filename = GitHubService.generateFilename(file.name);
      const result = await GitHubService.uploadImage(file, filename);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setUploadStats({
          filename: result.filename,
          size: (result.size / 1024).toFixed(2) + ' KB',
          type: result.type
        });
        onImageSelect(result.url);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setProgress(0);
        setUploadStats(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold dark:text-white">{label}</label>
      
      {previewUrl && (
        <div className="relative group">
          <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <div className="bg-white rounded-lg p-4 text-center min-w-[200px]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium mb-1">Uploading to GitHub...</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">{progress.toFixed(0)}%</div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!previewUrl && (
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-medium dark:text-white mb-1">Uploading to GitHub...</p>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{progress.toFixed(0)}%</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium dark:text-white mb-1">Click to select {multiple ? 'images' : 'image'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      {uploadStats && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center text-green-800 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Upload successful!
          </div>
          <div className="text-xs text-green-600 dark:text-green-500 mt-1">
            {uploadStats.filename} • {uploadStats.size} • {uploadStats.type}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center text-blue-800 dark:text-blue-400 text-sm mb-1">
          <Github className="w-4 h-4 mr-2" />
          GitHub Integration Active
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-500">
          Repository: {GITHUB_CONFIG.owner}/{GITHUB_CONFIG.repo}
        </div>
      </div>
    </div>
  );
};

// Navigation Header
const Navigation = ({ currentPage, setCurrentPage, isAdmin, onAdminToggle, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    ...(isAdmin ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'analytics', label: 'Analytics', icon: Activity }
    ] : [])
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">NexaCore</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    currentPage === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {!isAdmin ? (
              <Button variant="outline" size="sm" onClick={onAdminToggle}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    currentPage === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Enhanced Admin Dashboard
const AdminDashboard = ({ projects, onAddProject, onEditProject, onDeleteProject }) => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Calculate stats
    const completed = projects.filter(p => p.status === 'Completed').length;
    const inProgress = projects.filter(p => p.status === 'In Progress').length;
    const featured = projects.filter(p => p.featured).length;
    
    setStats({
      total: projects.length,
      completed,
      inProgress,
      featured,
      totalViews: projects.reduce((sum, p) => sum + parseInt(p.metrics?.views || 0), 0),
      totalLikes: projects.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0)
    });

    // Mock recent activity
    setRecentActivity([
      { action: 'Project Created', project: 'New Mobile App', time: '2 hours ago', type: 'create' },
      { action: 'Project Updated', project: 'E-Commerce Platform', time: '1 day ago', type: 'update' },
      { action: 'Project Featured', project: 'IoT Dashboard', time: '2 days ago', type: 'feature' }
    ]);
  }, [projects]);

  const quickActions = [
    { label: 'Add New Project', icon: Plus, action: onAddProject, color: 'blue' },
    { label: 'Manage Images', icon: ImageIcon, action: () => {}, color: 'green' },
    { label: 'Export Data', icon: Download, action: () => {}, color: 'purple' },
    { label: 'Settings', icon: Settings, action: () => {}, color: 'gray' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your portfolio and monitor performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: stats.total, icon: Briefcase, color: 'blue' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'orange' },
          { label: 'Featured', value: stats.featured, icon: Star, color: 'yellow' },
          { label: 'Total Views', value: stats.totalViews?.toLocaleString(), icon: Eye, color: 'purple' },
          { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'red' }
        ].map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold dark:text-white">{stat.value || 0}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={action.action}
              >
                <action.icon className="w-4 h-4 mr-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'create' ? 'bg-green-500' :
                  activity.type === 'update' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.project}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">System Status</h3>
          <div className="space-y-4">
            {[
              { label: 'GitHub Integration', status: 'Connected', color: 'green' },
              { label: 'Image Storage', status: 'Operational', color: 'green' },
              { label: 'Analytics', status: 'Active', color: 'green' },
              { label: 'Backup Status', status: 'Last: 2 hours ago', color: 'blue' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-300">{item.label}</span>
                <Badge className={`bg-${item.color}-100 text-${item.color}-800 dark:bg-${item.color}-900/20 dark:text-${item.color}-300`}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="mt-8 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Recent Projects</h3>
          <Button size="sm" onClick={onAddProject}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img src={project.thumbnail} alt={project.title} className="w-10 h-10 rounded-lg object-cover mr-3" />
                      <div>
                        <div className="font-medium dark:text-white">{project.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{project.client}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}>
                      {project.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.metrics?.views || '0'}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEditProject(project)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDeleteProject(project.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Enhanced Project Form
const ProjectForm = ({ project = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    category: project?.category || 'Web Development',
    client: project?.client || '',
    year: project?.year || new Date().getFullYear().toString(),
    location: project?.location || '',
    description: project?.description || '',
    longDescription: project?.longDescription || '',
    technologies: project?.technologies?.join(', ') || '',
    thumbnail: project?.thumbnail || '',
    images: project?.images?.join(', ') || '',
    status: project?.status || 'Completed',
    featured: project?.featured || false,
    teamSize: project?.teamSize || 1,
    duration: project?.duration || '',
    liveLink: project?.links?.live || '',
    githubLink: project?.links?.github || '',
    caseStudyLink: project?.links?.case || '',
    teamMembers: project?.teamMembers?.map(member => `${member.name} (${member.role}): ${member.contribution}`).join('\n') || ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Media', icon: ImageIcon },
    { id: 3, title: 'Team & Tech', icon: Users },
    { id: 4, title: 'Links & Final', icon: ExternalLink }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.client.trim()) newErrors.client = 'Client is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (!formData.thumbnail.trim()) newErrors.thumbnail = 'Thumbnail is required';
        break;
      case 3:
        if (!formData.technologies.trim()) newErrors.technologies = 'Technologies are required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageSelect = (imageUrl, type) => {
    if (type === 'thumbnail') {
      setFormData(prev => ({ ...prev, thumbnail: imageUrl }));
    } else if (type === 'gallery') {
      const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];
      const newImages = [...currentImages, imageUrl];
      setFormData(prev => ({ ...prev, images: newImages.join(', ') }));
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    const currentImages = formData.images.split(',').map(img => img.trim()).filter(img => img);
    const newImages = currentImages.filter((_, index) => index !== indexToRemove);
    setFormData(prev => ({ ...prev, images: newImages.join(', ') }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const teamMembersArray = formData.teamMembers.split('\n').filter(line => line.trim()).map(line => {
      const match = line.match(/^(.+?)\s*\((.+?)\):\s*(.+)$/);
      if (match) {
        return {
          name: match[1].trim(),
          role: match[2].trim(),
          contribution: match[3].trim()
        };
      }
      return { name: line.trim(), role: 'Team Member', contribution: 'Project contribution' };
    });

    const projectData = {
      ...project,
      ...formData,
      technologies: formData.technologies.split(',').map(tech => tech.trim()),
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
      teamMembers: teamMembersArray,
      links: {
        live: formData.liveLink,
        github: formData.githubLink,
        case: formData.caseStudyLink
      }
    };
    onSave(projectData);
  };

  const galleryImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter project title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option>Web Development</option>
                  <option>Mobile Apps</option>
                  <option>Engineering & CAD</option>
                  <option>Data Analytics</option>
                  <option>Creative & Design</option>
                  <option>Tools & Utilities</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client *
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.client ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Client name"
                />
                {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
                placeholder="Brief project description"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                rows="4"
                placeholder="Detailed project description"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ImageUploader
                  label="Project Thumbnail *"
                  currentImage={formData.thumbnail}
                  onImageSelect={(url) => handleImageSelect(url, 'thumbnail')}
                />
                {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold dark:text-white mb-2">Gallery Images</label>
                
                {galleryImages.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current images ({galleryImages.length}):</p>
                    <div className="grid grid-cols-2 gap-2">
                      {galleryImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <ImageUploader
                  label="Add Gallery Image"
                  onImageSelect={(url) => handleImageSelect(url, 'gallery')}
                />
                
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Or paste image URLs (comma-separated)"
                    value={formData.images}
                    onChange={(e) => setFormData({...formData, images: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies *
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.technologies ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="React, Node.js, MongoDB (comma-separated)"
              />
              {errors.technologies && <p className="text-red-500 text-xs mt-1">{errors.technologies}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Members
              </label>
              <textarea
                value={formData.teamMembers}
                onChange={(e) => setFormData({...formData, teamMembers: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                rows="4"
                placeholder="Manasseh Kabutey (Lead Developer): Full-stack development, architecture design"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: Name (Role): Contribution (one per line)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Planning</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Size
                </label>
                <input
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="3 months"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={formData.liveLink}
                  onChange={(e) => setFormData({...formData, liveLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="https://github.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Case Study URL
                </label>
                <input
                  type="url"
                  value={formData.caseStudyLink}
                  onChange={(e) => setFormData({...formData, caseStudyLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="https://case-study.com"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Featured Project
              </label>
            </div>

            {/* Project Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 dark:text-white">Project Preview</h4>
              <div className="flex items-start space-x-4">
                {formData.thumbnail && (
                  <img 
                    src={formData.thumbnail} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h5 className="font-medium dark:text-white">{formData.title || 'Project Title'}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formData.client || 'Client'} • {formData.year || '2024'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {formData.description || 'Project description...'}
                  </p>
                  {formData.technologies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.technologies.split(',').slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {project ? 'Update Project' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Enhanced Admin Login Modal
const AdminLoginModal = ({ showAdminLogin, adminPassword, setAdminPassword, handleAdminLogin, setShowAdminLogin }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (showAdminLogin && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showAdminLogin]);

  const handleLogin = () => {
    const success = handleAdminLogin();
    if (!success) {
      setLoginAttempts(prev => prev + 1);
    }
    if (success && rememberMe) {
      localStorage.setItem('nexacore-admin-session', Date.now().toString());
    }
  };

  if (!showAdminLogin) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter your credentials to access the admin panel</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Remember me for 24 hours
            </label>
          </div>

          {loginAttempts > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center text-red-800 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Invalid password. {3 - loginAttempts} attempts remaining.
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button onClick={handleLogin} className="flex-1" disabled={loginAttempts >= 3}>
              <Unlock className="w-4 h-4 mr-2" />
              {loginAttempts >= 3 ? 'Locked' : 'Login'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAdminLogin(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure admin authentication • Session timeout: 2 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Project Modal with Fullscreen Gallery
const ProjectModal = ({ project, onClose, isAdmin, setEditingProject, handleDeleteProject }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!project) return null;

  const nextImage = () => {
    setCurrentImageIndex(prev => prev < project.images.length - 1 ? prev + 1 : 0);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : project.images.length - 1);
  };

  const toggleLike = () => {
    setLiked(!liked);
    // In real app, this would update the backend
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
                <Building2 className="w-4 h-4 mr-1" />
                {project.client} • {project.year}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleLike}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden mb-4 group">
                <img 
                  src={project.images[currentImageIndex]} 
                  alt={project.title}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                
                {/* Gallery Controls */}
                {project.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                
                {/* Image Counter */}
                {project.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {project.images.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Strip */}
              {project.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {project.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${project.title} ${index + 1}`}
                      className={`w-20 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all ${
                        currentImageIndex === index 
                          ? 'border-blue-500 opacity-100' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Project Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Project Overview</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{project.longDescription}</p>
                
                <h4 className="text-lg font-semibold mb-3 dark:text-white">Technologies Used</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Team Members Section */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
                      <Users className="w-5 h-5 mr-2" />
                      Project Team
                    </h4>
                    <div className="space-y-3">
                      {project.teamMembers.map((member, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.contribution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Details Sidebar */}
              <div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 sticky top-6">
                  <h4 className="text-lg font-semibold mb-4 dark:text-white">Project Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Client</div>
                        <div className="font-medium dark:text-white">{project.client}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Year</div>
                        <div className="font-medium dark:text-white">{project.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                        <div className="font-medium dark:text-white">{project.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Team Size</div>
                        <div className="font-medium dark:text-white">{project.teamSize} member{project.teamSize > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                        <div className="font-medium dark:text-white">{project.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                        <Badge className={`${
                          project.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Project Metrics */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold mb-3 dark:text-white">Project Metrics</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{project.metrics?.views || '0'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{project.metrics?.likes || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{project.metrics?.shares || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Shares</div>
                      </div>
                    </div>
                  </div>

                  {project.awards && project.awards.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold mb-2 flex items-center dark:text-white">
                        <Award className="w-4 h-4 mr-2 text-yellow-500" />
                        Awards
                      </h5>
                      <div className="space-y-1">
                        {project.awards.map((award, index) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400">{award}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      {project.links.live && (
                        <Button className="w-full" size="sm" onClick={() => window.open(project.links.live, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Live Project
                        </Button>
                      )}
                      {project.links.github && (
                        <Button variant="outline" className="w-full" size="sm" onClick={() => window.open(project.links.github, '_blank')}>
                          <Github className="w-4 h-4 mr-2" />
                          View Code
                        </Button>
                      )}
                      {project.links.case && (
                        <Button variant="outline" className="w-full" size="sm" onClick={() => window.open(project.links.case, '_blank')}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Case Study
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
          <img 
            src={project.images[currentImageIndex]} 
            alt={project.title}
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          {project.images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Enhanced Project Card with Animations
const ProjectCard = ({ project, featured = false, isAdmin, setEditingProject, handleDeleteProject, setSelectedProject }) => (
  <Card 
    className={`group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 relative bg-white dark:bg-gray-800 border dark:border-gray-700 ${
      featured ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
    }`}
    onClick={() => setSelectedProject(project)}
  >
    <div className="relative overflow-hidden">
      <img 
        src={project.thumbnail} 
        alt={project.title}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
            size="sm" 
            variant="secondary" 
            className="shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setEditingProject(project);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            className="shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(project.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {featured && (
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      )}
      
      <Badge className={`absolute bottom-3 right-3 text-xs shadow-lg ${
        project.status === 'Completed' 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-orange-600 hover:bg-orange-700'
      } text-white`}>
        {project.status}
      </Badge>

      {/* Hover Actions */}
      <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {project.links.live && (
          <Button 
            size="sm" 
            variant="secondary" 
            className="shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.links.live, '_blank');
            }}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
        {project.links.github && (
          <Button 
            size="sm" 
            variant="secondary" 
            className="shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              window.open(project.links.github, '_blank');
            }}
          >
            <Github className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
    
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <Badge className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {project.category}
        </Badge>
        <span className="text-sm text-gray-500 dark:text-gray-400">{project.year}</span>
      </div>
      
      <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 dark:text-white">
        {project.title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Building2 className="w-4 h-4 mr-1" />
          {project.client}
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          {project.location}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 mr-1" />
          {project.teamSize} member{project.teamSize > 1 ? 's' : ''}
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4 mr-1" />
          {project.metrics?.views || '0'}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {project.technologies.slice(0, 3).map((tech, index) => (
          <Badge key={index} variant="outline" className="text-xs dark:border-gray-600">
            {tech}
          </Badge>
        ))}
        {project.technologies.length > 3 && (
          <Badge variant="outline" className="text-xs dark:border-gray-600">
            +{project.technologies.length - 3}
          </Badge>
        )}
      </div>
    </div>
  </Card>
);

// Analytics Dashboard
const AnalyticsDashboard = ({ projects }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    // Mock analytics data
    setAnalyticsData({
      totalViews: projects.reduce((sum, p) => sum + parseInt(p.metrics?.views || 0), 0),
      totalLikes: projects.reduce((sum, p) => sum + (p.metrics?.likes || 0), 0),
      totalShares: projects.reduce((sum, p) => sum + (p.metrics?.shares || 0), 0),
      avgViewsPerProject: Math.round(projects.reduce((sum, p) => sum + parseInt(p.metrics?.views || 0), 0) / projects.length),
      topProjects: projects.sort((a, b) => parseInt(b.metrics?.views || 0) - parseInt(a.metrics?.views || 0)).slice(0, 5),
      categoryStats: projects.reduce((acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      }, {}),
      monthlyViews: [
        { month: 'Jan', views: 1200 },
        { month: 'Feb', views: 1800 },
        { month: 'Mar', views: 2400 },
        { month: 'Apr', views: 2100 },
        { month: 'May', views: 2800 },
        { month: 'Jun', views: 3200 }
      ]
    });
  }, [projects, timeRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your portfolio performance and engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Total Views', 
            value: analyticsData.totalViews?.toLocaleString(), 
            change: '+12.5%',
            changeType: 'positive',
            icon: Eye,
            color: 'blue'
          },
          { 
            label: 'Total Likes', 
            value: analyticsData.totalLikes?.toLocaleString(), 
            change: '+8.2%',
            changeType: 'positive',
            icon: Heart,
            color: 'red'
          },
          { 
            label: 'Total Shares', 
            value: analyticsData.totalShares?.toLocaleString(), 
            change: '+15.7%',
            changeType: 'positive',
            icon: Share2,
            color: 'green'
          },
          { 
            label: 'Avg Views/Project', 
            value: analyticsData.avgViewsPerProject?.toLocaleString(), 
            change: '+5.3%',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'purple'
          }
        ].map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
              <Badge className={`${
                metric.changeType === 'positive' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {metric.change}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white mb-1">{metric.value || '0'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Projects */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Top Performing Projects</h3>
          <div className="space-y-4">
            {analyticsData.topProjects?.map((project, index) => (
              <div key={project.id} className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                <img src={project.thumbnail} alt={project.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium dark:text-white truncate">{project.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{project.client}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold dark:text-white">{project.metrics?.views || '0'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">views</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Projects by Category</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.categoryStats || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-300">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / projects.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium dark:text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Main Portfolio Component
const PortfolioWithAdmin = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const savedSession = localStorage.getItem('nexacore-admin-session');
    if (savedSession) {
      const sessionTime = parseInt(savedSession);
      const now = Date.now();
      const hoursPassed = (now - sessionTime) / (1000 * 60 * 60);
      return hoursPassed < 24; // 24 hour session
    }
    return false;
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Admin Password
  const ADMIN_PASSWORD = 'NexaCore2024!';

  const categories = [
    { name: 'All', count: 0, icon: Sparkles },
    { name: 'Web Development', count: 0, icon: Globe },
    { name: 'Mobile Apps', count: 0, icon: Smartphone },
    { name: 'Engineering & CAD', count: 0, icon: Settings },
    { name: 'Data Analytics', count: 0, icon: TrendingUp },
    { name: 'Creative & Design', count: 0, icon: Award },
    { name: 'Tools & Utilities', count: 0, icon: Code }
  ];

  // Projects with enhanced data
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('nexacore-projects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    return [
      {
        id: 1,
        title: 'NexaCore E-Commerce Platform',
        category: 'Web Development',
        client: 'Retail Solutions Ghana',
        year: '2024',
        location: 'Ghana',
        description: 'Comprehensive e-commerce solution with modern UI/UX, payment integration, and inventory management system.',
        longDescription: 'A full-stack e-commerce platform designed for African markets, featuring mobile-first design, multiple payment gateway integration including mobile money, inventory management, analytics dashboard, and multi-language support. Built with scalability and performance in mind to handle high traffic and complex product catalogs.',
        technologies: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Stripe', 'PayStack', 'Tailwind CSS', 'Redis'],
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'Completed',
        featured: true,
        metrics: {
          views: '2.5K',
          likes: 156,
          shares: 45
        },
        links: {
          live: 'https://example-ecommerce.com',
          github: 'https://github.com/nexacore-innovations',
          case: '/case-study/1'
        },
        awards: ['Best E-commerce Solution 2024', 'Innovation Award Ghana Tech 2024'],
        teamSize: 4,
        duration: '6 months',
        teamMembers: [
          { name: 'Manasseh Kabutey', role: 'Lead Developer', contribution: 'Full-stack development, architecture design, and team coordination' },
          { name: 'Benjamin Agbesi', role: 'UI/UX Designer', contribution: 'User interface design, user experience optimization, and brand identity' },
          { name: 'Ocloo Godwin', role: 'Backend Developer', contribution: 'API development, database optimization, and security implementation' },
          { name: 'Sarah Mensah', role: 'Quality Assurance', contribution: 'Testing automation, performance optimization, and user acceptance testing' }
        ]
      },
      {
        id: 2,
        title: 'Smart City IoT Dashboard',
        category: 'Data Analytics',
        client: 'Municipal Authority',
        year: '2024',
        location: 'Accra, Ghana',
        description: 'Real-time data visualization dashboard for smart city infrastructure monitoring and management.',
        longDescription: 'An advanced IoT dashboard solution for monitoring city infrastructure including traffic flow, air quality, waste management, and energy consumption. Features real-time data processing, predictive analytics, automated alert systems, and comprehensive reporting capabilities for city administrators.',
        technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'IoT Sensors', 'Machine Learning'],
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'Completed',
        featured: true,
        metrics: {
          views: '1.8K',
          likes: 89,
          shares: 32
        },
        links: {
          live: 'https://smart-city-dashboard.com',
          case: '/case-study/2'
        },
        awards: ['Innovation Award 2024', 'Smart City Excellence Award'],
        teamSize: 5,
        duration: '8 months',
        teamMembers: [
          { name: 'Ocloo Godwin', role: 'Project Manager', contribution: 'Project coordination, stakeholder management, and technical leadership' },
          { name: 'Data Analytics Team', role: 'Data Scientists', contribution: 'Algorithm development, data modeling, and predictive analytics' },
          { name: 'Manasseh Kabutey', role: 'Frontend Developer', contribution: 'Dashboard interface, data visualization, and user experience' },
          { name: 'IoT Specialists', role: 'Hardware Engineers', contribution: 'Sensor integration, hardware setup, and connectivity solutions' }
        ]
      },
      {
        id: 3,
        title: 'AgriTech Mobile Solution',
        category: 'Mobile Apps',
        client: 'Ghana Agricultural Development',
        year: '2024',
        location: 'Rural Ghana',
        description: 'Mobile application connecting farmers with markets, weather data, and agricultural best practices.',
        longDescription: 'A comprehensive mobile solution for agricultural development in Ghana, providing farmers with real-time market prices, weather forecasts, crop management advice, and direct market access. Features offline functionality, multi-language support, and integration with local agricultural extension services.',
        technologies: ['Flutter', 'Dart', 'Firebase', 'Google Maps API', 'Weather API', 'Node.js', 'Machine Learning', 'SQLite'],
        images: [
          'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        featured: false,
        metrics: {
          views: '1.2K',
          likes: 67,
          shares: 18
        },
        links: {
          github: 'https://github.com/nexacore-innovations/agritech-app'
        },
        awards: [],
        teamSize: 4,
        duration: '7 months',
        teamMembers: [
          { name: 'Manasseh Kabutey', role: 'Mobile Developer', contribution: 'Flutter app development, API integration, and cross-platform optimization' },
          { name: 'Benjamin Agbesi', role: 'UI/UX Designer', contribution: 'Mobile interface design, user research, and accessibility optimization' },
          { name: 'Agricultural Consultants', role: 'Domain Experts', contribution: 'Agricultural content, best practices, and farmer requirements analysis' },
          { name: 'Backend Team', role: 'API Developers', contribution: 'Server-side development, database design, and third-party integrations' }
        ]
      },
      {
        id: 4,
        title: 'FinTech Payment Gateway',
        category: 'Web Development',
        client: 'West African Banks Consortium',
        year: '2023',
        location: 'West Africa',
        description: 'Secure payment processing system for cross-border transactions in West Africa.',
        longDescription: 'A robust payment gateway solution enabling secure cross-border transactions across West African countries. Features multi-currency support, fraud detection, compliance with international banking standards, and integration with local mobile money platforms.',
        technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Security Protocols', 'APIs'],
        images: [
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80'
        ],
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        status: 'Completed',
        featured: false,
        metrics: {
          views: '956',
          likes: 43,
          shares: 12
        },
        links: {
          case: '/case-study/4'
        },
        awards: ['Security Excellence Award 2023'],
        teamSize: 6,
        duration: '10 months',
        teamMembers: [
          { name: 'Security Team', role: 'Security Engineers', contribution: 'Security protocols, encryption implementation, and compliance' },
          { name: 'Backend Developers', role: 'Java Developers', contribution: 'Core payment processing, API development, and system architecture' },
          { name: 'DevOps Team', role: 'Infrastructure Engineers', contribution: 'Cloud deployment, monitoring, and scalability optimization' }
        ]
      }
    ];
  });

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('nexacore-projects', JSON.stringify(projects));
  }, [projects]);

  // Auto-logout after 2 hours of inactivity
  useEffect(() => {
    if (isAdmin) {
      const timeout = setTimeout(() => {
        setIsAdmin(false);
        localStorage.removeItem('nexacore-admin-session');
        alert('Admin session expired. Please login again.');
      }, 2 * 60 * 60 * 1000); // 2 hours

      return () => clearTimeout(timeout);
    }
  }, [isAdmin]);

  // Calculate category counts
  const updateCategoryCounts = () => {
    const counts = {};
    projects.forEach(project => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });
    counts['All'] = projects.length;
    return counts;
  };

  const categoryCounts = updateCategoryCounts();
  const updatedCategories = categories.map(cat => ({
    ...cat,
    count: categoryCounts[cat.name] || 0
  }));

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = projects.filter(project => project.featured);

  const handleAdminLogin = useCallback(() => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      localStorage.setItem('nexacore-admin-session', Date.now().toString());
      return true;
    } else {
      return false;
    }
  }, [adminPassword, ADMIN_PASSWORD]);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    setShowAddProject(false);
    setEditingProject(null);
    setCurrentPage('home');
    localStorage.removeItem('nexacore-admin-session');
  }, []);

  const handleAddProject = useCallback((newProject) => {
    const id = Math.max(...projects.map(p => p.id)) + 1;
    const projectWithId = {
      ...newProject,
      id,
      metrics: {
        views: '0',
        likes: 0,
        shares: 0
      }
    };
    setProjects(prev => [...prev, projectWithId]);
    setShowAddProject(false);
  }, [projects]);

  const handleUpdateProject = useCallback((updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
  }, []);

  const handleDeleteProject = useCallback((projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  }, []);

  // Home Page Component
  const HomePage = () => (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 dark:from-blue-800 dark:via-purple-800 dark:to-teal-800 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 text-lg px-6 py-2 backdrop-blur-sm">
              <Building2 className="w-5 h-5 mr-2" />
              NexaCore Innovations Portfolio
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Engineering{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Innovation
              </span>{' '}
              Globally
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
              Showcasing our diverse portfolio of technical solutions, creative designs, and digital innovations. 
              From engineering excellence to cutting-edge software development across Africa and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                onClick={() => setCurrentPage('portfolio')}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                View Portfolio
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm"
                onClick={() => window.open('mailto:contact@nexacore.com')}
              >
                <Lightning className="w-5 h-5 mr-2" />
                Start Your Project
              </Button>
            </div>
            
            {/* Company Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { number: `${projects.length}+`, label: 'Projects Delivered', icon: Briefcase },
                { number: '50+', label: 'Global Clients', icon: Globe },
                { number: '25+', label: 'Team Members', icon: Users },
                { number: '6+', label: 'Years Excellence', icon: Award }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-4">
                <Star className="w-4 h-4 mr-2" />
                Featured Work
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Best Projects
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Highlighting our most impactful and innovative solutions that have transformed businesses and communities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  featured={true}
                  isAdmin={isAdmin}
                  setEditingProject={setEditingProject}
                  handleDeleteProject={handleDeleteProject}
                  setSelectedProject={setSelectedProject}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => setCurrentPage('portfolio')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                View All Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Expertise
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We specialize in cutting-edge technologies and innovative solutions across multiple domains
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Web Development',
                description: 'Full-stack web applications with modern frameworks and scalable architectures',
                technologies: ['React', 'Next.js', 'Node.js', 'Python'],
                color: 'blue'
              },
              {
                icon: Smartphone,
                title: 'Mobile Applications',
                description: 'Cross-platform mobile solutions for iOS and Android with native performance',
                technologies: ['Flutter', 'React Native', 'Swift', 'Kotlin'],
                color: 'green'
              },
              {
                icon: Database,
                title: 'Data Analytics',
                description: 'Advanced data processing, visualization, and machine learning solutions',
                technologies: ['Python', 'R', 'Tableau', 'TensorFlow'],
                color: 'purple'
              },
              {
                icon: Settings,
                title: 'Engineering & CAD',
                description: 'Technical engineering solutions and computer-aided design systems',
                technologies: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Simulation'],
                color: 'orange'
              },
              {
                icon: Palette,
                title: 'Creative & Design',
                description: 'Brand identity, UI/UX design, and creative digital experiences',
                technologies: ['Figma', 'Adobe Creative', 'Sketch', 'Prototyping'],
                color: 'pink'
              },
              {
                icon: Code,
                title: 'Tools & Utilities',
                description: 'Custom tools, automation scripts, and productivity solutions',
                technologies: ['Python', 'Bash', 'APIs', 'Automation'],
                color: 'gray'
              }
            ].map((service, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group dark:bg-gray-900 dark:border-gray-700">
                <div className={`w-16 h-16 bg-${service.color}-100 dark:bg-${service.color}-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-8 h-8 text-${service.color}-600 dark:text-${service.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech, techIndex) => (
                    <Badge key={techIndex} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Let's discuss how NexaCore Innovations can help bring your vision to life with our expert team, 
            proven methodologies, and cutting-edge technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              onClick={() => window.open('mailto:contact@nexacore.com')}
            >
              <Lightning className="w-5 h-5 mr-2" />
              Start Your Project
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm"
              onClick={() => setCurrentPage('portfolio')}
            >
              <Eye className="w-5 h-5 mr-2" />
              View Our Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  // Portfolio Page Component
  const PortfolioPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Portfolio Header */}
      <section className="bg-white dark:bg-gray-800 py-16 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Portfolio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore our diverse collection of projects spanning web development, mobile apps, 
              data analytics, and innovative engineering solutions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Search */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Categories */}
              <div className="flex flex-wrap gap-3">
                {updatedCategories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="group transition-all duration-200"
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.name}
                    <Badge className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-600">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === 'All' ? 'All Projects' : selectedCategory}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {isAdmin && (
              <Button onClick={() => setShowAddProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                isAdmin={isAdmin}
                setEditingProject={setEditingProject}
                handleDeleteProject={handleDeleteProject}
                setSelectedProject={setSelectedProject}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No projects found</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-8">Try adjusting your search or filter criteria</p>
              {isAdmin && (
                <Button onClick={() => setShowAddProject(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Project
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard 
            projects={projects}
            onAddProject={() => setShowAddProject(true)}
            onEditProject={setEditingProject}
            onDeleteProject={handleDeleteProject}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">You need admin privileges to view this page.</p>
            </div>
          </div>
        );
      case 'analytics':
        return isAdmin ? (
          <AnalyticsDashboard projects={projects} />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">You need admin privileges to view this page.</p>
            </div>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navigation 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isAdmin={isAdmin}
          onAdminToggle={() => setShowAdminLogin(true)}
          onLogout={handleLogout}
        />

        {renderCurrentPage()}

        {/* Admin Login Modal */}
        <AdminLoginModal 
          showAdminLogin={showAdminLogin}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          handleAdminLogin={handleAdminLogin}
          setShowAdminLogin={setShowAdminLogin}
        />
        
        {/* Add/Edit Project Modal */}
        {(showAddProject || editingProject) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full max-h-[95vh] overflow-hidden">
              <ProjectForm
                project={editingProject}
                onSave={editingProject ? handleUpdateProject : handleAddProject}
                onCancel={() => {
                  setShowAddProject(false);
                  setEditingProject(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Project Detail Modal */}
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)}
          isAdmin={isAdmin}
          setEditingProject={setEditingProject}
          handleDeleteProject={handleDeleteProject}
        />

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">NexaCore Innovations</span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Engineering innovation globally through cutting-edge technology solutions, 
                  creative design, and technical excellence. Based in Ghana, serving the world.
                </p>
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Github className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Globe className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Coffee className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Home', action: () => setCurrentPage('home') },
                    { label: 'Portfolio', action: () => setCurrentPage('portfolio') },
                    { label: 'Services', action: () => setCurrentPage('home') },
                    { label: 'Contact', action: () => window.open('mailto:contact@nexacore.com') }
                  ].map((link, index) => (
                    <button 
                      key={index}
                      onClick={link.action}
                      className="block text-gray-400 hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Get In Touch</h3>
                <div className="space-y-3 text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">Accra, Ghana</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="text-sm">Global Operations</span>
                  </div>
                  <div className="flex items-center">
                    <Headphones className="w-4 h-4 mr-2" />
                    <span className="text-sm">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2024 NexaCore Innovations. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                  <span className="text-gray-400 text-sm">Made with</span>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-gray-400 text-sm">in Ghana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default PortfolioWithAdmin;
