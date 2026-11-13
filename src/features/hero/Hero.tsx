import { useRef } from 'react';
import Button from '@mui/material/Button';
import { NodeFrame } from '../../components/FlowNode';
import { Icon } from '../../components/Icon';
import { profile, stats } from '../../data/profile';
import { useCountUp } from '../../lib/useCountUp';
import './Hero.css';

const keys = ['experience', 'users_reached', 'e2e_specs', 'release_time'];

function PayloadRow({ k, value, prefix = '', suffix, label, last }: (typeof stats)[number] & { k: string; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = useCountUp(value, ref);
  const shown = k === 'release_time' ? `−${n}%` : `${prefix}${n}${suffix}`;
  return (
    <div className="pl-row" ref={ref}>
      <span className="pl-key">"{k}"</span>
      <span className="pl-colon">:</span>
      <span className="pl-val">"{shown}"</span>
      {!last && <span className="pl-colon">,</span>}
      <span className="pl-cmt">// {label}</span>
    </div>
  );
}

export function Hero() {

  return (
    <header id="top" className="fwrap k-trigger hero">
      <div className="frame-label label">
        <span className="frame-corner" /> Frame 1 · Introduction
      </div>

      {/* The name and intro paint straight from the pre-rendered HTML: no JS-driven fade, so they can be the LCP */}
      <h1 className="hero-name serif">
        Kunal Kumar
      </h1>
      <p className="hero-lede">
        I build the <em>serious interfaces</em> behind enterprise products: workflow builders, rules engines and design systems, plus the Node.js APIs that feed them.
        I’ve been doing it for {profile.years}+ years. In my own time I built the{' '}
        <a href="#dwar" className="lede-link">
          entire platform for an NGO
        </a>
        .
      </p>

      <div className="hero-annot enter" aria-hidden="true">
        <svg viewBox="0 0 120 60" className="annot-arrow">
          <path d="M8 6 C 40 8, 70 20, 96 50" />
          <path d="M84 48 L97 52 L95 38" />
        </svg>
        <span>this whole page is a flow I built.
          <br />
          go on, run it.
        </span>
      </div>

      <div className="enter late">
        <NodeFrame id="top" className="hero-node">
          <div className="trigger">
            <div className="trigger-when">
              <span className="label">When</span>
              <p>
                someone opens <b className="mono">kunalkr789.github.io</b>
              </p>
              <span className="label">With payload</span>
              <div className="payload mono" aria-label="Key numbers">
                <div className="pl-brace">{'{'}</div>
                {stats.map((s, i) => (
                  <PayloadRow key={s.label} k={keys[i]} {...s} last={false} />
                ))}
                <div className="pl-row">
                  <span className="pl-key">"pro_bono"</span>
                  <span className="pl-colon">:</span>
                  <a className="pl-val pl-link" href="#dwar">
                    "dwar.org.in"
                  </a>
                  <span className="pl-cmt">// NGO platform, built end to end</span>
                </div>
                <div className="pl-brace">{'}'}</div>
              </div>
            </div>
            <div className="trigger-then">
              <span className="label">Then</span>
              <Button size="large" variant="contained" color="primary" href="#work" endIcon={<Icon name="arrow" size={14} />}>
                Show the work
              </Button>
              <Button size="large" className="pro-btn" href="#dwar" startIcon={<Icon name="heart" size={14} />}>
                See the NGO platform
              </Button>
              <Button size="large" href="#contact" startIcon={<Icon name="mail" size={14} />}>
                Get in touch
              </Button>
              <Button size="large" href={profile.githubUrl} target="_blank" rel="noopener noreferrer" startIcon={<Icon name="github" size={14} />}>
                GitHub
              </Button>
              <span className="trigger-status mono">
                <i className="dot ok pulse" /> open to senior / lead frontend roles
              </span>
            </div>
          </div>
        </NodeFrame>
      </div>
    </header>
  );
}
