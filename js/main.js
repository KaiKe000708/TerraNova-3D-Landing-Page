// =============================================================
//  TerraNova — orquestra rolagem, garrafa 3D e interações.
//
//  Cada seção tem data-bottle="x, y, escala, voltas, sombra":
//    x / y   de -1 a 1 (posição na tela; > 1 tira a garrafa da tela)
//    escala  1 = 74% da altura da tela
//    voltas  quantas voltas a garrafa já deu ao chegar ali
//    sombra  1 mostra a sombra de contato, 0 esconde
//  data-bottle-m é a versão para celular (opcional).
// =============================================================
import { VARIANTS, tabelaNutricional, ROTULO } from './variants.js';
import { CONTATO, DESENVOLVEDOR } from './config.js';
import { PERFIL, ALTURA_PX } from './perfil.js';

const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
gsap?.ticker.lagSmoothing(0); // mantém o tempo real mesmo em máquinas lentas
const root = document.documentElement;
const CAMPO = getComputedStyle(root).getPropertyValue('--campo').trim() || '#16291e';
const topo = (el) => el.getBoundingClientRect().top + window.scrollY;

// ---------- Rótulo e tabela nutricional (HTML) ----------
function rotuloHTML(v) {
  const t = tabelaNutricional(v);
  return `
    <div class="rotulo">
      <p class="rotulo__nome">${v.denominacao}</p>
      <p class="rotulo__txt"><b>INGREDIENTES:</b> ${v.ingredientes.toUpperCase()}</p>
      <p class="rotulo__aviso">${ROTULO.alergicos}<br />${v.lactose}<br />${ROTULO.gluten}</p>
      <table class="nutri">
        <caption>INFORMAÇÃO NUTRICIONAL</caption>
        <thead>
          <tr><th colspan="4" class="nutri__porcao">Porções por embalagem: ${t.porcoes}<br />Porção: ${t.porcao}</th></tr>
          <tr><th></th><th>100 g</th><th>200 g</th><th>%VD*</th></tr>
        </thead>
        <tbody>${t.rows.map((r) => `<tr${r.recuo ? ' class="recuo"' : ''}><td>${r.nome}</td><td>${r.cem}</td><td>${r.porcao}</td><td>${r.vd}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="4">*Percentual de valores diários fornecidos pela porção.</td></tr></tfoot>
      </table>
      <p class="rotulo__txt">${ROTULO.conservacao} ${ROTULO.validade}</p>
      <p class="rotulo__nota">Valores estimados para o projeto acadêmico.</p>
    </div>`;
}

// ---------- Seção Linha: painéis e abas ----------
const stage = document.querySelector('.linha__stage');
const tabs = document.querySelector('.linha__tabs');
VARIANTS.forEach((v, i) => {
  const el = document.createElement('article');
  el.className = 'variant';
  el.id = `versao-${v.id}`;
  el.setAttribute('role', 'tabpanel');
  el.setAttribute('aria-label', `TerraNova ${v.nome}`);
  el.innerHTML = `
    <div class="variant__copy">
      <p class="variant__count">${String(i + 1).padStart(2, '0')} / ${String(VARIANTS.length).padStart(2, '0')}</p>
      <h3 class="variant__name" aria-label="${v.nome}">${[...v.nome].map((c) => `<span>${c}</span>`).join('')}</h3>
      <p class="variant__sub">${v.versao}</p>
      <p class="variant__frase">${v.frase}</p>
      <p class="variant__desc">${v.descricao}</p>
      <ul class="variant__chips">${v.beneficios.map((b) => `<li class="chip">${b}</li>`).join('')}</ul>
      <button type="button" class="link-rotulo" data-versao="${i}">Ver rótulo e tabela nutricional</button>
    </div>
    <div aria-hidden="true"></div>
    <figure class="variant__photo">
      <div class="face-tabs" role="tablist" aria-label="Foto ou rótulo">
        <button type="button" role="tab" data-face="foto" aria-selected="true">Na mesa</button>
        <button type="button" role="tab" data-face="rotulo" aria-selected="false">Rótulo e tabela</button>
      </div>
      <div class="card-wrap">
        <div class="card__glow" style="background-image:url('${v.foto}')" aria-hidden="true"></div>
        <div class="card">
          <div class="card__face card__face--foto">
            <div class="variant__frame photo-slot" data-src="${v.foto}" data-label="Foto: ${v.foto}"></div>
            <figcaption class="card__bar"><span>Foto da campanha</span><span>${v.volume} por R$ 12,99</span></figcaption>
          </div>
          <div class="card__face card__face--rotulo">${rotuloHTML(v)}</div>
        </div>
      </div>
    </figure>`;
  stage.appendChild(el);
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" role="tab" aria-controls="versao-${v.id}" aria-selected="${i === 0}">${v.nome}</button>`;
  li.querySelector('button').addEventListener('click', () => irParaVersao(i));
  tabs.appendChild(li);
});
const listaRodape = document.querySelector('.footer__versoes');
VARIANTS.forEach((v, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button type="button"><i style="background:${v.tampa}"></i>${v.nome}</button>`;
  li.querySelector('button').addEventListener('click', () => irParaVersao(i));
  listaRodape.appendChild(li);
});
const nomesGondola = document.querySelector('.gondola__names');
VARIANTS.forEach((v, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button type="button"><strong>${v.nome}</strong><span>${v.curto}</span></button>`;
  li.querySelector('button').addEventListener('click', () => irParaVersao(i));
  nomesGondola.appendChild(li);
});
const areasGondola = document.createElement('div');
areasGondola.className = 'gondola__hits';
VARIANTS.forEach((v, k) => {
  const b = document.createElement('button');
  b.type = 'button'; b.setAttribute('aria-label', `Ver TerraNova ${v.nome}`);
  b.addEventListener('pointerenter', () => cena?.setFoco(k));
  b.addEventListener('pointerleave', () => cena?.setFoco(-1));
  b.addEventListener('focus', () => cena?.setFoco(k));
  b.addEventListener('blur', () => cena?.setFoco(-1));
  b.addEventListener('click', () => irParaVersao(k));
  areasGondola.appendChild(b);
});
nomesGondola.after(areasGondola);
[...nomesGondola.children].forEach((li, k) => {
  li.addEventListener('pointerenter', () => cena?.setFoco(k));
  li.addEventListener('pointerleave', () => cena?.setFoco(-1));
});
function alinharGondola() {
  // coloca cada nome e cada área de toque exatamente sobre a sua garrafa 3D
  const m = cena?.medidasGondola?.() || { xs: VARIANTS.map((_, k) => 0.5 + (k - 2) * 0.15), hf: 0.34, base: 0.7 };
  const larg = (m.hf * window.innerHeight * (432 / 1272)) / window.innerWidth;
  [...nomesGondola.children].forEach((li, k) => { li.style.left = `${m.xs[k] * 100}%`; });
  [...areasGondola.children].forEach((b, k) => {
    Object.assign(b.style, { left: `${(m.xs[k] - larg * 0.75) * 100}%`, width: `${larg * 150}%`, top: `${(m.base - m.hf) * 100}%`, height: `${m.hf * 100}%` });
  });
}
const metas = document.querySelectorAll('.metas__grid dd');
const fmt = new Intl.NumberFormat('pt-BR');
metas.forEach((dd) => { dd.textContent = reduzido ? fmt.format(+dd.dataset.count) + (dd.dataset.suffix || '') : '0' + (dd.dataset.suffix || ''); });
let metasFeitas = reduzido;
function contarMetas() {
  if (metasFeitas) return;
  metasFeitas = true;
  metas.forEach((dd, i) => {
    const alvo = +dd.dataset.count, suf = dd.dataset.suffix || '';
    const o = { v: 0 };
    gsap?.to(o, { v: alvo, duration: 1.8, delay: i * 0.12, ease: 'power3.out', onUpdate: () => { dd.textContent = fmt.format(Math.round(o.v)) + suf; } });
  });
}
const hora = document.querySelector('.footer__hora');
function atualizarHora() {
  try { hora.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()); } catch (e) { /* sem Intl */ }
}
atualizarHora(); setInterval(atualizarHora, 20000);
const paineis = [...stage.children];
const botoes = [...tabs.querySelectorAll('button')];
const barra = document.querySelector('.linha__progress span');

