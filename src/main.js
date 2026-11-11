import { initAnchors } from './js/anchors.js';
import { initReveal } from './js/reveal.js';
import { initCountdown } from './js/countdown.js';
import { initUnwrap } from './js/unwrap.js';
import { initTabs } from './js/tabs.js';
import { initChecklist } from './js/checklist.js';
import { initScroll } from './js/scroll.js';
import { initPointer } from './js/pointer.js';
import { initMetro } from './js/metro.js';
import { initTimeline } from './js/timeline.js';

document.documentElement.classList.add('js');

[initAnchors, initReveal, initCountdown, initUnwrap, initTabs, initChecklist, initScroll, initPointer, initMetro, initTimeline].forEach((init) => init());
