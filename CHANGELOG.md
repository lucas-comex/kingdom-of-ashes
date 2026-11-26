# Kingdom of Ashes — Registro de desenvolvimento

## 16.0.4 — Equipamento não é skin
- Equipamentos comuns podem ser retirados e recolocados sem jogar o item no chão.
- Coleção e equipamento ativo são estados separados, salvos e compatíveis com saves antigos.
- Trocar equipamento raro no mesmo slot guarda o comum; retirada da peça não deixa a camada fixa.
- Arcos e cajados não aparecem mais quando não há arma equipada.
- Testes de mudança real de pixels ao equipar/retirar capacete, armadura, escudo e arma.
- Validação pendente. Botas e anéis ainda não têm camadas visuais exclusivas; skins pagas permanecem futuras.

## 16.0.3 — Portal do reino e criador de personagens (experimental)
- Nova tela inicial responsiva, com ilustração original SVG do reino, título em serifas medievais e opções de acesso.
- Login/cadastro online são interfaces desativadas; nenhum dado de senha é coletado. O servidor de autenticação ainda não existe.
- Criação local: masculino/feminino, quatro vocações visuais, quatro penteados, quatro estilos de barba, cores livres de pele/cabelo/barba, prévia rotativa e opção de ocultar elmo.
- Arte original procedural em camadas, integrada ao protagonista em oito direções e animações básicas. A aparência é salva separadamente, não altera o save existente.
- A armadura equipada aparece no modelo; o controle de skin prepara a configuração para cosméticos futuros, sem loja nem itens pagos. Não existem skins compráveis nesta versão.
- As quatro vocações ainda compartilham mecânicas existentes. Arte final pintada, NPCs únicos, equipamentos individuais completos e autenticação real são pendentes.
- Testes de navegador adicionados; resultado pendente.

## 16.0.2 — Controle e nitidez do herói
- Reduz o crescimento da velocidade por nível de 4% para 0,5%, com teto de +40% (3,5 unidades/s); nível 12: 2,6375 unidades/s, nível 500: 3,5.
- Testes de velocidade nos níveis 1, 12, 100, 500 e 1000 e parada após soltar a tecla.
- Preparação do importador de sprites fantasycore de resolução original, com composição de camadas e redução Lanczos para 96×96.
- O atlas mini antigo permanece como alternativa enquanto a importação HD não tiver sido gerada e testada.
- Preserva saves e a versão estável. Testes e inspeção visual da revisão pendentes.

## 16.0.1 — Validação dos personagens (proposta)
- Base: 16.0, commit 53dbb150a24cecc3883cef3f2f99e21c8975cdc8.
- Mantém a animação de morte do herói nos dois quadros sem espada do atlas FLARE, sem recorrer ao personagem procedural inteiro.
- Adiciona testes Chromium dos quadros e direções disponíveis, das camadas de equipamento e da textura usada pelo personagem em execução.
- Validação 16.0.1: Browser quality gate aprovado nos runs 45756556179 e 45756566979.
- Não altera o jogo estável, os formatos de save ou a progressão.
- Pendente: animações genuínas de caminhada/ataque dos NPCs, revisão visual, integração de morte/conjuração/disparo no jogo e equipamento visual de tipos distintos. O atlas possui esses estados para o herói, mas nem todos estão acionados pelo gameplay.

## 16.0 — Personagens
- Recursos licenciados FLARE, oito direções, camadas de equipamento e animações do protagonista.
- Guardas e moradores com arte FLARE de postura.
- CI anterior: Browser quality gate aprovado no commit 53dbb150a24cecc3883cef3f2f99e21c8975cdc8; sem teste específico de todos os sprites até esta revisão.

## Próximas etapas — substituição gráfica
Escopo mais recente aprovado: 16.1 monstros e chefes; 16.2 arquitetura; 16.3 cenário; 16.4 interface. Consolidação e desempenho após as etapas gráficas. O ROADMAP-WORLD-ART.md conserva o planejamento histórico de expansão do mundo, cujas numerações divergem; não considerar as duas sequências equivalentes.

## 16.0.5 — Inventário e HUD compactos
- Espadas desenhadas na mão independentemente da vocação; calças e botas têm máscaras visuais separadas.
- Compras e loot entram na mochila; clique para equipar, clique no slot lateral para retirar.
- Sete slots laterais permanentes, barra inferior reduzida e ações de combate recolhíveis.
- Calças e botas iniciais gratuitas, concedidas uma vez na migração; novos itens de pernas no loot de esqueletos.
- Testes de camadas, mochila e painel lateral atualizados. Validação pendente.

## 16.0.6–16.0.8 — Pacote de evolução offline
- 16.0.6: renderizador original com anatomia proporcional, projeção em oito direções, luz e articulação, camadas independentes e supersampling; NPCs com perfis determinísticos por identidade e profissão.
- 16.0.7: arco, varinha, cajado e espada de treino, armas de alcance 5.25, mana por ataque mágico, bônus de afinidade de 15% e cura aprimorada do druida; migração de armas gratuitas uma vez por save.
- 16.0.8: painel lateral em formato de paperdoll, arraste de equipamentos comuns, ícones de armas e atributos da vocação, entrada offline sem formulário de conta.
- Limitações: arte procedural iluminada ainda experimental; não é um atlas artístico final. Sem autenticação, multiplayer, loja ou skins pagas. Testes pendentes.
