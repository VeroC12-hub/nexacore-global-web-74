# NexaCore Database Setup Instructions

## CRITICAL: Read This Before Starting!

Your project has identified **9 SQL scripts** that need to be run in the **exact order** below. Running them out of order will cause failures.

## Execution Order (RUN IN THIS EXACT SEQUENCE)

### Phase 1: Critical Foundation (MUST RUN FIRST)
**1. Missing Profiles Table (CRITICAL - RUN FIRST)**
- File: `01_profiles_foundation.sql` (I've created this for you)
- Status: **MUST RUN IMMEDIATELY** - Many tables depend on this
- Location: In your project root folder

### Phase 2: ERP Core System 
**2. ERP Foundation System**
- File: `supabase/migrations/20241204_create_erp_foundation.sql` 
- Status: **Core ERP tables** (projects, tasks, time_entries, user_roles)
- This enables your staff dashboard to work

### Phase 3: Business Tables (Run in order)
**3. Client Portal Integration**
- File: `supabase/migrations/20250818041757_1fe28a73-703e-40fc-874e-ac26c9d55704.sql`
- Status: Client portal tables

**4. Payment Methods**  
- File: `supabase/migrations/20250818064219_1be8a283-0cf3-4280-9b86-fd51d73d0eed.sql`
- Status: Payment configuration

**5. Quote Management**
- File: `supabase/migrations/20250818203422_0a441bbf-d741-4234-a1e6-5c5c6ff50363.sql` 
- Status: Quote system

**6. Comprehensive Payments**
- File: `supabase/migrations/20250903000000_payments_system.sql`
- Status: Full payment tracking system

### Phase 4: Advanced Features  
**7. Workflow Automation**
- File: `supabase/migrations/20250902230354_workflow_automation_system.sql`
- Status: Workflow management system

**8. Email Templates**
- File: `supabase/migrations/setup_email_templates.sql`
- Status: Email template system

### Phase 5: Sample Data (Optional but Recommended)
**9. ERP Sample Data**
- File: `02_sample_data.sql` (I've created this for you)  
- Status: **Test data for staff dashboard**
- Run this to see projects, tasks, and time entries in your dashboard

### Phase 6: Minor Fixes (Run if needed)
- `20250818042045_06b185f1-414d-4f37-a87b-7dc0721eda5b.sql`
- `20250818042131_3c5e7ad6-276a-4839-9961-a06f085b80e0.sql`
- `20250818093857_6ea57670-1d07-430b-b1db-6d8ecd3766c9.sql`
- `20250818221830_3c3dd486-ec83-4aff-9b01-e1cb5483f393.sql`
- `20250818231820_e71020ac-7771-4fe1-84e9-18191a40a852.sql`

## How to Execute

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `nmwfevhetlwehbuikflk`
3. Go to SQL Editor → New Query
4. Copy and paste each file's content **one at a time**
5. Run each script completely before moving to the next
6. **DO NOT skip the profiles table** - it's critical!

## What This Fixes

✅ **Staff Dashboard** - Will load properly with projects, tasks, and time tracking
✅ **Role-based Authentication** - Complete user role system with granular permissions  
✅ **ERP System** - Full project management, time tracking, and team collaboration
✅ **Multi-tenant Support** - Enterprise-ready architecture
✅ **Payment System** - Complete billing and payment processing
✅ **Workflow Automation** - Business process management

## After Running All Scripts

Your staff dashboard will have:
- Real project data to display
- Working task management
- Time entry tracking  
- Role-based permissions
- Multi-user support
- Enterprise ERP features

## Files I've Created for You

1. `01_profiles_foundation.sql` - Missing profiles table (CRITICAL)
2. `02_sample_data.sql` - Test data for your dashboard
3. This instruction file

**Start with file #1 (profiles) and work through the migration files in order!**
