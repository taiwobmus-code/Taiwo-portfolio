/* Home page: typed line, count-up numbers, scroll bar, code window tabs, pointer glow and copy-email button */
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const typed = document.getElementById('typed');
  if (typed && !still) {
    const words = typed.dataset.words.split('|'); let w = 0, c = words[0].length, del = false;
    const tick = () => {
      const word = words[w];
      c += del ? -1 : 1; typed.textContent = word.slice(0, c);
      let wait = del ? 35 : 70;
      if (!del && c === word.length) { del = true; wait = 1700; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 1800);
  }

  const nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !still) {
    const seen = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; seen.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      const step = t => { const p = Math.min((t - t0) / 900, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      el.textContent = '0'; requestAnimationFrame(step);
    }), { threshold: .6 });
    nums.forEach(n => seen.observe(n));
  }

  const bar = document.getElementById('bar');
  if (bar) {
    let queued = false;
    const draw = () => { queued = false; const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`; };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
    draw();
  }

  const copy = document.getElementById('copyMail');
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copy.dataset.mail); copy.textContent = 'Copied!'; setTimeout(() => { copy.textContent = 'Copy email'; }, 1800); }
    catch { location.href = 'mailto:' + copy.dataset.mail; }
  });

  /* code window tabs (arrow keys, Home and End work too) */
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
  const pick = t => tabs.forEach(x => {
    const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => {
      const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return; e.preventDefault(); const to = tabs[(n + tabs.length) % tabs.length]; pick(to); to.focus();
    });
  });

  /* soft light that follows the mouse over the front end and back end panels (mouse only) */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !still) {
    document.querySelectorAll('.glow').forEach(p => p.addEventListener('pointermove', e => {
      const r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
  }
})();
