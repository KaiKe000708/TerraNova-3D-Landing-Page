// =============================================================
//  Silhueta das garrafas, medida nas fotos dos produtos.
//  Usada pela garrafa 3D e pelo desenho da tela de carregamento.
// =============================================================
export const PX = 1 / 333; // 333 px da foto = 1 unidade da cena

// [raio, altura] em pixels da foto, de baixo para cima
export const PERFIL = {
  vidro: {
    casca: [[0, 0], [110, 1], [150, 5], [178, 22], [201, 42], [212, 62], [216, 92], [216, 760], [212, 812], [205, 862],
      [191, 912], [176, 962], [165, 1012], [158, 1062], [155, 1095], [153, 1118], [153, 1150], [156, 1160], [161, 1167], [162, 1184], [159, 1190]],
    nivel: 1080,          // topo do iogurte
    fundoLiquido: 38,     // fundo grosso de vidro
    rotulo: [7, 952],     // faixa do rótulo (y 1355 → 410 da foto)
    tampa: { base: 1188, topo: 1272, raio: 171 },
    escala: 1,
  },
  pet: {
    casca: [[0, 0], [170, 3], [205, 15], [216, 40], [218, 95], [218, 295], [211, 395], [218, 475], [218, 545], [210, 655],
      [218, 775], [218, 895], [211, 935], [192, 985], [165, 1010], [154, 1028], [154, 1034]],
    nivel: null,
    rotulo: [17, 985],
    tampa: { base: 1030, topo: 1165, raio: 150 },
    escala: 0.86,
  },
};
export const ALTURA_PX = 1272;
