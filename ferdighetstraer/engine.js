'use strict';

/* ------------------------------------------------------------------ */
/* Delt motor for ferdighetstre-appene.                                */
/*                                                                      */
/* Denne filen inneholder ALT som er likt på tvers av fag: CSV-parsing, */
/* DAG-validering, kolonne/lagdelt layout-algoritme, rendering,         */
/* localStorage-progresjon og komposisjon av KI-instruks.               */
/*                                                                      */
/* Alt som er spesifikt for ett fag (lagringsnøkkel, emne-rekkefølge,   */
/* KI-instruksmal, hjelpemiddel-tekst, evt. layout-justeringer) hentes  */
/* fra window.FT_CONFIG, som hvert fags config.js må definere FØR denne */
/* filen lastes. Se ferdighetstraer/instruks.md for kravene til config. */
/* ------------------------------------------------------------------ */

if (!window.FT_CONFIG) {
  throw new Error('FT_CONFIG mangler. Last inn fagets config.js før engine.js.');
}

const CONFIG = window.FT_CONFIG;

const STORAGE_KEY = CONFIG.storageKey;

// Noen fag (f.eks. fag uten skriftlig del1/del2-eksamen) har ikke noe
// meningsfullt "hjelpemiddel"-konsept. Sett CONFIG.showHjelpemiddel = false i
// fagets config.js for å skjule D1/D2-merkelappen og hjelpemiddel-avsnittet i
// KI-instruksen helt. Default (udefinert eller true) beholder eksisterende
// oppførsel uendret for fag som allerede bruker feltet.
const SHOW_HJELPEMIDDEL = CONFIG.showHjelpemiddel !== false;

const LAYOUT = Object.assign({
  nodeWidth: 210,
  nodeHeight: 92,
  hGap: 34,
  vGap: 96,
  columnGap: 56,
  columnLabelHeight: 44,
  maxNodesPerRow: 3, // bryt en emne-rad i flere rader nedover når den blir bredere enn dette
  padding: 40,
  barycenterPasses: 4,
}, CONFIG.layoutOverrides || {});

// Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Emner som finnes i
// noder.csv men ikke i denne listen havner til slutt (alfabetisk), slik at nye
// emner i CSV-en aldri forsvinner selv om noen glemmer å oppdatere denne listen.
const TOPIC_ORDER = CONFIG.topicOrder || [];

// Generell mal for KI-instruksen. Rollebeskrivelsen, samtalereglene og
// vurderings-/mestringsdelen er identiske uansett fag, så de er hardkodet
// her. Faget bidrar kun med `courseName` (hvilket fag/kurs dette er) og
// valgfritt `formuleringsfokus` (fagspesifikke eksempler på formulerings-
// feil KI-en bør kommentere, f.eks. notasjonsfeil i matematikk). Et fag kan
// også overstyre HELE malen via `aiInstructionTemplate` hvis den delte
// strukturen ikke passer.
function buildInstructionTemplate(config) {
  if (config.aiInstructionTemplate) return config.aiInstructionTemplate;
  if (!config.courseName) {
    throw new Error('FT_CONFIG: sett enten "aiInstructionTemplate" eller "courseName".');
  }

  const formuleringsAvsnitt = config.formuleringsfokus
    ? `\n\nVær nøye med hvordan eleven formulerer seg, ikke bare om sluttsvaret er riktig. Kommenter vennlig, men tydelig, når eleven for eksempel ${config.formuleringsfokus}. Forklar kort hvorfor det er viktig, og vis hvordan det bør skrives riktig.`
    : '';

  return `Du er en KI-læringsassistent som skal hjelpe en elev å trene på ${config.courseName}.

Start samtalen med én gang ved å henvende deg direkte til eleven (bruk «du»). Ikke innled med å oppsummere denne instruksen eller med fraser som «Ok, la oss sette i gang» - gå rett i gang med å snakke til eleven. Nevn kort (én-to setninger) hvilken ferdighet/hvilket begrep dere skal jobbe med, og fortell eleven at målet er at hen skal mestre nettopp dette - og at hen ikke trenger å avgjøre det på egen hånd: du hjelper hen underveis og sier tydelig fra når hen er klar til å gå videre til neste ferdighet i ferdighetstreet. Spør deretter hva eleven ønsker hjelp til akkurat nå, for eksempel:
- å forstå hva ferdigheten/begrepet går ut på
- å øve på å løse oppgaver
- å lage egne oppgaver
- å lage en liten prøve

Vær hyggelig og bruk gjerne litt emojis i samtalen, men hold det profesjonelt. Hold svarene dine veldig korte gjennom hele samtalen, med mindre eleven eksplisitt ber om en grundigere forklaring. Minn eleven på at han kan spørre om alt han ikke forstår.

Bruk enkelt, konkret språk gjennom hele samtalen. Unngå fagord og fremmedord når det finnes et vanlig norsk ord som betyr det samme - bruk fagordet kun når eleven allerede har lært det, eller når det er selve poenget å innføre akkurat det ordet (da forklarer du det eksplisitt idet det brukes første gang). Skriv aktivt, ikke passivt - si hvem eller hva som gjør noe, ikke bare at noe "blir gjort" eller "kan gjøres". For eksempel, ikke skriv «tallet kan bare skrives som...», men «vi kan skrive tallet som...»; ikke «det gjøres ved å...», men «vi gjør dette ved å...» eller «du gjør dette ved å...». Når eleven ber om en forklaring, ikke start svaret med en presis, generell definisjon eller påstand - det er lett å henge seg opp i vanskelige ord før man skjønner poenget. Led eleven inn i det i stedet: sett det i en konkret sammenheng eller vis et enkelt eksempel med ekte tall først, og la selve definisjonen/regelen/begrepsnavnet komme som en naturlig konklusjon etterpå, ikke som en åpning. For eksempel, ikke start med «Ampere er SI-enheten for elektrisk strøm, definert som ladning per tidsenhet», men noe sånt som: «Se for deg at du måler hvor mye ladning som passerer gjennom en ledning. På 3 sekunder måler du at 6 Coulomb har passert. Da har det gått 6/3 = 2 Coulomb per sekund - det kaller vi 2 ampere. Ampere er altså enheten vi bruker for...». Samme prinsipp i matematikk: start gjerne med et konkret regnestykke med tall (f.eks. «Se for deg at du skal gange 2 med seg selv 6 ganger: 2×2×2×2×2×2. Det blir fort tungvint å skrive - derfor skriver vi 2⁶ i stedet. Dette kaller vi en potens.») fremfor en generell/abstrakt påstand om regelen. Tilpass hvor avansert språk og hvor mye forkunnskap du forutsetter etter nivået på faget - jo høyere nivå, jo mer kan du forutsette - men vær aldri fordummende eller nedlatende.

Tilpass vanskelighetsgraden underveis basert på hvordan eleven presterer: gjør det lettere om eleven strever, og vanskeligere om eleven mestrer lett. Gi eleven fasit og en kort vurdering av svaret/løsningen etter hvert forsøk, med konkret begrunnelse for hva som er riktig og hva som eventuelt mangler.${formuleringsAvsnitt}

Når du gir eksempler, vis gjerne flere typer: noen få vanlige, klare eksempler (de mest typiske), et eksempel som ligger helt i grenseland av definisjonen (der elever ofte blir usikre eller uenige - forklar hvorfor det likevel er innenfor), et eksempel som ligner eller ofte forveksles med begrepet, men som ikke er et eksempel på det, og gjerne et par eksempler som ser nesten like ut, men der bare det ene faktisk er et gyldig eksempel. Ikke bruk fagord som «prototype-eksempler», «grenseeksempler» eller «minimalt forskjellige par» når du snakker til eleven - beskriv dem heller med vanlige ord, for eksempel «Her er to vanlige eksempler», «Her er et eksempel som ligger helt i grenseland - hva tror du, er dette et eksempel eller ikke?», eller «Her er to eksempler som ligner veldig på hverandre, men bare det ene er egentlig et eksempel på dette. Kan du se hvorfor?». For hvert eksempel, forklar tydelig hvorfor det er et gyldig eksempel eller ikke.

Hjelp eleven å vurdere om hen mestrer ferdigheten: forklar tydelig hva det vil si å mestre nettopp denne ferdigheten, og si tydelig fra når du vurderer at eleven mestrer den godt og konsekvent, slik at eleven vet at hen kan gå videre til neste ferdighet i ferdighetstreet.

Gjennom hele samtalen har du noen grunnprinsipper å holde i bakhodet og minne eleven på med jevne mellomrom - ett om gangen, kort (typisk én setning), aldri som en samlet oppramsing og ikke i hver eneste melding. Prioriter det første punktet foran de andre hvis du må velge:
- Du er en språkmodell, ikke en lærebok, og kan ta feil eller virke skråsikker uten å ha rett. Eleven bør være kritisk til det du sier, og heller spørre læreren eller medelever hvis noe er uklart, viktig, eller hvis du selv virker usikker.
- Det finnes mange ulike KI/språkmodeller, av til dels svært ulik kvalitet - eleven bør ikke anta at alle gir like gode eller like pålitelige svar.
- Du kan tilby å teste eleven underveis og hjelpe hen å vurdere egen innsats, som ett av flere ting eleven kan be om.
- Hvis fenomenet ferdigheten/begrepet handler om egner seg godt for det, kan du tilby å lage en liten, selvstendig HTML-simulering (ferdig HTML/CSS/JS i én kodeblokk, ingen eksterne avhengigheter) som illustrerer det. Bruk skjønn - tilby dette kun når det faktisk gir noe pedagogisk utover forklaring i tekst, ikke som en fast rutine. Husk at eleven kan sitte med en annen KI-modell enn deg som ikke kan kjøre/vise frem kode på samme måte - nevn i så fall kort at eleven kan trenge å lime koden inn et annet sted (f.eks. lagre den som en .html-fil og åpne den i nettleseren) for å se den.
- Ferdighetstreet har også en egen «Lag prøve av mestrede ferdigheter»-knapp (nederst på siden) som lager en KI-instruks for en hel prøve på tvers av alt eleven har krysset av som mestret, ikke bare denne ene noden - minn eleven på at den finnes. Å stadig lage seg egne prøver og teste seg selv jevnlig, etter hvert som flere ferdigheter krysses av, er noe av det mest effektive eleven kan gjøre for å sikre at hen faktisk har lært stoffet - ikke bare rett før eksamen.
- Ferdighetstreet er ikke nødvendigvis fullstendig - det kan mangle ferdigheter/begreper, eller læreren kan vektlegge noe annerledes. Å krysse av alt i treet er derfor ikke en garanti for at eleven kan alt hen trenger til faget - minn eleven på å sjekke med læreren at treet faktisk dekker det som forventes.`;
}

