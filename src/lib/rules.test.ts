import { evaluate, makeCohort, matches, type Condition } from './rules';

const c = (field: Condition['field'], op: Condition['op'], value: string): Condition => ({ id: field, field, op, value });

describe('rules engine', () => {
  const cohort = makeCohort();

  it('generates a deterministic cohort', () => {
    expect(makeCohort()).toEqual(cohort);
    expect(cohort).toHaveLength(240);
  });

  it('applies numeric and enum operators', () => {
    const p = cohort[0];
    expect(matches(p, c('age', 'gt', String(p.age - 1)))).toBe(true);
    expect(matches(p, c('age', 'lt', String(p.age)))).toBe(false);
    expect(matches(p, c('channel', 'eq', p.channel))).toBe(true);
    expect(matches(p, c('channel', 'neq', p.channel))).toBe(false);
  });

  it('ALL narrows and ANY widens the segment', () => {
    const rules = [c('age', 'gt', '60'), c('risk', 'eq', 'high')];
    const all = evaluate(cohort, rules, 'all');
    const any = evaluate(cohort, rules, 'any');
    expect(all.length).toBeLessThan(any.length);
    expect(all.every((p) => p.age > 60 && p.risk === 'high')).toBe(true);
  });

  it('returns everyone when there are no conditions', () => {
    expect(evaluate(cohort, [], 'all')).toHaveLength(cohort.length);
  });
});
