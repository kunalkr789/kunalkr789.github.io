import type { ReactNode } from 'react';

/** Minimal syntax-highlighted JSON renderer (no dependency, no innerHTML). */
export function JsonView({ value }: { value: unknown }) {
  return <code className="json">{render(value, 0)}</code>;
}

const pad = (n: number) => '  '.repeat(n);

function render(v: unknown, depth: number): ReactNode {
  if (v === null) return <span className="j-null">null</span>;
  if (typeof v === 'string') return <span className="j-str">"{v}"</span>;
  if (typeof v === 'number') return <span className="j-num">{v}</span>;
  if (typeof v === 'boolean') return <span className="j-bool">{String(v)}</span>;
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return (
      <>
        {'[\n'}
        {v.map((x, i) => (
          <span key={i}>
            {pad(depth + 1)}
            {render(x, depth + 1)}
            {i < v.length - 1 ? ',' : ''}
            {'\n'}
          </span>
        ))}
        {pad(depth)}
        {']'}
      </>
    );
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined);
    if (!entries.length) return '{}';
    return (
      <>
        {'{\n'}
        {entries.map(([k, x], i) => (
          <span key={k}>
            {pad(depth + 1)}
            <span className="j-key">"{k}"</span>: {render(x, depth + 1)}
            {i < entries.length - 1 ? ',' : ''}
            {'\n'}
          </span>
        ))}
        {pad(depth)}
        {'}'}
      </>
    );
  }
  return String(v);
}
