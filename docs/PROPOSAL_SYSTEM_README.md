# NexaCore Project Proposal System

## Overview

A comprehensive project proposal system that allows project managers to create, customize, and send professional proposals to clients. Features include rich content editing, PDF generation matching NexaCore branding, version tracking, client portal integration, and automated workflows.

## Features

### For Project Managers
- ✅ Create proposals from quote requests (pre-filled data)
- ✅ Create standalone proposals from scratch
- ✅ Upgrade existing quotes to full proposals
- ✅ 8-step wizard for comprehensive proposal creation
- ✅ Custom section builder (add/remove sections as needed)
- ✅ Client-specific branding configuration
- ✅ Version tracking with history and comparison
- ✅ Live PDF preview
- ✅ Draft saving and auto-save
- ✅ Send via email or client portal

### For Clients
- ✅ View proposals in client portal or via secure email link
- ✅ Download branded PDF
- ✅ Accept/Reject/Request Revision with comments
- ✅ Auto-create project upon acceptance
- ✅ Version comparison for revised proposals
- ✅ Email notifications on all status changes

### Proposal Sections
1. **Executive Summary** - Overview, key benefits, investment summary
2. **Scope of Work** - Detailed scope with inclusions/exclusions
3. **Methodology** - Project approach, phases, tools/technologies
4. **Deliverables** - Specific deliverables with formats and dates
5. **Team Bios** - Team member profiles and expertise
6. **Risk Analysis** - Risk identification and mitigation strategies
7. **Success Metrics** - KPIs and measurement approach
8. **Custom Sections** - Flexible custom content
9. **Terms & Conditions** - Legal and payment terms

## System Architecture

### Database Schema

**Main Tables:**
- `proposals` - Core proposal data with all content (JSONB)
- `proposal_versions` - Version history with snapshots
- `proposal_activities` - Complete audit trail
- `proposal_templates` - Reusable templates (optional)

**Key Fields:**
- Proposal number: `PROP-2025-0001` (auto-generated)
- Status: draft, sent, viewed, accepted, rejected, revision_requested, expired
- Version: Auto-incremented (1.0 → 1.1 → 2.0)
- Links: quote_request_id, quote_id, project_id

### Component Structure

```
src/
├── components/
│   ├── admin/proposals/           # PM interface
│   │   ├── ProposalCreationModal.tsx
│   │   ├── ProposalEditorForm.tsx
│   │   ├── ProposalSectionBuilder.tsx
│   │   ├── ProposalVersionHistory.tsx
│   │   ├── ProposalPreview.tsx
│   │   ├── ProposalBrandingEditor.tsx
│   │   └── AdminProposalsTab.tsx
│   ├── client/                    # Client interface
│   │   ├── ProposalView.tsx
│   │   ├── ProposalAcceptReject.tsx
│   │   └── ProposalVersionCompare.tsx
│   └── proposals/                 # Shared components
│       ├── ProposalPDFGenerator.tsx
│       ├── ProposalCard.tsx
│       └── ProposalPDFPreview.tsx
├── services/
│   ├── proposalService.ts         # CRUD operations
│   ├── proposalPDFService.ts      # PDF generation
│   ├── proposalVersionService.ts  # Version management
│   └── proposalEmailService.ts    # Email notifications
├── hooks/
│   ├── useProposal.ts
│   ├── useProposals.ts
│   ├── useProposalVersions.ts
│   └── useProposalActions.ts
└── types/
    └── proposal.ts                # TypeScript interfaces
```

### PDF Branding

**Colors (matching ERP exports):**
- Teal: `#0098A6` / `[0, 152, 166]`
- Navy: `#1E3A5F` / `[30, 58, 95]`
- Lime: `#CDDC39` / `[205, 220, 57]`

**Design Elements:**
- Geometric triangles in corners (teal + lime)
- Professional header: "NEXACORE / INNOVATIONS / PROJECT PROPOSAL"
- Teal table headers with white text
- Alternating row colors (light blue-gray / white)
- Footer on every page with copyright, page numbers, contact info

**Reference Implementation:**
- `src/components/admin/erp/ERPProjectExportModal.tsx`
- `src/components/admin/erp/TaskExportModal.tsx`

## Workflows

### 1. Create from Quote Request
```
Admin Dashboard → Quote Requests Tab
  → Select quote request
  → Click "Create Proposal"
  → Modal opens with pre-filled client data
  → Complete 8-step wizard
  → Save as draft or send immediately
```

### 2. Standalone Creation
```
Admin Dashboard → Proposals Tab
  → Click "New Proposal"
  → Enter client information manually
  → Complete all proposal sections
  → Save/send
```

### 3. Client Response (Portal)
```
Client Portal → Proposals Tab
  → View proposal details
  → Download PDF
  → Accept / Reject / Request Revision
  → On Accept: Project auto-created
```

### 4. Client Response (Email)
```
Client receives email notification
  → Click "VIEW & APPROVE PROPOSAL" link
  → Secure proposal view page
  → Same response options as portal
```

