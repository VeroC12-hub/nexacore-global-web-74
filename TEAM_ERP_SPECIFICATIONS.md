# NexaCore Team ERP System - Technical Specifications

## Project Overview
Transform NexaCore's current client portal system into a comprehensive ERP solution that serves both internal team management and can be productized for other businesses.

## Architecture Decision: Option 1 - Route-Based Multi-Tenant

### Route Structure
```
nexacore-innovations.com/
├── / → Public Website (Marketing, about, services)
├── /team → Public team information page 
├── /client → Client Portal (existing system)
├── /staff → Internal Staff Dashboard (NEW)
├── /admin → Enhanced Admin Panel 
└── /erp → Future ERP Product Dashboard
```

## Phase 1: Internal Staff Dashboard (4-6 weeks)

### Core Features
1. **Role-Based Access Control**
   - Admin (Full access)
   - Project Manager (Project oversight, team coordination)
   - Developer/Staff (Task management, time tracking)
   - Support (Client communication, documentation)

2. **Project Management Hub**
   - All projects overview with status indicators
   - Task assignment and tracking
   - Team workload distribution
   - Project timeline and milestones

3. **Time Tracking & Billing**
   - Log hours per project/task
   - Automatic billing calculation
   - Team productivity metrics
   - Client billing integration

4. **Internal Communication**
   - Team messaging within projects
   - Announcement system
   - Task comments and updates
   - File sharing and collaboration

## Database Schema Enhancements

### New Tables

```sql
-- Tenant Management
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'project_manager', 'developer', 'support', 'client')),
  permissions TEXT[] DEFAULT '{}',
  department TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task Management
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP,
  estimated_hours DECIMAL(4,2),
  actual_hours DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Time Tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT,
  hours DECIMAL(4,2) NOT NULL,
  billable BOOLEAN DEFAULT true,
  rate DECIMAL(8,2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Team Messages
CREATE TABLE team_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  sender_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'update', 'announcement', 'question')),
  parent_id UUID REFERENCES team_messages(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- File Management
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id),
  uploaded_by UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Tenant Isolation
CREATE POLICY tenant_isolation_tasks ON tasks
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_time_entries ON time_entries
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_team_messages ON team_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## Frontend Architecture

### New Components Structure
```
src/
├── components/
│   ├── staff/
│   │   ├── StaffDashboard.tsx
│   │   ├── ProjectOverview.tsx
│   │   ├── TaskManager.tsx
│   │   ├── TimeTracker.tsx
│   │   ├── TeamCommunication.tsx
│   │   └── FileManager.tsx
│   ├── shared/
│   │   ├── RoleGuard.tsx
│   │   ├── TenantProvider.tsx
│   │   └── PermissionCheck.tsx
├── pages/
│   ├── StaffDashboard.tsx
│   └── staff/
│       ├── projects/
│       ├── tasks/
│       ├── time-tracking/
│       └── team/
├── hooks/
│   ├── useRolePermissions.ts
│   ├── useTenant.ts
│   ├── useTaskManagement.ts
│   └── useTimeTracking.ts
└── types/
    ├── staff.ts
    ├── tasks.ts
    └── tenant.ts
```

### Authentication Enhancement

```typescript
// Enhanced user context with tenant and role information
interface EnhancedUser {
  id: string;
  email: string;
  tenant_id: string;
  role: 'admin' | 'project_manager' | 'developer' | 'support' | 'client';
  permissions: string[];
  department?: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
    position?: string;
  };
}

