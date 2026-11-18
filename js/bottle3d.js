// =============================================================
//  Garrafa 3D fotorrealista (Three.js)
//
//  - A silhueta foi medida nas fotos dos produtos (pixels → cena).
//  - Os rótulos são as próprias artes das fotos, "desenroladas" do
//    cilindro (assets/labels/*.webp, tinta com transparência).
//  - Vidro: reflexos de estúdio (softboxes) + borda escura de Fresnel,
//    com o iogurte por dentro e o fundo da página aparecendo no gargalo.
// =============================================================
import * as THREE from 'three';

import { PERFIL, PX, ALTURA_PX } from './perfil.js';
import { tabelaNutricional, ROTULO } from './variants.js';

const ALTURA = ALTURA_PX * PX; // altura total da garrafa de vidro (com tampa)

// ---------- utilidades de perfil ----------
function suavizar(pts) {
  // interpolação cúbica monótona r(h) (sem "dobras"), amostrada a cada 4 px
  const base = pts.filter(([r, h]) => h <= 5);
  const P = pts.filter(([r, h]) => h >= 5);
  const n = P.length, h = P.map((p) => p[1]), r = P.map((p) => p[0]);
  const d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((r[i + 1] - r[i]) / (h[i + 1] - h[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
  const out = base.map(([a, b]) => new THREE.Vector2(a * PX, b * PX));
  for (let i = 0; i < n - 1; i++) {
    const dh = h[i + 1] - h[i];
    const passos = Math.max(1, Math.ceil(dh / 4));
    for (let k = i === 0 ? 1 : 0; k < passos; k++) {
      const t = k / passos, t2 = t * t, t3 = t2 * t;
      const v = (2 * t3 - 3 * t2 + 1) * r[i] + (t3 - 2 * t2 + t) * dh * m[i] + (-2 * t3 + 3 * t2) * r[i + 1] + (t3 - t2) * dh * m[i + 1];
      out.push(new THREE.Vector2(v * PX, (h[i] + dh * t) * PX));
    }
  }
  out.push(new THREE.Vector2(r[n - 1] * PX, h[n - 1] * PX));
  return out;
}
function raioEm(amostras, h) {
  for (let i = 1; i < amostras.length; i++) {
    const a = amostras[i - 1], b = amostras[i];
    if (a.y <= h && b.y >= h) return a.x + (b.x - a.x) * ((h - a.y) / (b.y - a.y || 1));
  }
  return amostras[amostras.length - 1].x;
}
function faixa(amostras, h0, h1, delta, n = 120) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const h = h0 + (h1 - h0) * (i / n);
    out.push(new THREE.Vector2(Math.max(raioEm(amostras, h) + delta, 0.001), h));
  }
  return out;
}

function geometrias(tipo) {
  const P = PERFIL[tipo];
  const casca = suavizar(P.casca);
  const g = {};
  g.casca = new THREE.LatheGeometry(casca, 160);
  g.cascaInterna = new THREE.LatheGeometry(casca.map((p) => new THREE.Vector2(Math.max(p.x - 7 * PX, 0.001), p.y)), 120);

  if (P.nivel) {
    const pts = faixa(casca, P.fundoLiquido * PX, P.nivel * PX, -9 * PX, 160);
    pts.unshift(new THREE.Vector2(0.001, P.fundoLiquido * PX));
    pts.push(new THREE.Vector2(0.001, P.nivel * PX));
    g.liquido = new THREE.LatheGeometry(pts, 120);
    g.espuma = new THREE.LatheGeometry(faixa(casca, (P.nivel - 26) * PX, (P.nivel + 1) * PX, -8.6 * PX, 6), 120, -Math.PI, Math.PI * 2);
    // fundo grosso de vidro (bloco translúcido abaixo do iogurte)
    const fb = faixa(casca, 2 * PX, P.fundoLiquido * PX, -1.5 * PX, 16);
    fb.unshift(new THREE.Vector2(0.001, 2 * PX));
    fb.push(new THREE.Vector2(0.001, P.fundoLiquido * PX));
    g.fundoVidro = new THREE.LatheGeometry(fb, 96);
  }

  g.rotulo = new THREE.LatheGeometry(faixa(casca, P.rotulo[0] * PX, P.rotulo[1] * PX, 1.6 * PX, 160), 220, -Math.PI, Math.PI * 2);

  const t = P.tampa;
  if (tipo === 'pet') {
    const cap = new THREE.CylinderGeometry(t.raio * PX, (t.raio + 2) * PX, (t.topo - t.base - 22) * PX, 144, 1);
    const pos = cap.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r > (t.raio - 4) * PX) {
        const a = Math.atan2(z, x);
        const k = 1 + 0.018 * Math.max(0, Math.cos(a * 72)) ** 0.6;
        pos.setX(i, x * k); pos.setZ(i, z * k);
      }
    }
    cap.computeVertexNormals();
    cap.translate(0, (t.base + 22 + (t.topo - t.base - 22) / 2) * PX, 0);
    const anel = new THREE.CylinderGeometry((t.raio + 3) * PX, (t.raio + 3) * PX, 16 * PX, 96, 1, true);
    anel.translate(0, (t.base + 8) * PX, 0);
    g.tampa = cap; g.lacre = anel;
  } else {
    const r = t.raio;
    const p = [[r - 6, t.base], [r, t.base + 6], [r, t.topo - 12], [r - 2, t.topo - 5], [r - 9, t.topo - 1], [r - 24, t.topo], [0, t.topo]];
    g.tampa = new THREE.LatheGeometry(p.map(([a, b]) => new THREE.Vector2(a * PX, b * PX)), 144);
  }
  const meio = ALTURA / 2;
  Object.values(g).forEach((geo) => geo.translate(0, -meio, 0));
  return g;
}

