import { configureStore, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { githubApi } from './githubApi';
import { opsFor, fieldMeta, type Condition, type Field } from '../lib/rules';
import type { NodeId } from '../data/flow';

export type Theme = 'dark' | 'light';

const readTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('kk-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* storage unavailable */
  }
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export type RunStatus = 'running' | 'done';

const ui = createSlice({
  name: 'ui',
  initialState: {
    theme: readTheme(),
    paletteOpen: false,
    active: 'top' as NodeId,
    // the guided "Run flow" tour: which nodes have executed
    run: { on: false, status: {} as Partial<Record<NodeId, RunStatus>> },
  },
  reducers: {
    setActive: (s, a: PayloadAction<NodeId>) => {
      s.active = a.payload;
    },
    startRun: (s) => {
      s.run = { on: true, status: {} };
    },
    runStep: (s, a: PayloadAction<{ id: NodeId; status: RunStatus }>) => {
      s.run.status[a.payload.id] = a.payload.status;
    },
    endRun: (s) => {
      s.run.on = false;
    },
    toggleTheme: (s) => {
      s.theme = s.theme === 'dark' ? 'light' : 'dark';
    },
    setPalette: (s, a: PayloadAction<boolean>) => {
      s.paletteOpen = a.payload;
    },
  },
});

const defaultValue = (field: Field) => (fieldMeta[field].kind === 'number' ? '40' : fieldMeta[field].options![0]);

const rules = createSlice({
  name: 'rules',
  initialState: {
    mode: 'all' as 'all' | 'any',
    conditions: [
      { id: 'c1', field: 'age', op: 'gt', value: '45' },
      { id: 'c2', field: 'lastVisitDays', op: 'gt', value: '180' },
      { id: 'c3', field: 'optedIn', op: 'eq', value: 'true' },
    ] as Condition[],
  },
  reducers: {
    addCondition: {
      reducer: (s, a: PayloadAction<Condition>) => {
        s.conditions.push(a.payload);
      },
      prepare: (field: Field = 'risk') => ({
        payload: { id: nanoid(6), field, op: opsFor(field)[0], value: defaultValue(field) } as Condition,
      }),
    },
    updateCondition: (s, a: PayloadAction<{ id: string; patch: Partial<Condition> }>) => {
      const c = s.conditions.find((x) => x.id === a.payload.id);
      if (!c) return;
      Object.assign(c, a.payload.patch);
      if (a.payload.patch.field) {
        c.op = opsFor(c.field)[0];
        c.value = defaultValue(c.field);
      }
    },
    removeCondition: (s, a: PayloadAction<string>) => {
      s.conditions = s.conditions.filter((c) => c.id !== a.payload);
    },
    setMode: (s, a: PayloadAction<'all' | 'any'>) => {
      s.mode = a.payload;
    },
  },
});

export interface Tokens {
  hue: number;
  radius: number;
  density: 'compact' | 'comfortable';
  elevation: number;
}

const tokens = createSlice({
  name: 'tokens',
  initialState: { hue: 168, radius: 10, density: 'comfortable', elevation: 2 } as Tokens,
  reducers: {
    setToken: (s, a: PayloadAction<Partial<Tokens>>) => ({ ...s, ...a.payload }),
  },
});

export const store = configureStore({
  reducer: {
    ui: ui.reducer,
    rules: rules.reducer,
    tokens: tokens.reducer,
    [githubApi.reducerPath]: githubApi.reducer,
  },
  middleware: (gdm) => gdm().concat(githubApi.middleware),
});

store.subscribe(() => {
  try {
    localStorage.setItem('kk-theme', store.getState().ui.theme);
  } catch {
    /* storage unavailable */
  }
});

export const { toggleTheme, setPalette, setActive, startRun, runStep, endRun } = ui.actions;
export const { addCondition, updateCondition, removeCondition, setMode } = rules.actions;
export const { setToken } = tokens.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
