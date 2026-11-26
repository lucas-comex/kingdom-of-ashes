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

## 16.1 — Criaturas e bestiário
- Lobos, javalis e ursos com sprites originais articulados, direção e animação de ataque/corrida, tamanhos distintos.
- Seis novas criaturas no mundo, atributos e recompensas próprias.
- Guardião e Rei Sepultado maiores, humanoides com renderizador iluminado; bestiário com progresso, vida, nível e XP após descoberta.
- Arte ainda experimental, sem alteração no mapa-base ou login; testes pendentes.

## 17.0 — Expansão do Reino (offline)
- 14 contratos encadeados, objetivos persistentes, recompensas de XP/ouro/itens e bloqueio de resgate duplicado.
- 12 equipamentos novos e receitas de forja, mercado de compra/venda, aprimoramento até +3 com bônus reais, capacete raro visível.
- 12 talentos distribuídos pelas 4 vocações, pontos a cada 2 níveis, efeitos de dano, defesa, crítico, alcance, velocidade e mana/cura.
- Descoberta de 10 cidades, viagem rápida por ouro, banco protegido da perda de ouro na morte.
- Migração aditiva dos saves, sem contas, multiplayer ou loja cosmética. Novos sistemas e regressões em validação; arte gráfica permanece experimental.

## 17.1 — Atlas original e desempenho
- Importador de atlas PNG 384×512 (16 quadros base, duas vistas por gênero, espelhamento e recortes de equipamentos), persistência local, prévia e integração com o herói.
- O arquivo artístico não está no GitHub: pode ser importado pelo menu. Os sprites são experimentais; penteados/tom de pele mantêm seus dados, mas o atlas ainda não oferece todas as variações. Sem oito vistas distintas ou ataques pintados completos.
- Redução da geração redundante de quadros parados; pré-aquecimento de caminhada; texturas de NPCs na resolução de destino e atualização menos frequente. Sem alegação de ganho medido de FPS.

## 17.1.1 — Vestes de camponês
- Roupa inicial neutra e desgastada para todas as vocações: tecido em bege apagado, calças terrosas, cinto simples de corda, sem capa ou ornamentos de classe gratuitos.
- Atlas importado recebe tratamento de desgaste e cor uma única vez; armaduras continuam recortadas separadamente, sem alterar inventário ou save.
- Teste confirma que a roupa base não depende da vocação. O atlas artístico ainda é importado manualmente, não incluído no servidor.

## 17.2 — Dark fantasy / original sprites by default
- Original generated character atlas bundled as WebP, 192×256 (6,294 bytes), auto-activated during scene preload. Full PNG remains optional. Male/female and equipment layers retained; NPCs use tinted versions of the same base; skeletons and animals retain their existing artwork. Four approximate views and incomplete customization/attack poses remain limitations.
- Ground palette, finer foliage and architecture texture contrast revised; static cached landscape retained. Corpses now retain the defeated creature's actual texture instead of geometric placeholders.
- Viewport fills available width with dynamically resized Phaser camera and updated pointer coordinates; compact dark HUD; loot minimum height and saved panel layout correction.
- Tests assert bundled raster activation and viewport fill, plus existing gameplay regressions. Real-device FPS and final appearance still need verification.

## 17.2.1 — Nitidez e legibilidade
- Oito quadros (parado e passo principal de cada vista masculina/feminina) no tamanho nativo de 96px, sobrepostos ao atlas compacto; os outros oito quadros mantêm a versão comprimida. Arquivo adicional de 6.846 bytes. Equipamentos continuam independentes.
- Nomes de NPCs mais próximos e menos poluição visual na praça. Diagnóstico informa quantidade de quadros nativos. Sem mudanças no save ou nas regras do jogo.

## 17.3 — The Visual Rebirth (primeiro pacote integrado)
- Arte original: cores de pele, cabelo e barba aplicadas por máscara de pixels preservando luminância, detalhes de cabelo longo/preso e aventais de profissão. Atlas e equipamentos continuam separados; ainda não são oito direções pintadas nem todos os estilos de cabelo têm silhueta independente.
- Nove ícones de equipamento derivados da arte original; miniatura viva do personagem no painel de equipamento; atributos em tooltip. Menos reconstruções de DOM e minimapa com coordenadas arredondadas.
- Transições de biomas e estradas por máscaras de borda reutilizáveis, variações de sombra, brilho de água animado e limitado a 80 trechos próximos, desligado em modo econômico.
- Fachadas distintas para ferreiro, padaria, herbalista e estalagem, com sinais próprios; telhas com microtextura. Colisões e interiores existentes mantidos.
- Pelagem texturizada nas criaturas, mantendo espécies e animações existentes; redução de quadros redundantes e frequência de atualização de guardas no modo econômico.
- Sem novas contas, loja, multiplayer ou mudanças no save. Arte final de mundo, oito vistas reais, animações pintadas completas e metas de FPS ainda pendentes. Testes adicionados para personalização, ícones e bordas de terreno.

