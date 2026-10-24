// Operação Conjuntos: campanha de plataforma com cinco desafios sorteados.
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const toast = document.querySelector('#toast');
const position = document.querySelector('#position');
const dialog = document.querySelector('#dialog');
const quiz = document.querySelector('#quiz');
const journal = document.querySelector('#journal');
let transcript = [];
const keys = new Set();
const floorY = 400;
const worldWidth = 2560;
let camera = 0;
let started = false;
let won = false;
let activeGate = -1;
let soundEnabled = true;
let audioContext;
let frame = 0;
let currentCommsSector = -1;
let inDialogue = false;
let dialogueLines = [];
let dialogueIndex = 0;
let dialogueCallback = null;
const sectorNames = ['Átrio das Formas', 'Jardim da União', 'Câmara da Interseção', 'Arquivo do Complemento', 'Núcleo dos Subconjuntos'];
const crew = {
  icaro: { name: 'ÍCARO · ENGENHEIRO DE CAMPO', portrait: 'icaro' },
  mae: { name: 'MAE · COMANDANTE', portrait: 'mae' },
  joana: { name: 'JOANA · SISTEMAS', portrait: 'joana' },
  caio: { name: 'CAIO · BOTÂNICA', portrait: 'caio' },
  davi: { name: 'DAVI · PESQUISA', portrait: 'davi' },
  amara: { name: 'AMARA · ARQUIVO BIOLÓGICO', portrait: 'amara' }
};
const sectorConversations = [
  [
    {person:'mae',text:'Ícaro, me ouve? A tempestade derrubou os elevadores. Estou presa no núcleo, mas os sinais da equipe ainda aparecem.'},
    {person:'icaro',text:'Estou ouvindo. Joana está perto do átrio. Eu devia ter pedido evacuação quando o primeiro sensor falhou.'},
    {person:'mae',text:'Você pediu. Eu decidi esperar. Agora vamos tirar todo mundo daqui, uma tarefa de cada vez.'},
    {person:'joana',text:'Achei listas escritas à mão. Sem rede, sem tela, mas legíveis. As passarelas suspensas usam travas magnéticas; cada porta que reativarmos libera um trecho. Bem-vindo de volta, Ícaro.'},
    {person:'icaro',text:'Obrigado. Primeiro preciso saber o que pertence a cada lista. A porta está usando as chaves como etiqueta.'}
  ],
  [
    {person:'caio',text:'Cuidado com o piso molhado! A estufa perdeu a irrigação e estou salvando as sementes numa caixa.'},
    {person:'icaro',text:'Você está catalogando duas caixas ao mesmo tempo?'},
    {person:'caio',text:'Sim. Uma semente pode aparecer nas duas listas. No inventário geral, preciso de todas, mas sem contar a mesma duas vezes.'},
    {person:'joana',text:'O painel da porta pede justamente essa reunião. A união dos grupos A e B.'}
  ],
  [
    {person:'davi',text:'Eu comparei os mapas da tripulação com os sensores da nave e travei. Quase tudo está diferente.'},
    {person:'icaro',text:'Não precisa comparar tudo. Procure só os nomes que aparecem nas duas listas.'},
    {person:'davi',text:'O que os registros e os sensores têm em comum. Certo — isso é a interseção.'},
    {person:'caio',text:'Encontrei uma marca da Mae nas duas rotas. Ela passou por aqui.'}
  ],
  [
    {person:'amara',text:'O arquivo está misturando espécies catalogadas com amostras ainda não classificadas.'},
    {person:'icaro',text:'Se tomarmos a reserva como universo U, o que procuramos é o que está em U e não em A.'},
    {person:'amara',text:'Isso. Sem definir o universo, “o que está fora” não significa nada. Finalmente alguém respeita o contexto da coleção.'},
    {person:'davi',text:'A lista está limpa. O corredor para o núcleo abriu.'}
  ],
  [
    {person:'mae',text:'Ícaro. A última porta usa a lista da tripulação como conjunto A e todas as pessoas a bordo como B.'},
    {person:'icaro',text:'Então cada pessoa de A precisa aparecer em B. A está contido em B.'},
    {person:'mae',text:'Exato. E, antes que pergunte: eu devia ter evacuado mais cedo. Não vou pedir que você carregue essa decisão por mim.'},
    {person:'icaro',text:'Obrigada. Eu também preciso parar de transformar cada falha num julgamento sobre mim. Vamos abrir essa porta juntos.'},
    {person:'mae',text:'Juntos. E depois eu faço café para todo mundo. O da estufa não conta; Caio queimou a cafeteira.'}
  ]
];
const successConversations = [
  [{person:'joana',text:'Energia no átrio restaurada. As listas estão sincronizadas. Bom trabalho, Ícaro.'},{person:'icaro',text:'E desta vez conferimos as etiquetas antes de ligar tudo.'}],
  [{person:'caio',text:'A estufa voltou! As sementes repetidas ficaram registradas uma só vez. Nenhuma foi descartada.'},{person:'icaro',text:'Ótimo. Guarde uma caixa para a equipe quando chegarmos em casa.'}],
  [{person:'davi',text:'Interseção encontrada: a comandante passou mesmo pelo laboratório.'},{person:'icaro',text:'Você percebeu o padrão. Confie nessa leitura.'}],
  [{person:'amara',text:'O arquivo respeitou o universo da reserva. Agora sabemos exatamente quais registros faltavam.'},{person:'icaro',text:'E sabemos de onde veio a resposta. Isso importa.'}],
  [{person:'mae',text:'Núcleo aberto. Estou vendo vocês no corredor.'},{person:'icaro',text:'A equipe toda, Mae. Vamos nos encontrar no átrio.'}]
];
const introConversation = [
  {person:'mae',text:'Ícaro, sou eu. A Estação de Venn está à deriva, mas ninguém se feriu. A tempestade embaralhou o arquivo e isolou cada setor.'},
  {person:'icaro',text:'Estou a caminho. Ainda penso que devia ter percebido aquela oscilação antes.'},
  {person:'mae',text:'Você registrou o alerta. Eu escolhi esperar pela confirmação. Quando nos reunirmos, conversamos sobre isso sem o alarme tocando.'},
  {person:'icaro',text:'Combinado. Primeiro encontro Joana, depois recuperamos os registros e juntamos a tripulação.'}
];
const memoryLogs = [
  ['icaro','Rascunho de Ícaro: “O primeiro alerta oscilou por poucos segundos. Mae pediu mais dados antes de interromper a pesquisa.”'],
  ['joana','Joana anotou que ficou no átrio para manter o suporte de vida ativo enquanto os outros setores eram isolados.'],
  ['caio','Caio guardou sementes de três expedições. A coleção é o trabalho de anos de comunidades que confiaram a pesquisa à estação.'],
  ['davi','Davi registrou sua primeira descoberta independente: dois mapas diferentes ainda podem compartilhar uma rota.'],
  ['amara','Amara deixou instruções para não chamar de “ausente” nada sem definir antes o universo da coleção.'],
  ['mae','Mensagem não enviada de Mae: “Eu achei que esperar mais um minuto evitaria evacuar por engano.”'],
  ['icaro','Ícaro respondeu no diário: “Eu vi o alerta, mas ainda confundo confiar numa decisão com concordar com ela.”'],
  ['joana','Joana escreveu: “A equipe não precisa concordar sobre o passado para cuidar uns dos outros agora.”'],
  ['caio','Caio contou que levou a cafeteira para a estufa porque a equipe esquecia de fazer pausas. Ela sobreviveu à tempestade.'],
  ['davi','Davi fez uma lista dos nomes ouvidos no rádio. Nenhum estava sozinho durante o apagão.'],
  ['amara','Amara confirmou que os registros recuperados mantêm autoria e origem. Uma coleção também guarda o contexto de cada elemento.'],
  ['mae','Último registro: “Quando voltarmos, vou ouvir a equipe antes de pedir outra confirmação.”']
];

