export const profile = {
  name: 'Kunal Kumar',
  role: 'Senior Frontend Engineer',
  location: 'Bengaluru, India',
  email: 'singh.kunalkr06@gmail.com',
  github: 'kunalkr789',
  githubUrl: 'https://github.com/kunalkr789',
  years: 8,
  summary:
    'I architect enterprise React & TypeScript platforms: multi-tenant healthcare SaaS, visual workflow builders, rules engines and design systems. I also build the Node.js APIs behind them, and I lead teams in using AI-assisted engineering to ship faster without cutting corners.',
} as const;

export interface Stat {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 8, suffix: '+', label: 'years shipping production software' },
  { value: 15, prefix: '~', suffix: 'k', label: 'healthcare pros on a platform I led' },
  { value: 450, suffix: '+', label: 'Playwright E2E tests gating every deploy' },
  { value: 50, suffix: '%', label: 'faster releases via AI-assisted workflows' },
];

export interface Case {
  id: 'deephealth' | 'steris' | 'qollective';
  company: string;
  period: string;
  title: string;
  blurb: string;
  stack: string[];
  points: { strong: string; rest: string }[];
  demo: string;
}

export const cases: Case[] = [
  {
    id: 'deephealth',
    company: 'Sutherland Healthcare',
    period: '2023 – now',
    title: 'DeepHealth Engagement Manager',
    blurb:
      'A multi-tenant outreach platform for healthcare. Teams build campaigns, rules, patient journeys, outreach plans and message templates, then reach patients and physicians over email, SMS, voice calls and WhatsApp. Delivery runs through configurable providers (Twilio, AWS SES, Infobip). I lead the React frontend; the backend is Django and Go.',
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'React Flow', 'MUI', 'Playwright', 'Django · Go (backend)', 'Twilio', 'AWS SES', 'Infobip', 'AWS GuardDuty'],
    points: [
      { strong: 'Campaign, journey and rules builders', rest: ' with React Flow: multi-step outreach plans, trigger-based execution and patient segmentation.' },
      { strong: 'AI agent call forwarding:', rest: ' live calls hand off to a third-party AI voice agent that answers patient questions from our data. I integrated it through its APIs, with transcripts returned by webhook.' },
      { strong: 'Attachment malware scanning', rest: ' with AWS GuardDuty, so PDFs are checked before they go out to patients.' },
      { strong: 'Multi-tenant, provider-agnostic:', rest: ' each tenant configures its own channels and providers, with templates per channel.' },
      { strong: '20% faster frontend and 450+ Playwright tests', rest: ' gating every deploy in GitLab CI/CD. Bug detection went up 75%.' },
    ],
    demo: 'Two test steps: build an audience with the rules engine, or design an outreach plan and simulate it.',
  },
  {
    id: 'steris',
    company: 'Sutherland Healthcare · Steris',
    period: '2023 – now',
    title: 'Steris Summit',
    blurb:
      'A training and compliance-tracking platform used by about 15,000 healthcare professionals. Admins manage huge learner hierarchies, assign courses, track progress and issue certificates. I led frontend development, where the hard part is data volume.',
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'MUI', 'Data grid', 'Excel export'],
    points: [
      { strong: 'Data grids with tree data', rest: ' over very large learner hierarchies, kept fast with pagination and infinite scroll.' },
      { strong: 'Server-side search with debouncing', rest: ', so typing never floods the API and stale responses never win.' },
      { strong: 'Heavy, interconnected forms', rest: ' where each choice reshapes the options, defaults and validation of the next.' },
      { strong: 'Notification polling, certificates and Excel exports', rest: ' for admins tracking compliance across facilities.' },
      { strong: 'Nested menus and a reusable component library', rest: ' that set the team’s frontend standards.' },
    ],
    demo: 'Three test steps: a 10,000-row tree grid, an interconnected assignment form, and live MUI theming.',
  },
  {
    id: 'qollective',
    company: 'Quantiphi',
    period: '2021 – 2023',
    title: 'Qollective.cx',
    blurb:
      'Quantiphi’s AI communications platform: a conversational AI studio, an integration platform and a unified communications layer.',
    stack: ['React', 'Redux', 'MUI', 'Node.js', 'Jest'],
    points: [
      { strong: 'Helped build and launch', rest: ' the platform’s React frontends and supporting Node.js services.' },
      { strong: 'Shared UI libraries', rest: ' that cut duplicate work across product squads.' },
      { strong: 'Quality and performance:', rest: ' Jest unit tests, code reviews and performance work.' },
    ],
    demo: 'Try it: a small intent-matching bot in the spirit of a conversational studio. Ask it about me.',
  },
];