## 17.4–17.5 — The Visual Rebirth: cenários, arquitetura e masmorras
- Novas texturas de pedras, margens e água; flores, cogumelos e rochas altas decorativas. Camadas existentes de árvores e biomas preservadas.
- Pisos e paredes distintos na cripta e nos esgotos, rachaduras, umidade, ossos, sarcófagos e entulho. Decoração junto a paredes bloqueadas, sem mudar colisão, saída ou layout.
- Forja com braseiro e bigorna; padaria com forno e pães; herbalista com prateleira; estalagem com barris. Móveis nos mesmos pontos já bloqueados; tapetes detalhados. Iluminação quente em interiores/entardecer, verde úmida em esgotos e quente sombria na cripta.
- Cache de materiais do terreno com halo por chunk para reduzir consultas repetidas; culling de cenário acompanha largura da câmera. Modo econômico omite flores/cogumelos.
- Testes de distinção das artes e presença dos pisos no navegador. Arte procedural rasterizada continua experimental, sem novas direções pintadas ou montanhas navegáveis; FPS real não medido. Nenhuma alteração em conta, multiplayer, economia ou saves.

## 17.6–17.8 — Criaturas, interface e desempenho
- Seis famílias de masmorra com sprites próprios (rato, ratazana, cobra, esqueleto, cavaleiro e rei), poses direcionais em cache; Rei Sepultado com coroa/capa, Guardião com acabamento distinto. Arte procedural rasterizada, não atlas pintado final.
- Filtros por categoria e ordenação por nome/raridade na mochila, comparação de bônus de aprimoramento, progresso visual no bestiário, resumo de saque e botão de recolher tudo fixo.
- Orçamento adaptativo de efeitos: após duas amostras abaixo de 38 FPS reduz frequência de animações/efeitos e desliga reflexos; após três acima de 53 FPS restaura. Modo econômico/qualidade baixa mantêm redução. Configuração desativável. Não altera passo de simulação, dano ou XP. Diagnóstico registra estado e quantidade de texturas.
- Testes de seis silhuetas/animações, cache e filtros; validação pendente. Sem metas de FPS comprovadas, arte de oito direções pintadas ou reconstrução integral concluída. Sem alterações de conta, rede ou salvamentos de personagem.

## 17.9 — Encaixe de equipamentos e poses de personagem
- Recorte automático das margens transparentes do atlas e encaixes independentes de gênero, frente/costas e ação. Arma vinculada à mão, escudo elevado ao bloquear, caminhada em seis passos com quatro quadros distintos, inclinação de torso e poses de combate a partir da arte raster. Laterais aproximadas por transformação, não novos desenhos de oito ângulos.
- Variações de cor estáveis por identidade de equipamento, sem mudar estatísticas. Avatar lateral acompanha peças equipadas. Cache reaproveitável de aldeões por aparência e de recortes dos itens.
- Fase de caminhada acompanha distância realmente percorrida, não velocidade nominal do relógio; velocidade e colisões mantidas. Testes novos de encaixe, caminhada, ataque, direção lateral e distinção entre equipamentos. Arte pintada final e desempenho no dispositivo do usuário não verificados.

## 18.0 — Combate e progressão
- 12 habilidades exclusivas (3 por vocação), nível mínimo, arma exigida, mana, recarga e maestria persistente por uso. Ataques usam a mesma rotina de dano, morte, XP e loot existente; proteção temporária, cura e lentidão, efeitos leves.
- Resistências/vulnerabilidades físicas, de fogo, gelo e natureza por espécie, aplicadas às habilidades ofensivas. O Rei Sepultado possui três fases de onda de cinzas; Guardião acelera ataques com pouca vida.
- Oito novos equipamentos de recompensa/loot, sem alterar os itens anteriores. Painel de magias e barra compacta clicável. Arte reutiliza atlas atual; não há multiplayer, conta ou monetização. Testes de regressão e de recarga/maestria; balanceamento e FPS reais pendentes.

