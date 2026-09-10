# 💡 Problem First

A short, gamified lesson on **product thinking** — built to feel like a language-learning
game rather than a corporate training quiz.

**▶️ Play it: https://zhenyu92.github.io/product-thinking-quiz/**

No build step, no dependencies, no accounts, no tracking. Three static files and a browser.

---

## The lesson journey

```
📚 Learn  ›  🎯 Practice  ›  ⚡ Quiz  ›  🎉 Results
   4 cards      3 questions    5 questions
```

- **Learn** — four illustrated concept cards (problems before solutions, the 4Cs,
  outcomes vs outputs, de-risking in stages), each ending in one line worth keeping.
- **Practice** — three warm-up questions. Hearts are safe here; a miss just teaches you something.
- **Quiz** — five scenario questions. Now the hearts count.
- **Results** — XP, score, best streak, percentage ring, per-module breakdown, and a full answer review.

## Game mechanics

| Mechanic | How it works |
| --- | --- |
| **XP** | 10 XP per correct answer |
| **Streak bonus** | +5 XP per streak level on top of that, capped at +20 |
| **Milestones** | 3-streak `+25`, 5-streak `+50`, halfway point `+15`, each with a small celebration |
| **Hearts** | 3 hearts, quiz round only. Running out pauses the lesson — you can refill and keep going |
| **Hints** | One per question. Dims two wrong options and drops the reward to 5 XP with no streak bonus |
| **Best run** | Highest XP is remembered in `localStorage`, on your device only |

A perfect run is worth **280 XP**.

Every answer — right or wrong — is explained before you move on, and nothing auto-advances.
A miss reveals the correct answer and explains the concept without any scolding.

## Keyboard

| Key | Action |
| --- | --- |
| `1`–`4` | Pick an answer |
| `H` | Take the hint |
| `Enter` / `Space` | Continue |

## Run it locally

```bash
git clone https://github.com/zhenyu92/product-thinking-quiz.git
cd product-thinking-quiz
python -m http.server 8000   # or: npx serve
```

Then open <http://localhost:8000>. Opening `index.html` directly works too.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Page shell — HUD container, app mount, footer |
| `content.js` | All content: module links, the four Learn cards, 18 questions with hints and explanations |
| `app.js` | Game engine, screens, XP/streak/hearts logic, and every illustration (inline SVG) |
| `styles.css` | The visual identity — design tokens, components, animations |

### Editing the questions

`content.js` is the only file you need. Each question is:

```js
{
  module: 4,                         // maps to MODULES for the "read more" link
  scenario: "...",                   // optional; questions with one are dealt into the Quiz round
  q: "Which of these is an outcome rather than an output?",
  options: ["...", "...", "...", "..."],
  answer: 2,                         // 0-based index into options
  hint: "Three of these describe what the team delivered.",
  why: "Downloads and shipped features are things you produced...",
}
```

There are 18 questions in the pool and 8 are dealt per run — 3 plain ones for Practice and
5 scenarios for the Quiz — spread across modules so no two picks repeat a module where
possible. Option order is shuffled every attempt, so answer position never gives anything away.

## Design notes

The visual identity is original: cream paper, violet ink, teal and sunshine accents, chunky
offset shadows, and **Beacon** — a lamp-headed mascot drawn as inline SVG with four moods
(happy, cheering, thinking, oops). The concept diagrams are hand-written SVG too, so the whole
thing ships without a single image file.

Motion is deliberately restrained: answer cards press down, correct answers pop, wrong answers
shake once, the feedback panel slides up, and XP floats. Everything respects
`prefers-reduced-motion`, which also disables confetti.

Accessibility: the progress bar is a real `role="progressbar"`, hearts and diagrams carry
labels, focus is moved to the primary action on every screen, focus rings are preserved, and
the whole lesson is playable from the keyboard.

## Credits and disclaimer

An **unofficial** study aid — not affiliated with or endorsed by any government agency.
Questions are adapted from the Institute of Digital Government's public
[Product Thinking](https://www.idg.gov.sg/product-thinking/) learning pathway (7 modules);
go there for the source material.

Not affiliated with Duolingo or any other learning app. No third-party branding, mascots or
artwork are used — every visual in this repo was drawn for it.

Code is MIT licensed (see [LICENSE](LICENSE)). The adapted question content belongs to its
original authors.
