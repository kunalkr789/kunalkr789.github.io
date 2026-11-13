import { createServer } from './miniServer';

/**
 * A seeded training dataset and a tiny API over it, standing in for the
 * Steris Summit backend: cursor pagination, server-side search, and a
 * notifications feed for polling.
 */
export interface Learner {
  id: number;
  name: string;
  facility: string;
  department: string;
  role: Role;
  course: string;
  progress: number;
  certificate: string | null;
}

export type Role = 'Technician' | 'Nurse' | 'Supervisor';

export interface Course {
  code: string;
  title: string;
  roles: Role[];
  days: number;
}

export const facilities = ['Northside General', 'Lakeview Medical', 'Riverbend Surgical', 'Summit Regional', 'Harbor Health', 'Cedar Valley'];
export const departments = ['Sterile Processing', 'Operating Room', 'Endoscopy', 'Central Supply', 'Infection Control'];
export const courses: Course[] = [
  { code: 'SP-101', title: 'Sterile Processing Fundamentals', roles: ['Technician'], days: 14 },
  { code: 'IC-204', title: 'Infection Control Essentials', roles: ['Technician', 'Nurse', 'Supervisor'], days: 7 },
  { code: 'EN-310', title: 'Endoscope Reprocessing', roles: ['Technician', 'Nurse'], days: 21 },
  { code: 'OR-120', title: 'OR Instrument Handling', roles: ['Nurse', 'Technician'], days: 10 },
  { code: 'LD-400', title: 'Compliance Leadership', roles: ['Supervisor'], days: 30 },
];

const first = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vihaan', 'Isha', 'Arjun', 'Saanvi', 'Neel', 'Tara', 'Maya', 'Leo', 'Zara', 'Omar'];
const last = ['Sharma', 'Iyer', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Das', 'Menon', 'Rao', 'Singh', 'Brooks', 'Chen', 'Lopez', 'Khan'];

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeLearners(n = 10_000, seed = 7): Learner[] {
  const r = rng(seed);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const rows: Learner[] = Array.from({ length: n }, (_, i) => {
    const role = pick(['Technician', 'Technician', 'Nurse', 'Nurse', 'Supervisor'] as const);
    const course = pick(courses.filter((c) => c.roles.includes(role)));
    const progress = r() < 0.35 ? 100 : Math.floor(r() * 100);
    return {
      id: i + 1,
      name: `${pick(first)} ${pick(last)}`,
      facility: pick(facilities),
      department: pick(departments),
      role,
      course: course.code,
      progress,
      certificate: progress === 100 ? `STS-${course.code}-${String(i + 1).padStart(5, '0')}` : null,
    };
  });
  // the tree grid reads rows in hierarchy order
  return rows.sort((a, b) => a.facility.localeCompare(b.facility) || a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
}

export const learners = makeLearners();

const notificationPool = [
  (l: Learner) => `${l.name} completed ${l.course}`,
  (l: Learner) => `Certificate ${l.certificate ?? 'STS-…'} issued`,
  (l: Learner) => `${l.department} at ${l.facility} is below 80% compliance`,
  () => 'Weekly compliance report is ready to export',
];

export function createSterisApi(data: Learner[] = learners) {
  const app = createServer();

  app.get('/api/learners', (req, res) => {
    const q = (req.query.get('q') ?? '').trim().toLowerCase();
    const cursor = Math.max(0, Number(req.query.get('cursor') ?? 0) || 0);
    const limit = Math.min(Number(req.query.get('limit') ?? 50) || 50, 200);
    const matches = q ? data.filter((l) => `${l.name} ${l.course} ${l.department} ${l.facility} ${l.role}`.toLowerCase().includes(q)) : data;
    const page = matches.slice(cursor, cursor + limit);
    const next = cursor + limit < matches.length ? cursor + limit : null;
    res.json({ data: page, total: matches.length, nextCursor: next });
  });

  app.get('/api/notifications', (req, res) => {
    // deterministic per 8-second window, so polling sees new items over time
    const windowId = Math.floor(Number(req.query.get('now') ?? Date.now()) / 8000);
    const r = rng(windowId);
    const count = r() < 0.6 ? 1 + Math.floor(r() * 2) : 0;
    const items = Array.from({ length: count }, (_, i) => {
      const l = data[Math.floor(r() * data.length)];
      return { id: `${windowId}-${i}`, text: notificationPool[Math.floor(r() * notificationPool.length)](l) };
    });
    res.json({ data: items });
  });

  return app;
}

export const sterisApi = createSterisApi();

/** Simulated network latency so loading and debounce behaviour are visible. */
export const withLatency = <T,>(p: Promise<T>, ms = 220 + Math.random() * 200) => new Promise<T>((r) => setTimeout(() => p.then(r), ms));
