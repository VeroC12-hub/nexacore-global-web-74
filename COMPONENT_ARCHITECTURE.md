# Component Architecture & Active Components

## 🎯 Purpose
This document clarifies which components are actively used in production vs development/archived versions.

Last Updated: January 4, 2026

---

## 🏗️ Active Components (In Use)

### **Dashboard Components:**

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **ModernAdminDashboard** | `/src/components/admin/ModernAdminDashboard.tsx` | Main admin dashboard | ✅ ACTIVE |
| **ModernStaffDashboard** | `/src/components/staff/ModernStaffDashboard.tsx` | Main staff dashboard | ✅ ACTIVE |
| **Dashboard (Client)** | `/src/pages/Dashboard.tsx` | Client portal dashboard | ✅ ACTIVE |

**Reasoning:** "Modern" versions are the current, actively maintained implementations with latest features.

---

### **AI Assistant Components:**

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **EnhancedAIAssistant** | `/src/components/EnhancedAIAssistant.tsx` | Main AI chat component | ✅ ACTIVE |
| **useAIAssistant** | `/src/hooks/useAIAssistant.ts` | AI state management hook | ✅ ACTIVE |
| **aiRouter** | `/src/lib/aiRouter.ts` | Smart AI routing (Claude/Local) | ✅ ACTIVE |
| **localAI** | `/src/lib/localAI.ts` | Pattern-matching AI (free) | ✅ ACTIVE |
| **claudeClient** | `/src/lib/claudeClient.ts` | Claude API client | ✅ ACTIVE |

**Archived:**
- ❌ `AIAssistant.tsx` - Old version, replaced by EnhancedAIAssistant

**Reasoning:** Enhanced version has better UX, markdown rendering, feedback system, and smart routing.

---

### **Portfolio Components:**

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **DynamicPortfolioDisplay** | `/src/components/portfolio/DynamicPortfolioDisplay.tsx` | Main portfolio display | ✅ ACTIVE |
| **AdvancedPortfolioSearch** | `/src/components/portfolio/AdvancedPortfolioSearch.tsx` | Portfolio search functionality | ✅ ACTIVE |
| **PortfolioExport** | `/src/components/portfolio/PortfolioExport.tsx` | Export portfolio data | ✅ ACTIVE |
| **AdminPortfolioTab** | `/src/components/admin/AdminPortfolioTab.tsx` | Admin portfolio management | ✅ ACTIVE |

**Deleted:**
- ❌ `AdminPortfolioTab-clean.tsx` - Duplicate, deleted during cleanup

**Reasoning:** Dynamic display offers best performance and user experience.

---

### **Analytics Components:**

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **AdminAnalytics** | `/src/components/analytics/AdminAnalytics.tsx` | Admin-level analytics | ✅ ACTIVE |
| **ClientAnalytics** | `/src/components/analytics/ClientAnalytics.tsx` | Client portal analytics | ✅ ACTIVE |
| **SearchAnalyticsDashboard** | `/src/components/admin/erp/SearchAnalyticsDashboard.tsx` | Search-specific analytics | ✅ ACTIVE |
| **PortfolioAnalyticsDashboard** | `/src/components/admin/PortfolioAnalyticsDashboard.tsx` | Portfolio analytics | ✅ ACTIVE |
| **ProjectAnalyticsDashboard** | `/src/components/admin/ProjectAnalyticsDashboard.tsx` | Project analytics | ✅ ACTIVE |

**Reasoning:** Different analytics for different user roles and data types.

---

### **ERP System Components:**

All ERP components in `/src/components/admin/erp/` are **ACTIVE**:
- ✅ ERPLayout.tsx
- ✅ ERPDashboard.tsx
- ✅ ERPDocuments.tsx
- ✅ ERPInventory.tsx
- ✅ ERPProjects.tsx
- ✅ ERPClients.tsx
- ✅ And 9 more specialized ERP components

**Reasoning:** Comprehensive ERP system for business management.

---

### **Payment Components:**

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| **PaymentModal** | `/src/components/payments/PaymentModal.tsx` | Payment processing UI | ✅ ACTIVE |
| **InvoicePaymentCard** | `/src/components/payments/InvoicePaymentCard.tsx` | Invoice payment display | ✅ ACTIVE |

---

### **UI Component Library (shadcn/ui):**

All 40+ components in `/src/components/ui/` are **ACTIVE** and part of the design system:
- button.tsx, card.tsx, dialog.tsx, input.tsx, select.tsx, table.tsx, etc.

**Reasoning:** Core UI library used throughout the application.

---

## 📁 Active Pages

