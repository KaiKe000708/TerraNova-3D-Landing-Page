// =============================================================
//  Monitoramento e controle: cenário SIMULADO de 2027
//  (Planejamento de Marketing N2, seção 6, agência NewBrand).
//  Edite os números aqui: o painel "Planejado × realizado" se refaz sozinho.
// =============================================================

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// 6.1 Vendas (unidades)
export const VENDAS = [
  { mes: 'Jan', proj: 15000, real: 13800, acao: 'Reforçar degustações nos pontos de venda e ajustar o pedido inicial de reposição.' },
  { mes: 'Fev', proj: 17000, real: 17800, acao: 'Manter as ações e ampliar o estoque nos PDVs.' },
  { mes: 'Mar', proj: 19000, real: 17500, acao: 'Negociar melhor posição de gôndola e intensificar as publicações com influenciadores.' },
  { mes: 'Abr', proj: 21000, real: 21900, acao: 'Manter as ações atuais.' },
  { mes: 'Mai', proj: 23000, real: 21200, acao: 'Ação promocional nos PDVs e revisão da frequência de reposição por causa da validade curta.' },
  { mes: 'Jun', proj: 25000, real: 26400, acao: 'Manter as ações e avaliar o desempenho do 1º semestre.' },
  { mes: 'Jul', proj: 26000, real: 25100, acao: 'Lançar promoção de férias escolares focada na linha Kids.' },
  { mes: 'Ago', proj: 27000, real: 27700, acao: 'Manter as ações atuais.' },
  { mes: 'Set', proj: 28000, real: 26900, acao: 'Reforçar a divulgação digital e rever a distribuição nos PDVs com menor giro.' },
  { mes: 'Out', proj: 30000, real: 31200, acao: 'Manter as ações e aproveitar o Dia das Crianças para impulsionar a linha Kids.' },
  { mes: 'Nov', proj: 32000, real: 30800, acao: 'Negociar campanha conjunta com as redes parceiras para o fim de ano.' },
  { mes: 'Dez', proj: 32000, real: 33500, acao: 'Manter as ações e elaborar o planejamento do ano seguinte.' },
];

// 6.2 Pontos de venda
export const PDVS = [
  { mes: 'Jan', proj: 2, real: 2, acao: 'Manter as negociações em andamento.' },
  { mes: 'Fev', proj: 4, real: 3, acao: 'Antecipar a reunião com a rede que atrasou a assinatura.' },
  { mes: 'Mar', proj: 6, real: 6, acao: 'Manter as ações atuais.' },
  { mes: 'Abr', proj: 8, real: 7, acao: 'Oferecer degustação de abertura para fechar o ponto pendente.' },
  { mes: 'Mai', proj: 9, real: 9, acao: 'Manter as ações atuais.' },
  { mes: 'Jun', proj: 10, real: 10, acao: 'Meta do semestre atingida; avaliar o giro de cada ponto.' },
  { mes: 'Jul', proj: 10, real: 10, acao: 'Focar em aumentar o volume por ponto de venda.' },
  { mes: 'Ago', proj: 10, real: 10, acao: 'Manter as ações atuais.' },
  { mes: 'Set', proj: 11, real: 10, acao: 'Priorizar a negociação na nova cidade-polo.' },
  { mes: 'Out', proj: 12, real: 12, acao: 'Manter as ações atuais.' },
  { mes: 'Nov', proj: 13, real: 12, acao: 'Oferecer condição especial de fim de ano ao ponto pendente.' },
  { mes: 'Dez', proj: 14, real: 14, acao: 'Meta anual atingida; planejar a expansão do ano seguinte.' },
];

// 6.3 Redes sociais: alcance (pessoas) e interações
export const REDES = [
  { mes: 'Jan', proj: 100000, real: 92000, intProj: 5000, intReal: 4500, acao: 'Aumentar a frequência de postagens e contratar mais um influenciador.' },
  { mes: 'Fev', proj: 150000, real: 168000, intProj: 7500, intReal: 8600, acao: 'Manter as ações atuais.' },
  { mes: 'Mar', proj: 200000, real: 185000, intProj: 10000, intReal: 9100, acao: 'Investir em anúncios patrocinados e sorteios.' },
  { mes: 'Abr', proj: 260000, real: 275000, intProj: 13000, intReal: 14200, acao: 'Manter as ações atuais.' },
  { mes: 'Mai', proj: 320000, real: 295000, intProj: 16000, intReal: 14300, acao: 'Criar conteúdo de receitas com o iogurte e ação do Dia das Mães.' },
  { mes: 'Jun', proj: 400000, real: 425000, intProj: 20000, intReal: 22100, acao: 'Manter as ações atuais.' },
  { mes: 'Jul', proj: 450000, real: 445000, intProj: 22500, intReal: 22000, acao: 'Reforçar conteúdos da linha Kids nas férias escolares.' },
  { mes: 'Ago', proj: 500000, real: 520000, intProj: 25000, intReal: 26400, acao: 'Manter as ações atuais.' },
  { mes: 'Set', proj: 550000, real: 525000, intProj: 27500, intReal: 25100, acao: 'Renovar os influenciadores e testar novos formatos de vídeo.' },
  { mes: 'Out', proj: 620000, real: 650000, intProj: 31000, intReal: 33700, acao: 'Manter as ações e ampliar a campanha do Dia das Crianças.' },
  { mes: 'Nov', proj: 700000, real: 690000, intProj: 35000, intReal: 34200, acao: 'Reforçar os anúncios da campanha de fim de ano.' },
  { mes: 'Dez', proj: 800000, real: 840000, intProj: 40000, intReal: 43500, acao: 'Manter as ações e definir as metas digitais do ano seguinte.' },
];
export const META_ENGAJAMENTO = 5; // %

