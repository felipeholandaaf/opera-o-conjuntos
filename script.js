// A campanha tem quatro missões. Cada desafio guarda enunciado, alternativas e explicação.
const missions = [
  {
    name: "União", symbol: "∪", title: "Reúna os elementos", story: "Lia encontrou cópias dos mesmos registros em dois servidores. Reúna tudo o que aparece em A ou em B para montar uma lista completa, sem duplicatas.",
    questions: [
      { a: [1, 2, 3], b: [3, 4], expression: "A ∪ B", choices: ["{ 1, 2, 3, 4 }", "{ 1, 2, 3, 3, 4 }", "{ 3 }", "{ 1, 2, 4 }"], correct: 0, explanation: "A união reúne todos os elementos dos dois conjuntos. O 3, que aparece nos dois, é contado uma vez." },
      { a: ["a", "b"], b: ["b", "c"], expression: "A ∪ B", choices: ["{ a, b, c }", "{ b }", "{ a, c }", "{ a, b, b, c }"], correct: 0, explanation: "A união reúne a, b e c. O elemento b aparece uma única vez." },
      { a: [2, 4, 6], b: [1, 2, 3], expression: "A ∪ B", choices: ["{ 1, 2, 3, 4, 6 }", "{ 2 }", "{ 1, 3, 4, 6 }", "{ 1, 2, 2, 3, 4, 6 }"], correct: 0, explanation: "Reunimos todos os elementos de A e B; o 2 compartilhado não se repete." }
    ]
  },
  {
    name: "Interseção", symbol: "∩", title: "Encontre o que coincide", story: "A equipe de Lia precisa identificar pessoas inscritas em dois projetos ao mesmo tempo. Selecione apenas os elementos que pertencem a A e também a B.",
    questions: [
      { a: [1, 2, 3], b: [3, 4], expression: "A ∩ B", choices: ["{ 3 }", "{ 1, 2, 3, 4 }", "{ 1, 2 }", "∅"], correct: 0, explanation: "Apenas o elemento 3 está nos dois conjuntos ao mesmo tempo." },
      { a: ["azul", "verde"], b: ["verde", "amarelo"], expression: "A ∩ B", choices: ["{ verde }", "{ azul, verde, amarelo }", "{ azul, amarelo }", "∅"], correct: 0, explanation: "Verde é o único elemento compartilhado por A e B." },
      { a: [2, 4, 6], b: [1, 3, 5], expression: "A ∩ B", choices: ["∅", "{ 1, 2, 3, 4, 5, 6 }", "{ 2, 4, 6 }", "{ 1, 3, 5 }"], correct: 0, explanation: "Não há elementos em comum, então a interseção é o conjunto vazio, ∅." }
    ]
  },
  {
    name: "Complemento", symbol: "ᶜ", title: "Recupere o que ficou de fora", story: "Parte dos registros ficou de fora da busca. Com o universo U definido pela equipe, Lia precisa listar os elementos de U que não pertencem a A.",
    questions: [
      { a: [1, 2], universe: [1, 2, 3, 4], expression: "Aᶜ em U", choices: ["{ 3, 4 }", "{ 1, 2 }", "{ 1, 2, 3, 4 }", "∅"], correct: 0, explanation: "O complemento de A em U contém os elementos de U que não estão em A: 3 e 4." },
      { a: ["a", "e", "i"], universe: ["a", "e", "i", "o", "u"], expression: "Aᶜ em U", choices: ["{ o, u }", "{ a, e, i }", "{ a, e, i, o, u }", "{ u }"], correct: 0, explanation: "No universo das vogais, as que não estão em A são o e u." },
      { a: [2, 4, 6], universe: [1, 2, 3, 4, 5, 6], expression: "Aᶜ em U", choices: ["{ 1, 3, 5 }", "{ 2, 4, 6 }", "{ 1, 2, 3, 4, 5, 6 }", "∅"], correct: 0, explanation: "Retirando 2, 4 e 6 de U, restam 1, 3 e 5." }
    ]
  },
  {
    name: "Subconjuntos", symbol: "⊆", title: "Verifique a relação", story: "Com os dados recuperados, Lia prepara o relatório final. Antes de liberá-lo, confirme se todo elemento de A também pertence a B; um único elemento de fora muda a conclusão.",
    questions: [
      { a: [1, 2], b: [1, 2, 3], expression: "A ⊆ B?", choices: ["Sim, A é subconjunto de B.", "Não, A não é subconjunto de B."], correct: 0, explanation: "Todo elemento de A (1 e 2) também pertence a B." },
      { a: [1, 4], b: [1, 2, 3], expression: "A ⊆ B?", choices: ["Não, A não é subconjunto de B.", "Sim, A é subconjunto de B."], correct: 0, explanation: "O 4 pertence a A, mas não pertence a B. Isso basta para A não ser subconjunto de B." },
      { a: [], b: ["x", "y"], expression: "∅ ⊆ B?", choices: ["Sim, o conjunto vazio é subconjunto de todo conjunto.", "Não, o conjunto vazio não é subconjunto."], correct: 0, explanation: "O conjunto vazio é subconjunto de qualquer conjunto, pois não há nele um elemento que viole a relação." }
    ]
  }
];

