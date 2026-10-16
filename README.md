# 와디프 · Wadif

A two-minute what-if story about everyday choices. Make one choice, see what happened — then see what would have happened if you had chosen the other way, on the same day, under the same conditions.

**[Play Wadif](https://ahnnajeon.github.io/wadif/)** · Story concept by Ahnna Jeon

## How the counterfactual works

Each episode has a hidden condition with two possible states — for example, "the presentation was moved 30 minutes earlier" or "the division head was eating at the same restaurant". When you choose, one state is drawn at random and stays fixed for the day.

Your ending and the other choice's ending are both written for that same state. So when you open "what if I had picked the other one?", only your choice changes; everything else about the day stays the same. This is the counterfactual idea from causal inference: hold the background fixed, change the action, and compare.

## What is in the prototype

- 14 hand-written everyday dilemmas (lunch menu, umbrella, a message from an old friend, a closing elevator door, a second-hand sale, …)
- One episode per local calendar day; the set rotates again after day 14
- Three short scenes, two choices, two hidden conditions → four endings per episode
- After your ending, the other choice's ending under the same hidden condition
- One follow-up question: "next time, which would you pick?"
- Anonymous choice data sent to a Google Sheet (optional, see below)
- A result saved in the same browser for the rest of the day
- No AI API calls or paid tokens

The daily limit is a gentle browser reminder. It does not work across devices or private browsing windows.

## Data

When `config.js` has an endpoint, the page sends two kinds of anonymous events to a Google Sheet through a small Apps Script web app (`apps-script/Code.gs`):

- `choice` — the story, the choice, the hidden condition that was drawn, and which option was shown first
- `next` — the answer to "next time, which would you pick?", asked after both endings

Each row also has the play date, a random browser ID (no name, email, or IP), the source (`?src=card` for the business-card QR, otherwise the referring site or `direct`), mobile/desktop, and whether a person or a browser agent made the choice. The left/right order of the two choices is random, so a lean toward one option can't come from button position.

The daily limit lives in the browser, so the same person can occasionally appear twice. For analysis, keep the first row per `uid` × `play_date` × `event`.

The hidden condition is drawn at random, which makes the `next` question a small randomized comparison. Next time the condition is unknown again, so today's draw shouldn't change the answer. If people who got the worse ending switch more often, that is outcome bias.

Read the sheet in R:

```r
library(googlesheets4)
d <- read_sheet("YOUR_SHEET_URL", sheet = "responses")
```

## Run locally

Open `index.html` in a browser. All game code is plain HTML, CSS, and JavaScript.

To check the story data, flow, counterfactual view, follow-up question, data events, and daily rule, run `node tests/flow.test.cjs`.

## Edit stories

`stories.js` holds every episode: `title`, `teaser`, three `beats`, a `question`, two `conditions` (the hidden states), and two `choices`. `choices[i].endings[k]` is what happens when the player picks choice `i` on a day when `conditions[k]` holds.

One rule keeps the endings believable: every detail an ending relies on (the white shirt, last night's ramen, the folding umbrella left at the office) should already appear in the teaser or the scenes. The hidden condition is the only thing the player could not have known.
