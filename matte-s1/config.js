'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for matematikk S1.                       */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: 's1-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Utledet fra en
  // gjennomgang av kompetansemålene for S1 og to eksamenssett (H25/V26).
  // Algebraen (potenser/logaritmer) og grenseverdi-/kontinuitetsbegrepene
  // kommer først fordi derivasjon av eksponential- og logaritmeuttrykk
  // bygger på dem. Kombinatorikk er plassert før sannsynlighet fordi de
  // fleste sannsynlighetsoppgavene i S1 bruker kombinatorisk telling.
  // Emner i CSV-en som ikke står her havner til slutt (alfabetisk).
  topicOrder: [
    'Potenser og logaritmer',
    'Grenseverdier og kontinuitet',
    'Derivasjon',
    'Derivasjon: modellering og optimering',
    'Kombinatorikk',
    'Sannsynlighet',
    'Sannsynlighetsfordelinger og simulering',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'matematikk S1 (norsk videregående skole, programfag realfag)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen). Handler om notasjon/
  // presisjon som ville gitt trekk på eksamen, ikke om sluttsvaret er riktig.
  formuleringsfokus: 'blander sammen grenseverdien til en funksjon i et punkt med funksjonsverdien i punktet (særlig ved diskontinuitet eller hull), skriver f(x) der de mener f\'(x) (eller omvendt), bruker likhetstegn feil (f.eks. kjeder sammen uttrykk med "=" som ikke faktisk er like), oppgir et kombinatorikkuttrykk (nCr, nPr, fakultet) uten å forklare hva det teller, eller skriver P(X = k) der de egentlig mener P(X ≥ k) eller omvendt',

  // Hjelpemiddel-kontekst for KI-instruksen. Merk: eksamensteksten til H25/V26
  // (kildegrunnlaget for noder.csv/eksamensoppgaver.csv) beskriver fortsatt
  // fri bruk av CAS/graftegner på del 2, fordi de settene ble skrevet før den
  // nasjonale hjelpemiddelreformen som trer i kraft fra våren 2027. Fra og
  // med da gjelder samme ordning for S1 som for 1P/2P: del 1 er som før
  // (ingen hjelpemidler), mens del 2 kun tillater håndholdt vitenskapelig
  // kalkulator - som godt kan ha innebygd graftegning, det er ikke problemet.
  // Det som IKKE er tillatt, er CAS-programvare og PC/nettbrett (GeoGebra,
  // regneark e.l.). Selve oppgavetekstene/nodene (regresjon, digitalt verktøy
  // for sannsynlighetsberegning osv.) er fortsatt gyldige som øvingsoppgaver -
  // det er kun hvilket verktøy eleven forventes å løse dem med på ordentlig
  // eksamen, som er endret.
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Treningen skal gjenspeile hvordan ferdigheten faktisk skal utføres på eksamen, med den nye hjelpemiddelordningen fra våren 2027 (ingen CAS-programvare eller PC/nettbrett på del 2, kun håndholdt kalkulator).';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, uten hjelpemidler. Forvent at eleven regner for hånd, uten kalkulator. ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen med ny ordning. Forvent at eleven bruker håndholdt vitenskapelig kalkulator, eventuelt egne notater/trykte hjelpemidler. Merk: en slik kalkulator kan godt ha innebygd graftegning - det er ikke i seg selv et problem. Det som IKKE er tillatt, er CAS-programvare og PC/nettbrett (f.eks. GeoGebra). Der noden i utgangspunktet forutsetter et digitalt verktøy som regresjon eller en fordelingsfunksjon (f.eks. binomisk/hypergeometrisk sannsynlighet), la eleven bruke kalkulatorens innebygde funksjoner for dette - ikke CAS-programvare eller PC-verktøy. ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten hjelpemidler (del 1) og med håndholdt vitenskapelig kalkulator (del 2, ny ordning - ingen CAS-programvare eller PC/nettbrett, men kalkulatoren kan godt ha graftegning). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