const questionsPerGame = 10;
let missionIndex = 0;
let questionIndex = 0;
let score = 0;
let answered = false;
let soundEnabled = true;
let runMissions = [];
const totalQuestions = questionsPerGame;

const welcomeScreen = document.querySelector("#inicio");
const gameScreen = document.querySelector("#game");
const answersElement = document.querySelector("#answers");
const feedbackElement = document.querySelector("#feedback");

function formatSet(values) {
  return values.length ? `{ ${values.join(", ")} }` : "∅";
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function prepareCampaign() {
  const shuffledPools = missions.map((mission) => shuffle(mission.questions));
  const selected = shuffledPools.map((questions) => questions.slice(0, 2));
  const extraQuestions = shuffle(shuffledPools.flatMap((questions, index) => questions.slice(2).map((question) => ({ index, question }))));
  extraQuestions.slice(0, questionsPerGame - selected.reduce((total, questions) => total + questions.length, 0))
    .forEach(({ index, question }) => selected[index].push(question));

  runMissions = missions.map((mission, index) => ({
    ...mission,
    questions: shuffle(selected[index]).map((question) => {
      const choices = shuffle(question.choices.map((text, index) => ({ text, correct: index === question.correct })));
      return { ...question, choices: choices.map((item) => item.text), correct: choices.findIndex((item) => item.correct) };
    })
  }));
}

function playFeedbackSound(isCorrect) {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = isCorrect ? "sine" : "triangle";
  oscillator.frequency.value = isCorrect ? 660 : 220;
  volume.gain.setValueAtTime(0.0001, audio.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
  oscillator.connect(volume);
  volume.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.23);
  oscillator.addEventListener("ended", () => audio.close());
}

function startGame() {
  missionIndex = 0;
  questionIndex = 0;
  score = 0;
  prepareCampaign();
  welcomeScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  document.querySelector("#sets-row").classList.remove("hidden");
  document.querySelector("#restart-button").textContent = "↺ Reiniciar campanha";
  document.querySelector("#question-prompt").innerHTML = 'Qual é o resultado de <span id="expression">A ∪ B</span>?';
  renderQuestion();
  document.querySelector("#game-title").focus();
}

function renderQuestion() {
  const mission = runMissions[missionIndex];
  const question = mission.questions[questionIndex];
  const overallNumber = missions.slice(0, missionIndex).reduce((total, item) => total + item.questions.length, 0) + questionIndex + 1;
  answered = false;
  document.querySelector("#mission-label").textContent = `MISSÃO ${String(missionIndex + 1).padStart(2, "0")} · ${mission.name.toLocaleUpperCase("pt-BR")}`;
  document.querySelector("#game-title").textContent = mission.title;
  document.querySelector("#score").textContent = score;
  document.querySelector("#question-number").textContent = String(overallNumber).padStart(2, "0");
  document.querySelector("#challenge-count").textContent = `${overallNumber} DE ${totalQuestions}`;
  document.querySelector("#progress-bar").style.width = `${(overallNumber / totalQuestions) * 100}%`;
  document.querySelector("#story-text").textContent = mission.story;
  document.querySelector("#question-prompt").innerHTML = `Qual é o resultado de <span id="expression">${question.expression}</span>?`;

  const hasTwoSets = Array.isArray(question.b);
  document.querySelector("#set-a-label").textContent = "CONJUNTO A";
  document.querySelector("#set-a").textContent = formatSet(question.a);
  document.querySelector("#set-b-card").classList.toggle("hidden", !hasTwoSets && !question.universe);
  document.querySelector("#set-b-label").textContent = question.universe ? "UNIVERSO U" : "CONJUNTO B";
  document.querySelector("#set-b").textContent = formatSet(question.universe || question.b || []);
  document.querySelector("#set-operator").textContent = question.universe ? "⊂" : mission.symbol;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  answersElement.replaceChildren();

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = `${String.fromCharCode(65 + index)}.  ${choice}`;
    button.addEventListener("click", () => checkAnswer(button, index, question));
    answersElement.append(button);
  });
}

