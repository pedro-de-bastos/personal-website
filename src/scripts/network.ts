// Decorative geometry and timing; none of these constants represent research data.
const canvas = document.querySelector<HTMLCanvasElement>('.network-background');
if (canvas) initNetwork(canvas);
function initNetwork(canvas: HTMLCanvasElement) {
 const context = canvas.getContext('2d');
 if (!context) return;
 const ctx = context;
 const hero = canvas.parentElement!;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 type Node = { x: number; y: number; ox: number; oy: number; group: number; r: number };
 type Group = { id: number; x: number; y: number; vx: number; vy: number };
 type Edge = { a: number; b: number; born: number; life: number; persistent: boolean };
 type Encounter = { a: number; b: number; until: number; outcome: number };
 let seed = 8517;
 const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
 let nodes: Node[] = [], edges: Edge[] = [], groups: Group[] = [];
 let encounter: Encounter | undefined;
 let textAreas: { x: number; y: number; width: number; height: number }[] = [];
 let width = 1, height = 1, dpr = 1, simTime = 0, nextEncounter = 2.8, nextSplit = 42, groupId = 0;
 let raf = 0, previous = 0, rendered = 0, visible = false, disposed = false;
 const members = (id: number) => nodes.flatMap((node, i) => node.group === id ? [i] : []);
 const degree = (i: number) => edges.filter(e => e.a === i || e.b === i).length;
 const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
 function makeGroup(x: number, y: number) {
  const angle = random() * Math.PI * 2, speed = 2.5 + random() * 1.5;
  const group = { id: groupId++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  groups.push(group);
  return group;
 }
 function arrange(group: Group, indices: number[]) {
  // Irregular rest positions, so groups look like people standing together rather than polygons.
  const base = indices.length === 1 ? 0 : (width < 640 ? 22 : 30) + indices.length * 2;
  const phase = random() * Math.PI * 2;
  indices.forEach((index, slot) => {
   const node = nodes[index]!;
   const angle = phase + slot / indices.length * Math.PI * 2 + (random() - .5) * .85;
   const radius = base * (.55 + random() * .8);
   node.group = group.id;
   node.ox = Math.cos(angle) * radius; node.oy = Math.sin(angle) * radius * (.7 + random() * .4);
  });
 }
 function formEdge(a: number, b: number, persistent = false, seeded = false) {
  if (a === b || edges.length >= Math.floor(nodes.length * 1.2) || degree(a) >= 3 || degree(b) >= 3) return false;
  if (edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a))) return false;
  // Seeded ties are already settled; at most one new tie carries a traveling spark.
  if (!seeded && edges.some(e => simTime - e.born < .8)) return false;
  edges.push({ a, b, born: seeded ? simTime - 1 : simTime, life: 8 + random() * 4, persistent });
  return true;
 }
 function seedCluster(indices: number[]) {
  if (indices.length < 2) return;
  if (indices.length === 2) { formEdge(indices[0]!, indices[1]!, true, true); return; }
  const style = random();
  if (style < .34) {
   // Open chain, sometimes with one skip so it doesn't read as a polyline glyph.
   for (let i = 1; i < indices.length; i++) formEdge(indices[i - 1]!, indices[i]!, true, true);
   if (indices.length >= 4 && random() < .45) {
    const skip = Math.floor(random() * (indices.length - 2));
    formEdge(indices[skip]!, indices[skip + 2]!, true, true);
   }
  } else if (style < .67) {
   // Hub-and-spoke, capped at degree 3; leftover members hang off a spoke.
   const hub = indices[Math.floor(random() * indices.length)]!;
   const others = indices.filter(i => i !== hub);
   others.slice(0, 3).forEach(i => formEdge(hub, i, true, true));
   for (let i = 3; i < others.length; i++) formEdge(others[i - 1]!, others[i]!, true, true);
   if (others.length >= 3 && random() < .4) formEdge(others[0]!, others[1]!, true, true);
  } else {
   // Mixed: a path, maybe a close, maybe a chord — not always a ring.
   for (let i = 1; i < indices.length; i++) formEdge(indices[i - 1]!, indices[i]!, true, true);
   if (random() < .45) formEdge(indices[0]!, indices[indices.length - 1]!, true, true);
   if (indices.length >= 4 && random() < .55) {
    formEdge(indices[0]!, indices[Math.floor(indices.length / 2)]!, true, true);
   }
  }
 }
 function initialize(count: number) {
  nodes = []; groups = []; edges = []; encounter = undefined;
  const loners = count <= 20 ? 5 : count <= 36 ? 9 : 14;
  const clusterCount = Math.ceil((count - loners) / 3.8), total = clusterCount + loners;
  const columns = Math.ceil(Math.sqrt(total * width / height)), rows = Math.ceil(total / columns);
  let remaining = count - loners;
  for (let i = 0; i < total; i++) {
   const size = i < clusterCount ? Math.ceil(remaining / (clusterCount - i)) : 1;
   if (i < clusterCount) remaining -= size;
   const row = Math.floor(i / columns);
   const group = makeGroup((i % columns + .5 + (row % 2 ? .18 : 0) + (random() - .5) * .34) * width / columns,
    (row + .5 + (random() - .5) * .34) * height / rows);
   const indices: number[] = [];
   for (let j = 0; j < size; j++) {
    indices.push(nodes.length);
    nodes.push({ x: group.x, y: group.y, ox: 0, oy: 0, group: group.id, r: (2 + random()) * 1.7 });
   }
   arrange(group, indices);
   for (const index of indices) {
    const n = nodes[index]!;
    n.x = clamp(group.x + n.ox, 5, width - 5); n.y = clamp(group.y + n.oy, 5, height - 5);
   }
   seedCluster(indices);
  }
 }
 function connected(indices: number[]) {
  if (!indices.length) return false;
  const reached = new Set([indices[0]!]);
  for (let i = 0; i < indices.length; i++) for (const edge of edges) {
   if (!edge.persistent || !indices.includes(edge.a) || !indices.includes(edge.b)) continue;
   if (reached.has(edge.a)) reached.add(edge.b);
   if (reached.has(edge.b)) reached.add(edge.a);
  }
  return reached.size === indices.length;
 }
 function resize() {
  if (disposed) return;
  const bounds = hero.getBoundingClientRect();
  const oldWidth = width, oldHeight = height;
  width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
  // Keep decorative marks clear of text so increased opacity preserves contrast.
  textAreas = Array.from(hero.querySelectorAll<HTMLElement>('.hero-content > *')).map(element => {
   const rect = element.getBoundingClientRect();
   return { x: rect.left - bounds.left - 4, y: rect.top - bounds.top - 4, width: rect.width + 8, height: rect.height + 8 };
  });
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = width < 640 ? 18 : width < 1024 ? 32 : 54;
  for (const n of nodes) { n.x *= width / oldWidth; n.y *= height / oldHeight; }
  for (const g of groups) { g.x *= width / oldWidth; g.y *= height / oldHeight; }
  if (!nodes.length) initialize(count);
  else if (count !== nodes.length) {
   // Preserve surviving positions; rebuild sparse ties for the new node budget.
   nodes = nodes.slice(0, count);
   edges = [];
   groups = groups.filter(g => members(g.id).length);
   encounter = undefined;
   const added = new Set<number>(), newGroups = new Set<number>();
   while (nodes.length < count) {
    let group = groups.find(g => {
     const size = members(g.id).length;
     return size < 5 && (size > 1 || newGroups.has(g.id));
    });
    if (!group) {
     group = makeGroup(width * (.12 + random() * .76), height * (.15 + random() * .7));
     newGroups.add(group.id);
    }
    const index = nodes.length;
    added.add(index);
    nodes.push({ x: group.x, y: group.y, ox: 0, oy: 0, group: group.id, r: (2 + random()) * 1.7 });
   }
   for (const g of groups) {
    const indices = members(g.id);
    arrange(g, indices);
    // Re-home every surviving/new index in a connected graph without resize sparks.
    seedCluster(indices);
    for (const index of indices) if (added.has(index)) {
     const n = nodes[index]!;
     n.x = g.x + n.ox; n.y = g.y + n.oy;
    }
   }
  }
  for (const n of nodes) { n.x = clamp(n.x, 5, width - 5); n.y = clamp(n.y, 5, height - 5); }
  draw();
 }
 function closestPair(a: Group, b: Group): [number, number] | undefined {
  let pair: [number, number] | undefined, distance = Infinity;
  for (const ai of members(a.id)) for (const bi of members(b.id)) {
   if (degree(ai) >= 3 || degree(bi) >= 3) continue;
   const na = nodes[ai]!, nb = nodes[bi]!, d = Math.hypot(na.x - nb.x, na.y - nb.y);
   if (d < distance) { pair = [ai, bi]; distance = d; }
  }
  return pair;
 }
 function startEncounter() {
  // Choose among nearby groups once per timer, never search for new encounters every frame.
  const candidates: { a: Group; b: Group; distance: number }[] = [];
  for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
   const ga = groups[a]!, gb = groups[b]!;
   if (closestPair(ga, gb)) candidates.push({ a: ga, b: gb, distance: Math.hypot(ga.x - gb.x, ga.y - gb.y) });
  }
  candidates.sort((a, b) => a.distance - b.distance);
  const choice = candidates[Math.floor(random() * Math.min(3, candidates.length))];
  if (choice) encounter = { a: choice.a.id, b: choice.b.id, until: simTime + 28, outcome: random() };
  nextEncounter = simTime + 5 + random() * 5;
 }
 function part(a: Group, b: Group) {
  const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy) || 1;
  a.vx = -dx / distance * 3; a.vy = -dy / distance * 3;
  b.vx = dx / distance * 3; b.vy = dy / distance * 3;
  encounter = undefined; nextEncounter = simTime + 5 + random() * 5;
 }
 function updateEncounter(dt: number) {
  if (!encounter) return;
  const a = groups.find(g => g.id === encounter!.a), b = groups.find(g => g.id === encounter!.b);
  if (!a || !b) { encounter = undefined; return; }
  const pair = closestPair(a, b);
  if (!pair || simTime > encounter.until) { part(a, b); return; }
  const na = nodes[pair[0]]!, nb = nodes[pair[1]]!;
  if (Math.hypot(na.x - nb.x, na.y - nb.y) < 58) {
   const combined = [...members(a.id), ...members(b.id)];
   const lasting = encounter.outcome < .35 && combined.length <= 6;
   if (encounter.outcome < .78 && formEdge(pair[0], pair[1], lasting) && lasting) {
    // The joining edge stays connected while members slowly settle into their new group.
    a.x = combined.reduce((sum, i) => sum + nodes[i]!.x, 0) / combined.length;
    a.y = combined.reduce((sum, i) => sum + nodes[i]!.y, 0) / combined.length;
    arrange(a, combined);
    groups = groups.filter(g => g.id !== b.id);
   }
   part(a, b);
   return;
  }
  const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy) || 1;
  const ease = 1 - Math.exp(-dt * .6);
  a.vx += (dx / distance * 5.5 - a.vx) * ease; a.vy += (dy / distance * 5.5 - a.vy) * ease;
  b.vx += (-dx / distance * 5.5 - b.vx) * ease; b.vy += (-dy / distance * 5.5 - b.vy) * ease;
 }
 function split() {
  nextSplit = simTime + 38 + random() * 22;
  if (encounter) return;
  const candidates = groups.filter(g => members(g.id).length >= 5);
  const group = candidates[Math.floor(random() * candidates.length)];
  if (!group) return;
  const indices = members(group.id);
  let departing = indices.slice(-(random() < .4 ? 2 : 1));
  const remainsConnected = (leaving: number[]) => connected(leaving) && connected(indices.filter(i => !leaving.includes(i)));
  if (!remainsConnected(departing)) {
   const leaf = indices.find(i => remainsConnected([i]));
   if (leaf === undefined) return;
   departing = [leaf];
  }
  const x = departing.reduce((sum, i) => sum + nodes[i]!.x, 0) / departing.length;
  const y = departing.reduce((sum, i) => sum + nodes[i]!.y, 0) / departing.length;
  const other = makeGroup(x, y);
  arrange(other, departing); arrange(group, indices.filter(i => !departing.includes(i)));
  // Existing ties fade as the member(s) leave; any internal ties remain persistent.
  for (const edge of edges) if (departing.includes(edge.a) !== departing.includes(edge.b)) {
   edge.persistent = false; edge.born = simTime - 1; edge.life = 4;
  }
  part(group, other);
 }
 function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1.3;
  for (const edge of edges) {
   const a = nodes[edge.a]!, b = nodes[edge.b]!;
   const age = simTime - edge.born;
   const fade = Math.min(1, edge.persistent ? 1 : (edge.life - age) / 3, age / .8);
   ctx.strokeStyle = `rgba(100,216,203,${Math.max(0, fade) * .3})`;
   ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
   if (!reduced.matches && age < .8) {
    const t = age / .8;
    ctx.save(); ctx.fillStyle = 'rgba(255,176,120,.58)'; ctx.shadowColor = 'rgba(255,176,120,.58)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
   }
  }
  nodes.forEach((node, i) => {
   ctx.fillStyle = 'rgba(100,216,203,.5)';
   ctx.beginPath(); ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2); ctx.fill();
   // One subtly distinct AI ring, present briefly once per cycle. Static under reduced motion.
   const phase = simTime % 35;
   if (i === nodes.length - 1 && (reduced.matches || (phase > 20 && phase < 28))) {
    const alpha = reduced.matches ? .22 : Math.min(1, phase - 20, 28 - phase) * .31;
    ctx.strokeStyle = `rgba(255,176,120,${alpha})`;
    ctx.beginPath(); ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2); ctx.stroke();
   }
  });
  // Softly fade decorative marks behind text (feathered, not hard-clipped) to keep contrast.
  ctx.save(); ctx.globalCompositeOperation = 'destination-out';
  ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 18; ctx.shadowOffsetX = 10000; ctx.fillStyle = '#000';
  for (const area of textAreas) ctx.fillRect(area.x - 10000, area.y, area.width, area.height);
  ctx.restore();
 }
 function tick(now: number) {
  raf = 0;
  if (!canRun()) return;
  if (!previous) { previous = now; rendered = now; }
  const dt = Math.min((now - previous) / 1000, .05); previous = now;
  simTime += dt;
  edges = edges.filter(e => e.persistent || simTime - e.born < e.life);
  if (!encounter && simTime >= nextEncounter) startEncounter();
  updateEncounter(dt);
  if (simTime >= nextSplit) split();
  for (const group of groups) {
   const indices = members(group.id);
   const margin = indices.length === 1 ? 8 : (width < 640 ? 44 : 54);
   group.x += group.vx * dt; group.y += group.vy * dt;
   if (group.x < margin) { group.x = margin; group.vx = Math.abs(group.vx); }
   if (group.x > width - margin) { group.x = width - margin; group.vx = -Math.abs(group.vx); }
   if (group.y < margin) { group.y = margin; group.vy = Math.abs(group.vy); }
   if (group.y > height - margin) { group.y = height - margin; group.vy = -Math.abs(group.vy); }
   for (const i of indices) {
    const n = nodes[i]!;
    const dx = (group.x + n.ox - n.x) * .22, dy = (group.y + n.oy - n.y) * .22;
    const speed = Math.hypot(dx, dy), limit = speed > 4 ? 4 / speed : 1;
    n.x = clamp(n.x + (group.vx + dx * limit + Math.sin(simTime * .32 + i * 1.7) * 1.7) * dt, 5, width - 5);
    n.y = clamp(n.y + (group.vy + dy * limit + Math.cos(simTime * .27 + i * 1.3) * 1.55) * dt, 5, height - 5);
   }
  }
  if (now - rendered >= 1000 / 30) {
   rendered = now;
   if (Math.min(devicePixelRatio || 1, 2) !== dpr) resize();
   draw();
  }
  raf = requestAnimationFrame(tick);
 }
 function canRun() { return !disposed && !document.hidden && visible && !reduced.matches; }
 function reconcile() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0; previous = 0;
  if (canRun()) raf = requestAnimationFrame(tick);
  else if (reduced.matches) draw();
 }
 const observer = new IntersectionObserver(entries => { visible = entries[0]!.isIntersecting; reconcile(); });
 const resizer = new ResizeObserver(resize);
 const cleanup = () => {
  disposed = true; if (raf) cancelAnimationFrame(raf); raf = 0;
  observer.disconnect(); resizer.disconnect();
  document.removeEventListener('visibilitychange', reconcile);
  reduced.removeEventListener('change', reconcile);
  window.removeEventListener('resize', resize);
  window.removeEventListener('pagehide', cleanup);
 };
 const restore = (event: PageTransitionEvent) => {
  // Initial pageshow is not a restore. Retain this listener until pagehide/bfcache finishes.
  if (event.persisted) { window.removeEventListener('pageshow', restore); cleanup(); initNetwork(canvas); }
 };
 resize();
 observer.observe(hero); resizer.observe(hero);
 document.addEventListener('visibilitychange', reconcile);
 reduced.addEventListener('change', reconcile);
 window.addEventListener('resize', resize);
 window.addEventListener('pagehide', cleanup, { once: true });
 window.addEventListener('pageshow', restore);
}
