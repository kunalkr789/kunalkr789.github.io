import { useEffect } from 'react';
import { flow, type NodeId } from '../data/flow';
import { setActive, useAppDispatch } from '../app/store';

/** Selects whichever flow node sits in the reading zone (a band ~35% down the viewport). One observer for the whole app. */
export function useTrackActiveNode() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const els = flow.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) dispatch(setActive(hit.target.id as NodeId));
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [dispatch]);
}
