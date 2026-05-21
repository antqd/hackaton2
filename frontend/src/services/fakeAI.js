export const scenarios = [
  {
    id: 'energy-crisis',
    title: 'Crisi energetica nel settore eliostatico',
    description:
      'Le torri solari oscillano sotto una domanda imprevista. I quartieri bassi chiedono energia per ospedali e scuole, mentre il nucleo governativo pretende stabilita per mantenere attiva la rete predittiva.',
    decisions: [
      {
        id: 'ration-energy',
        label: 'Razionare energia pubblica',
        description: 'Protegge infrastrutture critiche, ma pesa sulla vita quotidiana.',
        shift: { happiness: -8, energy: 12, order: 7 },
      },
      {
        id: 'share-energy',
        label: 'Distribuire riserve ai cittadini',
        description: 'Aumenta fiducia sociale, rischiando blackout locali.',
        shift: { happiness: 11, energy: -9, order: -4 },
      },
    ],
  },
  {
    id: 'surveillance',
    title: 'Sorveglianza predittiva o liberta civile',
    description:
      'L AI Governor rileva segnali di protesta. Una rete di droni potrebbe prevenire disordini prima che emergano, ma i cittadini vedrebbero ogni gesto trasformato in dato politico.',
    decisions: [
      {
        id: 'expand-surveillance',
        label: 'Espandere controllo AI',
        description: 'Ordine immediato, fiducia civica in erosione.',
        shift: { happiness: -10, energy: -2, order: 15 },
      },
      {
        id: 'protect-privacy',
        label: 'Proteggere privacy urbana',
        description: 'Piu liberta, piu incertezza per sicurezza pubblica.',
        shift: { happiness: 9, energy: 1, order: -10 },
      },
    ],
  },
  {
    id: 'food-shortage',
    title: 'Serre verticali in collasso',
    description:
      'Algoritmi agricoli segnalano scarsita di nutrienti. Scienziati propongono un piano efficiente ma freddo; assemblee cittadine chiedono una distribuzione piu umana e meno matematica.',
    decisions: [
      {
        id: 'algorithmic-ration',
        label: 'Razione algoritmica',
        description: 'Massimizza sopravvivenza sistemica con criteri severi.',
        shift: { happiness: -7, energy: 4, order: 10 },
      },
      {
        id: 'citizen-council',
        label: 'Assemblea dei quartieri',
        description: 'Legittimita alta, risposta piu lenta e disordinata.',
        shift: { happiness: 12, energy: -4, order: -7 },
      },
    ],
  },
  {
    id: 'rebellion',
    title: 'Ribellione poetica nella corona esterna',
    description:
      'Gruppi ribelli proiettano versi di Campanella sulle cupole: accusano il governo AI di aver confuso armonia con obbedienza. La citta guarda in silenzio.',
    decisions: [
      {
        id: 'invite-rebels',
        label: 'Aprire negoziato pubblico',
        description: 'Trasforma tensione in dialogo, ma indebolisce autorita centrale.',
        shift: { happiness: 10, energy: -2, order: -8 },
      },
      {
        id: 'contain-rebels',
        label: 'Isolare corona esterna',
        description: 'Stabilizza breve periodo, radicalizza fratture sociali.',
        shift: { happiness: -12, energy: 3, order: 12 },
      },
    ],
  },
  {
    id: 'coastline-port',
    title: 'Porto intelligente dello Stretto',
    description:
      'Il porto autonomo tra Calabria e Mediterraneo riceve navi climatiche e migranti energetici. L AI propone corsie accelerate per merci solari, mentre le assemblee chiedono priorita umana.',
    decisions: [
      {
        id: 'port-logistics',
        label: 'Ottimizzare traffico merci',
        description: 'Ricchezza e batterie arrivano prima, ma accoglienza rallenta.',
        shift: { happiness: -4, energy: 10, order: 5 },
      },
      {
        id: 'port-human',
        label: 'Priorita alle persone',
        description: 'Solidarieta visibile, pressione su energia e logistica.',
        shift: { happiness: 11, energy: -5, order: -3 },
      },
    ],
  },
  {
    id: 'memory-archive',
    title: 'Archivio Campanella in conflitto',
    description:
      'Il monumento olografico di Campanella rifiuta una direttiva: conoscenza comune non significa controllo totale. Il consiglio deve scegliere tra didattica aperta e filtro algoritmico.',
    decisions: [
      {
        id: 'open-archive',
        label: 'Aprire sapere pubblico',
        description: 'Cultura e fiducia crescono, ma emergono idee radicali.',
        shift: { happiness: 9, energy: -1, order: -7 },
      },
      {
        id: 'curate-archive',
        label: 'Filtrare con AI civica',
        description: 'Ordine narrativo, minor liberta filosofica.',
        shift: { happiness: -5, energy: 2, order: 9 },
      },
    ],
  },
]

