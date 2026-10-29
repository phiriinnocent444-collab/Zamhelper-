/* Live helper search: asks api/helpers.php for JSON and redraws the cards without reloading. Falls back to the normal form submit. */
(() => {
  const form = document.getElementById('helperForm'), box = document.getElementById('helperResults'), count = document.getElementById('helperCount');
  if (!form || !box || !window.fetch) return;
  const BASE = window.ZAM_BASE || ''; let ctl = null, page = 1;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  function card(h) {
    const a = el('article', 'helper-card');
    if (h.photo) { const i = el('img', 'helper-photo'); i.src = BASE + h.photo; i.alt = ''; i.width = i.height = 64; i.loading = 'lazy'; a.append(i); }
    else a.append(el('div', 'helper-avatar', (h.name || '?').charAt(0).toUpperCase()));
    const meta = el('div', 'helper-meta'); meta.append(el('span', 'pill', h.verified ? '✓ Verified' : 'Local helper'));
    meta.append(el('span', 'rating', h.review_count ? '★ ' + h.rating.toFixed(1) + ' (' + h.review_count + ')' : 'New')); a.append(meta);
    a.append(el('h3', '', h.name), el('p', '', h.city + ' · ' + (h.services.join(', ') || 'General services')));
    if (h.busy_now) a.append(el('p', 'busy-tag', 'Busy right now. You can still book a later time.'));
    const b = el('a', 'text-link', 'Request this helper →'); b.href = BASE + h.book_url; const p = el('a', 'text-link', 'Profile & reviews'); p.href = BASE + h.profile_url;
    a.append(b, document.createTextNode(' '), p); return a;
  }
  function render(j) {
    box.replaceChildren(); count.textContent = j.total + ' listed helpers';
    if (!j.total) { const d = el('div', 'empty-state'); d.append(el('h3', '', j.all_count ? 'No helpers match your search.' : 'Our network is growing.'), el('p', '', j.all_count ? 'Try a different name, city or service.' : 'Helper profiles will appear here soon.')); box.append(d); return; }
    const g = el('div', 'helper-grid'); j.items.forEach(h => g.append(card(h))); box.append(g);
    if (j.pages > 1) { const n = el('nav', 'pager'); n.setAttribute('aria-label', 'Pages');
      for (let i = 1; i <= j.pages; i++) { const l = el('a', '', String(i)); l.href = '#'; if (i === j.page) l.setAttribute('aria-current', 'page'); l.addEventListener('click', e => { e.preventDefault(); load(i); }); n.append(l); }
      box.append(n); }
  }
  async function load(p) {
    page = p || 1; if (ctl) ctl.abort(); ctl = new AbortController();
    const d = new FormData(form), params = new URLSearchParams({ q: d.get('q') || '', service: d.get('service') || '', sort: d.get('sort') || 'rating', page });
    try { const r = await fetch(BASE + 'api/helpers.php?' + params, { signal: ctl.signal, headers: { Accept: 'application/json' } }); if (!r.ok) throw 0; render(await r.json());
      const keep = new URLSearchParams(); ['q', 'service', 'sort'].forEach(k => { if (d.get(k)) keep.set(k, d.get(k)); }); history.replaceState(null, '', keep.toString() ? '?' + keep : location.pathname); }
    catch (e) { if (e && e.name === 'AbortError') return; form.submit(); }
  }
  let t; form.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => load(1), 300); });
  form.addEventListener('submit', e => { e.preventDefault(); load(1); });
})();
