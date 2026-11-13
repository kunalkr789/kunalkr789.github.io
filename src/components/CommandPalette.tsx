import { Fragment, useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import { Icon, type IconName } from './Icon';
import { flow } from '../data/flow';
import { setPalette, toggleTheme, useAppDispatch, useAppSelector } from '../app/store';
import { profile, projects } from '../data/profile';
import './CommandPalette.css';

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: IconName;
  run: () => void;
}

/** Fuzzy subsequence score: consecutive and word-start matches rank higher. */
export function fuzzy(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = text.toLowerCase();
  if (!q) return 1;
  let ti = 0;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0;
    streak = found === ti ? streak + 1 : 0;
    score += 1 + streak * 2 + (found === 0 || t[found - 1] === ' ' ? 3 : 0);
    ti = found + 1;
  }
  return score / (t.length * 0.1 + 1);
}

export function CommandPalette() {
  const open = useAppSelector((s) => s.ui.paletteOpen);
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const close = () => dispatch(setPalette(false));

  const commands: Command[] = useMemo(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    return [
      ...flow.map((s) => ({ id: `go-${s.id}`, group: 'Navigate', label: `Go to ${s.label}`, hint: s.name, icon: 'arrow' as const, run: go(s.id) })),
      { id: 'demo-rules', group: 'Demos', label: 'Try the rules engine', hint: 'DeepHealth', icon: 'flow', run: go('work') },
      { id: 'demo-api', group: 'Demos', label: 'Open the API playground', hint: 'backend', icon: 'server', run: go('backend') },
      { id: 'demo-ci', group: 'Demos', label: 'Run the CI pipeline', hint: 'quality', icon: 'play', run: go('engineering') },
      ...projects
        .filter((p) => p.live)
        .map((p) => ({ id: `p-${p.name}`, group: 'Projects', label: `Open ${p.name}`, hint: 'live ↗', icon: 'external' as const, run: () => window.open(p.live, '_blank', 'noopener') })),
      { id: 'theme', group: 'Actions', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} canvas`, icon: theme === 'dark' ? 'sun' : 'moon', run: () => dispatch(toggleTheme()) },
      { id: 'email', group: 'Actions', label: 'Email Kunal', hint: profile.email, icon: 'mail', run: () => (window.location.href = `mailto:${profile.email}`) },
      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy email address',
        icon: 'check',
        run: () => {
          void navigator.clipboard?.writeText(profile.email);
        },
      },
      { id: 'gh', group: 'Actions', label: 'Open GitHub profile', hint: `@${profile.github}`, icon: 'github', run: () => window.open(profile.githubUrl, '_blank', 'noopener') },
    ];
  }, [theme, dispatch]);

  // Ranked by score, then grouped (best group first) so keyboard order matches what's on screen.
  const results = useMemo(() => {
    if (!q) return commands;
    const ranked = commands
      .map((c) => ({ c, s: Math.max(fuzzy(q, c.label), fuzzy(q, `${c.group} ${c.hint ?? ''}`) * 0.6) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    const order = [...new Set(ranked.map((c) => c.group))];
    return order.flatMap((g) => ranked.filter((c) => c.group === g));
  }, [q, commands]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(setPalette(!open));
      } else if (e.key === '/' && !open && !(e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) {
        e.preventDefault();
        dispatch(setPalette(true));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dispatch]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  const exec = (c?: Command) => {
    if (!c) return;
    close();
    // let the dialog close before scrolling so the body is scrollable again
    setTimeout(c.run, 10);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      exec(results[idx]);
    }
  };

  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { 'aria-label': 'Command menu', className: 'cp', onKeyDown } }}
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start', pt: '12vh' } }}
    >
      <div className="cp-input">
        <Icon name="search" />
        <InputBase
          autoFocus
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a command or jump to a node…"
          inputProps={{
            role: 'combobox',
            'aria-expanded': true,
            'aria-controls': 'cp-list',
            'aria-activedescendant': results[idx] ? `cp-${results[idx].id}` : undefined,
          }}
        />
        <span className="kbd">esc</span>
      </div>
      <List id="cp-list" role="listbox" dense className="cp-list" subheader={<li />}>
        {results.length === 0 && <li className="cp-empty">No results for “{q}”</li>}
        {groups.map((g) => (
          <Fragment key={g}>
            <ListSubheader className="cp-group" disableSticky>
              {g}
            </ListSubheader>
            {results
              .filter((c) => c.group === g)
              .map((c) => {
                const i = results.indexOf(c);
                return (
                  <ListItemButton
                    key={c.id}
                    id={`cp-${c.id}`}
                    role="option"
                    aria-selected={i === idx}
                    selected={i === idx}
                    className="cp-item"
                    onMouseMove={() => setIdx(i)}
                    onClick={() => exec(c)}
                  >
                    <Icon name={c.icon} size={15} />
                    <span>{c.label}</span>
                    {c.hint && <small className="mono">{c.hint}</small>}
                  </ListItemButton>
                );
              })}
          </Fragment>
        ))}
      </List>
      <div className="cp-foot mono">
        <span>
          <span className="kbd">↑</span> <span className="kbd">↓</span> navigate
        </span>
        <span>
          <span className="kbd">↵</span> select
        </span>
        <span>
          <span className="kbd">/</span> open anywhere
        </span>
      </div>
    </Dialog>
  );
}