const player = {
  x: 72, y: floorY - 48, w: 30, h: 48, vx: 0, vy: 0,
  grounded: false, facing: 1, coyote: 0, jumpBuffer: 0, checkpoint: 72
};

// Cada porta abre um trecho novo. As plataformas verdes ficam sólidas após a resposta.
const platforms = [
  { x: 0, y: 400, w: 380, h: 100, kind: 'base' },
  { x: 460, y: 400, w: 310, h: 100, kind: 'base' },
  { x: 850, y: 400, w: 360, h: 100, kind: 'base' },
  { x: 1280, y: 400, w: 360, h: 100, kind: 'base' },
  { x: 1700, y: 400, w: 360, h: 100, kind: 'base' },
  { x: 2120, y: 400, w: 440, h: 100, kind: 'base' },
  { x: 190, y: 345, w: 135, h: 16, kind: 'a' },
  { x: 340, y: 292, w: 130, h: 16, kind: 'b' },
  { x: 570, y: 345, w: 135, h: 16, kind: 'a', requiresGate: 0 },
  { x: 720, y: 292, w: 130, h: 16, kind: 'b', requiresGate: 0 },
  { x: 900, y: 345, w: 135, h: 16, kind: 'a' },
  { x: 1080, y: 292, w: 140, h: 16, kind: 'b', requiresGate: 1 },
  { x: 1300, y: 345, w: 135, h: 16, kind: 'a' },
  { x: 1490, y: 292, w: 130, h: 16, kind: 'b', requiresGate: 2 },
  { x: 1750, y: 345, w: 135, h: 16, kind: 'a' },
  { x: 1930, y: 345, w: 135, h: 16, kind: 'a', requiresGate: 3 },
  { x: 2070, y: 292, w: 140, h: 16, kind: 'b', requiresGate: 3 },
  { x: 2140, y: 345, w: 135, h: 16, kind: 'a' },
  { x: 2350, y: 345, w: 135, h: 16, kind: 'a', requiresGate: 4 },
  { x: 2470, y: 292, w: 85, h: 16, kind: 'b', requiresGate: 4 }
];