## 19.0 — Fronteiras do Reino (primeiro pacote)
- 12 pontos de interesse com decoração, descoberta, XP e rotas; 24 inimigos adicionais, dos quais 12 elites; 8 novos baús com ouro crescente. Tudo dentro do mapa existente de 160×160.
- 12 novos contratos de campanha, totalizando 26; três facções com comissões repetíveis, dificuldade crescente e reputação; três profissões com cinco graus e recompensas únicas por grau.
- Novos painéis Exploração e Facções; estado persistente e migração de baús já abertos. Sem mudança de conta ou multiplayer. Novos continentes, masmorras independentes e montarias ainda não implementados. Testes pendentes.

## 19.1 — Masmorras e Aventuras
- Três novas masmorras independentes com plantas diferentes, entradas nas fronteiras, requisitos de nível 8/12/16, 15 inimigos (3 chefes), 3 recompensas únicas e repetição de chefes após espera.
- Identificação de área para inimigos, corpos, itens no chão e salvamento de posição; mapa local e iluminação temática. Reutiliza arte de paredes e criaturas existentes, com tamanhos e nomes próprios para chefes.
- Painel de masmorras e rotas até as entradas. Testes adicionados de conectividade das plantas, entrada/saída, isolamento e recompensa única. Validação e balanceamento pendentes. Sem novos continentes, montarias, login ou rede.

## 19.2 — Novas Terras e Montarias
- Mapa de 192×192, 44% mais células que 160×160. Mantém coordenadas antigas e limites das masmorras em 200+. Três cidades adicionais e 12 edifícios; Cordilheira de Gelo, Costa do Sal Negro e Floresta de Nortenhal usam materiais existentes. 18 inimigos e 6 baús adicionais.
- Três montarias adquiridas por ouro e nível nos estábulos: +18%, +28% e +38% de deslocamento exclusivamente fora de combate e interiores. Propriedade persistente; montaria ativa não persistida. Sprites procedurais em cache e cavaleiro sobreposto. Sem mudança em dano, XP ou ataque.
- Testes de compra única, bônus, bloqueio em combate, arte e dimensão de mapa. Balanceamento, aparência e FPS pendentes. Não são continentes separados; cadastro, rede e loja premium continuam ausentes.

- 19.2 validação: atualizar a expectativa de 45 para 57 portas acessíveis após acrescentar 12 edifícios; testar explicitamente as três novas rotas e as portas novas.

## 19.3 — Equipment Anchor Pass
- Posições de cabeça, mãos, tronco e pés revisadas sobre os 16 quadros originais. Ajuste ao pixel opaco do corpo, espelhamento e transformação lateral mantidos.
- Armas/escudos giram em torno do cabo/empunhadura do recorte, com ordem de profundidade por vista; mão sobre o cabo quando em primeiro plano. Armadura, calças e botas limitadas pela máscara alfa do corpo; botas separadas por pé. Capacete acompanha a cabeça. Sem alteração em inventário, atributos ou saves.
- Teste de contato dos pontos de ancoragem, máscara de roupas e presença da arma nas 16 poses, além das regressões. Quatro vistas aproximadas, não oito desenhos independentes; poses de combate ainda transformações da arte existente. Validação visual e desempenho no dispositivo pendentes.

## 19.4 — Polimento visual geral
- Impactos de combate com partículas limitadas (12 eventos, 240 ms), destaque de crítico e cor elemental, desligados em qualidade reduzida. Indicador de alvo na área de jogo e HUD, barras maiores de chefes e aviso de preparação de ataque.
- Menu compacto opcional e persistente, atalhos essenciais sempre visíveis, botões de saque acessíveis por teclado, contraste e feedback visual de equipamentos. Corrige minimapa dos esgotos e atualização de mapa por masmorra.
- Preserva atributos, combate, saves e conteúdo. Testes de menu e ciclo dos impactos; inspeção visual e FPS no dispositivo ainda pendentes. Nenhuma infraestrutura online adicionada.

## 19.5–21.0 — Beta local e fundação de lançamento
- 19.5: cópia anterior do save, recuperação de JSON inválido, exportação manual de backup e limites básicos de valores. Testes de recuperação; não é revisão integral de balanceamento.
- 20.0: servidor HTTP exclusivamente loopback de desenvolvimento, cadastro/login com scrypt, sessão HttpOnly, proteção de origem e backup isolado por conta; página local de conta. Não publicado e não multiplayer autoritativo.
- 21.0: quatro trajes gratuitos de teste por nível, seleção persistente, opção de ocultar/remover a skin sem alterar atributos. Variações do atlas existente; pagamentos e loja real desativados. Guia BETA-21.md e testes de autenticação, isolamento, backup e invariância de atributos. Publicação beta depende dos testes.

- 21.0 revisão: importação de backup JSON com validação de formato e posição, confirmação explícita e bloqueio do autosave durante a recarga; link de contas somente quando o servidor local responde. Teste de restauração em armazenamento simulado.
