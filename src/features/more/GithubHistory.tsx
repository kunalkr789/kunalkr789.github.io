import { useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';
import Chip from '@mui/material/Chip';
import { FlowNode, Reveal } from '../../components/FlowNode';
import { Icon } from '../../components/Icon';
import { profile } from '../../data/profile';
import { useReposQuery } from '../../app/githubApi';

const langColor: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#e2c400',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
};

// Curated story for each era; repo counts per year come live from the GitHub API.
const eras = [
  {
    years: [2020],
    title: 'Practising in public',
    text: 'About 28 small repos from sharpening my fundamentals alongside my day job: a Codeial social network (Node + React), a hospital REST API, a chat app, an iPod UI and a movie browser in React, and take-home assignments.',
    picks: ['Codeial', 'hospital-api', 'chat_app', 'codeial-react'],
  },
  {
    years: [2021, 2022, 2023, 2024],
    title: 'Heads-down in production',
    text: 'Most of my work moved into private company repos (Quantiphi, Sutherland). Public repos from this time are small experiments: TypeScript UIs and a Microsoft-auth MUI data table.',
    picks: ['The-Peaks', 'ms_auth_mui_table'],
  },
  {
    years: [2025, 2026],
    title: 'Shipping my own products',
    text: 'Full products, end to end: the DWAR Foundation platform (pro bono), Society Maintainer, the QR Menu SaaS, the Shreshva storefront, a realtime trading-signal engine, and this portfolio.',
    picks: ['society_maintainer', 'trading_signal_generator', 'kunalkr789.github.io'],
  },
];

// Public, non-fork repos per year as of Nov 2026, shown when the API is unavailable.
const savedByYear: [number, number][] = [
  [2020, 28],
  [2022, 1],
  [2023, 1],
  [2025, 1],
  [2026, 1],
];

export function GithubHistory() {
  // Don't call GitHub until this node is near the viewport: keeps it off the critical path.
  const sentinel = useRef<HTMLDivElement>(null);
  const near = useInView(sentinel, { once: true, margin: '600px 0px' });
  const repos = useReposQuery(profile.github, { skip: !near });

  const byYear = useMemo(() => {
    if (!repos.data) return new Map(savedByYear);
    const m = new Map<number, number>();
    for (const r of repos.data) {
      const y = new Date(r.created_at).getFullYear();
      m.set(y, (m.get(y) ?? 0) + 1);
    }
    return m;
  }, [repos.data]);

  const langs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of repos.data ?? []) if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([l, n]) => ({ l, pct: (n / total) * 100 }));
  }, [repos.data]);

  const first = 2020;
  const last = new Date().getFullYear();
  const yearsRange = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const max = Math.max(1, ...yearsRange.map((y) => byYear.get(y) ?? 0));

  return (
    <FlowNode
      id="github"
      title={
        <>
          Where I started, <em>where I am</em>
        </>
      }
      sub="My GitHub is a growth story, from small practice repos to products running in production. This node reads it live from the GitHub API."
    >
      <div ref={sentinel} className="gh-status mono">
        {!near && <>GET api.github.com/users/{profile.github}/repos · waits until you scroll here</>}
        {repos.isLoading && (
          <>
            <i className="spin" /> GET api.github.com/users/{profile.github}/repos …
          </>
        )}
        {repos.isError && (
          <>
            <i className="dot warn" /> GitHub is rate-limiting this browser, so the timeline below uses saved data
          </>
        )}
        {repos.data && (
          <>
            <i className="dot ok" /> 200 OK · {repos.data.length} public repos · cached 10 min
          </>
        )}
      </div>

      {!repos.isLoading && (
        <div className="years" role="img" aria-label="Repositories created per year">
          {yearsRange.map((y) => {
            const n = byYear.get(y) ?? 0;
            return (
              <div key={y} className="yr">
                <span className="yr-n mono">{n || ''}</span>
                <i style={{ height: `${(n / max) * 100}%` }} />
                <span className="yr-l mono">{String(y).slice(2)}′</span>
              </div>
            );
          })}
        </div>
      )}

      <ol className="eras">
        {eras.map((e, i) => (
          <li key={e.title}>
            <Reveal delay={i * 0.06} className="era">
              <span className="era-years mono">
                {e.years[0]}
                {e.years.length > 1 ? `–${e.years[e.years.length - 1]}` : ''}
              </span>
              <div>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
                <div className="era-picks">
                  {e.picks.map((p) => (
                    <Chip key={p} component="a" clickable href={`${profile.githubUrl}/${p}`} target="_blank" rel="noopener noreferrer" icon={<Icon name="github" size={11} />} label={p} />
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      {langs.length > 0 && (
        <div className="langs">
          <div className="lang-bar">
            {langs.map((x) => (
              <i key={x.l} style={{ width: `${x.pct}%`, background: langColor[x.l] ?? 'var(--faint)' }} title={`${x.l} ${Math.round(x.pct)}%`} />
            ))}
          </div>
          <div className="lang-legend mono">
            {langs.slice(0, 5).map((x) => (
              <span key={x.l}>
                <i style={{ background: langColor[x.l] ?? 'var(--faint)' }} />
                {x.l} {Math.round(x.pct)}%
              </span>
            ))}
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
              @{profile.github} ↗
            </a>
          </div>
        </div>
      )}
    </FlowNode>
  );
}