// Ten prepared questions: two variants for each required learning objective.
const questionBank = [
  { topic: 'CONJUNTOS', title: 'O que representa {2, 4, 6}?', sets: 'Considere os números pares entre 1 e 7.', choices: ['Um conjunto com três elementos pares', 'Uma operação de união', 'Um único número'], answer: 0, why: 'As chaves agrupam os elementos que formam um conjunto.' },
  { topic: 'CONJUNTOS', title: 'Qual símbolo indica que 3 pertence a A?', sets: 'A = {1, 3, 5}', choices: ['3 ⊂ A', '3 ∈ A', 'A ∈ 3'], answer: 1, why: 'O símbolo ∈ significa “é elemento de”. O símbolo ⊂ relaciona conjuntos.' },
  { topic: 'UNIÃO', title: 'Qual é A ∪ B?', sets: 'A = {1, 2}   B = {2, 3}', choices: ['{2}', '{1, 2, 3}', '{1, 3}'], answer: 1, why: 'A união junta todos os elementos dos conjuntos e não repete o 2.' },
  { topic: 'UNIÃO', title: 'Qual é M ∪ N?', sets: 'M = {a, b, c}   N = {c, d}', choices: ['{a, b, c, d}', '{c}', '{a, b, d}'], answer: 0, why: 'Na união entram os elementos de M ou de N, incluindo os que aparecem nos dois.' },
  { topic: 'INTERSEÇÃO', title: 'Qual é A ∩ B?', sets: 'A = {1, 2, 3, 4}   B = {2, 4, 6}', choices: ['{1, 2, 3, 4, 6}', '{2, 4}', '{1, 3, 6}'], answer: 1, why: 'A interseção reúne somente os elementos que aparecem nos dois conjuntos.' },
  { topic: 'INTERSEÇÃO', title: 'Qual é X ∩ Y?', sets: 'X = {maçã, pera, uva}   Y = {pera, uva, kiwi}', choices: ['{pera, uva}', '{maçã, kiwi}', '{maçã, pera, uva, kiwi}'], answer: 0, why: 'Pera e uva são os elementos comuns a X e Y.' },
  { topic: 'COMPLEMENTO', title: 'Qual é o complementar de A em U?', sets: 'U = {1, 2, 3, 4, 5}   A = {2, 4}', choices: ['{2, 4}', '{1, 3, 5}', '{1, 2, 3, 4, 5}'], answer: 1, why: 'O complementar contém os elementos do universo U que não estão em A.' },
  { topic: 'COMPLEMENTO', title: 'Qual é Aᶜ em relação a U?', sets: 'U = {a, b, c, d}   A = {a, d}', choices: ['{b, c}', '{a, d}', '{a, b, c, d}'], answer: 0, why: 'Retirando de U os elementos de A, sobram b e c.' },
  { topic: 'SUBCONJUNTOS', title: 'A é subconjunto de B?', sets: 'A = {2, 4}   B = {1, 2, 3, 4, 5}', choices: ['Sim, todos os elementos de A estão em B', 'Não, porque A tem menos elementos', 'Não, porque B tem outros elementos'], answer: 0, why: 'A é subconjunto de B quando cada elemento de A também pertence a B.' },
  { topic: 'SUBCONJUNTOS', title: 'Qual conjunto é subconjunto de C?', sets: 'C = {azul, verde, amarelo}', choices: ['{azul, vermelho}', '{verde, amarelo}', '{azul, preto}'], answer: 1, why: 'Verde e amarelo pertencem a C; os outros grupos contêm cores que não estão em C.' },
  { topic: 'CONJUNTOS', title: 'Quantos elementos distintos há em A?', sets: 'A = {vermelho, azul, verde}', choices: ['2', '3', '4'], answer: 1, why: 'A lista contém três elementos distintos; cada cor é contada uma vez.' },
  { topic: 'CONJUNTOS', title: 'Se 4 ∈ B, qual afirmação é correta?', sets: 'B = {2, 4, 6}', choices: ['4 é elemento de B', '{4} é elemento de B', 'B é elemento de 4'], answer: 0, why: 'O símbolo ∈ indica que 4 é um elemento do conjunto B.' },
  { topic: 'CONJUNTOS', title: 'Qual conjunto é igual a A?', sets: 'A = {1, 2, 2, 3}', choices: ['{1, 2, 3}', '{1, 2, 2, 3, 3}', '{2, 3}'], answer: 0, why: 'Em conjuntos, elementos repetidos não criam novos elementos.' },
  { topic: 'UNIÃO', title: 'Qual é A ∪ B?', sets: 'A = {1, 3, 5}   B = {2, 3, 4}', choices: ['{1, 2, 3, 4, 5}', '{3}', '{1, 2, 4, 5}'], answer: 0, why: 'A união reúne todos os elementos de A e de B; o 3 aparece uma única vez.' },
  { topic: 'UNIÃO', title: 'Qual é M ∪ N?', sets: 'M = {a, b}   N = {c, d}', choices: ['{a, b, c, d}', '{a, c}', '{b, d}'], answer: 0, why: 'Como os conjuntos não têm elementos repetidos entre si, a união contém os quatro.' },
  { topic: 'UNIÃO', title: 'Qual coleção reúne as cores dos dois canteiros?', sets: 'P = {azul, verde}   Q = {verde, amarelo}', choices: ['{verde}', '{azul, verde, amarelo}', '{azul, amarelo}'], answer: 1, why: 'A união inclui todas as cores dos dois canteiros, sem repetir verde.' },
  { topic: 'INTERSEÇÃO', title: 'Qual é A ∩ B?', sets: 'A = {1, 3, 5, 7}   B = {2, 3, 6, 7}', choices: ['{3, 7}', '{1, 2, 3, 5, 6, 7}', '{2, 6}'], answer: 0, why: 'Somente 3 e 7 aparecem nos dois conjuntos.' },
  { topic: 'INTERSEÇÃO', title: 'Qual é X ∩ Y?', sets: 'X = {leste, oeste}   Y = {oeste, norte}', choices: ['{leste, norte}', '{oeste}', '{leste, oeste, norte}'], answer: 1, why: 'Oeste é a única direção presente em X e em Y.' },
  { topic: 'INTERSEÇÃO', title: 'Quais amostras estão nas duas caixas?', sets: 'A = {quartzo, mica, sal}   B = {mica, sal, ferro}', choices: ['{quartzo, ferro}', '{mica, sal}', '{quartzo, mica, sal, ferro}'], answer: 1, why: 'Mica e sal são as amostras comuns às duas caixas.' },
  { topic: 'COMPLEMENTO', title: 'Qual é o complementar de A em U?', sets: 'U = {0, 1, 2, 3, 4, 5}   A = {0, 2, 4}', choices: ['{1, 3, 5}', '{0, 2, 4}', '{0, 1, 2, 3, 4, 5}'], answer: 0, why: 'O complementar contém os elementos de U que não estão em A.' },
  { topic: 'COMPLEMENTO', title: 'Qual é Aᶜ em relação a U?', sets: 'U = {vermelho, azul, verde, amarelo}   A = {azul, amarelo}', choices: ['{vermelho, verde}', '{azul, amarelo}', '{vermelho, azul, verde, amarelo}'], answer: 0, why: 'Dentro do universo U, vermelho e verde não pertencem a A.' },
  { topic: 'COMPLEMENTO', title: 'Quais registros faltam em A?', sets: 'U = {r1, r2, r3, r4, r5}   A = {r1, r3}', choices: ['{r1, r3}', '{r2, r4, r5}', '{r1, r2, r3, r4, r5}'], answer: 1, why: 'Retirando r1 e r3 de U, restam r2, r4 e r5.' },
  { topic: 'SUBCONJUNTOS', title: 'A é subconjunto de B?', sets: 'A = {m, n}   B = {m, n, o}', choices: ['Sim', 'Não, porque B tem mais elementos', 'Não, porque m aparece nos dois'], answer: 0, why: 'Todo elemento de A também está em B; portanto A ⊆ B.' },
  { topic: 'SUBCONJUNTOS', title: 'P é subconjunto de Q?', sets: 'P = {1, 2, 5}   Q = {1, 2, 3, 4}', choices: ['Sim, 1 e 2 aparecem em Q', 'Não, 5 não pertence a Q', 'Sim, Q tem mais elementos'], answer: 1, why: 'Para ser subconjunto, todos os elementos de P precisam pertencer a Q. O 5 não pertence.' },
  { topic: 'SUBCONJUNTOS', title: 'A lista de rochas está contida em B?', sets: 'A = {rocha, areia}   B = {areia, rocha, água}', choices: ['Sim, todo elemento de A está em B', 'Não, porque B tem água', 'Não, porque as listas têm tamanhos diferentes'], answer: 0, why: 'A pode ser subconjunto de B mesmo que B tenha elementos adicionais.' }
];
const topics = ['CONJUNTOS', 'UNIÃO', 'INTERSEÇÃO', 'COMPLEMENTO', 'SUBCONJUNTOS'];
const gates = [525, 1015, 1430, 1845, 2260].map((x, index) => ({ x, y: 338, topic: topics[index], open: false, question: null }));
const fragments = [
  { x: 255, y: 312 }, { x: 405, y: 259 }, { x: 625, y: 312, requiresGate: 0 },
  { x: 775, y: 259, requiresGate: 0 }, { x: 1145, y: 259, requiresGate: 1 },
  { x: 1340, y: 312 }, { x: 1545, y: 259, requiresGate: 2 },
  { x: 1780, y: 312 }, { x: 1980, y: 312, requiresGate: 3 },
  { x: 2160, y: 312 }, { x: 2390, y: 312, requiresGate: 4 },
  { x: 2508, y: 259, requiresGate: 4 }
];

function playSound(kind) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const now = audioContext.currentTime;
    const notes = kind === 'correct' ? [660, 880] : kind === 'wrong' ? [190, 145] : [740, 980];
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(notes[0], now);
    oscillator.frequency.exponentialRampToValueAtTime(notes[1], now + 0.14);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
    oscillator.connect(volume); volume.connect(audioContext.destination);
    oscillator.start(now); oscillator.stop(now + 0.2);
  } catch (_) { /* O jogo continua funcionando se o navegador bloquear áudio. */ }
}

function setComms(person, message, formal = false) {
  const speaker = crew[person] || crew.icaro;
  document.querySelector('#speakerName').textContent = `${speaker.name}${formal ? ' · REGISTRO DE BORDO' : ''}`;
  document.querySelector('#storyLine').textContent = message;
  const portrait = document.querySelector('#commsAvatar');
  portrait.src = `assets/crew/${speaker.portrait}.svg`;
  portrait.alt = `Retrato de ${speaker.name.split(' · ')[0]}`;
  transcript.push({ speaker: speaker.name, message, formal });
  if (!journal.hidden) renderJournal();
}

function renderJournal() {
  const list = document.querySelector('#journalList');
  list.replaceChildren();
  for (const entry of transcript) {
    const row = document.createElement('article'); row.className = 'journal-entry';
    const speaker = document.createElement('strong'); speaker.textContent = entry.speaker;
    const message = document.createElement('p'); message.textContent = entry.message;
    row.append(speaker, message); list.append(row);
  }
  list.scrollTop = list.scrollHeight;
}

function closeJournal() { journal.hidden = true; keys.clear(); }

document.querySelector('#journalButton').addEventListener('click', () => {
  keys.clear(); renderJournal(); journal.hidden = false;
});
document.querySelector('#journalClose').addEventListener('click', closeJournal);

