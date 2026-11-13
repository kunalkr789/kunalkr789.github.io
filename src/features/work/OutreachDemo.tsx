import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Icon, type IconName } from '../../components/Icon';
import { useAppSelector } from '../../app/store';
import { evaluate, makeCohort } from '../../lib/rules';

type Channel = 'whatsapp' | 'sms' | 'email' | 'call';

interface SendStep {
  id: number;
  kind: 'send';
  channel: Channel;
  provider: string;
  ai?: boolean;
  attachment?: boolean;
}

interface WaitStep {
  id: number;
  kind: 'wait';
  hours: number;
}

type Step = SendStep | WaitStep;

const channels: Record<Channel, { label: string; icon: IconName; providers: string[]; template: string }> = {
  whatsapp: { label: 'WhatsApp', icon: 'chat', providers: ['Twilio', 'Infobip'], template: 'appointment_reminder' },
  sms: { label: 'SMS', icon: 'sms', providers: ['Twilio', 'Infobip'], template: 'prep_reminder_short' },
  email: { label: 'Email', icon: 'mail', providers: ['AWS SES', 'Infobip'], template: 'visit_prep_instructions' },
  call: { label: 'Voice call', icon: 'phone', providers: ['Twilio'], template: 'reminder_call_script' },
};

// Demo tenants: each tenant brings its own provider configuration.
const tenants = {
  northside: { name: 'Northside Clinic', providers: { whatsapp: 'Twilio', sms: 'Twilio', email: 'AWS SES', call: 'Twilio' } },
  lakeview: { name: 'Lakeview Imaging', providers: { whatsapp: 'Infobip', sms: 'Infobip', email: 'Infobip', call: 'Twilio' } },
} as const;

type TenantId = keyof typeof tenants;

const cohort = makeCohort();
let nextId = 10;

const initialPlan = (t: TenantId): Step[] => [
  { id: 1, kind: 'send', channel: 'whatsapp', provider: tenants[t].providers.whatsapp },
  { id: 2, kind: 'wait', hours: 24 },
  { id: 3, kind: 'send', channel: 'call', provider: tenants[t].providers.call, ai: true },
  { id: 4, kind: 'send', channel: 'email', provider: tenants[t].providers.email, attachment: true },
];

interface Line {
  t: string;
  text: string;
  tone?: 'out' | 'in' | 'ok' | 'sec' | 'ai';
}

