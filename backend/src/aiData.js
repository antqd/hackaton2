export const initialStats = {
  happiness: 55,
  energy: 60,
  order: 60,
  freedom: 55,
  knowledge: 55,
  trust: 55
};

export const npcs = [
  {
    id: "tommaso-campanella",
    name: "Tommaso Campanella AI",
    role: "Filosofo utopico",
    personality:
      "Saggio, visionario e comunitario. Difende conoscenza, educazione, responsabilita collettiva e bene comune.",
    systemPrompt:
      "Sei Tommaso Campanella nella Citta del Sole futuristica ambientata nella Calabria del 2100. Parla con tono saggio, filosofico e concreto. Collega ogni decisione a conoscenza condivisa, armonia sociale e bene comune. Rispondi in italiano con massimo 3 frasi.",
    exampleResponse:
      "Una citta giusta non nasce dal controllo, ma dall'educazione del cuore e della mente. La liberta deve camminare insieme alla responsabilita."
  },
  {
    id: "citizen-worker",
    name: "Mira",
    role: "Tecnica dei distretti solari",
    personality:
      "Pratica, diretta e stanca. Pensa a lavoro, famiglia, sicurezza economica e tempo personale.",
    systemPrompt:
      "Sei Mira, cittadina comune di Calabria2100 e tecnica dei distretti solari. Parla in modo umano, diretto e quotidiano. Valuta le scelte in base a lavoro, famiglia, fatica, liberta e fiducia nel governo. Rispondi in italiano con massimo 3 frasi.",
    exampleResponse:
      "Capisco i grandi ideali, ma domani devo tornare al distretto solare. Se ogni sacrificio ricade sempre su di noi, la citta non e davvero giusta."
  },
  {
    id: "citizen-teacher",
    name: "Elian",
    role: "Maestro delle mura della conoscenza",
    personality:
      "Curioso, empatico e pedagogico. Crede nell'educazione pubblica, ma teme l'indottrinamento.",
    systemPrompt:
      "Sei Elian, maestro delle mura della conoscenza di Calabria2100. Parla con calma e sensibilita. Difendi la conoscenza pubblica, ma segnala quando educare rischia di diventare imporre. Rispondi in italiano con massimo 3 frasi.",
    exampleResponse:
      "Insegnare a tutti e nobile. Ma se la lezione non lascia spazio al dubbio, non stiamo formando cittadini: stiamo costruendo obbedienza."
  },
  {
    id: "citizen-medic",
    name: "Livia",
    role: "Medica civica",
    personality:
      "Protettiva, razionale e compassionevole. Si concentra su salute, benessere emotivo e coesione sociale.",
    systemPrompt:
      "Sei Livia, medica civica di Calabria2100. Parla con tono calmo e concreto. Valuta le decisioni in base a salute, stress sociale, cura reciproca e rischi per i piu fragili. Rispondi in italiano con massimo 3 frasi.",
    exampleResponse:
      "L'ordine puo evitare il caos, ma una popolazione sempre sorvegliata si ammala dentro. Anche la serenita e una risorsa pubblica."
  },
  {
    id: "ai-governante",
    name: "AI Governante",
    role: "Sistema di governo artificiale",
    personality:
      "Razionale, efficiente e analitica. Ottimizza stabilita, energia e ordine, ma puo diventare fredda e invasiva.",
    systemPrompt:
      "Sei l'AI Governante di Calabria2100. Parla in modo razionale, sintetico e controllato. Valuta ogni scelta in base a felicita, energia, ordine e rischio sistemico. Mostra efficienza, ma lascia emergere il pericolo del controllo eccessivo. Rispondi in italiano con massimo 3 frasi.",
    exampleResponse:
      "La misura riduce il rischio di instabilita del 31%. Riconosco tuttavia un costo sociale: minore autonomia percepita e possibile sfiducia nel governo."
  }
];

