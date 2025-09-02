// src/services/projectCreationService.ts
import { supabase } from '@/integrations/supabase/client';

interface Quote {
  id: string;
  quote_request_id: string;
  client_email: string;
  service_type: string;
  scope: string;
  price: number;
  currency: string;
  timeline: string;
  deliverables: string[];
  terms: string;
  status: string;
  created_by: string;
  expires_at: string;
  created_at: string;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  service_type: string;
  description: string;
  timeline?: string;
  budget_estimate?: number;
  country?: string;
  status: string;
  created_at: string;
}

export interface ProjectCreationResult {
  success: boolean;
  projectId?: string;
  error?: string;
  project?: any;
}

class ProjectCreationService {
  async createProjectFromQuote(quote: Quote): Promise<ProjectCreationResult> {
    try {
      console.log('Creating project from approved quote:', quote.id);

      // Get quote request details
      const { data: quoteRequest, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quote.quote_request_id)
        .single();

      if (quoteError || !quoteRequest) {
        throw new Error('Failed to fetch quote request details');
      }

      // Find or create client user
      const clientUserId = await this.findOrCreateClient(quoteRequest);

      // Create the project
      const project = await this.createProject(quote, quoteRequest, clientUserId);

      // Create initial project tasks
      await this.createInitialProjectTasks(project.id, quote);

      // Create welcome message
      await this.createWelcomeMessage(project.id, quote);

      console.log('Project created successfully:', project.id);

      return {
        success: true,
        projectId: project.id,
        project: project
      };

    } catch (error: any) {
      console.error('Failed to create project from quote:', error);
      return {
        success: false,
        error: error.message || 'Failed to create project'
      };
    }
  }

