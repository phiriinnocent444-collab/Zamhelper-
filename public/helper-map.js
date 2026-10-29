/* Helper profile: choose an approximate base area. Stored rounded to ~10 m; only used to measure travel distance. */
(() => {
  const el = document.getElementById('baseMap'); if (!el) return;
  const lat = document.getElementById('base_lat'), lng = document.getElementById('base_lng'), note = document.getElementById('baseNote');
  window.addEventListener('load', () => {
    if (!window.ZamMap || !window.L) { el.hidden = true; note.textContent = 'The map could not load. Try again with a connection.'; return; }
    let zm;
    const pick = (a, o) => { if (!zm.inZambia(a, o)) { note.textContent = 'That spot is outside Zambia.'; return; } lat.value = a.toFixed(6); lng.value = o.toFixed(6); zm.setPin(a, o); note.textContent = 'Base area chosen. Press "Save base area" to keep it.'; };
    zm = ZamMap.create(el, { onPick: pick, title: 'Your base area' });
    if (lat.value && lng.value) { zm.setPin(Number(lat.value), Number(lng.value), true); }
    document.getElementById('baseClear').addEventListener('click', () => { lat.value = lng.value = ''; zm.clear(); note.textContent = 'Cleared. Press "Save base area" to remove it.'; });
  });
})();