// 6.4 Avaliações (nota de 0 a 5)
export const AVALIACOES = [
  { mes: 'Jan', proj: 4.5, real: 4.3, ponto: 'Embalagem de vidro difícil de abrir', acao: 'Orientar o consumidor sobre a abertura e avaliar o lacre.' },
  { mes: 'Fev', proj: 4.5, real: 4.4, ponto: 'Elogios ao sabor', acao: 'Divulgar os depoimentos positivos nas redes.' },
  { mes: 'Mar', proj: 4.5, real: 4.2, ponto: 'Produto próximo do vencimento na gôndola', acao: 'Reforçar a reposição e o controle de validade nos PDVs.' },
  { mes: 'Abr', proj: 4.5, real: 4.5, ponto: 'Elogios à textura e aos poucos ingredientes', acao: 'Manter as ações atuais.' },
  { mes: 'Mai', proj: 4.5, real: 4.6, ponto: 'Elogios à linha proteica', acao: 'Ampliar a divulgação da linha proteica.' },
  { mes: 'Jun', proj: 4.5, real: 4.6, ponto: 'Pedido de mais sabores', acao: 'Levar a sugestão ao desenvolvimento de produto.' },
  { mes: 'Jul', proj: 4.5, real: 4.5, ponto: 'Elogios à linha Kids', acao: 'Manter as ações atuais.' },
  { mes: 'Ago', proj: 4.5, real: 4.7, ponto: 'Elogios à linha zero lactose', acao: 'Divulgar a linha em conteúdos de bem-estar.' },
  { mes: 'Set', proj: 4.5, real: 4.4, ponto: 'Reclamação de preço acima da concorrência', acao: 'Reforçar a comunicação dos diferenciais e testar combos promocionais.' },
  { mes: 'Out', proj: 4.5, real: 4.6, ponto: 'Elogios à embalagem', acao: 'Manter as ações atuais.' },
  { mes: 'Nov', proj: 4.5, real: 4.6, ponto: 'Dificuldade de encontrar o produto em alguns PDVs', acao: 'Revisar a distribuição e a reposição.' },
  { mes: 'Dez', proj: 4.5, real: 4.7, ponto: 'Elogios gerais à marca', acao: 'Manter as ações e usar os depoimentos na campanha do ano seguinte.' },
];

// 6.5 Reconhecimento de marca (% do público-alvo, pesquisa trimestral)
export const RECONHECIMENTO = [
  { mes: 'Mar', proj: 10, real: 9, acao: 'Intensificar outdoors e influenciadores nas cidades-polo.' },
  { mes: 'Jun', proj: 30, real: 28, acao: 'Reforçar as ações promocionais e as degustações nos PDVs.' },
  { mes: 'Set', proj: 35, real: 36, acao: 'Manter as ações atuais.' },
  { mes: 'Dez', proj: 40, real: 41, acao: 'Manter as ações e definir a meta do ano seguinte.' },
];

// 6.6 Controle do plano de ação: meses (1–12) em que cada ação acontece
export const PLANO = [
  { grupo: 'Produto', acao: 'Produção das 5 linhas e controle de qualidade', meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { grupo: 'Preço', acao: 'R$ 12,99 e comparação com concorrentes (trimestral)', meses: [1, 4, 7, 10] },
  { grupo: 'Praça', acao: 'Entrada nos primeiros PDVs (2 em jan., 4 em fev.)', meses: [1, 2] },
  { grupo: 'Praça', acao: 'Expansão para 6, 8 e 9 PDVs', meses: [3, 4, 5] },
  { grupo: 'Praça', acao: 'Consolidação dos 10 pontos de venda', meses: [6] },
  { grupo: 'Praça', acao: 'Ampliação para novas cidades-polo', meses: [9, 10, 11, 12] },
  { grupo: 'Promoção', acao: 'Mídias de lançamento (outdoors e influenciadores)', meses: [1, 2] },
  { grupo: 'Promoção', acao: 'Mídias de sustentação', meses: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { grupo: 'Promoção', acao: 'Mídias digitais (perfis nas redes)', meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { grupo: 'Promoção', acao: 'Ações sazonais (Mães, férias, Crianças, Natal)', meses: [5, 7, 10, 12] },
];
