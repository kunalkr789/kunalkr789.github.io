import { reply } from './bot';
import { fuzzy } from '../components/CommandPalette';

describe('intent bot', () => {
  it.each([
    ['Does he do backend work?', 'backend'],
    ['what is his tech stack', 'stack'],
    ['Is he open to new roles?', 'hire'],
    ['tell me about MCP and windsurf', 'ai'],
  ])('%s → %s', (q, intent) => {
    expect(reply(q).intent).toBe(intent);
  });

  it('falls back on unrelated questions', () => {
    expect(reply('what is the weather in Paris').intent).toBe('fallback');
  });
});

describe('command palette fuzzy match', () => {
  it('matches subsequences and rejects non-matches', () => {
    expect(fuzzy('apl', 'Open the API playground')).toBeGreaterThan(0);
    expect(fuzzy('xyz', 'Open the API playground')).toBe(0);
  });

  it('ranks word-start matches above scattered ones', () => {
    expect(fuzzy('gt', 'Go to Contact')).toBeGreaterThan(fuzzy('gt', 'Light theme toggle'));
  });
});
