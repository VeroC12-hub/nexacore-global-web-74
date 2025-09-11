import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  service_id: string;
  client_name?: string;
  show_client_name: boolean;
  is_featured: boolean;
  is_published: boolean;
  challenge?: string;
  solution?: string;
  results?: string;
  project_metrics?: Record<string, any>;
  tags?: string[];
  thumbnail_url?: string;
  files?: PortfolioFile[];
}

export interface PortfolioFile {
  id: string;
  filename: string;
  file_type: string;
  file_url: string;
  file_size_bytes?: number;
  description?: string;
  software_used?: string;
  is_downloadable: boolean;
}

export interface ServiceCategory {
  id: string;
  service_id: string;
  service_name: string;
  description?: string;
  departments: string[];
  allowed_file_types: string[];
  icon_emoji: string;
  color_theme: string;
}

export const usePortfolioData = (serviceId?: string, maxProjects: number = 10) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('portfolio_projects')
        .select(`
          *,
          portfolio_files (*)
        `)
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Filter by service if specified
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      // Limit results
      query = query.limit(maxProjects);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setProjects(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio data';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [serviceId, maxProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects
  };
};

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('portfolio_service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setCategories(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service categories';
      setError(errorMessage);
      console.error('Service categories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

// Hook for individual project details
export const useProjectDetails = (projectId: string) => {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('portfolio_projects')
          .select(`
            *,
            portfolio_files (*)
          `)
          .eq('id', projectId)
          .eq('is_published', true)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setProject(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project details';
        setError(errorMessage);
        console.error('Project details fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  return {
    project,
    loading,
    error
  };
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getServiceIcon = (serviceId: string): string => {
  const iconMap: Record<string, string> = {
    'cad-design': '🔧',
    '3d-animation': '🎬',
    'ai-ml': '🤖',
    'blockchain': '⛓️',
    'ecommerce-tech': '🛒',
    'mobile-dev': '📱',
    'web-development': '🌐',
    'ui-ux-design': '🎨',
    'data-analytics': '📊',
    'cybersecurity': '🔒'
  };
  return iconMap[serviceId] || '📁';
};

export const getServiceColor = (serviceId: string): string => {
  const colorMap: Record<string, string> = {
    'cad-design': 'blue',
    '3d-animation': 'purple',
    'ai-ml': 'green',
    'blockchain': 'yellow',
    'ecommerce-tech': 'red',
    'mobile-dev': 'cyan',
    'web-development': 'indigo',
    'ui-ux-design': 'pink',
    'data-analytics': 'teal',
    'cybersecurity': 'slate'
  };
  return colorMap[serviceId] || 'gray';
};