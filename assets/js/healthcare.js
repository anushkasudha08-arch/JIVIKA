/* ==========================================================================
   Nearby healthcare — OpenStreetMap facility search, no API key required
   ========================================================================== */
(function () {
  "use strict";

  const C = JV.content;
  const icon = JV.icon;
  const esc = JV.esc;

  /* Free, key-less map services. The Overpass mirrors are often at capacity
     and some networks cannot reach them at all, so every mirror is asked at
     the same time and Photon (also OpenStreetMap data) is the backup. */
  const OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
  ];
  const PHOTON = "https://photon.komoot.io";
  const OSM_WAIT = 9000;
  const GEO_WAIT = 6000;
  const PHOTON_TERMS = {
    hospital: { term: "hospital", tag: "amenity:hospital" },
    clinic: { term: "clinic", tag: "amenity:clinic" },
    doctors: { term: "doctor", tag: "amenity:doctors" },
    pharmacy: { term: "pharmacy", tag: "amenity:pharmacy" },
    lab: { term: "laboratory", tag: "healthcare:laboratory" }
  };
  const RADII = [2, 5, 10, 20];
  const TYPES = [
    { id: "all", label: "Everything" },
    { id: "hospital", label: "Hospital" },
    { id: "clinic", label: "Clinic" },
    { id: "doctors", label: "Doctor" },
    { id: "pharmacy", label: "Pharmacy" },
    { id: "lab", label: "Laboratory" }
  ];
  const TYPE_META = {
    hospital: { label: "Hospital", icon: "hospital", tone: "teal" },
    clinic: { label: "Clinic", icon: "stethoscope", tone: "lav" },
    doctors: { label: "Doctor / clinic", icon: "stethoscope", tone: "lav" },
    pharmacy: { label: "Pharmacy", icon: "pill", tone: "amber" },
    lab: { label: "Laboratory", icon: "lab", tone: "pink" }
  };

  const state = {
    lat: null, lon: null, label: "", type: "all", radius: 5,
    busy: false, failed: false, govOnly: false, source: ""
  };
  let allResults = [];

  const $ = function (id) { return document.getElementById(id); };

  function setStatus(text, isError) {
    const el = $("findStatus");
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "var(--danger-ink)" : "var(--muted)";
    el.style.fontWeight = isError ? "700" : "400";
  }

  function mapsHref() {
    if (state.lat !== null) {
      return "https://www.google.com/maps/search/hospital+clinic+near+me/@" +
        state.lat.toFixed(4) + "," + state.lon.toFixed(4) + ",14z";
    }
    if (state.label) {
      return "https://www.google.com/maps/search/hospitals+clinics+near+" + encodeURIComponent(state.label);
    }
    return "https://www.google.com/maps/search/hospitals+near+me";
  }

  function syncMapsLink() {
    const a = $("mapsFallback");
    if (a) a.href = mapsHref();
  }

  /* ---------- chips ---------- */
  function makeChips(hostId, items, current, attr, onPick) {
    const host = $(hostId);
    if (!host) return;
    host.innerHTML = items.map(function (t) {
      return '<button class="chip" type="button" ' + attr + '="' + t.id + '" aria-pressed="' +
        (t.id === current) + '">' + esc(t.label) + "</button>";
    }).join("");
    host.querySelectorAll("[" + attr + "]").forEach(function (b) {
      b.addEventListener("click", function () {
        host.querySelectorAll("[" + attr + "]").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        onPick(b.getAttribute(attr));
      });
    });
  }

  /* ---------- geometry ---------- */
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function fmtDistance(km) {
    if (!isFinite(km)) return "";
    return km < 1 ? Math.round(km * 1000) + " m" : km.toFixed(1) + " km";
  }

  /* ---------- network ---------- */
  function wait(ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, ms);
    return {
      signal: ctrl.signal,
      stop: function () { clearTimeout(timer); },
      abort: function () { try { ctrl.abort(); } catch (e) { } }
    };
  }

  function asJson(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  /* Ask every mirror at once and keep the first real answer. Retrying one busy
     server after another made a single congestion look like a broken feature. */
  function overpass(query) {
    return new Promise(function (resolve, reject) {
      let left = OVERPASS.length;
      let settled = false;
      const guards = [];
      OVERPASS.forEach(function (url) {
        const guard = wait(OSM_WAIT);
        guards.push(guard);
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(query),
          signal: guard.signal
        }).then(asJson).then(function (data) {
          if (settled) return;
          settled = true;
          guards.forEach(function (g) { g.stop(); g.abort(); });
          resolve(data);
        }).catch(function () {
          guard.stop();
          if (settled) return;
          left -= 1;
          if (!left) { settled = true; reject(new Error("network")); }
        });
      });
    });
  }

  /* Photon answers named OpenStreetMap places near a point, one category per
     request. Its index is smaller than Overpass but it stays reachable when the
     Overpass mirrors are full, and it needs no key. */
  function photonSearch(lat, lon, radiusKm) {
    const ids = Object.keys(PHOTON_TERMS);
    const out = [];
    let answered = 0;
    let i = 0;
    function step() {
      if (i >= ids.length) return Promise.resolve({ rows: out, ok: answered });
      const spec = PHOTON_TERMS[ids[i++]];
      const guard = wait(GEO_WAIT);
      const url = PHOTON + "/api/?q=" + encodeURIComponent(spec.term) +
        "&lat=" + lat.toFixed(4) + "&lon=" + lon.toFixed(4) +
        "&limit=40&lang=en&osm_tag=" + encodeURIComponent(spec.tag);
      return fetch(url, { headers: { Accept: "application/json" }, signal: guard.signal })
        .then(function (r) { guard.stop(); return asJson(r); })
        .then(function (data) {
          answered += 1;
          (data.features || []).forEach(function (f) {
            const item = photonFacility(f, lat, lon);
            if (item && item.distance <= radiusKm) out.push(item);
          });
          return step();
        })
        .catch(function () { guard.stop(); return step(); });
    }
    return step();
  }

  function photonFacility(f, lat, lon) {
    const p = f.properties || {};
    const g = f.geometry && f.geometry.coordinates;
    if (!g || !p.name) return null;
    const flat = Number(g[1]);
    const flon = Number(g[0]);
    if (!isFinite(flat) || !isFinite(flon)) return null;
    return {
      id: "photon/" + (p.osm_type || "x") + "/" + (p.osm_id || p.name),
      name: p.name,
      amenity: p.osm_value === "laboratory" ? "lab" : (TYPE_META[p.osm_value] ? p.osm_value : "clinic"),
      lat: flat,
      lon: flon,
      phone: "",
      website: "",
      hours: "",
      emergency: false,
      gov: false,
      address: [p.housenumber, p.street, p.city || p.district].filter(Boolean).join(", "),
      distance: haversine(lat, lon, flat, flon),
      source: "photon"
    };
  }

  function photonPlace(place) {
    const guard = wait(GEO_WAIT);
    return fetch(PHOTON + "/api/?q=" + encodeURIComponent(place) + "&limit=1&lang=en", {
      headers: { Accept: "application/json" }, signal: guard.signal
    }).then(function (r) { guard.stop(); return asJson(r); }).then(function (data) {
      const f = data && data.features && data.features[0];
      const g = f && f.geometry && f.geometry.coordinates;
      if (!g) return null;
      const p = f.properties || {};
      return {
        lat: Number(g[1]),
        lon: Number(g[0]),
        label: [p.name, p.city || p.district, p.state].filter(Boolean).slice(0, 3).join(", ") || place
      };
    }).catch(function () { guard.stop(); return null; });
  }

  function geocode(place) {
    const guard = wait(GEO_WAIT);
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=" +
      encodeURIComponent(place);
    return fetch(url, { headers: { Accept: "application/json" }, signal: guard.signal })
      .then(function (r) { guard.stop(); return asJson(r); })
      .then(function (rows) {
        if (rows && rows.length) {
          return {
            lat: Number(rows[0].lat),
            lon: Number(rows[0].lon),
            label: rows[0].display_name.split(",").slice(0, 3).join(", ")
          };
        }
        return photonPlace(place);
      })
      .catch(function () { guard.stop(); return photonPlace(place); });
  }

  /* ---------- search ---------- */
  function parseOverpass(data) {
    return (data.elements || []).map(function (el) {
      const tags = el.tags || {};
      const lat = el.lat !== undefined ? el.lat : (el.center ? el.center.lat : null);
      const lon = el.lon !== undefined ? el.lon : (el.center ? el.center.lon : null);
      if (lat === null || lon === null) return null;
      if (!tags.name && !tags["name:en"]) return null;
      const amenity = tags.amenity || (tags.healthcare === "laboratory" ? "lab" : "clinic");
      const ownership = String(tags["operator:type"] || "").toLowerCase();
      const gov = ownership === "government" || ownership === "public" ||
        /government|govt\.?|public health|state health|district health|national health/i.test(String(tags.operator || ""));
      return {
        id: el.type + "/" + el.id,
        name: tags["name:en"] || tags.name,
        amenity: amenity,
        lat: lat,
        lon: lon,
        phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "",
        website: tags.website || tags["contact:website"] || "",
        hours: tags.opening_hours || "",
        emergency: tags.emergency === "yes",
        gov: gov,
        address: (tags["addr:full"] ||
          [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ")),
        distance: haversine(state.lat, state.lon, lat, lon),
        source: "overpass"
      };
    }).filter(Boolean);
  }

  function dedupe(list) {
    const seen = {};
    return list.filter(function (f) {
      const key = f.name.toLowerCase() + "|" + f.lat.toFixed(3) + "|" + f.lon.toFixed(3);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function buildQuery() {
    const around = "(around:" + state.radius * 1000 + "," + state.lat.toFixed(5) + "," + state.lon.toFixed(5) + ")";
    const selectors = ['["amenity"~"^(hospital|clinic|doctors|pharmacy)$"]', '["healthcare"="laboratory"]'];
    let body = "";
    selectors.forEach(function (sel) {
      body += "node" + sel + around + ";way" + sel + around + ";relation" + sel + around + ";";
    });
    return "[out:json][timeout:20];(" + body + ");out center 120;";
  }

  function runSearch() {
    if (state.lat === null || state.lon === null || state.busy) return;
    state.busy = true;
    state.failed = false;
    setStatus("Searching within " + state.radius + " km…");

    /* Photon also reports how many categories it answered, so an empty answer
       can be told apart from an offline device. */
    const backup = function () {
      return photonSearch(state.lat, state.lon, state.radius).then(function (res) {
        return {
          rows: res.rows,
          source: res.rows.length ? "photon" : (res.ok ? "empty" : "none")
        };
      }, function () { return { rows: [], source: "none" }; });
    };

    overpass(buildQuery()).then(function (data) {
      const rows = dedupe(parseOverpass(data));
      return rows.length ? { rows: rows, source: "overpass" } : backup();
    }, backup).then(function (pack) {
      state.busy = false;
      state.failed = pack.source === "none";
      state.source = pack.source;
      allResults = pack.rows;
      renderResults();
      if (state.failed) {
        setStatus("The free map services could not be reached. Check your internet, or use the map and “Open in Maps”.", true);
      } else {
        setStatus("Found " + allResults.length + " facilities within " + state.radius + " km of " + state.label + "." +
          (pack.source === "photon" ? " The main map database was busy, so these come from the backup service." : ""));
      }
      const btn = $("showMap");
      if (btn) btn.disabled = false;
      if (mapOpen()) showMap(state.lat, state.lon, state.label);
    });
  }

  /* ---------- results ---------- */
  function facilityCard(f) {
    const meta = TYPE_META[f.amenity] || TYPE_META.clinic;
    const phone = String(f.phone).split(";")[0].trim();
    const dir = state.lat !== null
      ? "https://www.openstreetmap.org/directions?from=" + state.lat.toFixed(5) + "," + state.lon.toFixed(5) +
        "&to=" + f.lat.toFixed(5) + "," + f.lon.toFixed(5)
      : "https://www.openstreetmap.org/?mlat=" + f.lat.toFixed(5) + "&mlon=" + f.lon.toFixed(5) + "#map=17/" + f.lat.toFixed(5) + "/" + f.lon.toFixed(5);

    return '<article class="facility">' +
      '<div class="icon-badge ' + meta.tone + ' sm">' + icon(meta.icon) + "</div>" +
      '<div style="flex:1;min-width:0">' +
        '<h4>' + esc(f.name) + (f.emergency ? ' <span class="badge danger">Emergency</span>' : "") +
          (f.gov ? ' <span class="badge teal" title="Ownership tag in OpenStreetMap — not verified">Government-tagged</span>' : "") + "</h4>" +
        '<p>' + meta.label + (f.address ? " · " + esc(f.address) : "") + "</p>" +
        (f.hours ? '<p class="tiny muted" style="margin-top:.2rem">Hours: ' + esc(f.hours) + "</p>" : "") +
        '<div class="f-actions">' +
          (phone ? '<a href="tel:' + esc(phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(phone) + "</a>" : "") +
          '<a href="' + dir + '" target="_blank" rel="noopener">' + icon("pin") + "Directions</a>" +
          '<button type="button" class="f-map" data-map="' + f.lat.toFixed(5) + "," + f.lon.toFixed(5) +
            '" data-name="' + esc(f.name) + '">' + icon("pin") + "Map</button>" +
          '<a href="https://www.google.com/maps/dir/?api=1&destination=' + f.lat.toFixed(5) + "," + f.lon.toFixed(5) +
            '" target="_blank" rel="noopener">' + icon("external") + "Google Maps</a>" +
          (f.website ? '<a href="' + esc(f.website) + '" target="_blank" rel="noopener">Website</a>' : "") +
        "</div>" +
      "</div>" +
      '<span class="distance-pill">' + fmtDistance(f.distance) + "</span>" +
      "</article>";
  }

  function renderResults() {
    const list = $("facilityList");
    const count = $("resultCount");
    if (!list) return;

    const rows = allResults.filter(function (f) {
      if (state.type !== "all" && f.amenity !== state.type) return false;
      if (state.govOnly && !f.gov) return false;
      return true;
    }).sort(function (a, b) { return a.distance - b.distance; }).slice(0, 40);

    if (!state.label) {
      if (count) count.textContent = "";
      list.innerHTML = JV.ui.emptyState("search", "No search yet",
        "Use your location, or type the name of your village, town or district to see hospitals, clinics and pharmacies nearby.");
      return;
    }

    if (count) {
      count.textContent = rows.length
        ? rows.length + (rows.length === 1 ? " place" : " places") + " listed, nearest first" +
          (state.govOnly ? " · government-tagged only" : "") +
          (state.source === "photon" ? " · backup map service" : "")
        : "";
    }

    if (state.failed) {
      list.innerHTML = JV.ui.emptyState("alert", "Map service unavailable",
        "Neither free map service answered. Check your internet, open the map view, call 104, or use Google Maps.") +
        '<div class="row" style="justify-content:center;gap:.5rem">' +
          (state.lat !== null ? '<button class="btn btn-secondary btn-sm" type="button" data-map-here="1">Show map</button>' : "") +
          '<a class="btn btn-secondary btn-sm" href="tel:104">Call 104</a>' +
          '<a class="btn btn-secondary btn-sm" href="' + mapsHref() + '" target="_blank" rel="noopener">Open Google Maps</a>' +
        "</div>";
      return;
    }

    if (!rows.length) {
      list.innerHTML = JV.ui.emptyState("pin", state.govOnly ? "No government-tagged place nearby" :
        allResults.length ? "Nothing of this type nearby" : "No facilities mapped here",
        state.govOnly
          ? "OpenStreetMap rarely records who runs a facility. Turn off the ownership filter, call 104, or ask your ASHA worker for the nearest public hospital or PHC."
          : allResults.length
            ? "Try “Everything”, or increase the distance you can travel."
            : "Village sub-centres and small clinics are often missing from the map. Call 104 or ask your ASHA worker — or open Google Maps.") +
        '<div class="row" style="justify-content:center;gap:.5rem">' +
          '<button class="btn btn-secondary btn-sm" type="button" data-map-here="1">Show map</button>' +
          '<a class="btn btn-secondary btn-sm" href="tel:104">Call 104</a>' +
          '<a class="btn btn-secondary btn-sm" id="mapsEmpty" href="' + mapsHref() + '" target="_blank" rel="noopener">Open Google Maps</a>' +
        "</div>";
      return;
    }
    list.innerHTML = rows.map(facilityCard).join("") +
      (rows.length < 3
        ? '<p class="tiny muted" style="margin-top:.4rem">Only a few places are mapped in this area. ' +
          "Increase the distance you can travel, or open Google Maps to compare." + "</p>"
        : "");
  }

  /* ---------- map ---------- */
  function mapOpen() {
    const panel = $("mapPanel");
    return !!panel && !panel.hidden;
  }

  /* The map is the official OpenStreetMap embed: free, no key, and only loaded
     after the user asks for it. */
  function mapSrc(lat, lon, radiusKm) {
    const dLat = radiusKm / 111;
    const dLon = radiusKm / (111 * Math.max(Math.cos(lat * Math.PI / 180), 0.2));
    return "https://www.openstreetmap.org/export/embed.html?bbox=" +
      (lon - dLon).toFixed(4) + "%2C" + (lat - dLat).toFixed(4) + "%2C" +
      (lon + dLon).toFixed(4) + "%2C" + (lat + dLat).toFixed(4) +
      "&layer=mapnik&marker=" + lat.toFixed(5) + "%2C" + lon.toFixed(5);
  }

  function showMap(lat, lon, label) {
    const panel = $("mapPanel");
    const frame = $("mapFrame");
    if (!panel || !frame) return;
    let iframe = frame.querySelector("iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer";
      iframe.setAttribute("allowfullscreen", "");
      frame.appendChild(iframe);
    }
    iframe.title = "OpenStreetMap of health facilities near " + (label || "this area");
    iframe.src = mapSrc(lat, lon, state.radius);
    const cap = $("mapCaption");
    if (cap) {
      cap.textContent = "Map centred on " + (label || "this area") +
        " · Map data © OpenStreetMap contributors. The list below is the text version of this map.";
    }
    panel.hidden = false;
  }

  function mapTo(lat, lon, label) {
    showMap(lat, lon, label || state.label);
    const panel = $("mapPanel");
    if (panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- location ---------- */
  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("This browser cannot find your location. Type a place instead.", true);
      return;
    }
    setStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(function (pos) {
      state.lat = pos.coords.latitude;
      state.lon = pos.coords.longitude;
      state.label = "your location";
      syncMapsLink();
      runSearch();
    }, function (err) {
      const msg = err && err.code === 1
        ? "Location permission was blocked. Allow location for this site, or type a place instead."
        : "Could not get your location. Type a village or town name instead.";
      setStatus(msg, true);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  function searchPlace() {
    const input = $("placeInput");
    const q = (input ? input.value : "").trim();
    if (q.length < 2) {
      setStatus("Type at least two letters of a village, town or district.", true);
      if (input) input.focus();
      return;
    }
    setStatus("Looking up “" + q + "”…");
    geocode(q).then(function (place) {
      if (!place) {
        setStatus("Could not find that place. Try a nearby town or district name.", true);
        return;
      }
      state.lat = place.lat;
      state.lon = place.lon;
      state.label = place.label;
      syncMapsLink();
      runSearch();
    }).catch(function () {
      setStatus("Could not look up that place. Check your internet, or use “Open in Maps”.", true);
    });
  }

  /* ---------- static parts ---------- */
  function renderHelplines() {
    const host = $("helplineGrid");
    if (!host) return;
    const wanted = ["108", "112", "104", "181", "14416", "1091"];
    host.innerHTML = C.HELPLINES.filter(function (h) {
      return wanted.indexOf(h.number) !== -1;
    }).map(JV.ui.helplineCard).join("");
  }

  /* ---------- init ---------- */
  function init() {
    try {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      if (TYPES.some(function (t) { return t.id === type; })) state.type = type;
      const gov = params.get("gov");
      state.govOnly = gov === "1" || gov === "true";
    } catch (e) { /* no URL API — keep defaults */ }
    renderHelplines();
    syncMapsLink();
    renderResults();

    makeChips("radiusChips", RADII.map(function (r) {
      return { id: String(r), label: r + " km" };
    }), String(state.radius), "data-radius", function (v) {
      state.radius = Number(v);
      if (state.lat !== null) runSearch();
    });

    makeChips("typeChips", TYPES, state.type, "data-type", function (v) {
      state.type = v;
      renderResults();
    });

    makeChips("ownChips", [
      { id: "all", label: "All ownership" },
      { id: "gov", label: "Government-tagged" }
    ], state.govOnly ? "gov" : "all", "data-own", function (v) {
      state.govOnly = v === "gov";
      renderResults();
    });

    const loc = $("useLoc");
    if (loc) loc.addEventListener("click", useMyLocation);

    const go = $("searchPlace");
    if (go) go.addEventListener("click", searchPlace);

    const input = $("placeInput");
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); searchPlace(); }
      });
    }

    const mapBtn = $("showMap");
    if (mapBtn) {
      mapBtn.addEventListener("click", function () {
        if (state.lat === null) {
          setStatus("Find a place first — the map will then open on it.", true);
          if (input) input.focus();
          return;
        }
        mapTo(state.lat, state.lon, state.label);
      });
    }

    /* Results are re-rendered often, so map buttons are handled on the list. */
    const list = $("facilityList");
    if (list) {
      list.addEventListener("click", function (e) {
        const hit = e.target.closest ? e.target.closest("[data-map],[data-map-here]") : null;
        if (!hit) return;
        if (hit.hasAttribute("data-map-here")) {
          if (state.lat !== null) mapTo(state.lat, state.lon, state.label);
          return;
        }
        const parts = String(hit.getAttribute("data-map")).split(",");
        const fLat = Number(parts[0]);
        const fLon = Number(parts[1]);
        if (!isFinite(fLat) || !isFinite(fLon)) return;
        mapTo(fLat, fLon, hit.getAttribute("data-name"));
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
