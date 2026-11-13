/**
 * A small intent-matching engine: tokenise, score each intent by weighted
 * keyword hits, and fall back to a clarifying answer below a threshold.
 */
interface Intent {
  id: string;
  keywords: Record<string, number>;
  reply: string;
  follow?: string[];
}

const intents: Intent[] = [
  {
    id: 'greeting',
    keywords: { hi: 2, hello: 2, hey: 2, namaste: 2, yo: 1 },
    reply: 'Hi! I’m a small intent bot that runs entirely in your browser. Ask me about Kunal’s experience, stack, backend work or availability.',
    follow: ['What’s his stack?', 'Is he open to roles?'],
  },
  {
    id: 'stack',
    keywords: { stack: 3, tech: 2, technologies: 3, skills: 3, react: 2, typescript: 2, tools: 2, use: 1 },
    reply: 'Mostly React, TypeScript and Redux Toolkit, plus React Flow for workflow UIs and MUI or Tailwind for styling. Playwright and Jest for testing. Node.js and Express for APIs.',
    follow: ['Does he do backend?', 'Tell me about testing'],
  },
  {
    id: 'backend',
    keywords: { backend: 3, node: 2, api: 3, apis: 3, express: 2, database: 2, server: 2, mongo: 2, fullstack: 3, full: 1 },
    reply: 'Yes. He built REST APIs with Node, Express and MongoDB, moved Cisco’s API docs to OpenAPI 3.0, wrote Node services at Quantiphi, and his side projects run on Prisma, Postgres and Firebase. The API playground on this page is a working example.',
    follow: ['Show me the API playground', 'What’s his experience?'],
  },
  {
    id: 'experience',
    keywords: { experience: 3, years: 2, worked: 2, work: 1, companies: 2, career: 2, background: 2, current: 2, job: 2 },
    reply: 'He has 8+ years of experience. Today he leads frontend architecture at Sutherland Healthcare (DeepHealth and Steris). Before that he was at Quantiphi (Qollective.cx), consulted for Cisco through Ampcus, and worked at Lucidfirst, Ved Infosys and Accenture.',
    follow: ['What did he build at DeepHealth?', 'Is he open to roles?'],
  },
  {
    id: 'deephealth',
    keywords: { deephealth: 4, healthcare: 2, workflow: 3, builder: 2, campaign: 3, campaigns: 3, patient: 2, sutherland: 3, outreach: 3, whatsapp: 3, twilio: 3, journey: 2 },
    reply: 'At DeepHealth he leads the React frontend of a multi-tenant outreach platform. Teams build campaigns, rules, journeys and templates and reach patients and physicians over email, SMS, calls and WhatsApp through configurable providers (Twilio, AWS SES, Infobip). Recently he shipped call forwarding to a third-party AI voice agent and GuardDuty scanning for PDF attachments.',
    follow: ['Tell me about testing', 'What’s his AI workflow?'],
  },
  {
    id: 'steris',
    keywords: { steris: 4, summit: 3, grid: 3, datagrid: 4, tree: 2, excel: 3, forms: 2, form: 2, certificates: 2, compliance: 2, training: 2 },
    reply: 'Steris Summit is a training and compliance platform for about 15,000 healthcare professionals. His hardest work there: tree-data grids over huge learner hierarchies with infinite scroll, debounced server-side search, notification polling, certificates, Excel exports, nested menus and heavy interconnected forms. All of it is demoed live in the Work node.',
  },
  {
    id: 'testing',
    keywords: { test: 3, testing: 3, playwright: 3, jest: 2, quality: 2, ci: 2, cicd: 3, pipeline: 2 },
    reply: 'He built a GitLab CI/CD pipeline that runs 450+ Playwright end-to-end tests before every deploy, and bug detection went up 75%. This site follows the same idea: Vitest and Playwright run in GitHub Actions before each deploy.',
  },
  {
    id: 'ai',
    keywords: { ai: 3, mcp: 4, windsurf: 4, llm: 2, automation: 2, copilot: 2, agents: 2, agent: 2 },
    reply: 'He set up an AI-assisted development framework with MCP servers, Windsurf automation and custom AI rule configs. It cut release time by 50% and still enforced team standards.',
  },
  {
    id: 'hire',
    keywords: { hire: 4, available: 3, open: 2, roles: 3, role: 2, job: 1, contact: 3, email: 3, reach: 2, opportunity: 3 },
    reply: 'He’s open to senior and lead frontend roles, especially complex product UIs, design systems and developer tooling. Use the contact form at the bottom, or press ⌘K and choose “Email Kunal”.',
  },
  {
    id: 'location',
    keywords: { where: 2, location: 3, based: 3, city: 2, bengaluru: 3, bangalore: 3, remote: 3 },
    reply: 'He’s based in Bengaluru, India.',
  },
];

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

export interface BotReply {
  intent: string;
  confidence: number;
  text: string;
  follow: string[];
}

export function reply(input: string): BotReply {
  const tokens = tokenize(input);
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of intents) {
    const score = tokens.reduce((s, t) => s + (intent.keywords[t] ?? 0), 0);
    if (score > (best?.score ?? 0)) best = { intent, score };
  }
  if (!best || best.score < 2) {
    return {
      intent: 'fallback',
      confidence: 0,
      text: 'I’m not sure about that one. Try asking about his stack, backend work, testing, AI workflow or availability.',
      follow: ['What’s his stack?', 'Does he do backend?'],
    };
  }
  return {
    intent: best.intent.id,
    confidence: Math.min(1, best.score / 6),
    text: best.intent.reply,
    follow: best.intent.follow ?? [],
  };
}
