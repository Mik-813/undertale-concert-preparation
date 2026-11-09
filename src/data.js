// Single source of truth for every fact on the page.
// Rendered into static HTML at build time (see vite.config.js).

export const event = {
  name: 'UNDERTALE',
  org: 'GraMuzyka',
  kind: 'koncert symfoniczny',
  day: 'sob.',
  date: '14.11.2026',
  start: '18:30',
  iso: '2026-11-14T18:30:00+01:00',
  from: 'Legnica',
  venue: 'Arena Ursynów',
  address: 'ul. Rotmistrza Witolda Pileckiego 122',
  row: 19,
  seat: 31,
  motto: '* Masz plan. Napełnia cię to DETERMINACJĄ.',
  done: '* Wszystko według planu. Napełnia cię to DETERMINACJĄ.',
};

export const sections = [
  { id: 'plan', title: 'Plan', nav: 'Plan' },
  { id: 'wyjazd', title: 'Wyjazd', nav: 'Wyjazd' },
  { id: 'jedzenie', title: 'Obiad', nav: 'Obiad' },
  { id: 'dojazd', title: 'Dojazd', nav: 'Dojazd' },
  { id: 'ubior', title: 'Pogoda i ubiór', nav: 'Ubiór' },
  { id: 'bilet', title: 'Bilet', nav: 'Bilet' },
  { id: 'powrot', title: 'Powrót', nav: 'Powrót' },
  { id: 'checklista', title: 'Checklista', nav: 'Checklista' },
];

export const places = {
  centralna: { name: 'Warszawa Centralna', short: 'Centralna', q: 'Warszawa Centralna, Aleje Jerozolimskie 54, Warszawa' },
  bambino: { name: 'Bar Bambino', short: 'Bambino', q: 'Bar Mleczny Bambino, Hoża 19, Warszawa' },
  arena: { name: 'Arena Ursynów', gen: 'Areny Ursynów', short: 'Arena', q: 'Arena Ursynów, Rotmistrza Witolda Pileckiego 122, Warszawa' },
};

// Stops: arr / dep times, platform as a number (rendered in Roman numerals).
export const trains = {
  out: {
    price: '78 zł',
    koleo: 'https://koleo.pl/connection/6714665607',
    all: 'https://koleo.pl/rozklad-pkp/legnica/warszawa-centralna/14-11-2026_10:24/all/all',
    legs: [
      { carrier: 'IC', no: '8314', name: 'Matejko' },
      { carrier: 'IC', no: '6126', name: 'Leśmian' },
    ],
    stops: [
      { name: 'Legnica', dep: '10:24', platform: 3 },
      { name: 'Wrocław Gł.', loc: 'we Wrocławiu', arr: '10:58', dep: '11:32', platform: 2 },
      { name: 'W-wa Centralna', full: places.centralna.name, arr: '15:48', platform: 2 },
    ],
  },
  back: {
    price: '98 zł',
    koleo: 'https://koleo.pl/connection/6714666485',
    all: 'https://koleo.pl/rozklad-pkp/warszawa-centralna/legnica/14-11-2026_23:00/all/all',
    legs: [
      { carrier: 'IC', no: '16170', name: 'Karkonosze' },
      { carrier: 'KD', no: '69553' },
    ],
    stops: [
      { name: 'W-wa Centralna', full: places.centralna.name, dep: '23:39', platform: 4 },
      { name: 'Wrocław Gł.', loc: 'we Wrocławiu', arr: '04:15', dep: '04:21', platform: 5 },
      { name: 'Legnica', arr: '05:16', platform: 4 },
    ],
  },
  planB: { dep: '11:07', arr: '16:16', legs: [{ carrier: 'KD', no: 'Wrocław' }, { carrier: 'IC', no: '6102', name: 'Ślęża' }] },
};

// Local times of the plan that are not train times.
export const schedule = { meal: '16:05', leave: '17:15', arena: '17:55' };

export const meal = {
  place: places.bambino,
  addr: 'ul. Hoża 19',
  walk: '14 min pieszo od Centralnej',
  about: 'Klasyczny bar mleczny od 1959. Domowe jedzenie, tanio.',
  budget: '~25–40 zł',
  hours: ['Sobota', '9:00–18:00'],
  menu: [['Pierogi ruskie', '18,90 zł'], ['Pierogi z mięsem', '18,90 zł'], ['Schabowy', '14,50 zł']],
  alternatives: [
    { name: 'Mleczarnia Jerozolimska', q: 'Mleczarnia Jerozolimska Emilii Plater 47 Warszawa', info: ['Emilii Plater 47', '~30 zł', '6 min od Centralnej', '8–20'] },
    { name: 'Bar Mleczny Prasowy', q: 'Bar Mleczny Prasowy Marszałkowska 10 Warszawa', info: ['Marszałkowska 10/16', '~25 zł', 'przy metrze Politechnika', '8–20'] },
    { name: 'Gościniec', q: 'Gościniec Polskie Pierogi Nowy Świat 43 Warszawa', info: ['Nowy Świat 43', '~50 zł', 'z obsługą kelnerską', '11–23'] },
  ],
};

const M1 = ['Centrum', 'Politechnika', 'Pole Mokotowskie', 'Racławicka', 'Wierzbno', 'Wilanowska', 'Służew', 'Ursynów', 'Stokłosy', 'Imielin'];

export const legs = {
  meal: {
    from: places.centralna, to: places.bambino, min: 14, mode: 'walking',
    steps: [{ type: 'walk', dist: '1,1 km', min: 14, note: 'Al. Jerozolimskie na wschód, potem Kruczą na północ.' }],
  },
  arena: {
    id: 'leg-arena', from: places.bambino, to: places.arena, min: 40, mode: 'transit',
    steps: [
      { type: 'walk', to: 'do metra Centrum', min: 8 },
      { type: 'metro', line: 'M1', dir: 'Kabaty', min: 17, every: '5', stations: M1 },
      { type: 'walk', to: 'do Areny', dist: '800 m', min: 10 },
    ],
  },
  back: {
    from: places.arena, to: places.centralna, min: 35, mode: 'transit',
    steps: [
      { type: 'walk', to: 'do metra Imielin', min: 10 },
      { type: 'metro', line: 'M1', dir: 'Młociny', min: 17, every: '7–8', from: 'Imielin', to: 'Centrum' },
      { type: 'walk', to: 'na Centralną', min: 5 },
    ],
  },
};

export const ztm = [['75-min', '4,40 zł'], ['24h', '15 zł', true]];

export const weather = [['13:00', '5°'], ['18:00', '2°'], ['21:00', '0°'], ['noc', '−2°'], ['opady', '~0%', 'dry']];

export const wear = [
  ['snow', 'Zimowa kurtka, czapka, rękawiczki'],
  ['layers', 'Warstwy · w hali jest ciepło'],
  ['walk', 'Wygodne buty'],
];

export const footer = {
  note: 'Prywatny plan, strona fanowska, niezwiązana z GraMuzyka ani Toby Foxem.',
  author: 'Mykyta Mykulskyi',
};
