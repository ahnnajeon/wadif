# 와디프 · Wadif

A one-minute what-if about everyday choices. Pick your age group, make one choice, see what happened — then see what would have happened if you had chosen the other way, on the same day, under the same conditions.

**[Play Wadif](https://ahnnajeon.github.io/wadif/)** · Story concept by Ahnna Jeon

## How it works

1. The first visit asks for an age group (10대, 20대, 30대, 40대, 50대, 60대, 70대 이상) or **연령 선택 안 함**. The browser remembers it; "연령대 바꾸기" changes it before today's choice.
2. One screen shows today's situation for that age group, the question and two choices. One episode a day.
3. After the choice, your ending appears, then the other choice's ending under the same hidden condition, then one follow-up question: "next time, which would you pick?"

## Seasons

Every age group has a season (`seasons.js`): five episodes, Monday to Friday, then a weekend finale. A season plays before that age group's single episodes, which rotate by date once the season is done.

- **Progress, not dates.** The browser remembers how far the player has come (`wadif:season:<id>`). A missed day doesn't skip an episode.
- **Bridges.** Episodes 2–5 open with a sentence that depends on yesterday's ending: yesterday's choice (A/B) × yesterday's hidden condition (①/②). Episode 1 opens with the season intro.
- **Finale.** On the visit after episode 5, the finale lists the week as walked. The revised 40대 and new 60대/70대 seasons close with specific scenes selected by the choices and conditions on those days. They do not rate the player as a parent, colleague or student. Older seasons still use their original side-count endings. "모든 날 반대로 골랐다면" flips all five choices and keeps all five hidden conditions within the authored story.

### 40대: more than one life

New players start with **금요일 3시** (season 1, version 3): a school administrator with a spouse and child. Every day pulls on the same Friday, when the school steering committee and the child's school performance overlap: a forgotten recorder, briefing the colleague who could stand in, a promise at dinner, a leak near the meeting room, and the 2:50 decision.

Next comes **첫 학기** (season 2, version 2): a 42-year-old employee in their first semester of evening graduate school. Every day pulls on the same midnight upload: who merges the file, an AI draft with a reference that may not exist, a team dinner, cutting 18 pages to 15, and the last 20 minutes.

These are fictional roles, not assumptions about the player's household. Preview links select a season by its `number`, not its position in the array.

Story rules for every season (10 Nov 2026 rewrite): one rope per week, so each weekday pulls on Friday; the hidden condition decides the outcome of both choices and the protagonist cannot know it when choosing; an ending's last line comes from what happened that day.

Earlier versions (`40s-s1`, `40s-s1-v2`, `40s-s2`, `60s-s1`, `70s-s1`) are retained in `WADIF_SEASON_ARCHIVE`. A player who started one finishes it with unchanged text; a player who lived any version a season `replaces` moves on instead of replaying the same week. Saved results and progress are never relabelled as new text.

### 60대 / 70대 이상 and optional age

- **첫 공연 (60대):** 64-year-old retired sales director Park Sunwoo plays bass in a neighbourhood band's first café performance. The poster blurb, a paid consulting call, a hard bass break, an old colleague and an encore all lead to Friday night.
- **다음 약속 (70대 이상):** a 73-year-old who lost their spouse six years ago meets Yunseo from a photography group for coffee on Friday. Choosing the café, an unanswered photo, telling their daughter, a proposed walk, and whether to ask for a next meeting.
- Two additional standalone stories per new group include a divorced 71-year-old who prefers separate homes. These protagonists do not describe every player of that age.
- **연령 선택 안 함** records no inferred participant age. It continues the current fictional age's unfinished seasons, then moves to another age. Once all seasons are complete, standalone age groups rotate by date. Existing progress is shared with explicit age selection.
- New events use `age: "unspecified"` for a skipped age; `story_age` always identifies the fictional protagonist's group. `age_schema_version: 2` identifies the new categories. Old `50s` rows without this version (or version 1) mean **50+**, not 50–59. Do not combine them as the same age category.
- An old saved 50+ preference requires a new selection on the next unplayed day; existing daily outcomes and pending follow-up events retain their original age interpretation.
- Preview a new season with `?preview=1&age=60s&s=1`, or skipped age with `?preview=1&age=unspecified&story_age=70s&s=1`. Previews never store progress or send collector events.

## How the counterfactual works

Each episode has a hidden condition with two possible states — for example, "the boss's message was a promotion" or "it was a 7 a.m. emergency meeting". When you choose, one state is drawn at random and stays fixed for the day.

Your ending and the other choice's ending are both written for that same state. So when you open "what if I had picked the other one?", only your choice changes; everything else about the day stays the same. This is the counterfactual idea from causal inference: hold the background fixed, change the action, and compare.

## Data

When `config.js` has an endpoint, the page sends two kinds of anonymous events to a Google Sheet through a small Apps Script web app (`apps-script/Code.gs`):

- `choice` — age group, story, choice, the hidden condition that was drawn, and which option was shown first
- `next` — the answer to "next time, which would you pick?", asked after both endings

Season episodes add `season` and `episode` to both events. All new events also include `story_version` (default 1 for original content); the revised parenting season has version 2 and new story IDs. Pre-update rows lack this field and represent original content. The `choice` event also has yesterday's choice and hidden condition (`prev_choice`, `prev_condition`). Episode 5 adds `side_count` only for legacy count-based finales. The revised 40대 finales do not compute a side score. Keep season/story IDs and version when comparing responses.

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

`?preview=1&age=20s&ep=2&k=0` opens single episode 2 of the 20대 set with hidden condition 0, without the daily limit, and saves or sends nothing. `age` is `10s`, `20s`, `30s`, `40s` or `50s`; `ep` and `k` are optional.

Seasons:

- `?preview=1&age=40s&s=3&prev=B2&k=0` opens season episode 3 as if yesterday's ending was B②.
- `?preview=1&age=40s&s=finale&path=A1B2B1A2A1` opens the finale for that week (choice and hidden condition for each day).
- Add `&season=2` for **첫 학기**; `&season=1` selects the revised **금요일 3시**. Numbers remain stable even when presentation order changes.

## Run locally

Open `index.html` in a browser. All game code is plain HTML, CSS, and JavaScript.

To check the story data, flow, counterfactual view, follow-up question, data events, daily rule, and the season flow, run `node tests/flow.test.cjs`.

## Edit stories

`stories.js` holds every episode, grouped by age group: `title`, `setup`, `question`, two `conditions` (the hidden states), and two `choices`. `choices[i].endings[k]` is what happens when the player picks choice `i` on a day when `conditions[k]` holds.

`seasons.js` holds the seasons. An episode there also has `day`, `bridges[c][k]` (the opening when yesterday's choice was `c` under condition `k`), and for each choice a `short` label. Legacy seasons additionally have hidden `side` values and pick `finale.endings` by the count of side-0 choices.

Narrative finales instead have `title`, `scenes` and `closing`. Each scene specifies a zero-based `episode` index and `texts[choice][condition]`. The opposite-week view reverses choices but reuses the original conditions, including for the closing scenes. Do not introduce new random outcomes or imply that a tally measures affection, goodness or success.

One rule keeps the endings believable: every detail an ending relies on should already appear in the setup. The hidden condition is the only thing the player could not have known.

### 문체와 이야기 기준

- 짧고 구체적으로 쓴다. 문서, 대화, 시간과 비용으로 상황을 보여 준다.
- 블랙코미디는 조직의 말과 실제 작동 방식 사이에서 나온다. 인물의 나이, 혼인 여부, 디지털 숙련도를 웃음의 이유로 삼지 않는다.
- 한 문장마다 격언을 붙이지 않는다. 자조와 냉소를 쓰되, 결말에서 플레이어를 훈계하거나 성격을 판정하지 않는다.
- 미혼, 비혼, 자녀 없는 부부, 부모 등 여러 삶을 다룰 수 있다. 한 시즌 안에서는 같은 인물과 배경을 유지한다.
- AI 등 현재의 생활 요소는 실제 갈등에 영향을 줄 때 쓴다. 이름만 최신 기술로 바꾸지 않는다.
- 두 선택 모두 상황에서 가능한 행동이어야 한다. 같은 숨은 조건에서 인물, 일정, 정보와 물리적 제약을 유지하며 대안 결과를 쓴다.
- 새 버전은 기존 선택 기록의 의미를 바꾸지 않도록 별도 ID와 버전으로 관리한다.