// Route protection middleware
const StaffRouteGuard = ({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: string[];
}) => {
  const { user, loading } = useUser();
  const { hasRole } = useRolePermissions();

  if (loading) return <LoadingSpinner />;
  
  if (!user || user.tenant_id !== 'nexacore') {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
```

## Implementation Roadmap

### Week 1-2: Foundation Setup
- [ ] Create database schema and migrations
- [ ] Set up tenant isolation with RLS policies
- [ ] Implement enhanced authentication system
- [ ] Create basic staff dashboard layout
- [ ] Set up role-based routing

### Week 3-4: Core Features
- [ ] Project overview dashboard with status tracking
- [ ] Task creation, assignment, and management system
- [ ] Basic time tracking functionality
- [ ] Team communication system (messages, comments)
- [ ] File upload and management

### Week 5-6: Advanced Features
- [ ] Advanced reporting and analytics
- [ ] Team performance metrics
- [ ] Integration with existing client portal
- [ ] Mobile-responsive design optimization
- [ ] Notification system (email, in-app)

## API Endpoints

### Staff Dashboard API
```typescript
// Project Management
GET /api/staff/projects - Get all projects with team assignments
POST /api/staff/projects - Create new project
PUT /api/staff/projects/:id - Update project details
DELETE /api/staff/projects/:id - Archive project

// Task Management
GET /api/staff/tasks - Get tasks (filterable by project, assignee, status)
POST /api/staff/tasks - Create new task
PUT /api/staff/tasks/:id - Update task status/details
DELETE /api/staff/tasks/:id - Delete task

// Time Tracking
GET /api/staff/time-entries - Get time entries (filterable by date, project, user)
POST /api/staff/time-entries - Log time entry
PUT /api/staff/time-entries/:id - Update time entry
DELETE /api/staff/time-entries/:id - Delete time entry

// Team Communication
GET /api/staff/messages - Get team messages
POST /api/staff/messages - Send message
PUT /api/staff/messages/:id - Update message
DELETE /api/staff/messages/:id - Delete message

// Analytics
GET /api/staff/analytics/productivity - Team productivity metrics
GET /api/staff/analytics/projects - Project performance analytics
GET /api/staff/analytics/time - Time utilization reports
```

## Security Considerations

### Access Control
- JWT tokens with tenant_id and role claims
- Row-level security on all tenant-specific data
- API endpoint permissions based on user roles
- Session management with automatic logout

### Data Protection
- All sensitive data encrypted at rest
- HTTPS enforcement for all communications
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Performance Optimizations

### Database
- Proper indexing on tenant_id and frequently queried fields
- Connection pooling with Supabase
- Query optimization with proper joins
- Caching strategy for frequently accessed data

### Frontend
- Code splitting by routes
- Lazy loading of components
- Memoization of expensive calculations
- Optimized re-renders with React.memo

## Testing Strategy

### Unit Tests
- Component testing with Jest and React Testing Library
- API endpoint testing
- Database query testing
- Authentication/authorization testing

### Integration Tests
- Full workflow testing (create project → assign tasks → track time)
- Cross-tenant data isolation verification
- Role-based access testing
- File upload/download testing

## Deployment Strategy

### Development Environment
- Continue using current Vite dev server
- Supabase development instance
- Hot reload for rapid development

### Production Deployment
- Vercel deployment (existing setup)
- Supabase production instance
- Environment variable management
- CI/CD pipeline with automated testing

## Future Enhancements (Phase 2+)

### Advanced ERP Features
- Financial management integration
- HR management (payroll, benefits, performance reviews)
- Inventory and asset management
- Advanced reporting and business intelligence
- Mobile app development
- Third-party integrations (accounting software, CRM tools)

### Multi-Tenant Product Features
- Client onboarding system
- Billing and subscription management
- White-label customization
- Marketplace for third-party modules
- Advanced admin controls for tenant management

## Risk Mitigation

### Technical Risks
- **Database Performance**: Proper indexing and query optimization
- **Security Vulnerabilities**: Regular security audits and updates
- **Scalability Issues**: Horizontal scaling with microservices architecture

### Business Risks
- **Feature Creep**: Strict adherence to phased development approach
- **User Adoption**: Comprehensive training and change management
- **Data Migration**: Robust backup and rollback procedures

## Success Metrics

### Development Metrics
- Code coverage > 80%
- Page load times < 2 seconds
- Zero security vulnerabilities
- 99.9% uptime

### Business Metrics
- Team productivity increase > 25%
- Project delivery time reduction > 20%
- Client satisfaction improvement > 15%
- Internal process automation > 50%

## Conclusion

This technical specification provides a comprehensive roadmap for transforming NexaCore's current system into a full-featured ERP solution. The phased approach ensures minimal disruption to existing operations while delivering immediate value to the internal team.

The route-based multi-tenant architecture provides the foundation for future product development, allowing NexaCore to eventually offer this system as a SaaS product to other businesses.