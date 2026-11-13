export interface Patient {
  id: number;
  name: string;
  age: number;
  lastVisitDays: number;
  channel: 'sms' | 'email' | 'call';
  risk: 'low' | 'medium' | 'high';
  optedIn: boolean;
}

export type Field = 'age' | 'lastVisitDays' | 'channel' | 'risk' | 'optedIn';
export type Op = 'gt' | 'lt' | 'eq' | 'neq';

export interface Condition {
  id: string;
  field: Field;
  op: Op;
  value: string;
}

export const fieldMeta: Record<Field, { label: string; kind: 'number' | 'enum' | 'bool'; options?: string[] }> = {
  age: { label: 'Age', kind: 'number' },
  lastVisitDays: { label: 'Days since visit', kind: 'number' },
  channel: { label: 'Preferred channel', kind: 'enum', options: ['sms', 'email', 'call'] },
  risk: { label: 'Risk tier', kind: 'enum', options: ['low', 'medium', 'high'] },
  optedIn: { label: 'Opted in', kind: 'bool', options: ['true', 'false'] },
};

export const opLabel: Record<Op, string> = { gt: '>', lt: '<', eq: '=', neq: '≠' };

export function opsFor(field: Field): Op[] {
  return fieldMeta[field].kind === 'number' ? ['gt', 'lt', 'eq'] : ['eq', 'neq'];
}

export function matches(p: Patient, c: Condition): boolean {
  const actual = p[c.field];
  if (typeof actual === 'number') {
    const v = Number(c.value);
    if (Number.isNaN(v)) return true;
    if (c.op === 'gt') return actual > v;
    if (c.op === 'lt') return actual < v;
    return actual === v;
  }
  const eq = String(actual) === c.value;
  return c.op === 'neq' ? !eq : eq;
}

export function evaluate(patients: Patient[], conditions: Condition[], mode: 'all' | 'any'): Patient[] {
  if (!conditions.length) return patients;
  return patients.filter((p) =>
    mode === 'all' ? conditions.every((c) => matches(p, c)) : conditions.some((c) => matches(p, c)),
  );
}

// Deterministic mock cohort, so the demo and the tests always see the same patients.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const first = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vihaan', 'Isha', 'Arjun', 'Saanvi', 'Neel', 'Tara'];
const last = ['Sharma', 'Iyer', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Das', 'Menon', 'Rao', 'Singh'];

export function makeCohort(n = 240, seed = 42): Patient[] {
  const r = mulberry32(seed);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${pick(first)} ${pick(last)}`,
    age: 18 + Math.floor(r() * 70),
    lastVisitDays: Math.floor(r() * 400),
    channel: pick(['sms', 'email', 'call'] as const),
    risk: pick(['low', 'low', 'medium', 'medium', 'high'] as const),
    optedIn: r() > 0.18,
  }));
}
