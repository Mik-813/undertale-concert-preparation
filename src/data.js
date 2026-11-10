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
  { id: 'ubior', title: 'Pogoda i ubiór', nav: 'Ubiór' },
  { id: 'wyjazd', title: 'Wyjazd', nav: 'Wyjazd' },
  { id: 'jedzenie', title: 'Obiad', nav: 'Obiad' },
  { id: 'koncert', title: 'Koncert', nav: 'Koncert' },
  { id: 'powrot', title: 'Powrót', nav: 'Powrót' },
  { id: 'checklista', title: 'Checklista', nav: 'Checklista' },
];

export const places = {
  centralna: { name: 'Warszawa', q: 'Warszawa Centralna, Aleje Jerozolimskie 54, Warszawa' },
  bambino: { name: 'Bar Bambino', q: 'Bar Mleczny Bambino, Hoża 19, Warszawa' },
  mleczarnia: { name: 'Mleczarnia Jerozolimska', q: 'Mleczarnia Jerozolimska, Emilii Plater 47, Warszawa' },
  prasowy: { name: 'Bar Prasowy', q: 'Bar Mleczny Prasowy, Marszałkowska 10/16, Warszawa' },
  mCentrum: { name: 'Metro Centrum', stop: 'Centrum', ll: [52.2314, 21.0106], q: 'Stacja metra Centrum, Warszawa' },
  mPolitechnika: { name: 'Metro Politechnika', stop: 'Politechnika', ll: [52.2183, 21.0153], q: 'Stacja metra Politechnika, Warszawa' },
  mImielin: { name: 'Metro Imielin', stop: 'Imielin', ll: [52.1492, 21.0464], q: 'Stacja metra Imielin, Warszawa' },
  arena: { name: 'Arena Ursynów', gen: 'Areny Ursynów', q: 'Arena Ursynów, Rotmistrza Witolda Pileckiego 122, Warszawa' },
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
      { name: 'Wrocław', arr: '10:58', dep: '11:32', arrPlatform: 2, platform: 2 },
      { name: 'Warszawa', arr: '15:48', platform: 2 },
    ],
  },
  back: {
    price: '79 zł',
    koleo: 'https://koleo.pl/connection/6714806015',
    all: 'https://koleo.pl/rozklad-pkp/warszawa-centralna/legnica/14-11-2026_23:00/all/all',
    legs: [
      { carrier: 'IC', no: '16170', name: 'Karkonosze' },
      { carrier: 'IC', no: '68102', name: 'Swarożyc' },
    ],
    stops: [
      { name: 'Warszawa', dep: '23:39', platform: 4 },
      { name: 'Wrocław', arr: '04:15', dep: '04:42', arrPlatform: 3, platform: 2 },
      { name: 'Legnica', arr: '05:21', platform: 4 },
    ],
  },
  planB: { dep: '11:07', arr: '16:16', legs: [{ carrier: 'KD', no: 'Wrocław' }, { carrier: 'IC', no: '6102', name: 'Ślęża' }] },
};

// Plan times that are not train times: leave the station, leave the restaurant.
export const schedule = { off: '15:50', leave: '17:15' };