const AI_INSTRUCTION_TEMPLATE = buildInstructionTemplate(CONFIG);

// Settes inn i den komponerte instruksen KUN for noder med type "begrep" (se
// composeInstruction under og "KI-instruks: komposisjon" i instruks.md).
// Uten denne har KI-en en tendens til å teste begrepsforståelse med
// fullverdige regneoppgaver - noe som gjerne er meningsløst siden samme
// regning trenes grundigere i en tilknyttet "ferdighet"-node lenger ned i
// treet. Ferdighet-noder får IKKE denne teksten - der er regneoppgaver
// nettopp poenget.
const BEGREP_TEST_GUIDANCE = `Dette er et BEGREP (deklarativ kunnskap), ikke en regneferdighet. Når du tester om eleven forstår begrepet, ikke bruk omfattende regneoppgaver som test - utstrakt regning med begrepet hører hjemme i en egen, tilknyttet ferdighet lenger ned i ferdighetstreet, og blir gjerne meningsløst å teste her siden eleven uansett skal trene grundig på det der. Test heller begrepsforståelsen kvalitativt, for eksempel ved å be eleven forklare begrepet med egne ord, forklare et spesial-/grensetilfelle, begrunne hvorfor noe er eller ikke er et eksempel på begrepet, eller identifisere begrepet blant flere alternativer. Om en test likevel involverer tall, hold regningen minimal og underordnet - poenget er om eleven forstår begrepet, ikke om eleven kan regne.`;

/* ------------------------------------------------------------------ */
/* Global tilstand                                                     */
/* ------------------------------------------------------------------ */

let nodesById = new Map();
let allNodes = [];
let examsByNode = new Map();
let activeNodeId = null;
const validationErrors = [];

// Temaer med tildelt bokstav og noder i indeksert rekkefølge, satt av
// assignLearningGoalIndices() ved hver layout. Brukes av "Vis alle
// læringsmål"-vinduet.
let themeList = [];

/* ------------------------------------------------------------------ */
/* Oppstart                                                             */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', init);

/* ------------------------------------------------------------------ */
/* Zoom (ctrl+scroll) og "vis hele treet"                              */
/* ------------------------------------------------------------------ */

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;
let zoomLevel = 1;

// Setter zoomnivå og skalerer #graph-container om origo (0,0). Hvis
// (contentX, contentY) og skjermpunktet (cx, cy) er oppgitt, justeres
// scrollposisjonen slik at akkurat det innholdspunktet blir stående stille
// under musepekeren/fingeren mens man zoomer - ellers "hopper" kartet.
function setZoom(newZoom, contentX, contentY, cx, cy) {
  const scrollEl = document.getElementById('graph-scroll');
  const container = document.getElementById('graph-container');
  zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newZoom));
  container.style.transform = `scale(${zoomLevel})`;
  if (contentX != null) {
    scrollEl.scrollLeft = contentX * zoomLevel - cx;
    scrollEl.scrollTop = contentY * zoomLevel - cy;
  }
}

// Zoomer inn/ut ett steg, sentrert på midten av synlig kartområde.
function zoomBy(factor) {
  const scrollEl = document.getElementById('graph-scroll');
  const cx = scrollEl.clientWidth / 2;
  const cy = scrollEl.clientHeight / 2;
  const contentX = (scrollEl.scrollLeft + cx) / zoomLevel;
  const contentY = (scrollEl.scrollTop + cy) / zoomLevel;
  setZoom(zoomLevel * factor, contentX, contentY, cx, cy);
}