function checkAnswer(selectedButton, selectedIndex, question) {
  if (answered) return;
  answered = true;
  const correct = selectedIndex === question.correct;
  playFeedbackSound(correct);
  [...answersElement.children].forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add("correct");
  });

  if (correct) {
    score += 10;
    document.querySelector("#score").textContent = score;
    feedbackElement.className = "feedback good";
    feedbackElement.textContent = `Correto! ${question.explanation}`;
  } else {
    selectedButton.classList.add("incorrect");
    feedbackElement.className = "feedback bad";
    feedbackElement.textContent = `Ainda não. ${question.explanation}`;
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "next-button";
  const isLastQuestion = missionIndex === runMissions.length - 1 && questionIndex === runMissions[missionIndex].questions.length - 1;
  nextButton.textContent = isLastQuestion ? "Ver resultado →" : "Continuar missão →";
  nextButton.addEventListener("click", advance);
  feedbackElement.append(" ", nextButton);
}

function advance() {
  questionIndex += 1;
  if (questionIndex >= runMissions[missionIndex].questions.length) {
    missionIndex += 1;
    questionIndex = 0;
  }
  if (missionIndex >= missions.length) {
    showResults();
    return;
  }
  renderQuestion();
}

function showResults() {
  const percentage = Math.round((score / (totalQuestions * 10)) * 100);
  document.querySelector("#game-title").textContent = "Campanha concluída";
  document.querySelector("#mission-label").textContent = "CENTRO DE COMANDO · RELATÓRIO FINAL";
  document.querySelector("#question-number").textContent = "✓";
  document.querySelector("#challenge-count").textContent = `${totalQuestions} DE ${totalQuestions}`;
  document.querySelector("#progress-bar").style.width = "100%";
  document.querySelector("#story-text").textContent = "Você percorreu todas as operações. Consulte seu resultado e, se quiser, refaça a campanha para praticar.";
  document.querySelector("#sets-row").classList.add("hidden");
  document.querySelector("#question-prompt").textContent = `${score} de ${totalQuestions * 10} pontos · ${percentage}% de aproveitamento`;
  answersElement.replaceChildren();
  feedbackElement.className = "feedback good";
  feedbackElement.textContent = percentage === 100 ? "Desempenho perfeito. Missão cumprida!" : percentage >= 70 ? "Bom trabalho! Continue praticando para dominar todas as operações." : "Campanha concluída. Revise as explicações e tente mais uma vez.";
  document.querySelector("#restart-button").textContent = "↺ Jogar novamente";
}

document.querySelector("#start-button").addEventListener("click", startGame);
document.querySelector("#restart-button").addEventListener("click", startGame);
document.querySelector("#sound-toggle").addEventListener("click", (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.textContent = soundEnabled ? "♫ Som ligado" : "♫ Som desligado";
  event.currentTarget.setAttribute("aria-pressed", String(soundEnabled));
});