### 5. Version Management
```
PM editing proposal
  → Makes significant changes
  → System auto-saves version snapshot
  → Version number increments
  → PM can compare versions
  → Client notified of new version
```

## Email Notifications

**Email Types:**
1. `proposal_to_client` - Proposal delivery
2. `proposal_response_to_pm` - Client response notification
3. `proposal_reminder` - Expiration reminder

**Email Template Features:**
- Gradient header (teal to green)
- Proposal number badge
- Price highlight section
- Primary CTA: "VIEW & APPROVE PROPOSAL"
- Secondary CTA: "DOWNLOAD PDF"
- What's included list
- Expiration date warning

**Configuration:**
- Extend: `supabase/functions/send-enhanced-quote-emails/index.ts`
- Uses Resend API
- Follows existing quote email patterns

## Development Setup

### Prerequisites
- Node.js 18+
- Supabase CLI
- jsPDF 3.0.4 (already installed)
- jspdf-autotable 5.0.2 (already installed)

### Installation
```bash
# Run database migrations
cd C:\Users\Vero C\nexacore-global-web-74
supabase db push

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

### Database Setup
```bash
# Apply proposal system migration
psql -h [HOST] -U [USER] -d [DATABASE] -f database/migrations/20250109_create_proposals_system.sql
```

## Implementation Progress

See [PROPOSAL_SYSTEM_PROGRESS.md](./PROPOSAL_SYSTEM_PROGRESS.md) for detailed implementation status.

## Testing

### Unit Tests
- Proposal CRUD operations
- Version tracking logic
- PDF generation
- Email template rendering

### Integration Tests
- Full workflow: Create → Send → Accept
- Version comparison
- Auto-project creation
- Email delivery

### E2E Tests
- PM creates proposal from quote request
- Client receives email and views proposal
- Client accepts proposal
- Project auto-creates
- PM receives notification

## Security

**Row Level Security (RLS):**
- Admins/PMs: Full access to all proposals
- Clients: Can only view their own proposals
- Public: Token-secured access to sent proposals

**Permissions:**
- Create proposal: Admin, Project Manager
- Edit proposal: Creator or Admin
- Send proposal: Admin, Project Manager
- Accept/Reject: Client only
- View versions: Creator or Client

## API Endpoints

### REST Endpoints
```
GET    /api/proposals              # List proposals
GET    /api/proposals/:id          # Get single proposal
POST   /api/proposals              # Create proposal
PUT    /api/proposals/:id          # Update proposal
DELETE /api/proposals/:id          # Delete proposal
GET    /api/proposals/:id/pdf      # Download PDF
POST   /api/proposals/:id/send     # Send to client
POST   /api/proposals/:id/accept   # Client accepts
POST   /api/proposals/:id/reject   # Client rejects
POST   /api/proposals/:id/revise   # Request revision
GET    /api/proposals/:id/versions # Get version history
```

### Supabase Functions
```typescript
// Email notifications
supabase.functions.invoke('send-enhanced-quote-emails', {
  body: { type: 'proposal_to_client', data: {...} }
})

// Auto-project creation
supabase.rpc('create_project_from_proposal', {
  proposal_id: 'uuid'
})
```

## Troubleshooting

### Common Issues

**PDF Generation Fails**
- Check jsPDF version: `npm list jspdf`
- Verify autotable plugin loaded
- Check console for canvas errors

**Email Not Sending**
- Verify Resend API key in Supabase secrets
- Check function logs: `supabase functions logs send-enhanced-quote-emails`
- Confirm email addresses are valid

**Version Not Saving**
- Check trigger function: `create_proposal_version()`
- Verify JSONB fields are properly formatted
- Check database logs for trigger errors

**Client Cannot View Proposal**
- Verify RLS policies are applied
- Check proposal status is 'sent'
- Confirm client email matches proposal.client_email

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Match ERP export styling for PDFs
- Use React Hook Form for forms
- Implement proper error handling

### Commit Messages
```
feat(proposals): Add proposal creation modal
fix(proposals): Fix PDF generation for custom sections
docs(proposals): Update README with API examples
```

## Resources

### Documentation
- [Plan File](../../../.claude/plans/immutable-riding-dawn.md)
- [Progress Tracker](./PROPOSAL_SYSTEM_PROGRESS.md)
- [Database Schema](../database/migrations/20250109_create_proposals_system.sql)
- [TypeScript Types](../src/types/proposal.ts)

### Reference Code
- ERP Project Export: `src/components/admin/erp/ERPProjectExportModal.tsx`
- Quote System: `src/pages/QuoteReview.tsx`
- Email Templates: `supabase/functions/send-enhanced-quote-emails/index.ts`

## Support

For questions or issues:
- Check troubleshooting section above
- Review implementation plan in `.claude/plans/immutable-riding-dawn.md`
- Check progress tracker for current status

---

**Last Updated:** January 9, 2025
**Version:** 1.0.0
**Status:** Planning Complete - Ready for Implementation
