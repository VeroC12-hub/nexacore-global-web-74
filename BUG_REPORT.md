# 🐛 Bug Report - NexaCore ERP System
**Date:** December 26, 2025
**Reviewed by:** Claude Code Comprehensive Review

## ❌ CRITICAL BUGS FOUND

### 🔴 BUG #1: TaskFormModal - Missing Project Field in Update Query
**File:** `src/components/admin/erp/TaskFormModal.tsx`
**Lines:** 165-186
**Severity:** HIGH

**Issue:**
When updating an existing task, the `erp_project_id` field is NOT included in the update query. This means users cannot change which project a task belongs to when editing.

**Current Code (Line 165-182):**
```typescript
const updateData = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  status: formData.status === 'todo' ? 'new' : formData.status,
  priority: formData.priority,
  assigned_to: formData.assignee_id || null,
  due_date: formData.due_date,
  estimated_hours: formData.estimated_hours,
  actual_hours: formData.actual_hours || 0
  // ❌ MISSING: erp_project_id field!
};
```

**Fix Required:**
```typescript
const updateData = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  status: formData.status === 'todo' ? 'new' : formData.status,
  priority: formData.priority,
  erp_project_id: formData.project_id,  // ✅ ADD THIS LINE
  assigned_to: formData.assignee_id || null,
  due_date: formData.due_date,
  estimated_hours: formData.estimated_hours,
  actual_hours: formData.actual_hours || 0
};
```

---

### ⚠️ POTENTIAL ISSUE #2: Database Schema Not in Types File
**File:** `src/integrations/supabase/types.ts`
**Severity:** MEDIUM

**Issue:**
The following ERP tables are NOT defined in the Supabase types file:
- `erp_projects`
- `erp_tasks`
- `erp_time_entries`
- `erp_staff_roles` (used in AdminSettingsTab.tsx)
- `project_members` (used in AdminERPTab.tsx line 630)

**Impact:**
- TypeScript cannot validate these table structures
- No autocomplete for table columns
- Potential runtime errors if schema changes

**Fix Required:**
Either:
1. The database tables need to be created in Supabase
2. OR the types file needs to be regenerated from the existing schema

---

### ✅ VERIFIED WORKING

#### TypeScript Compilation
- ✅ Zero TypeScript errors
- ✅ All imports/exports correct
- ✅ Build succeeds (1m 57s)

#### Component Structure
- ✅ ProjectFormModal: Complete and validated
- ✅ ProjectViewModal: Complete and validated
- ✅ ERPProjectsTab: Properly integrated
- ✅ All modal exports in index.ts

---

## 📊 Database Schema Expected (Based on Code Analysis)

### Table: `erp_projects`
```sql
CREATE TABLE erp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  actual_cost DECIMAL(12, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `erp_tasks`
```sql
CREATE TABLE erp_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'review', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  erp_project_id UUID REFERENCES erp_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  estimated_hours DECIMAL(6, 2) NOT NULL,
  actual_hours DECIMAL(6, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `erp_time_entries`
```sql
CREATE TABLE erp_time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  erp_project_id UUID REFERENCES erp_projects(id) ON DELETE CASCADE NOT NULL,
  erp_task_id UUID REFERENCES erp_tasks(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL(6, 2) NOT NULL,
  hourly_rate DECIMAL(8, 2) DEFAULT 0,
  billable BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `project_members`
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES erp_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(project_id, user_id)
);
```

---

## 🔧 FIXES REQUIRED (Priority Order)

1. **FIX BUG #1** - Add `erp_project_id` to TaskFormModal update query
2. **VERIFY DATABASE** - Ensure all ERP tables exist in Supabase
3. **REGENERATE TYPES** - Run Supabase type generation to update types.ts
4. **TEST RUNTIME** - Test all CRUD operations in browser
5. **DOCUMENT SCHEMA** - Create migration SQL files for deployment

---

## ⏱️ Time Estimate
- Fix Bug #1: 2 minutes
- Test fixes: 5 minutes
- Database verification: 10 minutes
- **Total:** ~17 minutes

