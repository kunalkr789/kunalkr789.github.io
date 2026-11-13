import { useEffect, useState, type RefObject } from 'react';

/** Counts from 0 to `to` once the element scrolls into view. */
export function useCountUp(to: number, ref: RefObject<HTMLElement | null>, duration = 1400) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setN(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          // rAF timestamps can predate t0 by a frame, so clamp to [0, 1]
          const p = Math.min(1, Math.max(0, (t - t0) / duration));
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, ref, duration]);

  return n;
}