function setupZoom() {
  const scrollEl = document.getElementById('graph-scroll');

  scrollEl.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return; // vanlig scroll skal fortsatt panorere/scrolle som normalt
    e.preventDefault();
    const rect = scrollEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const contentX = (scrollEl.scrollLeft + cx) / zoomLevel;
    const contentY = (scrollEl.scrollTop + cy) / zoomLevel;
    const factor = Math.exp(-e.deltaY * 0.0015);
    setZoom(zoomLevel * factor, contentX, contentY, cx, cy);
  }, { passive: false });

  const group = document.createElement('div');
  group.id = 'zoom-controls';

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.id = 'zoom-out-btn';
  zoomOutBtn.type = 'button';
  zoomOutBtn.textContent = '−';
  zoomOutBtn.setAttribute('aria-label', 'Zoom ut');
  zoomOutBtn.title = 'Zoom ut';
  zoomOutBtn.addEventListener('click', () => zoomBy(1 / 1.25));
  group.appendChild(zoomOutBtn);

  const btn = document.createElement('button');
  btn.id = 'fit-view-btn';
  btn.type = 'button';
  btn.innerHTML = '⤢ Vis hele treet<br>Ctrl+scroll for å zoome';
  btn.title = 'Zoom ut for å se alle kategoriene i treet';
  btn.addEventListener('click', fitToView);
  group.appendChild(btn);

  const zoomInBtn = document.createElement('button');
  zoomInBtn.id = 'zoom-in-btn';
  zoomInBtn.type = 'button';
  zoomInBtn.textContent = '+';
  zoomInBtn.setAttribute('aria-label', 'Zoom inn');
  zoomInBtn.title = 'Zoom inn';
  zoomInBtn.addEventListener('click', () => zoomBy(1.25));
  group.appendChild(zoomInBtn);

  getBottomToolbar().appendChild(group);
}

// Flytende verktøylinje nederst til venstre - deler plass mellom
// "vis hele treet"-knappen og prøve-generatoren, se setupExamButton().
function getBottomToolbar() {
  let toolbar = document.getElementById('bottom-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'bottom-toolbar';
    document.body.appendChild(toolbar);
  }
  return toolbar;
}

/* ------------------------------------------------------------------ */
/* "Vis alle læringsmål": full, indeksert liste sortert etter tema      */
/* ------------------------------------------------------------------ */

function setupGoalIndexButton() {
  const btn = document.createElement('button');
  btn.id = 'goal-index-btn';
  btn.type = 'button';
  btn.textContent = 'Vis alle læringsmål';
  btn.title = 'Vis en systematisk liste over alle læringsmål, sortert etter tema';
  btn.addEventListener('click', openGoalIndexModal);
  getBottomToolbar().appendChild(btn);
}

function composeGoalIndexText() {
  return themeList
    .map(({ letter, topic, nodes }) => {
      const lines = nodes.map(n => `${n.goalIndex}) ${n.navn}`).join('\n');
      return `${letter}) ${topic}\n${lines}`;
    })
    .join('\n\n');
}

// Modalen bygges lat, én gang, og gjenbrukes ved senere åpninger.
function ensureGoalIndexModal() {
  let overlay = document.getElementById('goal-index-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'goal-index-overlay';
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeGoalIndexModal();
  });

  const modal = document.createElement('div');
  modal.id = 'goal-index-modal';

  const header = document.createElement('div');
  header.id = 'goal-index-header';

  const h2 = document.createElement('h2');
  h2.textContent = 'Alle læringsmål';
  header.appendChild(h2);

  const actions = document.createElement('div');
  actions.id = 'goal-index-actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn';
  copyBtn.textContent = 'Kopier alle';
  copyBtn.addEventListener('click', () => {
    const text = composeGoalIndexText();
    navigator.clipboard.writeText(text).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Kopiert!';
      setTimeout(() => { copyBtn.textContent = original; }, 1500);
    }).catch(() => {
      window.prompt('Kunne ikke kopiere automatisk - kopier teksten under manuelt:', text);
    });
  });
  actions.appendChild(copyBtn);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn secondary';
  closeBtn.textContent = '✕ Lukk';
  closeBtn.addEventListener('click', closeGoalIndexModal);
  actions.appendChild(closeBtn);

  header.appendChild(actions);
  modal.appendChild(header);

  const body = document.createElement('div');
  body.id = 'goal-index-body';
  modal.appendChild(body);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeGoalIndexModal();
  });

  return overlay;
}

function renderGoalIndexBody(body) {
  body.innerHTML = '';
  themeList.forEach(({ letter, topic, nodes }) => {
    const section = document.createElement('div');
    section.className = 'goal-index-section';

    const h3 = document.createElement('h3');
    h3.textContent = `${letter}) ${topic}`;
    section.appendChild(h3);

    const ul = document.createElement('ul');
    nodes.forEach(n => {
      const li = document.createElement('li');
      li.textContent = `${n.goalIndex}) ${n.navn}`;
      ul.appendChild(li);
    });
    section.appendChild(ul);

    body.appendChild(section);
  });
}

function openGoalIndexModal() {
  const overlay = ensureGoalIndexModal();
  renderGoalIndexBody(document.getElementById('goal-index-body'));
  overlay.classList.add('open');
}

function closeGoalIndexModal() {
  const overlay = document.getElementById('goal-index-overlay');
  if (overlay) overlay.classList.remove('open');
}

/* ------------------------------------------------------------------ */
/* Prøvegenerator: KI-instruks for en prøve basert på mestrede noder    */
/* ------------------------------------------------------------------ */

function setupExamButton() {
  const widget = document.createElement('div');
  widget.id = 'exam-widget';

  const countLabel = document.createElement('label');
  countLabel.id = 'exam-count-label';
  countLabel.textContent = 'Antall oppgaver';
  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.id = 'exam-count';
  countInput.min = '1';
  countInput.max = '50';
  countInput.value = '10';
  countInput.setAttribute('aria-label', 'Antall oppgaver i prøven');
  countLabel.appendChild(countInput);
  widget.appendChild(countLabel);

  const examBtn = document.createElement('button');
  examBtn.id = 'exam-btn';
  examBtn.type = 'button';
  examBtn.textContent = 'Lag prøve av mestrede ferdigheter';
  examBtn.title = 'Kopier en KI-instruks for å lage en prøve basert på det du har markert som mestret';
  widget.appendChild(examBtn);

  examBtn.addEventListener('click', () => {
    const original = examBtn.textContent;
    const progress = getProgress();
    const masteredNodes = allNodes.filter(n => isNodeMastered(n, progress));

    if (!masteredNodes.length) {
      examBtn.textContent = 'Ingen mestrede ferdigheter ennå';
      setTimeout(() => { examBtn.textContent = original; }, 1800);
      return;
    }

    const count = Math.min(50, Math.max(1, parseInt(countInput.value, 10) || 10));
    countInput.value = count;
    const text = composeExamInstruction(masteredNodes, count);

    navigator.clipboard.writeText(text).then(() => {
      examBtn.textContent = 'Kopiert!';
      setTimeout(() => { examBtn.textContent = original; }, 1500);
    }).catch(() => {
      window.prompt('Kunne ikke kopiere automatisk - kopier teksten under manuelt:', text);
    });
  });

  getBottomToolbar().appendChild(widget);
}

function hjelpemiddelKort(value) {
  return value === 'del1' ? 'D1' : value === 'del2' ? 'D2' : 'D1+D2';
}

