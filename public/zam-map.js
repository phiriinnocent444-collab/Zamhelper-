/* Thin wrapper around the locally vendored Leaflet + OpenStreetMap tiles. Degrades to nothing if Leaflet or the tiles cannot load. */
window.ZamMap = (function () {
  const ZAMBIA = [-13.1339, 27.8493];
  const BOX = { latMin: -18.5, latMax: -8.0, lngMin: 21.5, lngMax: 34.0 };
  const inZambia = (lat, lng) => lat >= BOX.latMin && lat <= BOX.latMax && lng >= BOX.lngMin && lng <= BOX.lngMax;
  function create(el, opts) {
    opts = opts || {};
    if (!el || !window.L) return null;
    try { L.Icon.Default.imagePath = (window.ZAM_BASE || '') + 'assets/vendor/leaflet/images/'; } catch (e) {}
    const map = L.map(el, { scrollWheelZoom: false }).setView(opts.center || ZAMBIA, opts.zoom || 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(map);
    let marker = null;
    const api = {
      map, inZambia,
      setPin(lat, lng, fly) {
        if (marker) marker.setLatLng([lat, lng]);
        else {
          marker = L.marker([lat, lng], { draggable: true, keyboard: true, title: opts.title || 'Pin' }).addTo(map);
          marker.on('dragend', () => { const p = marker.getLatLng(); opts.onPick && opts.onPick(p.lat, p.lng); });
        }
        if (fly) map.setView([lat, lng], Math.max(map.getZoom(), 14));
      },
      clear() { if (marker) { map.removeLayer(marker); marker = null; } },
      hasPin() { return !!marker; },
      centre(lat, lng, z) { map.setView([lat, lng], z || 12); },
    };
    map.on('click', e => opts.onPick && opts.onPick(e.latlng.lat, e.latlng.lng));
    setTimeout(() => map.invalidateSize(), 250);
    return api;
  }
  return { create, inZambia };
})();
