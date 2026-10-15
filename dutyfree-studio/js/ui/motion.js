/* One motion grammar for the whole site: blocks rise and fade in (28 px, 1 s, expo out, 70 ms apart), once.
 * The home hero eases out while scrolling. Nothing else moves, and nothing moves with reduced motion. */

export const RISE = { opacity: 0, y: 28 };
export const RISE_TO = { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07 };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motionOK = () => Boolean(window.gsap) && !reduced();

let mm = null;

/**
 * Sets up the motion of a freshly rendered page. With `entrance`, blocks in view play their entrance;
 * otherwise (re-render after a change) they appear at once and only blocks below the fold will rise.
 */
export function startMotion(main, { entrance = true, home = false } = {}) {
  stopMotion();
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const blocks = [...main.querySelectorAll('[data-reveal]')];
    const fold = window.innerHeight;
    const inView = blocks.filter((el) => el.getBoundingClientRect().top < fold * 0.92);
    const below = blocks.filter((el) => !inView.includes(el));
    if (entrance) {
      const intro = [...main.querySelectorAll('[data-enter]')];
      if (intro.length) gsap.from(intro, { ...RISE, duration: RISE_TO.duration, ease: RISE_TO.ease, stagger: RISE_TO.stagger });
      if (inView.length) gsap.fromTo(inView, RISE, { ...RISE_TO, delay: intro.length ? 0.2 : 0 });
    }
    if (below.length) {
      gsap.set(below, RISE);
      ScrollTrigger.batch(below, { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { ...RISE_TO, overwrite: true }) });
    }
    /* After a navigation the scroll reset is processed in the next frame: measure the triggers again then,
       otherwise blocks below the fold could keep a start position computed for the previous page. */
    if (entrance) requestAnimationFrame(() => ScrollTrigger.refresh());
    if (home) {
      const copy = main.querySelector('[data-hero-copy]');
      if (copy) {
        gsap.to(copy, { y: -60, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
      }
    }
  });
}

export function stopMotion() {
  if (mm) {
    mm.revert();
    mm = null;
  }
}

/** Plays the entrance of blocks replaced in place (a filter, a new destination). */
export function revealNow(elements) {
  if (!motionOK() || !elements.length) return;
  gsap.fromTo(elements, RISE, { ...RISE_TO, stagger: 0.05 });
}

/** Shows a block and the blocks inside it at once (before an in-page jump, so the jump lands on the final position). */
export function settleReveals(el) {
  if (!window.gsap || !el) return;
  const blocks = [el.closest('[data-reveal]'), ...el.querySelectorAll('[data-reveal]')].filter(Boolean);
  blocks.forEach((b) => {
    if (Number(gsap.getProperty(b, 'opacity')) < 1 || Number(gsap.getProperty(b, 'y')) !== 0) gsap.set(b, { opacity: 1, y: 0, overwrite: true });
  });
}

/** Anything reached with the keyboard is shown at once, even before its reveal. */
export function bindFocusReveal() {
  document.addEventListener('focusin', (event) => {
    const block = event.target.closest?.('[data-reveal]');
    if (block && window.gsap && Number(gsap.getProperty(block, 'opacity')) < 1) {
      gsap.to(block, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', overwrite: true });
    }
  });
}