// ---------- Cartão: "Na mesa" ou "Rótulo e tabela" ----------
let face = 'foto';
function setFace(f) {
  face = f;
  paineis.forEach((p) => {
    p.classList.toggle('mostra-rotulo', f === 'rotulo');
    p.querySelectorAll('.face-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.face === f)));
  });
  cena?.setVerso(f === 'rotulo');
}
stage.addEventListener('click', (e) => {
  const tab = e.target.closest('.face-tabs button');
  if (tab) setFace(tab.dataset.face);
  const link = e.target.closest('.link-rotulo');
  if (link) {
    if (mobile()) abrirDialogo(+link.dataset.versao);
    else setFace(face === 'rotulo' ? 'foto' : 'rotulo');
  }
});
// leve inclinação 3D do cartão seguindo o mouse
stage.addEventListener('pointermove', (e) => {
  const w = e.target.closest('.card-wrap');
  if (!w || reduzido || e.pointerType !== 'mouse') return;
  const r = w.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
  w.style.transform = `perspective(1000px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
});
stage.addEventListener('pointerout', (e) => {
  const w = e.target.closest('.card-wrap');
  if (w && !w.contains(e.relatedTarget)) w.style.transform = '';
});
const dialogo = document.querySelector('.nutri-dialog');
function abrirDialogo(i) {
  dialogo.querySelector('.nutri-dialog__inner').innerHTML = `<h2 id="nutri-titulo" class="display-md">${VARIANTS[i].nome}</h2>${rotuloHTML(VARIANTS[i])}`;
  dialogo.showModal?.();
  cena?.setVerso(true);
}
dialogo.querySelector('.nutri-dialog__close').addEventListener('click', () => dialogo.close());
dialogo.addEventListener('close', () => { if (face !== 'rotulo') cena?.setVerso(false); });
dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
paineis[0].classList.add('is-active');

// ---------- Fotos: aparecem inteiras se o arquivo existir ----------
document.querySelectorAll('.photo-slot').forEach((slot) => {
  slot.textContent = slot.dataset.label || 'Coloque uma foto aqui';
  const src = slot.dataset.src;
  if (!src) return;
  const img = new Image();
  img.alt = (slot.dataset.label || '').replace('Foto: ', '');
  img.decoding = 'async';
  img.onload = () => {
    slot.textContent = ''; slot.appendChild(img); slot.classList.add('has-img');
    if (slot.classList.contains('variant__frame')) slot.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
  };
  img.src = src;
});

// ---------- Manifesto: separa as palavras ----------
const manifesto = document.querySelector('.manifesto');
const palavras = [];
document.querySelectorAll('[data-reveal-words]').forEach((p) => {
  const txt = p.textContent.trim().split(/\s+/);
  p.innerHTML = txt.map((w) => `<span class="w">${w}</span>`).join(' ');
  palavras.push(...p.querySelectorAll('.w'));
});

// ---------- Rolagem suave ----------
let lenis = null;
if (!reduzido && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
function rolarPara(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduzido ? 'auto' : 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const alvo = id.length > 1 && document.querySelector(id);
    if (!alvo) return;
    e.preventDefault();
    rolarPara(id === '#topo' ? 0 : topo(alvo));
  });
});

// ---------- Quadros-chave da garrafa ----------
const secLinha = document.querySelector('.linha');
const secGondola = document.querySelector('.gondola');
let chaves = [];
let paradas = [];
const mobile = () => window.innerWidth <= 900;
function lerChave(el) {
  const raw = (mobile() && el.dataset.bottleM) || el.dataset.bottle;
  const [x, y, s, voltas, sombra = 1, g = 0] = raw.split(',').map(Number);
  return { x, y, s, voltas, sombra, g };
}
let cache = { li: 0, lf: 1, mi: 0, mh: 1, wt: 0, wh: 1, max: 1 };
const palavraRodape = document.querySelector('.footer__word');
const cheio = document.querySelector('.footer__word-fill');
function faixaLinha() { return [cache.li, cache.lf]; }
function posVersao(i) {
  const [ini, fim] = faixaLinha();
  return ini + (fim - ini) * ((i + 0.5) / VARIANTS.length);
}
function irParaVersao(i) { rolarPara(posVersao(i)); }
function medir() {
  const vh = window.innerHeight;
  const li = topo(secLinha);
  cache = { li, lf: li + secLinha.offsetHeight - vh, mi: topo(manifesto), mh: manifesto.offsetHeight,
    gi: topo(secGondola), gh: secGondola.offsetHeight, wt: topo(palavraRodape), ft: topo(document.querySelector('.footer')), wh: palavraRodape.offsetHeight, max: document.documentElement.scrollHeight - vh };
  chaves = []; paradas = [];
  document.querySelectorAll('[data-bottle]').forEach((el) => {
    const t = topo(el), h = el.offsetHeight, k = lerChave(el);
    if (h > vh * 1.6) {           // seções longas: a garrafa fica parada durante a seção
      chaves.push({ at: t, ...k }, { at: t + h - vh, ...k });
      if (el === secLinha) VARIANTS.forEach((_, i) => paradas.push(posVersao(i)));
      else paradas.push(t + (h - vh) * 0.85);
    } else {
      chaves.push({ at: Math.max(0, t + h / 2 - vh / 2), ...k });
      paradas.push(el.classList.contains('hero') ? 0 : Math.max(0, t + h / 2 - vh / 2));
    }
  });
  chaves.sort((a, b) => a.at - b.at);
  paradas = [...new Set(paradas.map(Math.round))].sort((a, b) => a - b);
}
const suave = (t) => t * t * (3 - 2 * t);
function quadroAtual(y) {
  if (!chaves.length) return null;
  if (y <= chaves[0].at) return chaves[0];
  for (let i = 1; i < chaves.length; i++) {
    const a = chaves[i - 1], b = chaves[i];
    if (y <= b.at) {
      const t = suave((y - a.at) / (b.at - a.at || 1));
      const mix = (k) => a[k] + (b[k] - a[k]) * t;
      return { x: mix('x'), y: mix('y'), s: mix('s'), voltas: mix('voltas'), sombra: mix('sombra'), g: mix('g') };
    }
  }
  return chaves[chaves.length - 1];
}

// ---------- Versão ativa ----------
let versao = 0;
let palavrasAcesas = -1;
let cena = null;
function trocarVersao(i) {
  if (i === versao) return;
  const antes = paineis[versao], depois = paineis[i];
  versao = i;
  botoes.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
  cena?.setVersao(i);
  antes.classList.remove('is-active');
  depois.classList.add('is-active');
  if (gsap && !reduzido) {
    gsap.fromTo(depois.querySelectorAll('.variant__name span'), { yPercent: 108 }, { yPercent: 0, duration: 1, stagger: 0.04, ease: 'expo.out', delay: 0.15 });
    gsap.fromTo(depois.querySelectorAll('.variant__count, .variant__sub, .variant__frase, .variant__desc, .variant__chips'),
      { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'power2.out', delay: 0.3 });
    gsap.fromTo(depois.querySelector('.card'), { clipPath: 'inset(100% 0 0 0 round 22px)' }, { clipPath: 'inset(0% 0 0 0 round 22px)', duration: 1.2, ease: 'expo.inOut' });
    gsap.fromTo(depois.querySelector('.card__glow'), { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out', delay: 0.3 });
    gsap.fromTo(depois.querySelector('.variant__frame img'), { scale: 1.15 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
  }
}

function aoRolar() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  root.classList.toggle('is-scrolled', y > 30);
  const q = quadroAtual(y);
  if (cena && q) Object.assign(cena.alvo, q);

  const [ini, fim] = faixaLinha();
  const dentro = y >= ini - vh * 0.4 && y <= fim + vh * 0.4;
  const p = Math.min(Math.max((y - ini) / (fim - ini), 0), 0.9999);
  trocarVersao(Math.floor(p * VARIANTS.length));
  if (barra) barra.style.transform = `scaleX(${p})`;
  root.style.setProperty('--bg', dentro ? VARIANTS[versao].fundo : CAMPO);
  if (!dentro && face === 'rotulo') setFace('foto');

  // gôndola: prateleira acende e as metas contam quando ela chega
  if (cena) {
    const gq = cena.alvo.g ?? 0;
    root.style.setProperty('--shelf', Math.min(Math.max((gq - 0.35) / 0.55, 0), 1).toFixed(3));
    if (gq > 0.85) contarMetas();
  } else if (y > cache.gi - vh * 0.3) { root.style.setProperty('--shelf', 1); contarMetas(); }

  // rodapé: a palavra enche de baixo para cima até o fim da página
  if (cheio) {
    const ini = Math.min(cache.ft - vh * 0.5, cache.wt - vh), fim = Math.max(cache.max - 2, ini + 1);
    const pf = reduzido ? 1 : Math.min(Math.max((y - ini) / (fim - ini), 0), 1);
    if (Math.abs(pf - (cheio._p ?? -1)) > 0.002) {
      cheio._p = pf;
      const alt = cache.wh;
      cheio.style.setProperty('--fp', `${(pf * 100).toFixed(2)}%`);
      cheio.style.setProperty('--wy', `${(alt * (1 - pf) - 23 * Math.min(1, pf * 8)).toFixed(1)}px`);
    }
  }

  // manifesto: acende as palavras ao longo da seção
  if (palavras.length && !reduzido) {
    const { mi, mh } = cache;
    const mp = mobile()
      ? Math.min(Math.max((y + vh * 0.75 - mi) / (mh * 0.8), 0), 1)
      : Math.min(Math.max((y - mi + vh * 0.25) / (mh - vh * 0.6), 0), 1);
    const n = Math.round(mp * palavras.length);
    if (n !== palavrasAcesas) { palavras.forEach((w, i) => w.classList.toggle('on', i < n)); palavrasAcesas = n; }
  }
}
if (lenis) lenis.on('scroll', aoRolar);
else window.addEventListener('scroll', aoRolar, { passive: true });
let tResize;
window.addEventListener('resize', () => { clearTimeout(tResize); tResize = setTimeout(() => { medir(); alinharGondola(); aoRolar(); }, 120); });

// ---------- Mouse: leve inclinação ----------
window.addEventListener('pointermove', (e) => {
  if (!cena || reduzido || e.pointerType !== 'mouse') return;
  cena.alvo.mx = (e.clientX / window.innerWidth - 0.5) * 2;
  cena.alvo.my = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------- Modo apresentação ----------
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, button')) return;
  const prox = e.key === 'ArrowRight' || e.key === 'PageDown';
  const ant = e.key === 'ArrowLeft' || e.key === 'PageUp';
  if (!prox && !ant) return;
  e.preventDefault();
  const y = window.scrollY;
  const alvo = prox ? paradas.find((p) => p > y + 8) : [...paradas].reverse().find((p) => p < y - 8);
  if (alvo !== undefined) rolarPara(alvo);
  root.classList.add('show-hint');
  clearTimeout(window.__hint);
  window.__hint = setTimeout(() => root.classList.remove('show-hint'), 2400);
});

// ---------- Formulário (FormSubmit) ----------
const form = document.querySelector('.aviso__form');
const msg = document.querySelector('.aviso__msg');
const botaoEnviar = form.querySelector('button[type="submit"]');
const configurado = !/SEU-EMAIL/i.test(CONTATO.email);
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = form.querySelector('#email');
  const email = input.value.trim();
  const cidade = form.querySelector('#cidade').value;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  input.setAttribute('aria-invalid', String(!ok));
  if (!ok) { msg.textContent = 'Digite um e-mail válido, como nome@email.com.'; input.focus(); return; }
  if (form.querySelector('.hp').value) return; // robô preencheu o campo escondido

  const sucesso = () => {
    msg.textContent = `Pronto! Vamos avisar ${email} quando a TerraNova chegar${cidade && cidade !== 'Outra cidade' ? ` a ${cidade}` : ' ao seu mercado'}.`;
    form.reset();
  };
  if (!configurado) { console.info('Formulário em modo de demonstração: configure o e-mail em js/config.js'); sucesso(); return; }

  botaoEnviar.disabled = true; botaoEnviar.textContent = 'Enviando...';
  msg.textContent = '';
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTATO.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email, cidade: cidade || 'Não informada',
        _subject: CONTATO.assunto, _template: 'table', _captcha: 'false',
        data: new Date().toLocaleString('pt-BR'), pagina: location.href,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && String(j.success) !== 'false') sucesso();
    else throw new Error(j.message || r.status);
  } catch (err) {
    console.warn('Falha no envio:', err);
    msg.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente de novo.';
  } finally {
    botaoEnviar.disabled = false; botaoEnviar.textContent = 'Avisar no lançamento';
  }
});

// ---------- Seletor de cidade no estilo do site ----------
(function seletor() {
  const nativo = document.querySelector('#cidade');
  const wrap = document.createElement('div');
  wrap.className = 'select';
  nativo.replaceWith(wrap);
  wrap.appendChild(nativo);
  nativo.tabIndex = -1; nativo.setAttribute('aria-hidden', 'true');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'input select__btn'; btn.id = 'cidade-btn';
  btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = `<span>Sua cidade</span><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
  btn.dataset.vazio = 'true';
  const lista = document.createElement('ul');
  lista.className = 'select__list'; lista.setAttribute('role', 'listbox'); lista.id = 'cidade-lista'; lista.tabIndex = -1;
  btn.setAttribute('aria-controls', lista.id);
  document.querySelector('label[for="cidade"]').setAttribute('for', btn.id);
  const opcoes = [...nativo.options].filter((o) => o.value);
  opcoes.forEach((o, i) => {
    const li = document.createElement('li');
    li.id = `cidade-op-${i}`; li.setAttribute('role', 'option'); li.setAttribute('aria-selected', 'false'); li.textContent = o.textContent;
    li.addEventListener('click', () => escolher(i));
    li.addEventListener('pointerenter', () => marcar(i));
    lista.appendChild(li);
  });
  wrap.append(btn, lista);
  let ativo = -1;
  const itens = [...lista.children];
  function marcar(i) { ativo = i; itens.forEach((li, j) => li.classList.toggle('is-ativo', j === i)); if (i >= 0) btn.setAttribute('aria-activedescendant', itens[i].id); }
  function abrir() { wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); marcar(Math.max(0, opcoes.findIndex((o) => o.selected))); }
  function fechar() { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant'); }
  function escolher(i) {
    nativo.value = opcoes[i].value;
    itens.forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    btn.querySelector('span').textContent = opcoes[i].textContent; btn.dataset.vazio = 'false';
    fechar(); btn.focus();
  }
  btn.addEventListener('click', () => (wrap.classList.contains('is-open') ? fechar() : abrir()));
  btn.addEventListener('keydown', (e) => {
    const aberto = wrap.classList.contains('is-open');
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      if (!aberto) { abrir(); return; }
      marcar((ativo + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length);
    } else if ((e.key === 'Enter' || e.key === ' ') && aberto) { e.preventDefault(); escolher(Math.max(ativo, 0)); }
    else if (e.key === 'Escape' && aberto) { e.preventDefault(); fechar(); }
    else if (e.key === 'Tab') fechar();
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) fechar(); });
  form.addEventListener('reset', () => { setTimeout(() => { btn.querySelector('span').textContent = 'Sua cidade'; btn.dataset.vazio = 'true'; itens.forEach((li) => li.setAttribute('aria-selected', 'false')); }); });
})();

