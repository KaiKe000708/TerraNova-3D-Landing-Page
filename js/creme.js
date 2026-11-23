// =============================================================
//  Fundo "creme" da chamada final: um shader de ruído com dobras
//  (domain warping) que lembra iogurte escorrendo, nas cores da marca.
//  WebGL puro, meia resolução, só roda quando está na tela e
//  segue o mouse devagar. Com movimento reduzido, desenha um quadro só.
// =============================================================
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uT;
uniform vec2 uM;
uniform float uMob;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 1.7;
  vec2 m = (uM - 0.5) * 0.7;
  float t = uT;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.035)), fbm(p + vec2(5.2, 1.3) - t * 0.025));
  vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + m + t * 0.04), fbm(p + 3.2 * q + vec2(8.3, 2.8) - m));
  float f = fbm(p + 3.0 * r);

  vec3 campo = vec3(0.086, 0.161, 0.118);
  vec3 musgo = vec3(0.150, 0.250, 0.180);
  vec3 soro  = vec3(0.937, 0.906, 0.839);
  vec3 ouro  = vec3(0.812, 0.682, 0.455);

  vec3 col = mix(campo, musgo, smoothstep(0.25, 0.75, f));
  float creme = smoothstep(0.58, 0.95, f + 0.15 * length(q));
  col = mix(col, soro, creme * 0.55);
  float fio = smoothstep(0.018, 0.0, abs(f - 0.6)) * (0.5 + 0.5 * r.x);
  col += ouro * fio * 0.35;

  // máscara: forte atrás da garrafa (direita) no computador, mais baixa no celular
  float lado = mix(smoothstep(0.25, 0.85, uv.x), smoothstep(0.0, 0.7, 1.0 - uv.y) * 0.85, uMob);
  float bordas = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.7, uv.y) * smoothstep(1.0, 0.9, uv.x);
  float a = clamp(lado * bordas, 0.0, 1.0) * 0.9;
  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.04; // grão de filme
  gl_FragColor = vec4(col * a, a);
}`;

export function montarCreme(canvas, { reduzido = false } = {}) {
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) { canvas.remove(); return; }
  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes'), uT = gl.getUniformLocation(prog, 'uT');
  const uM = gl.getUniformLocation(prog, 'uM'), uMob = gl.getUniformLocation(prog, 'uMob');

  const ESCALA = 0.5; // meia resolução: o ruído é macio, ninguém nota e a GPU agradece
  function tamanho() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * ESCALA));
    canvas.height = Math.max(2, Math.round(r.height * ESCALA));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uMob, window.innerWidth < 900 ? 1 : 0);
  }
  tamanho();
  window.addEventListener('resize', () => { tamanho(); if (reduzido) desenhar(0); });

  const alvo = { x: 0.5, y: 0.5 }, m = { x: 0.5, y: 0.5 };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    alvo.x = (e.clientX - r.left) / r.width; alvo.y = 1 - (e.clientY - r.top) / r.height;
  });

  let rodando = false, t0 = performance.now(), ultimo = 0;
  function desenhar(t) {
    m.x += (alvo.x - m.x) * 0.04; m.y += (alvo.y - m.y) * 0.04;
    gl.uniform1f(uT, t);
    gl.uniform2f(uM, m.x, m.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function quadro(agora) {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    if (agora - ultimo < 1000 / 40) return; // 40 fps bastam para um fundo lento
    ultimo = agora;
    desenhar((agora - t0) / 1000);
  }
  if (reduzido) { desenhar(12); return; }
  new IntersectionObserver(([e]) => {
    const antes = rodando;
    rodando = e.isIntersecting;
    if (rodando && !antes) requestAnimationFrame(quadro);
  }, { rootMargin: '100px' }).observe(canvas);
}
