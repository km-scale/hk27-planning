const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const calc = require(path.join(__dirname, "..", "assets", "js", "size-calculator.js"));

const MiB = 2 ** 20;
const opts = { compressionPct: 50, spatialHierarchy: true, ladderHours: [] };

test("cellsAtZoom follows 12*4^z", () => {
  assert.equal(calc.cellsAtZoom(0), 12);
  assert.equal(calc.cellsAtZoom(8), 786432);
});

test("cellsWithHierarchy sums all coarser levels", () => {
  assert.equal(calc.cellsWithHierarchy(2, false), 192);
  assert.equal(calc.cellsWithHierarchy(2, true), 12 + 48 + 192);
  // ~4/3 factor for large zoom
  const ratio = calc.cellsWithHierarchy(10, true) / calc.cellsAtZoom(10);
  assert.ok(Math.abs(ratio - 4 / 3) < 1e-5);
});

test("L8 global field with hierarchy and 50% compression is ~2 MiB (page formula)", () => {
  const mib = calc.fieldBytes(8, opts) / MiB;
  assert.ok(Math.abs(mib - 2) < 1e-4, `got ${mib}`);
});

const MO = calc.HOURS_PER_MONTH;
const YR = calc.HOURS_PER_YEAR;
const ALL = calc.LADDER.map((s) => s.hours);

test("stepsAt per interval", () => {
  assert.equal(calc.stepsAt(1, calc.intervalHours(1, "d")), 365);
  assert.equal(calc.stepsAt(1, calc.intervalHours(3, "h")), 2922);
  assert.equal(calc.stepsAt(100, calc.intervalHours(1, "month")), 1200);
});

test("mean row aggregates to checked ladder steps coarser than its interval", () => {
  assert.deepEqual(calc.meanIntervalsOfMeanRow(MO, ALL), [MO, YR]);
  assert.deepEqual(calc.meanIntervalsOfMeanRow(24, [24, MO]), [24, MO]);
  const row = { kind: "mean", intervalValue: 1, intervalUnit: "d", years: 10 };
  assert.equal(calc.rowTimesteps(row, [MO, YR], null), 3652 + 120 + 10);
  assert.equal(calc.rowTimesteps(row, [], null), 3652);
});

test("inst row requires means at its own interval and all coarser checked steps", () => {
  assert.deepEqual(calc.missingMeanIntervals(3, ALL, null), [3, 6, 24, MO, YR]);
  assert.deepEqual(calc.missingMeanIntervals(2, [1, 3, 24], null), [2, 3, 24]);
});

test("inst row skips mean intervals the linked mean row provides", () => {
  // monthly mean row provides month + year -> inst 3h adds 3h, 6h, 1d
  assert.deepEqual(calc.missingMeanIntervals(3, ALL, MO), [3, 6, 24]);
  assert.deepEqual(calc.missingMeanIntervals(24, ALL, MO), [24]);
  assert.deepEqual(calc.missingMeanIntervals(MO, ALL, MO), []);
  const row = { kind: "inst", intervalValue: 1, intervalUnit: "d", years: 1 };
  assert.equal(calc.rowTimesteps(row, ALL, MO), 365 + 365);
  assert.equal(calc.rowTimesteps(row, ALL, null), 365 + 365 + 12 + 1);
});

test("rowBytes combines cells, values, steps, float32 and compression", () => {
  const row = { name: "x", zoom: 0, n2d: 1, n3d: 2, levels: 3, fraction: 0.5, intervalValue: 1, intervalUnit: "month", years: 1, kind: "mean" };
  // 12 cells * 0.5 * 7 values * 12 steps * 4 B * 0.5 (no coarser ladder steps)
  const o = { compressionPct: 50, spatialHierarchy: false, ladderHours: [] };
  assert.equal(calc.rowBytes(row, o, null), 12 * 0.5 * 7 * 12 * 4 * 0.5);
});

test("rowBytes rejects invalid input", () => {
  const bad = { ...calc.DEFAULT_ROWS[0], fraction: 1.5 };
  assert.deepEqual(calc.validateRow(calc.DEFAULT_ROWS[0]), []);
  assert.throws(() => calc.rowBytes(bad, opts), RangeError);
  assert.throws(() => calc.rowBytes(calc.DEFAULT_ROWS[0], { ...opts, compressionPct: 0 }), RangeError);
  assert.ok(calc.validateRow({ ...calc.DEFAULT_ROWS[0], zoom: 8.5 }).length > 0);
  assert.ok(calc.validateRow({ ...calc.DEFAULT_ROWS[0], kind: "x" }).length > 0);
});

test("formatBytes uses binary units", () => {
  assert.equal(calc.formatBytes(512), "512 B");
  assert.equal(calc.formatBytes(2 * MiB), "2.00 MiB");
  assert.equal(calc.formatBytes(1.5 * 2 ** 40), "1.50 TiB");
});
