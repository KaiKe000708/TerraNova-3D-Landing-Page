// =============================================================
//  As cinco versões da linha TerraNova.
//  Textos, cores, fotos e rótulos de cada versão ficam aqui:
//  o painel da seção "Linha" e a garrafa 3D leem destes dados.
// =============================================================

export const VARIANTS = [
  {
    id: 'original',
    curto: 'Natural',      // legenda curta (gôndola)
    nome: 'Original',
    versao: 'Iogurte natural',
    frase: 'O bem da terra no seu dia.',
    descricao: 'O carro-chefe da linha. Leite e fermento, sem sabor adicionado, para tomar puro, com fruta ou no café da manhã inteiro.',
    beneficios: ['Puro', 'Natural', 'Saudável'],
    volume: '280 ml',
    foto: 'assets/img/original.jpg',
    rotulo: 'assets/labels/label_original.webp',
    denominacao: 'Iogurte natural integral',
    ingredientes: 'Leite integral pasteurizado e fermento lácteo.',
    lactose: 'CONTÉM LACTOSE.',
    porcoes: '1,4',
    nutri: { kcal: 61, carb: 4.7, acTot: 4.7, acAdd: 0, prot: 3.5, gord: 3.3, sat: 2.1, trans: 0, fibra: 0, sodio: 46 },
    fundo: '#16291e',       // cor da página quando esta versão aparece
    liquido: '#f1e8d6',     // cor do iogurte
    tampa: '#163a2b',
    tampaMetal: false,
    tintaVerso: '#1f4a2c',  // cor do texto impresso no verso
    garrafa: 'vidro',       // 'vidro' ou 'pet'
  },
  {
    id: 'pro',
    curto: '25 g de proteína',      // legenda curta (gôndola)
    nome: 'Pro',
    versao: 'Alto teor de proteína',
    frase: 'Para quem treina e quer comida de verdade.',
    descricao: '25 g de proteína por porção, sem pó e sem sabor artificial. Um pós-treino que cabe na bolsa da academia.',
    beneficios: ['25 g de proteína', 'Energia sustentável', 'Imunidade', '100% natural'],
    volume: '280 ml',
    foto: 'assets/img/pro.jpg',
    rotulo: 'assets/labels/label_pro.webp',
    denominacao: 'Iogurte desnatado com proteína do leite',
    ingredientes: 'Leite desnatado pasteurizado, proteína concentrada do leite e fermento lácteo.',
    lactose: 'CONTÉM LACTOSE.',
    porcoes: '1,4',
    nutri: { kcal: 74, carb: 4.2, acTot: 4.2, acAdd: 0, prot: 12.5, gord: 0.6, sat: 0.4, trans: 0, fibra: 0, sodio: 62 },
    fundo: '#101b30',
    liquido: '#f2ebdc',
    tampa: '#14213b',
    tampaMetal: false,
    tintaVerso: '#13284a',
    garrafa: 'vidro',
  },
  {
    id: 'light',
    curto: 'Sem açúcar adicionado, zero lactose',      // legenda curta (gôndola)
    nome: 'Light',
    versao: 'Sem adição de açúcar, zero lactose e zero gordura',
    frase: 'Cuidado e bem-estar em cada gole.',
    descricao: 'A cremosidade do Original para quem evita açúcar adicionado, lactose ou gordura. Continua com cálcio, proteína e probióticos.',
    beneficios: ['Sem adição de açúcar', 'Zero lactose', 'Zero gordura', 'Com probióticos'],
    volume: '280 ml',
    foto: 'assets/img/light.jpg',
    rotulo: 'assets/labels/label_light.webp',
    denominacao: 'Iogurte desnatado zero lactose',
    ingredientes: 'Leite desnatado pasteurizado, fermento lácteo e enzima lactase.',
    lactose: 'ZERO LACTOSE.',
    porcoes: '1,4',
    nutri: { kcal: 37, carb: 4.8, acTot: 4.8, acAdd: 0, prot: 4.2, gord: 0.2, sat: 0.1, trans: 0, fibra: 0, sodio: 52 },
    fundo: '#1b3149',
    liquido: '#f4efe4',
    tampa: '#4f80b0',
    tampaMetal: false,
    tintaVerso: '#2f5f8f',
    garrafa: 'vidro',
  },
  {
    id: 'kids',
    curto: 'Morango, 200 ml',      // legenda curta (gôndola)
    nome: 'Kids',
    versao: 'Sabor morango',
    frase: 'Crescendo com saúde!',
    descricao: 'Morango de verdade numa garrafinha de 200 ml que não quebra, do tamanho certo para a lancheira.',
    beneficios: ['Morango', '200 ml', 'Garrafa leve', 'Para a lancheira'],
    volume: '200 ml',
    foto: 'assets/img/kids.jpg',
    rotulo: 'assets/labels/label_kids.webp',
    denominacao: 'Iogurte integral com preparado de morango',
    ingredientes: 'Leite integral pasteurizado, preparado de morango (morango e açúcar) e fermento lácteo.',
    lactose: 'CONTÉM LACTOSE.',
    porcoes: '1',
    nutri: { kcal: 86, carb: 12.6, acTot: 11.8, acAdd: 6.5, prot: 3.1, gord: 2.6, sat: 1.7, trans: 0, fibra: 0.3, sodio: 44 },
    fundo: '#5e1c26',
    liquido: '#f2e2d4',
    tampa: '#1f6b34',
    tampaMetal: false,
    tintaVerso: '#1f4a2c',
    garrafa: 'pet',
  },
  {
    id: 'senior',
    curto: 'Vitaminas D, K2 e B12',      // legenda curta (gôndola)
    nome: 'Senior',
    versao: 'Com vitaminas, prebióticos e probióticos',
    frase: 'Bem-estar em todas as fases da vida.',
    descricao: 'Vitamina D para a imunidade, K2 para ossos mais fortes e B12 para memória e foco, no mesmo iogurte artesanal.',
    beneficios: ['Vit. D: imunidade', 'Vit. K2: ossos', 'Vit. B12: memória e foco'],
    volume: '280 ml',
    foto: 'assets/img/senior.jpg',
    rotulo: 'assets/labels/label_senior.webp',
    denominacao: 'Iogurte integral com fibra prebiótica e vitaminas',
    ingredientes: 'Leite integral pasteurizado, inulina (fibra prebiótica), fermento lácteo com probióticos e vitaminas D, K2 e B12.',
    lactose: 'CONTÉM LACTOSE.',
    porcoes: '1,4',
    nutri: { kcal: 66, carb: 6.1, acTot: 4.6, acAdd: 0, prot: 3.6, gord: 3.2, sat: 2.0, trans: 0, fibra: 1.5, sodio: 47 },
    vitaminas: [['Vitamina D (µg)', 1.5, 15, 1], ['Vitamina K (µg)', 9, 120, 0], ['Vitamina B12 (µg)', 0.36, 2.4, 2]],
    fundo: '#33220f',
    liquido: '#f2e6d2',
    tampa: '#b47a44',
    tampaMetal: true,
    tintaVerso: '#1f4a2c',
    garrafa: 'vidro',
  },
];

