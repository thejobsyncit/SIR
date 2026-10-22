import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * StaggeredText — premium letter / word reveal (React Bits-style) built on the
 * project's existing framer-motion dependency.
 *
 * Renders an inline <span>, so it is dropped *inside* an existing heading and
 * inherits all of that heading's typography, colour and layout classes.
 *
 * Props
 *  - text       string to animate (required)
 *  - by         'letter' | 'word'                         (default 'word')
 *  - highlight  words/phrases rendered with the premium gradient (case-insensitive)
 *  - trigger    'inView' (on scroll into view, once) | 'mount' (immediately)
 *  - delay      seconds before the first item animates
 *  - stagger    seconds between items (defaults: letter 0.022, word 0.06)
 *
 * Accessibility / robustness
 *  - Screen readers get the full sentence once (sr-only); split pieces are aria-hidden.
 *  - prefers-reduced-motion → static text (gradient highlight kept).
 *  - Scripts with contextual letter joining (Arabic, Hebrew, Devanagari…) automatically
 *    fall back to word mode so glyphs are never broken apart.
 *  - Only opacity + transform are animated → no layout shift, GPU friendly.
 *  - Words are kept on one line (nowrap) so letters never wrap mid-word.
 */

const EASE = [0.22, 1, 0.36, 1];
const COMPLEX_SCRIPT = /[\u0590-\u08FF\u0900-\u0DFF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const containerVariants = {
  hidden: {},
  visible: (cfg) => ({
    transition: { staggerChildren: cfg.stagger, delayChildren: cfg.delay },
  }),
};

const itemVariants = {
  hidden: (distance) => ({ opacity: 0, y: distance }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Split into tokens: { type: 'word' | 'space', value, highlighted } */
function tokenize(text, highlight) {
  const phrases = (highlight || []).filter(Boolean);
  const segments = [];
  if (phrases.length) {
    const re = new RegExp(`(${phrases.map(escapeRegExp).join('|')})`, 'gi');
    text.split(re).forEach((part, i) => {
      if (part) segments.push({ value: part, highlighted: i % 2 === 1 });
    });
  } else {
    segments.push({ value: text, highlighted: false });
  }

  const tokens = [];
  segments.forEach(({ value, highlighted }) => {
    value.split(/(\s+)/).forEach((piece) => {
      if (!piece) return;
      tokens.push(/^\s+$/.test(piece)
        ? { type: 'space', value: ' ' }
        : { type: 'word', value: piece, highlighted });
    });
  });
  return tokens;
}

const StaggeredText = ({
  text = '',
  by = 'word',
  highlight,
  trigger = 'inView',
  delay = 0,
  stagger,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const highlightKey = (highlight || []).join('|');

  const tokens = useMemo(() => tokenize(String(text), highlight), [text, highlightKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const mode = by === 'letter' && !COMPLEX_SCRIPT.test(text) ? 'letter' : 'word';
  const step = stagger ?? (mode === 'letter' ? 0.022 : 0.06);
  const distance = mode === 'letter' ? '0.45em' : '0.6em';

  // Reduced motion: static text, highlight preserved.
  if (reduceMotion) {
    return (
      <span className={className}>
        {tokens.map((tok, i) =>
          tok.type === 'space' ? ' ' : (
            <span key={i} className={tok.highlighted ? 'text-gradient-premium' : undefined}>{tok.value}</span>
          )
        )}
      </span>
    );
  }

  const triggerProps = trigger === 'mount'
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount: 0.4 } };

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        key={text}
        aria-hidden="true"
        initial="hidden"
        custom={{ stagger: step, delay }}
        variants={containerVariants}
        {...triggerProps}
      >
        {tokens.map((tok, i) => {
          if (tok.type === 'space') return ' ';

          // Word mode, or a highlighted word in letter mode: animate the whole word.
          // (Gradient text must live on a single element so the gradient stays continuous.)
          if (mode === 'word' || tok.highlighted) {
            return (
              <motion.span
                key={i}
                custom={distance}
                variants={itemVariants}
                className={`staggered-item${tok.highlighted ? ' text-gradient-premium' : ''}`}
              >
                {tok.value}
              </motion.span>
            );
          }

          return (
            <span key={i} className="staggered-word">
              {Array.from(tok.value).map((ch, j) => (
                <motion.span key={j} custom={distance} variants={itemVariants} className="staggered-item">
                  {ch}
                </motion.span>
              ))}
            </span>
          );
        })}
      </motion.span>
    </span>
  );
};

export default memo(StaggeredText);
