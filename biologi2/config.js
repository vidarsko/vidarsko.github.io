'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for Biologi 2.                           */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: 'biologi2-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Følger grovt
  // rekkefølgen kompetansemålene for Biologi 2 er formulert i: fagmetode og
  // feltarbeid først, deretter populasjonsøkologi, økosystem (energistrøm og
  // stoffkretsløp), enzymer, fotosyntese/celleånding, molekylærbiologi
  // (genuttrykk, genteknologi), genetikk (arv og variasjon), evolusjon, og
  // til sist emnet om kommersiell bruk og etikk. Emner i CSV-en som ikke
  // står her havner til slutt (alfabetisk).
  topicOrder: [
    'Fagmetode og feltarbeid',
    'Populasjonsøkologi og forvaltning',
    'Energistrøm og stoffkretsløp',
    'Enzymer',
    'Fotosyntese og celleånding',
    'Genetisk kode og genuttrykk',
    'Genteknologi',
    'Arv og variasjon',
    'Evolusjon og artsdannelse',
    'Bioteknologi: bruk og etikk',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'biologi 2 (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen).
  formuleringsfokus: 'blander sammen ord som ligner hverandre men betyr noe helt ulikt (f.eks. gen og allel, genotype og fenotype, transkripsjon og translasjon, mitose og meiose, art og populasjon), bruker "genene endres" eller "arvestoffet muterer" upresist der det er snakk om at en bestemt DNA-sekvens endres, skriver "prosentandel" der det egentlig menes en frekvens eller sannsynlighet (eller omvendt), oppgir et svar om dominant/recessiv arv uten å vise til et konkret krysningsskjema eller stamtre, eller bruker forkortelser (ATP, DNA, CRISPR osv.) uten å ha forklart hva de står for i teksten',

  // Hjelpemiddel-kontekst for KI-instruksen. Del 1 av Biologi 2-eksamen er
  // uten hjelpemidler i det hele tatt utover skrivesaker og linjal - ikke
  // engang kalkulator. Del 2 tillater alle hjelpemidler bortsett fra åpent
  // internett og verktøy for å kommunisere med andre - i praksis kalkulator
  // og trykte/fysiske kilder, ikke en PC med nettilgang (samme praksis som i
  // Fysikk 2 og de andre realfagene på vgs nå) - og aldri kunstig
  // intelligens/chatbot som hjelpemiddel på selve eksamen.
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Eksamen tillater uansett ikke kunstig intelligens eller chatbot som hjelpemiddel i selve eksamensgjennomføringen - denne treningsøkten er forberedelse, ikke eksamen.';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, helt uten hjelpemidler utover skrivesaker og linjal - ikke engang kalkulator. Forvent at eleven svarer kort og presist for hånd, uten oppslagsverk eller utregningshjelp. ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen. Her er alle hjelpemidler tillatt bortsett fra åpent internett og verktøy for å kommunisere med andre - i praksis kalkulator og trykte eller fysiske kilder som lærebøker og egne notater, ikke en PC med nettilgang. ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten hjelpemidler (del 1) og med kalkulator/trykte kilder tillatt (del 2, uten nettilgang). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
