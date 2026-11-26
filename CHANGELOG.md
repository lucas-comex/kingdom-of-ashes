# Kingdom of Ashes — Registro de desenvolvimento

## 16.0.1 — Validação dos personagens (proposta)
- Base: 16.0, commit 53dbb150a24cecc3883cef3f2f99e21c8975cdc8.
- Mantém a animação de morte do herói nos dois quadros sem espada do atlas FLARE, sem recorrer ao personagem procedural inteiro.
- Adiciona testes Chromium dos quadros e direções disponíveis, das camadas de equipamento e da textura usada pelo personagem em execução.
- Validação destes novos testes: pendente no momento do commit.
- Não altera o jogo estável, os formatos de save ou a progressão.
- Pendente: animações genuínas de caminhada/ataque dos NPCs, revisão visual, integração de morte/conjuração/disparo no jogo e equipamento visual de tipos distintos. O atlas possui esses estados para o herói, mas nem todos estão acionados pelo gameplay.

## 16.0 — Personagens
- Recursos licenciados FLARE, oito direções, camadas de equipamento e animações do protagonista.
- Guardas e moradores com arte FLARE de postura.
- CI anterior: Browser quality gate aprovado no commit 53dbb150a24cecc3883cef3f2f99e21c8975cdc8; sem teste específico de todos os sprites até esta revisão.

## Próximas etapas — substituição gráfica
Escopo mais recente aprovado: 16.1 monstros e chefes; 16.2 arquitetura; 16.3 cenário; 16.4 interface. Consolidação e desempenho após as etapas gráficas. O ROADMAP-WORLD-ART.md conserva o planejamento histórico de expansão do mundo, cujas numerações divergem; não considerar as duas sequências equivalentes.