// =============================================================
//  Rótulo no padrão brasileiro (RDC 429/2020 e IN 75/2020).
//  Valores nutricionais ESTIMADOS para o projeto acadêmico:
//  confira com um nutricionista antes de usar em embalagem real.
// =============================================================
export const ROTULO = {
  porcao: '200 g (1 copo)',
  alergicos: 'ALÉRGICOS: CONTÉM LEITE E DERIVADOS.',
  gluten: 'NÃO CONTÉM GLÚTEN.',
  conservacao: 'Conservar refrigerado entre 1 °C e 10 °C. Após aberto, manter na geladeira e consumir em até 2 dias.',
  validade: 'Validade: 21 dias a partir da fabricação. Lote e validade: ver tampa.',
  fabricante: 'Produzido por TerraNova Laticínios Artesanais, Uberaba (MG). Indústria Brasileira.',
};

// Valores diários de referência (IN 75/2020, Anexo II)
const VDR = { kcal: 2000, carb: 300, acAdd: 50, prot: 50, gord: 65, sat: 20, fibra: 25, sodio: 2000 };
const fmt = (n, casas = 1) => (n === 0 ? '0' : n.toFixed(casas).replace('.', ','));

export function tabelaNutricional(v) {
  const n = v.nutri, k = 2; // porção de 200 g = 2 × 100 g
  const linha = (nome, chave, un, casas = 1, recuo = 0) => {
    const a = n[chave], p = n[chave] * k;
    const vd = VDR[chave] ? `${Math.round((p / VDR[chave]) * 100)}` : '';
    const fx = (x) => (chave === 'kcal' || chave === 'sodio' ? Math.round(x).toString() : fmt(x, casas));
    return { nome: `${nome}${un ? ` (${un})` : ''}`, cem: fx(a), porcao: fx(p), vd, recuo };
  };
  const rows = [
    linha('Valor energético', 'kcal', 'kcal'),
    linha('Carboidratos', 'carb', 'g'),
    linha('Açúcares totais', 'acTot', 'g', 1, 1),
    linha('Açúcares adicionados', 'acAdd', 'g', 1, 1),
    linha('Proteínas', 'prot', 'g'),
    linha('Gorduras totais', 'gord', 'g'),
    linha('Gorduras saturadas', 'sat', 'g', 1, 1),
    linha('Gorduras trans', 'trans', 'g', 1, 1),
    linha('Fibras alimentares', 'fibra', 'g'),
    linha('Sódio', 'sodio', 'mg'),
  ];
  (v.vitaminas || []).forEach(([nome, cem, vdr, casas]) => {
    const p = cem * k;
    rows.push({ nome, cem: fmt(cem, casas), porcao: fmt(p, casas), vd: `${Math.round((p / vdr) * 100)}`, recuo: 0 });
  });
  return { porcoes: v.porcoes, porcao: ROTULO.porcao, rows };
}
