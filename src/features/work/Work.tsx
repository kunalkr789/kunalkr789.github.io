import { lazy, Suspense, useEffect, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Tags } from '../../components/Tags';
import { AnimatePresence, motion } from 'framer-motion';
import { FlowNode, Edge } from '../../components/FlowNode';
import { Icon, type IconName } from '../../components/Icon';
import { cases, type Case } from '../../data/profile';
import './Work.css';
import './steris/Steris.css';

type Demo = { label: string; C: React.LazyExoticComponent<() => React.JSX.Element> };

// Each case study can have several test steps, each lazy-loaded on first open.
const demos: Record<Case['id'], Demo[]> = {
  deephealth: [
    { label: 'Audience rules', C: lazy(() => import('./RulesDemo')) },
    { label: 'Outreach plan', C: lazy(() => import('./OutreachDemo')) },
  ],
  steris: [
    { label: 'Tree data grid', C: lazy(() => import('./steris/GridDemo')) },
    { label: 'Assignment form', C: lazy(() => import('./steris/FormDemo')) },
    { label: 'MUI theming', C: lazy(() => import('./TokensDemo')) },
  ],
  qollective: [{ label: 'Intent chat', C: lazy(() => import('./BotDemo')) }],
};

const meta: Record<Case['id'], { icon: IconName; test: string }> = {
  deephealth: { icon: 'branch', test: 'Audience + outreach plan' },
  steris: { icon: 'layers', test: 'Grid, forms and theming' },
  qollective: { icon: 'bot', test: 'Intent-matching chat' },
};

export function Work() {
  const [active, setActive] = useState<Case['id']>('deephealth');
  const [step, setStep] = useState(0);
  // Demos are lazy chunks, which a build-time render can't load. Render them only after
  // mount so the prerendered HTML and the client's first render agree (no hydration bail-out).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const c = cases.find((x) => x.id === active)!;
  const steps = demos[active];
  const Demo = steps[Math.min(step, steps.length - 1)].C;

  return (
    <FlowNode
        id="work"
        title={
          <>
            Platforms I’ve <em>shipped</em>
          </>
        }
        sub="Three enterprise products. The real ones are private, so each comes with a small working version of its core idea, built for this page. Pick one and test the step."
      >
        <div className="items" role="tablist" aria-label="Case studies">
          {cases.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              id={`tab-${x.id}`}
              aria-selected={active === x.id}
              aria-controls={`panel-${x.id}`}
              className={`item ${active === x.id ? 'on' : ''}`}
              onClick={() => {
                setActive(x.id);
                setStep(0);
              }}
            >
              <span className="item-idx mono">items[{i}]</span>
              <span className="item-ico">
                <Icon name={meta[x.id].icon} size={15} />
              </span>
              <span className="item-text">
                <b>{x.title}</b>
                <small>
                  {x.company.split(' ·')[0]} · {x.period}
                </small>
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={c.id}
            id={`panel-${c.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${c.id}`}
            className={`case ${c.id === 'steris' ? 'wide' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="case-info">
              <h3>{c.title}</h3>
              <p className="case-blurb">{c.blurb}</p>
              <ul className="case-points">
                {c.points.map((p) => (
                  <li key={p.strong}>
                    <Icon name="check" size={13} />
                    <span>
                      <strong>{p.strong}</strong>
                      {p.rest}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="case-stack">
                <span className="label">stack</span>
                <Tags items={c.stack} />
              </div>
            </div>

            <div className="test-panel">
              <div className="test-head">
                <span className="test-title">
                  <Icon name="play" size={11} /> Test step · {meta[c.id].test}
                </span>
                <span className="test-live mono">
                  <i className="dot ok pulse" /> live
                </span>
              </div>
              <p className="test-cap">{c.demo}</p>
              {steps.length > 1 && (
                <ToggleButtonGroup className="demo-switch" value={step} onChange={(_, v: number | null) => v !== null && setStep(v)} aria-label={`${c.title} test steps`}>
                  {steps.map((d, i) => (
                    <ToggleButton key={d.label} value={i}>
                      {i + 1} · {d.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
              {mounted ? (
                <Suspense fallback={<div className="test-loading mono">loading step…</div>}>
                  <Demo key={`${c.id}-${step}`} />
                </Suspense>
              ) : (
                <div className="test-loading mono">loading step…</div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
    </FlowNode>
  );
}

/** A small branch node between Work and Backend, the way a real flow forks. */
export function ConditionNode() {
  return (
    <div className="fwrap k-condition cond-wrap" aria-label="Condition: need backend too?">
      <Edge label="then" />
      <div className="cond">
        <span className="port in" aria-hidden="true" />
        <span className="kind">
          <Icon name="branch" size={12} /> Condition
        </span>
        <span className="cond-q">
          <span className="mono">#n04</span> Need someone who can do <b>backend</b> too?
        </span>
        <a className="cond-false mono" href="#engineering" title="Skip the backend node">
          false → skip to Quality gate
        </a>
        <span className="port out" aria-hidden="true" />
      </div>
    </div>
  );
}