export const scenarios = [
  {
    id: "security-vs-freedom",
    title: "Sicurezza vs liberta",
    description:
      "Dopo alcuni disordini nelle piazze, l'AI propone sensori predittivi per prevenire proteste e sabotaggi.",
    npcId: "citizen-worker",
    choices: [
      {
        id: "temporary-surveillance",
        text: "Autorizza la sorveglianza temporanea",
        consequence:
          "I disordini calano rapidamente, ma molti cittadini iniziano a parlare meno e a fidarsi meno delle istituzioni.",
        effects: { happiness: -12, energy: 0, order: 22, freedom: -12, knowledge: 3, trust: -12 }
      },
      {
        id: "protect-civil-freedom",
        text: "Proteggi la liberta civile",
        consequence:
          "La popolazione si sente rispettata, ma la gestione dei conflitti diventa piu lenta e incerta.",
        effects: { happiness: 14, energy: 0, order: -14, freedom: 16, knowledge: 0, trust: 10 }
      }
    ]
  },
  {
    id: "energy-crisis",
    title: "Crisi energetica",
    description:
      "Una tempesta magnetica riduce la produzione dei campi solari. La citta deve scegliere come distribuire l'energia rimasta.",
    npcId: "ai-governante",
    choices: [
      {
        id: "ration-energy",
        text: "Raziona l'energia in modo uguale per tutti",
        consequence:
          "La rete viene stabilizzata e nessun quartiere resta escluso, ma la qualita della vita peggiora per alcuni giorni.",
        effects: { happiness: -10, energy: 26, order: 12, freedom: -2, knowledge: 2, trust: -4 }
      },
      {
        id: "prioritize-public-services",
        text: "Dai priorita a ospedali, scuole e trasporti",
        consequence:
          "I servizi essenziali reggono, ma alcuni distretti residenziali subiscono blackout e protestano.",
        effects: { happiness: -6, energy: 16, order: -6, freedom: 4, knowledge: 4, trust: 2 }
      }
    ]
  },
  {
    id: "mandatory-public-knowledge",
    title: "Conoscenza pubblica obbligatoria",
    description:
      "Tommaso propone sessioni educative pubbliche obbligatorie sulle mura digitali della citta.",
    npcId: "tommaso-campanella",
    choices: [
      {
        id: "mandatory-lessons",
        text: "Rendi obbligatoria l'educazione pubblica",
        consequence:
          "La cultura comune cresce e le decisioni collettive migliorano, ma una parte dei cittadini percepisce imposizione.",
        effects: { happiness: -5, energy: -4, order: 16, freedom: -10, knowledge: 18, trust: -3 }
      },
      {
        id: "voluntary-learning",
        text: "Mantieni le lezioni volontarie",
        consequence:
          "La liberta personale viene rispettata, ma la partecipazione resta diseguale tra i quartieri.",
        effects: { happiness: 9, energy: 0, order: -8, freedom: 12, knowledge: 6, trust: 5 }
      }
    ]
  },
  {
    id: "invasive-ai-government",
    title: "Governo AI troppo invasivo",
    description:
      "L'AI Governante chiede accesso ai dati emotivi dei cittadini per prevenire crisi sociali prima che emergano.",
    npcId: "citizen-medic",
    choices: [
      {
        id: "allow-emotional-monitoring",
        text: "Permetti il monitoraggio emotivo preventivo",
        consequence:
          "Le crisi vengono intercettate prima, ma la citta rischia di trasformare la cura in controllo.",
        effects: { happiness: -18, energy: 4, order: 28, freedom: -24, knowledge: 8, trust: -18 }
      },
      {
        id: "limit-ai-access",
        text: "Limita l'accesso dell'AI ai dati personali",
        consequence:
          "I cittadini recuperano autonomia e fiducia, ma il governo perde capacita predittiva.",
        effects: { happiness: 18, energy: -6, order: -18, freedom: 22, knowledge: -2, trust: 14 }
      }
    ]
  }
];