function showDialogueLine() {
  const line = dialogueLines[dialogueIndex];
  setComms(line.person, line.text);
  document.querySelector('#talkProgress').hidden = false;
  document.querySelector('#talkProgress').textContent = `CONVERSA ${dialogueIndex + 1} / ${dialogueLines.length}`;
  document.querySelector('#talkAdvance').hidden = false;
  document.querySelector('#talkAdvance').innerHTML = dialogueIndex === dialogueLines.length - 1 ? 'OUVIR A PERGUNTA <span>→</span>' : 'CONTINUAR <span>→</span>';
}

function beginDialogue(lines, callback) {
  dialogueLines = lines;
  dialogueIndex = 0;
  dialogueCallback = callback || null;
  inDialogue = true;
  showDialogueLine();
}

function advanceDialogue() {
  if (!inDialogue) return;
  dialogueIndex++;
  if (dialogueIndex < dialogueLines.length) { showDialogueLine(); return; }
  inDialogue = false;
  dialogueLines = [];
  document.querySelector('#talkAdvance').hidden = true;
  document.querySelector('#talkProgress').hidden = true;
  const callback = dialogueCallback;
  dialogueCallback = null;
  if (callback) callback();
}

function updateHud() {
  const solved = gates.filter(gate => gate.open).length;
  document.querySelector('#progress').innerHTML = `<b>${String(Math.min(solved + 1, gates.length)).padStart(2, '0')}</b> / 05 · ${solved === gates.length ? 'CAMPANHA CONCLUÍDA' : 'ATIVE AS PORTAS'}`;
  const sectorIndex = Math.min(solved, gates.length - 1);
  document.querySelector('#sector').textContent = sectorNames[sectorIndex].toUpperCase();
  document.querySelector('#chapterTitle').innerHTML = `SETOR ${String(Math.min(solved + 1, gates.length)).padStart(2, '0')} <span class="slash">/</span> ${sectorNames[sectorIndex].toUpperCase()}`;
  document.querySelector('#operationHint').textContent = gates.find(gate => !gate.open)?.topic || '✓';
  if (sectorIndex !== currentCommsSector) {
    currentCommsSector = sectorIndex;
    const sectorVoices = [
      ['mae','Os sinais de rádio ainda alcançam o átrio.'],['caio','A estufa tem energia de emergência; estou mantendo as amostras vivas.'],
      ['davi','O laboratório está silencioso. Isso é bom, eu acho.'],['amara','O arquivo está isolado do ruído por enquanto.'],['mae','Estou no núcleo. Consigo ouvir seus passos no corredor.']
    ];
    setComms(sectorVoices[sectorIndex][0], sectorVoices[sectorIndex][1]);
  }
  document.querySelector('#objectiveText').textContent = solved === gates.length ? 'Portal de saída' : `Resolva ${gates.length - solved} desafio${gates.length - solved === 1 ? '' : 's'}`;
  document.querySelector('#collectCount').textContent = `${fragments.filter(item => item.collected).length} / ${fragments.length}`;
}

function reset() {
  keys.clear();
  player.x = 72; player.y = floorY - player.h; player.vx = 0; player.vy = 0;
  player.coyote = 0; player.jumpBuffer = 0; player.checkpoint = 72;
  camera = 0; started = false; won = false; activeGate = -1; currentCommsSector = -1; inDialogue = false; transcript = []; journal.hidden = true;
  gates.forEach(gate => { gate.open = false; });
  fragments.forEach(item => { item.collected = false; });
  for (const topic of topics) {
    const options = questionBank.filter(question => question.topic === topic);
    gates[topics.indexOf(topic)].question = options[Math.floor(Math.random() * options.length)];
  }
  dialog.hidden = false; quiz.hidden = true;
  document.querySelector('#dialogKicker').textContent = 'TRANSMISSÃO RECEBIDA · 5 DESAFIOS';
  document.querySelector('#dialogTitle').textContent = 'A estação perdeu a memória.';
  document.querySelector('#dialogText').textContent = 'A Estação de Venn pesquisa ecossistemas de mundos distantes. A Tempestade do Ruído apagou os mapas, separou a tripulação e deixou a nave à deriva. O engenheiro Ícaro volta aos corredores onde trabalhou para restaurar os sistemas, reencontrar a equipe e entender por que o alerta inicial foi ignorado. As passarelas magnéticas entre os setores estão sem energia; Ícaro precisa reativar cada porta para abrir a rota seguinte. Os desafios de conjuntos fazem parte dos sistemas de navegação e inventário da estação.';
  document.querySelector('#dialogButton').innerHTML = 'INICIAR MISSÃO <span>→</span>';
  toast.textContent = 'RECUPERE FRAGMENTOS E ATIVE AS CINCO PORTAS';
  updateHud();
  setComms('mae', 'Sinal fraco recebido. Estou esperando vocês no núcleo.');
}

function showQuiz(index) {
  activeGate = index;
  beginDialogue(sectorConversations[index], () => showQuestion(index));
}

function showQuestion(index) {
  const gate = gates[index];
  const question = gate.question;
  document.querySelector('#quizKicker').textContent = `PORTA 0${index + 1} · ${gate.topic}`;
  document.querySelector('#quizTitle').textContent = question.title;
  document.querySelector('#quizText').textContent = question.sets;
  const answers = document.querySelector('#answers');
  answers.replaceChildren();
  question.choices.forEach((choice, choiceIndex) => {
    const button = document.createElement('button');
    button.innerHTML = `<b>${choiceIndex + 1}</b> &nbsp; ${choice}`;
    button.addEventListener('click', () => answer(choiceIndex));
    answers.append(button);
  });
  quiz.hidden = false;
}

function answer(choiceIndex) {
  if (activeGate < 0) return;
  const gate = gates[activeGate];
  const question = gate.question;
  const buttons = [...document.querySelectorAll('#answers button')];
  if (choiceIndex === question.answer) {
    gate.open = true;
    player.x = gate.x + 38; player.y = floorY - player.h;
    player.vx = 0; player.vy = 0; player.checkpoint = player.x;
    buttons[choiceIndex].classList.add('correct');
    document.querySelector('#quizTitle').textContent = 'Correto! Caminho restaurado.';
    document.querySelector('#quizText').textContent = question.why;
    toast.textContent = `SETOR ${String(activeGate + 1).padStart(2, '0')} REATIVADO · ${gate.topic}`;
    setComms('icaro', question.why);
    playSound('correct');
    setTimeout(() => { quiz.hidden = true; const solvedIndex = activeGate; beginDialogue(successConversations[solvedIndex], () => { activeGate = -1; updateHud(); }); }, 900);
  } else {
    buttons[choiceIndex].classList.add('wrong');
    document.querySelector('#quizTitle').textContent = 'Essa opção não corresponde.';
    document.querySelector('#quizText').textContent = 'Leia a definição e tente outra vez. Errar não tira pontos nem fecha a porta.';
    const speakers = ['joana','caio','davi','amara','mae'];
    const replies = ['Confira o símbolo com calma. A porta não vai a lugar nenhum.','Uma tentativa errada não estraga a coleção. Vamos revisar as listas.','Tudo bem parar um segundo. Qual era mesmo a regra?','Não tire conclusão sem conferir o universo definido no enunciado.','Sem pressa. Explique para si mesma o que cada conjunto representa.'];
    setComms(speakers[activeGate], replies[activeGate]);
    playSound('wrong');
  }
}

