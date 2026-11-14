/* Shared behaviour: light and dark theme (dark by default), mobile menu, scroll reveal, back to top, photo fallback, print button */
(() => {
  document.documentElement.classList.add('js');
  const root = document.documentElement, themeBtn = document.getElementById('themeBtn');
  const paintTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.textContent = dark ? '\u2600' : '\u263E';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.setAttribute('aria-pressed', dark);
    document.querySelector('meta[name=theme-color]').setAttribute('content', dark ? '#060a12' : '#d3e2fb');
  };
  paintTheme();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('tb-theme-v3', root.dataset.theme); } catch {}
    paintTheme();
  });

  const menuBtn = document.getElementById('menuBtn'), nav = document.querySelector('nav');
  menuBtn.textContent = '\u2630';
  menuBtn.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', nav.classList.toggle('open')));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus();
    }
  });

  document.querySelectorAll('img[data-fallback]').forEach(img => {
    const hide = () => { img.hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && !img.naturalWidth) hide();
  });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 }) : null;
  document.querySelectorAll('.rv').forEach(n => io ? io.observe(n) : n.classList.add('in'));

  const header = document.querySelector('.site-header'), top = document.createElement('button');
  top.className = 'top'; top.type = 'button'; top.textContent = '\u2191'; top.setAttribute('aria-label', 'Back to top');
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' })); document.body.append(top);
  addEventListener('scroll', () => { header.classList.toggle('scrolled', scrollY > 10); top.classList.toggle('show', scrollY > 600); }, { passive: true });

  document.querySelectorAll('[data-print]').forEach(b => b.addEventListener('click', () => print()));
})();
