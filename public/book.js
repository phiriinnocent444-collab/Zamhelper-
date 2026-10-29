/* Booking page: live price from the server, helper availability, schedule toggle and the map pin. Every part is optional:
   if JavaScript, the API or the map fails, the form still works and the server recalculates everything on submit. */
(() => {
  const $ = id => document.getElementById(id), form = $('bookForm'); if (!form) return;
  const BASE = window.ZAM_BASE || '', service = $('service'), urgent = $('urgent'), dist = $('distance_km'), price = $('price'), priceNote = $('priceNote'),
    city = $('city'), lat = $('job_lat'), lng = $('job_lng'), when = $('when'), duration = $('duration'), whenFields = $('whenFields'),
    availMsg = $('availMsg'), mapNote = $('mapNote'), clearBtn = $('clearPin'), distNote = $('distNote'), helperId = Number(form.dataset.helper || 0);
  const fmt = n => 'K' + Number(n).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const centres = (() => { try { return JSON.parse(form.dataset.cityCentres || '{}'); } catch (e) { return {}; } })();
  const hasPin = () => lat.value !== '' && lng.value !== '';
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  let priceCtl = null, availCtl = null;

  function localPrice() {   // offline fallback, mirrors zam_price() on the server
    const o = service.options[service.selectedIndex], base = Number(o.dataset.price || 0), rate = Number(o.dataset.perKm || 0),
      km = Math.max(0, Math.min(500, Number(dist.value || 0)));
    price.textContent = fmt((base + rate * km) * (urgent.checked ? 1.25 : 1));
  }
  async function updatePrice() {
    if (priceCtl) priceCtl.abort(); priceCtl = new AbortController();
    const p = new URLSearchParams({ service: service.value, urgent: urgent.checked ? '1' : '0', distance_km: dist.value || '0', city: city.value || '' });
    if (helperId) p.set('helper', helperId);
    if (hasPin()) { p.set('lat', lat.value); p.set('lng', lng.value); }
    try {
      const r = await fetch(BASE + 'api/price.php?' + p, { signal: priceCtl.signal, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); price.textContent = j.formatted_total;
      if (j.distance_source === 'map_pin') {
        dist.value = j.distance_km; dist.readOnly = true;
        distNote.textContent = 'Calculated from your pin: about ' + j.distance_km + ' km from ' + j.origin + ' (road estimate).';
        priceNote.textContent = 'Includes travel of ' + fmt(j.travel) + '. Final quote confirmed on WhatsApp';
      } else {
        dist.readOnly = false; distNote.textContent = 'Indicative estimate only. The team confirms the actual route and fee.';
        priceNote.textContent = 'Final quote confirmed on WhatsApp';
      }
    } catch (e) { if (e.name !== 'AbortError') localPrice(); }
  }
  const updatePriceSoon = debounce(updatePrice, 250);

  const scheduled = () => form.querySelector('input[name=when_mode]:checked')?.value === 'scheduled';
  async function checkAvailability() {
    if (!helperId) return; if (availCtl) availCtl.abort(); availCtl = new AbortController();
    const p = new URLSearchParams({ helper: helperId, service: service.value, duration: duration ? duration.value : 120 });
    if (scheduled()) { if (!when.value) { availMsg.hidden = true; return; } p.set('when', when.value); }
    try {
      const r = await fetch(BASE + 'api/availability.php?' + p, { signal: availCtl.signal, headers: { Accept: 'application/json' } });
      const j = await r.json(); if (!j.message) { availMsg.hidden = true; return; }
      availMsg.textContent = (j.available ? '✓ ' : '⚠ ') + j.message; availMsg.dataset.ok = j.available ? '1' : '0'; availMsg.hidden = false;
    } catch (e) { if (e.name !== 'AbortError') availMsg.hidden = true; }
  }
  const checkSoon = debounce(checkAvailability, 300);

  function syncWhen() {
    const on = scheduled(); whenFields.hidden = !on; when.required = on;
    if (!on) when.value = '';
    checkSoon();
  }
  form.querySelectorAll('input[name=when_mode]').forEach(r => r.addEventListener('change', syncWhen));
  [when, duration, service].forEach(el => el && el.addEventListener('change', checkSoon));
  [service, urgent].forEach(el => el.addEventListener('change', updatePriceSoon));
  dist.addEventListener('input', updatePriceSoon);

  // ---- map pin (optional) ----
  let zm = null;
  function setPin(la, ln, fly) {
    if (!zm || !zm.inZambia(la, ln)) { mapNote.textContent = 'That spot is outside Zambia. Please pick a place in Zambia.'; return; }
    lat.value = la.toFixed(6); lng.value = ln.toFixed(6); zm.setPin(la, ln, fly); clearBtn.hidden = false;
    mapNote.textContent = 'Pin set. Drag it to adjust. Map tiles © OpenStreetMap contributors.'; updatePriceSoon();
  }
  function clearPin() { lat.value = lng.value = ''; if (zm) zm.clear(); clearBtn.hidden = true; dist.readOnly = false; mapNote.textContent = 'Pin cleared. Type a distance, or tap the map again.'; updatePriceSoon(); }
  function cityCentre() { const k = (city.value || '').trim().toLowerCase(); return centres[k] || null; }
  window.addEventListener('load', () => {
    const el = $('pinMap'); if (!el) return;
    if (!window.ZamMap || !window.L) { el.hidden = true; $('useLocation').hidden = true; mapNote.textContent = 'The map could not load. You can type the travel distance instead.'; return; }
    const c = cityCentre();
    zm = ZamMap.create(el, { center: c || undefined, zoom: c ? 11 : 6, onPick: setPin, title: 'Job location' });
    if (hasPin()) { zm.setPin(Number(lat.value), Number(lng.value), true); clearBtn.hidden = false; updatePrice(); }
  });
  clearBtn.addEventListener('click', clearPin);
  $('useLocation').addEventListener('click', () => {
    if (!navigator.geolocation) { mapNote.textContent = 'Your browser cannot share its location. Tap the map instead.'; return; }
    mapNote.textContent = 'Finding your location…';
    navigator.geolocation.getCurrentPosition(p => setPin(p.coords.latitude, p.coords.longitude, true),
      () => { mapNote.textContent = 'Could not get your location. Tap the map to drop a pin instead.'; }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });
  city.addEventListener('change', () => { const c = cityCentre(); if (zm && c && !hasPin()) zm.centre(c[0], c[1], 11); updatePriceSoon(); });

  syncWhen(); updatePrice();
})();
