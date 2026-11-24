# Guia de edição

Tudo o que dá para mudar no site sem mexer no 3D.

| O que mudar | Onde |
|---|---|
| E-mail que recebe os cadastros | `js/config.js` → `CONTATO.email` |
| Links do desenvolvedor (LinkedIn, GitHub, Instagram) | `js/config.js` → `DESENVOLVEDOR` |
| Textos, cores, fotos e valores nutricionais de cada versão | `js/variants.js` |
| Números do painel planejado × realizado | `js/dados2027.js` |
| Posição da garrafa em cada seção | atributo `data-bottle` de cada `<section>` no `index.html` |
| Formato da garrafa | `js/perfil.js` |
| Cores e fontes gerais | variáveis em `:root`, no topo de `css/style.css` |
| Fotos | `assets/img/`, trocando pelo mesmo nome de arquivo |
| Arte de um rótulo | `assets/labels/`, trocando pelo mesmo nome de arquivo |

## Versões (`js/variants.js`)

`fundo` é a cor que a página assume quando aquela versão aparece, `liquido` é a cor do iogurte, `tampa` e `tampaMetal` definem a tampa, e `rotulo` aponta para a arte em `assets/labels/`. O campo `nutri` guarda os valores por 100 g; a tabela da porção de 200 g e o %VD são calculados sozinhos.

## Rótulos (`assets/labels/`)

A imagem cobre a frente da garrafa (140° da volta); o topo fica no ombro da garrafa e a base perto do fundo. Use PNG ou WebP com fundo transparente.

## Posição da garrafa (`data-bottle`)

`data-bottle="x, y, escala, voltas, sombra, gôndola"`

- `x` e `y` vão de -1 a 1 (−1 = esquerda/baixo, 1 = direita/cima); valores maiores que 1 tiram a garrafa da tela.
- `escala` 1 ≈ 74% da altura da tela.
- `voltas` é quantas voltas a garrafa já deu ao chegar ali.
- `sombra` 1 mostra a sombra embaixo da garrafa, 0 esconde.
- `gôndola` 1 mostra as cinco garrafas na prateleira, 0 esconde.
- `data-bottle-m` é a mesma coisa para celular.

## Formato da garrafa (`js/perfil.js`)

Cada par é `[raio, altura]` em pixels da foto, de baixo para cima. Há um perfil `vidro` (280 ml) e um `pet` (Kids, 200 ml).

## Painel (`js/dados2027.js`)

Cada mês tem `proj` (projetado), `real` (realizado) e `acao` (ação corretiva). Os números-resumo, o Stand by e a tabela são recalculados a partir daí.

## Fotos

Os espaços da seção "Do pasto à garrafa" procuram `processo-1.jpg` a `processo-3.jpg`, e a campanha procura `campanha-*.jpg`, em `assets/img/`. Enquanto um arquivo não existir, aparece o espaço vazio com a legenda. Os prompts estão em [`PROMPTS-IMAGENS.md`](../PROMPTS-IMAGENS.md).

## Cadastro

Na primeira vez, o FormSubmit manda um e-mail pedindo para ativar o formulário. O envio funciona com o site publicado; bloqueadores de anúncio podem barrar.