// ---------- Crédito de desenvolvimento (rodapé) ----------
(function credito() {
  const nome = document.querySelector('.dev__nome');
  const card = document.querySelector('.dev__card');
  if (!nome || !card) return;
  const D = DESENVOLVEDOR;
  const links = [['LinkedIn', D.linkedin], ['GitHub', D.github], ['Instagram', D.instagram]].filter(([, u]) => u);
  card.innerHTML = `
    <div class="dev__topo"><span class="dev__avatar" aria-hidden="true">KG</span><div><strong>${D.nome}</strong><small>${D.papel}</small></div></div>
    <p>${D.resumo}</p>
    ${links.length ? `<div class="dev__links">${links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join('')}</div>` : ''}`;
  const abrir = (sim) => { card.hidden = !sim; nome.setAttribute('aria-expanded', String(sim)); if (sim && gsap && !reduzido) gsap.fromTo(card, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }); };
  nome.addEventListener('click', (e) => { e.stopPropagation(); abrir(card.hidden); });
  document.addEventListener('click', (e) => { if (!card.hidden && !card.contains(e.target)) abrir(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !card.hidden) { abrir(false); nome.focus(); } });
})();

// ---------- Mapa: cidades ----------
const CIDADES = [
  { nome: 'Uberaba', pop: '337.836', papel: 'Sede do projeto e ponto de partida da distribuição refrigerada.', destaque: 'Conhecida como capital do Zebu, tem forte tradição na pecuária e no leite.', dist: 'Produção local' },
  { nome: 'Uberlândia', pop: '713.224', papel: 'Maior mercado do Triângulo Mineiro e principal praça em volume de vendas.', destaque: 'Cidade mais populosa da região, com mais de 700 mil habitantes.', dist: '≈ 100 km pela BR-050' },
  { nome: 'Araxá', pop: '111.691', papel: 'Praça seletiva com público ligado a turismo, saúde e bem-estar.', destaque: 'Conhecida pelo conjunto histórico e pelas águas termais.', dist: '≈ 120 km pela BR-262' },
];
const cardCidade = document.querySelector('.cidade-card');
const abasCidade = cardCidade.querySelector('.cidade-card__tabs');
const corpoCidade = cardCidade.querySelector('.cidade-card__body');
CIDADES.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = c.nome;
  b.addEventListener('click', () => mostrarCidade(i));
  abasCidade.appendChild(b);
});
function mostrarCidade(i) {
  const c = CIDADES[i];
  [...abasCidade.children].forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
  document.querySelectorAll('.mapa__city').forEach((g) => g.classList.toggle('is-on', +g.dataset.cidade === i));
  corpoCidade.innerHTML = `
    <p class="cidade-card__papel">${c.papel}</p>
    <dl>
      <div><dt>População (Censo 2022)</dt><dd>${c.pop}</dd></div>
      <div><dt>Distância da produção</dt><dd>${c.dist}</dd></div>
    </dl>
    <p class="cidade-card__destaque">${c.destaque}</p>`;
  if (gsap && !reduzido) gsap.fromTo(corpoCidade.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
}
document.querySelectorAll('.mapa__city').forEach((g) => {
  const ir = () => mostrarCidade(+g.dataset.cidade);
  g.addEventListener('click', ir);
  g.addEventListener('mouseenter', ir);
  g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } });
});
mostrarCidade(0);

