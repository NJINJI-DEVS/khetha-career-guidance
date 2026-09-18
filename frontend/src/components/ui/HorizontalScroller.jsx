import { useEffect, useRef, useState } from 'react';

/* ==================================================================
   A horizontally scrolling row with pagination dots instead of a
   scrollbar. Swiping/dragging still works — this only hides the
   scrollbar chrome and adds a dot per screen-width of content, so
   there's always a visible sense of "there's more" and "you're here"
   without a thin scrollbar most touch devices hide anyway.
   ================================================================== */
export function HorizontalScroller({
  children, className = "", dotsClassName = "",
  dotClassName = "bg-slate-300", dotActiveClassName = "bg-slate-900",
}) {
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const measure = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setPageCount(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
  };

  useEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Children (chips/tabs) can change width without the container resizing.
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div ref={scrollRef} onScroll={onScroll} className={`k-scrollbar-none overflow-x-auto ${className}`}>
        {children}
      </div>
      {pageCount > 1 && (
        <div className={`mt-1.5 flex justify-center gap-1.5 ${dotsClassName}`}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button key={i} type="button" aria-label={`Page ${i + 1} of ${pageCount}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === page ? `w-4 ${dotActiveClassName}` : `w-1.5 ${dotClassName}`}`} />
          ))}
        </div>
      )}
    </div>
  );
}
