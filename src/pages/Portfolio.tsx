import React, { useState, useEffect } from 'react';
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
  Unlock
} from 'lucide-react';

const PortfolioWithAdmin = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Admin Password (in production, this should be handled more securely)
  const ADMIN_PASSWORD = 'NexaCore2024!';

  const categories = [
    { name: 'All', count: 0, icon: Sparkles },
    { name: 'Web Development', count: 0, icon: Globe },
    { name: 'Mobile Apps', count: 0, icon: Smartphone },
    { name: 'Full Stack', count: 0, icon: Code },
    { name: 'Data Analytics', count: 0, icon: TrendingUp },
    { name: 'Tools & Utilities', count: 0, icon: Settings }
  ];

  // Initial projects based on your existing work
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-Commerce Solution',
      category: 'Web Development',
      client: 'Personal Project',
      year: '2024',
      location: 'Ghana',
      description: 'Full-stack e-commerce solution with HTML, Tailwind CSS, JavaScript and Firebase for seamless online shopping experience.',
      longDescription: 'A comprehensive e-commerce platform featuring user authentication, product catalog, shopping cart, payment integration, and order management. Built with modern web technologies for optimal performance and user experience.',
      technologies: ['HTML', 'Tailwind CSS', 'JavaScript', 'Firebase', 'Payment Gateway'],
      images: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
      thumbnail: '/api/placeholder/400/300',
      status: 'Completed',
      featured: true,
      metrics: {
        views: '1.2K',
        likes: 89,
        shares: 23
      },
      links: {
        live: 'https://manassehkabutey.vercel.app/',
        github: 'https://github.com/manasseh-kabutey',
        case: '/case-study/1'
      },
      awards: [],
      teamSize: 1,
      duration: '3 months'
    },
    {
      id: 2,
      title: 'Web Scraper CLI Tool',
      category: 'Tools & Utilities',
      client: 'Open Source',
      year: '2024',
      location: 'Ghana',
      description: 'A versatile command-line web scraper built with Dart. This tool allows you to scrape web pages and save the extracted data in various formats.',
      longDescription: 'Developed a powerful command-line interface tool for web scraping using Dart. Features include multiple output formats, error handling, rate limiting, and support for complex web page structures. Perfect for data collection and automation tasks.',
      technologies: ['Dart', 'CLI', 'Web Scraping', 'JSON', 'CSV'],
      images: ['/api/placeholder/800/500'],
      thumbnail: '/api/placeholder/400/300',
      status: 'Completed',
      featured: true,
      metrics: {
        views: '856',
        likes: 67,
        shares: 15
      },
      links: {
        github: 'https://github.com/manasseh-kabutey',
        case: '/case-study/2'
      },
      awards: [],
      teamSize: 1,
      duration: '2 months'
    },
    {
      id: 3,
      title: 'Mobile Phone Tracker',
      category: 'Mobile Apps',
      client: 'Personal Project',
      year: '2024',
      location: 'Ghana',
      description: 'Mobile app for tracking location of missing phones with real-time GPS tracking and security features.',
      longDescription: 'A Flutter-based mobile application designed to help locate missing or stolen phones. Features include real-time GPS tracking, emergency alerts, remote device management, and secure authentication. The app prioritizes user privacy while providing powerful tracking capabilities.',
      technologies: ['Flutter', 'Dart', 'GPS', 'Firebase', 'Real-time Database'],
      images: ['/api/placeholder/400/600', '/api/placeholder/400/600'],
      thumbnail: '/api/placeholder/400/300',
      status: 'Completed',
      featured: false,
      metrics: {
        views: '643',
        likes: 45,
        shares: 12
      },
      links: {
        github: 'https://github.com/manasseh-kabutey'
      },
      awards: [],
      teamSize: 1,
      duration: '4 months'
    }
  ]);

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

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAddProject(false);
    setEditingProject(null);
  };

  const handleAddProject = (newProject) => {
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
    setProjects([...projects, projectWithId]);
    setShowAddProject(false);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  // Admin Login Modal
  const AdminLoginModal = () => (
    showAdminLogin && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
            <p className="text-gray-600">Enter admin password to manage projects</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            
            <div className="flex gap-3">
              <Button onClick={handleAdminLogin} className="flex-1">
                <Unlock className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAdminLogin(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Project Form Component
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
      thumbnail: project?.thumbnail || '/api/placeholder/400/300',
      images: project?.images?.join(', ') || '/api/placeholder/800/600',
      status: project?.status || 'Completed',
      featured: project?.featured || false,
      teamSize: project?.teamSize || 1,
      duration: project?.duration || '',
      liveLink: project?.links?.live || '',
      githubLink: project?.links?.github || '',
      caseStudyLink: project?.links?.case || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const projectData = {
        ...project,
        ...formData,
        technologies: formData.technologies.split(',').map(tech => tech.trim()),
        images: formData.images.split(',').map(img => img.trim()),
        links: {
          live: formData.liveLink,
          github: formData.githubLink,
          case: formData.caseStudyLink
        }
      };
      onSave(projectData);
    };

    return (
      <div className="bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Web Development</option>
                <option>Mobile Apps</option>
                <option>Full Stack</option>
                <option>Data Analytics</option>
                <option>Tools & Utilities</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technologies (comma-separated)</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({...formData, technologies: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="React, Node.js, MongoDB"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (comma-separated URLs)</label>
              <input
                type="text"
                value={formData.images}
                onChange={(e) => setFormData({...formData, images: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>Completed</option>
                <option>In Progress</option>
                <option>Planning</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
              <input
                type="number"
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="3 months"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveLink}
                onChange={(e) => setFormData({...formData, liveLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.githubLink}
                onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Study URL</label>
              <input
                type="url"
                value={formData.caseStudyLink}
                onChange={(e) => setFormData({...formData, caseStudyLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Featured Project
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {project ? 'Update Project' : 'Add Project'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Project Modal (same as before but with admin controls)
  const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <div className="flex items-center gap-2">
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
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img 
                  src={project.images[currentImageIndex]} 
                  alt={project.title}
                  className="w-full h-80 object-cover"
                />
                {project.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : project.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex(prev => prev < project.images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{project.longDescription}</p>
                
                <h4 className="text-lg font-semibold mb-3">Technologies Used</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">Project Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Year</div>
                        <div className="font-medium">{project.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">{project.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Team Size</div>
                        <div className="font-medium">{project.teamSize} member{project.teamSize > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Project Card Component
  const ProjectCard = ({ project, featured = false }) => (
    <Card 
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative ${
        featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={() => setSelectedProject(project)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={project.thumbnail} 
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button 
              size="sm" 
              variant="secondary" 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        
        <Badge className={`absolute bottom-3 right-3 text-xs ${
          project.status === 'Completed' ? 'bg-green-600' : 'bg-orange-600'
        } text-white`}>
          {project.status}
        </Badge>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className="text-xs bg-gray-100 text-gray-700">
            {project.category}
          </Badge>
          <span className="text-sm text-gray-500">{project.year}</span>
        </div>
        
        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {project.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            {project.location}
          </div>
          <div className="flex space-x-2">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              <span className="font-medium">Admin Mode Active</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setShowAddProject(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 text-lg px-6 py-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Manasseh Kabutey's Portfolio
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Software Engineering <span className="text-gradient bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Excellence</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Full-stack developer specializing in web and mobile technologies. 
              Creating innovative solutions with Next.js, Flutter, Firebase, and modern development practices.
            </p>
            
            {!isAdmin && (
              <Button 
                variant="outline" 
                className="mt-6 border-white text-white hover:bg-white hover:text-gray-900"
                onClick={() => setShowAdminLogin(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin Access
              </Button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {[
              { number: `${projects.length}+`, label: 'Projects Completed' },
              { number: '15+', label: 'Technologies Mastered' },
              { number: '5+', label: 'Countries Reached' },
              { number: '3+', label: 'Years Experience' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured Projects
              </h2>
              <p className="text-xl text-gray-600">
                Highlighting my most impactful and innovative work
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Portfolio Section */}
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
                    className="group"
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.name}
                    <Badge className="ml-2 bg-gray-100 text-gray-700 group-hover:bg-white">
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Projects' : selectedCategory}
              </h3>
              <p className="text-gray-600">
                Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Skills & Technologies Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Technologies & Skills
            </h2>
            <p className="text-xl text-gray-600">
              My technical expertise and preferred development stack
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'Next.js', 'React', 'Flutter', 'Dart', 'JavaScript', 'TypeScript',
              'Firebase', 'Node.js', 'HTML/CSS', 'Tailwind CSS', 'Git', 'MongoDB'
            ].map((tech, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200">
                <div className="font-medium text-gray-900">{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Ready to start your next project? Let's discuss how I can help bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => window.open('mailto:manassehkabutey@gmail.com', '_blank')}
            >
              Get In Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => window.open('https://manassehkabutey.vercel.app/', '_blank')}
            >
              View Full Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AdminLoginModal />
      
      {/* Add/Edit Project Modal */}
      {(showAddProject || editingProject) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
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
        onClose={() => {
          setSelectedProject(null);
          setCurrentImageIndex(0);
        }}
      />
    </div>
  );
};

export default PortfolioWithAdmin;
