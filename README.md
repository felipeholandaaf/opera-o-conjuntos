# Operação Conjuntos: A Estação de Venn

Jogo de plataforma educativo para estudantes do ensino médio. Depois que a Tempestade do Ruído apaga o arquivo de uma estação de pesquisa, o engenheiro Ícaro volta aos corredores onde trabalhou para reunir Joana, Caio, Davi, Amara e a comandante Mae. Cada porta apresenta um desafio matemático e restaura um setor da estação.

## Como jogar

1. Abra `index.html` em um navegador. O jogo não precisa de instalação nem de servidor.
2. Leia a história e os controles na tela inicial e selecione **Iniciar missão**.
3. Mova Ícaro com **←/→** ou **A/D** e pule com **Espaço**, **↑** ou **W**. Em telas sensíveis ao toque, use os botões na parte inferior.
4. Em cada uma das cinco portas, responda com **1**, **2** ou **3**, ou clique na alternativa.
5. Recupere os fragmentos luminosos como objetivo opcional. Quedas levam você ao último ponto de retorno. Fragmentos recuperados revelam registros da antiga tripulação.
6. Depois de reativar as cinco portas, alcance o portal verde. Pressione **R** para reiniciar.

O botão **Som: ligado** permite silenciar ou reativar os sinais de acerto, erro e coleta. Uma resposta errada explica a tentativa sem tirar pontos.

## Conteúdo e interações

Cada partida apresenta cinco desafios, um para cada assunto abaixo. O jogo sorteia uma pergunta entre cinco preparadas por assunto, totalizando uma base de 25 perguntas.

| Assunto | O que a pergunta verifica |
|---|---|
| Conceito de conjunto | Leitura de elementos e símbolos de pertinência |
| União | Reunião dos elementos sem repetição |
| Interseção | Identificação dos elementos comuns |
| Complemento | Elementos do universo que não pertencem ao conjunto |
| Subconjuntos | Verificação de que todos os elementos de um conjunto estão em outro |

Uma resposta correta ativa a porta, ilumina plataformas novas e atualiza o ponto de retorno. A explicação após cada acerto reforça a regra usada.

## Arquivos

- `index.html`: estrutura, tela inicial, controles e desafios.
- `style.css` e `game-ui.css`: aparência, caixas de diálogo e controles para toque.
- `game.js`: perguntas, sorteio, movimento, colisões, som e progresso.
- `presentation/Apresentacao-Operacao-Conjuntos.pptx`: roteiro curto para apresentar o projeto.
- `Operacao-Conjuntos-jogo-v1.6.zip`: arquivos do jogo reunidos para publicar.
- `assets/crew/`: retratos ilustrados da tripulação.
- `Avaliacao-usabilidade-AV3.md`: ficha para registrar o teste com participantes.

## História e personagens

A Estação de Venn preserva descobertas de mundos distantes. A Tempestade do Ruído embaralhou os arquivos e separou a tripulação; o último sinal da comandante Mae guia a missão. Joana tenta manter os sistemas funcionando; Caio protege a coleção de sementes; Davi aprende a confiar na própria análise; Amara exige precisão; e Mae e Ícaro precisam conversar sobre uma decisão difícil tomada antes da tempestade. O percurso atravessa o átrio da escotilha, a estufa hidropônica, o laboratório de rotas, o arquivo biológico e o núcleo de comando. Janelas mostram o planeta ao fundo; painéis, luzes de serviço e equipamentos dão função a cada área. As passarelas metálicas são suspensas por travas magnéticas que voltam a funcionar quando Ícaro ativa as portas. As conversas mudam conforme a missão avança e os fragmentos revelam registros da tripulação. O protagonista Ícaro tem identidade e aparência fixas. Retratos vetoriais identificam as pessoas que falam; o diálogo pode ser avançado com o botão ou Enter. O botão **Diário** permite reler as mensagens da campanha. Cada conversa interrompe o movimento para que a cena seja lida.

## Publicação

O jogo abre localmente pelo `index.html`. Para cumprir o requisito de acesso público, os arquivos do jogo (`index.html`, `style.css`, `game-ui.css`, `game.js` e a pasta `assets/crew/`) precisam ser publicados juntos em um serviço como GitHub Pages. A publicação pública ainda não foi feita por este pacote. Depois de publicar, insira a URL nos slides antes de entregar.

## Roteiro para a apresentação

1. Público-alvo e problema de aprendizagem.
2. Enredo e objetivo da missão.
3. Como jogar e como a resposta muda o cenário.
4. Exemplos corretos de cada uma das cinco operações/conceitos.
5. Decisões técnicas, limites atuais e próxima etapa de teste com estudantes.

Não foram inventados resultados de testes com usuários. A avaliação de usabilidade deve ser feita com colegas ou estudantes, conforme a etapa AV3.
