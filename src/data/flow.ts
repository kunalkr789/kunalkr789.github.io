/**
 * The portfolio is one workflow. Every section is a node, with a type,
 * an id and an inspector config, the same way the builders I ship at work model a flow.
 */
export type NodeKind = 'trigger' | 'action' | 'subflow' | 'condition' | 'loop' | 'data' | 'output';

export interface FlowNodeMeta {
  id: string;
  nid: string;
  kind: NodeKind;
  name: string;
  label: string;
  edge?: string;
  config: [string, string][];
}

export const flow = [
  {
    id: 'top',
    nid: 'n01',
    kind: 'trigger',
    name: 'Visitor opens portfolio',
    label: 'Start',
    config: [
      ['event', 'page.view'],
      ['payload.role', 'Senior Frontend Engineer'],
      ['payload.location', 'Bengaluru, IN'],
      ['payload.experience', '8+ years'],
    ],
  },
  {
    id: 'work',
    nid: 'n02',
    kind: 'action',
    name: 'Run shipped platforms',
    label: 'Work',
    edge: 'then',
    config: [
      ['items', '3 platforms · 6 test steps'],
      ['mode', 'interactive demos'],
      ['stack', 'React · TS · MUI · RTK'],
      ['demos', 'rules · outreach · theming · chat'],
    ],
  },
  {
    id: 'dwar',
    nid: 'n03',
    kind: 'subflow',
    name: 'Sub-flow · DWAR volunteer platform',
    label: 'DWAR · pro bono',
    edge: 'then',
    config: [
      ['client', 'DWAR Foundation (NGO)'],
      ['role', 'lead developer, pro bono'],
      ['status', 'live · dwar.org.in'],
      ['stack', 'Next.js · Firebase · Razorpay'],
      ['roles', '6 (guest → admin)'],
      ['repo', 'private org repo'],
    ],
  },
  {
    id: 'backend',
    nid: 'n05',
    kind: 'action',
    name: 'HTTP request · portfolio API',
    label: 'Backend',
    edge: 'true',
    config: [
      ['method', 'ANY'],
      ['base', 'in-browser router'],
      ['middleware', 'rate-limit 60/min'],
      ['validation', 'field-level 422'],
    ],
  },
  {
    id: 'engineering',
    nid: 'n06',
    kind: 'action',
    name: 'Quality gate',
    label: 'Quality',
    edge: 'on success',
    config: [
      ['e2e', '450+ Playwright specs'],
      ['ai', 'MCP · Windsurf · rules'],
      ['budget', 'Core Web Vitals'],
      ['on fail', 'block deploy'],
    ],
  },
  {
    id: 'projects',
    nid: 'n07',
    kind: 'loop',
    name: 'For each side project',
    label: 'Projects',
    edge: 'then',
    config: [
      ['iterate', 'projects[]'],
      ['count', '4'],
      ['includes', 'realtime trading signals'],
      ['status', 'all live'],
    ],
  },
  {
    id: 'experience',
    nid: 'n08',
    kind: 'data',
    name: 'Read career history',
    label: 'Experience',
    edge: 'then',
    config: [
      ['source', 'resume.json'],
      ['records', '6 roles'],
      ['range', '2017 → now'],
      ['filter', 'by kind of work'],
    ],
  },
  {
    id: 'github',
    nid: 'n09',
    kind: 'data',
    name: 'Fetch GitHub history',
    label: 'GitHub',
    edge: 'then',
    config: [
      ['GET', 'api.github.com/users/kunalkr789'],
      ['client', 'RTK Query'],
      ['cache', '10 min'],
      ['group by', 'year'],
    ],
  },
  {
    id: 'skills',
    nid: 'n10',
    kind: 'data',
    name: 'Set variables · toolkit',
    label: 'Toolkit',
    edge: 'then',
    config: [
      ['scope', 'global'],
      ['vars', '6 groups'],
      ['primary', 'FRONTEND'],
      ['secondary', 'BACKEND'],
    ],
  },
  {
    id: 'contact',
    nid: 'n11',
    kind: 'output',
    name: 'Send message',
    label: 'Contact',
    edge: 'finally',
    config: [
      ['to', 'Kunal’s inbox'],
      ['validate', 'POST /api/contact'],
      ['open to', 'senior / lead roles'],
      ['delivery', 'your mail app'],
    ],
  },
] as const satisfies readonly FlowNodeMeta[];

export type NodeId = (typeof flow)[number]['id'];

export const kindLabel: Record<NodeKind, string> = {
  trigger: 'Trigger',
  action: 'Action',
  subflow: 'Sub-flow',
  condition: 'Condition',
  loop: 'Loop',
  data: 'Data',
  output: 'Output',
};
