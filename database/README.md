# Database Setup & Migrations

This directory contains all database-related files for the NexaCore ERP system.

## Directory Structure

```
database/
├── migrations/              # Database migration scripts
│   └── 01_erp_system_setup.sql
├── archive/                # Archive of development SQL files
└── README.md               # This file
```

## Setup Instructions

### 1. Initial ERP System Setup

Run the main migration script in your Supabase SQL Editor:

```sql
-- Run this file: database/migrations/01_erp_system_setup.sql
```

This script creates:
- **ERP Projects table** - Separate from client portal projects
- **ERP Tasks table** - Task management for staff
- **ERP Time Entries table** - Time tracking and billing
- **ERP Staff Roles table** - Role-based permissions
- **ERP Project Teams table** - Project team assignments

### 2. Features Included

#### Tables Created
- `erp_projects` - Internal project management
- `erp_tasks` - Task assignment and tracking
- `erp_time_entries` - Time logging and billing
- `erp_staff_roles` - User roles and permissions
- `erp_project_teams` - Team assignments

#### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control policies
- Secure data isolation between users

#### Sample Data
- 7 sample projects with various statuses
- 12 sample tasks across different projects
- 8 sample time entries for testing
- Predefined role templates for different staff types

### 3. Role System

The system includes 8 predefined role types:
- **Admin** - Full system access
- **Project Manager** - Project oversight and team management
- **Operations Manager** - Operations and workflow management
- **Developer** - Development tasks and time tracking
- **Designer** - Design tasks and creative work
- **QA Tester** - Quality assurance and testing
- **Business Analyst** - Requirements and analysis
- **Support** - Customer support and assistance

### 4. Permissions

Each role has specific permissions:
- `can_approve_timesheets` - Approve time entries
- `can_create_projects` - Create new projects
- `can_manage_users` - Manage team members
- `can_view_all_projects` - See all projects vs. only assigned ones

### 5. Usage

After running the migration:

1. **Access Admin Settings**: Go to Admin Dashboard → Settings → ERP Staff Roles
2. **Assign Roles**: Create staff roles for your team members
3. **Set Permissions**: Configure who can view/edit what in the system
4. **Manage Projects**: Use the Staff Dashboard to manage ERP projects and tasks

## Archive

The `archive/` directory contains development SQL files that were used during the system development but are not needed for production deployment.