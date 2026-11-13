import { useEffect, useRef, useState } from 'react';
import { Tags } from '../../components/Tags';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { FlowNode, Reveal } from '../../components/FlowNode';
import { Icon } from '../../components/Icon';
import { dwar } from '../../data/profile';
import './Dwar.css';

/** The volunteer journey as a mini flow you can step through or play. */
function Journey() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>(0);
  const steps = dwar.journey;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => {
      if (i < steps.length - 1) setI(i + 1);
      else setPlaying(false);
    }, 2400);
    return () => clearTimeout(timer.current);
  }, [playing, i, steps.length]);

  const play = () => {
    if (playing) return setPlaying(false);
    if (i === steps.length - 1) setI(0);
    setPlaying(true);
  };

  const s = steps[i];

  return (
    <div className="journey">
      <div className="journey-head">
        <span className="label">A volunteer’s journey through the platform</span>
        <Button size="small" onClick={play} aria-pressed={playing} startIcon={<Icon name={playing ? 'stop' : 'play'} size={11} />}>
          {playing ? 'Pause' : 'Play journey'}
        </Button>
      </div>

      <ol className="j-steps" role="tablist" aria-label="Journey steps">
        {steps.map((st, k) => (
          <li key={st.step} role="presentation" className={k < i ? 'past' : k === i ? 'now' : ''}>
            <button
              role="tab"
              aria-selected={k === i}
              onClick={() => {
                setPlaying(false);
                setI(k);
              }}
            >
              <span className="j-n mono">{k + 1}</span>
              <span className="j-name">{st.step}</span>
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={s.step} className="j-detail" role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
          <div>
            <span className="label">What happens</span>
            <p>{s.what}</p>
          </div>
          <div>
            <span className="label">How I built it</span>
            <p className="j-how">{s.how}</p>
          </div>
          {playing && <motion.i className="j-progress" key={`p${i}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.4, ease: 'linear' }} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Dwar() {
  return (
    <FlowNode
      id="dwar"
      title={
        <>
          A whole NGO, <em>on one platform</em>
        </>
      }
      sub={dwar.summary}
    >
      <div className="dwar-bar">
        <span className="pill pro">
          <Icon name="heart" size={12} /> Pro bono
        </span>
        <span className="pill">{dwar.role.split(' ·')[0]}</span>
        <span className="pill">
          <i className="dot ok pulse" /> Live in production
        </span>
        <span className="pill mono">{dwar.period}</span>
        <span className="dwar-links">
          <Button variant="contained" color="primary" href={dwar.live} target="_blank" rel="noopener noreferrer" endIcon={<Icon name="external" size={13} />}>
            Visit dwar.org.in
          </Button>
        </span>
      </div>

      <div className="dwar-facts">
        {dwar.facts.map((f) => (
          <div key={f.label} className="fact">
            <b className="serif">{f.value}</b>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <Reveal>
        <div className="ba">
          <div className="ba-col before">
            <span className="label">Before</span>
            <ul>
              {dwar.before.map((b) => (
                <li key={b}>
                  <Icon name="x" size={12} /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="ba-arrow" aria-hidden="true">
            <Icon name="arrow" size={18} />
          </div>
          <div className="ba-col after">
            <span className="label">After</span>
            <ul>
              {dwar.after.map((a) => (
                <li key={a}>
                  <Icon name="check" size={12} /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Journey />
      </Reveal>

      <div className="dwar-grid">
        <Reveal className="roles-wrap">
          <span className="label">Who can do what · role-based access</span>
          <TableContainer className="roles-scroll">
            <Table className="roles" size="small" aria-label="Role permissions">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  {dwar.roles.columns.map((c) => (
                    <TableCell key={c} align="center">
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dwar.roles.rows.map((r) => (
                  <TableRow key={r.role} hover>
                    <TableCell component="th" scope="row" className="role-name">
                      {r.role}
                    </TableCell>
                    {r.can.map((c, k) => (
                      <TableCell key={k} align="center" className={c === '✓' ? 'yes' : c === '—' ? 'no' : 'part'}>
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Reveal>

        <Reveal className="also" delay={0.05}>
          <span className="label">Also shipped</span>
          <ul>
            {dwar.alsoBuilt.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="dwar-stack">
        <span className="label">stack</span>
        <Tags items={dwar.stack} />
        <span className="dwar-note mono">The code lives in DWAR Foundation’s private GitHub organisation.</span>
      </div>
    </FlowNode>
  );
}
