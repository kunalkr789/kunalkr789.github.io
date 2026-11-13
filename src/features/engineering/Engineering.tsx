import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { FlowNode, Reveal } from '../../components/FlowNode';
import { Icon } from '../../components/Icon';
import { useVitals } from '../../lib/useVitals';
import './Engineering.css';

type StageState = 'idle' | 'run' | 'pass';

const stages = [
  { id: 'lint', name: 'Lint', detail: 'eslint · prettier', ms: 700 },
  { id: 'types', name: 'Typecheck', detail: 'tsc --noEmit', ms: 800 },
  { id: 'unit', name: 'Unit tests', detail: 'Jest / Vitest', ms: 1100 },
  { id: 'e2e', name: 'E2E tests', detail: 'Playwright', ms: 2200, tests: 450 },
  { id: 'deploy', name: 'Deploy', detail: 'staging → production', ms: 900 },
] as const;

function Pipeline() {
  const [state, setState] = useState<Record<string, StageState>>({});
  const [e2e, setE2e] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef(0);

  const run = async () => {
    setRunning(true);
    setState({});
    setE2e(0);
    for (const s of stages) {
      setState((x) => ({ ...x, [s.id]: 'run' }));
      const t0 = performance.now();
      await new Promise<void>((done) => {
        const tick = (t: number) => {
          const p = Math.min(1, Math.max(0, (t - t0) / s.ms));
          if ('tests' in s) setE2e(Math.round(s.tests * p));
          if (p < 1) raf.current = requestAnimationFrame(tick);
          else done();
        };
        raf.current = requestAnimationFrame(tick);
      });
      setState((x) => ({ ...x, [s.id]: 'pass' }));
    }
    setRunning(false);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const allPassed = stages.every((s) => state[s.id] === 'pass');

  return (
    <div className="card">
      <div className="card-head">
        <h3>Quality gates, not hope</h3>
        <Button size="small" variant="contained" color="success" onClick={run} disabled={running} aria-label="Run the test jig" startIcon={running ? <i className="spin" /> : <Icon name="play" size={11} />}>
          {running ? 'Running' : 'Run pipeline'}
        </Button>
      </div>
      <p className="card-p">At DeepHealth I built the GitLab pipeline that runs 450+ Playwright specs before every deploy. Bug detection went up 75%. This site ships the same way.</p>
      <ol className="stages">
        {stages.map((s) => {
          const st = state[s.id] ?? 'idle';
          return (
            <li key={s.id} className={st}>
              <span className="st-ico">{st === 'pass' ? <Icon name="check" size={12} /> : st === 'run' ? <i className="spin" /> : <i className="dot" />}</span>
              <b>{s.name}</b>
              <small className="mono">{s.detail}</small>
              {'tests' in s && (
                <span className="st-count mono">
                  {e2e}/{s.tests}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className={`console jig-log ${allPassed ? 'ok' : ''}`}>{allPassed ? '✓ all gates passed · deployed to production' : running ? '… running' : '$ press Run pipeline'}</div>
    </div>
  );
}

const chain = [
  { t: 'Ticket', d: 'clear acceptance criteria' },
  { t: 'Context via MCP', d: 'design system, API schema, repo conventions' },
  { t: 'AI rules', d: 'guardrails: patterns, a11y, tests required' },
  { t: 'Windsurf agent', d: 'drafts the code and tests' },
  { t: 'Human review', d: 'senior review and refinement' },
  { t: 'CI gate', d: 'lint, types, unit and E2E' },
];

function AiChain() {
  return (
    <div className="card">
      <div className="card-head">
        <h3>AI-assisted, engineer-owned</h3>
        <span className="big mono">−50%</span>
      </div>
      <p className="card-p">I built a team workflow on MCP servers, Windsurf automation and custom AI rules. It halved release time, and nothing skips review or CI.</p>
      <ol className="chain">
        {chain.map((c, i) => (
          <motion.li key={c.t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
            <span className="chain-n mono">{i + 1}</span>
            <span>
              <b>{c.t}</b>
              <small>{c.d}</small>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

const grade = (v: number | undefined, good: number, poor: number) => (v === undefined ? '' : v <= good ? 'ok' : v <= poor ? 'warn' : 'err');
const fmt = (v?: number) => (v === undefined ? '—' : v < 1000 ? `${Math.round(v)} ms` : `${(v / 1000).toFixed(2)} s`);

function Vitals() {
  const v = useVitals();
  const items = [
    { k: 'LCP', label: 'Largest Contentful Paint', val: fmt(v.lcp), g: grade(v.lcp, 2500, 4000) },
    { k: 'CLS', label: 'Cumulative Layout Shift', val: v.cls.toFixed(3), g: grade(v.cls, 0.1, 0.25) },
    { k: 'INP', label: 'Interaction to Next Paint', val: v.inp ? fmt(v.inp) : 'click something', g: grade(v.inp, 200, 500) },
    { k: 'FCP', label: 'First Contentful Paint', val: fmt(v.fcp), g: grade(v.fcp, 1800, 3000) },
    { k: 'TTFB', label: 'Time to First Byte', val: fmt(v.ttfb), g: grade(v.ttfb, 800, 1800) },
    { k: 'JS', label: 'JavaScript transferred', val: v.jsKb !== undefined ? `${v.jsKb} KB` : '—', g: '' },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <h3>Performance, measured live</h3>
        <span className="label">PerformanceObserver · this page · your browser</span>
      </div>
      <div className="vitals">
        {items.map((it) => (
          <div key={it.k} className="vital" title={it.label}>
            <span className="vital-k mono">
              <i className={`dot ${it.g}`} /> {it.k}
            </span>
            <b>{it.val}</b>
            <small>{it.label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Engineering() {
  return (
    <FlowNode
      id="engineering"
      title={
        <>
          Shipping fast <em>and</em> safely
        </>
      }
      sub="Speed comes from good systems: automated quality gates, AI with guardrails, and performance budgets I actually measure."
    >
      <div className="eng-grid">
        <Reveal>
          <Pipeline />
        </Reveal>
        <Reveal delay={0.05}>
          <AiChain />
        </Reveal>
        <Reveal delay={0.1} className="span2">
          <Vitals />
        </Reveal>
      </div>
    </FlowNode>
  );
}