// ---------- materiais ----------
function materialReflexo(intensidade = 1, rugosidade = 0.07) {
  // vidro transparente: só os reflexos do estúdio são somados à imagem
  const m = new THREE.MeshPhysicalMaterial({
    color: 0x000000, roughness: rugosidade, metalness: 0,
    envMapIntensity: intensidade, specularIntensity: 0.8, transparent: true, depthWrite: false,
  });
  m.blending = THREE.CustomBlending;
  m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor;
  m.blendSrcAlpha = THREE.OneFactor; m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\n gl_FragColor.a = clamp(max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b), 0.0, 1.0);');
  };
  return m;
}
function materialBorda(cor = '#22312a', forca = 0.6) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uCor: { value: new THREE.Color(cor) }, uForca: { value: forca } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uCor; uniform float uForca; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4); gl_FragColor = vec4(uCor, clamp(f*uForca,0.0,0.8)); }`,
  });
}

// ---------- ambiente de estúdio (reflexos suaves) ----------
function gradienteSoftbox() {
  // caixa de luz com bordas que se dissolvem, como um difusor de verdade
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256;
  const g = cv.getContext('2d');
  const h = g.createLinearGradient(0, 0, 128, 0);
  h.addColorStop(0, 'rgba(255,255,255,0)'); h.addColorStop(0.5, 'rgba(255,255,255,1)'); h.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = h; g.fillRect(0, 0, 128, 256);
  g.globalCompositeOperation = 'destination-in';
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.2, 'rgba(0,0,0,1)'); v.addColorStop(0.8, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = v; g.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function estudio(renderer) {
  const cena = new THREE.Scene();
  cena.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#0b0c0a', side: THREE.BackSide })));
  const grad = gradienteSoftbox();
  const caixa = (w, h, x, y, z, cor, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(k), map: grad, transparent: true, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); cena.add(m);
  };
  caixa(3.0, 10, -6, 0.8, 3.6, '#fff4e6', 2.1);  // luz principal à esquerda, larga e suave
  caixa(1.2, 9, 5.6, 0.4, 2.2, '#f2f5ff', 0.9);  // preenchimento à direita
  caixa(7, 4, 0, 7.5, 1, '#ffffff', 0.45);        // teto
  caixa(4, 7, -2, 1, -6.5, '#e8f0e0', 0.35);      // recorte traseiro
  caixa(12, 4, 0, -6, 2, '#6b4122', 0.35);        // rebatimento quente da mesa
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(cena, 0.03).texture;
  pmrem.dispose();
  return tex;
}

// ---------- rótulos ----------
function carregarImagem(src) {
  return new Promise((ok, erro) => {
    const i = new Image(); i.decoding = 'async';
    i.onload = () => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()).then(() => ok(i));
    i.onerror = erro; i.src = src;
  });
}
const FRENTE = 140 / 360; // a arte da foto cobre 140° da garrafa
async function montarRotulo(v, renderer) {
  const img = await carregarImagem(v.rotulo);
  const W = 2048, larguraFrente = Math.round(W * FRENTE);
  const H = Math.round(img.height * (larguraFrente / img.width));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.drawImage(img, (W - larguraFrente) / 2, 0, larguraFrente, H);

  // verso no padrão brasileiro: à direita da costura ficam ingredientes e avisos,
  // à esquerda a tabela nutricional (quando a garrafa vira, os dois aparecem)
  const tinta = v.tintaVerso;
  const fs = Math.round(H * 0.0155);
  const quebrarTexto = (txt, x, y, larg, lh, peso = 400) => {
    g.font = `${peso} ${fs}px "Inter Tight"`;
    const palavras = txt.split(' '); let linha = '';
    for (const p of palavras) {
      const t = linha ? linha + ' ' + p : p;
      if (g.measureText(t).width > larg && linha) { g.fillText(linha, x, y); linha = p; y += lh; } else linha = t;
    }
    g.fillText(linha, x, y); return y + lh;
  };
  g.fillStyle = tinta; g.globalAlpha = 0.9; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const lh = fs * 1.32;
  const ax = W * 0.02, al = W * 0.15;
  let y = H * 0.2;
  g.font = `700 ${fs}px "Inter Tight"`; g.fillText(v.denominacao.toUpperCase(), ax, y); y += lh * 1.5;
  y = quebrarTexto(`INGREDIENTES: ${v.ingredientes.toUpperCase()}`, ax, y, al, lh, 500) + lh * 0.5;
  y = quebrarTexto(ROTULO.alergicos, ax, y, al, lh, 700);
  y = quebrarTexto(v.lactose, ax, y, al, lh, 700);
  y = quebrarTexto(ROTULO.gluten, ax, y, al, lh, 700) + lh * 0.5;
  y = quebrarTexto(ROTULO.conservacao, ax, y, al, lh) + lh * 0.3;
  y = quebrarTexto(ROTULO.validade, ax, y, al, lh) + lh * 0.3;
  y = quebrarTexto(ROTULO.fabricante, ax, y, al, lh) + lh * 0.6;
  // código de barras (EAN-13 ilustrativo)
  const bh = H * 0.06; let bx = ax;
  for (let i = 0; i < 46; i++) { const w = ((i * 7) % 3) + 2; g.fillRect(bx, y, w, bh); bx += w + ((i * 5) % 4) + 2; }
  g.font = `400 ${Math.round(fs * 0.9)}px "Inter Tight"`; g.fillText('7 891234 567890', ax, y + bh + lh);

  // tabela nutricional
  const t = tabelaNutricional(v);
  const tx = W * 0.785, tw = W * 0.2, rh = fs * 1.5;
  const linhas = t.rows.length + 4;
  let ty = H * 0.2;
  g.globalAlpha = 0.92; g.lineWidth = 2; g.strokeStyle = tinta;
  g.strokeRect(tx, ty - fs * 1.3, tw, rh * linhas + fs * 0.6);
  g.font = `700 ${fs}px "Inter Tight"`; g.fillText('INFORMAÇÃO NUTRICIONAL', tx + fs * 0.5, ty); ty += rh;
  g.font = `400 ${Math.round(fs * 0.9)}px "Inter Tight"`;
  g.fillText(`Porções por embalagem: ${t.porcoes}`, tx + fs * 0.5, ty); ty += rh * 0.85;
  g.fillText(`Porção: ${t.porcao}`, tx + fs * 0.5, ty); ty += rh * 0.6;
  g.fillRect(tx, ty, tw, 3); ty += rh * 0.85;
  const c1 = tx + tw * 0.7, c2 = tx + tw * 0.85, c3 = tx + tw - fs * 0.4;
  g.font = `700 ${Math.round(fs * 0.85)}px "Inter Tight"`; g.textAlign = 'right';
  g.fillText('100 g', c1, ty); g.fillText('200 g', c2, ty); g.fillText('%VD*', c3, ty);
  ty += rh * 0.3; g.fillRect(tx, ty, tw, 1.5); ty += rh * 0.75;
  g.font = `400 ${Math.round(fs * 0.85)}px "Inter Tight"`;
  t.rows.forEach((r) => {
    g.textAlign = 'left'; g.fillText(r.nome, tx + fs * (0.5 + r.recuo * 0.8), ty);
    g.textAlign = 'right'; g.fillText(r.cem, c1, ty); g.fillText(r.porcao, c2, ty); g.fillText(r.vd, c3, ty);
    ty += rh * 0.3; g.fillRect(tx, ty, tw, 1); ty += rh * 0.7;
  });
  g.textAlign = 'left'; g.font = `400 ${Math.round(fs * 0.75)}px "Inter Tight"`;
  g.fillText('*Percentual de valores diários fornecidos pela porção.', tx + fs * 0.5, ty);
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}
function texturaEspuma() {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 64;
  const g = cv.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.0)'); grad.addColorStop(0.55, 'rgba(255,252,245,0.35)'); grad.addColorStop(1, 'rgba(255,252,245,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 64);
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * 1024, y = 10 + Math.random() * 26, r = 1 + Math.random() * 3.4;
    g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(120,108,88,0.24)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 0.8; g.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
function texturaRadial(stops, w = 256, h = 64) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const grad = g.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
  stops.forEach(([o, c]) => grad.addColorStop(o, c));
  g.setTransform(1, 0, 0, h / w, 0, 0); g.fillStyle = grad; g.fillRect(0, 0, w, w);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const quadro = () => new Promise((r) => requestAnimationFrame(() => r()));

// ---------- cena ----------
export async function criarCena(canvas, variants, { reduzido = false, aoProgresso = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = estudio(renderer);
  scene.environmentIntensity = 1;

  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
  camera.position.set(0, 0.25, 15);
  camera.lookAt(0, 0, 0);

  const chave = new THREE.DirectionalLight('#fff2e2', 2.1); chave.position.set(-4, 5, 5); scene.add(chave);
  const preenchimento = new THREE.DirectionalLight('#e6eeff', 0.6); preenchimento.position.set(5, 1, 4); scene.add(preenchimento);
  const contra = new THREE.DirectionalLight('#ffffff', 1.2); contra.position.set(1, 3, -6); scene.add(contra);
  scene.add(new THREE.HemisphereLight('#fff7ea', '#3b2615', 0.5));

  try { await Promise.all([document.fonts.load('600 20px "Inter Tight"'), document.fonts.load('400 20px "Inter Tight"')]); } catch (e) { /* fontes do sistema */ }

  const geo = { vidro: geometrias('vidro'), pet: geometrias('pet') };
  aoProgresso(0.1);

  // rótulos: carrega, monta e já envia para a GPU um de cada vez (sem travar a tela)
  const rotulos = [];
  for (let i = 0; i < variants.length; i++) {
    const t = await montarRotulo(variants[i], renderer);
    renderer.initTexture(t);
    rotulos.push(t);
    aoProgresso(0.1 + 0.6 * ((i + 1) / variants.length));
    await quadro();
  }

  // materiais (reflexos mais contidos, como nas fotos)
  const mLiquido = new THREE.MeshPhysicalMaterial({ color: variants[0].liquido, roughness: 0.7, sheen: 0.45, sheenRoughness: 0.8, sheenColor: '#ffffff', envMapIntensity: 0.4 });
  mLiquido.emissive = new THREE.Color(variants[0].liquido).multiplyScalar(0.08);
  const mEspuma = new THREE.MeshStandardMaterial({ map: texturaEspuma(), transparent: true, roughness: 0.6, depthWrite: false });
  const mRotulo = new THREE.MeshPhysicalMaterial({ map: rotulos[0], transparent: true, roughness: 0.5, clearcoat: 0.08, clearcoatRoughness: 0.35, envMapIntensity: 0.35, depthWrite: false, alphaTest: 0.01 });
  const mReflexo = materialReflexo(1.1, 0.06);
  const mReflexoInterno = materialReflexo(0.28, 0.12); mReflexoInterno.side = THREE.BackSide;
  const mBorda = materialBorda('#1d2a23', 0.62);
  const mFundoVidro = new THREE.MeshPhysicalMaterial({ color: '#c9d6c4', roughness: 0.15, transparent: true, opacity: 0.32, envMapIntensity: 0.6, depthWrite: false });
  const mPet = new THREE.MeshPhysicalMaterial({ color: '#f2e2d4', roughness: 0.38, clearcoat: 0.45, clearcoatRoughness: 0.2, envMapIntensity: 0.55, sheen: 0.4, sheenColor: '#ffffff' });
  const mTampa = new THREE.MeshPhysicalMaterial({ color: variants[0].tampa, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 0.9 });
  const mLacre = new THREE.MeshPhysicalMaterial({ color: '#1f6b34', roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide });

  const garrafa = new THREE.Group();
  const meshes = {
    fundoVidro: new THREE.Mesh(geo.vidro.fundoVidro, mFundoVidro),
    liquido: new THREE.Mesh(geo.vidro.liquido, mLiquido),
    espuma: new THREE.Mesh(geo.vidro.espuma, mEspuma),
    pet: new THREE.Mesh(geo.pet.casca, mPet),
    rotulo: new THREE.Mesh(geo.vidro.rotulo, mRotulo),
    interno: new THREE.Mesh(geo.vidro.cascaInterna, mReflexoInterno),
    reflexo: new THREE.Mesh(geo.vidro.casca, mReflexo),
    borda: new THREE.Mesh(geo.vidro.casca, mBorda),
    tampa: new THREE.Mesh(geo.vidro.tampa, mTampa),
    lacre: new THREE.Mesh(geo.pet.lacre, mLacre),
    brilhoPet: new THREE.Mesh(geo.pet.casca, materialReflexo(0.4, 0.12)),
  };
  meshes.fundoVidro.renderOrder = 1; meshes.espuma.renderOrder = 1; meshes.rotulo.renderOrder = 2; meshes.interno.renderOrder = 3;
  meshes.reflexo.renderOrder = 4; meshes.borda.renderOrder = 5; meshes.brilhoPet.renderOrder = 4;
  Object.values(meshes).forEach((m) => garrafa.add(m));

  // sombra de contato e luz de estúdio atrás da garrafa (dentro do WebGL, sem custo no layout)
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.25), new THREE.MeshBasicMaterial({
    map: texturaRadial([[0, 'rgba(0,0,0,0.6)'], [0.35, 'rgba(0,0,0,0.3)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false,
  }));
  sombra.renderOrder = -1;
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: texturaRadial([[0, 'rgba(255,240,214,0.16)'], [0.45, 'rgba(255,240,214,0.06)'], [1, 'rgba(255,240,214,0)']], 256, 256), transparent: true, depthWrite: false,
  }));
  halo.renderOrder = -2; halo.position.z = -4; halo.scale.set(ALTURA * 1.9, ALTURA * 1.9, 1);

  const raiz = new THREE.Group();
  const giro = new THREE.Group();
  giro.add(garrafa); raiz.add(halo); raiz.add(giro); raiz.add(sombra); scene.add(raiz);

  const alvo = { x: 0, y: 0, s: 1, voltas: 0, sombra: 1, g: 0, mx: 0, my: 0 };
  const atual = { x: 0, y: 0, s: 1, voltas: 0, sombra: 1, g: 0, mx: 0, my: 0 };
  const extra = { spin: 0, s: 1, rise: 0, verso: 0 };
  const TAU = Math.PI * 2;
  let meiaAltura = 1, meiaLargura = 1, escalaBase = 1, idx = 0, tipoAtual = 'vidro';

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    meiaAltura = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    meiaLargura = meiaAltura * camera.aspect;
    escalaBase = (meiaAltura * 2 * 0.74) / ALTURA;
    sujo = true;
  }
  let sujo = true;
  resize();
  window.addEventListener('resize', resize);

  // veste uma garrafa (meshes + materiais) com a versão i
  function vestir(grupo, ms, mt, i) {
    const v = variants[i];
    const tipo = v.garrafa;
    const G = geo[tipo];
    const vidro = tipo === 'vidro';
    ['fundoVidro', 'liquido', 'espuma', 'interno', 'reflexo', 'borda'].forEach((k) => { ms[k].visible = vidro; });
    ['pet', 'lacre', 'brilhoPet'].forEach((k) => { ms[k].visible = !vidro; });
    ms.rotulo.geometry = G.rotulo; ms.tampa.geometry = G.tampa;
    mt.rotulo.map = rotulos[i]; mt.rotulo.needsUpdate = true;
    mt.tampa.color.set(v.tampa);
    mt.tampa.metalness = v.tampaMetal ? 1 : 0;
    mt.tampa.roughness = v.tampaMetal ? 0.36 : 0.32;
    mt.tampa.clearcoat = v.tampaMetal ? 0.1 : 0.7;
    mt.liquido.color.set(v.liquido); mt.liquido.emissive.set(v.liquido).multiplyScalar(0.08);
    mt.pet.color.set(v.liquido);
    grupo.scale.setScalar(PERFIL[tipo].escala);
    grupo.position.y = -(1 - PERFIL[tipo].escala) * ALTURA / 2;
  }
  const mats = { rotulo: mRotulo, tampa: mTampa, liquido: mLiquido, pet: mPet };
  function aplicarVersao(i) { tipoAtual = variants[i].garrafa; vestir(garrafa, meshes, mats, i); sujo = true; }

  // compila os shaders antes de mostrar (evita o "engasgo" na primeira troca)
  Object.values(meshes).forEach((m) => { m.visible = true; });
  try { await renderer.compileAsync(scene, camera); } catch (e) { renderer.compile(scene, camera); }
  aoProgresso(0.9);
  aplicarVersao(0);

  // gôndola: as cinco versões lado a lado (cópias que compartilham geometria e sombreadores)
  const gondola = new THREE.Group();
  gondola.visible = false;
  scene.add(gondola);
  const prateleira = variants.map((v, i) => {
    const g = new THREE.Group();
    const ms = {};
    for (const [k, m] of Object.entries(meshes)) { const c = new THREE.Mesh(m.geometry, m.material); c.renderOrder = m.renderOrder; ms[k] = c; g.add(c); }
    const mt = { rotulo: mRotulo.clone(), tampa: mTampa.clone(), liquido: mLiquido.clone(), pet: mPet.clone() };
    ms.rotulo.material = mt.rotulo; ms.tampa.material = mt.tampa; ms.liquido.material = mt.liquido; ms.pet.material = mt.pet;
    vestir(g, ms, mt, i);
    const pivo = new THREE.Group();
    const gir = new THREE.Group(); gir.add(g); pivo.add(gir);
    const sh = new THREE.Mesh(sombra.geometry, sombra.material.clone()); sh.renderOrder = -1;
    sh.position.set(0, -ALTURA / 2 - 0.02, -0.6); const e = 2.7 * PERFIL[v.garrafa].escala; sh.scale.set(e, e, 1);
    pivo.add(sh);
    gondola.add(pivo);
    return { pivo, gir };
  });

  renderer.render(scene, camera);
  await quadro();
  aoProgresso(1);

  // troca de versão: gira até o verso, troca a arte escondida e para SEMPRE de frente
  let pendente = 0, trocado = true;
  function setVersao(i) {
    if (i === idx) return;
    idx = i; pendente = i;
    if (reduzido || !window.gsap) { aplicarVersao(i); return; }
    const gs = window.gsap;
    gs.killTweensOf(extra);
    const destino = (Math.round(extra.spin / TAU) + 1) * TAU; // próxima volta completa = frente
    trocado = false;
    gs.to(extra, {
      spin: destino, duration: 1.35, ease: 'power3.inOut',
      onUpdate: () => { if (!trocado && extra.spin >= destino - Math.PI) { aplicarVersao(pendente); trocado = true; } },
      onComplete: () => { if (!trocado) aplicarVersao(pendente); trocado = true; extra.spin = 0; sujo = true; },
    });
    gs.timeline().to(extra, { s: 0.96, duration: 0.5, ease: 'power2.in' }).to(extra, { s: 1, duration: 0.85, ease: 'power3.out' });
  }

  function entrada() {
    if (reduzido || !window.gsap) return;
    window.gsap.fromTo(extra, { spin: -0.9, s: 0.985 }, { spin: 0, s: 1, duration: 2.4, ease: 'expo.out', onComplete: () => { extra.spin = 0; } });
  }

  // mostra o verso (tabela nutricional) girando a garrafa
  const ANG_VERSO = -(0.885 - 0.5) * TAU;
  function setVerso(ligado) {
    const alvoV = ligado ? ANG_VERSO : 0;
    if (Math.abs(extra.verso - alvoV) < 1e-3) return;
    if (reduzido || !window.gsap) { extra.verso = alvoV; sujo = true; return; }
    window.gsap.to(extra, { verso: alvoV, duration: 1.2, ease: 'power3.inOut', overwrite: 'auto' });
  }

  // gôndola: item em foco (mouse por cima) vem um pouco para frente
  let foco = -1;
  const focos = variants.map(() => 0);
  function setFoco(n) { foco = n; }

  // posições da gôndola (também usadas pelo HTML para alinhar os nomes)
  const BASE_GONDOLA = 0.7; // linha da prateleira, em fração da altura da tela
  function medidasGondola() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const sp = vw < 900 ? 0.185 : Math.min(0.15, 250 / vw);
    const hf = Math.min(0.34, (sp * vw) / (1.45 * (432 / 1272) * vh));
    return { sp, hf, base: BASE_GONDOLA, xs: variants.map((_, k) => 0.5 + (k - 2) * sp) };
  }
  const suave = (t) => { t = Math.min(Math.max(t, 0), 1); return t * t * (3 - 2 * t); };

  // qualidade adaptativa: se a máquina sofrer, reduz a resolução do 3D
  let somaDt = 0, nDt = 0, ajustado = false;
  const relogio = new THREE.Timer();
  let ativo = true, visivelAntes = true, ultimo = [];
  document.addEventListener('visibilitychange', () => { ativo = !document.hidden; });

  function frame() {
    requestAnimationFrame(frame);
    if (!ativo) return;
    relogio.update();
    const dt = Math.min(relogio.getDelta(), 0.1);
    const t = relogio.getElapsed();
    const k = 1 - Math.pow(0.0018, Math.min(dt, 0.05));
    for (const c of ['x', 'y', 's', 'voltas', 'sombra', 'g', 'mx', 'my']) atual[c] += (alvo[c] - atual[c]) * k;

    if (!ajustado && t > 3) {
      somaDt += dt; nDt++;
      if (nDt === 90) {
        ajustado = true;
        if (somaDt / nDt > 1 / 40 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); }
      }
    }

    const esc = Math.max(atual.s * extra.s, 0.0001) * escalaBase;
    const rotY = atual.voltas * TAU + extra.spin + extra.verso + atual.mx * 0.3;
    const estado = [atual.x, atual.y + extra.rise, esc, rotY, atual.my, atual.sombra, atual.g];

    // só desenha quando algo muda (e nunca fora da tela): a GPU descansa com a página parada
    const naGondola = atual.g > 0.01;
    const visivel = (Math.abs(atual.y) - 0.8 * atual.s < 1.05 && atual.s > 0.02) || naGondola;
    let mudou = sujo || naGondola; // na gôndola as garrafas "respiram": desenha sempre
    for (let i = 0; i < estado.length && !mudou; i++) if (Math.abs(estado[i] - ultimo[i]) > 1e-5) mudou = true;
    if (!mudou || (!visivel && !visivelAntes && !sujo)) return;
    ultimo = estado; visivelAntes = visivel; sujo = false;

    raiz.visible = atual.s > 0.02;
    raiz.position.set(atual.x * meiaLargura, (atual.y + extra.rise) * meiaAltura, 0);
    raiz.scale.setScalar(esc);
    giro.rotation.y = rotY;
    giro.rotation.x = atual.my * 0.05;
    giro.rotation.z = -atual.mx * 0.025;

    sombra.position.set(0, -ALTURA / 2 - 0.02, -0.6);
    const ls = 2.7 * PERFIL[tipoAtual].escala;
    sombra.scale.set(ls, ls, 1);
    sombra.material.opacity = atual.sombra * 0.9;
    halo.material.opacity = 0.35 + atual.sombra * 0.65;

    gondola.visible = naGondola;
    if (naGondola) {
      const m = medidasGondola();
      const escG = (m.hf * 2 * meiaAltura) / ALTURA;
      const baseY = (1 - 2 * m.base) * meiaAltura;
      prateleira.forEach(({ pivo, gir }, n) => {
        const e = suave(atual.g * 1.7 - n * 0.14);
        focos[n] += ((foco === n ? 1 : 0) - focos[n]) * Math.min(1, dt * 7);
        const f = focos[n];
        const resp = reduzido ? 0 : Math.sin(t * 1.15 + n * 1.3); // respiração suave, fora de fase
        pivo.visible = e > 0.001;
        const zf = f * 0.8;
        const total = (1 + f * 0.05) * (camera.position.z / (camera.position.z - zf));
        const altG = ALTURA * escG;
        pivo.position.set(
          (m.xs[n] - 0.5) * 2 * meiaLargura,
          baseY + altG / 2 - (1 - e) * 0.35 * meiaAltura + resp * 0.008 * altG + (altG / 2) * (total - 1) + f * 0.02 * altG,
          zf,
        );
        pivo.scale.setScalar(escG * Math.max(e, 0.001) * (1 + f * 0.05 + resp * 0.004));
        gir.rotation.y = (1 - e) * -1.4 + atual.mx * 0.22 * (1 - f) + (reduzido ? 0 : Math.sin(t * 0.55 + n * 2.1) * 0.09) * (1 - f);
        gir.rotation.x = atual.my * 0.04;
        gir.rotation.z = reduzido ? 0 : Math.sin(t * 0.8 + n * 1.7) * 0.012 * (1 - f);
      });
    }

    renderer.render(scene, camera);
  }
  const api = { alvo, setVersao, setVerso, setFoco, entrada, renderer, meshes, medidasGondola };
  frame();
  return api;
}
