import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { courses, departments, facilities, learners, type Learner, type Role } from '../../../lib/steris';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (days: number) => iso(new Date(Date.now() + days * 86_400_000));

interface Form {
  facility: string;
  department: string;
  people: Learner[];
  course: string;
  due: string;
  dueTouched: boolean;
  reminders: 'none' | 'weekly' | 'daily';
}

const empty: Form = { facility: '', department: '', people: [], course: '', due: '', dueTouched: false, reminders: 'weekly' };

export default function FormDemo() {
  const [f, setF] = useState<Form>(empty);
  const [done, setDone] = useState<string | null>(null);

  // Each upstream change resets whatever downstream fields it invalidates.
  const set = (patch: Partial<Form>) => {
    setDone(null);
    setF((prev) => {
      const next = { ...prev, ...patch };
      if ('facility' in patch && patch.facility !== prev.facility) Object.assign(next, { department: '', people: [], course: '', due: next.dueTouched ? next.due : '' });
      if ('department' in patch && patch.department !== prev.department) Object.assign(next, { people: [], course: '' });
      if ('course' in patch && !next.dueTouched) {
        const c = courses.find((x) => x.code === next.course);
        next.due = c ? addDays(c.days) : '';
      }
      return next;
    });
  };

  const pool = useMemo(() => learners.filter((l) => l.facility === f.facility && l.department === f.department), [f.facility, f.department]);
  const roles = useMemo(() => [...new Set(f.people.map((p) => p.role))] as Role[], [f.people]);
  const eligible = (code: string) => roles.every((r) => courses.find((c) => c.code === code)!.roles.includes(r));

  // Picking learners can make the chosen course ineligible; drop it rather than submit a bad assignment.
  const course = f.course && eligible(f.course) ? courses.find((c) => c.code === f.course) : undefined;
  const skipped = course ? f.people.filter((p) => p.course === course.code && p.certificate) : [];
  const assignees = f.people.length - skipped.length;

  const errors: string[] = [];
  if (!f.facility) errors.push('Choose a facility');
  else if (!f.department) errors.push('Choose a department');
  else if (!f.people.length) errors.push('Pick at least one learner');
  else if (!course) errors.push(f.course ? `${f.course} isn’t available to every selected role` : 'Choose a course');
  else if (!f.due || f.due < iso(new Date())) errors.push('Due date must be today or later');
  else if (assignees === 0) errors.push('Everyone selected already holds this certificate');

  const submit = () => {
    if (errors.length || !course) return;
    setDone(`Assigned ${course.code} to ${assignees} learner${assignees === 1 ? '' : 's'} in ${f.department}, due ${f.due}${skipped.length ? `, skipped ${skipped.length} already certified` : ''}.`);
  };

  return (
    <div className="form-demo">
      <div className="fd-grid">
        <TextField select label="Facility" value={f.facility} onChange={(e) => set({ facility: e.target.value })}>
          {facilities.map((x) => (
            <MenuItem key={x} value={x}>
              {x}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Department" value={f.department} onChange={(e) => set({ department: e.target.value })} disabled={!f.facility} helperText={f.facility ? `${departments.length} departments` : 'Pick a facility first'}>
          {departments.map((x) => (
            <MenuItem key={x} value={x}>
              {x}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <Autocomplete
        multiple
        size="small"
        disabled={!f.department}
        options={pool}
        value={f.people}
        onChange={(_, v) => set({ people: v })}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        groupBy={(o) => o.role}
        limitTags={3}
        disableCloseOnSelect
        renderValue={(value, getItemProps) => value.map((o, i) => <Chip {...getItemProps({ index: i })} key={o.id} label={o.name} />)}
        renderGroup={(p) => (
          <li key={p.key}>
            <ListSubheader className="fd-group">{p.group}</ListSubheader>
            <ul className="fd-opts">{p.children}</ul>
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Learners" helperText={f.department ? `${pool.length} learners in ${f.department}` : 'Pick a department first'} />}
      />

      <div className="fd-grid">
        <TextField
          select
          label="Course"
          value={course ? course.code : ''}
          onChange={(e) => set({ course: e.target.value })}
          disabled={!f.people.length}
          helperText={roles.length ? `Eligible for: ${roles.join(', ')}` : 'Pick learners first'}
        >
          {courses.map((c) => (
            <MenuItem key={c.code} value={c.code} disabled={!eligible(c.code)}>
              {c.code} · {c.title}
              {!eligible(c.code) && <span className="fd-why"> (not for {roles.filter((r) => !c.roles.includes(r)).join(', ')})</span>}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          label="Due date"
          value={f.due}
          onChange={(e) => set({ due: e.target.value, dueTouched: true })}
          disabled={!course}
          helperText={course && !f.dueTouched ? `Auto: ${course.days}-day course length` : ' '}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: iso(new Date()) } }}
        />
      </div>

      <div className="fd-row">
        <span className="label">reminders</span>
        <ToggleButtonGroup value={f.reminders} onChange={(_, v: Form['reminders'] | null) => v && set({ reminders: v })} aria-label="Reminders">
          <ToggleButton value="none">None</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
          <ToggleButton value="daily">Daily</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="fd-summary console">
        <div>
          <span className="fd-k">assign</span> {course ? course.code : '—'} → {assignees > 0 ? `${assignees} learner${assignees === 1 ? '' : 's'}` : '—'}
        </div>
        {skipped.length > 0 && (
          <div>
            <span className="fd-k">skip</span> {skipped.length} already certified ({skipped.map((s) => s.name).join(', ')})
          </div>
        )}
        <div>
          <span className="fd-k">due</span> {f.due || '—'} · reminders {f.reminders}
        </div>
        <div className={errors.length ? 'fd-err' : 'fd-ok'}>{errors.length ? `✗ ${errors[0]}` : '✓ ready to submit'}</div>
      </div>

      <div className="fd-actions">
        <Button size="small" onClick={() => setF(empty)}>
          Reset
        </Button>
        <Button size="small" variant="contained" color="primary" disabled={errors.length > 0} onClick={submit}>
          Create assignment
        </Button>
      </div>
      {done && <Alert severity="success">{done}</Alert>}
    </div>
  );
}
