import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { flow, kindLabel, type NodeId, type NodeKind } from '../data/flow';
import { useAppSelector } from '../app/store';
import './FlowNode.css';

export const kindIcon: Record<NodeKind, IconName> = {
  trigger: 'bolt',
  action: 'play',
  subflow: 'layers',
  condition: 'branch',
  loop: 'loop',
  data: 'db',
  output: 'send',
};

interface Props {
  id: Exclude<NodeId, 'top'>;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
}

/** One section of the page, drawn as a node on the canvas with an incoming edge from the node above. */
export function FlowNode({ id, title, sub, children }: Props) {
  const meta = flow.find((n) => n.id === id)!;
  return (
    <section id={id} className={`fwrap k-${meta.kind}`} aria-labelledby={`${id}-title`}>
      <Edge label={'edge' in meta ? meta.edge : undefined} />
      <NodeFrame id={id}>
        <Reveal className="fnode-intro">
          <h2 id={`${id}-title`} className="fnode-title serif">
            {title}
          </h2>
          {sub && <p className="fnode-sub">{sub}</p>}
        </Reveal>
        {children}
      </NodeFrame>
    </section>
  );
}

/** The node chrome: ports, typed header, status pill, selection handles. */
export function NodeFrame({ id, children, className = '' }: { id: NodeId; children: ReactNode; className?: string }) {
  const meta = flow.find((n) => n.id === id)!;
  const active = useAppSelector((s) => s.ui.active === id);
  const status = useAppSelector((s) => s.ui.run.status[id]);

  return (
    <div className={`fnode ${active ? 'selected' : ''} ${status ?? ''} ${className}`} data-node={id}>
      <span className="port in" aria-hidden="true" />
      <header className="fnode-head">
        <span className="kind">
          <Icon name={kindIcon[meta.kind]} size={12} />
          {kindLabel[meta.kind]}
        </span>
        <span className="fnode-name">{meta.name}</span>
        <span className="fnode-id mono">#{meta.nid}</span>
        <span className="fnode-status mono" aria-live="polite">
          {status === 'running' ? (
            <>
              <i className="spin" /> running
            </>
          ) : status === 'done' ? (
            <>
              <Icon name="check" size={12} /> done
            </>
          ) : (
            <>
              <i className="dot ok" /> ready
            </>
          )}
        </span>
      </header>
      <div className="fnode-body">{children}</div>
      <span className="port out" aria-hidden="true" />
      <span className="handle tl" aria-hidden="true" />
      <span className="handle tr" aria-hidden="true" />
      <span className="handle bl" aria-hidden="true" />
      <span className="handle br" aria-hidden="true" />
    </div>
  );
}

/** Vertical connector with a label chip and data packets flowing down it. */
export function Edge({ label, dashed = false }: { label?: string; dashed?: boolean }) {
  return (
    <div className={`edge ${dashed ? 'dashed' : ''}`} aria-hidden="true">
      <span className="edge-line">
        <i className="packet" />
      </span>
      {label && <span className="edge-label mono">{label}</span>}
      <svg className="edge-arrow" viewBox="0 0 10 6">
        <path d="M0 0 L5 6 L10 0 Z" />
      </svg>
    </div>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
