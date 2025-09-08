import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle,
  Search,
  Filter,
  Calendar,
  Hash,
  AtSign,
  Minus,
  ChevronDown,
  ChevronUp,
  Copy,
  Zap
} from 'lucide-react';
import { getSearchOperatorHelp } from '@/utils/searchOperators';

interface SearchOperatorHelpProps {
  isVisible: boolean;
  onClose: () => void;
  onExampleClick: (example: string) => void;
}

export function SearchOperatorHelp({ isVisible, onClose, onExampleClick }: SearchOperatorHelpProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  if (!isVisible) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const basicOperators = [
    { op: 'type:', desc: 'Find by type', example: 'type:project', icon: Filter },
    { op: 'status:', desc: 'Filter by status', example: 'status:active', icon: Filter },
    { op: 'assignee:', desc: 'Assigned to user', example: 'assignee:john', icon: AtSign },
    { op: '@', desc: 'Same as assignee:', example: '@john', icon: AtSign },
    { op: 'priority:', desc: 'Filter by priority', example: 'priority:high', icon: Filter },
    { op: 'project:', desc: 'Items in project', example: 'project:mobile', icon: Filter }
  ];

  const comparisonOperators = [
    { op: '>', desc: 'Greater than', example: 'budget:>50000', icon: Filter },
    { op: '>=', desc: 'Greater or equal', example: 'hours:>=8', icon: Filter },
    { op: '<', desc: 'Less than', example: 'budget:<10000', icon: Filter },
    { op: '<=', desc: 'Less or equal', example: 'hours:<=4', icon: Filter },
    { op: '!=', desc: 'Not equal', example: 'status:!=completed', icon: Filter }
  ];

  const dateOperators = [
    { op: 'today', desc: 'Items due today', example: 'due:today', icon: Calendar },
    { op: 'yesterday', desc: 'Items from yesterday', example: 'created:yesterday', icon: Calendar },
    { op: 'this-week', desc: 'Current week', example: 'due:this-week', icon: Calendar },
    { op: 'last-week', desc: 'Previous week', example: 'updated:last-week', icon: Calendar },
    { op: 'this-month', desc: 'Current month', example: 'created:this-month', icon: Calendar },
    { op: 'last-month', desc: 'Previous month', example: 'due:last-month', icon: Calendar }
  ];

  const textOperators = [
    { op: '*word*', desc: 'Contains word', example: 'title:*mobile*', icon: Search },
    { op: 'word*', desc: 'Starts with word', example: 'name:john*', icon: Search },
    { op: '*word', desc: 'Ends with word', example: 'email:*@company.com', icon: Search }
  ];

  const specialOperators = [
    { op: '#tag', desc: 'Tagged items', example: '#urgent', icon: Hash },
    { op: '-word', desc: 'Exclude items', example: '-completed', icon: Minus },
    { op: 'billable:', desc: 'Billable status', example: 'billable:true', icon: Filter }
  ];

  const examples = [
    { query: 'type:project status:active @john', desc: 'Active projects assigned to John' },
    { query: 'priority:high due:this-week -completed', desc: 'High priority items due this week, not completed' },
    { query: 'budget:>10000 department:marketing', desc: 'Marketing items with budget over 10k' },
    { query: '#urgent assignee:sarah created:today', desc: 'Urgent items assigned to Sarah, created today' },
    { query: 'type:task status:in_progress hours:<8', desc: 'In-progress tasks with less than 8 hours' },
    { query: 'project:mobile title:*design* priority:>=medium', desc: 'Mobile project design items, medium+ priority' }
  ];

  return (
    <Card className="absolute top-16 left-0 right-0 z-50 shadow-xl border max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-blue-500" />
            Advanced Search Guide
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Operators</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Basic Operators */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('basic')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-semibold text-sm">Basic Operators</span>
                {expandedSections.has('basic') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
              
              {expandedSections.has('basic') && (
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {basicOperators.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <op.icon className="h-3 w-3 text-gray-500" />
                        <code className="text-xs bg-gray-200 px-1 rounded">{op.op}</code>
                        <span className="text-xs text-gray-600">{op.desc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(op.example)}
                        className="text-xs h-6"
                      >
                        {op.example}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comparison Operators */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('comparison')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-semibold text-sm">Comparison Operators</span>
                {expandedSections.has('comparison') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
              
              {expandedSections.has('comparison') && (
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {comparisonOperators.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <op.icon className="h-3 w-3 text-gray-500" />
                        <code className="text-xs bg-gray-200 px-1 rounded">{op.op}</code>
                        <span className="text-xs text-gray-600">{op.desc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(op.example)}
                        className="text-xs h-6"
                      >
                        {op.example}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Operators */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('dates')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-semibold text-sm">Date Operators</span>
                {expandedSections.has('dates') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
              
              {expandedSections.has('dates') && (
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {dateOperators.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <op.icon className="h-3 w-3 text-gray-500" />
                        <code className="text-xs bg-gray-200 px-1 rounded">{op.op}</code>
                        <span className="text-xs text-gray-600">{op.desc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(op.example)}
                        className="text-xs h-6"
                      >
                        {op.example}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Operators */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('text')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-semibold text-sm">Text Operators</span>
                {expandedSections.has('text') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
              
              {expandedSections.has('text') && (
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {textOperators.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <op.icon className="h-3 w-3 text-gray-500" />
                        <code className="text-xs bg-gray-200 px-1 rounded">{op.op}</code>
                        <span className="text-xs text-gray-600">{op.desc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(op.example)}
                        className="text-xs h-6"
                      >
                        {op.example}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Operators */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('special')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-semibold text-sm">Special Operators</span>
                {expandedSections.has('special') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
              
              {expandedSections.has('special') && (
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {specialOperators.map((op, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <op.icon className="h-3 w-3 text-gray-500" />
                        <code className="text-xs bg-gray-200 px-1 rounded">{op.op}</code>
                        <span className="text-xs text-gray-600">{op.desc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(op.example)}
                        className="text-xs h-6"
                      >
                        {op.example}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              Click any example to try it in the search bar:
            </div>
            
            {examples.map((example, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExampleClick(example.query)}
                        className="h-auto p-0 text-left"
                      >
                        <code className="text-sm bg-white px-2 py-1 rounded border">
                          {example.query}
                        </code>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(example.query)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{example.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Pro Tips</span>
                </div>
                <ul className="space-y-1 text-blue-800 text-xs">
                  <li>• Combine multiple operators: <code>type:task status:active @john</code></li>
                  <li>• Use quotes for exact phrases: <code>title:"mobile app design"</code></li>
                  <li>• Chain comparisons: <code>budget:&gt;10000 hours:&lt;40</code></li>
                  <li>• Mix operators with free text: <code>marketing budget:&gt;5000</code></li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-900">Quick Reference</span>
                </div>
                <div className="text-xs text-green-800 space-y-1">
                  <div><Badge variant="outline" className="mr-2 text-xs">type:</Badge> project, task, team_member, time_entry</div>
                  <div><Badge variant="outline" className="mr-2 text-xs">status:</Badge> active, completed, pending, in_progress</div>
                  <div><Badge variant="outline" className="mr-2 text-xs">priority:</Badge> low, medium, high, urgent</div>
                  <div><Badge variant="outline" className="mr-2 text-xs">@</Badge> Shortcut for assignee: (e.g., @john)</div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Search Behavior</span>
                </div>
                <ul className="space-y-1 text-yellow-800 text-xs">
                  <li>• Operators are case-insensitive</li>
                  <li>• Multiple operators are combined with AND logic</li>
                  <li>• Free text searches all fields with fuzzy matching</li>
                  <li>• Results are sorted by relevance or priority</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}