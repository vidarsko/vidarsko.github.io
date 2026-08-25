'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for Fysikk 2.                            */
/* Lastes FØR ../engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: 'fysikk2-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Følger grovt
  // rekkefølgen kompetansemålene for Fysikk 2 er formulert i: fagmetode
  // (forsøk/usikkerhet, internasjonalt forskningssamarbeid) og programmering
  // først, deretter mekanikk (2D-kinematikk, krumlinjet bevegelse,
  // gravitasjon), elektromagnetisme (elektriske og magnetiske felt,
  // induksjon), moderne fysikk (spesiell og generell relativitetsteori,
  // kvantefysikk), og til sist fordypningsemnet. Emner i CSV-en som ikke
  // står her havner til slutt (alfabetisk).
  topicOrder: [
    'Fysikk som fag',
    'Programmering og numeriske metoder',
    'Kinematikk i to dimensjoner',
    'Krefter og krumlinjet bevegelse',
    'Gravitasjon',
    'Elektriske felt',
    'Magnetiske felt',
    'Elektromagnetisk induksjon',
    'Spesiell relativitetsteori',
    'Generell relativitetsteori',
    'Kvantefysikk',
    'Fordypningsemne',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'fysikk 2 (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen).
  formuleringsfokus: 'glemmer å oppgi enheter eller blander enheter, oppgir svar med feil antall gjeldende siffer, blander sammen absolutt og relativ usikkerhet eller runder mellomsvar for tidlig i en usikkerhetsberegning, glemmer å begrunne fortegn/retning på vektorstørrelser (krefter, felt, akselerasjon) i stedet for bare å oppgi en tallverdi, bruker "=" mellom en tilnærmet og en eksakt verdi der ≈ er riktig, eller blander sammen lignende symboler (f.eks. g for tyngdeakselerasjon og g for gravitasjonsfeltstyrke, eller v for fart og v for spenning i elektriske kretser - skriv alltid tydelig hvilken størrelse et symbol representerer)',

  // Hjelpemiddel-kontekst for KI-instruksen. Del 1 av Fysikk 2-eksamen er
  // uten hjelpemidler i det hele tatt - ikke engang kalkulator - kun
  // skrivesaker, passer, linjal, vinkelmåler og vedleggene i oppgavesettet
  // (faktavedlegg, formelvedlegg, programmeringsvedlegg). Del 2 tillater
  // alle hjelpemidler bortsett fra åpent internett og verktøy for å
  // kommunisere med andre (samskriving, chat) - inkludert at kunstig
  // intelligens/chatbot ikke er tillatt som hjelpemiddel på selve eksamen.
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Eksamen tillater uansett ikke kunstig intelligens eller chatbot som hjelpemiddel i selve eksamensgjennomføringen - denne treningsøkten er forberedelse, ikke eksamen.';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, helt uten hjelpemidler - ikke engang kalkulator. Forvent at eleven regner for hånd, med kun skrivesaker, passer, linjal, vinkelmåler og de trykte vedleggene (faktavedlegg, formelvedlegg, programmeringsvedlegg) tilgjengelig. ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen. Her er alle hjelpemidler tillatt - kalkulator, programmering (lokalt installert), GeoGebra og andre trykte eller digitale kilder - bortsett fra åpent internett og verktøy som gjør det mulig å kommunisere med andre. ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten hjelpemidler (del 1) og med fritt hjelpemiddelvalg utenom åpent internett/kommunikasjon (del 2). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