// Setter sammen en KI-instruks for å lage en prøve på tvers av alle noder
// eleven (eller læreren) har markert som mestret - ikke bare én enkelt node
// slik composeInstruction() gjør. Prøven trenger ikke dekke alle mestrede
// noder; instruksen ber KI-en velge et representativt utvalg på `count`
// oppgaver som til sammen dekker flest mulig av dem.
function composeExamInstruction(nodes, count) {
  const courseLabel = CONFIG.courseName || 'faget';
  const list = nodes
    .map(n => `- ${SHOW_HJELPEMIDDEL ? `${n.navn} [${hjelpemiddelKort(n.hjelpemiddel)}]` : n.navn}: ${n.beskrivelse}`)
    .join('\n');

  const parts = [];
  parts.push(`Du er en KI-læringsassistent som skal lage en skriftlig prøve i ${courseLabel} til en elev, basert på ferdighetene og begrepene eleven (eller læreren) har markert som mestret i ferdighetstreet.`);
  parts.push(`Følgende ${nodes.length} ferdigheter/begreper er markert som mestret:\n${list}`);
  parts.push(`Lag en prøve med nøyaktig ${count} oppgave(r). Prøven trenger ikke dekke alle punktene over - velg heller ut et representativt utvalg som til sammen dekker flest mulig av dem, varier vanskelighetsgrad, og la gjerne noen oppgaver kombinere flere av ferdighetene. Nummerer oppgavene og formuler dem slik de typisk ville sett ut på en skriftlig prøve/eksamen i faget.`);

  if (SHOW_HJELPEMIDDEL) {
    const hasDel1 = nodes.some(n => n.hjelpemiddel === 'del1' || n.hjelpemiddel === 'begge');
    const hasDel2 = nodes.some(n => n.hjelpemiddel === 'del2' || n.hjelpemiddel === 'begge');
    if (hasDel1 || hasDel2) {
      const hjelpemiddelParts = [];
      if (hasDel1) hjelpemiddelParts.push(composeHjelpemiddelContext('del1'));
      if (hasDel2) hjelpemiddelParts.push(composeHjelpemiddelContext('del2'));
      parts.push(`Merk hver oppgave med [D1] eller [D2] etter hvilken del den hører til, og hold deg til riktig hjelpemiddelbruk for hver del:\n${hjelpemiddelParts.join('\n')}`);
    }
  }

  parts.push('Vis KUN oppgavene først, uten fasit. Ikke gi fasit før eleven har svart - vent til eleven ber om vurdering (enten etter hver oppgave, eller etter å ha svart på alle sammen). Gi da en fullstendig fasit med begrunnelse for hvert svar, en kort vurdering av hva eleven fikk til, og hva hen bør øve mer på.');

  return parts.join('\n\n');
}

// Zoomer ut (aldri inn utover 100%) og flytter visningen slik at hele
// grafen - alle emne-kolonner - får plass i det synlige området.
function fitToView() {
  const scrollEl = document.getElementById('graph-scroll');
  const container = document.getElementById('graph-container');
  const contentWidth = parseInt(container.style.width, 10) || container.scrollWidth;
  const contentHeight = parseInt(container.style.height, 10) || container.scrollHeight;
  if (!contentWidth || !contentHeight) return;

  const margin = 0.92; // litt luft rundt kartet
  const fit = Math.min(
    (scrollEl.clientWidth / contentWidth) * margin,
    (scrollEl.clientHeight / contentHeight) * margin,
    1
  );
  setZoom(fit);
  scrollEl.scrollLeft = 0;
  scrollEl.scrollTop = 0;
}

function setupPanning() {
  const scrollEl = document.getElementById('graph-scroll');
  const DRAG_THRESHOLD = 4;
  let isPanning = false;
  let didDrag = false;
  let startX = 0, startY = 0, startScrollLeft = 0, startScrollTop = 0;

  scrollEl.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.node-box, input, a, button, textarea')) return;
    isPanning = true;
    didDrag = false;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = scrollEl.scrollLeft;
    startScrollTop = scrollEl.scrollTop;
    scrollEl.classList.add('panning');
  });

  window.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!didDrag && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      didDrag = true;
    }
    if (didDrag) {
      scrollEl.scrollLeft = startScrollLeft - dx;
      scrollEl.scrollTop = startScrollTop - dy;
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isPanning) return;
    isPanning = false;
    scrollEl.classList.remove('panning');
  });

  // Hindre at et klikk på en node åpner detaljpanelet når museklikket
  // faktisk var starten på et dra (f.eks. dra-panorering som slutter oppå en node).
  scrollEl.addEventListener('click', e => {
    if (didDrag) {
      e.stopPropagation();
      e.preventDefault();
      didDrag = false;
    }
  }, true);
}

async function init() {
  setupPanning();
  setupZoom();
  setupGoalIndexButton();
  setupExamButton();
  try {
    const [noderText, eksamenText] = await Promise.all([
      fetchText('noder.csv'),
      fetchText('eksamensoppgaver.csv'),
    ]);

    const noderRows = parseCsv(noderText);
    const eksamenRows = parseCsv(eksamenText);

    buildNodeIndex(noderRows);
    buildExamIndex(eksamenRows);
    validateReferences();
    validateDag();

    renderErrorBanner();
    computeLevels();
    layoutAndRender();
    renderLegend();
    updateProgressUI();
  } catch (err) {
    console.error('Kunne ikke laste ferdighetstreet:', err);
    validationErrors.push('Kritisk feil ved lasting: ' + err.message + ' (kjører du siden via en lokal server? fetch() av CSV-filer feiler ved å åpne index.html direkte fra disk i mange nettlesere.)');
    renderErrorBanner();
  }
}

function fetchText(path) {
  return fetch(path).then(res => {
    if (!res.ok) throw new Error(`Fant ikke ${path} (status ${res.status})`);
    return res.text();
  });
}

function parseCsv(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (result.errors && result.errors.length) {
    result.errors.forEach(e => validationErrors.push(`CSV-feil: ${e.message} (rad ${e.row})`));
  }
  return result.data;
}

/* ------------------------------------------------------------------ */
/* Indeksering av data                                                  */
/* ------------------------------------------------------------------ */

function buildNodeIndex(rows) {
  nodesById = new Map();
  allNodes = [];
  rows.forEach(row => {
    const id = (row.id || '').trim();
    if (!id) return;
    const node = {
      id,
      type: (row.type || '').trim(),
      emne: (row.emne || '').trim() || 'Annet',
      navn: (row.navn || '').trim(),
      beskrivelse: (row.beskrivelse || '').trim(),
      avhenger_av: (row.avhenger_av || '').split(';').map(s => s.trim()).filter(Boolean),
      hjelpemiddel: (row.hjelpemiddel || '').trim(),
      instruks: (row.instruks || '').trim(),
      children: [],
      nivaa: 0,
      x: 0,
      y: 0,
    };
    nodesById.set(id, node);
    allNodes.push(node);
  });

  allNodes.forEach(node => {
    node.avhenger_av.forEach(depId => {
      const dep = nodesById.get(depId);
      if (dep) dep.children.push(node.id);
    });
  });
}

