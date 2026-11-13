import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { Icon } from '../../../components/Icon';
import { courses, sterisApi, withLatency, type Learner } from '../../../lib/steris';
import { downloadXlsx } from '../../../lib/xlsx';
import { useDebouncedValue } from '../../../lib/useDebouncedValue';

const PAGE = 50;

function downloadCsv(filename: string, rows: Learner[]) {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['ID', 'Name', 'Facility', 'Department', 'Role', 'Course', 'Progress %', 'Certificate'], ...rows.map((l) => [l.id, l.name, l.facility, l.department, l.role, l.course, l.progress, l.certificate])];
  const url = URL.createObjectURL(new Blob([lines.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv' }));
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const courseTitle = Object.fromEntries(courses.map((c) => [c.code, c.title]));

interface Page {
  data: Learner[];
  total: number;
  nextCursor: number | null;
}

/** Cursor-paginated, server-searched rows. Stale responses are dropped by request id. */
function useInfiniteLearners(q: string) {
  const [rows, setRows] = useState<Learner[]>([]);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [searches, setSearches] = useState(0);
  const latest = useRef(0);

  const load = useCallback(
    async (cursor: number, reset: boolean) => {
      const id = ++latest.current;
      setLoading(true);
      if (reset) setSearches((n) => n + 1);
      const res = await withLatency(sterisApi.request('GET', `/api/learners?q=${encodeURIComponent(q)}&cursor=${cursor}&limit=${PAGE}`));
      if (id !== latest.current) return; // a newer search started while this one was in flight
      const page = res.body as Page;
      setRows((r) => (reset ? page.data : [...r, ...page.data]));
      setTotal(page.total);
      setNext(page.nextCursor);
      setLoading(false);
    },
    [q],
  );

  useEffect(() => {
    setRows([]);
    void load(0, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && next !== null) void load(next, false);
  }, [loading, next, load]);

  return { rows, total, loading, searches, loadMore, hasMore: next !== null };
}

interface Note {
  id: string;
  text: string;
}

/** Polls the notifications endpoint every 8s while the tab is visible. */
function useNotificationPolling() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      const res = await sterisApi.request('GET', `/api/notifications?now=${Date.now()}`);
      const added = (res.body as { data: Note[] }).data.filter((x) => !seen.current.has(x.id));
      if (!added.length) return;
      added.forEach((x) => seen.current.add(x.id));
      setNotes((n) => [...added, ...n].slice(0, 8));
      setUnread((u) => u + added.length);
    };
    void poll();
    const id = window.setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);

  return { notes, unread, markRead: () => setUnread(0) };
}

type Group = { key: string; label: string; level: 0 | 1; count: number; avg: number };
type Row = { type: 'group'; g: Group } | { type: 'learner'; l: Learner };

