(() => {
  "use strict";

  const stories = window.WADIF_STORIES;
  if (!Array.isArray(stories) || stories.length === 0) return;

  const $ = (id) => document.getElementById(id);
  const dayTag = $("dayTag");
  const eyebrow = $("eyebrow");
  const title = $("title");
  const storyText = $("storyText");
  const actions = $("actions");
  const quietNote = $("quietNote");
  const scene = $("scene");
  const worldSymbol = $("worldSymbol");

  const colors = [
    ["✉", "#c9f1d9", "#a6e7ca70"],
    ["◇", "#f2d4a6", "#ffc58c70"],
    ["▣", "#d9cbf3", "#bdb4e570"],
    ["◌", "#bee6e5", "#8ed8dd70"],
    ["✿", "#f1d7aa", "#efc69b70"],
    ["◫", "#e8cbcc", "#dfabb370"],
    ["☁", "#d7e9f7", "#afd8f270"],
    ["⌁", "#d3e9d7", "#b8d9bb70"],
    ["◇", "#f4ddb8", "#f5c89770"],
    ["∿", "#cadbec", "#96c6ea70"],
    ["◯", "#eee2c4", "#e8c88870"],
    ["☼", "#f2dcc0", "#f4b98570"],
    ["≋", "#bfe8e6", "#a3dad770"],
    ["✎", "#e6dbf4", "#c3afe470"]
  ];

  const launchDate = Date.UTC(2026, 9, 1);
  const dayMs = 86400000;
  let dateKey = "";
  let story = null;
  let episodeIndex = 0;
  let stage = "intro";
  let beatIndex = 0;
  let storageWorks = true;
  let revealTimer = null;
  let memoryResult = null;
  let memoryDateKey = "";

  function localDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return {
      key: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      ordinal: Math.round((Date.UTC(year, month - 1, day) - launchDate) / dayMs)
    };
  }

  function storageKey() {
    return `wadif:v1:${dateKey}`;
  }

  function readResult() {
    if (memoryDateKey === dateKey && memoryResult) return memoryResult;
    if (!storageWorks) return null;
    try {
      const value = localStorage.getItem(storageKey());
      if (!value) return null;
      const data = JSON.parse(value);
      if (
        data.storyId !== story.id ||
        !Number.isInteger(data.choiceIndex) ||
        !Number.isInteger(data.endingIndex) ||
        !story.choices[data.choiceIndex]?.endings[data.endingIndex]
      ) return null;
      memoryResult = data;
      memoryDateKey = dateKey;
      return data;
    } catch {
      storageWorks = false;
      return null;
    }
  }

  function saveResult(data) {
    memoryResult = data;
    memoryDateKey = dateKey;
    if (!storageWorks) return;
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch {
      storageWorks = false;
    }
  }

  function randomIndex(length) {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      globalThis.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function button(label, className, onClick) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }

  function setActions(...buttons) {
    actions.replaceChildren(...buttons);
  }

  function setScene(mode) {
    scene.classList.remove("is-moving", "to-left", "to-right", "is-reveal");
    if (mode) scene.classList.add(mode);
  }

  function setStoryForToday() {
    const today = localDate();
    dateKey = today.key;
    episodeIndex = ((today.ordinal % stories.length) + stories.length) % stories.length;
    story = stories[episodeIndex];
    if (story.id === "unmarked-parcel") scene.classList.add("is-parcel");
    else scene.classList.remove("is-parcel");
    const [symbol, ink, glow] = colors[episodeIndex % colors.length];
    worldSymbol.textContent = symbol;
    scene.style.setProperty("--scene-symbol", ink);
    scene.style.setProperty("--scene-glow", glow);
    dayTag.textContent = `오늘의 이야기 · ${String(episodeIndex + 1).padStart(2, "0")} / ${stories.length}`;
  }

  function renderIntro() {
    stage = "intro";
    setScene("");
    quietNote.classList.remove("is-act-two");
    eyebrow.textContent = "A tiny what-if, once a day";
    title.textContent = story.title;
    storyText.textContent = story.teaser;
    setActions(button("오늘의 모험 시작하기 ↗", "primary-button", startStory));
    quietNote.textContent = storageWorks
      ? "약 2분 · 선택은 이 브라우저에서 하루에 한 번"
      : "브라우저 저장 기능이 꺼져 있어 하루 제한이 유지되지 않을 수 있어요";
  }

  function startStory() {
    const previous = readResult();
    if (previous) {
      renderEnding(previous);
      return;
    }
    stage = "beat";
    beatIndex = 0;
    setScene("is-moving");
    renderBeat();
  }

  function renderBeat() {
    stage = "beat";
    quietNote.classList.remove("is-act-two");
    eyebrow.textContent = `오늘의 장면 · ${beatIndex + 1} / ${story.beats.length}`;
    title.textContent = story.title;
    storyText.textContent = story.beats[beatIndex];
    const last = beatIndex === story.beats.length - 1;
    setActions(button(last ? "선택의 순간으로 →" : "다음 장면 →", "primary-button", advanceBeat));
    quietNote.textContent = "서두르지 않아도 좋아요";
  }

  function advanceBeat() {
    if (stage !== "beat") return;
    if (beatIndex === story.beats.length - 1) renderChoice();
    else {
      beatIndex += 1;
      renderBeat();
    }
  }

  function renderChoice() {
    stage = "choice";
    quietNote.classList.remove("is-act-two");
    setScene("");
    eyebrow.textContent = "어느 쪽으로 갈까요?";
    title.textContent = story.question;
    storyText.textContent = "선택 뒤의 일은 아무도 확실히 몰라요. 마음이 가는 쪽을 골라 주세요.";
    setActions(...story.choices.map((choice, index) =>
      button(choice.label, index === 0 ? "primary-button" : "secondary-button", () => choose(index))
    ));
    quietNote.textContent = "고르면 오늘의 이야기가 정해져요";
  }

  function choose(choiceIndex) {
    if (stage !== "choice" || !story.choices[choiceIndex]) return Promise.resolve(null);
    const previous = readResult();
    if (previous) {
      renderEnding(previous);
      return Promise.resolve(previous);
    }
    const endingIndex = randomIndex(story.choices[choiceIndex].endings.length);
    const result = { storyId: story.id, choiceIndex, endingIndex };
    saveResult(result);
    stage = "revealing";
    setScene(choiceIndex === 0 ? "to-left" : "to-right");
    eyebrow.textContent = "길이 천천히 열리고 있어요";
    title.textContent = "와디프가 한 발 내딛습니다";
    storyText.textContent = "잠깐, 저쪽에서 무슨 소리가 들린 것 같은데…";
    setActions();
    quietNote.textContent = "";
    clearTimeout(revealTimer);
    return new Promise((resolve) => {
      revealTimer = setTimeout(() => {
        renderEnding(result);
        resolve(result);
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 1350);
    });
  }

  function renderEnding(result) {
    clearTimeout(revealTimer);
    if (!result) return renderIntro();
    stage = "ending";
    const choice = story.choices[result.choiceIndex];
    const ending = choice.endings[result.endingIndex];
    setScene("is-reveal");
    eyebrow.textContent = `오늘의 선택 · ${choice.label}`;
    title.textContent = ending.title;
    storyText.textContent = ending.text;
    setActions();
    if (story.actTwoTeaser) {
      quietNote.classList.add("is-act-two");
      quietNote.textContent = story.actTwoTeaser;
    } else {
      quietNote.classList.remove("is-act-two");
      quietNote.textContent = storageWorks
        ? "오늘의 이야기는 여기까지. 내일 새로운 갈림길에서 만나요 ✦"
        : "저장 기능이 꺼져 있어 새로 열면 선택이 초기화될 수 있어요";
    }
  }

  function refreshDay() {
    const today = localDate();
    if (today.key === dateKey) return;
    clearTimeout(revealTimer);
    memoryResult = null;
    memoryDateKey = "";
    setStoryForToday();
    const result = readResult();
    if (result) renderEnding(result);
    else renderIntro();
  }

  function registerWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const register = (tool) => {
      try {
        Promise.resolve(context.registerTool(tool)).catch(() => {});
      } catch {
        // Browsers without the proposed API still use the visible controls.
      }
    };
    register({
      name: "start_today_wadif_story",
      title: "오늘의 와디프 시작",
      description: "오늘의 이야기를 시작하고 첫 장면을 보여줍니다.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: () => {
        refreshDay();
        if (stage === "ending") return { status: "completed", title: title.textContent };
        if (stage === "intro") startStory();
        return { status: stage, scene: storyText.textContent };
      }
    });
    register({
      name: "advance_today_wadif_scene",
      title: "와디프 다음 장면",
      description: "현재 장면을 읽고 다음 장면이나 선택지로 진행합니다.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: () => {
        refreshDay();
        if (stage !== "beat") throw new Error("먼저 오늘의 이야기를 시작해 주세요.");
        advanceBeat();
        return { status: stage, text: storyText.textContent, choices: stage === "choice" ? story.choices.map(c => c.label) : null };
      }
    });
    register({
      name: "choose_today_wadif_path",
      title: "오늘의 길 선택",
      description: "현재 이야기에서 왼쪽(0) 또는 오른쪽(1)을 고르고 오늘의 결과를 확정합니다.",
      inputSchema: {
        type: "object",
        properties: { choiceIndex: { type: "integer", enum: [0, 1] } },
        required: ["choiceIndex"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: async ({ choiceIndex }) => {
        refreshDay();
        if (stage !== "choice") throw new Error("선택의 순간까지 이야기를 읽어 주세요.");
        if (choiceIndex !== 0 && choiceIndex !== 1) throw new Error("유효한 선택지는 0 또는 1입니다.");
        const result = await choose(choiceIndex);
        return { status: "completed", choice: story.choices[choiceIndex].label, ending: story.choices[choiceIndex].endings[result.endingIndex].title };
      }
    });
  }

  try {
    const probe = "wadif:storage-probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
  } catch {
    storageWorks = false;
  }

  setStoryForToday();
  const result = readResult();
  if (result) renderEnding(result);
  else renderIntro();
  registerWebMCP();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshDay();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey()) renderEnding(readResult());
  });
  window.setInterval(refreshDay, 60000);
})();
