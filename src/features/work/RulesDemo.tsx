import { useDeferredValue, useMemo } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../../components/Icon';
import { addCondition, removeCondition, setMode, updateCondition, useAppDispatch, useAppSelector } from '../../app/store';
import { evaluate, fieldMeta, makeCohort, opLabel, opsFor, type Field, type Op } from '../../lib/rules';

const cohort = makeCohort();

/** Logic-gate symbol with one input wire per rule; wires light up when that rule matches anyone. */
function Gate({ mode, inputs, out }: { mode: 'all' | 'any'; inputs: number[]; out: boolean }) {
  const n = Math.max(inputs.length, 1);
  const ys = Array.from({ length: n }, (_, i) => 18 + ((i + 0.5) * 84) / n);
  return (
    <svg className="gate" viewBox="0 0 240 120" aria-hidden="true">
      {ys.map((y, i) => (
        <g key={i}>
          <line x1="0" y1={y} x2={mode === 'all' ? 88 : 96} y2={y} className={inputs[i] ? 'w on' : 'w'} />
          <circle cx="5" cy={y} r="4" className="nd" />
        </g>
      ))}
      {mode === 'all' ? <path d="M88 20 H128 A40 40 0 0 1 128 100 H88 Z" className="body" /> : <path d="M84 20 Q106 60 84 100 Q140 100 172 60 Q140 20 84 20 Z" className="body" />}
      <line x1={mode === 'all' ? 168 : 172} y1="60" x2="236" y2="60" className={out ? 'w on' : 'w'} />
      <text x={mode === 'all' ? 114 : 118} y="65" className="gate-t">
        {mode === 'all' ? 'AND' : 'OR'}
      </text>
    </svg>
  );
}

export default function RulesDemo() {
  const dispatch = useAppDispatch();
  const { conditions, mode } = useAppSelector((s) => s.rules);
  const deferred = useDeferredValue(conditions);
  const matched = useMemo(() => evaluate(cohort, deferred, mode), [deferred, mode]);
  const perRule = useMemo(() => deferred.map((c) => evaluate(cohort, [c], 'all').length), [deferred]);
  const byChannel = useMemo(() => (['sms', 'email', 'call'] as const).map((ch) => ({ ch, n: matched.filter((p) => p.channel === ch).length })), [matched]);

  return (
    <div className="rules">
      <div className="rules-top">
        <Gate mode={mode} inputs={perRule} out={matched.length > 0} />
        <div className="out-count">
          <span className="label">segment size</span>
          <b className="mono" data-testid="segment-count">
            {matched.length}
          </b>
          <span className="label">of {cohort.length} patients</span>
        </div>
      </div>

      <ToggleButtonGroup className="rules-mode" value={mode} onChange={(_, m: 'all' | 'any' | null) => m && dispatch(setMode(m))} aria-label="Match mode">
        {(['all', 'any'] as const).map((m) => (
          <ToggleButton key={m} value={m}>
            match {m} {m === 'all' ? '(AND)' : '(OR)'}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ul className="rule-list">
        <AnimatePresence initial={false}>
          {conditions.map((c, i) => (
            <motion.li key={c.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <div className="rule">
                <span className="rule-join mono">{i === 0 ? 'if' : mode === 'all' ? 'and' : 'or'}</span>
                <Select value={c.field} onChange={(e) => dispatch(updateCondition({ id: c.id, patch: { field: e.target.value as Field } }))} inputProps={{ 'aria-label': 'Field' }}>
                  {(Object.keys(fieldMeta) as Field[]).map((f) => (
                    <MenuItem key={f} value={f}>
                      {fieldMeta[f].label}
                    </MenuItem>
                  ))}
                </Select>
                <Select value={c.op} onChange={(e) => dispatch(updateCondition({ id: c.id, patch: { op: e.target.value as Op } }))} inputProps={{ 'aria-label': 'Operator' }}>
                  {opsFor(c.field).map((o) => (
                    <MenuItem key={o} value={o}>
                      {opLabel[o]}
                    </MenuItem>
                  ))}
                </Select>
                {fieldMeta[c.field].kind === 'number' ? (
                  <TextField type="number" value={c.value} onChange={(e) => dispatch(updateCondition({ id: c.id, patch: { value: e.target.value } }))} slotProps={{ htmlInput: { 'aria-label': 'Value' } }} />
                ) : (
                  <Select value={c.value} onChange={(e) => dispatch(updateCondition({ id: c.id, patch: { value: e.target.value } }))} inputProps={{ 'aria-label': 'Value' }}>
                    {fieldMeta[c.field].options!.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <span className="rule-n mono" title="Patients matching this rule on its own">
                  {perRule[i] ?? '—'}
                </span>
                <IconButton aria-label="Remove rule" onClick={() => dispatch(removeCondition(c.id))}>
                  <Icon name="x" size={13} />
                </IconButton>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Button size="small" className="add-rule" onClick={() => dispatch(addCondition())} disabled={conditions.length >= 5} startIcon={<Icon name="plus" size={12} />}>
        Add rule
      </Button>

      <div className="console rules-out">
        <div className="ro-row ro-head">
          {byChannel.map(({ ch, n }) => (
            <span key={ch}>
              {ch} <b>{n}</b>
            </span>
          ))}
        </div>
        {matched.slice(0, 4).map((p) => (
          <div key={p.id} className="ro-row ro-pt">
            <span className="ro-dim">#{String(p.id).padStart(3, '0')}</span>
            <span className="ro-name">{p.name}</span>
            <span>{p.age}y</span>
            <span>{p.lastVisitDays}d</span>
            <span className={`risk ${p.risk}`}>{p.risk}</span>
          </div>
        ))}
        {matched.length === 0 && <div className="ro-row ro-dim">no patients match · loosen a rule</div>}
      </div>
    </div>
  );
}