export interface Project {
  name: string;
  blurb: string;
  stack: string[];
  live?: string;
  code?: string;
  icon: 'home' | 'qr' | 'leaf' | 'gauge';
}

export const projects: Project[] = [
  {
    name: 'Society Maintainer',
    blurb:
      'Maintenance, dues and finance for small housing societies. Separate admin and resident dashboards, WhatsApp reminders, a digital ledger, payment verification and PDF/CSV exports.',
    stack: ['React', 'TypeScript', 'Vite', 'Firebase', 'Firestore', 'MUI'],
    live: 'https://urmilakunj-f007c.web.app',
    code: 'https://github.com/kunalkr789/society_maintainer',
    icon: 'home',
  },
  {
    name: 'QR Menu Generator',
    blurb:
      'Multi-tenant SaaS where restaurants build drag-and-drop digital menus and share them through branded QR codes. Every restaurant gets its own public menu page. Full stack: Next.js API routes, Prisma and Postgres.',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'Postgres', 'Clerk', 'Tailwind'],
    live: 'https://qr-menu-generator-orpin.vercel.app',
    icon: 'qr',
  },
  {
    name: 'Shreshva Storefront',
    blurb:
      'An earthy, nature-inspired brand storefront with product filters, front and back pouch previews, and smooth motion throughout.',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
    live: 'https://earthiva.vercel.app',
    icon: 'leaf',
  },
  {
    name: 'Trading Signal Platform',
    blurb:
      'A realtime market-signal engine. It ingests TradingView webhooks, builds candles in memory, computes Pivot/CPR, VWAP, ATR, ORB, EMA and swing zones, scores them in a weighted signal engine, and pushes Telegram alerts. A React + MUI dashboard streams it all over Socket.IO.',
    stack: ['Node.js', 'Socket.IO', 'React', 'MUI', 'Webhooks', 'Telegram API'],
    code: 'https://github.com/kunalkr789/trading_signal_generator',
    icon: 'gauge',
  },
];

/** The pro bono platform gets its own case study node. */
export const dwar = {
  name: 'DWAR Foundation',
  live: 'https://dwar.org.in',
  period: 'Aug – Nov 2026',
  role: 'Lead developer · pro bono',
  summary:
    'DWAR is an NGO in Patna working on skills, education and careers for children and young people. It ran on a WordPress site, Google Forms and spreadsheets. I replaced all of it with one first-party platform: the public website plus portals for volunteers, interns, trainers, coordinators and admins, covering registration, verification, events, attendance, certificates and donations.',
  before: ['WordPress website', 'Google Forms for sign-ups', 'Spreadsheets to track people', 'Hand-made certificates', 'No record of who attended what'],
  after: ['One Next.js app and one repo', 'Role-specific registration with review', 'Events, attendance and hours in Firestore', 'PDF certificates with QR verification', 'Admin CMS, reports and donations'],
  facts: [
    { value: '43', label: 'pages' },
    { value: '15', label: 'API routes' },
    { value: '6', label: 'user roles' },
    { value: '29/32', label: 'commits are mine' },
  ],
  journey: [
    {
      step: 'Register',
      what: 'Volunteers, interns and trainers each get their own registration link and form, with photo and resume uploads.',
      how: 'Role-specific routes (/volunteer/register, /intern/register, /trainer/register), zod validation, uploads to Firebase Storage behind admin-only download routes.',
    },
    {
      step: 'Sign in',
      what: 'One-tap Google login. People land in the right portal for their role.',
      how: 'Firebase Authentication with Google, a server session route, and role-aware redirects after login.',
    },
    {
      step: 'Admin verifies',
      what: 'New sign-ups wait in a review queue. Only approved people can use the portal.',
      how: 'An /admin/registrations queue, a users & roles directory, and permission checks in server actions and Firestore security rules.',
    },
    {
      step: 'Join an event',
      what: 'Volunteers browse events and register. Guests can join eligible events without an account. Coordinators propose events and admins approve them.',
      how: 'Firestore-backed event listings and detail pages, a guest registration flow, and an approval workflow for coordinator-created events.',
    },
    {
      step: 'Attendance',
      what: 'Coordinators and trainers mark attendance for the events they’re assigned to. Volunteer hours are calculated automatically.',
      how: 'Scoped coordinator and manager portals, hours derived from event time slots, and CSV exports for events and attendees.',
    },
    {
      step: 'Certificate',
      what: 'People who attended get a PDF certificate in their dashboard, ready to download.',
      how: 'Certificates generated server-side with pdf-lib from DWAR’s own templates, each with a unique number and QR code.',
    },
    {
      step: 'Verify',
      what: 'Anyone can scan the QR code to confirm a certificate is genuine.',
      how: 'A public /verify/[certificateNumber] page that reads the same certificate records the admins issue.',
    },
  ],
  roles: {
    columns: ['Self-register', 'Join events', 'Mark attendance', 'Create events', 'Approve & assign', 'Edit site'],
    rows: [
      { role: 'Guest', can: ['—', '✓', '—', '—', '—', '—'] },
      { role: 'Volunteer', can: ['✓', '✓', '—', '—', '—', '—'] },
      { role: 'Intern', can: ['✓', '✓', '—', '—', '—', '—'] },
      { role: 'Trainer', can: ['✓', 'assigned', '✓', '—', '—', '—'] },
      { role: 'Coordinator', can: ['—', 'assigned', '✓', 'proposes', '—', '—'] },
      { role: 'Admin', can: ['—', '—', '✓', '✓', '✓', '✓'] },
    ],
  },
  alsoBuilt: [
    'Razorpay donations with server-side order creation and webhook verification',
    'Admin CMS for homepage copy, impact numbers, partner logos and leadership',
    'CSV reports for volunteers, events, donations and certificates',
    'Firestore and Storage security rules',
    'Email notifications over SMTP',
    'A phased WordPress → Next.js migration onto the live domain',
    'GitHub Actions CI: regression tests, typecheck, lint and build',
  ],
  stack: ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Cloud Firestore', 'Firebase Storage', 'Security Rules', 'Firebase App Hosting', 'Razorpay', 'pdf-lib', 'QR codes', 'zod', 'GitHub Actions'],
};

