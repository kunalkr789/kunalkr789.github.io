import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { FlowNode } from '../../components/FlowNode';
import { jobs, profile, type Job } from '../../data/profile';

type Tag = Job['tags'][number];

const filters: { id: Tag | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'lead', label: 'Leadership' },
  { id: 'testing', label: 'Testing' },
];

const years = (j: Job) => {
  const parse = (s: string) => {
    if (s === 'Present') return new Date().getFullYear() + new Date().getMonth() / 12;
    const [m, y] = s.split('/').map(Number);
    return y + (m - 1) / 12;
  };
  return parse(j.to) - parse(j.from);
};

const span = (j: Job) => (years(j) < 1 ? `${Math.max(1, Math.round(years(j) * 12))} mo` : `${years(j).toFixed(1)} yr`);

export function Experience() {
  const [f, setF] = useState<Tag | 'all'>('all');

  return (
    <FlowNode
      id="experience"
      title={
        <>
          {profile.years}+ years, <em>six teams</em>
        </>
      }
      sub="Enterprise consulting through to leading frontend architecture. Filter the records by the kind of work."
    >
      <div className="rec-filter">
        <span className="label">where</span>
        <ToggleButtonGroup value={f} onChange={(_, v: Tag | 'all' | null) => v && setF(v)} aria-label="Filter experience">
          {filters.map((x) => (
            <ToggleButton key={x.id} value={x.id}>
              {x.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <ol className="records">
        {jobs.map((j, i) => {
          const shown = f === 'all' || j.tags.includes(f);
          return (
            <li key={j.company} className={`rec ${shown ? '' : 'dim'} ${i === 0 ? 'current' : ''}`}>
              <div className="rec-when mono">
                <span>
                  {j.from} → {j.to}
                </span>
                <small>{span(j)}</small>
              </div>
              <div className="rec-body">
                <h3>
                  {j.company}
                  {i === 0 && <span className="now mono">current</span>}
                </h3>
                <span className="rec-role">{j.role}</span>
                <p>{j.summary}</p>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: '5px' }}>
                  {j.tags.map((t) => (
                    <Chip key={t} label={t} className={`t-${t}`} />
                  ))}
                </Stack>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="edu">
        <span className="label">education</span>
        <p>
          <b>B.E. Electronics &amp; Telecommunication</b>, MIT College of Engineering, Pune (2017)
          <span> · Certifications: Data Structures &amp; Algorithms (GeeksforGeeks), C++ Programming (Udemy)</span>
        </p>
      </div>
    </FlowNode>
  );
}
