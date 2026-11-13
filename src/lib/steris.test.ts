import { unzipSync, strFromU8 } from 'fflate';
import { createSterisApi, learners } from './steris';
import { buildXlsx } from './xlsx';

describe('steris training api', () => {
  const api = createSterisApi();

  it('pages through 10,000 learners with a cursor', async () => {
    const first = await api.request('GET', '/api/learners?limit=50');
    const body = first.body as { data: unknown[]; total: number; nextCursor: number };
    expect(body.total).toBe(10_000);
    expect(body.data).toHaveLength(50);
    expect(body.nextCursor).toBe(50);
    const last = await api.request('GET', '/api/learners?cursor=9990&limit=50');
    expect((last.body as { nextCursor: null }).nextCursor).toBeNull();
  });

  it('searches server-side across name, course and org unit', async () => {
    const r = await api.request('GET', '/api/learners?q=endoscopy&limit=200');
    const body = r.body as { data: Record<string, unknown>[]; total: number };
    expect(body.total).toBeGreaterThan(0);
    expect(body.total).toBeLessThan(10_000);
    expect(body.data.every((l) => `${l.name} ${l.course} ${l.department} ${l.facility} ${l.role}`.toLowerCase().includes('endoscopy'))).toBe(true);
  });

  it('keeps rows in hierarchy order for the tree grid', () => {
    for (let i = 1; i < 500; i++) {
      const a = learners[i - 1];
      const b = learners[i];
      expect(a.facility.localeCompare(b.facility) <= 0).toBe(true);
    }
  });

  it('issues certificates only for completed learners', () => {
    expect(learners.every((l) => (l.progress === 100) === (l.certificate !== null))).toBe(true);
  });
});

describe('xlsx writer', () => {
  it('produces a valid workbook package with escaped cells', () => {
    const files = unzipSync(buildXlsx('Learners', [['Name', 'Progress'], ['A & <B>', 42]]));
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml']));
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml']);
    expect(sheet).toContain('A &amp; &lt;B&gt;');
    expect(sheet).toContain('<v>42</v>');
  });
});
