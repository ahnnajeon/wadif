(() => {
  "use strict";

  const groups = window.WADIF_AGE_GROUPS;
  const library = window.WADIF_STORIES || {};
  const seasons = window.WADIF_SEASONS || {};
  if (!Array.isArray(groups)) return;
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
  const stageEl = $("stage");
  const art = window.WADIF_ART || null;

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
  const ageKey = "wadif:age";
  let dateKey = "";
  let dayOrdinal = 0;
  let age = null;
  let story = null;
  // What today holds for the current age group:
  //   { kind: "single", story, index }               an episode from stories.js
  //   { kind: "episode", season, epIndex, story, opening }  a season episode
  //   { kind: "finale", season, picks }              the season's weekend finale
  let plan = null;
  let stage = "age";
  let storageWorks = true;
  let revealTimer = null;
  let memoryResult = null;
  let memoryDateKey = "";
  let memoryAge = null;
  let choiceOrder = [0, 1];
  let source = "direct";
  let memoryUid = "";
  let viaAgent = false;
  const memorySeasons = new Map();

  // Preview links read any episode without the daily limit, and without saving
  // or sending data. age = 10s|20s|30s|40s|50s, k = hidden condition 0 or 1.
  //   ?preview=1&age=20s&ep=2&k=0            single episode 2 of that age group
  //   ?preview=1&age=40s&s=3&prev=B2&k=0     season episode 3, as if yesterday was B②
  //   ?preview=1&age=40s&s=finale&path=A1B2B1A2A1   the finale for that week
  // &season=2 picks a later season (default 1).
  // config.query is a default for pages opened without a query (the hosted pilot preview).
  const params = (() => {
    try {
      return new URLSearchParams(globalThis.location?.search || config.query || "");
    } catch {
      return null;
    }
  })();
  const preview = params?.get("preview") === "1";
  const collecting = Boolean(config.endpoint) && !preview;

  const groupById = (id) => groups.find((group) => group.id === id) || null;
  const mod = (n, m) => ((n % m) + m) % m;
  const seasonsFor = (ageId) => (Array.isArray(seasons[ageId]) ? seasons[ageId] : []);
  const hasContent = (ageId) => Boolean(library[ageId]?.length || seasonsFor(ageId).length);

  function refreshDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    dayOrdinal = Math.round((Date.UTC(year, month - 1, day) - launchDate) / dayMs);
  }

  function storageKey() {
    return `wadif:v2:${dateKey}`;
  }

  // A single episode for an age group: one per day, rotating through the group.
  function episodeFor(ageId) {
    const list = library[ageId];
    if (!Array.isArray(list) || list.length === 0) return -1;
    return mod(dayOrdinal, list.length);
  }

  // How many of these picks were on the season's first side (40대 시즌 1: 가족 쪽).
  // flip = true counts the week where every choice went the other way.
  function sideCount(season, picks, flip = false) {
    return picks.filter((pick, i) => {
      const choice = season.episodes[i]?.choices[flip ? 1 - pick.choice : pick.choice];
      return choice?.side === 0;
    }).length;
  }

  function finaleEnding(season, count) {
    return season.finale.endings.find((ending) => count >= ending.min) || season.finale.endings.at(-1);
  }

  function episodePlan(season, epIndex, previous) {
    const episode = season.episodes[epIndex];
    const opening = epIndex === 0 ? season.intro : episode.bridges?.[previous?.choice]?.[previous?.k];
    return { kind: "episode", season, epIndex, story: episode, opening: opening || "" };
  }

  // The plan a stored result belongs to, or null if the result no longer fits the stories.
  function planFromResult(data) {
    if (!data || !groupById(data.age)) return null;
    if (data.finale) {
      const season = seasonsFor(data.age).find((s) => s.id === data.finale);
      if (!season) return null;
      const state = seasonState(season);
      return state.picks.length === season.episodes.length ? { kind: "finale", season, picks: state.picks } : null;
    }
    let found = null;
    for (const season of seasonsFor(data.age)) {
      const epIndex = season.episodes.findIndex((episode) => episode.id === data.storyId);
      if (epIndex >= 0) found = { kind: "episode", season, epIndex, story: season.episodes[epIndex], opening: "" };
    }
    if (!found) {
      const list = library[data.age] || [];
      const index = list.findIndex((st) => st.id === data.storyId);
      if (index >= 0) found = { kind: "single", story: list[index], index };
    }
    if (
      !found ||
      !Number.isInteger(data.choiceIndex) ||
      !Number.isInteger(data.endingIndex) ||
      !found.story.choices[data.choiceIndex]?.endings[data.endingIndex]
    ) return null;
    return found;
  }

  // Today's plan when nothing has been played today: the first unfinished season
  // (next episode, or the finale on the visit after the last episode), then singles.
  function planFor(ageId) {
    if (preview) {
      const forced = previewPlan(ageId);
      if (forced) return forced;
    }
    for (const season of seasonsFor(ageId)) {
      const state = seasonState(season);
      const done = state.picks.length;
      if (done < season.episodes.length) return episodePlan(season, done, state.picks[done - 1]);
      if (!state.finale) return { kind: "finale", season, picks: state.picks };
    }
    const index = episodeFor(ageId);
    return index < 0 ? null : { kind: "single", story: library[ageId][index], index };
  }

  // "B2" → yesterday chose B under condition ②.
  function parsePick(code) {
    const match = /^([AB])([12])?$/i.exec(code || "");
    if (!match) return { choice: 0, k: 0 };
    return { choice: match[1].toUpperCase() === "A" ? 0 : 1, k: match[2] === "2" ? 1 : 0 };
  }

  function previewPlan(ageId) {
    const seasonNumber = Number.parseInt(params?.get("season") ?? "1", 10) || 1;
    const season = seasonsFor(ageId)[seasonNumber - 1];
    const s = params?.get("s");
    if (season && s === "finale") {
      const codes = String(params.get("path") || "").match(/[AB][12]?/gi) || [];
      return { kind: "finale", season, picks: season.episodes.map((_, i) => ({ ...parsePick(codes[i]), date: "" })) };
    }
    const n = Number.parseInt(s ?? "", 10);
    if (season && n >= 1 && n <= season.episodes.length) return episodePlan(season, n - 1, parsePick(params.get("prev")));
    const ep = Number.parseInt(params?.get("ep") ?? "", 10);
    const singles = library[ageId] || [];
    if (ep >= 1 && ep <= singles.length) return { kind: "single", story: singles[ep - 1], index: ep - 1 };
    return null;
  }

  // ---- browser storage (one result per day, remembered age group) ----

  function readResult() {
    if (memoryDateKey === dateKey && memoryResult) return memoryResult;
    if (!storageWorks || preview) return null;
    try {
      const value = localStorage.getItem(storageKey());
      if (!value) return null;
      const data = JSON.parse(value);
      if (!planFromResult(data)) return null;
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

  // Season progress: { picks: [{ choice, k, date }], finale: date the finale was shown }.
  function cleanSeasonState(season, data) {
    const picks = [];
    for (const pick of Array.isArray(data?.picks) ? data.picks : []) {
      const episode = season.episodes[picks.length];
      if (!episode?.choices[pick?.choice]?.endings[pick?.k]) break;
      picks.push({ choice: pick.choice, k: pick.k, date: String(pick.date || "") });
    }
    const complete = picks.length === season.episodes.length;
    return { picks, finale: complete && typeof data?.finale === "string" ? data.finale : null };
  }

  function seasonState(season) {
    if (storageWorks && !preview) {
      let value = null;
      try {
        value = localStorage.getItem(`wadif:season:${season.id}`);
      } catch {
        storageWorks = false;
      }
      if (storageWorks) {
        try {
          return cleanSeasonState(season, value ? JSON.parse(value) : null);
        } catch {
          return cleanSeasonState(season, null);
        }
      }
    }
    return cleanSeasonState(season, memorySeasons.get(season.id));
  }

  function saveSeasonState(season, state) {
    memorySeasons.set(season.id, state);
    if (!storageWorks || preview) return;
    try {
      localStorage.setItem(`wadif:season:${season.id}`, JSON.stringify(state));
    } catch {
      storageWorks = false;
    }
  }

  function storedAge() {
    if (memoryAge) return memoryAge;
    if (preview) return groupById(params?.get("age")) ? params.get("age") : null;
    if (!storageWorks) return null;
    try {
      const value = localStorage.getItem(ageKey);
      return groupById(value) ? value : null;
    } catch {
      return null;
    }
  }

  function saveAge(id) {
    memoryAge = id;
    if (!storageWorks || preview) return;
    try {
      localStorage.setItem(ageKey, id);
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
      const param = params?.get("src");
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
      v: 2,
      event,
      play_date: dateKey,
      age,
      story_id: story.id,
      uid: userId(),
      src: source,
      device: window.matchMedia?.("(max-width: 700px)").matches ? "mobile" : "desktop",
      via: viaAgent ? "agent" : "ui",
      // Which screen design the player saw. "v2" = StegoAhnna on the stage.
      // Rows from before the redesign have no ui field.
      ui: "v2",
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

  // ---- StegoAhnna's stage ----
  // Two StegoAhnnas, Main and Twin. place: left | center | right.
  // look: is-ghost (a dark outline: the other day, not seen yet), is-twin (the
  // other day, seen), is-dim (my day while looking at the other), is-hidden.
  // On the left she is turned around, so both always face the middle token.

  const placeOf = (choiceIndex, order) => (sideOf(choiceIndex, order) === "to-left" ? "left" : "right");
  const otherPlace = (place) => (place === "left" ? "right" : "left");
  const endingArt = (choiceIndex, k) => story?.choices[choiceIndex]?.endings[k]?.art || {};
  const shortLabel = (choice) => choice?.short || choice?.label || "";

  function setActor(which, { place = "center", mood = "neutral", prop = "", label = "", look = "" } = {}) {
    $(`actor${which}`).className = ["actor", `at-${place}`, place === "left" ? "face-right" : "", look]
      .filter(Boolean).join(" ");
    $(`face${which}`).innerHTML = art ? art.face(mood) : "";
    $(`prop${which}`).innerHTML = art && prop ? art.prop(prop) : "";
    $(`label${which}`).textContent = label;
  }

  function setStage(mode, { main = {}, twin = null, token = "", tokenLabel = "" } = {}) {
    stageEl.className = `stage mode-${mode}`;
    // The token takes the middle of the sky; the episode glyph and the moon step back.
    scene.classList.remove("stage-open");
    if (mode === "mine" || mode === "other") scene.classList.add("stage-open");
    setActor("Main", main);
    setActor("Twin", twin || { place: otherPlace(main.place || "right"), look: "is-hidden" });
    $("tokenIcon").innerHTML = art && token ? art.icon(token) : "";
    $("tokenLabel").textContent = tokenLabel;
  }

  function replayButton() {
    // Only on the hosted pilot preview: reload starts the episode again.
    return preview && config.replay ? [button("미리보기 다시 하기", "text-button", () => globalThis.location.reload())] : [];
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

  function applyPlan(next) {
    const group = groupById(age);
    plan = group ? next : null;
    story = plan && plan.kind !== "finale" ? plan.story : null;
    if (!plan) {
      dayTag.textContent = preview ? "미리보기" : "오늘의 갈림길";
      return;
    }
    if (story?.id === "unmarked-parcel") scene.classList.add("is-parcel");
    else scene.classList.remove("is-parcel");
    const slot = plan.kind === "single" ? plan.index : plan.kind === "episode" ? plan.epIndex + 7 : 12;
    const [symbol, ink, glow] = colors[(groups.indexOf(group) * 3 + slot) % colors.length];
    worldSymbol.textContent = symbol;
    scene.style.setProperty("--scene-symbol", ink);
    scene.style.setProperty("--scene-glow", glow);
    const prefix = preview ? "미리보기 · " : "";
    if (plan.kind === "single") {
      dayTag.textContent = `${prefix}${group.label} · ${plan.index + 1} / ${library[age].length}`;
    } else {
      const where = plan.kind === "finale" ? "결산" : `${plan.epIndex + 1} / ${plan.season.episodes.length}`;
      dayTag.textContent = `${prefix}${group.label} · 시즌 ${plan.season.number} · ${where}`;
    }
  }

  function seasonFields() {
    return plan?.kind === "episode" ? { season: plan.season.id, episode: plan.epIndex + 1 } : {};
  }

  function tomorrowLine() {
    if (plan?.kind === "episode") {
      const next = plan.season.episodes[plan.epIndex + 1];
      return next ? `내일은 ${next.day}요일 이야기가 이어져요 ✦` : "내일은 이번 주 결산이 기다려요 ✦";
    }
    return "내일 새로운 갈림길에서 만나요 ✦";
  }

  // ---- story flow ----

  function renderAgePicker() {
    stage = "age";
    clearTimeout(revealTimer);
    story = null;
    plan = null;
    setScene();
    setStage("idle");
    dayTag.textContent = preview ? "미리보기" : "오늘의 갈림길";
    eyebrow.textContent = "A tiny what-if, once a day";
    title.textContent = "당신의 연령대는?";
    storyText.textContent = "연령대에 맞는 일상의 갈림길을 하루에 한 편씩 보여 드려요.";
    setActions(...groups.map((group) =>
      button(group.label, "choice-button age-button", () => pickAge(group.id))
    ));
    setNote(collecting ? "고른 연령대와 선택은 이름 없이 집계돼요" : "고른 연령대는 이 브라우저에만 기억돼요");
  }

  function pickAge(id) {
    if (stage !== "age" || !groupById(id) || !hasContent(id)) return;
    age = id;
    saveAge(id);
    openPlan(planFor(id));
  }

  function changeAge() {
    if (stage !== "choice") return;
    age = null;
    memoryAge = null;
    renderAgePicker();
  }

  // One screen: the situation, the question and the two choices.
  function renderChoice() {
    stage = "choice";
    setScene();
    const setupArt = story.art?.setup || {};
    setStage("setup", { main: { place: "center", mood: setupArt.mood, prop: setupArt.prop } });
    choiceOrder = shuffledOrder();
    eyebrow.textContent = plan.kind === "episode"
      ? `${plan.season.title} · ${story.day}요일`
      : `오늘의 갈림길 · ${groupById(age).label}`;
    title.textContent = story.title;
    storyText.textContent = plan.opening ? `${plan.opening}\n\n${story.setup}` : story.setup;
    setActions(
      textLine(story.question, "next-prompt"),
      ...choiceOrder.map((index) =>
        button(story.choices[index].label, "choice-button", () => choose(index))
      ),
      button("연령대 바꾸기", "text-button", changeAge)
    );
    setNote(collecting ? "고르면 오늘의 이야기가 정해져요 · 선택은 익명으로 집계돼요" : "고르면 오늘의 이야기가 정해져요");
  }

  function choose(choiceIndex) {
    if (stage !== "choice" || !story?.choices[choiceIndex]) return Promise.resolve(null);
    const previous = readResult();
    if (previous) {
      boot();
      return Promise.resolve(previous);
    }
    const order = normalizeOrder(choiceOrder);
    const forced = Number.parseInt(params?.get("k") ?? "", 10);
    const endingIndex = preview && story.choices[choiceIndex].endings[forced]
      ? forced
      : randomIndex(story.choices[choiceIndex].endings.length);
    const result = { storyId: story.id, age, choiceIndex, endingIndex, order };
    const extra = seasonFields();
    if (plan.kind === "episode") {
      Object.assign(result, extra);
      const state = seasonState(plan.season);
      const previousPick = state.picks[plan.epIndex - 1];
      if (previousPick) {
        extra.prev_choice = previousPick.choice;
        extra.prev_condition = previousPick.k;
      }
      if (!preview && state.picks.length === plan.epIndex) {
        state.picks.push({ choice: choiceIndex, k: endingIndex, date: dateKey });
        if (state.picks.length === plan.season.episodes.length) extra.side_count = sideCount(plan.season, state.picks);
        saveSeasonState(plan.season, state);
      }
    }
    saveResult(result);
    track("choice", {
      choice: choiceIndex,
      choice_label: story.choices[choiceIndex].label,
      condition: endingIndex,
      first_shown: order[0],
      ...extra
    });
    stage = "revealing";
    setScene(sideOf(choiceIndex, order), `pick-${choiceIndex}`);
    setStage("walk", { main: { place: placeOf(choiceIndex, order) } });
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
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 1100);
    });
  }

  // view "mine": the player's own ending. view "other": the other choice's
  // ending under the same hidden condition (endingIndex), i.e. the counterfactual.
  function renderEnding(result, view = "mine") {
    clearTimeout(revealTimer);
    if (!result) return boot();
    stage = "ending";
    const order = normalizeOrder(result.order);
    const mine = story.choices[result.choiceIndex];
    const otherIndex = result.choiceIndex === 0 ? 1 : 0;
    const other = story.choices[otherIndex];
    const otherEnding = other?.endings[result.endingIndex];
    const condition = story.conditions?.[result.endingIndex];
    const place = placeOf(result.choiceIndex, order);
    const mineArt = endingArt(result.choiceIndex, result.endingIndex);

    if (view === "other" && otherEnding) {
      const otherArt = endingArt(otherIndex, result.endingIndex);
      setStage("other", {
        main: { place, mood: mineArt.mood, prop: mineArt.prop, label: `나 · ${shortLabel(mine)}`, look: "is-dim" },
        twin: { place: otherPlace(place), mood: otherArt.mood, prop: otherArt.prop, label: `만약 · ${shortLabel(other)}`, look: "is-twin" },
        token: story.art?.conditions?.[result.endingIndex] || "plain",
        tokenLabel: "같은 조건"
      });
      setScene(sideOf(otherIndex, order), `pick-${otherIndex}`, "is-reveal");
      eyebrow.textContent = `만약 ${objectPhrase(other.label)} 골랐다면`;
      title.textContent = otherEnding.title;
      storyText.textContent = otherEnding.text;
      renderNextQuestion(result);
      setNote(condition ? `이날의 숨은 조건 · ${condition}` : "같은 날, 다른 선택", Boolean(condition));
      return;
    }

    const ending = mine.endings[result.endingIndex];
    setStage("mine", {
      main: { place, mood: mineArt.mood, prop: mineArt.prop },
      twin: otherEnding ? { place: otherPlace(place), look: "is-ghost" } : null,
      token: otherEnding ? "unknown" : ""
    });
    setScene(sideOf(result.choiceIndex, order), `pick-${result.choiceIndex}`, "is-reveal");
    eyebrow.textContent = `나의 선택 · ${mine.label}`;
    title.textContent = ending.title;
    storyText.textContent = ending.text;
    setActions(...(otherEnding
      ? [button(`${objectPhrase(other.label)} 골랐다면? ↗`, "primary-button", () => renderEnding(result, "other"))]
      : []), ...replayButton());
    if (!storageWorks) setNote("저장 기능이 꺼져 있어 새로 열면 선택이 초기화될 수 있어요");
    else if (otherEnding) setNote("같은 날, 같은 조건에서 다른 쪽을 골랐다면 어땠을까요?");
    else setNote(`오늘의 이야기는 여기까지. ${tomorrowLine()}`);
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
        textLine(`기록했어요. ${tomorrowLine()}`, "next-hint"),
        back,
        ...replayButton()
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
      next_first_shown: order[0],
      ...seasonFields()
    });
    renderEnding(updated, "other");
  }

  // The weekend finale: the five days as walked, then the ending the count of
  // side-0 choices leads to. view "other" flips every choice and keeps every
  // hidden condition: the whole week's counterfactual.
  function renderFinale(view = "mine") {
    clearTimeout(revealTimer);
    stage = "finale";
    const { season, picks } = plan;
    const flip = view === "other";
    const side = season.sides?.[0] || "";
    const count = sideCount(season, picks);
    const shownCount = sideCount(season, picks, flip);
    const ending = finaleEnding(season, shownCount);
    const path = picks.map((pick, i) => {
      const episode = season.episodes[i];
      const choice = episode.choices[flip ? 1 - pick.choice : pick.choice];
      return `${episode.day} · ${choice.short || choice.label} · ${choice.endings[pick.k].title}`;
    }).join("\n");
    setScene("is-reveal");
    title.textContent = ending.title;
    if (flip) {
      setStage("other", {
        main: { place: "left", label: "이번 주", look: "is-dim" },
        twin: { place: "right", mood: "calm", label: "반대로 고른 주", look: "is-twin" },
        token: "plain",
        tokenLabel: "같은 조건"
      });
      const same = finaleEnding(season, count) === ending && season.finale.same;
      eyebrow.textContent = "만약 모든 날 반대로 골랐다면";
      storyText.textContent = `${path}\n\n${ending.text}${same ? `\n\n${season.finale.same}` : ""}`;
      setActions(button("← 내 결산으로", "text-button", () => renderFinale()));
      setNote(`숨은 조건은 다섯 날 모두 그대로 · ${side} ${shownCount}번`, true);
      return;
    }
    setStage("finale", { main: { place: "center", mood: "calm" } });
    eyebrow.textContent = `이번 주 결산 · ${side} ${count}번`;
    storyText.textContent = `${path}\n\n${ending.text}`;
    setActions(button("모든 날 반대로 골랐다면? ↗", "primary-button", () => renderFinale("other")));
    setNote("이번 주는 여기까지. 내일은 새 이야기가 기다려요 ✦");
  }

  // Show a plan that has nothing played yet today. Opening the finale counts as
  // today's visit, so the day after it the next season or the singles begin.
  function openPlan(next) {
    applyPlan(next);
    if (!plan) {
      age = null;
      renderAgePicker();
      return;
    }
    if (plan.kind === "finale") {
      if (!preview) {
        saveSeasonState(plan.season, { ...seasonState(plan.season), finale: dateKey });
        saveResult({ finale: plan.season.id, age });
      }
      renderFinale();
      return;
    }
    renderChoice();
  }

  // Decide what to show for today: today's result if there is one,
  // otherwise today's plan for the remembered age group, otherwise the age question.
  function boot() {
    clearTimeout(revealTimer);
    refreshDate();
    const today = readResult();
    if (today) {
      age = today.age;
      applyPlan(planFromResult(today));
      if (plan?.kind === "finale") renderFinale();
      else renderEnding(today);
      return;
    }
    age = storedAge();
    if (age && hasContent(age)) {
      openPlan(planFor(age));
    } else {
      age = null;
      renderAgePicker();
    }
  }

  function refreshDay() {
    const before = dateKey;
    refreshDate();
    if (dateKey === before) return;
    memoryResult = null;
    memoryDateKey = "";
    boot();
  }

  function storySummary() {
    if (stage === "age" || (!story && stage !== "finale")) {
      return { status: "needs_age", ageGroups: groups.map((g) => ({ id: g.id, label: g.label })) };
    }
    if (stage === "ending") return { status: "completed", ageGroup: age, title: title.textContent };
    if (stage === "finale") return { status: "finale", ageGroup: age, title: title.textContent, text: storyText.textContent };
    return {
      status: stage,
      ageGroup: age,
      title: story.title,
      setup: story.setup,
      question: story.question,
      choices: story.choices.map((c) => c.label)
    };
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
      name: "set_wadif_age_group",
      title: "와디프 연령대 고르기",
      description: "연령대를 고르고 그 연령대의 오늘 이야기를 엽니다. 오늘 선택을 마치기 전까지만 바꿀 수 있습니다.",
      inputSchema: {
        type: "object",
        properties: { ageGroup: { type: "string", enum: groups.map((g) => g.id) } },
        required: ["ageGroup"],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false },
      execute: ({ ageGroup }) => {
        refreshDay();
        if (stage === "choice") changeAge();
        if (stage !== "age") throw new Error("오늘 선택을 이미 마쳤어요.");
        pickAge(ageGroup);
        return storySummary();
      }
    });
    register({
      name: "read_today_wadif_story",
      title: "오늘의 와디프 읽기",
      description: "오늘의 상황, 질문, 선택지를 읽습니다. 연령대를 아직 고르지 않았다면 고를 수 있는 연령대를 돌려줍니다.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: () => {
        refreshDay();
        return storySummary();
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
        if (stage === "finale") throw new Error("오늘은 선택 대신 이번 주 결산이에요.");
        if (stage !== "choice") throw new Error("연령대를 고르고 오늘의 이야기를 연 뒤에 선택할 수 있어요.");
        if (choiceIndex !== 0 && choiceIndex !== 1) throw new Error("유효한 선택지는 0 또는 1입니다.");
        viaAgent = true;
        const result = await choose(choiceIndex);
        const other = story.choices[choiceIndex === 0 ? 1 : 0];
        return {
          status: "completed",
          ageGroup: age,
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
  boot();
  registerWebMCP();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshDay();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey() || event.key?.startsWith("wadif:season:")) {
      memoryResult = null;
      memoryDateKey = "";
      boot();
    }
  });
  window.setInterval(refreshDay, 60000);
})();