export interface Job {
  company: string;
  role: string;
  from: string;
  to: string;
  summary: string;
  tags: ('frontend' | 'backend' | 'lead' | 'testing')[];
}

export const jobs: Job[] = [
  {
    company: 'Sutherland Healthcare Solutions',
    role: 'Senior Frontend Developer · Lead, App Development',
    from: '06/2023',
    to: 'Present',
    summary:
      'Frontend architecture lead for DeepHealth Engagement Manager and Steris Summit. I mentor engineers, own the Playwright and CI/CD setup, and introduced an AI-assisted development framework (MCP servers, Windsurf, custom AI rules) that halved release time.',
    tags: ['frontend', 'lead', 'testing'],
  },
  {
    company: 'Quantiphi Analytics',
    role: 'Senior Software Developer',
    from: '07/2021',
    to: '05/2023',
    summary:
      'Built React, Redux and MUI frontends and Node.js services for the Qollective.cx AI communications platform, plus shared component libraries used across squads.',
    tags: ['frontend', 'backend', 'testing'],
  },
  {
    company: 'Ampcus Tech (client: Cisco)',
    role: 'Software Developer · Contract Consultant',
    from: '01/2021',
    to: '07/2021',
    summary:
      'Moved Cisco’s legacy API docs to OpenAPI 3.0. Built REST APIs with Node, Express, MongoDB and Mongoose, and production React and TypeScript UIs.',
    tags: ['backend', 'frontend'],
  },
  {
    company: 'Lucidfirst',
    role: 'Software Developer',
    from: '10/2020',
    to: '12/2020',
    summary:
      'Built accessible React interfaces that load in under 2 seconds. Jest and Enzyme testing found 3 crash-level bugs before launch.',
    tags: ['frontend', 'testing'],
  },
  {
    company: 'Ved Infosys',
    role: 'Full Stack Developer',
    from: '10/2018',
    to: '09/2020',
    summary: 'Led full-stack development of an e-commerce web application and its responsive React UI.',
    tags: ['frontend', 'backend', 'lead'],
  },
  {
    company: 'Accenture',
    role: 'Application Development Associate',
    from: '09/2017',
    to: '09/2018',
    summary: 'Built an ABAP report that merged several T-codes into one workflow, saving about 50 business hours a month.',
    tags: ['backend'],
  },
];

export const skillGroups: { title: string; items: string[] }[] = [
  { title: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'React Flow', 'MUI', 'Tailwind', 'HTML5 / CSS3', 'Accessibility'] },
  { title: 'State & data', items: ['Redux Toolkit', 'RTK Query', 'Context API', 'Hasura', 'Firebase', 'Prisma'] },
  { title: 'Backend', items: ['Node.js', 'Express', 'REST API design', 'OpenAPI 3.0', 'MongoDB', 'MySQL', 'Postgres'] },
  { title: 'Quality', items: ['Playwright', 'Jest', 'Vitest', 'React Testing Library', 'Performance profiling'] },
  { title: 'Cloud & DevOps', items: ['AWS', 'GCP', 'Docker', 'GitLab CI/CD', 'GitHub Actions', 'Vercel', 'Firebase Hosting'] },
  { title: 'AI engineering', items: ['MCP servers', 'Windsurf automation', 'AI rule configs', 'AI code-gen workflows'] },
];
