import { useMemo, useState } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { FlowNode, Reveal } from '../../components/FlowNode';
import { portfolioApi } from '../../lib/portfolioApi';
import type { Method, Response } from '../../lib/miniServer';
import apiSource from '../../lib/portfolioApi.ts?raw';
import { JsonView } from './JsonView';
import { Icon } from '../../components/Icon';
import './Backend.css';

interface Preset {
  label: string;
  method: Method;
  url: string;
  body?: string;
}

const presets: Preset[] = [
  { label: 'Health check', method: 'GET', url: '/api/health' },
  { label: 'List projects', method: 'GET', url: '/api/projects' },
  { label: 'Filter by tech', method: 'GET', url: '/api/projects?tech=prisma' },
  { label: 'Get one project', method: 'GET', url: '/api/projects/society-maintainer' },
  { label: 'Paginate experience', method: 'GET', url: '/api/experience?tag=backend&limit=2&page=1' },
  { label: 'Validation error', method: 'POST', url: '/api/contact', body: '{\n  "name": "A",\n  "email": "not-an-email"\n}' },
  { label: 'Create message', method: 'POST', url: '/api/contact', body: '{\n  "name": "Recruiter",\n  "email": "hi@company.com",\n  "message": "Loved the API playground!"\n}' },
  { label: '404 route', method: 'GET', url: '/api/projects/does-not-exist' },
  { label: '405 method', method: 'DELETE', url: '/api/projects' },
];

const backendWork = [
  { where: 'Ampcus · Cisco', what: 'REST APIs in Node, Express, MongoDB and Mongoose. Migrated legacy API docs to OpenAPI 3.0.' },
  { where: 'Quantiphi', what: 'Node.js services behind the Qollective.cx React frontends.' },
  { where: 'DeepHealth', what: 'Integrated a third-party AI voice agent: call forwarding through its APIs, with transcripts back via webhooks. Added AWS GuardDuty malware scanning for PDF attachments, on a Django and Go backend.' },
  { where: 'QR Menu', what: 'Next.js route handlers, Prisma and Postgres, with Clerk for auth and multi-tenancy.' },
  { where: 'Society Maintainer', what: 'Firestore data model, security rules, and role-based admin and resident access.' },
];

const tone = (s: number) => (s < 300 ? 'ok' : s < 500 ? 'warn' : 'err');