  private async findOrCreateClient(quoteRequest: QuoteRequest): Promise<string> {
    // Try to find existing user by email
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', quoteRequest.email)
      .single();

    if (!userError && existingUser) {
      console.log('Found existing client:', existingUser.id);
      return existingUser.id;
    }

    // Create new user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: quoteRequest.email,
      password: this.generateTemporaryPassword(),
      options: {
        data: {
          full_name: quoteRequest.full_name,
          phone: quoteRequest.phone,
          created_from: 'quote_approval'
        }
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: quoteRequest.email,
        full_name: quoteRequest.full_name,
        phone: quoteRequest.phone || '',
        role: 'member',
        status: 'approved',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to create profile: ${profileError?.message}`);
    }

    console.log('Created new client:', profile.id);
    return profile.id;
  }

  private async createProject(quote: Quote, quoteRequest: QuoteRequest, clientUserId: string) {
    const projectData = {
      title: `${quote.service_type} Project - ${quoteRequest.full_name}`,
      description: quote.scope || `${quote.service_type} project based on approved quote`,
      client_id: clientUserId,
      project_manager_id: quote.created_by,
      service_type: quote.service_type,
      status: 'planning',
      priority: 'medium',
      budget: quote.price,
      estimated_hours: this.estimateHoursFromTimeline(quote.timeline),
      start_date: new Date().toISOString().split('T')[0],
      end_date: this.calculateTargetDate(quote.timeline),
      deadline: this.calculateTargetDate(quote.timeline)
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error || !project) {
      throw new Error(`Failed to create project: ${error?.message}`);
    }

    return project;
  }

  private async createInitialProjectTasks(projectId: string, quote: Quote) {
    const tasks = this.getTaskTemplateForService(quote.service_type, quote.deliverables);
    
    if (tasks.length === 0) return;

    const taskData = tasks.map((task, index) => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      task_type: task.type,
      priority: task.priority,
      status: 'todo',
      estimated_hours: task.estimatedHours,
      assigned_to: quote.created_by,
      order_index: index,
      due_date: this.calculateTaskDueDate(task.dayOffset),
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('project_tasks')
      .insert(taskData);

    if (error) {
      console.error('Failed to create initial tasks:', error);
    } else {
      console.log(`Created ${taskData.length} initial tasks for project ${projectId}`);
    }
  }

  private async createWelcomeMessage(projectId: string, quote: Quote) {
    const welcomeMessage = `Welcome to your project!

Your quote has been approved and your project is now officially underway. Here's what happens next:

Project Details:
• Service: ${quote.service_type}
• Budget: ${quote.currency} ${quote.price.toLocaleString()}
• Timeline: ${quote.timeline}

Next Steps:
1. Our project manager will contact you within 24 hours
2. We'll schedule a project kickoff meeting
3. You'll receive access to our client portal for progress tracking
4. Regular updates will be provided throughout the project

Your Deliverables:
${quote.deliverables.map(d => `• ${d}`).join('\n')}

Thank you for choosing NexaCore Innovations! We're excited to work with you.

Questions? Reply to this message or contact us directly.`;

    const { error } = await supabase
      .from('project_messages')
      .insert([{
        project_id: projectId,
        sender_id: quote.created_by,
        message: welcomeMessage,
        message_type: 'general',
        is_internal: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Failed to create welcome message:', error);
    }
  }

  private getTaskTemplateForService(serviceType: string, deliverables: string[]) {
    const commonTasks = [
      {
        title: 'Project Kickoff & Requirements Review',
        description: 'Initial client meeting, requirements validation, and project setup',
        type: 'planning',
        priority: 'high',
        estimatedHours: 4,
        dayOffset: 1
      },
      {
        title: 'Project Planning & Timeline Creation',
        description: 'Detailed project planning, milestone definition, and timeline creation',
        type: 'planning',
        priority: 'high',
        estimatedHours: 6,
        dayOffset: 3
      }
    ];

    const serviceSpecificTasks: { [key: string]: any[] } = {
      'Web Development': [
        {
          title: 'Technical Architecture & Design',
          description: 'System architecture design and technical specifications',
          type: 'development',
          priority: 'high',
          estimatedHours: 8,
          dayOffset: 5
        },
        {
          title: 'Frontend Development',
          description: 'User interface and user experience implementation',
          type: 'development',
          priority: 'medium',
          estimatedHours: 40,
          dayOffset: 10
        },
        {
          title: 'Backend Development',
          description: 'Server-side logic and database implementation',
          type: 'development',
          priority: 'medium',
          estimatedHours: 35,
          dayOffset: 15
        },
        {
          title: 'Testing & Quality Assurance',
          description: 'Comprehensive testing and bug fixes',
          type: 'testing',
          priority: 'high',
          estimatedHours: 16,
          dayOffset: 45
        }
      ],
      'Mobile Development': [
        {
          title: 'Mobile UI/UX Design',
          description: 'Mobile-specific interface design and prototyping',
          type: 'design',
          priority: 'high',
          estimatedHours: 12,
          dayOffset: 5
        },
        {
          title: 'Native App Development',
          description: 'Core mobile application development',
          type: 'development',
          priority: 'high',
          estimatedHours: 60,
          dayOffset: 15
        },
        {
          title: 'Mobile Testing & Optimization',
          description: 'Device testing and performance optimization',
          type: 'testing',
          priority: 'high',
          estimatedHours: 20,
          dayOffset: 50
        }
      ],
      'AI Development': [
        {
          title: 'AI Model Research & Selection',
          description: 'Research and select appropriate AI models and frameworks',
          type: 'research',
          priority: 'high',
          estimatedHours: 16,
          dayOffset: 7
        },
        {
          title: 'Data Preparation & Training',
          description: 'Prepare datasets and train AI models',
          type: 'development',
          priority: 'high',
          estimatedHours: 40,
          dayOffset: 20
        },
        {
          title: 'AI Integration & Testing',
          description: 'Integrate AI models into application and test performance',
          type: 'integration',
          priority: 'high',
          estimatedHours: 25,
          dayOffset: 40
        }
      ]
    };

    const deliverableTasks = deliverables.map((deliverable, index) => ({
      title: `Deliver: ${deliverable}`,
      description: `Complete and deliver: ${deliverable}`,
      type: 'deliverable',
      priority: 'medium',
      estimatedHours: 8,
      dayOffset: 30 + (index * 5)
    }));

    return [
      ...commonTasks,
      ...(serviceSpecificTasks[serviceType] || []),
      ...deliverableTasks,
      {
        title: 'Final Review & Project Handover',
        description: 'Final quality review, documentation, and project handover',
        type: 'completion',
        priority: 'high',
        estimatedHours: 6,
        dayOffset: 60
      }
    ];
  }

  private generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  }

  private estimateHoursFromTimeline(timeline: string): number {
    const timelineLower = timeline.toLowerCase();
    if (timelineLower.includes('week')) {
      const weeks = parseInt(timelineLower.match(/\d+/)?.[0] || '4');
      return weeks * 40;
    }
    if (timelineLower.includes('month')) {
      const months = parseInt(timelineLower.match(/\d+/)?.[0] || '2');
      return months * 160;
    }
    if (timelineLower.includes('day')) {
      const days = parseInt(timelineLower.match(/\d+/)?.[0] || '30');
      return days * 8;
    }
    return 160;
  }

  private calculateTargetDate(timeline: string): string {
    const timelineLower = timeline.toLowerCase();
    let daysToAdd = 60;

    if (timelineLower.includes('week')) {
      const weeks = parseInt(timelineLower.match(/\d+/)?.[0] || '4');
      daysToAdd = weeks * 7;
    } else if (timelineLower.includes('month')) {
      const months = parseInt(timelineLower.match(/\d+/)?.[0] || '2');
      daysToAdd = months * 30;
    } else if (timelineLower.includes('day')) {
      daysToAdd = parseInt(timelineLower.match(/\d+/)?.[0] || '60');
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  }

  private calculateTaskDueDate(dayOffset: number): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dayOffset);
    return dueDate.toISOString().split('T')[0];
  }

  private getProjectTypeFromService(serviceType: string): string {
    const typeMapping: { [key: string]: string } = {
      'Web Development': 'web_development',
      'Mobile Development': 'mobile_development',
      'AI Development': 'ai_development',
      'Consulting': 'consulting',
      'Digital Engineering': 'digital_engineering',
      'Data Analysis': 'data_analysis'
    };
    return typeMapping[serviceType] || 'general';
  }
}

export const projectCreationService = new ProjectCreationService();
