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

      // Build query based on department and service category
      let query = supabase
        .from('erp_projects')
        .select(`
          *,
          erp_clients (
            name,
            client_code
          ),
          erp_project_team_members (
            user_id,
            role,
            erp_employees (
              first_name,
              last_name,
              job_title
            )
          )
        `)
        .eq('status', 'completed')
        .eq('project_type', 'client')
        .eq('is_active', true)
        .order('actual_end_date', { ascending: false });

      // Filter by department if specified
      if (department) {
        query = query.eq('department', department);
      }

      const { data: projects, error } = await query.limit(20);

      if (error) {
        throw new Error(error.message);
      }

      // Transform data for frontend
      const transformedProjects = projects?.map(project => ({
        id: project.id,
        project_code: project.project_code,
        title: project.title,
        description: project.description || 'Project completed successfully',
        status: project.status,
        department: project.department,
        client_id: project.client_id,
        client_name: project.erp_clients?.name || 'Confidential Client',
        completion_date: project.actual_end_date,
        budget: project.budget || 0,
        actual_cost: project.actual_cost || 0,
        project_type: project.project_type,
        tags: project.tags || [],
        custom_fields: project.custom_fields || {},
        team_members: project.erp_project_team_members?.map(member => ({
          name: `${member.erp_employees?.first_name} ${member.erp_employees?.last_name}`,
          role: member.role,
          title: member.erp_employees?.job_title
        })) || [],
        // Mock files for now - you can extend this to read from actual file storage
        files: generateMockFiles(project.department, project.project_code)
      })) || [];

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
        const { data, error } = await supabase
          .from('erp_employees')
          .select('department, job_title, skills, certifications')
          .eq('department', department)
          .eq('employee_status', 'active');

        if (error) throw error;

        // Aggregate department skills and capabilities
        const departmentData = {
          name: department,
          teamCount: data?.length || 0,
          skills: [...new Set(data?.flatMap(emp => emp.skills || []))],
          certifications: [...new Set(data?.flatMap(emp => emp.certifications || []))],
          roles: [...new Set(data?.map(emp => emp.job_title).filter(Boolean))]
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
        setProject(data);
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
          setProject(payload.new as ERPProject);
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