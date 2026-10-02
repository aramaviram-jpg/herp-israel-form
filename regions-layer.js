/* =====================================================================
   regions-layer.js — shared regions layer for Herp Israel admin maps
   ---------------------------------------------------------------------
   Draws the zoogeographic region outlines (and optional name labels)
   from /israel-regions.geojson on any Leaflet map.

   Usage (after Leaflet is loaded and the map exists):
     const ctl = HerpRegions.attach(map);
     ctl.setOutlines(true);   // show / hide outlines
     ctl.setLabels(true);     // show / hide region names

   Saved switch states (shared by all admin pages):
     HerpRegions.getPref('outlines') / HerpRegions.setPref('outlines', bool)
     HerpRegions.getPref('labels')   / HerpRegions.setPref('labels', bool)

   Light / dark: colours follow the page's existing "map-light-mode"
   class on the map container (or any ancestor) — no extra wiring.
   Region outlines and labels are display-only (no clicks), so they
   never block heatmap or distribution layers.
   ===================================================================== */
(function () {
  const DATA_URL = '/israel-regions.geojson';
  const ATTRIBUTION = 'אזורים: מותאם מ-Fauna Palaestina';
  const PREF_KEYS = { outlines: 'herp_regions_on', labels: 'herp_region_labels_on' };

  // ── Styles (injected once) ────────────────────────────────────
  // Default = dark map; ".map-light-mode" ancestor = light map.
  // CSS stroke overrides the SVG attribute Leaflet writes.
  const css = `
    .herp-region { stroke:#e6dccb; stroke-opacity:.7; }
    .map-light-mode .herp-region { stroke:#4a3c2e; stroke-opacity:.75; }

    .herp-region-label-icon { background:none; border:none; }
    .herp-region-label {
      position:absolute; transform:translate(-50%,-50%);
      white-space:nowrap; pointer-events:none;
      font-family:'Heebo',sans-serif; font-size:12px; font-weight:700;
      direction:rtl; color:#f2ebde;
      text-shadow:0 0 3px #111,0 0 3px #111,0 0 2px #111;
    }
    .map-light-mode .herp-region-label {
      color:#3d2b1f;
      text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff;
    }`;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Data (downloaded once per page) ───────────────────────────
  let dataPromise = null;
  function load() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL)
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(e => { console.error('[regions] load failed:', e); dataPromise = null; return null; });
    }
    return dataPromise;
  }

  // ── Saved preferences ─────────────────────────────────────────
  function getPref(name) {
    try { return localStorage.getItem(PREF_KEYS[name]) === '1'; } catch (e) { return false; }
  }
  function setPref(name, on) {
    try { localStorage.setItem(PREF_KEYS[name], on ? '1' : '0'); } catch (e) {}
  }

  // ── Panes: outlines under everything, labels above heat squares ─
  function ensurePane(map, name, z) {
    if (!map.getPane(name)) {
      map.createPane(name);
      map.getPane(name).style.zIndex = z;
      map.getPane(name).style.pointerEvents = 'none';
    }
  }

  // ── Per-map controller ────────────────────────────────────────
  function attach(map) {
    ensurePane(map, 'herpRegionsPane', 350);      // below overlays (400)
    ensurePane(map, 'herpRegionLabelsPane', 450); // above overlays, below markers (600)

    const want = { outlines: false, labels: false };
    let outlineLayer = null, labelLayer = null;

    async function sync() {
      if (!want.outlines && !want.labels) { apply(); return; }
      const data = await load();
      if (!data) return;
      if (!outlineLayer) {
        outlineLayer = L.geoJSON(data, {
          pane: 'herpRegionsPane',
          interactive: false,
          attribution: ATTRIBUTION,
          style: { className: 'herp-region', color: '#888', weight: 1, opacity: 1, fill: false }
        });
      }
      if (!labelLayer) {
        labelLayer = L.layerGroup(data.features
          .filter(f => Array.isArray(f.properties.label))
          .map(f => L.marker([f.properties.label[1], f.properties.label[0]], {
            pane: 'herpRegionLabelsPane',
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
              className: 'herp-region-label-icon',
              iconSize: [0, 0],
              html: `<span class="herp-region-label">${f.properties.name_he}</span>`
            })
          })));
        labelLayer.getAttribution = () => ATTRIBUTION; // credit shown with labels only, too
      }
      apply();
    }

    function apply() {
      if (outlineLayer) {
        if (want.outlines && !map.hasLayer(outlineLayer)) outlineLayer.addTo(map);
        if (!want.outlines && map.hasLayer(outlineLayer)) map.removeLayer(outlineLayer);
      }
      if (labelLayer) {
        if (want.labels && !map.hasLayer(labelLayer)) labelLayer.addTo(map);
        if (!want.labels && map.hasLayer(labelLayer)) map.removeLayer(labelLayer);
      }
    }

    return {
      setOutlines(on) { want.outlines = !!on; return sync(); },
      setLabels(on)   { want.labels   = !!on; return sync(); }
    };
  }

  window.HerpRegions = { attach, load, getPref, setPref };
})();