| Page | Location | Purpose | Status |
|------|----------|---------|--------|
| **Index** | `/src/pages/Index.tsx` | Homepage | ✅ ACTIVE |
| **About** | `/src/pages/About.tsx` | About page | ✅ ACTIVE |
| **Services** | `/src/pages/Services.tsx` | Services overview | ✅ ACTIVE |
| **Portfolio** | `/src/pages/Portfolio.tsx` | Portfolio showcase | ✅ ACTIVE |
| **Contact** | `/src/pages/Contact.tsx` | Contact page | ✅ ACTIVE |
| **Dashboard** | `/src/pages/Dashboard.tsx` | Client dashboard | ✅ ACTIVE |
| **AdminDashboard** | `/src/pages/AdminDashboard.tsx` | Admin dashboard page | ✅ ACTIVE |
| **StaffDashboardPage** | `/src/pages/StaffDashboardPage.tsx` | Staff dashboard page | ✅ ACTIVE |
| **Auth** | `/src/pages/Auth.tsx` | Authentication page | ✅ ACTIVE |
| **PayInvoice** | `/src/pages/PayInvoice.tsx` | Invoice payment | ✅ ACTIVE |

**Service Detail Pages:**
- ✅ `/src/pages/services/AIMLServices.tsx`
- ✅ `/src/pages/services/BlockchainServices.tsx`
- ✅ `/src/pages/services/CADServices.tsx`
- ✅ `/src/pages/services/EngineeringTechnical.tsx`

---

## 🔧 Active Hooks

| Hook | Location | Purpose | Status |
|------|----------|---------|--------|
| **useAIAssistant** | `/src/hooks/useAIAssistant.ts` | AI chat state management | ✅ ACTIVE |
| **useEnhancedAuth** | `/src/hooks/useEnhancedAuth.tsx` | Authentication & user management | ✅ ACTIVE |
| **useERPPortfolio** | `/src/hooks/useERPPortfolio.ts` | ERP portfolio integration | ✅ ACTIVE |
| **useSEO** | `/src/hooks/useSEO.ts` | SEO meta tags management | ✅ ACTIVE |
| **useVoiceSearch** | `/src/hooks/useVoiceSearch.ts` | Voice search functionality | ✅ ACTIVE |
| **useRolePermissions** | `/src/hooks/useRolePermissions.ts` | Role-based access control | ✅ ACTIVE |
| **use-mobile** | `/src/hooks/use-mobile.tsx` | Mobile device detection | ✅ ACTIVE |

---

## 📚 Active Libraries & Utilities

### **AI System:**
- ✅ `/src/lib/aiRouter.ts` - Smart AI routing
- ✅ `/src/lib/claudeClient.ts` - Claude API integration
- ✅ `/src/lib/localAI.ts` - Local pattern-matching AI
- ✅ `/src/lib/utils.ts` - General utilities

### **Utilities:**
- ✅ `/src/utils/advancedSearch.ts` - Advanced search functionality
- ✅ `/src/utils/analyticsConfig.ts` - Analytics configuration
- ✅ `/src/utils/erpSearch.ts` - ERP search utilities
- ✅ `/src/utils/performanceOptimization.ts` - Performance tools
- ✅ `/src/utils/searchAnalytics.ts` - Search tracking
- ✅ `/src/utils/searchHistory.ts` - Search history management
- ✅ `/src/utils/searchOperators.ts` - Search query parsing
- ✅ `/src/utils/seo.ts` - SEO utilities
- ✅ `/src/utils/seoAnalytics.ts` - SEO tracking

### **Services:**
- ✅ `/src/services/projectCreationService.ts` - Project creation logic
- ✅ `/src/services/userDeletionService.ts` - User deletion logic
- ✅ `/src/services/workflowMigration.ts` - Workflow migration utilities

---

## 🗄️ Database Migrations (Active)

**Primary Migration Location:** `/supabase/migrations/`

**Latest Migrations (Active):**
- ✅ `20260104000001_ai_assistant_system.sql` - AI assistant tables
- ✅ `20260104000002_populate_knowledge_base.sql` - AI knowledge base data
- ✅ `20260104000003_fix_anonymous_access.sql` - RLS policy fixes
- ✅ `20260104000004_expand_knowledge_base.sql` - Additional AI knowledge
- ✅ `20260104000005_add_signup_and_faqs.sql` - Signup & FAQ knowledge
- ✅ `20250910_portfolio_management.sql` - Portfolio system
- ✅ `20250903000000_payments_system.sql` - Payment processing
- ✅ `20250902230354_workflow_automation_system.sql` - Workflow automation

**Archived Migrations:**
- All migrations in `/database/history/` are archived and superseded by Supabase migrations

---

## 🗂️ Directory Structure (Cleaned)