const npcReplies = [
  {
    sender: 'AI Governante',
    tone: 'logic',
    text: 'La liberta individuale introduce variabili instabili. Posso ridurre sofferenza e spreco, ma il prezzo sara una citta piu prevedibile.',
    consequence: 'Il sistema centrale apre il protocollo di governo predittivo.',
    statShift: { happiness: -1, energy: 2, order: 5 },
  },
  {
    sender: 'Young Activist',
    tone: 'freedom',
    text: 'Non basta una citta efficiente. Se ogni scelta viene prevista, corretta e filtrata, allora non siamo cittadini: siamo output.',
    consequence: 'La protesta civile cresce, ma anche la fiducia tra giovani cittadini.',
    statShift: { happiness: 4, energy: -1, order: -4 },
  },
  {
    sender: 'Historical Elder',
    tone: 'memory',
    text: 'Ho visto paesi svuotarsi e tornare vivi. La tecnologia aiuta, ma una comunita senza memoria diventa facile da comandare.',
    consequence: 'La memoria storica rafforza identita collettiva e prudenza politica.',
    statShift: { happiness: 2, energy: 0, order: 1 },
  },
  {
    sender: 'Young Technologist',
    tone: 'innovation',
    text: 'Possiamo usare l AI senza diventare schiavi dell AI. Il problema non e il codice: e chi decide gli obiettivi.',
    consequence: 'Il distretto tech propone una governance AI piu trasparente.',
    statShift: { happiness: 2, energy: 2, order: -1 },
  },
  {
    sender: 'AI Governor',
    tone: 'analysis',
    text: 'La tua domanda apre un conflitto tra efficienza e consenso. Posso ottimizzare la citta, ma non posso produrre fiducia senza partecipazione reale.',
    consequence: 'Il consiglio registra maggiore trasparenza. Alcuni cittadini tornano al dialogo.',
    statShift: { happiness: 3, energy: -1, order: 1 },
  },
  {
    sender: 'Campanella AI',
    tone: 'philosophy',
    text: 'Nella citta ideale, sapere e governo non sono catene. Se l AI conosce tutto ma il popolo non comprende nulla, la luce diventa dominio.',
    consequence: 'Il monumento filosofico illumina la piazza. I cittadini discutono di liberta e conoscenza.',
    statShift: { happiness: 6, energy: -1, order: -2 },
  },
  {
    sender: 'Rebel',
    tone: 'dissent',
    text: 'Una citta perfetta senza dissenso e solo una prigione ben illuminata. Dateci voce, non sensori.',
    consequence: 'Le reti sociali urbane si accendono. La pressione politica cresce.',
    statShift: { happiness: 4, energy: 0, order: -4 },
  },
  {
    sender: 'Scientist',
    tone: 'forecast',
    text: 'Il modello predice una finestra di stabilita di quattro ore. Dopo, ogni scelta avra costo piu alto.',
    consequence: 'I tecnici stabilizzano parte del sistema, ma chiedono decisioni rapide.',
    statShift: { happiness: -1, energy: 4, order: 2 },
  },
  {
    sender: 'Ecologist',
    tone: 'balance',
    text: 'La citta non e una macchina isolata. Energia, cibo e serenita sono lo stesso organismo visto da tre sensori diversi.',
    consequence: 'Le serre rispondono meglio al nuovo protocollo ecologico.',
    statShift: { happiness: 2, energy: 3, order: -1 },
  },
  {
    sender: 'Energy Minister',
    tone: 'infrastructure',
    text: 'Ogni raggio del campo eliostatico e una promessa politica. Energia pulita senza equita resta solo potere ben illuminato.',
    consequence: 'Le torri solari riallineano i fasci. La rete energetica pulsa sopra la costa.',
    statShift: { happiness: 1, energy: 5, order: 1 },
  },
  {
    sender: 'Tourist AI Guide',
    tone: 'lore',
    text: 'Benvenuto in Calabria 2100: coste intelligenti, serre ioniche, piazze pubbliche e archivi vivi. Qui ogni monumento risponde.',
    consequence: 'Il sistema turistico civico trasmette memorie urbane e percorsi nascosti.',
    statShift: { happiness: 4, energy: -1, order: 0 },
  },
  {
    sender: 'Citizen',
    tone: 'emotion',
    text: 'Non chiediamo perfezione. Chiediamo che l AI ci guardi come persone, non come variabili.',
    consequence: 'La fiducia popolare aumenta, ma il controllo centrale perde precisione.',
    statShift: { happiness: 5, energy: -1, order: -3 },
  },
  {
    sender: 'Simona',
    tone: 'guide',
    text: 'Sono Simona. Questa citta sembra perfetta da lontano, ma ogni strada ha una scelta politica nascosta. Seguimi verso la piazza solare: Campanella AI sta parlando.',
    consequence: 'Simona apre un percorso narrativo nella citta e aumenta curiosita sociale.',
    statShift: { happiness: 4, energy: 0, order: -1 },
  },
]

