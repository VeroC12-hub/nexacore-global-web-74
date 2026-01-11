import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ERPProject {
  id: string;
  project_code: string;
  title: string;
  description: string;
  status: string;
  department: string;
  client_id?: string;
  client_name?: string;
  completion_date?: string;
  budget: number;
  actual_cost: number;
  project_type: string;
  tags: string[];
  custom_fields: any;
  team_members?: any[];
  files?: any[];
}

export interface PortfolioData {
  projects: ERPProject[];
  loading: boolean;
  error: string | null;
}

export const useERPPortfolio = (department?: string, serviceCategory?: string) => {
  const [data, setData] = useState<PortfolioData>({
    projects: [],
    loading: true,
    error: null
  });

  const fetchProjects = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Simplified query - only select from erp_projects table
      const { data: projects, error } = await supabase
        .from('erp_projects')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(error.message);
      }

      // Transform data for frontend with type casting
      const transformedProjects: ERPProject[] = (projects || []).map((project: any) => ({
        id: project.id,
        project_code: project.project_code || '',
        title: project.title,
        description: project.description || 'Project completed successfully',
        status: project.status,
        department: project.department || '',
        client_id: project.client_id,
        client_name: 'Confidential Client',
        completion_date: project.end_date,
        budget: project.budget || 0,
        actual_cost: project.actual_cost || 0,
        project_type: project.project_type || '',
        tags: [],
        custom_fields: {},
        team_members: [],
        files: generateMockFiles(project.department || '', project.project_code || '')
      }));

      setData({
        projects: transformedProjects,
        loading: false,
        error: null
      });

    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      }));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [department, serviceCategory]);

  return {
    ...data,
    refetch: fetchProjects
  };
};

// Generate mock files based on department - you can replace this with actual file queries
const generateMockFiles = (department: string, projectCode: string) => {
  const baseFiles = [];

  if (department === 'Engineering' || department === 'CAD') {
    baseFiles.push(
      {
        name: `${projectCode}-technical-drawing.dwg`,
        type: 'dwg',
        category: 'technical_drawing',
        url: `/downloads/cad/${projectCode}-technical-drawing.dwg`,
        thumbnail: `/images/portfolio/cad/${projectCode}-thumb.jpg`,
        size: '2.5 MB',
        software: 'AutoCAD 2024'
      },
      {
        name: `${projectCode}-3d-model.step`,
        type: 'step',
        category: '3d_model',
        url: `/downloads/cad/${projectCode}-3d-model.step`,
        thumbnail: `/images/portfolio/cad/${projectCode}-3d-thumb.jpg`,
        size: '8.1 MB',
        software: 'SolidWorks 2024'
      },
      {
        name: `${projectCode}-specifications.pdf`,
        type: 'pdf',
        category: 'documentation',
        url: `/downloads/cad/${projectCode}-specifications.pdf`,
        size: '1.2 MB',
        software: 'Adobe Acrobat'
      }
    );
  }

  if (department === 'Animation' || department === '3D') {
    baseFiles.push(
      {
        name: `${projectCode}-animation.mp4`,
        type: 'mp4',
        category: 'animation',
        url: `/downloads/animation/${projectCode}-animation.mp4`,
        thumbnail: `/images/portfolio/animation/${projectCode}-thumb.jpg`,
        size: '45.2 MB',
        software: 'Blender 4.0'
      },
      {
        name: `${projectCode}-storyboard.pdf`,
        type: 'pdf',
        category: 'documentation',
        url: `/downloads/animation/${projectCode}-storyboard.pdf`,
        size: '3.8 MB',
        software: 'Adobe Illustrator'
      }
    );
  }

  return baseFiles;
};

// Hook for department-specific portfolio settings
export const useDepartmentSettings = (department: string) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Simplified query - just get profiles with matching role
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .limit(20);

        if (error) throw error;

        // Aggregate department data
        const departmentData = {
          name: department,
          teamCount: data?.length || 0,
          skills: [] as string[],
          certifications: [] as string[],
          roles: [...new Set((data || []).map((emp: any) => emp.role).filter(Boolean))]
        };

        setSettings(departmentData);
      } catch (error) {
        console.error('Error fetching department settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (department) {
      fetchSettings();
    }
  }, [department]);

  return { settings, loading };
};

// Hook for real-time project updates
export const useProjectUpdates = (projectId: string) => {
  const [project, setProject] = useState<ERPProject | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('erp_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!error && data) {
        setProject({
          id: data.id,
          project_code: data.project_code || '',
          title: data.title,
          description: data.description || '',
          status: data.status || '',
          department: data.department || '',
          budget: data.budget || 0,
          actual_cost: data.actual_cost || 0,
          project_type: data.project_type || '',
          tags: [],
          custom_fields: {}
        });
      }
    };

    const subscription = supabase
      .channel('project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'erp_projects',
          filter: `id=eq.${projectId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setProject({
            id: newData.id,
            project_code: newData.project_code || '',
            title: newData.title,
            description: newData.description || '',
            status: newData.status || '',
            department: newData.department || '',
            budget: newData.budget || 0,
            actual_cost: newData.actual_cost || 0,
            project_type: newData.project_type || '',
            tags: [],
            custom_fields: {}
          });
        }
      )
      .subscribe();

    fetchProject();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [projectId]);

  return project;
};