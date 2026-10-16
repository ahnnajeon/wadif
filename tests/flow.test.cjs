const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const storySource = fs.readFileSync(path.join(root, "stories.js"), "utf8");
const stored = new Map();
const sent = [];

function makeSession(isoDate, search = "") {
  const elements = new Map();
  const registeredTools = new Map();
  const intervalCalls = [];

  class FakeElement {
    constructor(tag = "div") {
      this.tag = tag;
      this.textContent = "";
      this.className = "";
      this.children = [];
      this.style = { setProperty() {} };
      this.classList = { add() {}, remove() {} };
    }
    addEventListener(name, listener) {
      if (name === "click") this.onClick = listener;
    }
    replaceChildren(...children) {
      this.children = children;
    }
    click() {
      if (!this.onClick) throw new Error("Element is not clickable");
      return this.onClick();
    }
  }

  const document = {
    hidden: false,
    referrer: "",
    modelContext: {
      registerTool(tool) {
        registeredTools.set(tool.name, tool);
      }
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    createElement(tag) {
      return new FakeElement(tag);
    },
    addEventListener() {}
  };

  const realDate = Date;
  class FakeDate extends realDate {
    constructor(...args) {
      super(...(args.length ? args : [isoDate]));
    }
  }

  const context = {
    Date: FakeDate,
    document,
    location: { search, hostname: "ahnnajeon.github.io" },
    URL,
    URLSearchParams,
    fetch(url, options) {
      sent.push({ url, mode: options.mode, ...JSON.parse(options.body) });
      return Promise.resolve();
    },
    window: {
      WADIF_STORIES: [],
      WADIF_CONFIG: { endpoint: "https://collector.test/exec" },
      matchMedia: () => ({ matches: true }),
      addEventListener() {},
      setInterval(...args) { intervalCalls.push(args); }
    },
    localStorage: {
      getItem(key) { return stored.get(key) ?? null; },
      setItem(key, value) { stored.set(key, value); },
      removeItem(key) { stored.delete(key); }
    },
    setTimeout,
    clearTimeout,
    Math,
    Uint32Array,
    Promise
  };
  vm.createContext(context);
  vm.runInContext(storySource, context);
  vm.runInContext(source, context);
  return { elements, registeredTools, stories: context.window.WADIF_STORIES, intervalCalls };
}

const clickable = (el) => el.children.filter((child) => child.onClick);
function clickLabel(el, label) {
  const target = clickable(el).find((child) => child.textContent === label);
  if (!target) throw new Error(`No button labelled ${label}`);
  return target.click();
}

async function run() {
  const today = makeSession("2026-10-01T12:00:00", "?src=card");
  const get = (id) => today.elements.get(id);

  // Every episode has 3 beats, 2 hidden conditions, 2 choices x 2 endings.
  const ids = new Set();
  for (const s of today.stories) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.equal(s.beats.length, 3, s.id);
    assert.equal(s.conditions.length, 2, s.id);
    assert.equal(s.choices.length, 2, s.id);
    for (const c of s.choices) {
      assert.equal(c.endings.length, 2, s.id);
      for (const e of c.endings) assert.ok(e.title && e.text, s.id);
    }
  }

  const story = today.stories[0];
  assert.equal(get("title").textContent, story.title);
  get("actions").children[0].click();
  for (let index = 0; index < 3; index += 1) get("actions").children[0].click();

  // Choice screen: two identical-looking buttons, order shuffled.
  const choiceButtons = clickable(get("actions"));
  assert.equal(choiceButtons.length, 2);
  assert.ok(choiceButtons.every((b) => b.className === "choice-button"));
  assert.deepEqual(choiceButtons.map((b) => b.textContent).sort(), Array.from(story.choices, (c) => c.label).sort());
  const shownFirst = story.choices.findIndex((c) => c.label === choiceButtons[0].textContent);
  await clickLabel(get("actions"), story.choices[0].label);

  const result = JSON.parse(stored.get("wadif:v1:2026-10-01"));
  assert.equal(result.storyId, story.id);
  assert.equal(result.choiceIndex, 0);
  assert.equal(result.order[0], shownFirst);
  const k = result.endingIndex;
  assert.ok([0, 1].includes(k));

  // The choice is sent once, anonymously, with the shown order and source.
  assert.equal(sent.length, 1);
  assert.equal(sent[0].event, "choice");
  assert.equal(sent[0].mode, "no-cors");
  assert.equal(sent[0].story_id, story.id);
  assert.equal(sent[0].play_date, "2026-10-01");
  assert.equal(sent[0].choice, 0);
  assert.equal(sent[0].condition, k);
  assert.equal(sent[0].first_shown, shownFirst);
  assert.equal(sent[0].src, "card");
  assert.equal(sent[0].via, "ui");
  assert.ok(sent[0].uid);

  // Own ending first, with one button for the counterfactual.
  assert.equal(get("title").textContent, story.choices[0].endings[k].title);
  assert.equal(clickable(get("actions")).length, 1);
  get("actions").children[0].click();

  // Counterfactual: the other choice under the same hidden condition,
  // then the follow-up question (two choices + back link).
  assert.equal(get("title").textContent, story.choices[1].endings[k].title);
  assert.ok(get("quietNote").textContent.includes(story.conditions[k]));
  assert.equal(clickable(get("actions")).length, 3);
  clickLabel(get("actions"), story.choices[1].label);
  assert.equal(sent.length, 2);
  assert.equal(sent[1].event, "next");
  assert.equal(sent[1].choice, 0);
  assert.equal(sent[1].condition, k);
  assert.equal(sent[1].next_choice, 1);
  assert.equal(sent[1].uid, sent[0].uid);
  assert.equal(JSON.parse(stored.get("wadif:v1:2026-10-01")).next.choiceIndex, 1);
  assert.equal(clickable(get("actions")).length, 1); // only the back link remains
  clickLabel(get("actions"), "← 내 이야기로");
  assert.equal(get("title").textContent, story.choices[0].endings[k].title);
  const endingTitle = get("title").textContent;

  // Same day, reopened: same ending, question already answered, nothing re-sent.
  const reloaded = makeSession("2026-10-01T13:00:00");
  const r = (id) => reloaded.elements.get(id);
  assert.equal(r("title").textContent, endingTitle);
  r("actions").children[0].click();
  assert.equal(clickable(r("actions")).length, 1);
  assert.equal(sent.length, 2);

  // Next day: new story; agent tools still work and are labelled as agent.
  const tomorrow = makeSession("2026-10-02T12:00:00");
  const next = tomorrow.stories[1];
  assert.equal(tomorrow.elements.get("title").textContent, next.title);
  const tools = tomorrow.registeredTools;
  assert.equal(tools.size, 3);
  tools.get("start_today_wadif_story").execute({});
  for (let index = 0; index < 3; index += 1) tools.get("advance_today_wadif_scene").execute({});
  const toolResult = await tools.get("choose_today_wadif_path").execute({ choiceIndex: 1 });
  assert.equal(toolResult.status, "completed");
  const saved = JSON.parse(stored.get("wadif:v1:2026-10-02"));
  assert.equal(saved.choiceIndex, 1);
  assert.equal(toolResult.condition, next.conditions[saved.endingIndex]);
  assert.equal(toolResult.counterfactual.ending, next.choices[0].endings[saved.endingIndex].title);
  assert.equal(sent.at(-1).via, "agent");
  assert.equal(sent.at(-1).uid, sent[0].uid);
  assert.equal(sent.at(-1).src, "direct");
  assert.equal(tomorrow.intervalCalls.length, 1);
  // Preview links: any episode, forced condition, nothing saved or sent.
  const before = stored.get("wadif:v1:2026-10-01");
  const sentBefore = sent.length;
  const pv = makeSession("2026-10-01T15:00:00", "?preview=1&ep=5&k=1");
  const p = (id) => pv.elements.get(id);
  const pvStory = pv.stories[4];
  assert.equal(p("title").textContent, pvStory.title);
  assert.match(p("dayTag").textContent, /미리보기/);
  p("actions").children[0].click();
  for (let index = 0; index < 3; index += 1) p("actions").children[0].click();
  await clickLabel(p("actions"), pvStory.choices[1].label);
  assert.equal(p("title").textContent, pvStory.choices[1].endings[1].title);
  assert.equal(stored.get("wadif:v1:2026-10-01"), before);
  assert.equal(sent.length, sentBefore);

  console.log(`${today.stories.length} episodes, shuffled choices, counterfactual view, follow-up question, data events, daily limit, next-day story, agent controls, and preview links passed.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
