import React, { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  // Parse the value, e.g., '50,000+' -> 50000 and '+'
  // '98%' -> 98 and '%'
  const numStr = value.replace(/[^0-9]/g, '');
  const targetNum = parseInt(numStr, 10);
  const suffix = value.replace(/[0-9,]/g, '');
  const hasComma = value.includes(',');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after it becomes visible so it only animates once
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const incrementTime = 30; // ms
    const steps = duration / incrementTime;
    const stepValue = targetNum / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= targetNum) {
        setCount(targetNum);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetNum, isVisible]);

  const formattedCount = hasComma ? count.toLocaleString() : count;

  return (
    <span ref={counterRef}>
      {formattedCount}{suffix}
    </span>
  );
};

export default AnimatedCounter;
