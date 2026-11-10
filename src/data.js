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
  mleczarnia: { name: 'Mleczarnia Jerozolimska', short: 'Mleczarnia', q: 'Mleczarnia Jerozolimska, Emilii Plater 47, Warszawa' },
  prasowy: { name: 'Bar Prasowy', short: 'Prasowy', q: 'Bar Mleczny Prasowy, Marszałkowska 10/16, Warszawa' },
  mCentrum: { name: 'Metro Centrum', short: 'Centrum', q: 'Stacja metra Centrum, Warszawa' },
  mPolitechnika: { name: 'Metro Politechnika', short: 'Politechnika', q: 'Stacja metra Politechnika, Warszawa' },
  mImielin: { name: 'Metro Imielin', short: 'Imielin', q: 'Stacja metra Imielin, Warszawa' },
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
      { name: 'Wrocław Gł.', loc: 'we Wrocławiu', arr: '04:15', dep: '04:42', arrPlatform: 3, platform: 2 },
      { name: 'Legnica', arr: '05:21', platform: 4 },
    ],
  },
  planB: { dep: '11:07', arr: '16:16', legs: [{ carrier: 'KD', no: 'Wrocław' }, { carrier: 'IC', no: '6102', name: 'Ślęża' }] },
};

// Local times of the plan that are not train times: leave the station, leave the restaurant.
export const schedule = { off: '15:50', leave: '17:15' };

const M1 = ['Centrum', 'Politechnika', 'Pole Mokotowskie', 'Racławicka', 'Wierzbno', 'Wilanowska', 'Służew', 'Ursynów', 'Stokłosy', 'Imielin'];
const M1_MIN = 17; // Centrum to Imielin
const exit = { type: 'walk', from: places.mImielin, to: places.arena, dist: '1 km', min: 13 };

// Every restaurant is one record. `walk` = from Centralna, `metro` = its own way to the M1 (the route strategy).
export const restaurants = [
  {
    key: 'bambino', place: places.bambino, street: 'Hoża 19', price: '25–40 zł', hours: '09:00–18:00',
    menu: [['Pierogi ruskie', '18,90 zł'], ['Pierogi z mięsem', '18,90 zł'], ['Schabowy, sam kotlet', '14,50 zł']],
    walk: { min: 17, dist: '1,3 km', note: 'Al. Jerozolimskie na wschód, potem Kruczą na południe.' },
    metro: { station: places.mCentrum, min: 8, dist: '650 m' },
  },
  {
    key: 'mleczarnia', place: places.mleczarnia, street: 'Emilii Plater 47', price: '~30 zł', hours: '08:00–20:00',
    walk: { min: 6, dist: '450 m' },
    metro: { station: places.mCentrum, min: 11, dist: '850 m' },
  },
  {
    key: 'prasowy', place: places.prasowy, street: 'Marszałkowska 10/16', price: '~25 zł', hours: '08:00–20:00',
    walk: { min: 29, dist: '2,2 km' },
    metro: { station: places.mPolitechnika, min: 8, dist: '600 m' },
  },
];

// Route strategy: the same two legs for any restaurant, built from its own walk and metro access.
export const route = (r) => {
  const stations = M1.slice(M1.indexOf(r.metro.station.short));
  const metroMin = Math.round(M1_MIN * (stations.length - 1) / (M1.length - 1));
  return {
    meal: {
      id: `leg-meal-${r.key}`, from: places.centralna, to: r.place, at: schedule.off,
      parts: [{ type: 'walk', from: places.centralna, to: r.place, ...r.walk }],
    },
    arena: {
      id: `leg-arena-${r.key}`, from: r.place, to: places.arena, at: schedule.leave,
      parts: [
        { type: 'walk', from: r.place, to: r.metro.station, min: r.metro.min, dist: r.metro.dist },
        { type: 'metro', from: r.metro.station, to: places.mImielin, line: 'M1', dir: 'Kabaty', min: metroMin, every: '5', stations },
        exit,
      ],
    },
  };
};

export const dinner = { name: 'Gościniec', street: 'Nowy Świat 43', until: '23:00' };

// A leg is split into parts, each with its own map. `at` is when the leg starts; part times follow from `min`.
export const legs = {
  back: {
    from: places.arena, to: places.centralna, at: '20:30',
    parts: [
      { type: 'walk', from: places.arena, to: places.mImielin, min: 13 },
      { type: 'metro', from: places.mImielin, to: places.mCentrum, line: 'M1', dir: 'Młociny', min: M1_MIN, every: '7–8', stations: [...M1].reverse() },
      { type: 'walk', from: places.mCentrum, to: places.centralna, min: 5 },
    ],
  },
};

export const ztm = [['20-min', '3,40 zł'], ['75-min', '4,40 zł', true], ['24h', '15 zł']];

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