const M1 = ['Centrum', 'Politechnika', 'Pole Mokotowskie', 'Racławicka', 'Wierzbno', 'Wilanowska', 'Służew', 'Ursynów', 'Stokłosy', 'Imielin'];
// Stations past the exit, up to the terminal of each direction.
const M1_SOUTH = ['Natolin', 'Kabaty'];
const M1_NORTH = ['Świętokrzyska', 'Ratusz Arsenał', 'Dworzec Gdański', 'Plac Wilsona', 'Marymont', 'Słodowiec', 'Stare Bielany', 'Wawrzyszew', 'Młociny'];
// Station photos, Wikimedia Commons. Boarding and exit stations also show the entrance.
const photo = (label, file, by, lic) => ({ label, file, by, lic });
export const stationPhotos = {
  'Centrum': [photo('Wejście', 'Patelnia Stacja metra Centrum 2019b.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl'), photo('Peron', 'Stacja metra Centrum w Warszawie.JPG', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Politechnika': [photo('Wejście', '2026 Warszawa Metro Politechnika, wejście, 1.jpg', 'Cybularny', 'CC0'), photo('Peron', 'Metro-Politechnika-2020-AB.jpg', 'Andrzej Barabasz', 'CC BY-SA 4.0')],
  'Pole Mokotowskie': [photo('Peron', 'Warsaw 07-13 img12 Pole Mokotowskie metro.jpg', 'A.Savin', 'CC BY-SA 3.0')],
  'Racławicka': [photo('Peron', 'Stacja metra Racławicka 2015 01.JPG', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Wierzbno': [photo('Peron', 'Stacja linii metra M1 Wierzbno.jpg', 'Matel4472', 'CC BY-SA 4.0')],
  'Wilanowska': [photo('Peron', 'Wilanowska warsaw metro1.JPG', 'Adamon', 'CC BY 2.5')],
  'Służew': [photo('Peron', 'Stacja metra Służew 2020.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Ursynów': [photo('Peron', 'Stacja metra Ursynów 2020.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Stokłosy': [photo('Peron', 'Stacja metra Stokłosy 2015.JPG', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Imielin': [photo('Wejście', 'Wejście do metra Imielin i Urząd Dzielnicy Ursynów w Warszawie, 2025.jpg', 'SagbataMaesho', 'CC BY-SA 4.0'), photo('Peron', 'Stacja metra Imielin 01.JPG', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Natolin': [photo('Peron', 'Stacja metra Natolin 2020.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Kabaty': [photo('Peron', 'Stacja metra Kabaty 2020.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Świętokrzyska': [photo('Peron', 'Stacja metra Świętokrzyska 2022.jpg', 'Adrian Grycuk', 'CC BY-SA 3.0 pl')],
  'Młociny': [photo('Peron', 'A23 Warsaw Metro.jpg', 'Patryk Korzeniecki', 'CC BY-SA 3.0')],
};
const M1_MIN = 17; // Centrum to Imielin
const arenaWalk = { dist: '1 km', min: 13 }; // Metro Imielin <-> Arena, both ways
const walk = (from, to, rest) => ({ type: 'walk', from, to, ...rest });
const metro = (from, to, rest) => ({ type: 'metro', from, to, line: 'M1', ...rest });

// Every restaurant is one record. `walk` = from the station, `metro` = its own way to the M1 (the route strategy).
export const restaurants = [
  {
    key: 'bambino', place: places.bambino, street: 'Hoża 19', price: '25-40 zł', hours: '09:00-18:00',
    menu: [['Pierogi ruskie', '18,90 zł'], ['Pierogi z mięsem', '18,90 zł'], ['Schabowy, sam kotlet', '14,50 zł']],
    walk: { min: 17, dist: '1,3 km', note: 'Al. Jerozolimskie na wschód, potem Kruczą na południe.' },
    metro: { station: places.mCentrum, min: 8, dist: '650 m' },
  },
  {
    key: 'mleczarnia', place: places.mleczarnia, street: 'Emilii Plater 47', price: '30 zł', hours: '08:00-20:00',
    walk: { min: 6, dist: '450 m' },
    metro: { station: places.mCentrum, min: 11, dist: '850 m' },
  },
  {
    key: 'prasowy', place: places.prasowy, street: 'Marszałkowska 10/16', price: '25 zł', hours: '08:00-20:00',
    walk: { min: 29, dist: '2,2 km' },
    metro: { station: places.mPolitechnika, min: 8, dist: '600 m' },
  },
];

// Route strategy: the same two legs for any restaurant, built from its own walk and metro access.
export const route = (r) => {
  const stations = M1.slice(M1.indexOf(r.metro.station.stop));
  const metroMin = Math.round(M1_MIN * (stations.length - 1) / (M1.length - 1));
  return {
    meal: {
      id: `leg-meal-${r.key}`, from: places.centralna, to: r.place, at: schedule.off,
      parts: [walk(places.centralna, r.place, r.walk)],
    },
    arena: {
      id: `leg-arena-${r.key}`, from: r.place, to: places.arena, at: schedule.leave,
      parts: [
        walk(r.place, r.metro.station, { min: r.metro.min, dist: r.metro.dist }),
        metro(r.metro.station, places.mImielin, { dir: 'Kabaty', min: metroMin, every: '5', stations, beyond: M1_SOUTH }),
        walk(places.mImielin, places.arena, arenaWalk),
      ],
    },
  };
};

export const dinner = { name: 'Gościniec', street: 'Nowy Świat 43', until: '23:00' };

// After the concert: back to the station. `at` is when the leg starts; part times follow from `min`.
export const back = {
  from: places.arena, to: places.centralna, at: '20:30',
  parts: [
    walk(places.arena, places.mImielin, { min: arenaWalk.min }),
    metro(places.mImielin, places.mCentrum, { dir: 'Młociny', min: M1_MIN, every: '7-8', stations: [...M1].reverse(), beyond: M1_NORTH }),
    walk(places.mCentrum, places.centralna, { min: 5 }),
  ],
};

// Metro ticket: one per ride, bought online via Jakdojade (opens the ride at its planned time).
export const ztm = {
  fare: '75-min', price: '4,40 zł', zone: 'Strefa 1',
  facts: [
    ['Potrzebne', '2× 75-min', 'tam i z powrotem'],
    ['Aktywacja', 'W aplikacji', 'przed wejściem na peron'],
    ['Biletomat', 'Przy wejściu', 'gotówka lub karta'],
    ['Ulga', '−50%', 'legitymacja studencka'],
  ],
};

export const weather = [['13:00', '5°'], ['18:00', '2°'], ['21:00', '0°'], ['noc', '−2°'], ['opady', '0%', 'dry']];

export const wear = [
  ['snow', 'Zimowa kurtka, czapka, rękawiczki'],
  ['layers', 'Warstwy'],
  ['walk', 'Wygodne buty'],
];

export const footer = {
  note: 'Prywatny plan, niezwiązana z GraMuzyka ani Toby Foxem.',
  author: 'Mykyta Mykulskyi',
};

const [outA, , outC] = trains.out.stops;

// Copy that is not a fact of its own: notes, labels, list items. `<b>` marks the key value.
const lunch = { full: '1 h', short: '40 min' }; // Plan B arrives later and shortens lunch
export const copy = {
  countdown: [['d', 'dni'], ['h', 'godz.'], ['m', 'min'], ['s', 'sek']],
  marquee: [`LEGNICA ${outA.dep}`, `WARSZAWA ${outC.arr}`, 'METRO M1', `ARENA ${event.start}`, `RZĄD ${event.row} · MIEJSCE ${event.seat}`],
  planWhy: [
    'Na miejscu: <b>30 min</b> przed startem.',
    'Dojazd z centrum: <b>40 min</b>.',
    `Obiad: <b>${lunch.full}</b>.`,
    `Przyjazd do Warszawy: <b>${outC.arr}</b>.`,
  ],
  planB: `Obiad skrócony: <b>${lunch.short}</b> zamiast ${lunch.full}.`,
  weather: 'Prognoza Open-Meteo, Ursynów.',
  after: [
    `Koniec: <b>20:30</b>.`,
    `Pociąg: <b>${trains.back.stops[0].dep}</b>.`,
    `Kolacja: <b>${dinner.name}</b>, ul. ${dinner.street}, do ${dinner.until}.`,
    'Hala dworca: ogrzewana, otwarta całą noc.',
  ],
};

// A train record in place of a label renders as its ticket.
export const checklist = [
  ['ticket', 'Bilet na koncert'],
  ['id', 'Dowód / legitymacja'],
  ['train1', trains.out],
  ['train2', trains.back],
  ['charger', 'Ładowarka'],
  ['umbrella', 'Ciepłe ubrania'],
  ['snack', 'Woda i przekąska'],
];
