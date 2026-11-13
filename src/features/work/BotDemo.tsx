import { useEffect, useRef, useState, type FormEvent } from 'react';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { motion } from 'framer-motion';
import { reply, type BotReply } from '../../lib/bot';
import { Icon } from '../../components/Icon';

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
  meta?: Pick<BotReply, 'intent' | 'confidence'>;
}

let seq = 0;

export default function BotDemo() {
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: seq++, from: 'bot', text: 'Hi! I match intents right here in your browser, no LLM involved. What would you like to know about Kunal?' }]);
  const [follow, setFollow] = useState<string[]>(['What’s his stack?', 'Does he do backend?', 'Is he open to roles?']);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { id: seq++, from: 'user', text: q }]);
    setInput('');
    setTyping(true);
    const r = reply(q);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: seq++, from: 'bot', text: r.text, meta: { intent: r.intent, confidence: r.confidence } }]);
      setFollow(r.follow);
    }, 450 + Math.min(800, r.text.length * 3));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="bot">
      <div className="bot-list" ref={list} aria-live="polite">
        {msgs.map((m) => (
          <motion.div key={m.id} className={`msg ${m.from}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <p>{m.text}</p>
            {m.meta && (
              <span className="msg-meta mono">
                intent: {m.meta.intent} · {(m.meta.confidence * 100).toFixed(0)}%
              </span>
            )}
          </motion.div>
        ))}
        {typing && (
          <div className="msg bot typing" aria-label="Bot is typing">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className="bot-follow">
        {follow.map((f) => (
          <Chip key={f} label={f} clickable onClick={() => ask(f)} />
        ))}
      </div>
      <form className="bot-input" onSubmit={submit}>
        <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about his stack, backend, AI workflow…" slotProps={{ htmlInput: { 'aria-label': 'Message' } }} />
        <Button variant="contained" color="primary" type="submit" aria-label="Send" disabled={!input.trim() || typing}>
          <Icon name="send" size={13} />
        </Button>
      </form>
    </div>
  );
}