export function Backend() {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('/api/projects');
  const [body, setBody] = useState('');
  const [res, setRes] = useState<Response | null>(null);
  const [tab, setTab] = useState<'body' | 'headers'>('body');
  const [view, setView] = useState<'client' | 'source'>('client');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState('List projects');
  const [remaining, setRemaining] = useState(60);
  const routes = useMemo(() => portfolioApi.routes(), []);

  const load = (p: Preset) => {
    setSelected(p.label);
    setMethod(p.method);
    setUrl(p.url);
    setBody(p.body ?? '');
    void send(p.method, p.url, p.body);
  };

  async function send(m = method, u = url, b = body) {
    setBusy(true);
    let parsed: unknown = undefined;
    if (m !== 'GET' && b.trim()) {
      try {
        parsed = JSON.parse(b);
      } catch {
        setRes({ status: 400, headers: { 'content-type': 'application/json' }, body: { error: { status: 400, message: 'Request body is not valid JSON' } }, ms: 0 });
        setBusy(false);
        return;
      }
    }
    // a little simulated wire latency so the probe states are visible
    await new Promise((r) => setTimeout(r, 160 + Math.random() * 160));
    const r = await portfolioApi.request(m, u, parsed);
    setRes(r);
    setRemaining(Number(r.headers['x-ratelimit-remaining'] ?? 60));
    setTab('body');
    setBusy(false);
  }

  const blown = remaining <= 0;

  return (
    <FlowNode
      id="backend"
      title={
        <>
          Frontend-first, <em>full-stack capable</em>
        </>
      }
      sub="Most of my career is frontend, but I’ve built the other end of the wire too. This node calls a real REST API I wrote like an Express app, with routing, middleware, validation and pagination, running in your browser. Send it a request."
    >
      <Reveal>
        <div className="http">
          <aside className="http-side">
            <span className="label">Saved requests</span>
            <ul>
              {presets.map((p) => (
                <li key={p.label}>
                  <button onClick={() => load(p)} className={selected === p.label ? 'on' : ''}>
                    <span className={`verb ${p.method}`}>{p.method}</span>
                    <span>{p.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="routes mono">
              <span className="label">Registered routes</span>
              {routes.map((r) => (
                <code key={r.method + r.pattern}>
                  <span className={`verb ${r.method}`}>{r.method}</span> {r.pattern}
                </code>
              ))}
            </div>
          </aside>

          <div className="http-main">
            <div className="http-top">
              <ToggleButtonGroup value={view} onChange={(_, v: 'client' | 'source' | null) => v && setView(v)} aria-label="View">
                <ToggleButton value="client">Request</ToggleButton>
                <ToggleButton value="source">Server source</ToggleButton>
              </ToggleButtonGroup>
              <span className={`limit mono ${blown ? 'blown' : ''}`} title="Rate limit: 60 requests per minute">
                <span className="limit-bar">
                  <i style={{ width: `${(remaining / 60) * 100}%` }} />
                </span>
                {blown ? 'rate limited · 429' : `${remaining}/60 left`}
              </span>
            </div>

            {view === 'client' ? (
              <>
                <form
                  className="http-bar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <Select
                    className={`verb-select ${method}`}
                    value={method}
                    onChange={(e) => {
                      setMethod(e.target.value as Method);
                      setSelected('');
                    }}
                    inputProps={{ 'aria-label': 'HTTP method' }}
                  >
                    {(['GET', 'POST', 'PATCH', 'DELETE'] as Method[]).map((m) => (
                      <MenuItem key={m} value={m} className={`verb ${m}`}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    className="mono-input"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setSelected('');
                    }}
                    slotProps={{ htmlInput: { 'aria-label': 'Request URL', spellCheck: false } }}
                  />
                  <Button variant="contained" color="primary" type="submit" disabled={busy} startIcon={busy ? <i className="spin" /> : <Icon name="send" size={13} />}>
                    Send
                  </Button>
                </form>

                {method !== 'GET' && (
                  <TextField
                    className="mono-input"
                    multiline
                    minRows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{ "name": "…" }'
                    slotProps={{ htmlInput: { 'aria-label': 'JSON request body', spellCheck: false } }}
                  />
                )}

                <div className="console http-res">
                  <AnimatePresence mode="wait">
                    {res ? (
                      <motion.div key={JSON.stringify(res.body) + res.status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                        <div className="res-head">
                          <span className={`status ${tone(res.status)}`} data-testid="api-status">
                            {res.status}
                          </span>
                          <span className="res-time">{res.headers['x-response-time']}</span>
                          <span className="res-tabs">
                            <button className={tab === 'body' ? 'on' : ''} onClick={() => setTab('body')}>
                              body
                            </button>
                            <button className={tab === 'headers' ? 'on' : ''} onClick={() => setTab('headers')}>
                              headers
                            </button>
                          </span>
                        </div>
                        <div className="res-body">{tab === 'body' ? <JsonView value={res.body} /> : <JsonView value={res.headers} />}</div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" className="res-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        → pick a saved request, or press Send
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <pre className="console http-src" tabIndex={0} aria-label="Server source code">
                {apiSource}
              </pre>
            )}
          </div>
        </div>
      </Reveal>

      <div className="be-list">
        <span className="label">Backend work in production</span>
        <ul>
          {backendWork.map((b) => (
            <li key={b.where}>
              <b>{b.where}</b>
              <span>{b.what}</span>
            </li>
          ))}
        </ul>
      </div>
    </FlowNode>
  );
}
