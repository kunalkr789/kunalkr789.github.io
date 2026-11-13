import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icon';
import { kindIcon } from './FlowNode';
import { flow, kindLabel } from '../data/flow';
import { useAppSelector } from '../app/store';

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/** Left rail: the node palette doubles as the site navigation. */
export function Palette() {
  const active = useAppSelector((s) => s.ui.active);
  const status = useAppSelector((s) => s.ui.run.status);
  return (
    <aside className="palette" aria-label="Nodes">
      <div className="panel-h label">Nodes · {flow.length}</div>
      <ol>
        {flow.map((n) => (
          <li key={n.id}>
            <a href={`#${n.id}`} className={`pal-item k-${n.kind} ${active === n.id ? 'on' : ''}`} aria-current={active === n.id ? 'true' : undefined}>
              <span className="pal-ico">
                <Icon name={kindIcon[n.kind]} size={12} />
              </span>
              <span className="pal-text">
                <b>{n.label}</b>
                <small className="mono">
                  {n.nid} · {kindLabel[n.kind].toLowerCase()}
                </small>
              </span>
              {status[n.id] === 'done' && <Icon name="check" size={12} className="pal-done" />}
              {status[n.id] === 'running' && <i className="spin pal-done" />}
            </a>
          </li>
        ))}
      </ol>
      <div className="sticky-note">
        <b>Note</b>
        Every node on this canvas is live. Click, type, break things. Or press <span className="kbd">Run flow</span> for a 20-second tour.
      </div>
    </aside>
  );
}

/** Right rail: properties of the selected node, plus a minimap of the whole canvas. */
export function Inspector() {
  const active = useAppSelector((s) => s.ui.active);
  const i = flow.findIndex((n) => n.id === active);
  const node = flow[i];
  const prev = flow[i - 1];
  const next = flow[i + 1];

  return (
    <aside className="inspector" aria-label="Inspector">
      <div className="panel-h label">Inspector</div>
      <AnimatePresence mode="wait">
        <motion.div key={node.id} className={`insp k-${node.kind}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
          <div className="insp-title">
            <span className="kind">
              <Icon name={kindIcon[node.kind]} size={12} />
              {kindLabel[node.kind]}
            </span>
            <b>{node.name}</b>
          </div>
          <dl className="insp-props mono">
            <dt>id</dt>
            <dd>{node.nid}</dd>
            {node.config.map(([k, v]) => (
              <div key={k} className="insp-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="insp-conn">
            <span className="label">Connections</span>
            <button disabled={!prev} onClick={() => prev && go(prev.id)}>
              <span className="mono">in</span> {prev ? prev.name : 'external · visitor'}
            </button>
            <button disabled={!next} onClick={() => next && go(next.id)}>
              <span className="mono">out</span> {next ? next.name : 'your inbox'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      <Minimap />
    </aside>
  );
}

interface Box {
  id: string;
  kind: string;
  top: number;
  height: number;
}

/** A scaled map of every node; the frame shows what's on screen. Click to jump. */
export function Minimap() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [view, setView] = useState({ top: 0, height: 0.1 });
  const active = useAppSelector((s) => s.ui.active);
  const raf = useRef(0);

  useEffect(() => {
    const measure = () => {
      const H = document.documentElement.scrollHeight;
      setBoxes(
        flow
          .map((n): Box | null => {
            const el = document.getElementById(n.id)?.querySelector('.fnode, .hero-node') as HTMLElement | null;
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { id: n.id, kind: n.kind, top: (r.top + window.scrollY) / H, height: r.height / H };
          })
          .filter((b): b is Box => !!b),
      );
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const H = document.documentElement.scrollHeight;
        setView({ top: window.scrollY / H, height: window.innerHeight / H });
      });
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const jump = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientY - r.top) / r.height;
    window.scrollTo({ top: f * document.documentElement.scrollHeight - window.innerHeight / 2, behavior: 'smooth' });
  };

  return (
    <div className="minimap-wrap">
      <span className="label">Minimap</span>
      <div className="minimap" onClick={jump} role="presentation">
        {boxes.map((b) => (
          <i key={b.id} className={`mm-node k-${b.kind} ${active === b.id ? 'on' : ''}`} style={{ top: `${b.top * 100}%`, height: `${Math.max(b.height * 100, 1.2)}%` }} />
        ))}
        <span className="mm-view" style={{ top: `${view.top * 100}%`, height: `${view.height * 100}%` }} />
      </div>
    </div>
  );
}
