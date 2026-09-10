"use strict";

/* ==========================================================================
   Problem First - a product thinking lesson game.
   One lesson = Learn (4 concept cards) -> Practice (3) -> Quiz (5) -> Results.
   All state is in memory; only the best run is persisted to localStorage.
   ========================================================================== */

const PRACTICE_N = 3;
const QUIZ_N = 5;
const TOTAL_Q = PRACTICE_N + QUIZ_N;
const MAX_HEARTS = 3;
const XP_BASE = 10;
const XP_HINTED = 5;
const XP_STREAK_CAP = 20;
const BEST_KEY = "problemfirst.best.v1";
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const PRAISE = ["Nice!", "Great job!", "Excellent!", "Nailed it!", "Spot on!", "Sharp thinking!"];
const PRAISE_HOT = ["You're on fire!", "Unstoppable!", "On a roll!", "Look at you go!"];
const CONSOLE_MSG = ["Almost there!", "Good try!", "Close one!", "Not quite - but now you know."];

const app = document.getElementById("app");
const hudEl = document.getElementById("hud");

const S = {
  screen: "start",   // start | learn | bridge | question | paused | results | review
  cardIdx: 0,
  deck: [],          // 8 questions, practice first
  i: 0,              // index into deck
  chosen: [],        // display-index picked per question (null = unanswered)
  hinted: [],        // bool per question
  locked: false,     // current question answered?
  xp: 0,
  streak: 0,
  bestStreak: 0,
  correct: 0,
  hearts: MAX_HEARTS,
  heartFlash: false,
  pending: null,     // queued milestone, shown on Continue
  hitMilestone: {},  // milestone keys already awarded
};

/* -------------------------------------------------------------- utilities */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prefer one question per module so a run spreads across the pathway.
function pickSpread(pool, n) {
  const bag = shuffled(pool);
  const out = [];
  const used = new Set();
  for (const q of bag) {
    if (out.length === n) break;
    if (!used.has(q.module)) { out.push(q); used.add(q.module); }
  }
  for (const q of bag) {
    if (out.length === n) break;
    if (!out.includes(q)) out.push(q);
  }
  return out;
}

function withShuffledOptions(q, stage) {
  const order = shuffled(q.options.map((_, i) => i));
  return {
    ...q,
    stage,
    shownOptions: order.map((i) => q.options[i]),
    shownAnswer: order.indexOf(q.answer),
  };
}

/* ------------------------------------------------------------------ artwork
   All illustration is inline SVG - no external assets, no third-party art. */

// The lesson mascot: "Beacon", a friendly lamp-headed thinker.
function mascot(mood = "happy", cls = "md") {
  const eyes = {
    happy: '<circle cx="41" cy="60" r="5.4" fill="#241b4b"/><circle cx="67" cy="60" r="5.4" fill="#241b4b"/>',
    cheer: '<path d="M35 61q6-8 12 0" stroke="#241b4b" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M61 61q6-8 12 0" stroke="#241b4b" stroke-width="4.4" fill="none" stroke-linecap="round"/>',
    think: '<circle cx="43" cy="57" r="5.4" fill="#241b4b"/><circle cx="69" cy="57" r="5.4" fill="#241b4b"/>',
    oops:  '<path d="M35 58h12" stroke="#241b4b" stroke-width="4.4" stroke-linecap="round"/><path d="M61 58h12" stroke="#241b4b" stroke-width="4.4" stroke-linecap="round"/>',
  }[mood] || "";

  const mouth = {
    happy: '<path d="M42 74q12 11 24 0" stroke="#241b4b" stroke-width="4.4" fill="none" stroke-linecap="round"/>',
    cheer: '<path d="M40 71q14 20 28 0z" fill="#241b4b"/><path d="M47 79q7 5 14 0" fill="#ff8fa0"/>',
    think: '<path d="M45 76h18" stroke="#241b4b" stroke-width="4.4" stroke-linecap="round"/>',
    oops:  '<path d="M43 79q11-9 22 0" stroke="#241b4b" stroke-width="4.4" fill="none" stroke-linecap="round"/>',
  }[mood] || "";

  const glow = mood === "cheer" || mood === "happy";

  return `
  <svg class="mascot ${cls} ${mood === "cheer" ? "" : "bob"}" viewBox="0 0 108 132" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8a6bff"/><stop offset="1" stop-color="#5a37e0"/>
      </linearGradient>
      <radialGradient id="bulb" cx=".4" cy=".35">
        <stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#ffb53d"/>
      </radialGradient>
    </defs>
    <!-- idea bulb -->
    <g opacity="${glow ? 1 : 0.75}">
      ${glow ? '<circle cx="54" cy="16" r="15" fill="#ffb53d" opacity=".22"/>' : ""}
      <path d="M54 26v6" stroke="#5a37e0" stroke-width="5" stroke-linecap="round"/>
      <circle cx="54" cy="16" r="10" fill="url(#bulb)" stroke="#e0930f" stroke-width="2.5"/>
      <path d="M50 16h8" stroke="#c47c06" stroke-width="2" stroke-linecap="round"/>
    </g>
    <!-- body -->
    <rect x="12" y="32" width="84" height="74" rx="26" fill="url(#mg)"/>
    <rect x="20" y="42" width="68" height="50" rx="20" fill="#fff9f2"/>
    ${eyes}
    ${mouth}
    <circle cx="28" cy="72" r="5" fill="#ff8fa0" opacity=".55"/>
    <circle cx="80" cy="72" r="5" fill="#ff8fa0" opacity=".55"/>
    <!-- arms + feet -->
    <path d="${mood === "cheer" ? "M12 62 0 40" : "M12 74 2 84"}" stroke="#5a37e0" stroke-width="8" stroke-linecap="round"/>
    <path d="${mood === "cheer" ? "M96 62 108 40" : "M96 74 106 84"}" stroke="#5a37e0" stroke-width="8" stroke-linecap="round"/>
    <rect x="26" y="104" width="22" height="12" rx="6" fill="#4f31d1"/>
    <rect x="60" y="104" width="22" height="12" rx="6" fill="#4f31d1"/>
  </svg>`;
}

