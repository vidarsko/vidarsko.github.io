'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for Kjemi 2.                             */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: 'kjemi2-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Følger
  // rekkefølgen kompetansemålene for Kjemi 2 er formulert i: kjemi som fag
  // (fagspråk, forsøk/usikkerhet, modeller/teoriutvikling, samarbeid) først,
  // deretter redoks/elektrokjemi, likevekt, entropi/entalpi/spontanitet,
  // syre-base/buffere, løselighet, katalysatorer, organisk reaksjonskjemi,
  // synteser, kromatografi, biologiske makromolekyler, grønn kjemi/
  // materialkretsløp, og til sist fordypningsemnet. Emner i CSV-en som ikke
  // står her havner til slutt (alfabetisk).
  topicOrder: [
    'Kjemi som fag',
    'Redoks og elektrokjemi',
    'Likevekt',
    'Entropi, entalpi og spontanitet',
    'Syrer, baser og buffere',
    'Løselighet',
    'Reaksjonshastighet og katalysatorer',
    'Organisk reaksjonskjemi',
    'Synteser',
    'Kromatografi',
    'Biologiske makromolekyler',
    'Grønn kjemi og materialkretsløp',
    'Fordypningsemne',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'kjemi 2 (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen).
  formuleringsfokus: 'glemmer å balansere reaksjonslikninger (inkludert ladning i halvreaksjoner, ikke bare atomer), glemmer tilstandssymboler (s), (l), (g), (aq), blander sammen K og Kc/Ksp/Ka/Kb uten å si hvilken likevektskonstant som menes, oppgir svar med feil antall gjeldende siffer eller glemmer enheter (spesielt mol/L, mol, C, J, kJ/mol), blander sammen fortegnskonvensjonen for entalpi/entropi/fri energi ved endoterme og eksoterme prosesser, bruker enkeltpil (→) der likevektspil (⇌) er riktig eller omvendt, glemmer å oppgi hvilket stoff som er oksidasjonsmiddel og hvilket som er reduksjonsmiddel eksplisitt i stedet for bare å si "oksidasjon skjer", eller blander sammen konsentrasjon (mol/L) og stoffmengde (mol) i en beregning',

  // Hjelpemiddel-kontekst for KI-instruksen. Del 1 av Kjemi 2-eksamen er
  // uten kalkulator - kun skrivesaker, passer, linjal, vinkelmåler og det
  // trykte vedlegget "Tabeller og formler i REA3046 Kjemi 2". Del 2 tillater
  // alle hjelpemidler bortsett fra åpent internett og verktøy for å
  // kommunisere med andre (samskriving, chat) - inkludert at kunstig
  // intelligens/chatbot ikke er tillatt som hjelpemiddel på selve eksamen.
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Eksamen tillater uansett ikke kunstig intelligens eller chatbot som hjelpemiddel i selve eksamensgjennomføringen - denne treningsøkten er forberedelse, ikke eksamen.';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, uten kalkulator. Forvent at eleven regner for hånd eller resonnerer kvalitativt, med kun skrivesaker, passer, linjal, vinkelmåler og det trykte vedlegget "Tabeller og formler i REA3046 Kjemi 2" (periodesystem, standardpotensialer, formler) tilgjengelig. ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen. Her er alle hjelpemidler tillatt - kalkulator, lærebok og andre trykte eller digitale kilder - bortsett fra åpent internett og verktøy som gjør det mulig å kommunisere med andre. ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten kalkulator (del 1) og med fritt hjelpemiddelvalg utenom åpent internett/kommunikasjon (del 2). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