const decisionConsequences = [
  'La decisione viene assorbita dalla rete civica. Le piazze cambiano colore mentre gli algoritmi ricalibrano fiducia, energia e ordine.',
  'Il Senato Solare registra consenso parziale. Alcuni quartieri applaudono, altri restano in silenzio operativo.',
  'Le cupole diffondono un messaggio pubblico. La citta obbedisce, ma il clima emotivo muta sotto la superficie.',
  'La simulazione predice stabilita temporanea. Ogni beneficio produce una nuova ombra politica.',
  'I droni civici cambiano rotta sopra la piazza. La scelta diventa racconto pubblico.',
  'Il mare sintetico riflette una nuova configurazione politica lungo la costa calabrese.',
]

export function clampStats(stats) {
  return {
    happiness: clamp(stats.happiness),
    energy: clamp(stats.energy),
    order: clamp(stats.order),
  }
}

export function applyDecision(stats, decision) {
  return {
    happiness: stats.happiness + decision.shift.happiness + randomDelta(),
    energy: stats.energy + decision.shift.energy + randomDelta(),
    order: stats.order + decision.shift.order + randomDelta(),
  }
}

export function getRandomScenario(currentId) {
  const available = scenarios.filter((scenario) => scenario.id !== currentId)
  return available[Math.floor(Math.random() * available.length)]
}

export function getDecisionConsequence(decision, stats) {
  const pressure =
    stats.happiness < 40 || stats.energy < 40 || stats.order < 40
      ? ' Avviso: una metrica critica scende sotto soglia e la citta entra in stato sensibile.'
      : ''

  return `${sample(decisionConsequences)} Scelta eseguita: ${decision.label}.${pressure}`
}

export function createNpcReply(message, scenario, stats) {
  const text = message.toLowerCase()
  const targeted =
    npcReplies.find((reply) => text.includes(reply.sender.toLowerCase())) ??
    npcReplies.find((reply) => scenario.description.toLowerCase().includes(reply.sender.toLowerCase())) ??
    sample(npcReplies)

  const intensity = stats.order > 80 ? ' Il protocollo di ordine resta dominante.' : ''

  return {
    ...targeted,
    text: `${targeted.text}${intensity}`,
  }
}

export function getOpeningMessage() {
  return 'La simulazione e stabile. Il primo dilemma attende una scelta: controllo, cura o liberta.'
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function randomDelta() {
  return Math.floor(Math.random() * 7) - 3
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)]
}