// ---------- Granulação (gerada uma vez, sem blend mode) ----------
(function granulacao() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 180;
  const g = cv.getContext('2d'); const img = g.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  document.querySelector('.grain').style.backgroundImage = `url(${cv.toDataURL('image/png')})`;
})();

// ---------- Carregamento ----------
const loader = document.querySelector('.loader');
const lBottle = loader.querySelector('.loader__bottle');
const lGlass = loader.querySelector('.loader__glass');
const lLiquid = loader.querySelector('.loader__liquid');
const lWave = loader.querySelector('.loader__wave');
const lPct = loader.querySelector('.loader__pct span');
const lCap = loader.querySelector('.loader__cap');

(function desenharSilhueta() {
  // mesma silhueta da garrafa 3D, para a troca ser contínua
  const P = PERFIL.vidro, T = P.tampa, H = ALTURA_PX;
  const lado = P.casca.filter(([r]) => r > 0);
  const dir = lado.map(([r, h]) => `${r} ${H - h}`);
  const esq = [...lado].reverse().map(([r, h]) => `${-r} ${H - h}`);
  const corpo = `M0 ${H} L${dir.join(' L')} L${esq.join(' L')} Z`;
  const r = T.raio;
  const tampa = `M${-r + 6} ${H - T.base} L${-r} ${H - T.base - 6} L${-r} ${H - T.topo + 12} Q${-r} ${H - T.topo} ${-r + 22} ${H - T.topo} L${r - 22} ${H - T.topo} Q${r} ${H - T.topo} ${r} ${H - T.topo + 12} L${r} ${H - T.base - 6} L${r - 6} ${H - T.base} Z`;
  const svg = loader.querySelector('.loader__outline');
  svg.setAttribute('viewBox', `-218 0 436 ${H}`);
  loader.querySelector('.loader__body').setAttribute('d', corpo);
  lCap.setAttribute('d', tampa);
  const topoCorpo = H - 1190;
  const mascara = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-218 ${topoCorpo} 436 1190' preserveAspectRatio='none'><path d='${corpo}' fill='black'/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(mascara)}")`;
  lGlass.style.webkitMaskImage = url; lGlass.style.maskImage = url;
})();