document.querySelector('#talkAdvance').addEventListener('click', advanceDialogue);
document.querySelector('#dialogButton').addEventListener('click', () => {
  if (won) { reset(); return; }
  dialog.hidden = true; started = true;
  toast.textContent = '← → OU A/D PARA MOVER · ESPAÇO PARA PULAR';
  beginDialogue(introConversation, () => setComms('joana', 'O painel do átrio está logo adiante. Vou esperar você na porta.'));
});
document.querySelector('#sound-toggle').addEventListener('click', event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled));
  event.currentTarget.textContent = soundEnabled ? 'SOM: LIGADO' : 'SOM: DESLIGADO';
  if (soundEnabled) playSound('pickup');
});
document.querySelectorAll('.touch-controls button').forEach(button => {
  const action = button.dataset.control;
  const key = action === 'left' ? 'arrowleft' : action === 'right' ? 'arrowright' : ' ';
  button.addEventListener('pointerdown', event => { event.preventDefault(); keys.add(key); button.setPointerCapture(event.pointerId); if (action === 'jump') player.jumpBuffer = 8; });
  const release = event => { event.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', () => keys.delete(key));
});
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (key === 'escape' && !journal.hidden) { closeJournal(); return; }
  if (inDialogue && ['enter',' '].includes(key)) { event.preventDefault(); advanceDialogue(); return; }
  if (['arrowleft', 'arrowright', 'arrowup', ' '].includes(key)) event.preventDefault();
  if (!keys.has(key) && [' ', 'arrowup', 'w'].includes(key)) player.jumpBuffer = 8;
  keys.add(key);
  if (key === 'r') { reset(); return; }
  if (!quiz.hidden && ['1', '2', '3'].includes(key)) answer(Number(key) - 1);
});
window.addEventListener('keyup', event => {
  const key = event.key.toLowerCase(); keys.delete(key);
  if ([' ', 'arrowup', 'w'].includes(key) && player.vy < -4) player.vy = -4;
});
window.addEventListener('blur', () => keys.clear());

function update() {
  frame++;
  if (!started || won || !quiz.hidden || inDialogue || !journal.hidden) return;
  const left = keys.has('arrowleft') || keys.has('a');
  const right = keys.has('arrowright') || keys.has('d');
  const direction = (right ? 1 : 0) - (left ? 1 : 0);
  const acceleration = player.grounded ? 0.72 : 0.42;
  const maxSpeed = 4.25;
  if (direction) {
    player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx + direction * acceleration));
    player.facing = direction;
  } else player.vx *= player.grounded ? 0.72 : 0.96;
  if (Math.abs(player.vx) < 0.08) player.vx = 0;
  if (player.grounded) player.coyote = 8;
  else player.coyote = Math.max(0, player.coyote - 1);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - 1);
  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -10.8; player.grounded = false; player.coyote = 0; player.jumpBuffer = 0;
  }

  const oldBottom = player.y + player.h;
  let nextX = Math.max(0, Math.min(worldWidth - player.w, player.x + player.vx));
  for (const gate of gates) {
    if (!gate.open && nextX + player.w > gate.x - 18 && player.x + player.w <= gate.x - 18) {
      nextX = gate.x - 18 - player.w; player.vx = 0;
    }
  }
  player.x = nextX;
  player.y += player.vy;
  player.vy = Math.min(player.vy + 0.42, 11);
  player.grounded = false;
  let landing = null;
  for (const platform of platforms) {
    if (platform.requiresGate !== undefined && !gates[platform.requiresGate].open) continue;
    const overlaps = player.x + player.w > platform.x && player.x < platform.x + platform.w;
    const crossedTop = oldBottom <= platform.y + 3 && player.y + player.h >= platform.y;
    if (overlaps && crossedTop && player.vy >= 0 && (!landing || platform.y < landing.y)) landing = platform;
  }
  if (landing) { player.y = landing.y - player.h; player.vy = 0; player.grounded = true; }

  if (player.y > canvas.height + 70) {
    player.x = player.checkpoint; player.y = floorY - player.h; player.vx = 0; player.vy = 0; player.coyote = 0;
    toast.textContent = 'VOCÊ VOLTOU AO ÚLTIMO PONTO DE RETORNO';
    setComms('joana', 'Voltou ao ponto seguro. Eu conferi as plataformas: não foi você, algumas ainda estão sem energia. Tente pelo outro piso.');
  }
  for (const item of fragments) {
    if (item.collected || (item.requiresGate !== undefined && !gates[item.requiresGate].open)) continue;
    const dx = player.x + player.w / 2 - item.x, dy = player.y + player.h / 2 - item.y;
    if (Math.hypot(dx, dy) < 25) {
      item.collected = true;
      const memoryIndex = Math.min(fragments.filter(fragment => fragment.collected).length - 1, memoryLogs.length - 1);
      const record = memoryLogs[memoryIndex];
      toast.textContent = `REGISTRO ${memoryIndex + 1}/${memoryLogs.length} RECUPERADO`;
      setComms(record[0], record[1], true);
      playSound('pickup'); updateHud();
    }
  }
  for (let index = 0; index < gates.length; index++) {
    if (!gates[index].open && Math.abs(player.x + player.w / 2 - gates[index].x) < 58) { showQuiz(index); break; }
  }
  if (gates.every(gate => gate.open) && player.x > worldWidth - 105) {
    won = true; started = false; dialog.hidden = false;
    const memories = fragments.filter(item => item.collected).length;
    document.querySelector('#dialogKicker').textContent = `CAMPANHA CONCLUÍDA · ${memories}/${fragments.length} FRAGMENTOS`;
    document.querySelector('#dialogTitle').textContent = memories === fragments.length ? 'A memória da estação está completa.' : 'A estação voltou a funcionar.';
    document.querySelector('#dialogText').textContent = `Ícaro e a tripulação restauraram os cinco setores. ${memories} de ${fragments.length} registros foram recuperados. No canal, Mae confirma que todos estão seguros: a Estação de Venn pode voltar para casa.`;
    document.querySelector('#dialogButton').innerHTML = 'JOGAR DE NOVO <span>↻</span>';
    toast.textContent = 'TODAS AS CINCO PORTAS FORAM ATIVADAS';
    setComms('mae', 'Equipe reunida. Eu devia ter escutado vocês antes. Vamos voltar para casa e conversar sem alarmes.');
  }
  const target = Math.max(0, Math.min(worldWidth - canvas.width, player.x - 300));
  camera += (target - camera) * 0.14;
  position.innerHTML = `COORDENADAS <b>${String(Math.round(player.x)).padStart(4, '0')}</b>`;
}

