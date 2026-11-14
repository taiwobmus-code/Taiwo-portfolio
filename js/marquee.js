/* Stack marquee: clones the items for a seamless loop, scrolls on the animation frame, pauses on hover */
(() => {
  const box = document.querySelector('[data-marquee]');
  if (!box) return;
  const track = box.firstElementChild, items = [...track.children];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { box.style.overflowX = 'auto'; return; }
  const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
  let loop = 0, x = 0, last = 0, paused = false;
  const build = () => {
    track.querySelectorAll('[data-clone]').forEach(n => n.remove());
    loop = items.reduce((s, n) => s + n.offsetWidth + gap, 0);
    for (let i = 0; i < Math.ceil(box.offsetWidth / loop) + 1; i++) items.forEach(n => {
      const c = n.cloneNode(true); c.dataset.clone = ''; c.setAttribute('aria-hidden', 'true'); track.append(c);
    });
  };
  const frame = t => {
    const dt = Math.min(t - last, 50) / 1000; last = t;
    if (!paused) { x = (x + 50 * dt) % loop; track.style.transform = `translate3d(${-x}px,0,0)`; }
    requestAnimationFrame(frame);
  };
  build(); addEventListener('resize', build);
  box.addEventListener('pointerenter', () => { paused = true; });
  box.addEventListener('pointerleave', () => { paused = false; });
  requestAnimationFrame(t => { last = t; frame(t); });
})();
