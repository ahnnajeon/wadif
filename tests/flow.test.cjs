const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const storySource = fs.readFileSync(path.join(root, "stories.js"), "utf8");
const seasonSource = fs.readFileSync(path.join(root, "seasons.js"), "utf8");
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
  vm.runInContext(seasonSource, context);
  vm.runInContext(source, context);
  return {
    get: (id) => elements.get(id),
    registeredTools,
    groups: context.window.WADIF_AGE_GROUPS,
    library: context.window.WADIF_STORIES,
    seasons: context.window.WADIF_SEASONS,
    intervalCalls
  };
}

const clickable = (el) => el.children.filter((child) => child.onClick);
const labels = (el) => clickable(el).map((child) => child.textContent);
function clickLabel(el, label) {
  const target = clickable(el).find((child) => child.textContent === label);
  if (!target) throw new Error(`No button labelled ${label}; have ${labels(el).join(", ")}`);
  return target.click();
}

async function run() {
  const s = makeSession("2026-10-01T12:00:00", "?src=card");
  const { get, groups, library } = s;

  // Every age group has episodes; every episode has a setup, a question,
  // 2 hidden conditions and 2 choices x 2 endings; ids are unique.
  assert.deepEqual(Array.from(groups, (g) => g.label), ["10대", "20대", "30대", "40대", "50대 이상"]);
  const ids = new Set();
  for (const group of groups) {
    const list = library[group.id];
    assert.ok(Array.isArray(list) && list.length > 0, group.id);
    for (const st of list) {
      assert.ok(!ids.has(st.id), `duplicate id ${st.id}`);
      ids.add(st.id);
      assert.ok(st.title && st.setup && st.question, st.id);
      assert.equal(st.conditions.length, 2, st.id);
      assert.equal(st.choices.length, 2, st.id);
      for (const c of st.choices) {
        assert.ok(c.label, st.id);
        assert.equal(c.endings.length, 2, st.id);
        for (const e of c.endings) assert.ok(e.title && e.text, st.id);
      }
    }
  }

  // First visit: the age question.
  assert.equal(get("title").textContent, "당신의 연령대는?");
  assert.deepEqual(labels(get("actions")), ["10대", "20대", "30대", "40대", "50대 이상"]);

  // Pick 20대 → today's 20대 story on one screen: question, two choices, change-age link.
  clickLabel(get("actions"), "20대");
  assert.equal(stored.get("wadif:age"), "20s");
  const story = library["20s"][0];
  assert.equal(get("title").textContent, story.title);
  assert.equal(get("storyText").textContent, story.setup);
  assert.equal(get("actions").children[0].textContent, story.question);
  const choiceButtons = clickable(get("actions")).filter((b) => b.className === "choice-button");
  assert.equal(choiceButtons.length, 2);
  assert.deepEqual(choiceButtons.map((b) => b.textContent).sort(), Array.from(story.choices, (c) => c.label).sort());
  const shownFirst = story.choices.findIndex((c) => c.label === choiceButtons[0].textContent);

  // Changing age before choosing goes back to the question, then forward again.
  clickLabel(get("actions"), "연령대 바꾸기");
  assert.equal(get("title").textContent, "당신의 연령대는?");
  clickLabel(get("actions"), "20대");
  assert.equal(get("title").textContent, story.title);
  const firstAgain = story.choices.findIndex((c) => c.label === clickable(get("actions"))[0].textContent);

  await clickLabel(get("actions"), story.choices[0].label);
  const result = JSON.parse(stored.get("wadif:v2:2026-10-01"));
  assert.equal(result.storyId, story.id);
  assert.equal(result.age, "20s");
  assert.equal(result.choiceIndex, 0);
  assert.equal(result.order[0], firstAgain);
  const k = result.endingIndex;
  assert.ok([0, 1].includes(k));
  assert.ok([0, 1].includes(shownFirst));

  // The choice is sent once, anonymously, with age, shown order and source.
  assert.equal(sent.length, 1);
  assert.equal(sent[0].event, "choice");
  assert.equal(sent[0].mode, "no-cors");
  assert.equal(sent[0].age, "20s");
  assert.equal(sent[0].story_id, story.id);
  assert.equal(sent[0].play_date, "2026-10-01");
  assert.equal(sent[0].choice, 0);
  assert.equal(sent[0].condition, k);
  assert.equal(sent[0].first_shown, firstAgain);
  assert.equal(sent[0].src, "card");
  assert.equal(sent[0].via, "ui");
  assert.ok(sent[0].uid);

  // Own ending, then the counterfactual under the same hidden condition.
  assert.equal(get("title").textContent, story.choices[0].endings[k].title);
  assert.equal(clickable(get("actions")).length, 1);
  get("actions").children[0].click();
  assert.equal(get("title").textContent, story.choices[1].endings[k].title);
  assert.ok(get("quietNote").textContent.includes(story.conditions[k]));
  assert.equal(clickable(get("actions")).length, 3);
  clickLabel(get("actions"), story.choices[1].label);
  assert.equal(sent.length, 2);
  assert.equal(sent[1].event, "next");
  assert.equal(sent[1].age, "20s");
  assert.equal(sent[1].condition, k);
  assert.equal(sent[1].next_choice, 1);
  assert.equal(sent[1].uid, sent[0].uid);
  assert.equal(JSON.parse(stored.get("wadif:v2:2026-10-01")).next.choiceIndex, 1);
  assert.equal(clickable(get("actions")).length, 1);
  clickLabel(get("actions"), "← 내 이야기로");
  const endingTitle = get("title").textContent;
  assert.equal(endingTitle, story.choices[0].endings[k].title);

  // Same day, reopened: same ending, no age question, nothing re-sent.
  const reloaded = makeSession("2026-10-01T13:00:00");
  assert.equal(reloaded.get("title").textContent, endingTitle);
  reloaded.get("actions").children[0].click();
  assert.equal(clickable(reloaded.get("actions")).length, 1);
  assert.equal(sent.length, 2);

  // Next day: remembered age, next 20대 story; agent tools work and are labelled.
  const tomorrow = makeSession("2026-10-02T12:00:00");
  const next = library["20s"][1];
  assert.equal(tomorrow.get("title").textContent, next.title);
  const tools = tomorrow.registeredTools;
  assert.equal(tools.size, 3);
  const summary = tools.get("read_today_wadif_story").execute({});
  assert.equal(summary.title, next.title);
  assert.equal(summary.ageGroup, "20s");
  const switched = tools.get("set_wadif_age_group").execute({ ageGroup: "50s" });
  assert.equal(switched.title, library["50s"][mod(1, library["50s"].length)].title);
  const toolResult = await tools.get("choose_today_wadif_path").execute({ choiceIndex: 1 });
  assert.equal(toolResult.status, "completed");
  assert.equal(toolResult.ageGroup, "50s");
  const saved = JSON.parse(stored.get("wadif:v2:2026-10-02"));
  assert.equal(saved.choiceIndex, 1);
  assert.equal(saved.age, "50s");
  const st50 = library["50s"][mod(1, library["50s"].length)];
  assert.equal(toolResult.condition, st50.conditions[saved.endingIndex]);
  assert.equal(toolResult.counterfactual.ending, st50.choices[0].endings[saved.endingIndex].title);
  assert.equal(sent.at(-1).via, "agent");
  assert.equal(sent.at(-1).age, "50s");
  assert.equal(sent.at(-1).src, "direct");
  assert.equal(tomorrow.intervalCalls.length, 1);
  assert.throws(() => tools.get("set_wadif_age_group").execute({ ageGroup: "10s" }));

  // Rotation wraps within the age group.
  const later = makeSession(`2026-10-${String(1 + library["50s"].length * 2).padStart(2, "0")}T12:00:00`);
  assert.equal(later.get("title").textContent, library["50s"][0].title);

  // Preview links: any age and episode, forced condition, nothing saved or sent.
  const storedBefore = new Map(stored);
  const sentBefore = sent.length;
  const pv = makeSession("2026-10-01T15:00:00", "?preview=1&age=40s&ep=3&k=1");
  const pvStory = library["40s"][2];
  assert.equal(pv.get("title").textContent, pvStory.title);
  assert.match(pv.get("dayTag").textContent, /미리보기/);
  await clickLabel(pv.get("actions"), pvStory.choices[1].label);
  assert.equal(pv.get("title").textContent, pvStory.choices[1].endings[1].title);
  assert.deepEqual([...stored.entries()], [...storedBefore.entries()]);
  assert.equal(sent.length, sentBefore);

  await seasonFlow(library, s.seasons);

  const total = groups.reduce((n, g) => n + library[g.id].length, 0);
  console.log(`${total} episodes in ${groups.length} age groups; age question, one-screen choice, counterfactual, follow-up question, data events with age, daily limit, rotation, agent tools and preview links passed.`);
}

