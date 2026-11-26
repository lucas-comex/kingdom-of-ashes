# Kingdom of Ashes — 21.0 beta local
## Executar
A versão GitHub Pages permanece offline/visitante. Para testar contas locais em Node.js 22:
```sh
node server/local.cjs
```
Abra http://127.0.0.1:8787/account para registrar uma conta de desenvolvimento. O jogo fica em /preview/. Exporte um backup pelo painel Backup e envie pela página de conta. O servidor grava dados no diretório ~/.kingdom-of-ashes-dev, sem coletar pagamentos. Não exponha a porta à internet.
## Limites
- Senhas com scrypt, sal aleatório; cookie HttpOnly/SameSite Strict, sessão expira em 24h ou no reinício, limitação de tentativas, verificação de origem e isolamento por conta. HTTP apenas em loopback; produção requer HTTPS, banco durável, segredos, monitoramento, revisão de segurança, recuperação de conta, limites distribuídos e privacidade.
- Backup é arquivo fornecido pelo cliente, não progresso confiável de multiplayer. Ainda não há sincronização automática, importação de saves no jogo, combate autoritativo, chat, guildas, comércio ou antitrapaça.
- Quatro trajes cosméticos experimentais gratuitos por nível, aplicados como variações sobre o atlas atual, independentes das estatísticas. Não são skins pintadas definitivas. Não existe loja com dinheiro real.
- Antes de monetizar: arte definitiva, validação de jogabilidade, hospedagem, economia e autenticação autoritativas, direitos de uso, política de privacidade/termos, provedor de pagamentos e validação de webhooks, reembolsos e testes beta.
