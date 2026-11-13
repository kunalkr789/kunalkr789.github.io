import { useState, type FormEvent } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FlowNode } from '../../components/FlowNode';
import { Icon } from '../../components/Icon';
import { profile } from '../../data/profile';
import { portfolioApi } from '../../lib/portfolioApi';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const channels = [
  { icon: 'mail' as const, k: 'email', val: profile.email, href: `mailto:${profile.email}` },
  { icon: 'github' as const, k: 'github', val: `@${profile.github}`, href: profile.githubUrl, ext: true },
  { icon: 'home' as const, k: 'based in', val: `${profile.location} · IST (UTC+5:30)` },
];

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'ready'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('sending');
    // Validation runs through the same API layer as the playground above.
    const res = await portfolioApi.request('POST', '/api/contact', form);
    if (res.status === 422) {
      setErrors((res.body as { error: { details: Errors } }).error.details ?? {});
      setState('idle');
      return;
    }
    setErrors({});
    setState('ready');
    const subject = encodeURIComponent(`Hello from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  // Server-side (422) field errors map straight onto MUI's error + helperText states.
  const bind = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
    },
    error: !!errors[k],
    helperText: errors[k],
    slotProps: { formHelperText: { role: 'alert' } },
  });

  return (
    <FlowNode
      id="contact"
      title={
        <>
          Let’s build something <em>solid</em>
        </>
      }
      sub="I’m interested in senior and lead frontend roles, especially complex product UIs, design systems and developer tooling."
    >
      <div className="connect">
        <form className="msg-form" onSubmit={submit} noValidate>
          <div className="row2">
            <TextField label="Name" autoComplete="name" {...bind('name')} />
            <TextField label="Email" type="email" autoComplete="email" {...bind('email')} />
          </div>
          <TextField label="Message" multiline minRows={5} placeholder="Tell me about the role or project…" {...bind('message')} />
          <div className="msg-foot">
            <span className="mono msg-note">validates via POST /api/contact, then opens your mail app</span>
            <Button size="large" variant="contained" color="primary" type="submit" disabled={state === 'sending'} startIcon={<Icon name="send" size={14} />}>
              {state === 'ready' ? 'Opening mail…' : 'Send message'}
            </Button>
          </div>
        </form>

        <div className="channels">
          <span className="label">or reach me directly</span>
          {channels.map((c) => {
            const inner = (
              <>
                <span className="ch-ico">
                  <Icon name={c.icon} size={15} />
                </span>
                <span className="ch-text">
                  <small className="mono">{c.k}</small>
                  <b>{c.val}</b>
                </span>
              </>
            );
            return c.href ? (
              <a key={c.k} className="ch" href={c.href} target={c.ext ? '_blank' : undefined} rel={c.ext ? 'noopener noreferrer' : undefined}>
                {inner}
              </a>
            ) : (
              <div key={c.k} className="ch">
                {inner}
              </div>
            );
          })}
          <div className="end-node mono">
            <span className="port in" aria-hidden="true" />
            <i className="dot ok" /> end of flow · thanks for running it
          </div>
        </div>
      </div>
    </FlowNode>
  );
}