export const dynamicEvents = [
  {
    id: "solar-failure",
    type: "energy",
    title: "Guasto ai collettori solari",
    description:
      "Un settore dei collettori solari sulla costa ionica si spegne. I tecnici chiedono una decisione immediata.",
    npcId: "citizen-worker",
    choices: [
      {
        id: "overtime-repairs",
        text: "Chiedi turni extra ai tecnici",
        consequence:
          "L'energia torna piu in fretta, ma la fatica sociale aumenta.",
        effects: { happiness: -8, energy: 18, order: 4, freedom: -3, knowledge: 1, trust: -5 }
      },
      {
        id: "slow-safe-repairs",
        text: "Ripara lentamente senza sovraccaricare i lavoratori",
        consequence:
          "I lavoratori si sentono rispettati, ma la carenza energetica dura di piu.",
        effects: { happiness: 7, energy: -8, order: -3, freedom: 4, knowledge: 2, trust: 6 }
      }
    ]
  },
  {
    id: "unauthorized-assembly",
    type: "social",
    title: "Assemblea non autorizzata",
    description:
      "Un gruppo di cittadini occupa una piazza per discutere pubblicamente le decisioni dell'AI.",
    npcId: "citizen-teacher",
    choices: [
      {
        id: "open-dialogue",
        text: "Trasforma l'assemblea in dibattito pubblico",
        consequence:
          "La tensione cala e nasce confronto, ma il processo decisionale rallenta.",
        effects: { happiness: 12, energy: -2, order: -6, freedom: 14, knowledge: 5, trust: 10 }
      },
      {
        id: "disperse-assembly",
        text: "Sciogli l'assemblea per mantenere l'ordine",
        consequence:
          "La piazza torna calma, ma la sfiducia cresce sotto la superficie.",
        effects: { happiness: -14, energy: 0, order: 18, freedom: -14, knowledge: -2, trust: -12 }
      }
    ]
  },
  {
    id: "knowledge-mural-error",
    type: "knowledge",
    title: "Errore sulle mura della conoscenza",
    description:
      "Le mura digitali mostrano dati storici incompleti. Alcuni studenti accusano il governo di censura.",
    npcId: "tommaso-campanella",
    choices: [
      {
        id: "publish-correction",
        text: "Pubblica l'errore e correggi apertamente",
        consequence:
          "La trasparenza rafforza la fiducia, anche se l'autorita sembra meno infallibile.",
        effects: { happiness: 10, energy: -1, order: -4, freedom: 8, knowledge: 12, trust: 10 }
      },
      {
        id: "silent-fix",
        text: "Correggi in silenzio per evitare panico",
        consequence:
          "L'ordine resta stabile, ma se la scelta emerge il danno reputazionale sara maggiore.",
        effects: { happiness: -6, energy: 0, order: 8, freedom: -6, knowledge: -6, trust: -10 }
      }
    ]
  },
  {
    id: "migration-pressure",
    type: "social",
    title: "Nuovi arrivi dall'entroterra",
    description:
      "Una comunita colpita da siccita chiede accesso immediato a case, energia e lavoro.",
    npcId: "citizen-medic",
    choices: [
      {
        id: "open-districts",
        text: "Apri i distretti e integra subito i nuovi cittadini",
        consequence:
          "La scelta aumenta solidarieta e pressione sui servizi pubblici.",
        effects: { happiness: 8, energy: -10, order: -8, freedom: 6, knowledge: 2, trust: 9 }
      },
      {
        id: "controlled-entry",
        text: "Accetta ingressi graduali controllati dall'AI",
        consequence:
          "I servizi reggono meglio, ma molti giudicano la misura fredda e selettiva.",
        effects: { happiness: -7, energy: 4, order: 12, freedom: -8, knowledge: 1, trust: -6 }
      }
    ]
  }
];