function heartSvg(full, flash) {
  return `<svg class="${full ? "" : "heart-gone"} ${flash ? "heart-lost" : ""}" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-8-5.1-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 15.9 12 21 12 21z"
      fill="${full ? "#ff5d73" : "#c9c3dd"}" stroke="${full ? "#d63a52" : "#b3accb"}" stroke-width="1.6"/>
  </svg>`;
}

// Concept diagrams for the Learn stage.
const ART = {
  problem: `
  <svg class="art" viewBox="0 0 340 170" role="img" aria-label="Solution-first leads to a dead end; problem-first leads to the right build.">
    <rect x="6" y="26" width="140" height="58" rx="16" fill="#ffe9ec" stroke="#ff5d73" stroke-width="2.5"/>
    <text x="76" y="50" text-anchor="middle" font-size="13" font-weight="800" fill="#8f1f33">"We need</text>
    <text x="76" y="68" text-anchor="middle" font-size="13" font-weight="800" fill="#8f1f33">a chatbot"</text>
    <path d="M150 55h32" stroke="#918bb0" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="7 6"/>
    <circle cx="212" cy="55" r="26" fill="#fff" stroke="#ff5d73" stroke-width="3"/>
    <path d="M202 45l20 20M222 45l-20 20" stroke="#ff5d73" stroke-width="4" stroke-linecap="round"/>
    <text x="212" y="99" text-anchor="middle" font-size="11" font-weight="900" fill="#8f1f33">WRONG PROBLEM</text>
    <rect x="6" y="104" width="140" height="58" rx="16" fill="#dffaf5" stroke="#14b8a6" stroke-width="2.5"/>
    <text x="76" y="128" text-anchor="middle" font-size="13" font-weight="800" fill="#0b5c53">"Why are</text>
    <text x="76" y="146" text-anchor="middle" font-size="13" font-weight="800" fill="#0b5c53">they calling?"</text>
    <path d="M150 133h32" stroke="#14b8a6" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="212" cy="133" r="26" fill="#e2fbee" stroke="#1fbf75" stroke-width="3"/>
    <path d="M201 133l8 9 14-17" stroke="#1fbf75" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(268 60)">
      <circle cx="24" cy="24" r="21" fill="#efeaff" stroke="#6c4cf1" stroke-width="3.5"/>
      <path d="M39 39l14 14" stroke="#6c4cf1" stroke-width="6" stroke-linecap="round"/>
      <text x="24" y="30" text-anchor="middle" font-size="19" font-weight="900" fill="#4f31d1">?</text>
    </g>
  </svg>`,

  fourcs: `
  <svg class="art" viewBox="0 0 340 180" role="img" aria-label="The four Cs: Clarity, Consequence, Cause, Confirmation.">
    <g>
      <rect x="8" y="8" width="156" height="76" rx="18" fill="#efeaff" stroke="#6c4cf1" stroke-width="2.5"/>
      <text x="30" y="40" font-size="22">&#128269;</text>
      <text x="60" y="38" font-size="14" font-weight="900" fill="#4f31d1">Clarity</text>
      <text x="60" y="58" font-size="11" font-weight="700" fill="#5b5480">what happens</text>
    </g>
    <g>
      <rect x="176" y="8" width="156" height="76" rx="18" fill="#ffe9ec" stroke="#ff5d73" stroke-width="2.5"/>
      <text x="198" y="40" font-size="22">&#128165;</text>
      <text x="228" y="38" font-size="14" font-weight="900" fill="#a32639">Consequence</text>
      <text x="228" y="58" font-size="11" font-weight="700" fill="#5b5480">who it hurts</text>
    </g>
    <g>
      <rect x="8" y="96" width="156" height="76" rx="18" fill="#dffaf5" stroke="#14b8a6" stroke-width="2.5"/>
      <text x="30" y="128" font-size="22">&#129517;</text>
      <text x="60" y="126" font-size="14" font-weight="900" fill="#0b7a6e">Cause</text>
      <text x="60" y="146" font-size="11" font-weight="700" fill="#5b5480">why it happens</text>
    </g>
    <g>
      <rect x="176" y="96" width="156" height="76" rx="18" fill="#fff2d8" stroke="#ffb53d" stroke-width="2.5"/>
      <text x="198" y="128" font-size="22">&#128202;</text>
      <text x="228" y="126" font-size="14" font-weight="900" fill="#8a5a00">Confirmation</text>
      <text x="228" y="146" font-size="11" font-weight="700" fill="#5b5480">the evidence</text>
    </g>
  </svg>`,

  outcome: `
  <svg class="art" viewBox="0 0 340 170" role="img" aria-label="Outputs are things you shipped; the outcome is renewal time falling from nine days to two.">
    <text x="14" y="20" font-size="11" font-weight="900" fill="#918bb0" letter-spacing="1.5">OUTPUTS</text>
    <rect x="10" y="28" width="120" height="26" rx="10" fill="#f2eefc" stroke="#e7e0f5" stroke-width="2"/>
    <text x="22" y="45" font-size="11" font-weight="800" fill="#5b5480">14 features shipped</text>
    <rect x="10" y="60" width="120" height="26" rx="10" fill="#f2eefc" stroke="#e7e0f5" stroke-width="2"/>
    <text x="22" y="77" font-size="11" font-weight="800" fill="#5b5480">12,000 downloads</text>
    <rect x="10" y="92" width="120" height="26" rx="10" fill="#f2eefc" stroke="#e7e0f5" stroke-width="2"/>
    <text x="22" y="109" font-size="11" font-weight="800" fill="#5b5480">5 offices live</text>
    <path d="M138 74h30" stroke="#918bb0" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 5"/>
    <text x="152" y="64" text-anchor="middle" font-size="10" font-weight="900" fill="#918bb0">so?</text>
    <text x="182" y="20" font-size="11" font-weight="900" fill="#0b7a6e" letter-spacing="1.5">OUTCOME</text>
    <rect x="178" y="28" width="154" height="112" rx="18" fill="#e2fbee" stroke="#1fbf75" stroke-width="2.5"/>
    <rect x="196" y="46" width="34" height="74" rx="8" fill="#ff5d73" opacity=".85"/>
    <text x="213" y="136" text-anchor="middle" font-size="11" font-weight="900" fill="#8f1f33">9 days</text>
    <rect x="278" y="104" width="34" height="16" rx="8" fill="#1fbf75"/>
    <text x="295" y="136" text-anchor="middle" font-size="11" font-weight="900" fill="#0d6b41">2 days</text>
    <path d="M240 60q26 6 38 36" stroke="#1fbf75" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M272 88l7 10 10-5" stroke="#1fbf75" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="255" y="163" text-anchor="middle" font-size="11" font-weight="900" fill="#0d6b41">time to renew a permit</text>
  </svg>`,

  stages: `
  <svg class="art" viewBox="0 0 340 170" role="img" aria-label="Four rising stages: proof of concept, proof of value, scale, maturity.">
    <rect x="8" y="116" width="72" height="44" rx="14" fill="#efeaff" stroke="#6c4cf1" stroke-width="2.5"/>
    <text x="44" y="136" text-anchor="middle" font-size="10" font-weight="900" fill="#4f31d1">PROOF OF</text>
    <text x="44" y="150" text-anchor="middle" font-size="10" font-weight="900" fill="#4f31d1">CONCEPT</text>
    <rect x="88" y="90" width="72" height="70" rx="14" fill="#dffaf5" stroke="#14b8a6" stroke-width="2.5"/>
    <text x="124" y="112" text-anchor="middle" font-size="10" font-weight="900" fill="#0b7a6e">PROOF OF</text>
    <text x="124" y="126" text-anchor="middle" font-size="10" font-weight="900" fill="#0b7a6e">VALUE</text>
    <rect x="168" y="62" width="72" height="98" rx="14" fill="#fff2d8" stroke="#ffb53d" stroke-width="2.5"/>
    <text x="204" y="86" text-anchor="middle" font-size="10" font-weight="900" fill="#8a5a00">SCALE</text>
    <rect x="248" y="34" width="84" height="126" rx="14" fill="#e2fbee" stroke="#1fbf75" stroke-width="2.5"/>
    <text x="290" y="58" text-anchor="middle" font-size="10" font-weight="900" fill="#0d6b41">MATURITY</text>
    <path d="M28 106q60-58 130-70" stroke="#918bb0" stroke-width="3" fill="none" stroke-dasharray="6 6" stroke-linecap="round"/>
    <g transform="translate(272 8)">
      <path d="M4 26V2" stroke="#4f31d1" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M6 4h20l-6 7 6 7H6z" fill="#ffb53d" stroke="#e0930f" stroke-width="2"/>
    </g>
    <text x="170" y="14" text-anchor="middle" font-size="11" font-weight="900" fill="#918bb0" letter-spacing="1.2">EACH STAGE BUYS THE RIGHT TO SPEND MORE</text>
  </svg>`,
};

