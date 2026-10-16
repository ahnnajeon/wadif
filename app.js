(() => {
  "use strict";

  const stories = window.WADIF_STORIES;
  if (!Array.isArray(stories) || stories.length === 0) return;
  const config = window.WADIF_CONFIG || {};

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
  let choiceOrder = [0, 1];
  let source = "direct";
  let memoryUid = "";
  let viaAgent = false;

  // ?preview=1&ep=3&k=0 : read any episode without the daily limit, and without
  // saving or sending data. ep = episode number (1–14); k = hidden condition 0 or 1 (optional).
  const params = (() => {
    try {
      return new URLSearchParams(globalThis.location?.search || "");
    } catch {
      return null;
    }
  })();
  const preview = params?.get("preview") === "1";
  const collecting = Boolean(config.endpoint) && !preview;

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
    if (!storageWorks || preview) return null;
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
    if (!storageWorks || preview) return;
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

  // Which choice is shown first (left) is random, so a lean toward one
  // option can't come from button position or styling.
  function shuffledOrder() {
    return randomIndex(2) === 0 ? [0, 1] : [1, 0];
  }

  function normalizeOrder(order) {
    return Array.isArray(order) && order.length === 2 && order.includes(0) && order.includes(1) ? order : [0, 1];
  }

  // ---- anonymous data collection (off when config.endpoint is empty) ----

  function readSource() {
    try {
      const param = new URLSearchParams(globalThis.location?.search || "").get("src");
      if (param) return param.replace(/[^\w-]/g, "").slice(0, 30) || "direct";
      if (document.referrer) {
        const host = new URL(document.referrer).hostname;
        if (host && host !== globalThis.location?.hostname) return host.slice(0, 60);
      }
    } catch {
      // fall through
    }
    return "direct";
  }

  function userId() {
    if (memoryUid) return memoryUid;
    const fresh = () => globalThis.crypto?.randomUUID?.() ??
      `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    if (storageWorks) {
      try {
        memoryUid = localStorage.getItem("wadif:uid") || "";
        if (!memoryUid) {
          memoryUid = fresh();
          localStorage.setItem("wadif:uid", memoryUid);
        }
        return memoryUid;
      } catch {
        // fall through to a per-visit id
      }
    }
    memoryUid = fresh();
    return memoryUid;
  }

  function track(event, fields) {
    if (!collecting || typeof fetch !== "function") return;
    const payload = {
      v: 1,
      event,
      play_date: dateKey,
      story_id: story.id,
      uid: userId(),
      src: source,
      device: window.matchMedia?.("(max-width: 700px)").matches ? "mobile" : "desktop",
      via: viaAgent ? "agent" : "ui",
      ...fields
    };
    try {
      // text/plain body + no-cors: a simple request Google Apps Script accepts without CORS setup.
      fetch(config.endpoint, { method: "POST", mode: "no-cors", keepalive: true, body: JSON.stringify(payload) })
        .catch(() => {});
    } catch {
      // collection is best-effort; the story never waits for it
    }
  }

  // ---- rendering helpers ----

  function button(label, className, onClick) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = className;
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }

  function textLine(text, className) {
    const element = document.createElement("p");
    element.className = className;
    element.textContent = text;
    return element;
  }

  function setActions(...children) {
    actions.replaceChildren(...children);
  }

  function setScene(...modes) {
    scene.classList.remove("is-moving", "to-left", "to-right", "is-reveal", "pick-0", "pick-1");
    modes.filter(Boolean).forEach((mode) => scene.classList.add(mode));
  }

  // The character walks toward the side where that choice's button was shown.
  function sideOf(choiceIndex, order) {
    return normalizeOrder(order)[0] === choiceIndex ? "to-left" : "to-right";
  }

  function setNote(text, asPill = false) {
    quietNote.classList.remove("is-act-two", "is-pill");
    if (asPill) quietNote.classList.add("is-pill");
    quietNote.textContent = text;
  }

  // '짬뽕'을 / '버스'를: pick the object particle from the last Hangul syllable.
  function objectPhrase(label) {
    const chars = [...label.trim()];
    for (let i = chars.length - 1; i >= 0; i -= 1) {
      const code = chars[i].charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        return `‘${label}’${(code - 0xac00) % 28 === 0 ? "를" : "을"}`;
      }
    }
    return `‘${label}’을(를)`;
  }

  function setStoryForToday() {
    const today = localDate();
    dateKey = today.key;
    episodeIndex = ((today.ordinal % stories.length) + stories.length) % stories.length;
    const ep = Number.parseInt(params?.get("ep") ?? "", 10);
    if (preview && ep >= 1 && ep <= stories.length) episodeIndex = ep - 1;
    story = stories[episodeIndex];
    if (story.id === "unmarked-parcel") scene.classList.add("is-parcel");
    else scene.classList.remove("is-parcel");
    const [symbol, ink, glow] = colors[episodeIndex % colors.length];
    worldSymbol.textContent = symbol;
    scene.style.setProperty("--scene-symbol", ink);
    scene.style.setProperty("--scene-glow", glow);
    dayTag.textContent = `${preview ? "미리보기" : "오늘의 이야기"} · ${String(episodeIndex + 1).padStart(2, "0")} / ${stories.length}`;
  }

  // ---- story flow ----

  function renderIntro() {
    stage = "intro";
    setScene();
    eyebrow.textContent = "A tiny what-if, once a day";
    title.textContent = story.title;
    storyText.textContent = story.teaser;
    setActions(button("오늘의 이야기 시작하기 ↗", "primary-button", startStory));
    if (preview) setNote("미리보기 · 저장도 집계도 되지 않아요. 새로고침하면 처음부터예요");
    else setNote(storageWorks
      ? "약 2분 · 선택은 이 브라우저에서 하루에 한 번"
      : "브라우저 저장 기능이 꺼져 있어 하루 제한이 유지되지 않을 수 있어요");
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
    eyebrow.textContent = `오늘의 장면 · ${beatIndex + 1} / ${story.beats.length}`;
    title.textContent = story.title;
    storyText.textContent = story.beats[beatIndex];
    const last = beatIndex === story.beats.length - 1;
    setActions(button(last ? "선택의 순간으로 →" : "다음 장면 →", "primary-button", advanceBeat));
    setNote("서두르지 않아도 좋아요");
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
    setScene();
    choiceOrder = shuffledOrder();
    eyebrow.textContent = "어느 쪽으로 갈까요?";
    title.textContent = story.question;
    storyText.textContent = "선택 뒤의 일은 아무도 확실히 몰라요. 마음이 가는 쪽을 골라 주세요.\n고르고 나면, 같은 날 다른 쪽을 골랐을 때의 이야기도 보여 드릴게요.";
    setActions(...choiceOrder.map((index) =>
      button(story.choices[index].label, "choice-button", () => choose(index))
    ));
    setNote(collecting ? "고르면 오늘의 이야기가 정해져요 · 선택은 익명으로 집계돼요" : "고르면 오늘의 이야기가 정해져요");
  }

  function choose(choiceIndex) {
    if (stage !== "choice" || !story.choices[choiceIndex]) return Promise.resolve(null);
    const previous = readResult();
    if (previous) {
      renderEnding(previous);
      return Promise.resolve(previous);
    }
    const order = normalizeOrder(choiceOrder);
    const forced = Number.parseInt(params?.get("k") ?? "", 10);
    const endingIndex = preview && story.choices[choiceIndex].endings[forced]
      ? forced
      : randomIndex(story.choices[choiceIndex].endings.length);
    const result = { storyId: story.id, choiceIndex, endingIndex, order };
    saveResult(result);
    track("choice", {
      choice: choiceIndex,
      choice_label: story.choices[choiceIndex].label,
      condition: endingIndex,
      first_shown: order[0]
    });
    stage = "revealing";
    setScene(sideOf(choiceIndex, order), `pick-${choiceIndex}`);
    eyebrow.textContent = "길이 천천히 열리고 있어요";
    title.textContent = "하루가 흘러가는 중";
    storyText.textContent = "선택 하나가 그다음 일들을 조금씩 바꿔 놓고 있어요…";
    setActions();
    setNote("");
    clearTimeout(revealTimer);
    return new Promise((resolve) => {
      revealTimer = setTimeout(() => {
        renderEnding(result);
        resolve(result);
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 1350);
    });
  }

  // view "mine": the player's own ending. view "other": the other choice's
  // ending under the same hidden condition (endingIndex), i.e. the counterfactual.
  function renderEnding(result, view = "mine") {
    clearTimeout(revealTimer);
    if (!result) return renderIntro();
    stage = "ending";
    const order = normalizeOrder(result.order);
    const mine = story.choices[result.choiceIndex];
    const otherIndex = result.choiceIndex === 0 ? 1 : 0;
    const other = story.choices[otherIndex];
    const otherEnding = other?.endings[result.endingIndex];
    const condition = story.conditions?.[result.endingIndex];

    if (view === "other" && otherEnding) {
      setScene(sideOf(otherIndex, order), `pick-${otherIndex}`, "is-reveal");
      eyebrow.textContent = `만약 ${objectPhrase(other.label)} 골랐다면`;
      title.textContent = otherEnding.title;
      storyText.textContent = otherEnding.text;
      renderNextQuestion(result);
      setNote(condition ? `이날의 숨은 조건 · ${condition}` : "같은 날, 다른 선택", Boolean(condition));
      return;
    }

    const ending = mine.endings[result.endingIndex];
    setScene(sideOf(result.choiceIndex, order), `pick-${result.choiceIndex}`, "is-reveal");
    eyebrow.textContent = `나의 선택 · ${mine.label}`;
    title.textContent = ending.title;
    storyText.textContent = ending.text;
    setActions(...(otherEnding
      ? [button(`${objectPhrase(other.label)} 골랐다면? ↗`, "primary-button", () => renderEnding(result, "other"))]
      : []));
    if (story.actTwoTeaser) setNote(story.actTwoTeaser, true);
    else if (!storageWorks) setNote("저장 기능이 꺼져 있어 새로 열면 선택이 초기화될 수 있어요");
    else if (otherEnding) setNote("같은 날, 같은 조건에서 다른 쪽을 골랐다면 어땠을까요?");
    else setNote("오늘의 이야기는 여기까지. 내일 새로운 갈림길에서 만나요 ✦");
  }

  // Asked once, after both endings are known. Next time the hidden condition is
  // unknown again, so today's randomly drawn condition shouldn't change this answer.
  // Whether it does anyway is what the data can show.
  function renderNextQuestion(result) {
    const back = button("← 내 이야기로", "text-button", () => renderEnding(result));
    const answered = story.choices[result.next?.choiceIndex];
    if (answered) {
      setActions(
        textLine(`다음에도 이런 상황이라면 · ${answered.label}`, "next-prompt"),
        textLine("기록했어요. 내일 새로운 갈림길에서 만나요 ✦", "next-hint"),
        back
      );
      return;
    }
    const order = shuffledOrder();
    setActions(
      textLine("다음에 또 이런 상황이 온다면?", "next-prompt"),
      textLine("그날의 숨은 조건은 또 모르는 채로요.", "next-hint"),
      ...order.map((index) =>
        button(story.choices[index].label, "choice-button", () => answerNext(result, index, order))
      ),
      back
    );
  }

  function answerNext(result, nextIndex, order) {
    const current = readResult() || result;
    if (story.choices[current.next?.choiceIndex]) return renderEnding(current, "other");
    const updated = { ...current, next: { choiceIndex: nextIndex, order } };
    saveResult(updated);
    track("next", {
      choice: updated.choiceIndex,
      choice_label: story.choices[updated.choiceIndex].label,
      condition: updated.endingIndex,
      first_shown: normalizeOrder(updated.order)[0],
      next_choice: nextIndex,
      next_label: story.choices[nextIndex].label,
      next_first_shown: order[0]
    });
    renderEnding(updated, "other");
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
      description: "선택지 번호(0 또는 1, 이야기에 적힌 순서이며 화면의 좌우 위치와는 무관)를 골라 오늘의 결과를 확정합니다. 같은 숨은 조건에서 반대 선택을 했을 때의 결과도 함께 돌려줍니다.",
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
        viaAgent = true;
        const result = await choose(choiceIndex);
        const other = story.choices[choiceIndex === 0 ? 1 : 0];
        return {
          status: "completed",
          choice: story.choices[choiceIndex].label,
          ending: story.choices[choiceIndex].endings[result.endingIndex].title,
          condition: story.conditions?.[result.endingIndex] ?? null,
          counterfactual: { choice: other.label, ending: other.endings[result.endingIndex].title }
        };
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

  source = readSource();
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
