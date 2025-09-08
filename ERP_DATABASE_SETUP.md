# ERP Database Foreign Key Relationships Setup

## Overview
This document outlines the proper foreign key relationships for the NexaCore ERP system and provides setup instructions.

## Required Foreign Key Relationships

### 1. Tasks to Projects
- **Table**: `erp_tasks`
- **Foreign Key**: `erp_project_id` → `erp_projects.id`
- **Purpose**: Link tasks to their parent projects
- **Constraint**: `ON DELETE CASCADE`

### 2. Time Entries to Projects  
- **Table**: `erp_time_entries`
- **Foreign Key**: `erp_project_id` → `erp_projects.id`
- **Purpose**: Track time spent on specific projects
- **Constraint**: `ON DELETE CASCADE`

### 3. Time Entries to Tasks
- **Table**: `erp_time_entries` 
- **Foreign Key**: `erp_task_id` → `erp_tasks.id`
- **Purpose**: Track time spent on specific tasks
- **Constraint**: `ON DELETE CASCADE`

### 4. Time Entries to Users
- **Table**: `erp_time_entries`
- **Foreign Key**: `user_id` → `profiles.id`
- **Purpose**: Track which user logged the time
- **Constraint**: `ON DELETE CASCADE`

### 5. Task Assignments to Users
- **Table**: `erp_tasks`
- **Foreign Key**: `assigned_to` → `profiles.id`  
- **Purpose**: Assign tasks to specific users
- **Constraint**: `ON DELETE SET NULL`

### 6. Project Teams to Projects
- **Table**: `erp_project_teams`
- **Foreign Key**: `erp_project_id` → `erp_projects.id`
- **Purpose**: Link team members to projects
- **Constraint**: `ON DELETE CASCADE`

### 7. Project Teams to Users
- **Table**: `erp_project_teams`
- **Foreign Key**: `user_id` → `profiles.id`
- **Purpose**: Identify team members
- **Constraint**: `ON DELETE CASCADE`

## Setup Instructions

### Step 1: Run Schema Analysis
Execute `analyze_erp_schema.sql` in your Supabase SQL editor to understand current database structure.

### Step 2: Setup Foreign Keys
Execute `setup_erp_foreign_keys.sql` in your Supabase SQL editor. This script:
- Safely adds foreign key constraints if they don't exist
- Uses DO blocks to prevent duplicate constraint errors
- Provides detailed logging of what was created
- Includes verification queries

### Step 3: Verify Setup
The setup script includes verification queries that will show all foreign key relationships.

## Query Benefits

### Before (Basic Queries)
```sql
SELECT * FROM erp_time_entries;
```

### After (Rich Relational Queries)
```sql
SELECT 
  *,
  erp_project:erp_project_id (id, title, status),
  erp_task:erp_task_id (id, title, status),
  user:user_id (id, full_name, email)
FROM erp_time_entries;
```

## Application Updates

The following files have been updated to use proper foreign key relationships:

1. **`src/components/staff/ModernStaffDashboard.tsx`**
   - Enhanced task queries with project and assignee information
   - Enhanced time entry queries with project, task, and user information

2. **`src/components/admin/AdminERPTab.tsx`**
   - Enhanced task queries with project and assignee information  
   - Enhanced time entry queries with project, task, and user information

## Error Handling

The queries now provide much richer data but will fail if:
1. Foreign key relationships are not properly established
2. Referenced records don't exist (orphaned data)
3. Column types don't match between tables

If you encounter 400 errors, run the foreign key setup script first.

## Data Integrity Benefits

With proper foreign keys:
- ✅ **Referential Integrity**: Prevents orphaned records
- ✅ **Cascade Deletes**: Automatically clean up related data
- ✅ **Rich Queries**: Get related data in single queries
- ✅ **Better Performance**: Optimized joins
- ✅ **Data Validation**: Ensures valid relationships

## Troubleshooting

If foreign key creation fails:
1. Check for existing invalid references
2. Clean up orphaned records first
3. Verify column types match between tables
4. Ensure referenced tables exist

The setup script includes error handling for these scenarios.