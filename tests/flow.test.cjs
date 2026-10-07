const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const storySource = fs.readFileSync(path.join(root, "stories.js"), "utf8");
const stored = new Map();

function makeSession(isoDate) {
  const elements = new Map();
  const registeredTools = new Map();
  const intervalCalls = [];

  class FakeElement {
    constructor() {
      this.textContent = "";
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
    modelContext: {
      registerTool(tool) {
        registeredTools.set(tool.name, tool);
      }
    },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new FakeElement());
      return elements.get(id);
    },
    createElement() {
      return new FakeElement();
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
    window: {
      WADIF_STORIES: [],
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

async function run() {
  const today = makeSession("2026-10-01T12:00:00");
  const get = (id) => today.elements.get(id);
  assert.equal(get("title").textContent, today.stories[0].title);
  assert.equal(get("actions").children.length, 1);
  get("actions").children[0].click();
  for (let index = 0; index < 3; index += 1) get("actions").children[0].click();
  assert.equal(get("actions").children.length, 2);
  await get("actions").children[0].click();
  assert.equal(get("actions").children.length, 0);
  const result = JSON.parse(stored.get("wadif:v1:2026-10-01"));
  assert.equal(result.storyId, today.stories[0].id);
  assert.equal(result.choiceIndex, 0);
  assert.ok([0, 1].includes(result.endingIndex));
  const endingTitle = get("title").textContent;
  assert.match(get("quietNote").textContent, /유료 공개 예정/);

  const reloaded = makeSession("2026-10-01T13:00:00");
  assert.equal(reloaded.elements.get("title").textContent, endingTitle);
  assert.equal(reloaded.elements.get("actions").children.length, 0);

  const tomorrow = makeSession("2026-10-02T12:00:00");
  assert.equal(tomorrow.elements.get("title").textContent, tomorrow.stories[1].title);
  assert.equal(tomorrow.elements.get("actions").children.length, 1);
  const tools = tomorrow.registeredTools;
  assert.equal(tools.size, 3);
  tools.get("start_today_wadif_story").execute({});
  for (let index = 0; index < 3; index += 1) tools.get("advance_today_wadif_scene").execute({});
  const toolResult = await tools.get("choose_today_wadif_path").execute({ choiceIndex: 1 });
  assert.equal(toolResult.status, "completed");
  assert.equal(JSON.parse(stored.get("wadif:v1:2026-10-02")).choiceIndex, 1);
  assert.equal(tomorrow.intervalCalls.length, 1);
  console.log("Story flow, daily limit, next-day story, and agent controls passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
