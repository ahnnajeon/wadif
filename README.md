# 와디프 · Wadif

A two-minute interactive what-if story. Open an unfamiliar parcel, make one choice, and see where it leads.

**[Play Wadif](https://ahnnajeon.github.io/wadif/)** · Story concept by Ahnna Jeon

The first episode begins in an apartment hallway and ends with an unexpected natural-hair wig. Act 2 is planned as a paid continuation; this prototype has no payment or account system.

## What is in the prototype

- One short episode per local calendar day
- Two choices and two possible endings for each choice
- A result saved in the same browser for the rest of the day
- 14 hand-written episodes; the set rotates again after day 14
- No AI API calls or paid tokens

The daily limit is a gentle browser reminder. It does not work across devices or private browsing windows.

## Run locally

Open `index.html` in a browser. All game code is plain HTML, CSS, and JavaScript.

To check the story flow and daily rule, run `node tests/flow.test.cjs`.

## Edit stories

`stories.js` contains the episode text. Each episode has a title, teaser, three short scenes, two choices, and two possible endings per choice.

The other 13 episodes still use the original fairy-tale voice and are drafts for further story work.
