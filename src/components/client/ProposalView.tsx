// =====================================================
// Proposal View Component - Full Proposal Display for Clients
// =====================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Target,
  Rocket,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import type { Proposal } from '@/types/proposal';
import { format } from 'date-fns';

interface ProposalViewProps {
  proposal: Proposal;
  showTitle?: boolean;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ proposal, showTitle = false }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'TBD';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {proposal.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.executive_summary.overview}</p>
            </div>

            {proposal.executive_summary.key_benefits &&
              proposal.executive_summary.key_benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.executive_summary.key_benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {proposal.executive_summary.investment_summary && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Investment Summary</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {proposal.executive_summary.investment_summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scope of Work */}
      {proposal.scope_of_work && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Scope of Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.scope_of_work.description}</p>
            </div>

            {proposal.scope_of_work.inclusions && proposal.scope_of_work.inclusions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  What's Included
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {proposal.scope_of_work.inclusions.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {proposal.scope_of_work.exclusions && proposal.scope_of_work.exclusions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Not Included</h4>
                <ul className="list-disc list-inside space-y-1">
                  {proposal.scope_of_work.exclusions.map((item, index) => (
                    <li key={index} className="text-gray-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Methodology */}
      {proposal.methodology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-600" />
              Our Approach & Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Approach</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.methodology.approach}</p>
            </div>

            {proposal.methodology.phases && proposal.methodology.phases.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Implementation Phases</h4>
                <div className="space-y-3">
                  {proposal.methodology.phases.map((phase, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge className="bg-purple-600 text-white">
                            Phase {phase.phase_number}
                          </Badge>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">{phase.title}</h5>
                            <p className="text-sm text-gray-700 mb-2">{phase.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Duration: {phase.duration}
                              </span>
                            </div>
                            {phase.deliverables && phase.deliverables.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">Deliverables:</p>
                                <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                  {phase.deliverables.map((del, i) => (
                                    <li key={i}>{del}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {proposal.methodology.tools_technologies &&
              proposal.methodology.tools_technologies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tools & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {proposal.methodology.tools_technologies.map((tool, index) => (
                      <Badge key={index} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      {proposal.deliverables && proposal.deliverables.items && proposal.deliverables.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Project Deliverables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposal.deliverables.items.map((deliverable, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{deliverable.title}</h5>
                        <p className="text-sm text-gray-700 mt-1">{deliverable.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span>Format: {deliverable.format}</span>
                          {deliverable.delivery_date && (
                            <span>Delivery: {formatDate(deliverable.delivery_date)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Bios */}
      {proposal.team_bios && proposal.team_bios.members && proposal.team_bios.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposal.team_bios.members.map((member, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{member.name}</h5>
                        <p className="text-sm text-blue-600">{member.role}</p>
                        <p className="text-xs text-gray-700 mt-2">{member.bio}</p>
                        {member.expertise && member.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.expertise.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis */}
      {proposal.risk_analysis && proposal.risk_analysis.risks && proposal.risk_analysis.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Risk Analysis & Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposal.risk_analysis.risks.map((risk, index) => (
                <Card key={index} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{risk.title}</h5>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Impact: {risk.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Probability: {risk.probability}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                      <p className="text-xs font-medium text-green-900 mb-1">Mitigation Strategy:</p>
                      <p className="text-xs text-green-800">{risk.mitigation_strategy}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Metrics */}
      {proposal.success_metrics && proposal.success_metrics.kpis && proposal.success_metrics.kpis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Success Metrics & KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.success_metrics.measurement_approach && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Measurement Approach</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {proposal.success_metrics.measurement_approach}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Performance Indicators</h4>
              <div className="space-y-3">
                {proposal.success_metrics.kpis.map((kpi, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-gray-900">{kpi.name}</h5>
                      <p className="text-sm text-gray-700 mt-1">{kpi.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span>Target: {kpi.target}</span>
                        <span>•</span>
                        <span>Measurement: {kpi.measurement_method}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Sections */}
      {proposal.custom_sections && proposal.custom_sections.length > 0 && (
        <>
          {proposal.custom_sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 whitespace-pre-wrap">{section.content}</div>
                </CardContent>
              </Card>
            ))}
        </>
      )}

      {/* Terms and Conditions */}
      {proposal.terms_and_conditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{proposal.terms_and_conditions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
