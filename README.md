# Operação Conjuntos

Jogo educativo de Matemática Discreta para estudantes do ensino médio. Feito com HTML, CSS e JavaScript, sem instalar pacotes.

## Abrir e jogar

1. Descompacte a pasta do jogo, se recebeu um arquivo ZIP.
2. Abra a pasta no VS Code: **Arquivo → Abrir Pasta...**.
3. No Explorador de Arquivos, dê dois cliques em `index.html` para abrir o jogo no navegador. Também pode clicar com o botão direito em `index.html` no VS Code e escolher **Mostrar no Explorador de Arquivos**.
4. Na tela inicial, abra **Como jogar e aprender** para ler o tutorial. Clique em **Iniciar campanha**.
5. Responda aos desafios, confira as explicações e use **Continuar missão**. O botão **Som ligado** pode ser usado para desligar os efeitos sonoros.

O jogo tem quatro operações (união, interseção, complemento e subconjuntos), um banco de 12 perguntas e sorteia 10 por partida, garantindo pelo menos duas de cada operação. A ordem das perguntas e das alternativas muda em cada partida.

## Arquivos

- `index.html`: conteúdo e estrutura da página.
- `styles.css`: apresentação visual e adaptação para telas menores.
- `script.js`: banco de perguntas, sorteio, respostas, feedback, som e pontuação.

## Para editar as perguntas

No início de `script.js`, cada operação tem uma lista de perguntas. Para acrescentar uma, copie um objeto da mesma operação e atualize os conjuntos, a expressão, as alternativas, o índice da resposta certa e a explicação. A campanha sorteia 10 questões, mantendo no mínimo duas de cada operação; ao aumentar o banco, revise também `questionsPerGame` se quiser mudar o tamanho da partida.

## Entrega e próximas etapas

O protótipo está pronto para demonstração local. A atividade também exige um acesso público ao jogo; o passo a passo para publicar no GitHub Pages está no arquivo `Como-publicar-GitHub-Pages.md`. Depois da publicação, o link precisa ser inserido nos slides antes do envio ao AVA. Os testes com alunos e o registro dos feedbacks pertencem à etapa AV3; use o formulário de teste incluído com os materiais de entrega.
