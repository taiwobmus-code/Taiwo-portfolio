/* Contact form: checks the fields, then opens the visitor's own email with the message already written.
   - Phone or tablet (iPhone, iPad, Android): opens the email app on the device. The visitor only presses Send.
   - Laptop or desktop: opens Gmail in a new browser tab with the message filled in. Outlook and the computer's
     email app are one click away, and the choice is remembered for next time.
   - If the three EmailJS keys below are filled in, the message is sent straight to the inbox instead, and the
     email-opening options appear only if that sending fails. */
const TO = 't.badmus1403@miva.edu.ng';
const EMAILJS = { service: 'YOUR_SERVICE_ID', template: 'YOUR_TEMPLATE_ID', key: 'YOUR_PUBLIC_KEY' };
const emailReady = !Object.values(EMAILJS).some(v => v.startsWith('YOUR_'));
const isTouchDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const f = document.getElementById('contactForm'), status = document.getElementById('status'), sendBtn = document.getElementById('sendBtn'), opts = document.getElementById('sendOpts');
const rules = {
  name: v => v.trim() !== '' || 'Name is required.',
  email: v => v.trim() === '' ? 'Email address is required.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email, e.g. name@example.com.'),
  phone: v => v.trim() === '' ? 'Phone number is required.' : (/^\d+$/.test(v.trim()) || 'Phone number must contain digits only.'),
  message: v => v.trim() !== '' || 'Message is required.'
};
function check(field) {
  const res = rules[field.name](field.value), ok = res === true;
  field.classList.toggle('bad', !ok); field.setAttribute('aria-invalid', String(!ok));
  document.getElementById(field.name + 'Err').textContent = ok ? '' : res; return ok;
}
function say(text, fail) { status.textContent = text; status.classList.toggle('fail', !!fail); }

/* the draft every option opens */
const subjectOf = d => 'Portfolio message from ' + d.name;
const bodyOf = d => `Hello Taiwo,\n\n${d.message}\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}`;
const enc = encodeURIComponent;
const PROVIDERS = {
  gmail:   { label: 'Gmail',           web: true,  url: d => `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(TO)}&su=${enc(subjectOf(d))}&body=${enc(bodyOf(d))}` },
  outlook: { label: 'Outlook',         web: true,  url: d => `https://outlook.office.com/mail/deeplink/compose?to=${enc(TO)}&subject=${enc(subjectOf(d))}&body=${enc(bodyOf(d))}` },
  app:     { label: 'your email app',  web: false, url: d => `mailto:${TO}?subject=${enc(subjectOf(d))}&body=${enc(bodyOf(d).replace(/\n/g, '\r\n'))}` }
};
const getPref = () => { try { return localStorage.getItem('tb-mail'); } catch { return null; } };
const setPref = k => { try { localStorage.setItem('tb-mail', k); } catch {} };

function launch(key, d) {
  const p = PROVIDERS[key], url = p.url(d);
  if (p.web) { const w = window.open(url, '_blank'); if (w) { try { w.opener = null; } catch {} } return !!w; }
  const a = document.createElement('a'); a.href = url; a.style.display = 'none'; document.body.append(a); a.click(); a.remove(); return true;
}
function showOptions(d, lead, active) {
  say(lead);
  const row = document.createElement('div'); row.className = 'opts';
  Object.entries(PROVIDERS).forEach(([key, p]) => {
    const a = document.createElement('a'); a.className = 'btn sm ' + (key === active ? '' : 'alt'); a.href = p.url(d); a.textContent = key === 'app' ? 'Email app' : p.label;
    if (p.web) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', () => setPref(key)); row.append(a);
  });
  const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn alt sm'; copy.textContent = 'Copy message';
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`To: ${TO}\nSubject: ${subjectOf(d)}\n\n${bodyOf(d)}`); copy.textContent = 'Copied'; } catch { copy.textContent = 'Press Ctrl+C'; }
    setTimeout(() => { copy.textContent = 'Copy message'; }, 1800);
  });
  row.append(copy);
  const hint = document.createElement('p'); hint.className = 'hint'; hint.textContent = 'Nothing opened? Pick another option. Your message is still in the form.';
  opts.replaceChildren(row, hint); opts.hidden = false;
}
function openDraft(d) {
  const key = getPref() in PROVIDERS ? getPref() : (isTouchDevice ? 'app' : 'gmail');
  const opened = launch(key, d), label = PROVIDERS[key].label;
  showOptions(d, opened ? `Thanks, ${d.name}. Your message is ready in ${label}. Press Send there to deliver it.` : `Your browser blocked the new tab. Choose where to open your message.`, key);
}

Object.keys(rules).forEach(n => f[n].addEventListener('blur', () => check(f[n])));

f.addEventListener('submit', async e => {
  e.preventDefault();
  opts.hidden = true;
  const ok = Object.keys(rules).map(n => check(f[n])).every(Boolean);
  if (!ok) { say(''); f.querySelector('.bad').focus(); return; }
  const d = { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), message: f.message.value.trim() };

  if (!emailReady) { openDraft(d); return; } /* runs inside the tap or click, so browsers allow the new tab */
  sendBtn.disabled = true; sendBtn.textContent = 'Sending...'; say('');
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.service, template_id: EMAILJS.template, user_id: EMAILJS.key,
        template_params: { from_name: d.name, reply_to: d.email, phone: d.phone, message: d.message } })
    });
    if (!res.ok) throw new Error(await res.text());
    say(`Thank you, ${d.name}! Your message was sent. I will reply to ${d.email}.`); f.reset();
  } catch (err) {
    showOptions(d, 'The message could not be sent from this page. Open it in your email instead and press Send.', isTouchDevice ? 'app' : 'gmail');
    status.classList.add('fail');
  } finally { sendBtn.disabled = false; sendBtn.textContent = 'Send message'; }
});

document.getElementById('copyBtn').addEventListener('click', async e => {
  try { await navigator.clipboard.writeText(TO); e.target.textContent = 'Copied!'; } catch { e.target.textContent = 'Press Ctrl+C'; }
  setTimeout(() => { e.target.textContent = 'Copy'; }, 1800);
});
const counter = document.getElementById('counter'), updateCount = () => { counter.textContent = `${f.message.value.length} / 500`; };
f.message.addEventListener('input', updateCount); f.addEventListener('reset', () => setTimeout(updateCount));
