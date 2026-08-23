'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for matematikk 2P.                       */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: '2p-ferdighetstre-fullfort',

  // Viser «Hvorfor skal jeg lære matte?»-knappen øverst i header (kun
  // matematikkfagene, se ferdighetstraer/instruks.md).
  showMotivationButton: true,

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Emner som finnes
  // i noder.csv men ikke i denne listen havner til slutt (alfabetisk).
  topicOrder: [
    'Prosent og vekstfaktor',
    'Lån og økonomi',
    'Eksponentialfunksjoner',
    'Statistikk',
    'Programmering',
    'Geometri',
    'Likninger og funksjoner',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'matematikk 2P (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen). Handler om notasjon/
  // presisjon som ville gitt trekk på eksamen, ikke om sluttsvaret er riktig.
  formuleringsfokus: 'glemmer prosenttegn eller andre enheter, bruker likhetstegn feil (f.eks. kjeder sammen uttrykk med "=" som ikke faktisk er like, eller bruker "=" til å bety "neste steg" i stedet for likhet), eller runder av for tidlig eller upresist',

  // Hjelpemiddel-kontekst for KI-instruksen. Matte 2P har fra våren 2027 en ny
  // hjelpemiddelordning på eksamen: del 1 er som før (ingen hjelpemidler), del
  // 2 tillater kun håndholdt vitenskapelig kalkulator. Merk: en slik kalkulator
  // kan godt ha innebygd graftegning - det er ikke problemet. Det som IKKE er
  // tillatt, er CAS-programvare og PC/nettbrett (f.eks. GeoGebra eller regneark).
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Treningen skal gjenspeile hvordan ferdigheten faktisk skal utføres på eksamen, med den nye hjelpemiddelordningen fra våren 2027 (ingen CAS-programvare eller PC/nettbrett på del 2, kun håndholdt kalkulator).';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, uten hjelpemidler. Forvent at eleven regner for hånd, uten kalkulator. ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen med ny ordning. Forvent at eleven bruker håndholdt vitenskapelig kalkulator, eventuelt egne notater/trykte hjelpemidler. Merk: en slik kalkulator kan godt ha innebygd graftegning - det er ikke i seg selv et problem og bør ikke unngås eller trekkes frem som et minus i treningen. Det som IKKE er tillatt, er CAS-programvare og PC/nettbrett (f.eks. GeoGebra eller annen datamaskin-programvare). ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten hjelpemidler (del 1) og med håndholdt vitenskapelig kalkulator (del 2, ny ordning - ingen CAS-programvare eller PC/nettbrett, men kalkulatoren kan godt ha graftegning). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
