import { useEffect, useRef, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icon';
import { flow, type NodeId } from '../data/flow';
import { endRun, runStep, setPalette, startRun, toggleTheme, useAppDispatch, useAppSelector } from '../app/store';
import './Studio.css';

interface LogLine {
  id: string;
  text: string;
  ms?: number;
}

const DWELL = 2000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** "Run flow": a guided tour that executes the portfolio node by node. */
function useRunFlow() {
  const dispatch = useAppDispatch();
  const running = useAppSelector((s) => s.ui.run.on);
  const cancelled = useRef(false);
  const [log, setLog] = useState<LogLine[]>([]);

  const stop = () => {
    cancelled.current = true;
  };

  const run = async () => {
    cancelled.current = false;
    dispatch(startRun());
    setLog([{ id: 'start', text: '▶ execution started · trigger: visitor' }]);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const node of flow) {
      if (cancelled.current) break;
      const t0 = performance.now();
      dispatch(runStep({ id: node.id as NodeId, status: 'running' }));
      document.getElementById(node.id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      await wait(node.id === 'top' ? 1200 : DWELL);
      if (cancelled.current) break;
      dispatch(runStep({ id: node.id as NodeId, status: 'done' }));
      setLog((l) => [...l, { id: node.id, text: `✓ ${node.nid} ${node.name}`, ms: Math.round(performance.now() - t0) }]);
    }
    setLog((l) => [...l, { id: 'end', text: cancelled.current ? '■ stopped by you' : '✓ flow completed · 0 errors · say hi below ↓' }]);
    dispatch(endRun());
    setTimeout(() => setLog([]), 5000);
  };

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && stop();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

  return { running, run, stop, log };
}

export function Toolbar() {
  const dispatch = useAppDispatch();
  const stored = useAppSelector((s) => s.ui.theme);
  // The pre-rendered HTML can't know a visitor's saved theme, so show the stored one only after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const theme = mounted ? stored : 'light';
  const { running, run, stop, log } = useRunFlow();
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  return (
    <>
      <nav className="toolbar" aria-label="Toolbar">
        <a href="#top" className="tb-brand" title="Back to top">
          <span className="tb-mark">
            <i />
            <i />
          </span>
          <span className="tb-crumbs">
            <span className="tb-muted">kunal-kumar</span>
            <span className="tb-muted">/</span>
            <b>portfolio.flow</b>
          </span>
          <span className="tb-pub mono">
            <i className="dot ok" /> published · v8
          </span>
        </a>

        <div className="tb-actions">
          {running ? (
            <Button size="small" onClick={stop} startIcon={<Icon name="stop" size={11} />} endIcon={<span className="kbd">esc</span>}>
              Stop
            </Button>
          ) : (
            <Tooltip describeChild title="A 20-second guided tour: runs every node in order">
              <Button size="small" variant="contained" color="success" onClick={run} startIcon={<Icon name="play" size={11} />}>
                Run flow
              </Button>
            </Tooltip>
          )}
          <Tooltip describeChild title={`${theme === 'dark' ? 'Light' : 'Dark'} canvas`}>
            <IconButton onClick={() => dispatch(toggleTheme())} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} canvas`}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip describeChild title="Command menu ( / )">
            <IconButton onClick={() => dispatch(setPalette(true))} aria-label="Open command menu">
              <Icon name="search" size={14} />
            </IconButton>
          </Tooltip>
        </div>
      </nav>

      <AnimatePresence>
        {log.length > 0 && (
          <motion.div className="runlog" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <div className="runlog-head mono">
              {running ? <i className="spin" /> : <Icon name="check" size={12} />} execution log
            </div>
            <ol className="console" ref={logRef} aria-live="polite">
              {log.map((l) => (
                <li key={l.id}>
                  <span>{l.text}</span>
                  {l.ms !== undefined && <span className="runlog-ms">{(l.ms / 1000).toFixed(1)}s</span>}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
