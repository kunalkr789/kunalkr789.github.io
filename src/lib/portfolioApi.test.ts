import { createPortfolioApi } from './portfolioApi';
import { createServer } from './miniServer';

describe('miniServer', () => {
  it('extracts route params and decodes them', async () => {
    const app = createServer();
    app.get('/users/:id/posts/:slug', (req, res) => res.json(req.params));
    const r = await app.request('GET', '/users/42/posts/hello%20world');
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ id: '42', slug: 'hello world' });
  });

  it('returns 404 for unknown paths and 405 with an Allow header for wrong methods', async () => {
    const app = createServer();
    app.get('/things', (_q, res) => res.json([]));
    expect((await app.request('GET', '/nope')).status).toBe(404);
    const r = await app.request('DELETE', '/things');
    expect(r.status).toBe(405);
    expect(r.headers.allow).toBe('GET');
  });

  it('maps unexpected handler errors to a 500 without leaking details', async () => {
    const app = createServer();
    app.get('/boom', () => {
      throw new Error('secret stack');
    });
    const r = await app.request('GET', '/boom');
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain('secret');
  });
});

describe('portfolio API', () => {
  it('filters projects by technology', async () => {
    const api = createPortfolioApi();
    const r = await api.request('GET', '/api/projects?tech=prisma');
    const body = r.body as { data: { id: string }[]; count: number };
    expect(body.count).toBe(1);
    expect(body.data[0].id).toBe('qr-menu-generator');
  });

  it('paginates experience', async () => {
    const api = createPortfolioApi();
    const r = await api.request('GET', '/api/experience?tag=backend&limit=2&page=1');
    const body = r.body as { data: unknown[]; hasMore: boolean; total: number };
    expect(body.data).toHaveLength(2);
    expect(body.total).toBeGreaterThan(2);
    expect(body.hasMore).toBe(true);
  });

  it('validates contact messages with field-level errors', async () => {
    const api = createPortfolioApi();
    const bad = await api.request('POST', '/api/contact', { name: 'A', email: 'nope' });
    expect(bad.status).toBe(422);
    expect((bad.body as { error: { details: Record<string, string> } }).error.details).toHaveProperty('email');

    const ok = await api.request('POST', '/api/contact', { name: 'Recruiter', email: 'a@b.co', message: 'Hello there, great site!' });
    expect(ok.status).toBe(201);
    expect(ok.headers.location).toBe('/api/contact/1');
  });

  it('rate limits after 60 requests in a minute', async () => {
    const api = createPortfolioApi();
    for (let i = 0; i < 60; i++) await api.request('GET', '/api/health');
    const r = await api.request('GET', '/api/health');
    expect(r.status).toBe(429);
    expect(r.headers['x-ratelimit-remaining']).toBe('0');
  });
});
