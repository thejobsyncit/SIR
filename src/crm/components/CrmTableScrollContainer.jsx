import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from 'lucide-react';

/**
 * CrmTableScrollContainer
 * 
 * Provides a synchronized top horizontal scrollbar and sticky navigation bar for large CRM data tables.
 * When table columns exceed the viewport width:
 * 1. An accessible, synchronized horizontal scrollbar is displayed at the top of the table.
 * 2. It remains sticky at the top while users scroll vertically through many enquiry records.
 * 3. Scrolling either scrollbar, using mouse wheel, Shift+wheel, trackpad, or nudge buttons scrolls both in sync.
 * 4. Automatically hides when there is no horizontal overflow.
 */
export const CrmTableScrollContainer = ({
  children,
  className = '',
  label = 'Columns',
  scrollStep = 280
}) => {
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const contentRef = useRef(null);

  const [scrollWidth, setScrollWidth] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isSyncing = useRef(null); // 'top' | 'table' | null
  const syncTimer = useRef(null);

  // Update overflow state and dimensions
  const updateDimensions = useCallback(() => {
    const tableEl = tableScrollRef.current;
    if (!tableEl) return;

    const sWidth = tableEl.scrollWidth;
    const cWidth = tableEl.clientWidth;
    const overflow = sWidth > cWidth + 2;

    setScrollWidth(sWidth);
    setHasOverflow(overflow);

    const maxScroll = sWidth - cWidth;
    setCanScrollLeft(tableEl.scrollLeft > 5);
    setCanScrollRight(maxScroll > 5 && tableEl.scrollLeft < maxScroll - 5);
  }, []);

  // Observe resize of table container and content
  useEffect(() => {
    const tableEl = tableScrollRef.current;
    if (!tableEl) return;

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(tableEl);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(syncTimer.current);
    };
  }, [updateDimensions]);

  // Synchronize top and table scrollbars
  useEffect(() => {
    const topEl = topScrollRef.current;
    const tableEl = tableScrollRef.current;
    if (!topEl || !tableEl || !hasOverflow) return;

    // Initial position sync
    topEl.scrollLeft = tableEl.scrollLeft;

    const handleTopScroll = () => {
      if (isSyncing.current === 'table') return;
      if (Math.abs(tableEl.scrollLeft - topEl.scrollLeft) >= 1) {
        isSyncing.current = 'top';
        tableEl.scrollLeft = topEl.scrollLeft;

        const maxScroll = tableEl.scrollWidth - tableEl.clientWidth;
        setCanScrollLeft(topEl.scrollLeft > 5);
        setCanScrollRight(maxScroll > 5 && topEl.scrollLeft < maxScroll - 5);

        clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
          isSyncing.current = null;
        }, 50);
      }
    };

    const handleTableScroll = () => {
      if (isSyncing.current === 'top') return;
      if (Math.abs(topEl.scrollLeft - tableEl.scrollLeft) >= 1) {
        isSyncing.current = 'table';
        topEl.scrollLeft = tableEl.scrollLeft;

        const maxScroll = tableEl.scrollWidth - tableEl.clientWidth;
        setCanScrollLeft(tableEl.scrollLeft > 5);
        setCanScrollRight(maxScroll > 5 && tableEl.scrollLeft < maxScroll - 5);

        clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(() => {
          isSyncing.current = null;
        }, 50);
      }
    };

    topEl.addEventListener('scroll', handleTopScroll, { passive: true });
    tableEl.addEventListener('scroll', handleTableScroll, { passive: true });

    return () => {
      topEl.removeEventListener('scroll', handleTopScroll);
      tableEl.removeEventListener('scroll', handleTableScroll);
    };
  }, [hasOverflow]);

  // Smooth scroll nudge
  const handleScrollNudge = (direction) => {
    const tableEl = tableScrollRef.current;
    if (!tableEl) return;
    const delta = direction === 'left' ? -scrollStep : scrollStep;
    tableEl.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Allow wheel scrolling horizontally when hovering top scrollbar
  const handleTopWheel = (e) => {
    const topEl = topScrollRef.current;
    if (!topEl) return;
    const delta = e.deltaX || e.deltaY;
    if (delta) {
      e.preventDefault();
      topEl.scrollLeft += delta;
    }
  };

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top Synchronized Scrollbar Bar (Sticky inside table container) */}
      {hasOverflow && (
        <div
          data-testid="crm-top-scrollbar-bar"
          className="sticky top-0 z-20 flex items-center gap-3 px-4 py-2 bg-slate-50/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors"
        >
          {/* Left Nudge Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleScrollNudge('left')}
              disabled={!canScrollLeft}
              className="p-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
              title="Scroll columns left"
              aria-label="Scroll table left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollNudge('right')}
              disabled={!canScrollRight}
              className="p-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs active:scale-95 cursor-pointer"
              title="Scroll columns right"
              aria-label="Scroll table right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 select-none hidden sm:inline ml-1 flex items-center gap-1">
              <ChevronsLeftRight className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{label}</span>
            </span>
          </div>

          {/* Top Scrollbar Track */}
          <div
            ref={topScrollRef}
            onWheel={handleTopWheel}
            data-testid="crm-top-scrollbar-track"
            className="flex-1 overflow-x-auto overflow-y-hidden crm-table-scrollbar py-0.5 cursor-ew-resize"
            style={{ height: '18px' }}
            title="Drag or roll wheel to scroll table columns"
          >
            <div style={{ width: `${scrollWidth}px`, height: '1px' }} />
          </div>

          {/* Right helper tip */}
          <div className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500 select-none hidden md:flex items-center gap-1 font-medium">
            <span>Shift + Wheel / Drag</span>
          </div>
        </div>
      )}

      {/* Main Table Scroll Container */}
      <div
        ref={tableScrollRef}
        data-testid="crm-table-scroll-container"
        className="overflow-x-auto crm-table-scrollbar"
      >
        <div ref={contentRef} className="min-w-full inline-block align-top">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CrmTableScrollContainer;
