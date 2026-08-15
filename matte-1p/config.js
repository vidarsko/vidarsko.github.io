'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for matematikk 1P.                       */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: '1p-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Utledet fra en
  // gjennomgang av kompetansemålene for 1P og fem eksamenssett (V24, H24,
  // V25, H25, V26) - merk at 1P (til forskjell fra gamle læreplaner) ikke har
  // egne kompetansemål om statistikk/sannsynlighet, så disse er bevisst
  // utelatt. Emner i CSV-en som ikke står her havner til slutt (alfabetisk).
  topicOrder: [
    'Tall, potenser og standardform',
    'Prosent og vekstfaktor',
    'Proporsjonalitet',
    'Måleenheter og praktisk regning',
    'Geometri: areal, volum og formler',
    'Lineære modeller og funksjoner',
    'Ikke-lineære funksjoner og modellering',
    'Programmering',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'matematikk 1P (norsk videregående skole)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen). Handler om notasjon/
  // presisjon som ville gitt trekk på eksamen, ikke om sluttsvaret er riktig.
  formuleringsfokus: 'glemmer prosenttegn eller andre enheter, blander sammen prosent og prosentpoeng, bruker likhetstegn feil (f.eks. kjeder sammen uttrykk med "=" som ikke faktisk er like, eller bruker "=" til å bety "neste steg" i stedet for likhet), eller runder av for tidlig eller upresist',

  // Hjelpemiddel-kontekst for KI-instruksen. Samme nasjonale hjelpemiddel-
  // reform som i matte-2p (se matte-2p/config.js): fra våren 2027 er del 1 som
  // før (ingen hjelpemidler), mens del 2 kun tillater håndholdt vitenskapelig
  // kalkulator - som godt kan ha innebygd graftegning, det er ikke problemet.
  // Det som IKKE er tillatt, er CAS-programvare og PC/nettbrett (GeoGebra,
  // regneark e.l.). Juster denne teksten hvis 1P skulle vise seg å følge en
  // annen ordning enn 2P.
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
