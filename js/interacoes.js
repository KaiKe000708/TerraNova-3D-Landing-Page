// =============================================================
//  Selo TerraNova: fio narrativo entre as seções.
//  O logo do menu sai e pousa ao lado do título de cada seção
//  (a partir de "Do pasto à garrafa") e volta ao menu ao subir.
//  Com prefers-reduced-motion ele fica parado ao lado de cada título.
// =============================================================

const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Selo TerraNova: fio narrativo entre as seções ----------
// O logo do menu é a "casa" do selo. Quando o título de uma seção entra na
// tela, o selo voa (em arco, girando como um carimbo) e pousa ao lado do
// título; quando o título sai, ele volta para o menu. É a técnica do FLIP
// (First, Last, Invert, Play): mede a posição de partida e a de chegada e
// anima entre as duas, só que com o destino vivo (ele continua rolando).
export function montarSelo({ reduzido }) {
  const casa = document.querySelector('.nav .nav__brand .logo-mark');
  const vagas = [...document.querySelectorAll('.selo-slot')];
  if (!casa || !vagas.length || reduzido) return null;
  const root = document.documentElement;
  const selo = document.createElement('div');
  selo.className = 'selo';
  selo.setAttribute('aria-hidden', 'true');
  selo.innerHTML = '<svg viewBox="0 0 64 64"><use href="#logo" /></svg>';
  document.body.appendChild(selo);
  root.classList.add('tem-selo');

  const s = { x: 0, y: 0, t: 30, giro: 0 };
  let alvo = casa, de = null, t0 = 0, voando = false, ativoAte = 0;
  const DUR = 900;
  const caixa = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.width }; };
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  function escolher() {
    const vh = window.innerHeight;
    let melhor = casa, dist = Infinity;
    for (const v of vagas) {
      const r = v.getBoundingClientRect();
      if (!r.width || r.top < vh * 0.07 || r.bottom > vh * 0.86) continue;
      const d = Math.abs(r.top - vh * 0.35);
      if (d < dist) { dist = d; melhor = v; }
    }
    return melhor;
  }
  function voarPara(novo) {
    de = { x: s.x, y: s.y, t: s.t, giro: s.giro };
    alvo = novo; t0 = performance.now(); voando = true;
    selo.classList.toggle('is-pousado', novo !== casa);
  }
  function quadro(agora) {
    if (agora < ativoAte || voando) requestAnimationFrame(quadro); else { rodando = false; return; }
    const novo = escolher();
    if (novo !== alvo) voarPara(novo);
    const b = caixa(alvo);
    if (voando) {
      const p = Math.min((agora - t0) / DUR, 1), e = ease(p);
      const dx = b.x - de.x, dy = b.y - de.y, dist = Math.hypot(dx, dy) || 1;
      const arco = Math.sin(Math.PI * p) * Math.min(dist * 0.22, 160); // desvio perpendicular: voo em curva
      s.x = lerp(de.x, b.x, e) + (-dy / dist) * arco;
      s.y = lerp(de.y, b.y, e) + (dx / dist) * arco;
      s.t = lerp(de.t, b.t, e) * (1 + Math.sin(Math.PI * p) * 0.35);
      s.giro = de.giro + 360 * e;
      if (p >= 1) { voando = false; s.giro = 0; }
    } else { s.x = b.x; s.y = b.y; s.t = b.t; }
    selo.style.transform = `translate3d(${(s.x - s.t / 2).toFixed(1)}px, ${(s.y - s.t / 2).toFixed(1)}px, 0) rotate(${s.giro.toFixed(1)}deg)`;
    selo.style.width = selo.style.height = `${s.t.toFixed(1)}px`;
  }
  let rodando = false;
  function acordar(ms = 400) {
    ativoAte = Math.max(ativoAte, performance.now() + ms);
    if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
  }
  // começa no menu
  const b = caixa(casa); Object.assign(s, { x: b.x, y: b.y, t: b.t });
  acordar(800);
  window.addEventListener('scroll', () => acordar(), { passive: true });
  window.addEventListener('resize', () => acordar(), { passive: true });
  return { acordar };
}
