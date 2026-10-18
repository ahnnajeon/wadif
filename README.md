# 와디프 · Wadif

A one-minute what-if about everyday choices. Pick your age group, make one choice, see what happened — then see what would have happened if you had chosen the other way, on the same day, under the same conditions.

**[Play Wadif](https://ahnnajeon.github.io/wadif/)** · Story concept by Ahnna Jeon

## How it works

1. The first visit asks for an age group (10대, 20대, 30대, 40대, 50대 이상). The browser remembers it; "연령대 바꾸기" changes it before today's choice.
2. One screen shows today's situation for that age group, the question and two choices. Each age group gets one episode per day and rotates through its own set.
3. After the choice, your ending appears, then the other choice's ending under the same hidden condition, then one follow-up question: "next time, which would you pick?"

## How the counterfactual works

Each episode has a hidden condition with two possible states — for example, "the boss's message was a promotion" or "it was a 7 a.m. emergency meeting". When you choose, one state is drawn at random and stays fixed for the day.

Your ending and the other choice's ending are both written for that same state. So when you open "what if I had picked the other one?", only your choice changes; everything else about the day stays the same. This is the counterfactual idea from causal inference: hold the background fixed, change the action, and compare.

## Data

When `config.js` has an endpoint, the page sends two kinds of anonymous events to a Google Sheet through a small Apps Script web app (`apps-script/Code.gs`):

- `choice` — age group, story, choice, the hidden condition that was drawn, and which option was shown first
- `next` — the answer to "next time, which would you pick?", asked after both endings

Each row also has the play date, a random browser ID (no name, email, or IP), the source (`?src=card` for the business-card QR, otherwise the referring site or `direct`), mobile/desktop, and whether a person or a browser agent made the choice. The left/right order of the two choices is random, so a lean toward one option can't come from button position.

The collector writes columns by the sheet's header row and adds a column for any new field it receives, so a new field on the page needs no new deployment.

The daily limit lives in the browser, so the same person can occasionally appear twice. For analysis, keep the first row per `uid` × `play_date` × `event`.

The hidden condition is drawn at random, which makes the `next` question a small randomized comparison. Next time the condition is unknown again, so today's draw shouldn't change the answer. If people who got the worse ending switch more often, that is outcome bias.

Read the sheet in R:

```r
library(googlesheets4)
d <- read_sheet("YOUR_SHEET_URL", sheet = "responses")
```

## Preview any episode

`?preview=1&age=20s&ep=2&k=0` opens episode 2 of the 20대 set with hidden condition 0, without the daily limit, and saves or sends nothing. `age` is `10s`, `20s`, `30s`, `40s` or `50s`; `ep` and `k` are optional.

## Run locally

Open `index.html` in a browser. All game code is plain HTML, CSS, and JavaScript.

To check the story data, flow, counterfactual view, follow-up question, data events, and daily rule, run `node tests/flow.test.cjs`.

## Edit stories

`stories.js` holds every episode, grouped by age group: `title`, `setup`, `question`, two `conditions` (the hidden states), and two `choices`. `choices[i].endings[k]` is what happens when the player picks choice `i` on a day when `conditions[k]` holds.

One rule keeps the endings believable: every detail an ending relies on should already appear in the setup. The hidden condition is the only thing the player could not have known.
