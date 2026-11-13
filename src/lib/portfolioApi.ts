import { createServer, HttpError } from './miniServer';
import { jobs, projects, skillGroups } from '../data/profile';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export function createPortfolioApi() {
  const app = createServer();
  const messages: Message[] = [];
  const hits = new Map<string, number>();

  // Fixed-window rate limit, wired exactly like an Express middleware.
  app.use(async (_req, res, next) => {
    const minute = Math.floor(Date.now() / 60_000);
    const key = `${minute}`;
    const count = (hits.get(key) ?? 0) + 1;
    hits.set(key, count);
    res.set('x-ratelimit-limit', '60').set('x-ratelimit-remaining', String(Math.max(0, 60 - count)));
    if (count > 60) throw new HttpError(429, 'Too many requests. Try again in a minute.');
    await next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: Math.round(performance.now() / 1000) }));

  app.get('/api/projects', (req, res) => {
    const tech = req.query.get('tech')?.toLowerCase();
    const data = projects
      .filter((p) => !tech || p.stack.some((s) => s.toLowerCase().includes(tech)))
      .map((p) => ({ id: slug(p.name), name: p.name, stack: p.stack, live: p.live ?? null }));
    res.json({ data, count: data.length });
  });

  app.get('/api/projects/:id', (req, res) => {
    const p = projects.find((x) => slug(x.name) === req.params.id);
    if (!p) throw new HttpError(404, `Project "${req.params.id}" not found`);
    res.json({ data: { id: slug(p.name), ...p } });
  });

  app.get('/api/experience', (req, res) => {
    const tag = req.query.get('tag');
    const limit = Math.min(Number(req.query.get('limit') ?? 10) || 10, 50);
    const page = Math.max(Number(req.query.get('page') ?? 1) || 1, 1);
    const filtered = jobs.filter((j) => !tag || j.tags.includes(tag as never));
    const data = filtered.slice((page - 1) * limit, page * limit).map(({ company, role, from, to, tags }) => ({
      company,
      role,
      from,
      to,
      tags,
    }));
    res.json({ data, page, limit, total: filtered.length, hasMore: page * limit < filtered.length });
  });

  app.get('/api/skills', (_req, res) => res.json({ data: skillGroups.map(({ title, items }) => ({ title, items })) }));

  app.post('/api/contact', (req, res) => {
    const b = (req.body ?? {}) as Partial<Message>;
    const errors: Record<string, string> = {};
    if (!b.name || String(b.name).trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email))) errors.email = 'A valid email is required';
    if (!b.message || String(b.message).trim().length < 10) errors.message = 'Message must be at least 10 characters';
    if (Object.keys(errors).length) throw new HttpError(422, 'Validation failed', errors);
    const msg: Message = {
      id: messages.length + 1,
      name: String(b.name).trim(),
      email: String(b.email).trim(),
      message: String(b.message).trim(),
      createdAt: new Date().toISOString(),
    };
    messages.push(msg);
    res.status(201).set('location', `/api/contact/${msg.id}`).json({ data: msg });
  });

  return app;
}

export const portfolioApi = createPortfolioApi();
