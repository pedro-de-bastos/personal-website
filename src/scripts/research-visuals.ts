// Read only public labels and categorical findings from the rendered HTML.
const one = <T extends Element>(root: ParentNode, selector: string) => {
 const el = root.querySelector<T>(selector);
 if (!el) throw new Error(`Missing visual element: ${selector}`);
 return el;
};
function reveal(root: HTMLElement) {
 root.querySelectorAll<HTMLElement>('[data-enhance]').forEach(el => el.hidden = false);
 root.querySelectorAll<HTMLDetailsElement>('[data-findings]').forEach(el => el.open = false);
 root.classList.add('is-enhanced');
}
function initSocial(root: HTMLElement) {
 const comparison = one<HTMLSelectElement>(root, '[data-comparison]');
 const measure = one<HTMLSelectElement>(root, '[data-measure]');
 const status = one<HTMLElement>(root, '[role=status]');
 const toggle = one<HTMLButtonElement>(root, '[data-team-toggle]');
 const rows = Array.from(root.querySelectorAll<HTMLTableRowElement>('tbody tr'));
 let current: HTMLTableRowElement[] = [];
 const teamSummary = () => toggle.getAttribute('aria-pressed') === 'true' ? root.dataset.aiSummary! : root.dataset.human!;
 function update(announce = true) {
  one<HTMLElement>(root, '[data-temporal-note]').hidden = comparison.value !== 'time';
  const row = current[measure.selectedIndex]!;
  const label = row.cells[1]!.textContent!;
  const result = row.cells[2]!.textContent!;
  const board = one<HTMLElement>(root, '.direction-board');
  board.dataset.direction = row.dataset.direction;
  const special = row.dataset.direction === 'uncertain-lower' || row.dataset.direction === 'no-differing-trajectory';
  board.hidden = special;
  const specialLabel = one<HTMLElement>(root, '[data-special-label]');
  specialLabel.hidden = !special;
  specialLabel.textContent = row.dataset.direction === 'uncertain-lower' ? root.dataset.uncertainLabel! : root.dataset.trajectoryLabel!;
  one<HTMLElement>(root, '[data-result-label]').textContent = result;
  one<HTMLElement>(root, '[data-measure-label]').textContent = label;
  one<HTMLElement>(root, '.finding-result').dataset.uncertain = String(row.dataset.direction === 'uncertain-lower');
  if (announce) status.textContent = `${label}: ${result} — ${row.dataset.comparisonLabel}. ${root.dataset.summarySuffix}`;
 }
 function populate(announce = true) {
  current = rows.filter(r => r.dataset.comparisonId === comparison.value);
  measure.replaceChildren(...current.map((r, i) => new Option(r.cells[1]!.textContent!, String(i))));
  update(announce);
 }
 comparison.addEventListener('change', () => populate());
 measure.addEventListener('change', () => update());
 toggle.addEventListener('click', () => {
  const active = toggle.getAttribute('aria-pressed') !== 'true';
  toggle.setAttribute('aria-pressed', String(active));
  toggle.textContent = active ? toggle.dataset.remove! : toggle.dataset.add!;
  root.classList.toggle('with-ai', active);
  status.textContent = teamSummary();
 });
 populate(false);
 reveal(root);
}
function initTrail(root: HTMLElement) {
 const status = one<HTMLElement>(root, '[role=status]');
 const radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[type=radio]'));
 const findings = Array.from(root.querySelectorAll<HTMLElement>('[data-cognitive]'));
 const flowButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-flow-step]'));
 function update(announce = true) {
  const selected = radios.find(r => r.checked)!;
  root.classList.toggle('supportive-selected', selected.value === 'supportive');
  const parts = findings.map(el => {
   const result = selected.value === 'cognitive' ? el.dataset.cognitive! : el.dataset.supportive!;
   one<HTMLElement>(el, '.result-word').textContent = result;
   const arrow = one<HTMLElement>(el, '.result-arrow');
   const lower = result === 'Lower' || result === 'Shorter';
   arrow.textContent = result.startsWith('Similar') ? '≈' : '↑';
   arrow.style.transform = lower ? 'rotate(180deg)' : 'rotate(0deg)';
   return `${el.previousElementSibling!.textContent}: ${result}`;
  });
  if (announce) status.textContent = `${selected.closest('label')!.querySelector('span:last-child')!.firstChild!.textContent}, ${one<HTMLElement>(root, '.note').textContent!.toLowerCase()}: ${parts.join('; ')}. ${root.dataset.summarySuffix}`;
 }
 radios.forEach(r => r.addEventListener('change', () => update()));
 flowButtons.forEach(button => button.addEventListener('click', () => {
  flowButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  const description = one<HTMLElement>(root, `[data-flow-detail="${button.dataset.flowStep}"]`).textContent!;
  one<HTMLElement>(root, '[data-flow-description]').textContent = description;
  status.textContent = `${button.textContent?.trim()}: ${description}`;
 }));
 update(false);
 reveal(root);
}
function initSync(root: HTMLElement) {
 const range = one<HTMLInputElement>(root, 'input[type=range]');
 range.addEventListener('input', () => {
  const last = range.value === '1';
  const label = last ? root.dataset.lastValue! : root.dataset.firstValue!;
  range.setAttribute('aria-valuetext', label);
  one<HTMLElement>(root, '[data-session-current]').textContent = label;
  root.querySelectorAll('.sync-panel').forEach(el => el.classList.toggle('is-last', last));
  one<HTMLElement>(root, '[role=status]').textContent = last ? root.dataset.last! : root.dataset.first!;
 });
 reveal(root);
}
for (const [selector, init] of [['[data-social]', initSocial], ['[data-trail]', initTrail], ['[data-sync]', initSync]] as const) {
 document.querySelectorAll<HTMLElement>(selector).forEach(root => {
  try { init(root); } catch (error) { console.error('Research visual initialization failed', error); }
 });
}

// Expand disclosures for paper copies, then restore the reader's choices.
let printDisclosures: HTMLDetailsElement[] = [];
window.addEventListener('beforeprint', () => {
 printDisclosures = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-findings]')).filter(el => !el.open);
 printDisclosures.forEach(el => el.open = true);
});
window.addEventListener('afterprint', () => {
 printDisclosures.forEach(el => el.open = false);
 printDisclosures = [];
});