function posicionarSilhueta() {
  // coloca o desenho exatamente onde a garrafa 3D vai aparecer no hero
  const hero = document.querySelector('.hero');
  const raw = (mobile() && hero.dataset.bottleM) || hero.dataset.bottle;
  const [x, y, s] = raw.split(',').map(Number);
  const vh = window.innerHeight, vw = window.innerWidth;
  lBottle.style.height = `${0.74 * s * vh}px`;
  lBottle.style.left = `${vw / 2 * (1 + x)}px`;
  lBottle.style.top = `${vh / 2 * (1 - y)}px`;
}
posicionarSilhueta();
window.addEventListener('resize', () => { if (loader.isConnected) posicionarSilhueta(); });

const NIVEL = PERFIL.vidro.nivel, FUNDO = PERFIL.vidro.fundoLiquido;
let alvoProg = 0, prog = 0;
const inicio = performance.now();
function desenharProgresso() {
  // nunca salta: segue o progresso real, com um mínimo de 1,6 s para a animação respirar
  const teto = Math.min(1, (performance.now() - inicio) / 1600);
  prog += (Math.min(alvoProg, teto) - prog) * 0.08;
  if (alvoProg >= 1 && teto >= 1 && 1 - prog < 0.004) prog = 1;
  const nivel = (FUNDO + prog * (NIVEL - FUNDO)) / 1190;
  lLiquid.style.transform = `translate3d(0, ${(1 - nivel) * 100}%, 0)`;
  lPct.textContent = Math.round(prog * 100);
  if (prog < 1) requestAnimationFrame(desenharProgresso);
  else finalizar();
}
requestAnimationFrame(desenharProgresso);

