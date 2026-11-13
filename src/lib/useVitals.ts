import { useEffect, useState } from 'react';

export interface Vitals {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls: number;
  inp?: number;
  jsKb?: number;
  requests?: number;
}

/** Collects Core Web Vitals for this page, live, with PerformanceObserver. */
export function useVitals(): Vitals {
  const [v, setV] = useState<Vitals>({ cls: 0 });

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;
    const set = (patch: Partial<Vitals>) => setV((s) => ({ ...s, ...patch }));
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (es: PerformanceEntryList) => void, extra: Record<string, unknown> = {}) => {
      try {
        const o = new PerformanceObserver((l) => cb(l.getEntries()));
        o.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(o);
      } catch {
        /* entry type unsupported in this browser */
      }
    };

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) set({ ttfb: nav.responseStart });

    const resources = () => {
      const rs = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const js = rs.filter((r) => r.initiatorType === 'script' || r.name.endsWith('.js'));
      set({ jsKb: Math.round(js.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) / 1024), requests: rs.length + 1 });
    };
    resources();
    const rt = window.setTimeout(resources, 3000);

    observe('paint', (es) => {
      const f = es.find((e) => e.name === 'first-contentful-paint');
      if (f) set({ fcp: f.startTime });
    });
    observe('largest-contentful-paint', (es) => {
      const last = es[es.length - 1];
      if (last) set({ lcp: last.startTime });
    });
    let cls = 0;
    observe('layout-shift', (es) => {
      for (const e of es as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls += e.value;
      set({ cls });
    });
    let inp = 0;
    observe(
      'event',
      (es) => {
        for (const e of es as (PerformanceEntry & { interactionId?: number })[]) {
          if (e.interactionId && e.duration > inp) inp = e.duration;
        }
        if (inp) set({ inp });
      },
      { durationThreshold: 16 },
    );

    return () => {
      observers.forEach((o) => o.disconnect());
      clearTimeout(rt);
    };
  }, []);

  return v;
}