// The 40대 season: five episodes by progress (not date), each opened by a bridge
// from yesterday's ending, then the finale on the next visit, then the singles.
async function seasonFlow(library, seasons) {
  const season = seasons["40s"][0];
  const ids = new Set(Object.values(library).flat().map((st) => st.id));
  assert.equal(season.episodes.length, 5);
  for (const [i, ep] of season.episodes.entries()) {
    assert.ok(!ids.has(ep.id), `duplicate id ${ep.id}`);
    ids.add(ep.id);
    assert.ok(ep.day && ep.title && ep.setup && ep.question, ep.id);
    assert.equal(ep.conditions.length, 2, ep.id);
    assert.deepEqual(Array.from(ep.choices, (c) => c.side).sort(), [0, 1], ep.id);
    for (const c of ep.choices) {
      assert.ok(c.label && c.short, ep.id);
      assert.equal(c.endings.length, 2, ep.id);
      for (const e of c.endings) assert.ok(e.title && e.text, ep.id);
    }
    if (i > 0) {
      assert.equal(ep.bridges.length, 2, ep.id);
      for (const row of ep.bridges) assert.ok(row.length === 2 && row.every(Boolean), ep.id);
    }
  }
  const mins = Array.from(season.finale.endings, (e) => e.min);
  assert.deepEqual(mins, [...mins].sort((a, b) => b - a));
  assert.equal(mins.at(-1), 0);

  stored.clear();
  const path = [0, 1, 0, 1, 0]; // every pick on side 0 (가족 쪽)
  const days = ["2026-11-02", "2026-11-03", "2026-11-05", "2026-11-06", "2026-11-07"]; // 11-04 skipped
  const picks = [];
  for (const [i, day] of days.entries()) {
    const ep = season.episodes[i];
    const session = makeSession(`${day}T09:00:00`);
    if (i === 0) {
      assert.equal(session.get("title").textContent, "당신의 연령대는?");
      clickLabel(session.get("actions"), "40대");
    }
    assert.equal(session.get("title").textContent, ep.title, `day ${i + 1}`);
    assert.match(session.get("dayTag").textContent, new RegExp(`시즌 1 · ${i + 1} / 5`));
    assert.equal(session.get("eyebrow").textContent, `${season.title} · ${ep.day}요일`);
    const opening = i === 0 ? season.intro : ep.bridges[picks[i - 1].choice][picks[i - 1].k];
    assert.equal(session.get("storyText").textContent, `${opening}\n\n${ep.setup}`);

    const before = sent.length;
    await clickLabel(session.get("actions"), ep.choices[path[i]].label);
    const state = JSON.parse(stored.get("wadif:season:40s-s1"));
    assert.equal(state.picks.length, i + 1);
    const k = state.picks[i].k;
    picks.push({ choice: path[i], k });
    assert.equal(session.get("title").textContent, ep.choices[path[i]].endings[k].title);

    const event = sent[before];
    assert.equal(sent.length, before + 1);
    assert.equal(event.story_id, ep.id);
    assert.equal(event.season, "40s-s1");
    assert.equal(event.episode, i + 1);
    assert.equal(event.prev_choice, i === 0 ? undefined : picks[i - 1].choice);
    assert.equal(event.prev_condition, i === 0 ? undefined : picks[i - 1].k);
    assert.equal(event.side_count, i === 4 ? 5 : undefined);

    // Counterfactual and follow-up question still work, and say what comes tomorrow.
    session.get("actions").children[0].click();
    assert.equal(session.get("title").textContent, ep.choices[1 - path[i]].endings[k].title);
    clickLabel(session.get("actions"), ep.choices[path[i]].label);
    assert.equal(sent.at(-1).event, "next");
    assert.equal(sent.at(-1).episode, i + 1);
    const hint = session.get("actions").children[1].textContent;
    assert.ok(hint.includes(i === 4 ? "결산" : `${season.episodes[i + 1].day}요일`), hint);

    // Reopened the same day: today's ending, not the next episode.
    const again = makeSession(`${day}T21:00:00`);
    assert.equal(again.get("title").textContent, ep.choices[path[i]].endings[k].title);
  }

  // Next visit: the finale, with the week's path and the 4~5 ending.
  const sentBefore = sent.length;
  const fin = makeSession("2026-11-09T08:00:00");
  const best = season.finale.endings[0];
  assert.equal(fin.get("title").textContent, best.title);
  assert.match(fin.get("dayTag").textContent, /시즌 1 · 결산/);
  assert.equal(fin.get("eyebrow").textContent, "이번 주 결산 · 가족 쪽 5번");
  const lines = fin.get("storyText").textContent.split("\n");
  assert.equal(lines[0], `월 · ${season.episodes[0].choices[0].short} · ${season.episodes[0].choices[0].endings[picks[0].k].title}`);
  assert.equal(lines[4].startsWith("금 · "), true);
  assert.ok(fin.get("storyText").textContent.endsWith(best.text));
  clickLabel(fin.get("actions"), "모든 날 반대로 골랐다면? ↗");
  const worst = season.finale.endings.at(-1);
  assert.equal(fin.get("title").textContent, worst.title);
  assert.ok(fin.get("storyText").textContent.startsWith(`월 · ${season.episodes[0].choices[1].short} · `));
  assert.ok(!fin.get("storyText").textContent.includes(season.finale.same));
  clickLabel(fin.get("actions"), "← 내 결산으로");
  assert.equal(fin.get("title").textContent, best.title);
  await assert.rejects(() => fin.registeredTools.get("choose_today_wadif_path").execute({ choiceIndex: 0 }));
  assert.equal(fin.registeredTools.get("read_today_wadif_story").execute({}).status, "finale");

  // Same day again: still the finale. Nothing was sent for it.
  assert.equal(makeSession("2026-11-09T20:00:00").get("title").textContent, best.title);
  assert.equal(sent.length, sentBefore);

  // The day after the finale: the 40대 singles, by date rotation.
  const ordinal = Math.round((Date.UTC(2026, 10, 10) - Date.UTC(2026, 9, 1)) / 86400000);
  const after = makeSession("2026-11-10T12:00:00");
  assert.equal(after.get("title").textContent, library["40s"][mod(ordinal, library["40s"].length)].title);
  assert.match(after.get("dayTag").textContent, /^40대 · \d \/ 3$/);

  // Preview of a season episode with a chosen yesterday, and of a finale.
  const storedBefore = new Map(stored);
  const sentAt = sent.length;
  const pv = makeSession("2026-11-10T13:00:00", "?preview=1&age=40s&s=3&prev=B2&k=1");
  const ep3 = season.episodes[2];
  assert.equal(pv.get("storyText").textContent, `${ep3.bridges[1][1]}\n\n${ep3.setup}`);
  await clickLabel(pv.get("actions"), ep3.choices[0].label);
  assert.equal(pv.get("title").textContent, ep3.choices[0].endings[1].title);
  const pf = makeSession("2026-11-10T13:00:00", "?preview=1&age=40s&s=finale&path=A1A2A1A2A1");
  const middle = season.finale.endings.find((e) => e.min === 2);
  assert.equal(pf.get("title").textContent, middle.title); // A on every day: 3 on 가족 쪽
  assert.equal(pf.get("storyText").textContent.split("\n")[1], `화 · ${season.episodes[1].choices[0].short} · ${season.episodes[1].choices[0].endings[1].title}`);
  clickLabel(pf.get("actions"), "모든 날 반대로 골랐다면? ↗");
  assert.equal(pf.get("title").textContent, middle.title); // flipped: 2, the same ending
  assert.ok(pf.get("storyText").textContent.endsWith(season.finale.same));
  assert.deepEqual([...stored.entries()], [...storedBefore.entries()]);
  assert.equal(sent.length, sentAt);

  console.log("40대 season: 5 episodes by progress with bridges, season data fields, finale on the next visit with the all-opposite week, then singles; season previews passed.");
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
