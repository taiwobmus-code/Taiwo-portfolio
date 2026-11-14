/* Academic Planner: add, edit, complete, delete, search, filter and export tasks, grouped by deadline, with a live clock and an up-next list. Saved in localStorage. */
const KEY = 'tb-tasks', $ = id => document.getElementById(id), form = $('taskForm'), NAMES = { 1: 'High', 2: 'Medium', 3: 'Low' };
const iso = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
let today = iso(new Date()), tasks = [], view = 'all', q = '';
try { tasks = JSON.parse(localStorage.getItem(KEY)) || []; } catch { tasks = []; }
tasks.forEach(t => { t.id = t.id || Math.random().toString(36).slice(2); });
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {} };
const late = t => !t.done && t.due && t.due < today;
const order = (a, b) => (a.due || '9').localeCompare(b.due || '9') || (a.pri || 2) - (b.pri || 2);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
const GROUPS = [['Overdue', 'over', late], ['Today', '', t => !t.done && t.due === today], ['Upcoming', '', t => !t.done && t.due > today], ['No due date', '', t => !t.done && !t.due], ['Completed', '', t => t.done]];
const when = d => {
  const n = Math.round((new Date(d + 'T00:00') - new Date(today + 'T00:00')) / 864e5);
  return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : n < 0 ? `${-n} days ago` : n < 8 ? `in ${n} days` : new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

function row(t) {
  const li = el('li', [t.done && 'done', late(t) && 'late'].filter(Boolean).join(' ')), box = el('input'), body = el('div', 'body'), txt = el('span', 'txt', t.text), acts = el('div', 'acts');
  box.type = 'checkbox'; box.checked = t.done; box.setAttribute('aria-label', 'Mark complete: ' + t.text);
  box.addEventListener('change', () => { t.done = box.checked; save(); render(); });
  txt.title = 'Double-click to edit';
  txt.addEventListener('dblclick', () => { const v = prompt('Edit task', t.text); if (v && v.trim()) { t.text = v.trim(); save(); render(); } });
  const meta = [];
  if (t.course) meta.push(t.course);
  if (t.due) meta.push(late(t) ? 'Overdue, due ' + when(t.due) : 'Due ' + when(t.due));
  body.append(txt, el('small', '', meta.join(' | ')));
  const del = el('button', 'x', '\u2715'); del.type = 'button'; del.setAttribute('aria-label', 'Delete task: ' + t.text);
  del.addEventListener('click', () => {
    const i = tasks.indexOf(t); tasks = tasks.filter(x => x !== t); save(); render();
    toast('Task deleted.', () => { tasks.splice(i, 0, t); save(); render(); });
  });
  acts.append(el('em', 'p p' + (t.pri || 2), NAMES[t.pri || 2]), del); li.append(box, body, acts); return li;
}
function render() {
  const f = tasks.filter(t => (view === 'all' || (view === 'done') === t.done) && (t.text + ' ' + (t.course || '')).toLowerCase().includes(q)), box = $('tasks');
  box.replaceChildren();
  GROUPS.forEach(([name, cls, test]) => {
    const items = f.filter(test).sort(order); if (!items.length) return;
    const h = el('h3', 'gh ' + cls, name); h.append(el('span', '', String(items.length)));
    const ul = el('ul', 'glist'); ul.append(...items.map(row)); box.append(h, ul);
  });
  const open = tasks.filter(t => !t.done), done = tasks.length - open.length;
  $('sOpen').textContent = open.length; $('sToday').textContent = open.filter(t => t.due === today).length;
  $('sLate').textContent = tasks.filter(late).length; $('sDone').textContent = done;
  $('empty').hidden = f.length > 0; $('empty').textContent = tasks.length ? 'No tasks match this view.' : 'No tasks yet. Add your first one above.';
  $('bar').value = tasks.length ? Math.round(done / tasks.length * 100) : 0; $('count').textContent = `${done} of ${tasks.length} tasks completed`;
  $('courses').replaceChildren(...[...new Set(tasks.map(t => t.course).filter(Boolean))].map(c => { const o = el('option'); o.value = c; return o; }));
  const next = open.filter(t => t.due).sort(order).slice(0, 4);
  $('next').replaceChildren(...(next.length ? next.map(t => { const li = el('li'), w = when(t.due); li.append(el('b', '', t.text), el('span', '', w[0].toUpperCase() + w.slice(1))); return li; }) : [el('li', 'mu', 'Nothing scheduled. Give a task a due date and it shows up here.')]));
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = form.text.value.trim();
  if (!text) { form.text.classList.add('bad'); form.text.focus(); return; }
  form.text.classList.remove('bad');
  tasks.unshift({ id: Math.random().toString(36).slice(2), text, course: form.course.value.trim(), due: form.due.value, pri: Number(form.pri.value), done: false });
  save(); form.reset(); render(); form.text.focus();
});
document.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { form.due.value = addDays(+b.dataset.d); }));
document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
  view = b.dataset.f; document.querySelectorAll('.filters button').forEach(x => x.classList.toggle('on', x === b)); render();
}));
$('q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
$('clearDone').addEventListener('click', () => { tasks = tasks.filter(t => !t.done); save(); render(); });
$('exportBtn').addEventListener('click', () => {
  const lines = [...tasks].sort(order).map(t => `[${t.done ? 'x' : ' '}] ${t.text} (${[t.course, NAMES[t.pri || 2], t.due && 'due ' + t.due].filter(Boolean).join(', ')})`);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n') || 'No tasks yet.'], { type: 'text/plain' })); a.download = 'my-tasks.txt'; a.click(); URL.revokeObjectURL(a.href);
});
let toastTimer;
function toast(msg, undo) {
  const t = $('toast'), b = el('button', '', 'Undo');
  b.addEventListener('click', () => { undo(); t.classList.remove('show'); });
  t.replaceChildren(msg, b); t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 5000);
}
/* Live clock: the current time only */
function tick() {
  const d = new Date(), h = d.getHours(), p = n => String(n).padStart(2, '0');
  $('hm').textContent = `${h % 12 || 12}:${p(d.getMinutes())}`; $('sec').textContent = `:${p(d.getSeconds())} ${h < 12 ? 'AM' : 'PM'}`;
  $('cdate').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('greet').textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const t = iso(d); if (t !== today) { today = t; render(); }
}
tick(); setInterval(tick, 1000); render();
