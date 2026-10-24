/* ==========================================================================
   Nearby healthcare — OpenStreetMap facility search, no API key required
   ========================================================================== */
(function () {
  "use strict";

  const C = JV.content;
  const icon = JV.icon;
  const esc = JV.esc;

  const OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];
  const RADII = [2, 5, 10, 20];
  const TYPES = [
    { id: "all", label: "Everything" },
    { id: "hospital", label: "Hospital" },
    { id: "clinic", label: "Clinic" },
    { id: "doctors", label: "Doctor" },
    { id: "pharmacy", label: "Pharmacy" }
  ];
  const TYPE_META = {
    hospital: { label: "Hospital", icon: "hospital", tone: "teal" },
    clinic: { label: "Clinic", icon: "stethoscope", tone: "lav" },
    doctors: { label: "Doctor / clinic", icon: "stethoscope", tone: "lav" },
    pharmacy: { label: "Pharmacy", icon: "pill", tone: "amber" }
  };

  const state = { lat: null, lon: null, label: "", type: "all", radius: 5, busy: false, failed: false };
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
  function overpass(query) {
    let i = 0;
    function attempt() {
      if (i >= OVERPASS.length) return Promise.reject(new Error("network"));
      const ctrl = new AbortController();
      const timer = setTimeout(function () { ctrl.abort(); }, 15000);
      return fetch(OVERPASS[i++], {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal: ctrl.signal
      }).then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).catch(function () {
        clearTimeout(timer);
        return attempt();
      });
    }
    return attempt();
  }

  function geocode(place) {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=" +
      encodeURIComponent(place);
    return fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) {
        if (!rows || !rows.length) return null;
        return { lat: Number(rows[0].lat), lon: Number(rows[0].lon), label: rows[0].display_name.split(",").slice(0, 3).join(", ") };
      });
  }

  /* ---------- search ---------- */
  function runSearch() {
    if (state.lat === null || state.lon === null || state.busy) return;
    state.busy = true;
    setStatus("Searching within " + state.radius + " km…");

    const sel = '["amenity"~"^(hospital|clinic|doctors|pharmacy)$"]';
    const around = "(around:" + state.radius * 1000 + "," + state.lat.toFixed(5) + "," + state.lon.toFixed(5) + ")";
    const query = "[out:json][timeout:20];(" +
      "node" + sel + around + ";" +
      "way" + sel + around + ";" +
      "relation" + sel + around + ";" +
      ");out center 80;";

    overpass(query).then(function (data) {
      state.busy = false;
      state.failed = false;
      const seen = {};
      allResults = (data.elements || []).map(function (el) {
        const tags = el.tags || {};
        const lat = el.lat !== undefined ? el.lat : (el.center ? el.center.lat : null);
        const lon = el.lon !== undefined ? el.lon : (el.center ? el.center.lon : null);
        if (lat === null || lon === null) return null;
        if (!tags.name && !tags["name:en"]) return null;
        const amenity = tags.amenity || "clinic";
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
          address: (tags["addr:full"] ||
            [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ")),
          distance: haversine(state.lat, state.lon, lat, lon)
        };
      }).filter(function (f) {
        if (!f) return false;
        const key = f.name.toLowerCase() + "|" + f.lat.toFixed(3) + "|" + f.lon.toFixed(3);
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });

      renderResults();
      setStatus("Found " + allResults.length + " facilities within " + state.radius + " km of " + state.label + ".");
    }).catch(function () {
      state.busy = false;
      state.failed = true;
      allResults = [];
      renderResults();
      setStatus("Could not reach the map service. Check your internet, or use “Open in Maps”.", true);
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
        '<h4>' + esc(f.name) + (f.emergency ? ' <span class="badge danger">Emergency</span>' : "") + "</h4>" +
        '<p>' + meta.label + (f.address ? " · " + esc(f.address) : "") + "</p>" +
        (f.hours ? '<p class="tiny muted" style="margin-top:.2rem">Hours: ' + esc(f.hours) + "</p>" : "") +
        '<div class="f-actions">' +
          (phone ? '<a href="tel:' + esc(phone.replace(/[^\d+]/g, "")) + '">' + icon("phone") + esc(phone) + "</a>" : "") +
          '<a href="' + dir + '" target="_blank" rel="noopener">' + icon("pin") + "Directions</a>" +
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
      return state.type === "all" || f.amenity === state.type;
    }).sort(function (a, b) { return a.distance - b.distance; }).slice(0, 40);

    if (!state.label) {
      if (count) count.textContent = "";
      list.innerHTML = JV.ui.emptyState("search", "No search yet",
        "Use your location, or type the name of your village, town or district to see hospitals, clinics and pharmacies nearby.");
      return;
    }

    if (count) {
      count.textContent = rows.length
        ? rows.length + (rows.length === 1 ? " place" : " places") + " listed, nearest first"
        : "";
    }

    if (state.failed) {
      list.innerHTML = JV.ui.emptyState("alert", "Map service unavailable",
        "The free map service could not be reached. Check your internet, call 104, or open Google Maps directly.") +
        '<div class="row" style="justify-content:center;gap:.5rem">' +
          '<a class="btn btn-secondary btn-sm" href="tel:104">Call 104</a>' +
          '<a class="btn btn-secondary btn-sm" href="' + mapsHref() + '" target="_blank" rel="noopener">Open Google Maps</a>' +
        "</div>";
      return;
    }

    if (!rows.length) {
      list.innerHTML = JV.ui.emptyState("pin", allResults.length ? "Nothing of this type nearby" :
        "No facilities mapped here",
        allResults.length
          ? "Try “Everything”, or increase the distance you can travel."
          : "Village sub-centres and small clinics are often missing from the map. Call 104 or ask your ASHA worker — or open Google Maps.") +
        '<div class="row" style="justify-content:center;gap:.5rem">' +
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