/* -------------------------------------------------------------------- deck */

function buildDeck() {
  const scenarios = QUESTIONS.filter((q) => q.scenario);
  const plain = QUESTIONS.filter((q) => !q.scenario);
  S.deck = [
    ...pickSpread(plain, PRACTICE_N).map((q) => withShuffledOptions(q, "practice")),
    ...pickSpread(scenarios, QUIZ_N).map((q) => withShuffledOptions(q, "quiz")),
  ];
  S.i = 0;
  S.chosen = S.deck.map(() => null);
  S.hinted = S.deck.map(() => false);
  S.locked = false;
  S.xp = 0;
  S.streak = 0;
  S.bestStreak = 0;
  S.correct = 0;
  S.hearts = MAX_HEARTS;
  S.cardIdx = 0;
  S.pending = null;
  S.hitMilestone = {};
}

const cur = () => S.deck[S.i];
const isRight = (i) => S.chosen[i] !== null && S.chosen[i] === S.deck[i].shownAnswer;
const answeredCount = () => S.chosen.filter((c) => c !== null).length;

function readBest() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY)) || null; } catch { return null; }
}
function writeBest() {
  try {
    const prev = readBest();
    if (!prev || S.xp > prev.xp) {
      localStorage.setItem(BEST_KEY, JSON.stringify({ xp: S.xp, correct: S.correct, streak: S.bestStreak }));
    }
  } catch { /* private browsing - a best score is a nicety, not a requirement */ }
}

