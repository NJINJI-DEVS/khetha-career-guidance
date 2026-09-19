// Returns a ref for the scrolling <main>, and sends it back to the top
// whenever the tab or overlay route changes.
//
// The app scrolls an inner container rather than the document, and that
// container's scrollTop survives a tab change — so a learner who had scrolled
// down Home and then tapped a bottom-nav tab landed halfway down the new
// screen, past its heading. Opening a screen should start at its beginning.

import { useRef, useEffect } from 'react';

export function useScrollReset(...keys) {
  const ref = useRef(null);
  useEffect(() => {
    // 'auto', not 'smooth': a visible scroll animation on every navigation
    // reads as lag, and reduce-motion users have asked not to see it.
    ref.current?.scrollTo({ top: 0, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, keys);
  return ref;
}