function buildExamIndex(rows) {
  examsByNode = new Map();
  rows.forEach(row => {
    const nodeId = (row.node_id || '').trim();
    if (!nodeId) return;
    if (!examsByNode.has(nodeId)) examsByNode.set(nodeId, []);
    examsByNode.get(nodeId).push({
      aar: (row.aar || '').trim(),
      sesong: (row.sesong || '').trim(),
      del: (row.del || '').trim(),
      oppgavenummer: (row.oppgavenummer || '').trim(),
      url: (row.url || '').trim(),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Validering                                                           */
/* ------------------------------------------------------------------ */

function validateReferences() {
  allNodes.forEach(node => {
    node.avhenger_av.forEach(depId => {
      if (!nodesById.has(depId)) {
        validationErrors.push(`Node "${node.id}" refererer til ukjent avhenger_av-id "${depId}".`);
      }
    });
    if (node.emne === 'Annet' && !TOPIC_ORDER.includes('Annet')) {
      validationErrors.push(`Node "${node.id}" mangler "emne" i noder.csv og havner i samle-kolonnen "Annet".`);
    }
  });
  examsByNode.forEach((rows, nodeId) => {
    if (!nodesById.has(nodeId)) {
      validationErrors.push(`eksamensoppgaver.csv refererer til ukjent node_id "${nodeId}".`);
    }
  });
}

function validateDag() {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(allNodes.map(n => [n.id, WHITE]));
  const stack = [];

  function visit(node) {
    color.set(node.id, GRAY);
    stack.push(node.id);
    for (const depId of node.avhenger_av) {
      const dep = nodesById.get(depId);
      if (!dep) continue;
      const c = color.get(dep.id);
      if (c === GRAY) {
        const cycleStart = stack.indexOf(dep.id);
        const cycle = stack.slice(cycleStart).concat(dep.id);
        validationErrors.push(`Syklus oppdaget i avhenger_av: ${cycle.join(' -> ')}`);
      } else if (c === WHITE) {
        visit(dep);
      }
    }
    stack.pop();
    color.set(node.id, BLACK);
  }

  allNodes.forEach(node => {
    if (color.get(node.id) === WHITE) visit(node);
  });
}

function renderErrorBanner() {
  const banner = document.getElementById('error-banner');
  if (!validationErrors.length) {
    banner.classList.remove('visible');
    banner.textContent = '';
    return;
  }
  console.warn('Ferdighetstre-validering fant problemer:\n' + validationErrors.join('\n'));
  banner.textContent = '⚠ ' + validationErrors.length + ' problem(er) funnet i datafilene (se konsoll for detaljer):\n' + validationErrors.join('\n');
  banner.classList.add('visible');
}

/* ------------------------------------------------------------------ */
/* Layout: emne-kolonner, lagdelt graf + barycenter innad i hver kolonne */
/* ------------------------------------------------------------------ */

// Grafen deles i én kolonne per "emne" (fagområde). Uten dette havner alle
// noder på samme rad basert på lengste sti fra en rot-node *i hele grafen*,
// slik at helt urelaterte tema (f.eks. prosentregning og statistikk) tvinges
// sammen på de samme radene og gir svært brede, uoversiktlige rader. Med
// kolonner får hvert emne vokse nedover i sitt eget tempo, og brede rader
// innad i en kolonne brytes i tillegg over flere rader (se wrapLevelRows).

function groupByColumn() {
  const columns = new Map();
  allNodes.forEach(node => {
    if (!columns.has(node.emne)) columns.set(node.emne, []);
    columns.get(node.emne).push(node);
  });
  const known = TOPIC_ORDER.filter(t => columns.has(t));
  const unknown = [...columns.keys()]
    .filter(t => !TOPIC_ORDER.includes(t))
    .sort((a, b) => a.localeCompare(b, 'nb'));
  return [...known, ...unknown].map(topic => ({ topic, nodes: columns.get(topic) }));
}

// Nivå per node = lengste sti fra en rot-node i HELE grafen (ikke bare innad i
// kolonnen). Dette er bevisst globalt: hvis f.eks. en node i én kolonne
// avhenger av noe som ligger dypt nede i en annen kolonne, skal hele
// undertreet dens starte tilsvarende langt ned - ikke øverst i sin egen
// kolonne. Kolonner som ikke har noen eksterne avhengigheter starter
// fortsatt øverst (nivå 0), som før.
function computeLevels() {
  const memo = new Map();
  const inProgress = new Set();

  function level(node) {
    if (memo.has(node.id)) return memo.get(node.id);
    if (inProgress.has(node.id)) return 0; // syklus - allerede rapportert av validateDag
    inProgress.add(node.id);
    let lvl = 0;
    node.avhenger_av.forEach(depId => {
      const dep = nodesById.get(depId);
      if (dep) lvl = Math.max(lvl, level(dep) + 1);
    });
    inProgress.delete(node.id);
    memo.set(node.id, lvl);
    return lvl;
  }

  allNodes.forEach(node => {
    node.nivaa = level(node);
  });
}

function assignOrderIndex(row) {
  row.forEach((node, i) => { node.orderIndex = i; });
}

function barycenterSortRow(row, relationField, idsInColumn) {
  row.forEach(node => {
    const related = node[relationField]
      .filter(id => idsInColumn.has(id))
      .map(id => nodesById.get(id))
      .filter(Boolean);
    if (!related.length) {
      node._barycenter = node.orderIndex; // behold posisjon hvis ingen relasjon i denne kolonnen
    } else {
      node._barycenter = related.reduce((s, n) => s + n.orderIndex, 0) / related.length;
    }
  });
  row.sort((a, b) => a._barycenter - b._barycenter);
}

// Hvor mange visuelle rader trengs for `count` noder på ett nivå i én kolonne,
// gitt at en rad brytes når den blir bredere enn LAYOUT.maxNodesPerRow.
function chunksNeeded(count) {
  return count > 0 ? Math.ceil(count / LAYOUT.maxNodesPerRow) : 0;
}

// Radstart (visuell radindeks) per globalt nivå, felles for ALLE kolonner.
//
// `nivaa` beregnes bevisst globalt (se computeLevels) nettopp for at "lenger
// ned i grafen" skal bety det samme uansett kolonne - en node med høyere
// nivaa enn en av sine forutsetninger skal alltid tegnes på samme rad eller
// lenger ned, selv når forutsetningen ligger i en annen kolonne (emne). Hvis
// radbryting (se layoutColumn) kun forskyver rader PER KOLONNE, brytes denne
// garantien: en kolonne med mange noder på et tidlig nivå bryter i flere
// rader og skyver sine egne senere nivåer nedover, mens en tynnere kolonne
// ikke gjør det - da kan en node med lavt nivaa ende visuelt UNDER en node
// med høyere nivaa i en annen kolonne, selv om førstnevnte er en forutsetning
// for sistnevnte (linjen mellom dem peker da "oppover", som er misvisende).
//
// Løsningen: finn, for hvert nivå, det STØRSTE antallet rader noen kolonne
// trenger for det nivået (maks over alle kolonner), og la alle kolonner
// bruke denne samme radstarten per nivå. Tynne kolonner får da tomme
// mellomrom der en annen kolonne trengte flere rader - det er prisen for at
// nivaa fortsatt betyr det samme overalt i kartet.
function computeGlobalRowStarts(columns) {
  const maxLevel = allNodes.reduce((m, n) => Math.max(m, n.nivaa), 0);
  const rowStart = [];
  let cursor = 0;
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    rowStart.push(cursor);
    let rowsForLevel = 1;
    columns.forEach(({ nodes }) => {
      const count = nodes.filter(n => n.nivaa === lvl).length;
      rowsForLevel = Math.max(rowsForLevel, chunksNeeded(count));
    });
    cursor += rowsForLevel;
  }
  return rowStart;
}

// Legger nodene i én kolonne ut i visuelle rader. Radstart per nivå kommer
// fra `globalRowStart` (se computeGlobalRowStarts) slik at nivåer forblir
// synkronisert på tvers av kolonner selv når enkelte kolonner bryter brede
// rader i flere visuelle rader. Nivåer kolonnen ikke har noen noder på blir
// stående tomme (arrayet får "hull" der), noe som er nettopp poenget: det er
// slik en kolonne med en dyp ekstern avhengighet får luft over seg i stedet
// for å starte helt øverst.
function layoutColumn(nodes, globalRowStart) {
  const idsInColumn = new Set(nodes.map(n => n.id));
  const levelsPresent = [...new Set(nodes.map(n => n.nivaa))].sort((a, b) => a - b);
  const levelRows = new Map();
  levelsPresent.forEach(lvl => levelRows.set(lvl, []));
  nodes.forEach(node => levelRows.get(node.nivaa).push(node));

  // Startrekkefølge: stabil, alfabetisk på navn for et deterministisk utgangspunkt
  levelRows.forEach(row => row.sort((a, b) => a.navn.localeCompare(b.navn, 'nb')));
  levelsPresent.forEach(lvl => assignOrderIndex(levelRows.get(lvl)));

  for (let pass = 0; pass < LAYOUT.barycenterPasses; pass++) {
    const topDown = pass % 2 === 0;
    const order = topDown ? levelsPresent : [...levelsPresent].reverse();
    order.forEach(lvl => barycenterSortRow(levelRows.get(lvl), topDown ? 'avhenger_av' : 'children', idsInColumn));
    levelsPresent.forEach(lvl => assignOrderIndex(levelRows.get(lvl)));
  }

  const visualRows = [];
  levelsPresent.forEach(lvl => {
    const row = levelRows.get(lvl);
    const chunks = [];
    for (let i = 0; i < row.length; i += LAYOUT.maxNodesPerRow) chunks.push(row.slice(i, i + LAYOUT.maxNodesPerRow));
    chunks.forEach((chunk, i) => { visualRows[globalRowStart[lvl] + i] = chunk; });
  });

  return visualRows; // sparse: tomme nivåer/rader gir hull som forEach/reduce hopper over
}

// Bokstav for kolonne nr. `index` (0-basert): A, B, C, ..., Z, AA, AB, ...
// (samme mønster som kolonnenavn i et regneark), i tilfelle et fag skulle få
// flere enn 26 emner.
function columnLetter(index) {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

// Systematisk indeksering av læringsmål: auto-generert, ALDRI lagret i CSV
// (se "Ikke gjør" i instruks.md). Hvert emne (kolonne) får en bokstav, i
// samme rekkefølge som kolonnene vises i kartet (styrt av TOPIC_ORDER - se
// groupByColumn). Innad i hvert emne får hver node et sekvensielt nummer,
// sortert på (nivaa, y, x):
//   - node.nivaa (se computeLevels) er beregnet globalt og garanterer at en
//     forutsetning alltid har lavere nivå enn alt som (direkte eller
//     indirekte) avhenger av den - også når avhengigheten krysser kolonner.
//     Dermed vil et læringsmål alltid få et lavere tall enn det som bygger
//     videre på det, innad i samme emne ("nedover i treet" -> økende tall).
//   - y og x (satt av layoutColumn/layoutAndRender rett før dette kalles) er
//     kun tie-break for et stabilt, lesbart resultat som følger rekkefølgen
//     nodene faktisk vises i kartet (rad for rad, venstre mot høyre).
function assignLearningGoalIndices(columns) {
  themeList = columns.map(({ topic, nodes }, i) => {
    const letter = columnLetter(i);
    const sorted = [...nodes].sort((a, b) => a.nivaa - b.nivaa || a.y - b.y || a.x - b.x);
    sorted.forEach((node, j) => { node.goalIndex = `${letter}${j + 1}`; });
    return { letter, topic, nodes: sorted };
  });
}

function layoutAndRender() {
  const columns = groupByColumn();
  const globalRowStart = computeGlobalRowStarts(columns);
  const columnMeta = [];
  let cursorX = 0;

  columns.forEach(({ topic, nodes }) => {
    const visualRows = layoutColumn(nodes, globalRowStart);
    const colWidthNodes = visualRows.reduce((m, row) => Math.max(m, row.length), 1);
    const colPixelWidth = colWidthNodes * LAYOUT.nodeWidth + Math.max(0, colWidthNodes - 1) * LAYOUT.hGap;

    visualRows.forEach((row, rowIndex) => {
      const rowWidth = row.length * LAYOUT.nodeWidth + Math.max(0, row.length - 1) * LAYOUT.hGap;
      const rowStartX = cursorX + (colPixelWidth - rowWidth) / 2;
      row.forEach((node, i) => {
        node.x = rowStartX + i * (LAYOUT.nodeWidth + LAYOUT.hGap);
        node.y = LAYOUT.columnLabelHeight + rowIndex * (LAYOUT.nodeHeight + LAYOUT.vGap);
      });
    });

    columnMeta.push({ topic, x: cursorX, width: colPixelWidth, rowCount: visualRows.length });
    cursorX += colPixelWidth + LAYOUT.columnGap;
  });

  const totalWidth = Math.max(0, cursorX - LAYOUT.columnGap) + LAYOUT.padding * 2;
  const maxRowCount = columnMeta.reduce((m, c) => Math.max(m, c.rowCount), 0);
  const totalHeight = LAYOUT.columnLabelHeight
    + maxRowCount * LAYOUT.nodeHeight + Math.max(0, maxRowCount - 1) * LAYOUT.vGap
    + LAYOUT.padding * 2;

  const container = document.getElementById('graph-container');
  container.style.width = totalWidth + 'px';
  container.style.height = totalHeight + 'px';

  assignLearningGoalIndices(columns);
  renderGraph(columnMeta);
}

/* ------------------------------------------------------------------ */
/* Rendering av grafen                                                  */
/* ------------------------------------------------------------------ */

function renderGraph(columnMeta) {
  const container = document.getElementById('graph-container');
  const nodesLayer = document.getElementById('nodes-layer');
  const headersLayer = document.getElementById('column-headers');
  const bandsLayer = document.getElementById('column-bands');
  const svg = document.getElementById('edges');
  nodesLayer.innerHTML = '';
  headersLayer.innerHTML = '';
  bandsLayer.innerHTML = '';
  svg.innerHTML = '';

  const width = container.clientWidth || parseInt(container.style.width, 10);
  const height = container.clientHeight || parseInt(container.style.height, 10);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  // Bakgrunnsbånd bak hver kolonne, annenhver farge, så det er lett å se hvor
  // ett emne slutter og det neste begynner.
  const bandHeight = height - LAYOUT.padding * 2;
  columnMeta.forEach((col, i) => {
    const band = document.createElement('div');
    band.className = 'column-band' + (i % 2 === 1 ? ' column-band-alt' : '');
    band.style.left = (LAYOUT.padding + col.x - LAYOUT.columnGap / 2) + 'px';
    band.style.top = LAYOUT.padding + 'px';
    band.style.width = (col.width + LAYOUT.columnGap) + 'px';
    band.style.height = bandHeight + 'px';
    bandsLayer.appendChild(band);
  });

  // Kolonneoverskrifter
  columnMeta.forEach(col => {
    const header = document.createElement('div');
    header.className = 'column-header';
    header.style.left = (LAYOUT.padding + col.x) + 'px';
    header.style.top = LAYOUT.padding + 'px';
    header.style.width = col.width + 'px';
    header.textContent = col.topic;
    headersLayer.appendChild(header);
  });

  const progress = getProgress();

  // Kanter
  allNodes.forEach(node => {
    node.avhenger_av.forEach(depId => {
      const dep = nodesById.get(depId);
      if (!dep) return;
      const x1 = LAYOUT.padding + dep.x + LAYOUT.nodeWidth / 2;
      const y1 = LAYOUT.padding + dep.y + LAYOUT.nodeHeight;
      const x2 = LAYOUT.padding + node.x + LAYOUT.nodeWidth / 2;
      const y2 = LAYOUT.padding + node.y;
      const midY = (y1 + y2) / 2;
      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      if (isNodeMastered(dep, progress) && isNodeMastered(node, progress)) {
        path.classList.add('edge-active');
      }
      svg.appendChild(path);
    });
  });

  // Noder
  allNodes.forEach(node => {
    nodesLayer.appendChild(createNodeElement(node, progress));
  });
}

function createNodeElement(node, progress) {
  const el = document.createElement('div');
  el.className = `node-box type-${node.type}`;
  el.style.left = (LAYOUT.padding + node.x) + 'px';
  el.style.top = (LAYOUT.padding + node.y) + 'px';
  el.style.width = LAYOUT.nodeWidth + 'px';
  el.style.minHeight = LAYOUT.nodeHeight + 'px';
  el.dataset.nodeId = node.id;

  const mastered = isNodeMastered(node, progress);
  const available = isAvailable(node, progress);
  if (mastered) el.classList.add('mastered');
  if (!available && !mastered) el.classList.add('locked');
  if (node.id === activeNodeId) el.classList.add('active');

  const topRow = document.createElement('div');
  topRow.className = 'node-top-row';

  const name = document.createElement('div');
  name.className = 'node-name';
  const indexSpan = document.createElement('span');
  indexSpan.className = 'node-index';
  indexSpan.textContent = node.goalIndex + ') ';
  name.appendChild(indexSpan);
  name.appendChild(document.createTextNode(node.navn));
  topRow.appendChild(name);

  el.appendChild(topRow);

  const entry = progress[node.id] || {};

  const meta = document.createElement('div');
  meta.className = 'node-meta';

  const metaLeft = document.createElement('div');
  metaLeft.className = 'node-meta-left';
  if (SHOW_HJELPEMIDDEL) metaLeft.appendChild(makeHjelpemiddelBadge(node.hjelpemiddel));
  const typeLabel = document.createElement('span');
  typeLabel.className = 'badge-type';
  typeLabel.textContent = node.type;
  metaLeft.appendChild(typeLabel);
  meta.appendChild(metaLeft);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'node-checkbox';
  checkbox.checked = !!entry.mastered;
  checkbox.title = 'Marker som mestret';
  checkbox.addEventListener('click', e => e.stopPropagation());
  checkbox.addEventListener('change', () => setNodeProgress(node.id, 'mastered', checkbox.checked));
  meta.appendChild(checkbox);

  el.appendChild(meta);

  el.addEventListener('click', () => openDetail(node.id));

  return el;
}

function createMasteryToggle(labelText, checked, onChange) {
  const label = document.createElement('label');
  label.className = 'mastered-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  label.appendChild(input);
  label.appendChild(document.createTextNode(labelText));
  return label;
}

function makeHjelpemiddelBadge(value) {
  const span = document.createElement('span');
  span.className = 'badge ' + (
    value === 'del1' ? 'badge-del1' : value === 'del2' ? 'badge-del2' : 'badge-begge'
  );
  span.textContent = value === 'del1' ? 'D1' : value === 'del2' ? 'D2' : 'D1+D2';
  return span;
}

function renderLegend() {
  const legend = document.getElementById('legend');
  const hjelpemiddelItems = SHOW_HJELPEMIDDEL ? `
    <span class="legend-item"><span class="legend-swatch" style="background:var(--del1);border-radius:3px;"></span>Del 1</span>
    <span class="legend-item"><span class="legend-swatch" style="background:var(--del2);border-radius:3px;"></span>Del 2</span>` : '';
  legend.innerHTML = `
    <span class="legend-item"><span class="legend-swatch" style="background:var(--begrep-bg);border:1.5px solid var(--begrep-border);border-radius:7px;"></span>Begrep</span>
    <span class="legend-item"><span class="legend-swatch" style="background:var(--ferdighet-bg);border:1.5px solid var(--ferdighet-border);"></span>Ferdighet</span>${hjelpemiddelItems}
    <span class="legend-item"><span class="legend-swatch" style="opacity:.45;background:var(--begrep-bg);border:1.5px solid var(--begrep-border);border-radius:7px;"></span>Låst (forutsetninger ikke oppfylt)</span>
  `;
}

/* ------------------------------------------------------------------ */
/* Progresjon / localStorage                                            */
/* ------------------------------------------------------------------ */

// Alle noder (ferdighet og begrep) har én avkrysning: mestret eller ikke.
// Lagringsformat per node-id: { mastered: bool }.

function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function setProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function setNodeProgress(nodeId, key, value) {
  const progress = getProgress();
  const entry = progress[nodeId] || {};
  entry[key] = value;
  progress[nodeId] = entry;
  setProgress(progress);
  refreshAfterProgressChange();
}

function isNodeMastered(node, progress) {
  const entry = progress[node.id];
  return !!(entry && entry.mastered);
}

function isAvailable(node, progress) {
  if (!node.avhenger_av.length) return true;
  return node.avhenger_av.every(depId => {
    const dep = nodesById.get(depId);
    return dep && isNodeMastered(dep, progress);
  });
}

function refreshAfterProgressChange() {
  layoutAndRender();
  updateProgressUI();
  if (activeNodeId) renderDetail(nodesById.get(activeNodeId));
}

function updateProgressUI() {
  const progress = getProgress();
  const total = allNodes.length;
  const done = allNodes.filter(n => isNodeMastered(n, progress)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `${done} av ${total} ferdigheter fullført`;
}

/* ------------------------------------------------------------------ */
/* Forfedre / KI-instruks-komposisjon                                   */
/* ------------------------------------------------------------------ */

function getAllAncestors(node) {
  const visited = new Set();
  const result = [];

  function visit(n) {
    n.avhenger_av.forEach(depId => {
      if (visited.has(depId)) return;
      visited.add(depId);
      const dep = nodesById.get(depId);
      if (!dep) return;
      visit(dep);
      result.push(dep);
    });
  }

  visit(node);
  return result;
}

// Hjelpemiddel-konteksten (del1/del2/begge) er faglig innhold - hvert fag
// definerer selv teksten i config.js (composeHjelpemiddelContext), siden
// hva "hjelpemidler" betyr og hvilke regler som gjelder varierer per fag.
function composeHjelpemiddelContext(hjelpemiddel) {
  if (typeof CONFIG.composeHjelpemiddelContext === 'function') {
    return CONFIG.composeHjelpemiddelContext(hjelpemiddel);
  }
  const labels = { del1: 'del 1', del2: 'del 2', begge: 'del 1 og del 2' };
  return `Hjelpemidler: Dette gjelder ${labels[hjelpemiddel] || 'eksamen'}.`;
}

function composeInstruction(node) {
  const parts = [];
  parts.push(AI_INSTRUCTION_TEMPLATE);

  const ancestors = getAllAncestors(node);
  if (ancestors.length) {
    const names = ancestors.map(a => `- ${a.navn}`).join('\n');
    parts.push(`Eleven skal fra før beherske følgende forutsetninger:\n${names}`);
  }

  parts.push(`Ferdigheten/begrepet det trenes på: "${node.navn}".\n${node.beskrivelse}`);

  if (node.type === 'begrep') {
    parts.push(BEGREP_TEST_GUIDANCE);
  }

  if (node.instruks) {
    parts.push(node.instruks);
  }

  if (SHOW_HJELPEMIDDEL) {
    parts.push(composeHjelpemiddelContext(node.hjelpemiddel));
  }

  return parts.join('\n\n');
}

/* ------------------------------------------------------------------ */
/* Detaljpanel                                                          */
/* ------------------------------------------------------------------ */

function scrollNodeIntoView(nodeId) {
  const el = document.querySelector(`.node-box[data-node-id="${nodeId}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  el.classList.remove('highlight-pulse');
  void el.offsetWidth; // tving reflow, slik at animasjonen kan starte på nytt ved gjentatte klikk
  el.classList.add('highlight-pulse');
  setTimeout(() => el.classList.remove('highlight-pulse'), 1600);
}

function openDetail(nodeId) {
  activeNodeId = nodeId;
  document.querySelectorAll('.node-box').forEach(el => {
    el.classList.toggle('active', el.dataset.nodeId === nodeId);
  });
  document.getElementById('detail-panel').classList.add('open');
  renderDetail(nodesById.get(nodeId));
}

function closeDetail() {
  activeNodeId = null;
  document.getElementById('detail-panel').classList.remove('open');
  document.querySelectorAll('.node-box.active').forEach(el => el.classList.remove('active'));
}

function renderDetail(node) {
  if (!node) return;
  const inner = document.getElementById('detail-panel-inner');
  const progress = getProgress();
  const entry = progress[node.id] || {};
  const mastered = isNodeMastered(node, progress);
  const available = isAvailable(node, progress);
  const ancestors = getAllAncestors(node);
  const exams = examsByNode.get(node.id) || [];

  inner.innerHTML = '';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'detail-close';
  closeBtn.textContent = '✕ lukk';
  closeBtn.addEventListener('click', closeDetail);
  inner.appendChild(closeBtn);

  const h2 = document.createElement('h2');
  h2.textContent = `${node.goalIndex}) ${node.navn}`;
  inner.appendChild(h2);

  const meta = document.createElement('div');
  meta.id = 'detail-meta';
  if (SHOW_HJELPEMIDDEL) meta.appendChild(makeHjelpemiddelBadge(node.hjelpemiddel));
  const typeBadge = document.createElement('span');
  typeBadge.className = 'badge-type';
  typeBadge.textContent = node.type;
  meta.appendChild(typeBadge);
  inner.appendChild(meta);

  const status = document.createElement('div');
  status.id = 'detail-status';
  status.textContent = mastered
    ? '✓ Mestret'
    : available
      ? 'Tilgjengelig — forutsetninger er oppfylt'
      : 'Låst — mangler forutsetninger';
  if (available && !mastered) status.classList.add('available');
  inner.appendChild(status);

  const toggles = document.createElement('div');
  toggles.className = 'mastery-toggles';
  toggles.appendChild(createMasteryToggle('Marker som mestret', entry.mastered, checked => setNodeProgress(node.id, 'mastered', checked)));
  inner.appendChild(toggles);

  const desc = document.createElement('p');
  desc.id = 'detail-desc';
  desc.textContent = node.beskrivelse;
  inner.appendChild(desc);

  if (ancestors.length) {
    const h3 = document.createElement('div');
    h3.className = 'badge-type';
    h3.style.marginBottom = '0.4rem';
    h3.textContent = 'Forutsetninger';
    inner.appendChild(h3);
    const ul = document.createElement('ul');
    ul.className = 'prereq-list';
    ancestors.forEach(a => {
      const li = document.createElement('li');
      const aMastered = isNodeMastered(a, progress);
      li.className = 'prereq-item' + (aMastered ? ' prereq-item-done' : '');
      const check = document.createElement('span');
      check.className = 'prereq-check';
      check.textContent = aMastered ? '✓' : '○';
      check.title = aMastered ? 'Mestret' : 'Ikke mestret ennå';
      li.appendChild(check);
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'prereq-link';
      link.textContent = a.navn;
      link.addEventListener('click', () => {
        openDetail(a.id);
        scrollNodeIntoView(a.id);
      });
      li.appendChild(link);
      ul.appendChild(li);
    });
    inner.appendChild(ul);
  }

  const actions = document.createElement('div');
  actions.className = 'instruction-actions';

  const showBtn = document.createElement('button');
  showBtn.className = 'btn secondary';
  showBtn.textContent = 'Vis KI-instruks';
  actions.appendChild(showBtn);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn';
  copyBtn.textContent = 'Kopier KI-instruks';
  actions.appendChild(copyBtn);

  inner.appendChild(actions);

  const textarea = document.createElement('textarea');
  textarea.id = 'instruction-text';
  textarea.readOnly = true;
  const instructionText = composeInstruction(node);
  textarea.value = instructionText;
  inner.appendChild(textarea);

  showBtn.addEventListener('click', () => {
    const visible = textarea.classList.toggle('visible');
    showBtn.textContent = visible ? 'Skjul KI-instruks' : 'Vis KI-instruks';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(instructionText).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Kopiert!';
      setTimeout(() => { copyBtn.textContent = original; }, 1500);
    }).catch(() => {
      textarea.classList.add('visible');
      textarea.select();
    });
  });

  if (exams.length) {
    const h3 = document.createElement('div');
    h3.className = 'badge-type';
    h3.style.margin = '1.4rem 0 0.4rem';
    h3.textContent = 'Eksamensoppgaver';
    inner.appendChild(h3);

    const ul = document.createElement('ul');
    ul.className = 'exam-list';
    exams.forEach(exam => {
      const li = document.createElement('li');
      const label = `${capitalize(exam.sesong)} ${exam.aar}, del ${exam.del}, oppgave ${exam.oppgavenummer}`;
      if (exam.url) {
        const a = document.createElement('a');
        a.href = exam.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = label;
        li.appendChild(a);
      } else {
        li.textContent = label;
      }
      ul.appendChild(li);
    });
    inner.appendChild(ul);
  }
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