/* --------------------------------------------------------------------- HUD */

function journey(active) {
  const steps = [["learn", "Learn"], ["practice", "Practice"], ["quiz", "Quiz"], ["results", "Results"]];
  const order = steps.map(([k]) => k);
  const at = order.indexOf(active);
  return `<div class="journey">${steps.map(([k, label], n) => {
    const cls = n < at ? "done" : n === at ? "on" : "";
    const icon = n < at ? "&#10003;" : ["&#128218;", "&#127919;", "&#9889;", "&#127881;"][n];
    return `${n ? '<span class="arr">&rsaquo;</span>' : ""}
      <span class="step ${cls}">${icon}<span class="lbl">${label}</span></span>`;
  }).join("")}</div>`;
}

function renderHud() {
  if (S.screen !== "question" && S.screen !== "learn") { hudEl.innerHTML = ""; return; }

  const done = S.screen === "learn" ? S.cardIdx : CARDS.length + answeredCount();
  const totalSteps = CARDS.length + TOTAL_Q;
  const pctBar = Math.round((done / totalSteps) * 100);
  const label = S.screen === "learn"
    ? `Concept ${Math.min(S.cardIdx + 1, CARDS.length)} of ${CARDS.length}`
    : `Question ${S.i + 1} of ${TOTAL_Q}`;

  const hearts = Array.from({ length: MAX_HEARTS }, (_, n) =>
    heartSvg(n < S.hearts, S.heartFlash && n === S.hearts)).join("");
  S.heartFlash = false;

  const stage = S.screen === "learn" ? "Learn"
    : cur().stage === "practice" ? "Practice" : "Quiz round";

  hudEl.innerHTML = `
    <div class="hud-row">
      <button class="quit" id="quit" title="Leave lesson" aria-label="Leave lesson">&times;</button>
      <div class="track" role="progressbar" aria-valuenow="${pctBar}" aria-valuemin="0" aria-valuemax="100"
           aria-label="${label}"><i style="width:${pctBar}%"></i></div>
      <div class="hearts" aria-label="${S.hearts} of ${MAX_HEARTS} hearts left">${hearts}</div>
    </div>
    <div class="chips">
      <span class="chip stage">${stage}</span>
      <span class="chip count">${label}</span>
      <span class="chip xp" id="chip-xp">&#9889; <b>${S.xp}</b> XP</span>
      <span class="chip streak ${S.streak >= 3 ? "hot" : ""}" id="chip-streak">&#128293; <b>${S.streak}</b> streak</span>
      ${S.screen === "question" && cur().stage === "practice"
        ? '<span class="chip">warm-up &middot; hearts safe</span>' : ""}
    </div>`;

  const quit = document.getElementById("quit");
  if (quit) quit.addEventListener("click", () => {
    if (answeredCount() === 0) { S.screen = "start"; render(); }
    else finish();
  });
}

