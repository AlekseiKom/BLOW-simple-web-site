/* ============================================================
   ЯДРО. — логика сайта: вкладки, симулятор, счётчики
   ============================================================ */

/* ===== ВКЛАДКИ ===== */
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

function activateTab(name) {
  tabs.forEach(t => {
    const active = t.dataset.tab === name;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });
  panels.forEach(p => p.classList.toggle('is-active', p.id === 'tab-' + name));
}

/* ===== БУРГЕР-МЕНЮ (мобильные и планшеты, ≤900px) ===== */
const header = document.querySelector('.site-header');
const burger = document.querySelector('.burger');
const mobileMq = window.matchMedia('(max-width: 900px)');

function setMenu(open) {
  header.classList.toggle('nav-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

tabs.forEach(tab => tab.addEventListener('click', () => {
  activateTab(tab.dataset.tab);
  if (mobileMq.matches) setMenu(false); // выбор раздела закрывает мобильное меню
}));

burger.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => { if (!header.contains(e.target)) setMenu(false); });
mobileMq.addEventListener('change', e => { if (!e.matches) setMenu(false); }); // возврат на десктоп сбрасывает меню

/* ===== СИМУЛЯТОР: ЗОНЫ ПОРАЖЕНИЯ ===== */
const range = document.getElementById('yield-range');
const valueOut = document.getElementById('yield-value');
const zones = {
  blast:   document.getElementById('zone-blast'),
  thermal: document.getElementById('zone-thermal'),
  fallout: document.getElementById('zone-fallout')
};
const readouts = {
  blast:   document.getElementById('ro-blast'),
  thermal: document.getElementById('ro-thermal'),
  fallout: document.getElementById('ro-fallout')
};

// Масштаб схемы: ширина города 680 px ≈ 17 км → 40 px на 1 км
const PX_PER_KM = 40;

function updateSim() {
  const y = Number(range.value); // мощность, кт
  valueOut.textContent = y + ' кт';

  // Условные радиусы (км) для воздушного взрыва: R ≈ k * Y^(1/3)
  const cbrt = Math.cbrt(y);
  const rBlast   = 0.55 * cbrt;  // полное разрушение зданий
  const rThermal = 1.15 * cbrt;  // сильные разрушения / ожоги
  const rFallout = 2.6 * cbrt;   // опасная доза от осадков

  zones.blast.setAttribute('r', (rBlast * PX_PER_KM).toFixed(1));
  zones.thermal.setAttribute('r', (rThermal * PX_PER_KM).toFixed(1));
  zones.fallout.setAttribute('r', (rFallout * PX_PER_KM).toFixed(1));

  readouts.blast.textContent = rBlast.toFixed(1) + ' км';
  readouts.thermal.textContent = rThermal.toFixed(1) + ' км';
  readouts.fallout.textContent = rFallout.toFixed(1) + ' км';
}

range.addEventListener('input', updateSim);
updateSim();

/* ===== СЧЁТЧИКИ (анимация при появлении на экране) ===== */
const counters = document.querySelectorAll('.stat__num[data-count]');
const seen = new Set();

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const dur = 1200;
  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !seen.has(e.target)) {
      seen.add(e.target);
      animateCounter(e.target);
    }
  });
}, { threshold: .4 });

counters.forEach(c => io.observe(c));