let pronto = null;
const prontoP = new Promise((r) => { pronto = r; });
async function finalizar() {
  await prontoP;
  const canvas = document.getElementById('cena3d');
  if (!gsap || reduzido) { loader.remove(); canvas.style.opacity = 1; return; }
  gsap.timeline()
    .to(lWave, { scaleY: 0.25, duration: 0.6, ease: 'power2.out' }, 0)
    .fromTo(lCap, { y: -60 }, { y: 0, fill: VARIANTS[0].tampa, stroke: 'rgba(0,0,0,0)', duration: 0.7, ease: 'power3.out' }, 0)
    .to('.loader__brand, .loader__note, .loader__caption, .loader__pct', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.35)
    .add(() => cena?.entrada(), 0.6)
    .to(canvas, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.6)
    .to(lBottle, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0.85)
    .to(loader, { backgroundColor: 'rgba(13,25,18,0)', duration: 1.1, ease: 'power2.inOut' }, 0.7)
    .from('.hero__half > span', { yPercent: 105, duration: 1.5, stagger: 0.1, ease: 'expo.out' }, 1.0)
    .from('.hero__kicker, .hero__meta, .hero__foot > *, .nav > *', { opacity: 0, duration: 1, stagger: 0.05, ease: 'power2.out' }, 1.2)
    .add(() => loader.remove());
}

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

async function iniciar() {
  alvoProg = 0.05;
  await document.fonts.ready;
  alvoProg = 0.12;
  if (webglOk()) {
    try {
      const { criarCena } = await import('./bottle3d.js');
      alvoProg = 0.2;
      cena = await criarCena(document.getElementById('cena3d'), VARIANTS, { reduzido, aoProgresso: (v) => { alvoProg = 0.2 + v * 0.8; } });
    } catch (err) { console.warn('3D indisponível:', err); root.classList.add('no-webgl'); }
  } else root.classList.add('no-webgl');
  alvoProg = 1;
  medir();
  alinharGondola();
  aoRolar();
  root.classList.add('is-loaded');
  pronto();
}
iniciar();
