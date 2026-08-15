'use strict';

/* ------------------------------------------------------------------ */
/* Fagspesifikk konfigurasjon for matematikk S2.                       */
/* Lastes FØR ../ferdighetstraer/engine.js — se ferdighetstraer/instruks.md */
/* for hva som kan/skal settes her.                                    */
/* ------------------------------------------------------------------ */

window.FT_CONFIG = {
  storageKey: 's2-ferdighetstre-fullfort',

  // Rekkefølge på emne-kolonnene i kartet, venstre til høyre. Utledet fra en
  // gjennomgang av kompetansemålene for S2 og to eksamenssett (H25/V26).
  // Rekker og rekursjon/programmering står først fordi flere senere emner
  // (forventningsverdi via uendelig rekke, annuitetslån) bygger på dem.
  // Integrasjonsteknikkene og det bestemte integralet/fundamentalteoremet
  // kommer før emnene som bruker dem (funksjonsdrøfting, økonomisk
  // modellering, vekstmodeller). Sannsynlighetsemnene er samlet til slutt,
  // med normalfordeling/sentralgrensesetningen som forutsetning for
  // hypotesetesting. Emner i CSV-en som ikke står her havner til slutt
  // (alfabetisk).
  topicOrder: [
    'Rekker',
    'Rekursjon og programmering',
    'Integrasjonsteknikker',
    'Det bestemte integralet og fundamentalteoremet',
    'Funksjonsdrøfting med derivasjon og integrasjon',
    'Eksponentiell og logistisk vekst',
    'Økonomisk modellering: kostnad, inntekt og grensestørrelser',
    'Sannsynlighetsfordelinger: forventningsverdi, varians og simulering',
    'Normalfordeling og sentralgrensesetningen',
    'Hypotesetesting',
  ],

  // Kursnavnet som settes inn i den delte KI-instruksmalen
  // (se ferdighetstraer/engine.js -> buildInstructionTemplate).
  courseName: 'matematikk S2 (norsk videregående skole, programfag realfag)',

  // Fagspesifikke eksempler på formuleringsfeil KI-en skal kommentere
  // vennlig, men tydelig (satt inn i den delte malen). Handler om notasjon/
  // presisjon som ville gitt trekk på eksamen, ikke om sluttsvaret er riktig.
  formuleringsfokus: 'blander sammen det ubestemte og det bestemte integralet (glemmer konstanten C i et ubestemt integral, eller tar den unødvendig med i et bestemt integral), bruker "=" mellom en tilnærmet og en eksakt verdi der "≈" er riktig (typisk ved digitalt bestemte modeller), glemmer å oppgi enhet ved tolkning av en deriverte eller et integral i en praktisk modell (f.eks. kr/uke, bakterier/dag), forveksler nullhypotese og alternativ hypotese eller formulerer dem upresist, skriver P(X = k) der de egentlig mener P(X ≥ k) eller omvendt, eller oppgir en forventningsverdi/varians/rentesats uten benevning',

  // Hjelpemiddel-kontekst for KI-instruksen. Merk: eksamensteksten til H25/V26
  // (kildegrunnlaget for noder.csv/eksamensoppgaver.csv) beskriver fortsatt
  // fri bruk av CAS/graftegner/regneark/programmering på del 2, fordi begge
  // sett ble skrevet før den nasjonale hjelpemiddelreformen som trer i kraft
  // fra våren 2027. Fra og med da gjelder samme ordning for S2 som for
  // 1P/2P/S1/R1: del 1 er som før (ingen hjelpemidler), mens del 2 kun
  // tillater egne notater, trykte hjelpemidler og en spesifisert vitenskapelig
  // kalkulator - som godt kan ha innebygd graftegning, det er ikke problemet.
  // Det som IKKE er tillatt, er CAS-programvare, regneark eller annen
  // PC-programvare. Selve oppgavetekstene/nodene (regresjon, digital
  // binomisk/hypergeometrisk beregning, programmering osv.) er fortsatt
  // gyldige som øvingsoppgaver — det er kun hvilket verktøy eleven forventes
  // å løse dem med på ordentlig eksamen, som er endret. Noder som gjelder ren
  // programmering (f.eks. å skrive og kjøre et program for en rekursiv følge)
  // er unntak: dette er en kompetanse i seg selv (jf. kompetansemål 2) og
  // trenes fortsatt med et faktisk programmeringsverktøy, ikke kalkulatoren.
  composeHjelpemiddelContext(hjelpemiddel) {
    const felles = 'Treningen skal gjenspeile hvordan ferdigheten faktisk skal utføres på eksamen, med den nye hjelpemiddelordningen fra våren 2027 (ingen CAS-programvare, regneark eller annen PC-programvare på del 2, kun en spesifisert kalkulator). Eksamen tillater uansett ikke kunstig intelligens til å generere innhold i besvarelsen - denne treningsøkten er forberedelse, ikke eksamensgjennomføring.';
    if (hjelpemiddel === 'del1') {
      return `Hjelpemidler: Dette gjelder del 1 av eksamen, uten hjelpemidler. Forvent at eleven regner for hånd, uten kalkulator (men med tilgang på en oppgitt tabell for standard normalfordeling der det er relevant). ${felles}`;
    }
    if (hjelpemiddel === 'del2') {
      return `Hjelpemidler: Dette gjelder del 2 av eksamen med ny ordning. Forvent at eleven bruker egne notater, trykte hjelpemidler og en spesifisert vitenskapelig kalkulator. Merk: en slik kalkulator kan godt ha innebygd graftegning - det er ikke i seg selv et problem og bør ikke unngås eller trekkes frem som et minus i treningen. Det som IKKE er tillatt, er CAS-programvare, regneark eller annen PC-programvare. Der noden i utgangspunktet forutsetter et digitalt verktøy som regresjon, en fordelingsfunksjon eller numerisk likningsløsning, la eleven bruke kalkulatorens innebygde funksjoner for dette. Unntak: noder som spesifikt handler om å skrive og kjøre et program (rekursive følger, simulering) trenes fortsatt med et faktisk programmeringsspråk, siden dette er en egen kompetanse i S2 og ikke noe kalkulatoren skal erstatte. ${felles}`;
    }
    return `Hjelpemidler: Dette er relevant både uten hjelpemidler (del 1) og med egne notater/trykte hjelpemidler/spesifisert vitenskapelig kalkulator (del 2, ny ordning - ingen CAS-programvare, regneark eller annen PC-programvare, men kalkulatoren kan godt ha graftegning). Tilpass etter hvilken del eleven trener på, og spør eleven hvis det er uklart. ${felles}`;
  },
};
