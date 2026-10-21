/**
 * Shared types for the NexaCore agent runtime.
 *
 * An "AI employee" is a manifest, not an application. `ai_agents` holds the
 * catalog entry; `company_agents` holds a company's install of it, including
 * the permission level and the subset of tools that install is granted.
 */

/** read < append < update. `delete` is deliberately not a level. */
export type PermissionLevel = 'read' | 'append' | 'update';

export const PERMISSION_RANK: Record<PermissionLevel, number> = {
  read: 0,
  append: 1,
  update: 2,
};

export interface AgentManifest {
  /** company_agents.id */
  installId: string;
  companyId: string;
  key: string;
  name: string;
  icon: string | null;
  category: string | null;
  systemPrompt: string;
  model: string;
  permissionLevel: PermissionLevel;
  grantedTools: string[];
  grantedConnectors: string[];
  monthlyBudgetUsd: number | null;
  config: Record<string, unknown>;
}

export interface ToolContext {
  companyId: string;
  userId: string | null;
  permissionLevel: PermissionLevel;
}

export interface AgentTool {
  name: string;
  description: string;
  /** Minimum permission level an install must hold to be given this tool. */
  requires: PermissionLevel;
  parameters: Record<string, unknown>;
  handler: (ctx: ToolContext, args: Record<string, any>) => Promise<string>;
}

export interface Msg {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
  name?: string;
}

export interface AgentRunResult {
  reply: string;
  toolsUsed: string[];
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: 'success' | 'error' | 'timeout' | 'budget_exceeded';
  error?: string;
}
