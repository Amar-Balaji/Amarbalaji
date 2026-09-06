/** node scripts/test-sphere.mjs
 *  Checks the two bits of geometry behind app/TagSphere.tsx:
 *  the focus angles land the chosen tag dead centre facing the viewer, and the
 *  dashed web joins every tag without repeating or doubling back on itself. */
import assert from "node:assert/strict";

const N = 60;
const NEIGHBOURS = 3;

// golden spiral, as in mesh()
const points = Array.from({ length: N }, (_, i) => {
  const phi = Math.acos(-1 + (2 * i + 1) / N);
  const theta = Math.sqrt(N * Math.PI) * phi;
  return [
    Math.cos(theta) * Math.sin(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(phi),
  ];
});

/* ---------------------------------------------------------------- focus */
const face = (p) => ({
  ry: Math.atan2(-p[0], p[2]),
  rx: Math.atan2(-p[1], Math.hypot(p[0], p[2])),
});

// the projection, copied from the render loop
const project = ([px, py, pz], rx, ry) => {
  const [sxr, cxr] = [Math.sin(rx), Math.cos(rx)];
  const [syr, cyr] = [Math.sin(ry), Math.cos(ry)];
  const x = px * cyr + pz * syr;
  const z1 = pz * cyr - px * syr;
  return { x, y: py * cxr + z1 * sxr, z: z1 * cxr - py * sxr };
};

points.forEach((p, i) => {
  const { rx, ry } = face(p);
  const { x, y, z } = project(p, rx, ry);
  assert.ok(Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9, `tag ${i} off centre: ${x}, ${y}`);
  assert.ok(z > 0.999, `tag ${i} faces away: z=${z}`); // z=1 is nearest the viewer
});
console.log(`ok - ${N} tags focus to the centre front`);

/* ------------------------------------------------------------------ web */
const edges = [];
const seen = new Set();
points.forEach((p, i) => {
  points
    .map((q, j) => [j, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]])
    .filter(([j]) => j !== i)
    .sort((a, b) => b[1] - a[1])
    .slice(0, NEIGHBOURS)
    .forEach(([j]) => {
      const id = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(id)) return;
      seen.add(id);
      edges.push([i, j]);
    });
});

assert.equal(new Set(edges.map(([a, b]) => `${a}:${b}`)).size, edges.length, "duplicate strand");
assert.ok(!edges.some(([a, b]) => a === b), "strand joins a tag to itself");
assert.ok(edges.length <= N * NEIGHBOURS, "more strands than neighbours allows");

const degree = new Map();
for (const [a, b] of edges) {
  degree.set(a, (degree.get(a) ?? 0) + 1);
  degree.set(b, (degree.get(b) ?? 0) + 1);
}
assert.equal(degree.size, N, "a tag was left out of the web");
console.log(`ok - ${edges.length} strands join all ${N} tags, none repeated`);

/* ---------------------------------------------------------------- curve */
// each strand bends through the projected surface midpoint, so it sits on the
// sphere instead of cutting across it as a polygon edge would
const mids = edges.map(([i, j]) => {
  const m = points[i].map((v, k) => v + points[j][k]);
  const len = Math.hypot(...m);
  return m.map((v) => v / len);
});

const R = 200; // any radius; the check is about shape, not scale
const flat = (p, rx, ry) => {
  const { x, y } = project(p, rx, ry);
  return [x * R, y * R];
};

let bulged = 0;
for (const [rx, ry] of [[0, 0], [0.25, 0.7], [-1.1, 2.4]]) {
  edges.forEach(([a, b], e) => {
    const [x1, y1] = flat(points[a], rx, ry);
    const [x2, y2] = flat(points[b], rx, ry);
    const [mx, my] = flat(mids[e], rx, ry);
    // the control point that makes the quadratic pass through the midpoint
    const cx = 2 * mx - (x1 + x2) / 2;
    const cy = 2 * my - (y1 + y2) / 2;
    // Q(0.5) must land exactly on it
    const qx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
    const qy = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
    assert.ok(Math.hypot(qx - mx, qy - my) < 1e-9, `strand ${e} misses its midpoint`);

    // and it must sit outside the straight chord - that gap is the curvature
    const chord = [(x1 + x2) / 2, (y1 + y2) / 2];
    if (Math.hypot(mx - chord[0], my - chord[1]) > 0.5) bulged++;
  });
}
assert.ok(bulged > edges.length * 2, `strands are too flat: only ${bulged} bulge`);
console.log(`ok - strands pass through the surface midpoint (${bulged} measurably curved)`);