function drawBackground() {
  const accents = ['#f6b85e', '#79d9a7', '#9b8dff', '#e8a96d', '#69d9e8'];
  const names = ['ÁTRIO DE ACOPLAMENTO', 'ESTUFA DE PESQUISA', 'LABORATÓRIO DE ROTAS', 'ARQUIVO BIOLÓGICO', 'NÚCLEO DE COMANDO'];
  const base = ctx.createLinearGradient(0, 0, 0, 480);
  base.addColorStop(0, '#182b3c'); base.addColorStop(.48, '#243b4c'); base.addColorStop(1, '#121e29');
  ctx.fillStyle = base; ctx.fillRect(0, 0, 960, 480);

  // O exterior é visto pelas janelas da estação; as estrelas movem-se devagar com a câmera.
  ctx.save(); ctx.translate(-camera * .16, 0);
  for (let i = 0; i < 74; i++) {
    const x = (i * 137 + 31) % 2800;
    const y = 26 + (i * 71) % 218;
    ctx.fillStyle = i % 7 === 0 ? '#f4ddb699' : '#c5e2f377';
    ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 1.8 : .9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  for (let room = 0; room < 5; room++) {
    const left = room * 512 - camera;
    if (left > 1000 || left < -530) continue;
    const accent = accents[room];
    const windowX = left + 26;

    // Costelas estruturais e placas do casco deixam claro que a ação acontece dentro da nave.
    ctx.fillStyle = '#31495a'; ctx.fillRect(left, 0, 512, 19);
    ctx.fillStyle = '#5e7786'; ctx.fillRect(left, 17, 512, 3);
    ctx.fillStyle = '#203545'; ctx.fillRect(left, 20, 512, 55);
    ctx.fillStyle = '#496271'; ctx.fillRect(left + 8, 26, 496, 2);
    ctx.fillStyle = '#142432'; ctx.fillRect(left + 8, 65, 496, 7);
    ctx.fillStyle = accent; ctx.globalAlpha = .75; ctx.fillRect(left + 28, 49, 72, 3); ctx.globalAlpha = 1;
    ctx.fillStyle = '#78909b'; ctx.fillRect(left + 482, 22, 13, 54);
    ctx.fillStyle = '#9ab0ba'; ctx.fillRect(left + 487, 24, 2, 48);
    ctx.fillStyle = '#263d4c'; ctx.fillRect(left + 7, 79, 498, 236);

    // Janelas pressurizadas, com o planeta e as estrelas visíveis além do casco.
    ctx.save();
    ctx.beginPath(); ctx.roundRect(windowX, 91, 454, 200, 12); ctx.clip();
    const view = ctx.createLinearGradient(0, 91, 0, 291);
    view.addColorStop(0, room === 1 ? '#426c66' : room === 3 ? '#71564a' : '#385b76');
    view.addColorStop(.58, '#263e58'); view.addColorStop(1, '#172c40');
    ctx.fillStyle = view; ctx.fillRect(windowX, 91, 454, 200);
    for (let i = 0; i < 30; i++) {
      const sx = windowX + ((i * 79 + room * 47) % 444);
      const sy = 101 + (i * 43 + room * 19) % 170;
      ctx.fillStyle = i % 5 === 0 ? '#ffe7ae' : '#c9e9ff';
      ctx.globalAlpha = i % 5 === 0 ? .85 : .52;
      ctx.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
    if (room === 0 || room === 2 || room === 4) {
      const px = windowX + (room === 0 ? 315 : room === 2 ? 105 : 348);
      const py = room === 2 ? 166 : 173;
      const radius = room === 4 ? 60 : 47;
      const planet = ctx.createLinearGradient(px - radius, py - radius, px + radius, py + radius);
      planet.addColorStop(0, room === 2 ? '#cab8ff' : '#a6d7dc');
      planet.addColorStop(.48, room === 2 ? '#766eb2' : '#4e91a8');
      planet.addColorStop(1, '#294961');
      ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d9f4e933'; ctx.beginPath(); ctx.ellipse(px - 8, py - 17, radius * .66, 7, -.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#213d54'; ctx.beginPath(); ctx.arc(px + 20, py + 5, radius * .9, -1.1, 1.2); ctx.lineTo(px, py); ctx.fill();
      ctx.strokeStyle = '#e0f3fa66'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py + 3, radius * 1.4, radius * .32, -.22, 0, Math.PI * 2); ctx.stroke();
    }
    // Relances solares e módulos distantes, sem skyline urbano.
    ctx.fillStyle = '#91b5c655'; ctx.fillRect(windowX + 15, 250, 120, 4);
    ctx.fillRect(windowX + 35, 255, 3, 23); ctx.fillRect(windowX + 111, 255, 3, 23);
    ctx.fillStyle = '#a9cce655'; ctx.fillRect(windowX + 32, 259, 82, 13);
    ctx.strokeStyle = '#d9edff88'; ctx.lineWidth = 1;
    for (let cell = 1; cell < 5; cell++) { ctx.beginPath(); ctx.moveTo(windowX + 32 + cell * 16, 259); ctx.lineTo(windowX + 32 + cell * 16, 272); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#9eb4bf'; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(windowX, 91, 454, 200, 12); ctx.stroke();
    ctx.strokeStyle = '#d5e2e1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(windowX + 5, 96, 444, 190, 8); ctx.stroke();

    // Área interna própria de cada setor: ambiente de trabalho, não uma cidade genérica.
    if (room === 0) {
      // Volante de escotilha e marcação de segurança do átrio.
      ctx.fillStyle = '#7a8b8d'; ctx.beginPath(); ctx.arc(left + 421, 177, 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d8e1db'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(left + 421, 177, 19, 0, Math.PI * 2); ctx.stroke();
      for (let spoke = 0; spoke < 8; spoke++) { const a = spoke * Math.PI / 4; ctx.beginPath(); ctx.moveTo(left + 421 + Math.cos(a) * 18, 177 + Math.sin(a) * 18); ctx.lineTo(left + 421 + Math.cos(a) * 27, 177 + Math.sin(a) * 27); ctx.stroke(); }
      ctx.fillStyle = '#d79843'; ctx.fillRect(left + 28, 300, 455, 6);
      for (let mark = 0; mark < 16; mark++) { ctx.fillStyle = mark % 2 ? '#233744' : '#e6b14f'; ctx.beginPath(); ctx.moveTo(left + 30 + mark * 28, 300); ctx.lineTo(left + 43 + mark * 28, 300); ctx.lineTo(left + 30 + mark * 28, 306); ctx.fill(); }
    } else if (room === 1) {
      // Estufa: canaletas, folhas e iluminação de cultivo âmbar.
      ctx.fillStyle = '#4c6554'; ctx.fillRect(left + 50, 269, 390, 28);
      ctx.fillStyle = '#273f39'; ctx.fillRect(left + 60, 274, 370, 13);
      for (let plant = 0; plant < 9; plant++) {
        const px = left + 76 + plant * 42, height = 30 + (plant % 3) * 13;
        ctx.strokeStyle = '#81bd79'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, 273); ctx.quadraticCurveTo(px - 2, 273 - height / 2, px, 273 - height); ctx.stroke();
        ctx.fillStyle = plant % 2 ? '#83c779' : '#b0d77b';
        ctx.beginPath(); ctx.ellipse(px - 8, 260 - height / 2, 10, 4, -.55, 0, Math.PI * 2); ctx.ellipse(px + 8, 252 - height / 2, 10, 4, .55, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#ffd589'; ctx.globalAlpha = .55; ctx.fillRect(left + 80, 235, 330, 3); ctx.globalAlpha = 1;
    } else if (room === 2) {
      // Laboratório de rotas: mesa e diagrama holográfico de dois conjuntos.
      ctx.fillStyle = '#344b61'; ctx.beginPath(); ctx.roundRect(left + 65, 237, 382, 62, 8); ctx.fill();
      ctx.fillStyle = '#203448'; ctx.fillRect(left + 82, 250, 348, 39);
      ctx.strokeStyle = '#6fc9e6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(left + 218, 268, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#b094ff'; ctx.beginPath(); ctx.arc(left + 246, 268, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#e5edff'; ctx.font = '9px monospace'; ctx.fillText('A', left + 203, 272); ctx.fillText('B', left + 254, 272);
      ctx.fillStyle = accent; ctx.fillRect(left + 310, 257, 90, 3); ctx.fillRect(left + 310, 267, 66, 3); ctx.fillRect(left + 310, 277, 76, 3);
    } else if (room === 3) {
      // Arquivo: armários com gavetas e etiquetas de espécimes.
      for (let cabinet = 0; cabinet < 4; cabinet++) {
        const cx = left + 51 + cabinet * 103;
        ctx.fillStyle = '#5b5148'; ctx.beginPath(); ctx.roundRect(cx, 168, 82, 126, 4); ctx.fill();
        ctx.fillStyle = '#403c39'; ctx.fillRect(cx + 8, 178, 66, 104);
        for (let drawer = 0; drawer < 4; drawer++) {
          ctx.fillStyle = '#806e5c'; ctx.fillRect(cx + 11, 183 + drawer * 24, 60, 18);
          ctx.fillStyle = drawer % 2 ? '#d5a96c' : '#91b9b1'; ctx.fillRect(cx + 17, 189 + drawer * 24, 24, 3);
          ctx.fillStyle = '#c4c4b3'; ctx.fillRect(cx + 60, 190 + drawer * 24, 5, 5);
        }
      }
    } else {
      // Núcleo: console de navegação, cadeira de comando e indicadores de energia.
      ctx.fillStyle = '#364c5d'; ctx.beginPath(); ctx.roundRect(left + 55, 235, 402, 68, 10); ctx.fill();
      ctx.fillStyle = '#172b3b'; ctx.beginPath(); ctx.roundRect(left + 74, 244, 364, 42, 5); ctx.fill();
      for (let panel = 0; panel < 7; panel++) {
        ctx.fillStyle = ['#62d5cc','#f2bc68','#82a9e8'][panel % 3];
        ctx.globalAlpha = .78; ctx.fillRect(left + 89 + panel * 45, 251 + (panel % 2) * 8, 28, 3); ctx.globalAlpha = 1;
        ctx.fillRect(left + 89 + panel * 45, 265, 17, 8);
      }
      ctx.fillStyle = '#718590'; ctx.fillRect(left + 230, 297, 58, 10);
      ctx.fillStyle = '#596d7b'; ctx.beginPath(); ctx.roundRect(left + 246, 309, 27, 21, 5); ctx.fill();
    }

    // Letreiro de setor, luzes de serviço e conduítes acompanham a estrutura do casco.
    ctx.fillStyle = '#d7e1dc'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillText(names[room], left + 29, 87);
    ctx.fillStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = 11;
    ctx.beginPath(); ctx.arc(left + 472, 48, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#647986'; ctx.fillRect(left + 15, 318, 482, 5);
    ctx.fillStyle = '#a1b2b6'; ctx.fillRect(left + 15, 323, 482, 2);
    ctx.fillStyle = '#253946'; ctx.fillRect(left + 20, 326, 475, 70);
    for (let panel = 0; panel < 8; panel++) {
      ctx.fillStyle = '#465b66'; ctx.fillRect(left + 30 + panel * 58, 337, 42, 2);
      ctx.fillStyle = panel % 3 === room % 3 ? accent : '#72868b'; ctx.globalAlpha = .7; ctx.fillRect(left + 31 + panel * 58, 346, 5, 3); ctx.globalAlpha = 1;
    }
  }

  // Reflexos e faíscas ocasionais lembram que a tempestade ainda interfere nos sistemas.
  for (let i = 0; i < 7; i++) {
    const x = ((i * 167 + frame * (i % 2 ? .45 : -.25) - camera * .38) % 1100 + 1100) % 1100;
    const y = 78 + (i * 41) % 204;
    ctx.fillStyle = i % 2 ? '#83e6e0' : '#ffd28b'; ctx.globalAlpha = .72;
    ctx.fillRect(x, y, 3 + i % 3, 1); ctx.globalAlpha = 1;
  }
}

function drawPlatform(platform) {
  if (platform.requiresGate !== undefined && !gates[platform.requiresGate].open) return;
  const x = platform.x - camera;
  const floating = platform.kind !== 'base';
  const accent = platform.requiresGate !== undefined ? '#6de2c5' : platform.kind === 'a' ? '#70c9b8' : platform.kind === 'b' ? '#8db6e3' : '#718995';
  ctx.fillStyle = floating ? '#425967' : '#344852';
  ctx.beginPath(); ctx.roundRect(x, platform.y, platform.w, platform.h, 4); ctx.fill();
  ctx.fillStyle = floating ? '#87999a' : '#667a7f';
  ctx.fillRect(x + 2, platform.y, platform.w - 4, 3);
  ctx.fillStyle = accent; ctx.fillRect(x + 7, platform.y + 4, Math.max(10, platform.w - 14), 2);
  ctx.fillStyle = '#243640';
  for (let offset = 11; offset < platform.w - 8; offset += 25) {
    ctx.fillRect(x + offset, platform.y + (floating ? 9 : 14), 12, 2);
    ctx.fillStyle = '#aebcba'; ctx.beginPath(); ctx.arc(x + offset + 2, platform.y + (floating ? 7 : 7), 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#243640';
  }
  if (floating) {
    ctx.fillStyle = '#243945'; ctx.fillRect(x + 10, platform.y + platform.h - 3, platform.w - 20, 4);
    ctx.fillStyle = accent; ctx.globalAlpha = .75; ctx.fillRect(x + 15, platform.y + platform.h + 2, 13, 2); ctx.fillRect(x + platform.w - 28, platform.y + platform.h + 2, 13, 2); ctx.globalAlpha = 1;
  }
}

function drawFragments() {
  for (const item of fragments) {
    if (item.collected || (item.requiresGate !== undefined && !gates[item.requiresGate].open)) continue;
    const bob = Math.sin(frame * 0.06 + item.x) * 4;
    const x = item.x - camera, y = item.y + bob;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
    ctx.shadowColor = '#70efc0'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#70efc0'; ctx.fillRect(-6, -6, 12, 12);
    ctx.fillStyle = '#e5fff4'; ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
  }
}

function drawGate(gate, index) {
  const x = gate.x - camera;
  const colors = ['#e8b45b', '#75d8a5', '#a392ff', '#df9e68', '#68d5e3'];
  const color = colors[index];
  if (gate.open) {
    gate.openProgress = Math.min(1, (gate.openProgress || .04) + .055);
    const opening = 7 + gate.openProgress * 35;
    ctx.fillStyle = '#142733'; ctx.fillRect(x - 24, 286, 48, 114);
    ctx.fillStyle = '#8aa0a0'; ctx.fillRect(x - 27, 286, 5, 114); ctx.fillRect(x + 22, 286, 5, 114);
    ctx.fillStyle = color; ctx.globalAlpha = .35 + gate.openProgress * .55;
    ctx.fillRect(x - opening / 2, 296, opening, 95); ctx.globalAlpha = 1;
    ctx.fillStyle = '#e7f2e7'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText('ROTA ATIVA', x, 278);
    ctx.fillStyle = color; ctx.fillRect(x - 22, 289, 44, 3); ctx.fillRect(x - 22, 394, 44, 3);
    return;
  }
  ctx.fillStyle = '#405763'; ctx.beginPath(); ctx.roundRect(x - 28, 286, 56, 114, 5); ctx.fill();
  ctx.fillStyle = '#263e4a'; ctx.fillRect(x - 21, 292, 42, 100);
  ctx.strokeStyle = '#809399'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 18, 298, 36, 88, 4); ctx.stroke();
  ctx.fillStyle = '#596f78'; ctx.fillRect(x - 12, 307, 24, 67);
  ctx.fillStyle = color; ctx.globalAlpha = .95; ctx.fillRect(x - 11, 309, 22, 3); ctx.fillRect(x - 11, 369, 22, 3); ctx.globalAlpha = 1;
  ctx.fillStyle = '#dfe9df'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText(gate.topic, x, 354);
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, 299, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#9aabad'; ctx.fillRect(x - 24, 284, 48, 3);
}

function drawCrewSilhouettes() {
  const profiles = [
    {x:405,skin:'#eed0b2',hair:'#3a2625',coat:'#a65338'},
    {x:885,skin:'#8b523d',hair:'#211b19',coat:'#48785b'},
    {x:1315,skin:'#dba884',hair:'#47362c',coat:'#526d9b'},
    {x:1765,skin:'#6c4138',hair:'#17191d',coat:'#76548a'},
    {x:2180,skin:'#a96f53',hair:'#342b2a',coat:'#7f5b42'}
  ];
  profiles.forEach((person,index)=>{
    if(index > 0 && !gates[index-1].open) return;
    const x=person.x-camera, bob=Math.sin(frame*.045+index)*1.3;
    ctx.save();ctx.translate(x, floorY-43+bob);
    ctx.fillStyle='#101925';ctx.fillRect(-7,28,6,12);ctx.fillRect(2,28,6,12);
    ctx.fillStyle=person.coat;ctx.beginPath();ctx.roundRect(-12,12,24,20,5);ctx.fill();
    ctx.fillStyle=person.skin;ctx.beginPath();ctx.ellipse(0,4,8,10,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=person.hair;ctx.beginPath();ctx.arc(0,1,9,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-9,0,4,9);
    ctx.fillStyle='#182432';ctx.fillRect(2,3,2,2);ctx.fillRect(6,6,1,2);
    ctx.fillStyle='#d5e6df';ctx.fillRect(-3,13,6,8);
    ctx.restore();
  });
}

function drawPlayer() {
  const x = player.x - camera, y = player.y;
  const running = player.grounded && Math.abs(player.vx) > .4;
  const step = running ? Math.sin(frame * .34) * 3 : 0;
  const armSwing = running ? Math.sin(frame * .34 + Math.PI) * 2 : 0;
  ctx.save(); ctx.translate(x + player.w / 2, y);
  // Botas, calça de trabalho e braços com animação simples de caminhada.
  ctx.fillStyle = '#24323a'; ctx.beginPath(); ctx.roundRect(-8 + step, 36, 6, 9, 2); ctx.roundRect(2 - step, 36, 6, 9, 2); ctx.fill();
  ctx.fillStyle = '#b5a78e'; ctx.beginPath(); ctx.roundRect(-10 + step, 43, 10, 4, 2); ctx.roundRect(1 - step, 43, 10, 4, 2); ctx.fill();
  ctx.strokeStyle = '#c88d6c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-10, 23); ctx.lineTo(-13 - armSwing, 32); ctx.lineTo(-11 - armSwing, 36); ctx.moveTo(10, 23); ctx.lineTo(13 + armSwing, 31); ctx.lineTo(12 + armSwing, 35); ctx.stroke();
  const jacket = ctx.createLinearGradient(-12, 18, 12, 41); jacket.addColorStop(0, '#688f91'); jacket.addColorStop(1, '#355761');
  ctx.fillStyle = jacket; ctx.beginPath(); ctx.roundRect(-11, 18, 22, 21, 5); ctx.fill();
  ctx.fillStyle = '#dbd6c6'; ctx.beginPath(); ctx.moveTo(-4, 19); ctx.lineTo(0, 25); ctx.lineTo(4, 19); ctx.lineTo(2, 30); ctx.lineTo(-2, 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8bf70'; ctx.fillRect(5, 28, 3, 4); // crachá da equipe
  ctx.fillStyle = '#283e47'; ctx.fillRect(-4, 37, 8, 3); // cinto de ferramentas
  // Pescoço, orelhas e rosto; Ícaro não usa capacete dentro da estação pressurizada.
  ctx.fillStyle = '#bd8060'; ctx.fillRect(-3, 14, 6, 7);
  ctx.fillStyle = '#c98b6b'; ctx.beginPath(); ctx.ellipse(0, 9, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a86a52'; ctx.beginPath(); ctx.arc(-7.5, 10, 2, 0, Math.PI * 2); ctx.arc(7.5, 10, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#292128'; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(-9, -1, 0, 0); ctx.quadraticCurveTo(9, -1, 8, 8); ctx.lineTo(5, 5); ctx.quadraticCurveTo(0, 7, -5, 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#252c31'; const eyeX = player.facing > 0 ? 2 : -4; ctx.fillRect(eyeX, 9, 2, 2);
  ctx.strokeStyle = '#302627'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(eyeX - 1, 7); ctx.lineTo(eyeX + 3, 7); ctx.stroke();
  ctx.strokeStyle = '#8f5d4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(player.facing > 0 ? 5 : -5, 11); ctx.lineTo(player.facing > 0 ? 6 : -6, 13); ctx.stroke();
  ctx.strokeStyle = '#75463e'; ctx.beginPath(); ctx.moveTo(-2, 15); ctx.quadraticCurveTo(0, 16, 2, 15); ctx.stroke();
  ctx.restore();
}

function drawPortal() {
  const x = worldWidth - 55 - camera;
  ctx.save(); ctx.shadowColor = '#70efc0'; ctx.shadowBlur = 20; ctx.strokeStyle = '#70efc0'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(x, 346, 19, 43, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = '#a7ffe1'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText('SAÍDA', x, 405); ctx.restore();
}

function render() {
  drawBackground();
  // drawPlatform already converts world coordinates through camera; do not translate twice.
  platforms.forEach(drawPlatform);
  drawFragments(); gates.forEach(drawGate); drawPortal(); drawCrewSilhouettes(); drawPlayer();
}

function loop() { update(); render(); requestAnimationFrame(loop); }
reset(); loop();
