// Decorative geometry and timing; none of these constants represent research data.
const canvas = document.querySelector<HTMLCanvasElement>('.network-background');
const button = document.querySelector<HTMLButtonElement>('[data-motion]');
if (canvas && button) initNetwork(canvas, button);
function initNetwork(canvas: HTMLCanvasElement, button: HTMLButtonElement) {
 const context = canvas.getContext('2d');
 if (!context) return;
 const ctx = context;
 const hero = canvas.parentElement!;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 type Node = { x: number; y: number; vx: number; vy: number; r: number };
 type Edge = { a: number; b: number; born: number; life: number };
 let seed = 8517;
 const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
 let nodes: Node[] = [], edges: Edge[] = [];
 let width = 1, height = 1, dpr = 1, simTime = 0, nextEdge = 4;
 let raf = 0, previous = 0, rendered = 0, visible = false, disposed = false, paused = false;
 try { paused = sessionStorage.getItem('network-paused') === 'true'; } catch { /* Storage is optional. */ }
 function syncButton() {
  button.disabled = reduced.matches;
  button.textContent = reduced.matches ? button.dataset.off! : paused ? button.dataset.resume! : button.dataset.pause!;
  button.setAttribute('aria-pressed', String(paused || reduced.matches));
 }
 function resize() {
  const bounds = hero.getBoundingClientRect();
  const oldWidth = width, oldHeight = height;
  width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = width < 640 ? 12 : width < 1024 ? 20 : 30;
  nodes = nodes.slice(0, count).map(n => ({ ...n, x: n.x / oldWidth * width, y: n.y / oldHeight * height }));
  while (nodes.length < count) {
   const angle = random() * Math.PI * 2, speed = 3 + random() * 5;
   nodes.push({ x: random() * width, y: random() * height, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 2 + random() });
  }
  edges = edges.filter(e => e.a < count && e.b < count);
  draw();
 }
 function formEdge() {
  if (edges.length >= Math.floor(nodes.length * 1.2)) return;
  // At most one traveling spark, even when eligible pairs are plentiful.
  if (edges.some(e => simTime - e.born < .8)) return;
  const degree = nodes.map((_, i) => edges.filter(e => e.a === i || e.b === i).length);
  const candidates: [number, number][] = [];
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
   const na = nodes[a]!, nb = nodes[b]!;
   if (degree[a]! < 3 && degree[b]! < 3 && Math.hypot(na.x - nb.x, na.y - nb.y) < (width < 640 ? 120 : 170) && !edges.some(e => e.a === a && e.b === b)) candidates.push([a, b]);
  }
  const pair = candidates[Math.floor(random() * candidates.length)];
  if (pair) edges.push({ a: pair[0], b: pair[1], born: simTime, life: 8 + random() * 4 });
 }
 function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  for (const edge of edges) {
   const a = nodes[edge.a]!, b = nodes[edge.b]!;
   const age = simTime - edge.born;
   const fade = Math.min(1, (edge.life - age) / 3, age / .8);
   ctx.strokeStyle = `rgba(100,216,203,${Math.max(0, fade) * .17})`;
   ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
   if (!reduced.matches && age < .8) {
    const t = age / .8;
    ctx.save(); ctx.fillStyle = 'rgba(255,176,120,.49)'; ctx.shadowColor = 'rgba(255,176,120,.49)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
   }
  }
  nodes.forEach((node, i) => {
   ctx.fillStyle = 'rgba(100,216,203,.31)';
   ctx.beginPath(); ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2); ctx.fill();
   // One subtly distinct AI ring, present briefly once per cycle. Static under reduced motion.
   const phase = simTime % 35;
   if (i === nodes.length - 1 && (reduced.matches || (phase > 20 && phase < 28))) {
    const alpha = reduced.matches ? .22 : Math.min(1, phase - 20, 28 - phase) * .31;
    ctx.strokeStyle = `rgba(255,176,120,${alpha})`;
    ctx.beginPath(); ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2); ctx.stroke();
   }
  });
 }
 function tick(now: number) {
  raf = 0;
  if (!canRun()) return;
  if (!previous) { previous = now; rendered = now; }
  const dt = Math.min((now - previous) / 1000, .05); previous = now;
  simTime += dt;
  for (const [i, n] of nodes.entries()) {
   n.x += (n.vx + Math.sin(simTime * .15 + i) * .7) * dt;
   n.y += (n.vy + Math.cos(simTime * .17 + i) * .7) * dt;
   if (n.x < 5) { n.x = 5; n.vx = Math.abs(n.vx); }
   if (n.x > width - 5) { n.x = width - 5; n.vx = -Math.abs(n.vx); }
   if (n.y < 5) { n.y = 5; n.vy = Math.abs(n.vy); }
   if (n.y > height - 5) { n.y = height - 5; n.vy = -Math.abs(n.vy); }
  }
  edges = edges.filter(e => simTime - e.born < e.life);
  if (simTime >= nextEdge) { formEdge(); nextEdge = simTime + 4 + random() * 3; }
  if (now - rendered >= 1000 / 30) {
   rendered = now;
   if (Math.min(devicePixelRatio || 1, 2) !== dpr) resize();
   draw();
  }
  raf = requestAnimationFrame(tick);
 }
 function canRun() { return !disposed && !paused && !document.hidden && visible && !reduced.matches; }
 function reconcile() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0; previous = 0;
  syncButton();
  if (canRun()) raf = requestAnimationFrame(tick);
  else if (reduced.matches) draw();
 }
 const observer = new IntersectionObserver(entries => { visible = entries[0]!.isIntersecting; reconcile(); });
 const resizer = new ResizeObserver(resize);
 const toggle = () => { paused = !paused; try { sessionStorage.setItem('network-paused', String(paused)); } catch { /* Optional. */ } reconcile(); };
 const cleanup = () => {
  disposed = true; if (raf) cancelAnimationFrame(raf); raf = 0;
  observer.disconnect(); resizer.disconnect();
  document.removeEventListener('visibilitychange', reconcile);
  reduced.removeEventListener('change', reconcile);
  button.removeEventListener('click', toggle);
  window.removeEventListener('resize', resize);
 };
 resize();
 // Start with a sparse seeded network, including under reduced motion.
 for (let i = 0; i < Math.floor(nodes.length / 3); i++) {
  formEdge();
  if (edges.length) edges[edges.length - 1]!.born = -1;
 }
 draw(); syncButton(); button.hidden = false;
 observer.observe(hero); resizer.observe(hero);
 document.addEventListener('visibilitychange', reconcile);
 reduced.addEventListener('change', reconcile);
 window.addEventListener('resize', resize);
 button.addEventListener('click', toggle);
 window.addEventListener('pagehide', cleanup, { once: true });
 window.addEventListener('pageshow', event => { if (event.persisted) { cleanup(); initNetwork(canvas, button); } }, { once: true });
}
