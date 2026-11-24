/*
 * HEALPix dataset size calculator for the data-request page.
 * Pure functions are exported for Node tests (`node --test tests/`);
 * in the browser, the DOM wiring attaches to every `.size-calc` element.
 */
(function (root) {
  "use strict";

  const BYTES_PER_VALUE = 4; // Float32
  const HOURS_PER_DAY = 24;
  const DAYS_PER_YEAR = 365.25;
  const HOURS_PER_YEAR = DAYS_PER_YEAR * HOURS_PER_DAY;
  const HOURS_PER_MONTH = HOURS_PER_YEAR / 12;
  const UNIT_HOURS = { h: 1, d: HOURS_PER_DAY, month: HOURS_PER_MONTH };
  const MAX_ZOOM = 15;
  const EPS = 1e-9;

  /** Candidate steps for the temporal mean hierarchy (user picks which apply). */
  const LADDER = [
    { key: "1h", label: "1 h", hours: 1 },
    { key: "3h", label: "3 h", hours: 3 },
    { key: "6h", label: "6 h", hours: 6 },
    { key: "1d", label: "1 day", hours: HOURS_PER_DAY },
    { key: "1mo", label: "1 month", hours: HOURS_PER_MONTH },
    { key: "1y", label: "1 year", hours: HOURS_PER_YEAR },
  ];

  const approxEq = (a, b) => Math.abs(a - b) <= EPS * Math.max(1, a, b);

  /** Number of HEALPix cells at one zoom level: 12 * 4^z. */
  function cellsAtZoom(zoom) {
    return 12 * 4 ** zoom;
  }

  /** Cells for zoom z, optionally including all coarser levels 0..z. */
  function cellsWithHierarchy(zoom, includeCoarser) {
    if (!includeCoarser) return cellsAtZoom(zoom);
    let total = 0;
    for (let k = 0; k <= zoom; k++) total += cellsAtZoom(k);
    return total;
  }

  function intervalHours(value, unit) {
    return value * UNIT_HOURS[unit];
  }

  /** Time steps over `years` at a given interval (hours). */
  function stepsAt(years, hours) {
    return Math.floor((years * HOURS_PER_YEAR) / hours + EPS);
  }

  /** Ladder steps strictly coarser than `hours` (or coarser-or-equal with `inclusive`). */
  function coarserSteps(hours, ladderHours, inclusive) {
    return ladderHours.filter((l) => (inclusive ? l > hours || approxEq(l, hours) : l > hours && !approxEq(l, hours)));
  }

  /** Mean intervals a mean stream at `hours` provides: itself + coarser ladder steps. */
  function meanIntervalsOfMeanRow(hours, ladderHours) {
    return [hours, ...coarserSteps(hours, ladderHours, false)];
  }

  /**
   * Mean intervals an instantaneous stream at `hours` requires: the same
   * interval plus every ladder step at or above it. Intervals already provided
   * by the linked mean row (`coverHours`, or null) are dropped.
   */
  function missingMeanIntervals(hours, ladderHours, coverHours) {
    const required = [hours, ...coarserSteps(hours, ladderHours, false)];
    if (coverHours == null) return required;
    const provided = meanIntervalsOfMeanRow(coverHours, ladderHours);
    return required.filter((m) => !provided.some((p) => approxEq(p, m)));
  }

  /**
   * Total stored time steps of a row.
   * mean: native steps + aggregates at coarser ladder steps.
   * inst: native steps + means at all missing mean intervals (see above).
   */
  function rowTimesteps(r, ladderHours, coverHours) {
    const h = intervalHours(r.intervalValue, r.intervalUnit);
    const extra =
      r.kind === "mean" ? coarserSteps(h, ladderHours, false) : missingMeanIntervals(h, ladderHours, coverHours);
    return stepsAt(r.years, h) + extra.reduce((sum, m) => sum + stepsAt(r.years, m), 0);
  }

  /** Returns a list of error strings for a row; empty if valid. */
  function validateRow(r) {
    const errors = [];
    const nonNegInt = (v) => Number.isInteger(v) && v >= 0;
    if (!Number.isInteger(r.zoom) || r.zoom < 0 || r.zoom > MAX_ZOOM)
      errors.push(`zoom must be an integer 0–${MAX_ZOOM}`);
    if (!nonNegInt(r.n2d)) errors.push("#2D must be a non-negative integer");
    if (!nonNegInt(r.n3d)) errors.push("#3D must be a non-negative integer");
    if (!nonNegInt(r.levels)) errors.push("#levels must be a non-negative integer");
    if (!(Number.isFinite(r.fraction) && r.fraction > 0 && r.fraction <= 1))
      errors.push("domain fraction must be in (0, 1]");
    if (!(Number.isFinite(r.intervalValue) && r.intervalValue > 0)) errors.push("interval must be > 0");
    if (!(r.intervalUnit in UNIT_HOURS)) errors.push("unknown interval unit");
    if (!(Number.isFinite(r.years) && r.years >= 0)) errors.push("years must be ≥ 0");
    if (r.kind !== "inst" && r.kind !== "mean") errors.push("type must be inst or mean");
    return errors;
  }

  function validateCompression(pct) {
    return Number.isFinite(pct) && pct > 0 && pct <= 100;
  }

  /**
   * Bytes for one stream (row). `opts`: { compressionPct, spatialHierarchy,
   * ladderHours }. `coverHours`: interval of the linked mean row or null.
   * Throws on invalid input.
   */
  function rowBytes(r, opts, coverHours) {
    const errors = validateRow(r);
    if (errors.length) throw new RangeError(errors.join("; "));
    if (!validateCompression(opts.compressionPct)) throw new RangeError("compression must be in (0, 100]");
    const cells = cellsWithHierarchy(r.zoom, opts.spatialHierarchy) * r.fraction;
    const values = r.n2d + r.n3d * r.levels;
    const steps = rowTimesteps(r, opts.ladderHours, coverHours ?? null);
    return cells * values * steps * BYTES_PER_VALUE * (opts.compressionPct / 100);
  }

  /** Bytes of a single global 2D field at one time step. */
  function fieldBytes(zoom, opts) {
    return cellsWithHierarchy(zoom, opts.spatialHierarchy) * BYTES_PER_VALUE * (opts.compressionPct / 100);
  }

  /** Human-readable binary size, e.g. "1.64 TiB". */
  function formatBytes(bytes) {
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
  }

  /** Formats an interval in hours as a short label, e.g. "3 h", "1 d", "1 mo". */
  function formatInterval(hours) {
    for (const s of LADDER) if (approxEq(s.hours, hours)) return s.label;
    if (hours >= HOURS_PER_MONTH) return `${+(hours / HOURS_PER_MONTH).toFixed(2)} months`;
    if (hours >= HOURS_PER_DAY) return `${+(hours / HOURS_PER_DAY).toFixed(2)} days`;
    return `${+hours.toFixed(2)} h`;
  }

  const DEFAULT_ROWS = [
    { id: "atm-mean", name: "Atm mean", zoom: 8, n2d: 34, n3d: 13, levels: 25, fraction: 1.0, intervalValue: 3, intervalUnit: "h", years: 1, kind: "mean", cover: "" },
    { id: "atm-inst", name: "Atm inst", zoom: 8, n2d: 9, n3d: 0, levels: 0, fraction: 1.0, intervalValue: 1, intervalUnit: "h", years: 1, kind: "inst", cover: "atm-mean" },
    { id: "ocean-mean", name: "Ocean mean", zoom: 8, n2d: 16, n3d: 8, levels: 33, fraction: 0.7, intervalValue: 1, intervalUnit: "d", years: 1, kind: "mean", cover: "" },
    { id: "ocean-inst", name: "Ocean inst", zoom: 8, n2d: 7, n3d: 0, levels: 0, fraction: 0.7, intervalValue: 24, intervalUnit: "h", years: 1, kind: "inst", cover: "ocean-mean" },
    { id: "land-mean", name: "Land mean", zoom: 8, n2d: 10, n3d: 3, levels: 6, fraction: 0.3, intervalValue: 1, intervalUnit: "month", years: 1, kind: "mean", cover: "" },
    { id: "land-inst", name: "Land inst", zoom: 8, n2d: 1, n3d: 0, levels: 0, fraction: 0.3, intervalValue: 3, intervalUnit: "h", years: 1, kind: "inst", cover: "land-mean" },
  ];

  const api = {
    BYTES_PER_VALUE,
    HOURS_PER_MONTH,
    HOURS_PER_YEAR,
    LADDER,
    DEFAULT_ROWS,
    cellsAtZoom,
    cellsWithHierarchy,
    intervalHours,
    stepsAt,
    meanIntervalsOfMeanRow,
    missingMeanIntervals,
    rowTimesteps,
    validateRow,
    validateCompression,
    rowBytes,
    fieldBytes,
    formatBytes,
    formatInterval,
  };

  /* ---------------- DOM wiring (browser only) ---------------- */

  const COLUMNS = [
    { key: "name", label: "Stream", type: "text" },
    { key: "kind", label: "Type", type: "select", options: [["mean", "mean"], ["inst", "inst"]] },
    { key: "zoom", label: "Zoom", type: "number", attrs: { min: 0, max: MAX_ZOOM, step: 1 } },
    { key: "n2d", label: "#2D vars", type: "number", attrs: { min: 0, step: 1 } },
    { key: "n3d", label: "#3D vars", type: "number", attrs: { min: 0, step: 1 } },
    { key: "levels", label: "#levels", type: "number", attrs: { min: 0, step: 1 } },
    { key: "fraction", label: "Domain", type: "number", attrs: { min: 0, max: 1, step: 0.05 } },
    { key: "intervalValue", label: "Interval", type: "number", attrs: { min: 0, step: "any" } },
    { key: "intervalUnit", label: "Interval unit", sameCell: true, type: "select", options: [["h", "h"], ["d", "d"], ["month", "mo"]] },
    { key: "years", label: "Years", type: "number", attrs: { min: 0, step: "any" } },
    { key: "cover", label: "Means in", type: "select", options: [] },
  ];

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
    for (const c of children || []) node.append(c);
    return node;
  }

  function buildInput(col, value) {
    let input;
    if (col.type === "select") {
      input = el("select");
      for (const [v, label] of col.options) input.append(el("option", { value: v }, [label]));
      input.value = value;
      if (col.key === "cover") input.dataset.initial = value; // options are filled in later
    } else if (col.type === "checkbox") {
      input = el("input", { type: "checkbox" });
      input.checked = Boolean(value);
    } else {
      input = el("input", Object.assign({ type: col.type }, col.attrs || {}));
      input.value = value;
    }
    input.dataset.key = col.key;
    input.setAttribute("aria-label", col.label);
    return input;
  }

  function readRow(tr) {
    const r = { id: tr.dataset.id };
    for (const input of tr.querySelectorAll("[data-key]")) {
      const key = input.dataset.key;
      if (input.type === "checkbox") r[key] = input.checked;
      else if (input.type === "number") r[key] = input.value === "" ? NaN : Number(input.value);
      else r[key] = input.value;
    }
    return r;
  }

  function init(container) {
    if (container.dataset.ready) return;
    container.dataset.ready = "1";
    const tbody = container.querySelector("tbody");
    const compression = container.querySelector("[data-global=compression]");
    const spatial = container.querySelector("[data-global=spatial]");
    const ladderBox = container.querySelector("[data-global=ladder]");
    const totalCells = container.querySelectorAll("[data-out=total]");
    const fieldOut = container.querySelector("[data-out=field]");
    const fieldZoom = container.querySelector("[data-global=fieldzoom]");
    const globalErr = container.querySelector("[data-out=error]");
    let nextId = 1;

    for (const step of LADDER) {
      const cb = el("input", { type: "checkbox", value: String(step.hours) });
      cb.checked = true;
      ladderBox.append(el("label", {}, [cb, " " + step.label]));
    }

    // Size sits right after the stream name so it stays visible on narrow screens.
    const [nameCol, ...restCols] = COLUMNS;
    const headRow = container.querySelector("thead tr");
    headRow.append(el("th", {}, [""]), el("th", {}, [nameCol.label]), el("th", {}, ["Size"]));
    for (const col of restCols) if (!col.sameCell) headRow.append(el("th", {}, [col.label]));

    function addRow(r) {
      const tr = el("tr", { "data-id": r.id || `row-${nextId++}` });
      const del = el("button", { type: "button", title: "Remove stream", "aria-label": "Remove stream" }, ["✕"]);
      del.addEventListener("click", () => {
        tr.remove();
        update();
      });
      tr.append(el("td", {}, [del]));
      tr.append(el("td", {}, [buildInput(nameCol, r[nameCol.key])]));
      tr.append(el("td", { "data-out": "row", class: "size-calc__size" }));
      for (const col of restCols) {
        const input = buildInput(col, r[col.key]);
        if (col.sameCell) tr.lastElementChild.append(" ", input);
        else tr.append(el("td", {}, [input]));
      }
      tbody.append(tr);
    }

    /** Refills every "Means also in" select with the current mean rows. */
    function syncCoverOptions(rows) {
      const means = rows.filter((r) => r.kind === "mean");
      for (const tr of tbody.rows) {
        const select = tr.querySelector("[data-key=cover]");
        const isInst = tr.querySelector("[data-key=kind]").value === "inst";
        const wanted = select.dataset.initial ?? select.value;
        delete select.dataset.initial;
        select.replaceChildren(el("option", { value: "" }, ["—"]));
        for (const m of means) select.append(el("option", { value: m.id }, [m.name || m.id]));
        select.value = means.some((m) => m.id === wanted) ? wanted : "";
        select.disabled = !isInst;
      }
    }

    function update() {
      const pct = compression.value === "" ? NaN : Number(compression.value);
      const okPct = validateCompression(pct);
      compression.classList.toggle("size-calc--invalid", !okPct);
      globalErr.textContent = okPct ? "" : "Compression must be in (0, 100] %.";
      const ladderHours = [...ladderBox.querySelectorAll("input:checked")].map((cb) => Number(cb.value));
      const opts = { compressionPct: pct, spatialHierarchy: spatial.checked, ladderHours };

      const z = fieldZoom.value === "" ? NaN : Number(fieldZoom.value);
      fieldOut.textContent =
        okPct && Number.isInteger(z) && z >= 0 && z <= MAX_ZOOM ? formatBytes(fieldBytes(z, opts)) : "—";

      const trs = [...tbody.rows];
      syncCoverOptions(trs.map(readRow));
      const rows = trs.map(readRow);
      const byId = new Map(rows.map((r) => [r.id, r]));

      let total = 0;
      let invalid = 0;
      trs.forEach((tr, i) => {
        const r = rows[i];
        const out = tr.querySelector("[data-out=row]");
        const errors = validateRow(r);
        let coverHours = null;
        if (r.kind === "inst" && r.cover) {
          const m = byId.get(r.cover);
          if (!m || validateRow(m).length) errors.push("linked mean row is invalid");
          else coverHours = intervalHours(m.intervalValue, m.intervalUnit);
        }
        tr.classList.toggle("size-calc--invalid", errors.length > 0);
        if (errors.length || !okPct) {
          tr.title = errors.join("; ");
          out.textContent = "—";
          invalid++;
          return;
        }
        const h = intervalHours(r.intervalValue, r.intervalUnit);
        const means =
          r.kind === "mean" ? meanIntervalsOfMeanRow(h, ladderHours) : missingMeanIntervals(h, ladderHours, coverHours);
        tr.title = (r.kind === "inst" ? `inst ${formatInterval(h)}; ` : "") + `means: ${means.map(formatInterval).join(", ") || "none"}`;
        const bytes = rowBytes(r, opts, coverHours);
        total += bytes;
        out.textContent = formatBytes(bytes);
      });
      for (const c of totalCells) c.textContent = okPct ? formatBytes(total) : "—";
      if (okPct && invalid) globalErr.textContent = `${invalid} invalid row(s) excluded from total (hover for details).`;
    }

    /*
     * Zoom lock: while pressed, every stream shares one max zoom level. The
     * global field and any row's zoom then drive each other and all rows;
     * locking applies the global field's zoom to all rows.
     */
    const lockBtn = container.querySelector("[data-action=lockzoom]");
    const LOCKED_BY_DEFAULT = true;
    let zoomLocked = LOCKED_BY_DEFAULT;
    const zoomInputs = () => [...tbody.querySelectorAll("[data-key=zoom]")];
    function setAllZooms(z) {
      for (const input of zoomInputs()) input.value = z;
    }
    function renderLock() {
      lockBtn.setAttribute("aria-pressed", String(zoomLocked));
      lockBtn.textContent = zoomLocked ? "🔒 Zoom locked (same for all streams)" : "🔓 Lock zoom for all streams";
    }
    lockBtn.addEventListener("click", () => {
      zoomLocked = !zoomLocked;
      if (zoomLocked) setAllZooms(fieldZoom.value);
      renderLock();
      update();
    });
    renderLock();

    container.querySelector("[data-action=add]").addEventListener("click", () => {
      const zoom = fieldZoom.value === "" ? 8 : Number(fieldZoom.value);
      addRow({ name: "New stream", zoom, n2d: 1, n3d: 0, levels: 0, fraction: 1, intervalValue: 1, intervalUnit: "d", years: 1, kind: "mean", cover: "" });
      update();
    });
    container.querySelector("[data-action=reset]").addEventListener("click", () => {
      tbody.replaceChildren();
      DEFAULT_ROWS.forEach(addRow);
      fieldZoom.value = DEFAULT_ROWS[0].zoom;
      zoomLocked = LOCKED_BY_DEFAULT;
      if (zoomLocked) setAllZooms(fieldZoom.value);
      renderLock();
      for (const cb of ladderBox.querySelectorAll("input")) cb.checked = true;
      update();
    });
    container.addEventListener("input", (e) => {
      if (e.target === fieldZoom && zoomLocked) setAllZooms(fieldZoom.value);
      else if (zoomLocked && e.target.dataset && e.target.dataset.key === "zoom") {
        fieldZoom.value = e.target.value;
        setAllZooms(e.target.value);
      }
      update();
    });
    container.addEventListener("change", update);

    DEFAULT_ROWS.forEach(addRow);
    if (zoomLocked) setAllZooms(fieldZoom.value);
    update();
  }

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SizeCalc = api;

  if (typeof document !== "undefined") {
    const start = () => document.querySelectorAll(".size-calc").forEach(init);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