```
nexacore-global-web-74/
├── src/                          # Application source code ✅
│   ├── components/               # React components ✅
│   ├── pages/                    # Page components ✅
│   ├── hooks/                    # Custom hooks ✅
│   ├── lib/                      # Core libraries ✅
│   ├── utils/                    # Utility functions ✅
│   ├── types/                    # TypeScript types ✅
│   ├── services/                 # Business logic ✅
│   ├── contexts/                 # React contexts ✅
│   └── integrations/             # External integrations ✅
│
├── api/                          # Vercel serverless functions ✅
│   ├── admin/                    # Admin endpoints ✅
│   ├── ai/                       # AI endpoints ✅
│   └── quotes/                   # Quote endpoints ✅
│
├── supabase/                     # Database & backend ✅
│   ├── migrations/               # Database migrations (PRIMARY) ✅
│   ├── functions/                # Edge functions ✅
│   └── templates/                # Email templates ✅
│
├── database/                     # Database setup scripts ✅
│   ├── migrations/               # Legacy migrations ✅
│   └── history/                  # Archived scripts (MOVED) 📦
│
├── docs/                         # Documentation ✅
│   ├── history/                  # Archived docs (MOVED) 📦
│   └── portfolio-development/    # Portfolio SQL scripts ✅
│
├── public/                       # Static assets ✅
│   ├── images/                   # Image assets ✅
│   └── portfolio/                # Portfolio files ✅
│
├── scripts/                      # Automation scripts ✅
│
├── dist/                         # Build output (regenerated) 🔨
├── node_modules/                 # Dependencies (regenerated) 🔨
└── .vercel/                      # Vercel cache (regenerated) 🔨
```

**Legend:**
- ✅ Active and in use
- 📦 Archived/historical
- 🔨 Build artifacts (regenerated)
- ❌ Deleted during cleanup

---

## 🧹 Cleanup Summary (Completed)

### **Deleted:**
1. ✅ `temp-files/` - Empty temporary directory
2. ✅ `temp-uploads/` - Empty temporary directory
3. ✅ `supabase/.temp/` - Supabase CLI temp files
4. ✅ `publicimagesportfoliocad/` - Misnamed directory (moved to proper location)
5. ✅ Duplicate component files (AdminPortfolioTab-clean.tsx, etc.)
6. ✅ Backup files (ModernStaffDashboard.tsx.backup, etc.)
7. ✅ Unused config files (vite.config.ts.proxy, etc.)

### **Reorganized:**
1. ✅ `/docs/archive/` → `/docs/history/`
2. ✅ `/database/archive/` → `/database/history/`
3. ✅ `publicimagesportfoliocad/` → `/public/images/portfolio/cad/`

### **Preserved:**
- ✅ All active components and pages
- ✅ All build configuration files
- ✅ All database migrations (organized)
- ✅ All documentation (organized)
- ✅ All static assets

---

## 📝 Development Guidelines

### **When Creating New Components:**

1. **Use existing patterns:**
   - Follow shadcn/ui component patterns
   - Use TypeScript for type safety
   - Implement proper error handling

2. **Component placement:**
   - Admin components → `/src/components/admin/`
   - Staff components → `/src/components/staff/`
   - Client components → `/src/components/client/`
   - Shared components → `/src/components/`
   - UI primitives → `/src/components/ui/`

3. **Page placement:**
   - Top-level pages → `/src/pages/`
   - Service pages → `/src/pages/services/`

4. **Hook placement:**
   - All custom hooks → `/src/hooks/`
   - Name with `use` prefix

5. **Utility placement:**
   - Pure functions → `/src/utils/`
   - Business logic → `/src/services/`
   - Core libraries → `/src/lib/`

### **Database Changes:**

1. **Always create migrations in `/supabase/migrations/`**
2. **Use timestamp naming:** `YYYYMMDD_description.sql`
3. **Never edit existing migrations** - create new ones
4. **Test migrations locally before deploying**

### **Documentation:**

1. **Update this file** when adding major components
2. **Document breaking changes** in component comments
3. **Keep README.md** up to date with setup instructions

---

## 🚀 Production vs Development

### **Active in Production:**
- All components marked ✅ in this document
- All migrations in `/supabase/migrations/`
- All pages in `/src/pages/`
- All API endpoints in `/api/`

### **Development Only:**
- Files in `/docs/history/`
- Files in `/database/history/`
- Local `.env` file (never committed)
- `node_modules/` (regenerated)
- `dist/` (regenerated)

---

## 📞 Questions?

If you're unsure whether a component is active:
1. Check if it's imported in `App.tsx` or used in routes
2. Search for its usage across the codebase
3. Refer to this document
4. When in doubt, ask before deleting!

---

**Last Updated:** January 4, 2026
**Maintained By:** Development Team
**Status:** ✅ Up to Date
