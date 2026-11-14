import React, { useState, useEffect, useRef } from 'react';

export const AnimatedCounter = ({ value, fallback = null }) => {
  const rawString = String(value || '');
  const numStr = rawString.replace(/[^0-9.]/g, '');
  const targetNum = parseFloat(numStr) || (typeof fallback === 'number' ? fallback : 1);
  const suffix = rawString.replace(/[0-9.,]/g, '');
  const hasComma = rawString.includes(',');
  const isFloat = rawString.includes('.');

  // Non-negotiable Issue #7: Never start or show 0
  const [count, setCount] = useState(targetNum);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    if (targetNum > 0) {
      setCount(targetNum);
    }
  }, [targetNum]);

  useEffect(() => {
    const el = counterRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && targetNum > 10) {
          setHasAnimated(true);
          // Animate smoothly from 80% of target to targetNum so it never flashes 0
          const startVal = Math.floor(targetNum * 0.75);
          let current = startVal;
          const duration = 1200;
          const stepMs = 30;
          const totalSteps = duration / stepMs;
          const increment = (targetNum - startVal) / totalSteps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= targetNum) {
              setCount(targetNum);
              clearInterval(timer);
            } else {
              setCount(Math.ceil(current));
            }
          }, stepMs);

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetNum, hasAnimated]);

  const formattedCount = hasComma
    ? Math.round(count).toLocaleString()
    : isFloat
    ? count.toFixed(1)
    : Math.round(count);

  return (
    <span ref={counterRef} className="tabular-nums">
      {formattedCount}{suffix}
    </span>
  );
};

export default AnimatedCounter;