function bumpChip(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

/* ------------------------------------------------------------------ screens */

function render() {
  renderHud();
  const view = {
    start: startScreen, learn: learnScreen, bridge: bridgeScreen,
    question: questionScreen, paused: pausedScreen, results: resultsScreen, review: reviewScreen,
  }[S.screen];
  app.innerHTML = `<div class="screen">${view()}</div>`;
  wire();
  const first = app.querySelector("[data-autofocus]");
  if (first) first.focus({ preventScroll: true });
}

function startScreen() {
  const best = readBest();
  return `
    <div class="card center stack">
      ${mascot("happy", "lg")}
      <div>
        <p class="kicker">Product thinking &middot; Lesson 1</p>
        <h1>Problem First</h1>
        <p class="lede">Eight questions on diagnosing problems before building solutions.
        Learn the ideas, practise them, then earn your XP.</p>
      </div>
      ${journey("learn")}
      <div class="rules">
        <div class="rule"><span class="ic v">&#9889;</span><span><b>Earn XP</b> for every correct answer, plus a bonus while your streak is alive.</span></div>
        <div class="rule"><span class="ic c">&#10084;&#65039;</span><span><b>Three hearts</b> in the quiz round. Practice is free - mistakes there just teach you something.</span></div>
        <div class="rule"><span class="ic s">&#128161;</span><span><b>Stuck? Take a hint.</b> It costs you some XP, never your progress.</span></div>
        <div class="rule"><span class="ic t">&#128218;</span><span><b>Every answer is explained</b>, so a wrong one is still worth something.</span></div>
      </div>
      ${best ? `<div class="badges">
        <span class="badge">&#127942; Best run: <b>&nbsp;${best.xp} XP</b></span>
        <span class="badge">&#127919; ${best.correct}/${TOTAL_Q} correct</span>
        <span class="badge">&#128293; ${best.streak} streak</span>
      </div>` : ""}
      <div class="actions" style="justify-content:center">
        <button class="btn go lg wide" id="begin" data-autofocus>Start lesson &nbsp;&rarr;</button>
      </div>
      <p class="tiny muted" style="margin:0">Takes about 5 minutes &middot; nothing is sent anywhere</p>
    </div>`;
}

function learnScreen() {
  const c = CARDS[S.cardIdx];
  const last = S.cardIdx === CARDS.length - 1;
  return `
    ${journey("learn")}
    <div class="card" style="margin-top:14px">
      <p class="kicker">${esc(c.kicker)}</p>
      <h2>${esc(c.title)}</h2>
      ${ART[c.art] || ""}
      <p class="why" style="font-size:1.04rem">${c.body}</p>
      <div class="keep"><span>&#128161;</span><div>${c.keep}</div></div>
      <div class="actions">
        <button class="btn primary lg" id="card-next" data-autofocus>${last ? "I'm ready &nbsp;&rarr;" : "Got it &nbsp;&rarr;"}</button>
        <span class="keyhint">or press Enter</span>
      </div>
    </div>`;
}

// Interstitial between stages: keeps the lesson feeling like a journey.
function bridgeScreen() {
  const toQuiz = S.i === PRACTICE_N;
  const body = toQuiz
    ? {
        stage: "quiz",
        mood: "think",
        kicker: "Quiz round",
        title: "Hearts count now",
        line: `Five scenarios, three hearts. Take your time - you have <b>${S.xp} XP</b> banked already.`,
        cta: "Bring it on &nbsp;&rarr;",
      }
    : {
        stage: "practice",
        mood: "cheer",
        kicker: "Practice",
        title: "Your turn",
        line: "Three warm-up questions. No hearts at stake - this is just to make the ideas stick.",
        cta: "Let's practise &nbsp;&rarr;",
      };
  return `
    ${journey(body.stage)}
    <div class="card center stack" style="margin-top:14px">
      ${mascot(body.mood, "md")}
      <div>
        <p class="kicker">${body.kicker}</p>
        <h2>${body.title}</h2>
        <div class="speech">${body.line}</div>
      </div>
      <div class="actions" style="justify-content:center">
        <button class="btn go lg" id="bridge-next" data-autofocus>${body.cta}</button>
      </div>
    </div>`;
}

function questionScreen() {
  const q = cur();
  const mod = MODULES[q.module];
  const chosen = S.chosen[S.i];
  const hintOut = S.hinted[S.i] ? hintDrops(q) : [];

  const opts = q.shownOptions.map((text, i) => {
    let cls = "opt";
    if (S.locked) {
      if (i === q.shownAnswer) cls += " correct";
      else if (i === chosen) cls += " wrong";
      else cls += " dim";
    } else if (hintOut.includes(i)) {
      cls += " hint-out";
    }
    const mark = S.locked && i === q.shownAnswer ? "&#10003;"
      : S.locked && i === chosen ? "&#10007;" : "";
    return `<button class="${cls}" data-opt="${i}" ${S.locked ? "disabled" : ""}>
        <span class="key">${LETTERS[i]}</span>
        <span>${esc(text)}</span>
        ${mark ? `<span class="mark">${mark}</span>` : ""}
      </button>`;
  }).join("");

  return `
    ${journey(q.stage)}
    <div class="card" style="margin-top:14px">
      <div class="qmeta">
        <span class="tag">Module ${q.module} &middot; ${esc(mod.name)}</span>
      </div>
      ${q.scenario ? `<p class="scenario">${esc(q.scenario)}</p>` : ""}
      <p class="qtext">${esc(q.q)}</p>
      <div class="options">${opts}</div>
      ${!S.locked ? `
        <div class="actions">
          <button class="btn hint" id="hint" ${S.hinted[S.i] ? "disabled" : ""}>
            &#128161; ${S.hinted[S.i] ? "Hint used" : "Hint (-5 XP)"}
          </button>
          <span class="keyhint">Keys 1&ndash;${q.shownOptions.length} to answer</span>
        </div>
        ${S.hinted[S.i] ? `<div class="hintbox"><span>&#128161;</span><div>${esc(q.hint)}</div></div>` : ""}`
      : feedback()}
    </div>`;
}

function feedback() {
  const q = cur();
  const right = isRight(S.i);
  const last = S.i === TOTAL_Q - 1;
  const gained = S.lastGain || 0;
  const word = right ? (S.streak >= 3 ? pick(PRAISE_HOT) : pick(PRAISE)) : pick(CONSOLE_MSG);
  const heartNote = !right && q.stage === "quiz"
    ? `<p class="tiny muted" style="margin:10px 0 0">A heart went - ${S.hearts} left. Your streak starts fresh.</p>`
    : !right ? '<p class="tiny muted" style="margin:10px 0 0">Practice round, so no heart lost.</p>' : "";

  return `
    <div class="sheet ${right ? "good" : "bad"}">
      <div class="verdict">
        <span class="face">${mascot(right ? "cheer" : "oops", "sm")}</span>
        <span class="word">${word}</span>
        ${right ? `<span class="plus">+${gained} XP</span>` : ""}
      </div>
      ${right ? "" : `<p class="answer-was">The answer: <b>${esc(q.shownOptions[q.shownAnswer])}</b></p>`}
      <p class="why">${q.why}</p>
      ${heartNote}
      <p class="srcline">Read more &rarr;
        <a href="${esc(MODULES[q.module].url)}" target="_blank" rel="noopener">${esc(MODULES[q.module].name)}</a></p>
      <div class="actions">
        <button class="btn ${right ? "go" : "primary"} lg" id="next" data-autofocus>
          ${last ? "See results &nbsp;&#127881;" : "Continue &nbsp;&rarr;"}
        </button>
        <span class="keyhint">or press Enter</span>
      </div>
    </div>`;
}

function pausedScreen() {
  return `
    <div class="card center stack">
      ${mascot("oops", "md")}
      <div>
        <p class="kicker">Out of hearts</p>
        <h2>Take a breath</h2>
        <p class="lede">You've answered ${answeredCount()} of ${TOTAL_Q} and banked <b>${S.xp} XP</b>.
        Nothing is lost - refill and keep going, or wrap up here.</p>
      </div>
      <div class="actions" style="justify-content:center">
        <button class="btn go lg" id="refill" data-autofocus>&#10084;&#65039; Refill hearts &amp; continue</button>
        <button class="btn ghost" id="stop">See my results</button>
      </div>
    </div>`;
}

function tierFor(pctCorrect) {
  if (pctCorrect === 100) return { emoji: "&#127942;", title: "Perfect run!", line: "Eight for eight. You're thinking in problems, not solutions.", party: true };
  if (pctCorrect >= 75)  return { emoji: "&#127881;", title: "Amazing!", line: "Strong instincts - the habits are clearly there.", party: true };
  if (pctCorrect >= 50)  return { emoji: "&#127775;", title: "Solid work!", line: "A good grasp, with a couple of ideas worth a second look.", party: false };
  return { emoji: "&#128170;", title: "Good effort!", line: "You learned something new today. Run it again and see if you can beat your score.", party: false };
}

function resultsScreen() {
  const total = TOTAL_Q;
  const answered = answeredCount();
  const pctCorrect = Math.round((S.correct / total) * 100);
  const tier = tierFor(pctCorrect);
  const best = readBest();
  const beat = best && S.xp >= best.xp;

  // per-module dots
  const mods = {};
  S.deck.forEach((q, i) => {
    const m = (mods[q.module] ||= []);
    m.push(S.chosen[i] === null ? null : isRight(i));
  });
  const modRows = Object.keys(mods).sort((a, b) => a - b).map((k) => `
    <div class="modbar">
      <span><a href="${esc(MODULES[k].url)}" target="_blank" rel="noopener">${esc(MODULES[k].name)}</a></span>
      <span class="dots">${mods[k].map((ok) => `<span class="dot ${ok ? "ok" : "no"}"></span>`).join("")}</span>
    </div>`).join("");

  const circ = 2 * Math.PI * 54;
  const off = circ * (1 - pctCorrect / 100);

  return `
    ${journey("results")}
    <div class="card hero" style="margin-top:14px">
      <span class="tier">${tier.emoji}</span>
      <h1>${tier.title}</h1>
      <p class="line">${tier.line}</p>
      <div class="xpbig">&#9889; You earned ${S.xp} XP</div>
      <p class="line" style="font-size:.95rem">${S.correct} / ${total} correct &nbsp;&middot;&nbsp; &#128293; ${S.bestStreak} question streak</p>
      ${beat && best ? `<p class="tiny muted" style="margin-top:10px">&#127942; New personal best!</p>`
        : best ? `<p class="tiny muted" style="margin-top:10px">Your best is ${best.xp} XP - ${best.xp - S.xp} more to beat it.</p>` : ""}
      <svg class="ring" viewBox="0 0 128 128" style="margin-top:18px" role="img" aria-label="${pctCorrect}% correct">
        <defs><linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#6c4cf1"/>
        </linearGradient></defs>
        <circle class="bg" cx="64" cy="64" r="54"/>
        <circle class="fg" cx="64" cy="64" r="54" transform="rotate(-90 64 64)"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
        <text x="64" y="60" text-anchor="middle" font-size="27">${pctCorrect}%</text>
        <text x="64" y="80" text-anchor="middle" font-size="11" fill="#918bb0" letter-spacing="1">CORRECT</text>
      </svg>
      <div class="stats">
        <div class="stat a"><div class="v">${S.correct}/${total}</div><div class="k">Final score</div></div>
        <div class="stat b"><div class="v">${S.xp}</div><div class="k">XP earned</div></div>
        <div class="stat c"><div class="v">&#128293; ${S.bestStreak}</div><div class="k">Best streak</div></div>
        <div class="stat d"><div class="v">${answered}/${total}</div><div class="k">Questions done</div></div>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <h3>How you did by module</h3>
      <div class="modbars">${modRows}</div>
    </div>

    <div class="stack" style="margin-top:14px">
      <button class="btn primary lg wide" id="review" data-autofocus>&#128203; Review answers</button>
      <button class="btn ghost wide" id="again">&#128260; Try again</button>
      <a class="btn go wide" href="https://www.idg.gov.sg/product-thinking/" target="_blank" rel="noopener">
        &#128218; Continue learning &nbsp;&rarr;</a>
    </div>`;
}

function reviewScreen() {
  const rows = S.deck.map((q, i) => {
    const ok = isRight(i);
    const mine = S.chosen[i] === null ? "&mdash; not answered" : esc(q.shownOptions[S.chosen[i]]);
    return `
      <div class="rq ${ok ? "ok" : "no"}">
        <p class="rq-q">${i + 1}. ${esc(q.q)}</p>
        ${q.scenario ? `<p class="rq-l">${esc(q.scenario)}</p>` : ""}
        <p class="rq-l">${ok ? "&#10003;" : "&#10007;"} You picked: <b>${mine}</b></p>
        ${ok ? "" : `<p class="rq-l">&#10003; Answer: <b>${esc(q.shownOptions[q.shownAnswer])}</b></p>`}
        <p class="rq-why">${q.why}</p>
        <p class="srcline">Module ${q.module}:
          <a href="${esc(MODULES[q.module].url)}" target="_blank" rel="noopener">${esc(MODULES[q.module].name)}</a></p>
      </div>`;
  }).join("");

  return `
    <div class="card">
      <p class="kicker">Review</p>
      <h2>All ${TOTAL_Q} questions</h2>
      <p class="lede">${S.correct} correct, ${TOTAL_Q - S.correct} to revisit.</p>
    </div>
    <div class="review" style="margin-top:14px">${rows}</div>
    <div class="stack" style="margin-top:14px">
      <button class="btn primary lg wide" id="back" data-autofocus>&larr; Back to results</button>
      <button class="btn ghost wide" id="again">&#128260; Try again</button>
    </div>`;
}

/* ----------------------------------------------------------------- wiring */

function wire() {
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };

  on("begin", () => { S.screen = "learn"; S.cardIdx = 0; render(); });
  on("card-next", () => {
    if (S.cardIdx < CARDS.length - 1) { S.cardIdx += 1; S.screen = "learn"; }
    else { S.screen = "bridge"; }
    render(); toTop();
  });
  on("bridge-next", () => { S.screen = "question"; render(); toTop(); });
  on("hint", useHint);
  on("next", advance);
  on("refill", () => { S.hearts = MAX_HEARTS; S.screen = "question"; render(); toTop(); });
  on("stop", finish);
  on("review", () => { S.screen = "review"; render(); toTop(); });
  on("back", () => { S.screen = "results"; render(); toTop(); });
  on("again", () => { buildDeck(); S.screen = "bridge"; S.i = 0; render(); toTop(); });

  app.querySelectorAll("[data-opt]").forEach((b) =>
    b.addEventListener("click", () => choose(Number(b.dataset.opt))));
}

const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

// A hint dims two wrong options and costs a slice of the reward.
function hintDrops(q) {
  const wrong = q.shownOptions.map((_, i) => i).filter((i) => i !== q.shownAnswer);
  // deterministic per question so re-renders don't reshuffle the dimmed pair
  return wrong.filter((i) => (i + q.q.length) % 3 !== 0).slice(0, 2);
}

function useHint() {
  if (S.locked || S.hinted[S.i]) return;
  S.hinted[S.i] = true;
  render();
}

function choose(optIdx) {
  if (S.locked) return;
  S.chosen[S.i] = optIdx;
  S.locked = true;

  const q = cur();
  const right = optIdx === q.shownAnswer;

  if (right) {
    S.correct += 1;
    S.streak += 1;
    S.bestStreak = Math.max(S.bestStreak, S.streak);
    const base = S.hinted[S.i] ? XP_HINTED : XP_BASE;
    const bonus = S.hinted[S.i] ? 0 : Math.min((S.streak - 1) * 5, XP_STREAK_CAP);
    S.lastGain = base + bonus;
    S.xp += S.lastGain;
  } else {
    S.streak = 0;
    S.lastGain = 0;
    if (q.stage === "quiz") { S.hearts -= 1; S.heartFlash = true; }
  }
  queueMilestones();

  render();
  if (right) {
    xpFloat(`+${S.lastGain} XP`);
    bumpChip("chip-xp");
    bumpChip("chip-streak");
    burst(right ? 18 : 0);
  }
}

function queueMilestones() {
  const key = (k) => !S.hitMilestone[k] && (S.hitMilestone[k] = true);

  if (S.streak === 3 && key("s3")) {
    S.xp += 25;
    S.pending = { emoji: "&#128293;", title: "You're on fire!", sub: "Three correct in a row.", bonus: 25, mood: "cheer" };
  } else if (S.streak === 5 && key("s5")) {
    S.xp += 50;
    S.pending = { emoji: "&#9889;", title: "Unstoppable!", sub: "Five in a row - that's real fluency.", bonus: 50, mood: "cheer" };
  } else if (answeredCount() === 4 && key("half")) {
    S.xp += 15;
    S.pending = { emoji: "&#127937;", title: "Halfway there!", sub: "Four down, four to go. Keep the momentum.", bonus: 15, mood: "happy" };
  }
}

function advance() {
  const goNext = () => {
    if (S.i === TOTAL_Q - 1) { finish(); return; }
    S.i += 1;
    S.locked = false;
    // Out of hearts pauses the lesson rather than ending it - the next question
    // is already queued up, so a refill drops straight back into it.
    S.screen = S.hearts <= 0 ? "paused" : (S.i === PRACTICE_N ? "bridge" : "question");
    render(); toTop();
  };

  if (S.pending) {
    const m = S.pending;
    S.pending = null;
    showMilestone(m, goNext);
  } else {
    goNext();
  }
}

function finish() {
  writeBest();
  S.screen = "results";
  render();
  toTop();
  if (tierFor(Math.round((S.correct / TOTAL_Q) * 100)).party) burst(120);
}

/* ------------------------------------------------------------ celebrations */

function xpFloat(text) {
  const el = document.createElement("div");
  el.className = "xpfloat";
  el.style.top = "38%";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showMilestone(m, done) {
  const wrap = document.createElement("div");
  wrap.className = "milestone";
  wrap.innerHTML = `
    <div class="box">
      <span class="big">${m.emoji}</span>
      ${mascot(m.mood || "cheer", "sm")}
      <h2>${m.title}</h2>
      <p class="muted" style="margin:0">${m.sub}</p>
      <span class="bonus">+${m.bonus} bonus XP</span>
    </div>`;
  document.body.appendChild(wrap);
  burst(60);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    wrap.remove();
    done();
  };
  wrap.addEventListener("click", close);
  setTimeout(close, 1900);
}

function burst(n) {
  if (!n || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#6c4cf1", "#14b8a6", "#ffb53d", "#ff5d73", "#1fbf75", "#8a6bff"];
  const layer = document.createElement("div");
  layer.className = "confetti";
  let html = "";
  for (let k = 0; k < n; k++) {
    const c = colors[k % colors.length];
    html += `<i style="left:${Math.random() * 100}%;background:${c};
      --dur:${(1.7 + Math.random() * 1.6).toFixed(2)}s;--delay:${(Math.random() * 0.5).toFixed(2)}s;
      border-radius:${Math.random() < 0.4 ? "50%" : "3px"};
      width:${7 + Math.round(Math.random() * 6)}px;height:${7 + Math.round(Math.random() * 6)}px"></i>`;
  }
  layer.innerHTML = html;
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3600);
}

/* -------------------------------------------------------------- keyboard */

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const openMilestone = document.querySelector(".milestone");
  if (openMilestone && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault(); openMilestone.click(); return;
  }

  if (e.key === "Enter" || e.key === " ") {
    const btn = document.querySelector("[data-autofocus]");
    if (btn && btn.tagName === "BUTTON" && document.activeElement !== btn) {
      e.preventDefault(); btn.click();
    }
    return;
  }

  if (S.screen === "question" && !S.locked) {
    if (e.key.toLowerCase() === "h") { e.preventDefault(); useHint(); return; }
    const n = parseInt(e.key, 10);
    if (Number.isFinite(n) && n >= 1 && n <= cur().shownOptions.length) {
      e.preventDefault(); choose(n - 1);
    }
  }
});

/* ------------------------------------------------------------------- boot */

buildDeck();
render();
