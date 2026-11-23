// =============================================================
//  Painel "Planejado × realizado" (cenário simulado de 2027)
//  Gráficos em SVG feitos à mão, sem biblioteca: barras com a meta
//  marcada, linhas, notas e o cronograma do plano de ação.
//  Os dados ficam em js/dados2027.js.
// =============================================================
import { MESES, VENDAS, PDVS, REDES, META_ENGAJAMENTO, AVALIACOES, RECONHECIMENTO, PLANO } from './dados2027.js';

const nf = new Intl.NumberFormat('pt-BR');
const n1 = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const mil = (v) => (v >= 1000 ? `${nf.format(Math.round(v / 1000))} mil` : nf.format(v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const soma = (arr, k) => arr.reduce((a, r) => a + r[k], 0);

// Geometria comum dos gráficos
const W = 760, H = 330, M = { l: 58, r: 18, t: 18, b: 34 };
const iw = W - M.l - M.r, ih = H - M.t - M.b;

function eixoY(min, max, passos, fmt) {
  const ticks = [];
  for (let i = 0; i <= passos; i++) ticks.push(min + ((max - min) * i) / passos);
  const y = (v) => M.t + ih - ((v - min) / (max - min)) * ih;
  const svg = ticks.map((t) => `<g class="eixo"><line x1="${M.l}" x2="${W - M.r}" y1="${y(t)}" y2="${y(t)}" class="grade"/><text x="${M.l - 10}" y="${y(t) + 4}" text-anchor="end">${esc(fmt(t))}</text></g>`).join('');
  return { y, svg };
}
function eixoX(rows) {
  const bw = iw / rows.length;
  const x = (i) => M.l + bw * i + bw / 2;
  const svg = rows.map((r, i) => `<text class="eixo-x" x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(r.mes)}</text>`).join('');
  return { x, bw, svg };
}

// ---------- tipos de gráfico ----------
// Barras: realizado (barra) × projetado (traço); o que faltou vira Stand by (tracejado dourado)
function barras(rows, { max, passos = 3, fmt = mil, nome = 'Realizado' }) {
  const { y, svg: gy } = eixoY(0, max, passos, fmt);
  const { x, bw, svg: gx } = eixoX(rows);
  const larg = Math.min(34, bw * 0.56);
  const marcas = rows.map((r, i) => {
    const cx = x(i), y0 = y(0), yr = y(r.real), yp = y(r.proj), abaixo = r.real < r.proj;
    return `<g class="mes${abaixo ? ' is-abaixo' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(r.mes)}: ${esc(nome.toLowerCase())} ${esc(fmt(r.real))}, projetado ${esc(fmt(r.proj))}">
      <rect class="hit" x="${cx - bw / 2}" y="${M.t}" width="${bw}" height="${ih}"/>
      <rect class="barra" x="${cx - larg / 2}" y="${yr}" width="${larg}" height="${y0 - yr}" rx="4" style="--d:${i * 45}ms"/>
      ${abaixo ? `<rect class="gap" x="${cx - larg / 2}" y="${yp}" width="${larg}" height="${yr - yp - 2}" rx="3"/>` : ''}
      <line class="proj" x1="${cx - larg / 2 - 5}" x2="${cx + larg / 2 + 5}" y1="${yp}" y2="${yp}"/>
    </g>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(nome)} por mês, comparado ao projetado">
    <defs><pattern id="hachura" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" class="hachura"/></pattern></defs>
    ${gy}${gx}${marcas}</svg>`;
}

// Linha: realizado (linha + pontos) × projetado (tracejado), com referência opcional
function linha(rows, { min, max, passos = 4, fmt, ref, refRotulo, chaveReal = 'real', chaveProj = 'proj', degrau = false, nome = 'Realizado' }) {
  const { y, svg: gy } = eixoY(min, max, passos, fmt);
  const { x, bw, svg: gx } = eixoX(rows);
  const caminho = (k) => rows.map((r, i) => {
    const px = x(i), py = y(r[k]);
    if (i === 0) return `M${px} ${py}`;
    return degrau ? `H${px - bw / 2}V${py}H${px}` : `L${px} ${py}`;
  }).join('');
  const refSvg = ref != null ? `<g class="ref"><line x1="${M.l}" x2="${W - M.r}" y1="${y(ref)}" y2="${y(ref)}"/><text x="${W - M.r}" y="${y(ref) - 7}" text-anchor="end">${esc(refRotulo)}</text></g>` : '';
  const pontos = rows.map((r, i) => {
    const abaixo = r[chaveReal] < (ref != null ? ref : r[chaveProj]);
    return `<g class="mes${abaixo ? ' is-abaixo' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(r.mes)}: ${esc(fmt(r[chaveReal]))}">
      <rect class="hit" x="${x(i) - bw / 2}" y="${M.t}" width="${bw}" height="${ih}"/>
      <circle class="ponto" cx="${x(i)}" cy="${y(r[chaveReal])}" r="${abaixo ? 6 : 5}" style="--d:${i * 45}ms"/>
    </g>`;
  }).join('');
  const projSvg = chaveProj && rows[0][chaveProj] != null && ref == null ? `<path class="linha-proj" d="${caminho(chaveProj)}"/>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(nome)} por mês">${gy}${gx}${refSvg}${projSvg}<path class="linha-real" d="${caminho(chaveReal)}" pathLength="1"/>${pontos}</svg>`;
}

// Cronograma do plano de ação (6.6)
function cronograma() {
  const lw = 300, cw = (W - lw - 18) / 12, rh = 30, h = 34 + PLANO.length * rh + 8;
  const cab = MESES.map((m, i) => `<text class="eixo-x" x="${lw + cw * i + cw / 2}" y="20" text-anchor="middle">${m}</text>`).join('');
  const linhas = PLANO.map((p, r) => {
    const y = 34 + r * rh;
    const blocos = [];
    let ini = null;
    for (let m = 1; m <= 13; m++) {
      const tem = p.meses.includes(m);
      if (tem && ini === null) ini = m;
      if (!tem && ini !== null) { blocos.push([ini, m - 1]); ini = null; }
    }
    const marcas = blocos.map(([a, b], k) => (a === b
      ? `<circle class="crono-ponto" cx="${lw + cw * (a - 1) + cw / 2}" cy="${y + rh / 2}" r="6" style="--d:${(r * 3 + k) * 30}ms"/>`
      : `<rect class="crono-barra" x="${lw + cw * (a - 1) + 4}" y="${y + rh / 2 - 6}" width="${cw * (b - a + 1) - 8}" height="12" rx="6" style="--d:${(r * 3 + k) * 30}ms"/>`)).join('');
    return `<g class="crono-linha"><line class="grade" x1="0" x2="${W - 18}" y1="${y + rh}" y2="${y + rh}"/>
      <text class="crono-grupo" x="0" y="${y + rh / 2 - 2}">${esc(p.grupo)}</text>
      <text class="crono-acao" x="0" y="${y + rh / 2 + 11}">${esc(p.acao)}</text>${marcas}</g>`;
  }).join('');
  const faixas = MESES.map((_, i) => (i % 2 ? '' : `<rect class="crono-faixa" x="${lw + cw * i}" y="28" width="${cw}" height="${PLANO.length * rh + 8}"/>`)).join('');
  return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="Cronograma do plano de ação em 2027">${faixas}${cab}${linhas}</svg>`;
}

// ---------- indicadores ----------
const engaj = (r) => (r.intReal / r.real) * 100;
const INDICADORES = [
  {
    id: 'vendas', aba: 'Vendas',
    titulo: 'Unidades vendidas por mês',
    legenda: [['barra', 'Realizado'], ['proj', 'Projetado'], ['gap', 'Stand by (abaixo do projetado)']],
    kpis: () => {
      const total = soma(VENDAS, 'real'), meta = soma(VENDAS, 'proj'), sem = soma(VENDAS.slice(0, 6), 'real');
      const sb = VENDAS.filter((r) => r.real < r.proj);
      return [
        [nf.format(total), `unidades no ano, ${n1((total / meta) * 100)}% da meta de ${nf.format(meta)}`],
        [nf.format(sem), `no 1º semestre, ${n1((sem / 120000) * 100)}% da meta de 120.000 até o 6º mês`],
        [nf.format(soma(sb, 'proj') - soma(sb, 'real')), `unidades em Stand by, em ${sb.length} de 12 meses`],
      ];
    },
    grafico: () => barras(VENDAS, { max: 36000, fmt: (v) => (v ? `${nf.format(v / 1000)} mil` : '0'), nome: 'Unidades vendidas' }),
    linhas: VENDAS,
    tip: (r) => [[nf.format(r.real), 'realizado'], [nf.format(r.proj), 'projetado'], [r.real < r.proj ? nf.format(r.proj - r.real) : 'meta batida', 'Stand by']],
    tabela: [['Mês', 'mes'], ['Projetado', (r) => nf.format(r.proj)], ['Realizado', (r) => nf.format(r.real)], ['Stand by', (r) => (r.real < r.proj ? nf.format(r.proj - r.real) : '-')], ['Ação corretiva', 'acao']],
  },
  {
    id: 'pdvs', aba: 'Pontos de venda',
    titulo: 'Pontos de venda ativos por mês',
    legenda: [['linha', 'Realizado'], ['tracejado', 'Projetado'], ['abaixo', 'Mês abaixo do projetado']],
    kpis: () => [
      [`${PDVS.at(-1).real} PDVs`, 'em dezembro, meta anual atingida'],
      [`${PDVS[5].real} PDVs`, 'em junho: a meta de 10 pontos foi batida no 6º mês'],
      [`${PDVS.filter((r) => r.real < r.proj).length} meses`, 'com 1 ponto em Stand by (assinaturas atrasadas)'],
    ],
    grafico: () => linha(PDVS, { min: 0, max: 16, passos: 4, fmt: (v) => nf.format(v), degrau: true, nome: 'Pontos de venda' }),
    linhas: PDVS,
    tip: (r) => [[`${r.real}`, 'realizados'], [`${r.proj}`, 'projetados'], [r.real < r.proj ? `${r.proj - r.real}` : 'meta batida', 'Stand by']],
    tabela: [['Mês', 'mes'], ['Projetados', 'proj'], ['Realizados', 'real'], ['Stand by', (r) => (r.real < r.proj ? r.proj - r.real : '-')], ['Ação corretiva', 'acao']],
  },
  {
    id: 'redes', aba: 'Redes sociais',
    titulo: 'Alcance mensal nas redes (pessoas)',
    legenda: [['barra', 'Alcance realizado'], ['proj', 'Projetado'], ['gap', 'Stand by']],
    kpis: () => {
      const media = REDES.reduce((a, r) => a + engaj(r), 0) / REDES.length;
      return [
        [mil(REDES.at(-1).real), `pessoas alcançadas em dezembro (${mil(REDES[0].real)} em janeiro)`],
        [`${n1(media)}%`, `de engajamento médio no ano; meta mínima de ${META_ENGAJAMENTO}%`],
        [`${REDES.filter((r) => Math.round(engaj(r) * 10) / 10 >= META_ENGAJAMENTO).length} de 12`, 'meses com engajamento na meta ou acima'],
      ];
    },
    grafico: () => barras(REDES, { max: 900000, fmt: (v) => (v ? `${nf.format(v / 1000)} mil` : '0'), nome: 'Alcance' }),
    linhas: REDES,
    tip: (r) => [[mil(r.real), 'alcance'], [nf.format(r.intReal), 'interações'], [`${n1(engaj(r))}%`, 'engajamento']],
    tabela: [['Mês', 'mes'], ['Alcance proj.', (r) => nf.format(r.proj)], ['Alcance real.', (r) => nf.format(r.real)], ['Interações real.', (r) => nf.format(r.intReal)], ['Engajamento', (r) => `${n1(engaj(r))}%`], ['Ação corretiva', 'acao']],
  },
  {
    id: 'avaliacoes', aba: 'Avaliações',
    titulo: 'Nota média dos consumidores (0 a 5)',
    legenda: [['linha', 'Nota realizada'], ['ref', 'Meta mínima 4,5'], ['abaixo', 'Mês abaixo da meta']],
    kpis: () => {
      const media = soma(AVALIACOES, 'real') / AVALIACOES.length;
      return [
        [n1(media), 'de nota média no ano, em 5: meta atingida'],
        [`${AVALIACOES.filter((r) => r.real >= 4.5).length} de 12`, 'meses com nota na meta ou acima'],
        [n1(Math.max(...AVALIACOES.map((r) => r.real))), 'melhor nota, em agosto e dezembro'],
      ];
    },
    grafico: () => linha(AVALIACOES, { min: 4, max: 5, passos: 4, fmt: (v) => n1(v), ref: 4.5, refRotulo: 'meta 4,5', nome: 'Nota média' }),
    linhas: AVALIACOES,
    tip: (r) => [[n1(r.real), 'nota'], [r.ponto, 'principal ponto citado']],
    tabela: [['Mês', 'mes'], ['Nota', (r) => n1(r.real)], ['Principal ponto citado', 'ponto'], ['Ação corretiva', 'acao']],
  },
  {
    id: 'marca', aba: 'Reconhecimento',
    titulo: 'Reconhecimento de marca no público-alvo (pesquisa trimestral)',
    legenda: [['barra', 'Realizado'], ['proj', 'Projetado'], ['gap', 'Stand by']],
    kpis: () => [
      [`${RECONHECIMENTO.at(-1).real}%`, 'de reconhecimento em dezembro'],
      [`${RECONHECIMENTO[1].real}%`, 'no 6º mês, para uma meta de 30% (2 p.p. em Stand by)'],
      [`${RECONHECIMENTO.filter((r) => r.real >= r.proj).length} de 4`, 'pesquisas no projetado ou acima'],
    ],
    grafico: () => barras(RECONHECIMENTO, { max: 50, passos: 5, fmt: (v) => `${v}%`, nome: 'Reconhecimento de marca' }),
    linhas: RECONHECIMENTO,
    tip: (r) => [[`${r.real}%`, 'realizado'], [`${r.proj}%`, 'projetado'], [r.real < r.proj ? `${r.proj - r.real} p.p.` : 'meta batida', 'Stand by']],
    tabela: [['Pesquisa', 'mes'], ['Projetado', (r) => `${r.proj}%`], ['Realizado', (r) => `${r.real}%`], ['Ação corretiva', 'acao']],
  },
  {
    id: 'plano', aba: 'Plano de ação',
    titulo: 'Quando cada ação dos 4 Ps acontece em 2027',
    legenda: [['crono', 'Ação contínua'], ['crono-ponto', 'Ação pontual']],
    kpis: () => [
      ['Semanal', 'acompanhamento de vendas, redes e avaliações, com análise mensal'],
      ['Mensal', 'pontos de venda e controle do plano dos 4 Ps'],
      ['Trimestral', 'pesquisa de reconhecimento de marca com o público-alvo'],
    ],
    grafico: () => cronograma(),
    linhas: null,
    tabela: [['Grupo', 'grupo'], ['Ação', 'acao'], ['Meses', (r) => r.meses.map((m) => MESES[m - 1]).join(', ')]],
    dadosTabela: PLANO,
  },
];

// ---------- montagem ----------
export function montarPainel(raiz, { reduzido = false } = {}) {
  if (!raiz) return;
  const abas = raiz.querySelector('.painel__tabs');
  const kpis = raiz.querySelector('.painel__kpis');
  const titulo = raiz.querySelector('.painel__titulo');
  const legenda = raiz.querySelector('.painel__legenda');
  const svgBox = raiz.querySelector('.painel__svg');
  const tip = raiz.querySelector('.painel__tip');
  const lado = raiz.querySelector('.painel__lado');
  const btnTabela = raiz.querySelector('.painel__tabela-btn');
  const tabela = raiz.querySelector('.painel__tabela');
  let atual = 0, visto = false;

  INDICADORES.forEach((ind, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.id = `aba-${ind.id}`; b.textContent = ind.aba;
    b.addEventListener('click', () => mostrar(i));
    abas.appendChild(b);
  });
  abas.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const n = (atual + (e.key === 'ArrowRight' ? 1 : -1) + INDICADORES.length) % INDICADORES.length;
    mostrar(n); abas.children[n].focus();
  });

  function ladoPadrao(ind) {
    if (ind.id === 'plano') {
      lado.innerHTML = `<p class="lado__rotulo">Regra do Stand by</p><ol class="lado__regra">
        <li>A cada trimestre, a equipe revisa todas as metas.</li>
        <li>Indicador abaixo do projetado: a diferença vai para o Stand by e a ação corretiva sai no mesmo mês.</li>
        <li>Dois meses seguidos abaixo: a estratégia correspondente é revista.</li></ol>`;
      return;
    }
    const abaixo = ind.linhas.filter((r) => (ind.id === 'avaliacoes' ? r.real < 4.5 : r.real < r.proj));
    lado.innerHTML = `<p class="lado__rotulo">Ações corretivas</p>
      <p class="lado__resumo">${abaixo.length} ${abaixo.length === 1 ? 'mês ficou' : 'meses ficaram'} abaixo do projetado. Passe o mouse ou toque num mês para ver o que a equipe fez.</p>
      <ul class="lado__lista">${abaixo.map((r) => `<li><b>${esc(r.mes)}</b>${esc(r.acao)}</li>`).join('')}</ul>`;
  }
  function ladoMes(ind, r) {
    const valores = ind.tip(r);
    lado.innerHTML = `<p class="lado__rotulo">${esc(r.mes)} de 2027</p>
      <dl class="lado__valores">${valores.map(([v, k]) => `<div><dd>${esc(v)}</dd><dt>${esc(k)}</dt></div>`).join('')}</dl>
      <p class="lado__acao"><span>Ação corretiva</span>${esc(r.acao)}</p>`;
  }

  function mostrar(i) {
    atual = i;
    const ind = INDICADORES[i];
    [...abas.children].forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    kpis.innerHTML = ind.kpis().map(([v, t]) => `<div class="kpi"><p class="kpi__v">${esc(v)}</p><p class="kpi__t">${esc(t)}</p></div>`).join('');
    titulo.textContent = ind.titulo;
    legenda.innerHTML = ind.legenda.map(([k, t]) => `<span class="leg leg--${k}"><i aria-hidden="true"></i>${esc(t)}</span>`).join('');
    svgBox.innerHTML = ind.grafico();
    svgBox.dataset.tipo = ind.id;
    raiz.classList.toggle('is-visto', visto);
    if (visto && !reduzido) { raiz.classList.remove('anima'); void raiz.offsetWidth; raiz.classList.add('anima'); }
    tip.hidden = true;
    ladoPadrao(ind);
    montarTabela(ind);
    if (!ind.linhas) return;
    svgBox.querySelectorAll('.mes').forEach((g) => {
      const r = ind.linhas[+g.dataset.i];
      const entrar = (e) => {
        svgBox.querySelectorAll('.mes.is-on').forEach((o) => o.classList.remove('is-on'));
        g.classList.add('is-on');
        ladoMes(ind, r);
        const valores = ind.tip(r);
        tip.innerHTML = `<p class="tip__mes">${esc(r.mes)}</p>${valores.slice(0, 2).map(([v, k]) => `<p><b>${esc(v)}</b> ${esc(k)}</p>`).join('')}`;
        tip.hidden = false;
        const box = svgBox.getBoundingClientRect(), gb = g.querySelector('.hit').getBoundingClientRect();
        const xPx = gb.left - box.left + gb.width / 2;
        tip.style.left = `${Math.min(Math.max(xPx, 70), box.width - 70)}px`;
        tip.style.top = `${e && e.type === 'pointermove' ? Math.max(e.clientY - box.top - 70, 0) : 10}px`;
      };
      g.addEventListener('pointermove', entrar);
      g.addEventListener('focus', entrar);
      g.addEventListener('click', entrar);
    });
    svgBox.onpointerleave = () => { tip.hidden = true; svgBox.querySelectorAll('.mes.is-on').forEach((o) => o.classList.remove('is-on')); ladoPadrao(ind); };
  }

  function montarTabela(ind) {
    const dados = ind.dadosTabela || ind.linhas;
    const val = (r, c) => (typeof c === 'function' ? c(r) : r[c]);
    tabela.innerHTML = `<table><caption>${esc(ind.titulo)}</caption><thead><tr>${ind.tabela.map(([t]) => `<th scope="col">${esc(t)}</th>`).join('')}</tr></thead>
      <tbody>${dados.map((r) => `<tr>${ind.tabela.map(([, c]) => `<td>${esc(val(r, c))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  btnTabela.addEventListener('click', () => {
    const abrir = tabela.hidden;
    tabela.hidden = !abrir;
    btnTabela.setAttribute('aria-expanded', String(abrir));
    btnTabela.textContent = abrir ? 'Esconder a tabela' : 'Ver os dados em tabela';
  });

  mostrar(0);
  // um único momento de entrada: o gráfico se desenha quando o painel aparece
  const io = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) {
      visto = true; io.disconnect();
      raiz.classList.add('is-visto');
      if (!reduzido) raiz.classList.add('anima');
    }
  }, { threshold: 0.3 });
  io.observe(raiz);
}