export default function OutreachDemo() {
  const [tenant, setTenant] = useState<TenantId>('northside');
  const [audience, setAudience] = useState<'patients' | 'physicians'>('patients');
  const [plan, setPlan] = useState<Step[]>(() => initialPlan('northside'));
  const [log, setLog] = useState<Line[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const { conditions, mode } = useAppSelector((s) => s.rules);

  // The audience is the segment from the rules engine tab, so the two demos share one store.
  const patients = useMemo(() => evaluate(cohort, conditions, mode).length, [conditions, mode]);
  const size = audience === 'patients' ? patients : 24;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const switchTenant = (t: TenantId) => {
    setTenant(t);
    setPlan((p) => p.map((s) => (s.kind === 'send' ? { ...s, provider: tenants[t].providers[s.channel] } : s)));
  };

  const update = (id: number, patch: Partial<SendStep>) => setPlan((p) => p.map((s) => (s.id === id && s.kind === 'send' ? { ...s, ...patch } : s)));
  const remove = (id: number) => setPlan((p) => p.filter((s) => s.id !== id));
  const add = (channel: Channel) => setPlan((p) => [...p, { id: nextId++, kind: 'send', channel, provider: tenants[tenant].providers[channel] }]);

  const simulate = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLog([]);
    setBusy(true);
    let clock = 0;
    let remaining = size;
    const at = (h: number) => `T+${String(Math.floor(h)).padStart(2, '0')}h`;
    const lines: (Line & { step: number | null })[] = [{ t: at(0), text: `campaign.started · tenant=${tenant} · audience=${size} ${audience}`, tone: 'ok', step: null }];

    plan.forEach((s, idx) => {
      if (s.kind === 'wait') {
        clock += s.hours;
        const replied = Math.round(remaining * 0.4);
        remaining -= replied;
        lines.push({ t: at(clock), text: `wait ${s.hours}h · ${replied} replied, ${remaining} continue`, step: idx });
        return;
      }
      const ch = channels[s.channel];
      if (s.attachment) {
        lines.push({ t: at(clock), text: `guardduty.scan visit-prep.pdf · no threats found`, tone: 'sec', step: idx });
      }
      lines.push({ t: at(clock), text: `→ ${s.channel}.send via ${s.provider} · template=${ch.template}${s.attachment ? ' · +pdf' : ''} · ${remaining} recipients`, tone: 'out', step: idx });
      if (s.channel === 'call') {
        const answered = Math.round(remaining * 0.55);
        lines.push({ t: at(clock), text: `← webhook ${s.provider.toLowerCase()} · ${answered} calls answered`, tone: 'in', step: idx });
        if (s.ai) {
          lines.push({ t: at(clock), text: `↪ forwarded ${answered} calls to AI agent (vendor API)`, tone: 'ai', step: idx });
          lines.push({ t: at(clock + 0.2), text: `← webhook ai-agent · ${answered} transcripts saved · top intent: reschedule`, tone: 'ai', step: idx });
        }
      } else {
        lines.push({ t: at(clock), text: `← webhook ${s.provider.toLowerCase().replace(' ', '-')} · ${remaining} delivered`, tone: 'in', step: idx });
      }
    });
    lines.push({ t: at(clock), text: '✓ outreach plan complete', tone: 'ok', step: null });

    lines.forEach((l, k) => {
      timers.current.push(
        window.setTimeout(() => {
          setRunning(l.step);
          setLog((prev) => [...prev, l]);
          if (k === lines.length - 1) {
            setRunning(null);
            setBusy(false);
          }
        }, k * 420),
      );
    });
  };

  return (
    <div className="outreach">
      <div className="or-top">
        <label className="or-field">
          <span className="label">tenant</span>
          <Select value={tenant} onChange={(e) => switchTenant(e.target.value as TenantId)} inputProps={{ 'aria-label': 'Tenant' }}>
            {(Object.keys(tenants) as TenantId[]).map((t) => (
              <MenuItem key={t} value={t}>
                {tenants[t].name}
              </MenuItem>
            ))}
          </Select>
        </label>
        <div className="or-field">
          <span className="label">audience</span>
          <ToggleButtonGroup value={audience} onChange={(_, v: 'patients' | 'physicians' | null) => v && setAudience(v)} aria-label="Audience">
            <ToggleButton value="patients">Patients · {patients}</ToggleButton>
            <ToggleButton value="physicians">Physicians · 24</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      <ol className="or-plan" aria-label="Outreach plan">
        {plan.map((s, idx) => (
          <li key={s.id} className={`or-step ${s.kind} ${running === idx ? 'running' : ''}`}>
            {s.kind === 'wait' ? (
              <div className="or-wait">
                <Icon name="clock" size={13} /> Wait {s.hours}h · continue only if no reply
              </div>
            ) : (
              <div className="or-send">
                <span className={`or-ch ch-${s.channel}`}>
                  <Icon name={channels[s.channel].icon} size={14} />
                </span>
                <div className="or-body">
                  <div className="or-row">
                    <b>{channels[s.channel].label}</b>
                    <span className="mono or-tpl">{channels[s.channel].template}</span>
                  </div>
                  <div className="or-row">
                    <Select
                      value={s.provider}
                      onChange={(e) => update(s.id, { provider: e.target.value })}
                      disabled={channels[s.channel].providers.length === 1}
                      inputProps={{ 'aria-label': `${channels[s.channel].label} provider` }}
                    >
                      {channels[s.channel].providers.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                    {s.channel === 'call' && (
                      <FormControlLabel control={<Switch size="small" checked={!!s.ai} onChange={(e) => update(s.id, { ai: e.target.checked })} />} label="Forward to AI agent" />
                    )}
                    {s.channel === 'email' && (
                      <FormControlLabel control={<Switch size="small" checked={!!s.attachment} onChange={(e) => update(s.id, { attachment: e.target.checked })} />} label="Attach PDF (GuardDuty scan)" />
                    )}
                  </div>
                </div>
                <IconButton aria-label={`Remove ${channels[s.channel].label} step`} onClick={() => remove(s.id)}>
                  <Icon name="x" size={13} />
                </IconButton>
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="or-actions">
        <div className="or-add">
          <span className="label">add step</span>
          {(Object.keys(channels) as Channel[]).map((c) => (
            <IconButton key={c} aria-label={`Add ${channels[c].label} step`} onClick={() => add(c)} disabled={plan.length >= 7}>
              <Icon name={channels[c].icon} size={14} />
            </IconButton>
          ))}
        </div>
        <Button variant="contained" color="success" size="small" onClick={simulate} disabled={busy} startIcon={<Icon name="play" size={11} />}>
          Simulate outreach
        </Button>
      </div>

      <div className="console or-log" ref={logRef} aria-live="polite" aria-label="Outreach events">
        {log.length === 0 ? (
          <div className="or-dim">$ press Simulate to run this plan for {tenants[tenant].name}</div>
        ) : (
          log.map((l, k) => (
            <div key={k} className={`or-line ${l.tone ?? ''}`}>
              <span className="or-t">{l.t}</span>
              <span>{l.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
