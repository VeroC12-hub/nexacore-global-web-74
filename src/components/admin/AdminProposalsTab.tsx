// =====================================================
// Admin Proposals Tab - Placeholder for Phase 2
// =====================================================

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminProposalsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Proposals</h2>
          <p className="text-muted-foreground mt-2">
            Create, manage, and send professional proposals to clients
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Draft Proposals</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Pending completion</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Sent Proposals</p>
                <p className="text-3xl font-bold text-yellow-600">0</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Awaiting response</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Projects created</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">0%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Acceptance rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Phase 2: Proposal System Coming Soon</CardTitle>
          <CardDescription className="text-blue-700">
            The complete proposal management system is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Phase 1: Foundation ✓</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1 ml-1">
                  <li>• Database schema created</li>
                  <li>• TypeScript interfaces defined</li>
                  <li>• Service layer implemented</li>
                  <li>• React Query hooks configured</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Phase 2: PM Interface (In Progress)</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1 ml-1">
                  <li>• Proposal creation modal</li>
                  <li>• Rich section editors</li>
                  <li>• Custom section builder</li>
                  <li>• Branding configuration</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Phase 3: PDF Generation (Planned)</h4>
                <ul className="text-sm text-gray-400 mt-1 space-y-1 ml-1">
                  <li>• NexaCore-branded PDF export</li>
                  <li>• Matches ERP styling exactly</li>
                  <li>• Live PDF preview</li>
                  <li>• Download functionality</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Phase 4-7 (Planned)</h4>
                <ul className="text-sm text-gray-400 mt-1 space-y-1 ml-1">
                  <li>• Version control system</li>
                  <li>• Client portal integration</li>
                  <li>• Email notifications</li>
                  <li>• Auto-project creation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Phase 1 (Foundation) is complete. The database migration must be applied to Supabase
              before continuing with Phase 2 implementation. See <code className="bg-blue-100 px-1 py-0.5 rounded">docs/PROPOSAL_SYSTEM_README.md</code> for details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Features</CardTitle>
          <CardDescription>What you can expect from the full proposal system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Comprehensive Content</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Executive summary</li>
                <li>✓ Scope of work</li>
                <li>✓ Methodology & phases</li>
                <li>✓ Team bios</li>
                <li>✓ Risk analysis</li>
                <li>✓ Success metrics</li>
                <li>✓ Custom sections</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Professional Output</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ NexaCore-branded PDFs</li>
                <li>✓ Client-specific branding</li>
                <li>✓ Geometric triangle design</li>
                <li>✓ Professional footer</li>
                <li>✓ Version comparison</li>
                <li>✓ Activity tracking</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Workflow Integration</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Create from quote requests</li>
                <li>✓ Send via client portal</li>
                <li>✓ Email to prospects</li>
                <li>✓ Accept/reject responses</li>
                <li>✓ Auto-project creation</li>
                <li>✓ PM notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProposalsTab;
