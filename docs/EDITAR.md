# TerraNova: guia de edição

Landing page de apresentação do Iogurte TerraNova (Planejamento de Marketing N2, agência NewBrand, Universidade de Uberaba, 2026).

A garrafa 3D é feita em código com Three.js. O formato foi medido nas fotos dos produtos, e os rótulos são as próprias artes das fotos, "desenroladas" do cilindro e salvas em `assets/labels/` (só a tinta, com transparência). Por cima entram o vidro com reflexos de estúdio, o iogurte por dentro, a espuma no gargalo e a tampa de cada versão. As bibliotecas e as fontes estão dentro da pasta, então o site funciona **sem internet** (bom para apresentar na sala).

## Como abrir no VSCode

O site usa módulos JavaScript, então **não abre com duplo clique** no `index.html`. É preciso um servidor local:

1. Abra a pasta `terranova-site` no VSCode (Arquivo → Abrir pasta).
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito no `index.html` → **Open with Live Server**.

Alternativa pelo terminal (com Node instalado): `npx serve .` e abra o endereço que aparecer.

## Tela de carregamento

Enquanto o 3D prepara, a silhueta da garrafa enche de iogurte com o progresso real (rótulos enviados à GPU um por um e sombreadores compilados antes de aparecer). No fim, a tampa fecha e o desenho vira a garrafa 3D no mesmo lugar. A silhueta vem de `js/perfil.js`, a mesma usada pelo 3D.

## Desempenho

A garrafa só é redesenhada quando algo muda (rolagem, troca de versão, mouse) e não é desenhada quando está fora da tela. Se a máquina estiver lenta, a resolução do 3D baixa sozinha.

## Receber os e-mails do cadastro

O formulário "Seja o primeiro a provar" envia e-mail e cidade pelo FormSubmit (gratuito, sem servidor). Os cadastros vão para o e-mail definido em `js/config.js`. Faça um cadastro de teste: na primeira vez o FormSubmit pode pedir para confirmar o endereço por e-mail. Enquanto o e-mail de exemplo estiver lá, o formulário funciona só em modo de demonstração.

O envio precisa de internet e funciona com o site aberto pelo Live Server ou publicado (Netlify, Vercel, GitHub Pages).

## Rótulo e tabela nutricional

Na seção "A linha", o botão "Rótulo e tabela" gira a garrafa 3D até o verso e mostra ingredientes, alérgicos e a tabela no modelo da Anvisa (RDC 429/2020 e IN 75/2020). Os valores ficam em `js/variants.js` (campo `nutri`, por 100 g) e são **estimados para o projeto**: confiram com um nutricionista se forem usar em embalagem real.

## Crédito de desenvolvimento

No rodapé, o nome do Kaike abre um cartão com o papel dele no projeto. Para mostrar LinkedIn, GitHub ou Instagram no cartão, preencha os links em `DESENVOLVEDOR`, dentro de `js/config.js`.

## Modo apresentação

Use **←** e **→** (ou Page Up / Page Down, como num passador de slides) para pular de seção em seção. Na seção "Linha", cada toque troca para a próxima versão do iogurte. O site foi testado em 1920×1080, 1440×900, 1366×768 (notebook/projetor) e no celular.

## Estrutura

```
terranova-site/
├── index.html          ← textos e seções da página
├── css/style.css       ← cores, fontes, layout (variáveis no topo, em :root)
├── js/
│   ├── variants.js     ← as 5 versões: nome, textos, cores, foto, tipo de garrafa
│   ├── perfil.js       ← silhueta das garrafas (medida nas fotos)
│   ├── bottle3d.js     ← a garrafa 3D (materiais, luz de estúdio, rótulos)
│   ├── main.js         ← rolagem, troca de versão, formulário, modo apresentação
│   └── vendor/         ← three.js, gsap, lenis (não precisa mexer)
└── assets/
    ├── img/            ← fotos (original, pro, light, kids, senior, newbrand)
    ├── labels/         ← artes dos rótulos aplicadas na garrafa 3D
    └── fonts/          ← Fraunces e Inter Tight
```

## O que dá para mudar facilmente

**Textos e cores de cada versão:** `js/variants.js`. `fundo` é a cor que a página assume quando aquela versão aparece, `liquido` é a cor do iogurte, `tampa` e `tampaMetal` definem a tampa, e `rotulo` aponta para a arte em `assets/labels/`.

**Trocar a arte de um rótulo:** substitua o arquivo em `assets/labels/` por outro com o mesmo nome. A imagem cobre a frente da garrafa (140° da volta); o topo da imagem fica no ombro da garrafa e a base perto do fundo. Use PNG ou WebP com fundo transparente.

**Fotos:** coloque os arquivos em `assets/img/` com o mesmo nome. Os prompts para gerar as fotos do processo estão em [`PROMPTS-IMAGENS.md`](PROMPTS-IMAGENS.md). Os espaços pontilhados da seção "Do pasto à garrafa" procuram `processo-1.jpg`, `processo-2.jpg` e `processo-3.jpg`. Enquanto o arquivo não existir, aparece o espaço vazio com a legenda.

**Posição da garrafa em cada seção:** cada `<section>` no `index.html` tem `data-bottle="x, y, escala, voltas, sombra, gôndola"`.
- `x` e `y` vão de -1 a 1 (−1 = esquerda/baixo, 1 = direita/cima; valores maiores que 1 tiram a garrafa da tela).
- `escala` 1 ≈ 74% da altura da tela.
- `voltas` é quantas voltas a garrafa já deu ao chegar ali (a rolagem gira a garrafa entre uma seção e outra).
- `sombra` 1 mostra a sombra embaixo da garrafa, 0 esconde.
- `gôndola` 1 mostra as cinco garrafas lado a lado na prateleira (seção "Cinco versões, uma prateleira"), 0 esconde.
- `data-bottle-m` é a mesma coisa para celular.

**Formato da garrafa:** `PERFIL` em `js/perfil.js`. Cada par é `[raio, altura]` em pixels da foto, de baixo para cima; a garrafa é "torneada" a partir dele. Há um perfil `vidro` (280 ml) e um `pet` (Kids, 200 ml).

**Cores gerais:** variáveis no topo de `css/style.css` (`--campo`, `--soro`, `--mel`...).

## Inspiração

Estrutura inspirada em eathungrytiger.com: tipografia em escala de cartaz, um canvas de cor única com um acento só, botões em pílula, divisores pontilhados e marca d'água botânica. A paleta trocou o ferrugem/dourado da Hungry Tiger pelo verde de pasto e o creme do iogurte, com a cor de cada versão da linha tomando a página quando ela aparece.

## Observação

Os textos sobre ingredientes, processo e benefícios foram escritos a partir do planejamento e dos rótulos. Confiram com o grupo antes de apresentar (por exemplo: lista exata de ingredientes, de onde vem o leite, se a garrafa é retornável).
