'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for matematikk 1T.                       */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: '1t-ferdighetstre-fullfort',

  // Viser «Hvorfor skal jeg lære matte?»-knappen øverst i header (kun
  // matematikkfagene, se ferdighetstraer/instruks.md).
  showMotivationButton: true,

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Følger den
  // naturlige oppbyggingen i 1T: algebraisk grunnlag først, deretter de ulike
  // funksjonstypene, derivasjon, trigonometri, og til slutt tallfølger/
  // programmering og modellering/anvendelser som trekker på flere av de
  // andre emnene samtidig. Emner i CSV-en som ikke står her havner til slutt
  // (alfabetisk).
  topicOrder: [
    'Algebra: likninger og ulikheter',
    'Andregradsfunksjoner',
    'Polynom- og rasjonale funksjoner',
    'Potens- og eksponentialfunksjoner',
    'Derivasjon og vekstfart',
    'Trigonometri',
    'Tallfølger, mønster og programmering',
    'Modellering og anvendelser',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'matematikk 1T (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen). Handler om notasjon/
  // presisjon som ville gitt trekk på eksamen, ikke om sluttsvaret er riktig.
  formuleringsfokus: 'blander sammen likhetstegn og pil/derav-tegn i en utregningskjede, bytter om på definisjonsområde og verdimengde, skriver et bevis eller en utledning som bare viser ett spesialtilfelle i stedet for det generelle argumentet, glemmer å ta med alle løsninger av en likning eller ulikhet (f.eks. bare positiv rot), eller runder av mellomresultater for tidlig i en flerstegs utregning',

  // Hjelpemiddel-kontekst for KI-instruksen. Samme nasjonale hjelpemiddel-
  // reform som i matte-1p og matte-2p (se matte-2p/config.js): fra våren 2027 er
  // del 1 som før (ingen hjelpemidler), mens del 2 kun tillater håndholdt
  // vitenskapelig kalkulator - som godt kan ha innebygd graftegning, det er
  // ikke problemet. Det som IKKE er tillatt, er CAS-programvare og PC/nettbrett
  // (GeoGebra, regneark e.l.). Dette prosjektet skal kun forholde seg til den
  // nye ordningen.
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