export default function GridDemo() {
  const [input, setInput] = useState('');
  const [keystrokes, setKeystrokes] = useState(0);
  const q = useDebouncedValue(input, 300);
  const { rows, total, loading, searches, loadMore, hasMore } = useInfiniteLearners(q);
  const { notes, unread, markRead } = useNotificationPolling();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [cert, setCert] = useState<Learner | null>(null);
  const [toast, setToast] = useState('');
  const [bellEl, setBellEl] = useState<HTMLElement | null>(null);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [sub, setSub] = useState<{ el: HTMLElement; id: 'assign' | 'export' } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLTableRowElement>(null);

  // Infinite scroll: load the next page when the sentinel row scrolls into the grid viewport.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { root: scroller.current, rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, rows.length]);

  // Tree data: facility → department → learner, with aggregates over loaded rows.
  const flat = useMemo(() => {
    const out: Row[] = [];
    const byFacility = new Map<string, Map<string, Learner[]>>();
    for (const l of rows) {
      const f = byFacility.get(l.facility) ?? new Map<string, Learner[]>();
      f.set(l.department, [...(f.get(l.department) ?? []), l]);
      byFacility.set(l.facility, f);
    }
    const avg = (ls: Learner[]) => Math.round(ls.reduce((s, l) => s + l.progress, 0) / ls.length);
    for (const [facility, depts] of byFacility) {
      const all = [...depts.values()].flat();
      out.push({ type: 'group', g: { key: facility, label: facility, level: 0, count: all.length, avg: avg(all) } });
      if (collapsed.has(facility)) continue;
      for (const [dept, ls] of depts) {
        const key = `${facility}/${dept}`;
        out.push({ type: 'group', g: { key, label: dept, level: 1, count: ls.length, avg: avg(ls) } });
        if (!collapsed.has(key)) ls.forEach((l) => out.push({ type: 'learner', l }));
      }
    }
    return out;
  }, [rows, collapsed]);

  const toggle = (key: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const exportXlsx = () => {
    downloadXlsx(`steris-learners${q ? `-${q}` : ''}.xlsx`, 'Learners', [
      ['ID', 'Name', 'Facility', 'Department', 'Role', 'Course', 'Progress %', 'Certificate'],
      ...rows.map((l) => [l.id, l.name, l.facility, l.department, l.role, l.course, l.progress, l.certificate]),
    ]);
    setToast(`Exported ${rows.length} loaded rows to Excel`);
  };

  const closeMenus = () => {
    setSub(null);
    setMenuEl(null);
  };

  const openSub = (id: 'assign' | 'export') => (e: MouseEvent<HTMLElement>) => setSub({ el: e.currentTarget, id });

  return (
    <div className="grid-demo">
      <div className="gd-toolbar">
        <TextField
          className="gd-search"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setKeystrokes((k) => k + 1);
          }}
          placeholder="Search 10,000 learners on the server…"
          slotProps={{
            htmlInput: { 'aria-label': 'Search learners' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="search" size={13} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tooltip describeChild title="Polls /api/notifications every 8 seconds">
          <IconButton
            aria-label={`Notifications, ${unread} unread`}
            onClick={(e) => {
              setBellEl(e.currentTarget);
              markRead();
            }}
          >
            <Badge badgeContent={unread} color="error" max={9}>
              <Icon name="bell" size={15} />
            </Badge>
          </IconButton>
        </Tooltip>
        <Button size="small" onClick={(e) => setMenuEl(e.currentTarget)} endIcon={<Icon name="chevron" size={11} />} aria-haspopup="menu">
          Bulk actions
        </Button>
      </div>

      <div className="gd-meta mono">
        <span>
          keystrokes <b data-testid="keystroke-count">{keystrokes}</b> → search requests <b data-testid="search-count">{searches}</b> <span className="gd-hint">(300 ms debounce)</span>
        </span>
        <span>
          loaded <b data-testid="loaded-count">{rows.length}</b> of <b>{total.toLocaleString()}</b>
          {loading && <i className="spin" />}
        </span>
      </div>

      <div className="gd-scroll" ref={scroller} tabIndex={0} aria-label="Learner grid">
        <Table stickyHeader size="small" className="gd-table">
          <TableHead>
            <TableRow>
              <TableCell>Learner</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Course</TableCell>
              <TableCell sx={{ width: 140 }}>Progress</TableCell>
              <TableCell>Certificate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flat.map((r) =>
              r.type === 'group' ? (
                <TableRow key={r.g.key} className={`gd-group l${r.g.level}`} hover>
                  <TableCell colSpan={3}>
                    <button className="gd-toggle" onClick={() => toggle(r.g.key)} aria-expanded={!collapsed.has(r.g.key)}>
                      <Icon name="chevron" size={11} className={collapsed.has(r.g.key) ? 'closed' : ''} />
                      {r.g.label}
                      <span className="gd-count mono">{r.g.count}</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="gd-avg mono">avg {r.g.avg}%</span>
                  </TableCell>
                  <TableCell />
                </TableRow>
              ) : (
                <TableRow key={r.l.id} hover className="gd-row">
                  <TableCell className="gd-name">{r.l.name}</TableCell>
                  <TableCell>{r.l.role}</TableCell>
                  <TableCell>
                    <Tooltip title={courseTitle[r.l.course]}>
                      <span className="mono">{r.l.course}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="gd-progress">
                      <LinearProgress variant="determinate" value={r.l.progress} color={r.l.progress === 100 ? 'success' : 'secondary'} />
                      <span className="mono">{r.l.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.l.certificate ? <Chip label="View" clickable onClick={() => setCert(r.l)} icon={<Icon name="shield" size={11} />} /> : <span className="gd-dim">—</span>}</TableCell>
                </TableRow>
              ),
            )}
            <TableRow ref={sentinel}>
              <TableCell colSpan={5} className="gd-sentinel mono">
                {hasMore ? (loading ? 'loading next page…' : 'scroll for more') : rows.length ? `end of results · ${total.toLocaleString()} rows` : loading ? 'searching…' : 'no learners match'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* notifications */}
      <Menu anchorEl={bellEl} open={!!bellEl} onClose={() => setBellEl(null)} slotProps={{ paper: { className: 'gd-notes' } }}>
        {notes.length === 0 && <MenuItem disabled>No notifications yet · polling…</MenuItem>}
        {notes.map((n) => (
          <MenuItem key={n.id} onClick={() => setBellEl(null)}>
            <ListItemText primary={n.text} />
          </MenuItem>
        ))}
      </Menu>

      {/* nested bulk-actions menu */}
      <Menu anchorEl={menuEl} open={!!menuEl} onClose={closeMenus}>
        <MenuItem onClick={openSub('assign')} onKeyDown={(e) => e.key === 'ArrowRight' && openSub('assign')(e as unknown as MouseEvent<HTMLElement>)} aria-haspopup="menu">
          <ListItemText>Assign course</ListItemText>
          <Icon name="chevron" size={11} className="sub-caret" />
        </MenuItem>
        <MenuItem onClick={openSub('export')} onKeyDown={(e) => e.key === 'ArrowRight' && openSub('export')(e as unknown as MouseEvent<HTMLElement>)} aria-haspopup="menu">
          <ListItemText>Export view</ListItemText>
          <Icon name="chevron" size={11} className="sub-caret" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenus();
            setToast(`Reminder queued for ${rows.filter((l) => l.progress < 100).length} incomplete learners in view`);
          }}
        >
          Send reminder
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={sub?.el}
        open={!!sub}
        onClose={() => setSub(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onKeyDown={(e) => e.key === 'ArrowLeft' && setSub(null)}
      >
        {sub?.id === 'assign'
          ? courses.map((c) => (
              <MenuItem
                key={c.code}
                onClick={() => {
                  closeMenus();
                  setToast(`Assigned ${c.code} to ${rows.length} learners in view`);
                }}
              >
                <ListItemText primary={c.code} secondary={c.title} />
              </MenuItem>
            ))
          : [
              <MenuItem
                key="xlsx"
                onClick={() => {
                  closeMenus();
                  exportXlsx();
                }}
              >
                Excel (.xlsx)
              </MenuItem>,
              <MenuItem
                key="csv"
                onClick={() => {
                  closeMenus();
                  downloadCsv(`steris-learners.csv`, rows);
                  setToast(`Exported ${rows.length} loaded rows to CSV`);
                }}
              >
                CSV (.csv)
              </MenuItem>,
            ]}
      </Menu>

      <Dialog open={!!cert} onClose={() => setCert(null)} maxWidth="xs" fullWidth>
        {cert && (
          <DialogContent>
            <div className="cert">
              <span className="cert-k mono">Certificate of completion</span>
              <b className="serif">{cert.name}</b>
              <span>has completed</span>
              <b>{courseTitle[cert.course]}</b>
              <span className="mono cert-no">{cert.certificate}</span>
              <span className="cert-org">
                {cert.department} · {cert.facility}
              </span>
            </div>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setCert(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2600} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}
