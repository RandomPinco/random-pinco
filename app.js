(() => {
  "use strict";

  const MAX_IDS = 1000;
  const DEFAULT_WINNERS = 5;

  const el = {
    idsInput: document.getElementById("idsInput"),
    idCount: document.getElementById("idCount"),

    listHash: document.getElementById("listHash"),
    copyHashBtn: document.getElementById("copyHashBtn"),
    clearIdsBtn: document.getElementById("clearIdsBtn"),

    winnerCount: document.getElementById("winnerCount"),
    minusBtn: document.getElementById("minusBtn"),
    plusBtn: document.getElementById("plusBtn"),

    validation: document.getElementById("validationMessage"),
    startBtn: document.getElementById("startBtn"),

    drawStage: document.getElementById("drawStage"),
    rouletteNumber: document.getElementById("rouletteNumber"),
    rouletteProgress: document.getElementById("rouletteProgress"),

    resultsSection: document.getElementById("resultsSection"),
    resultsGrid: document.getElementById("resultsGrid"),
    drawTime: document.getElementById("drawTime"),
    drawParticipants: document.getElementById("drawParticipants"),
    drawHash: document.getElementById("drawHash"),

    copyResultsBtn: document.getElementById("copyResultsBtn"),
    newDrawBtn: document.getElementById("newDrawBtn"),
    closeResultsBtn: document.getElementById("closeResultsBtn"),

    excludeToggle: document.getElementById("excludeToggle"),
    excludeInfo: document.getElementById("excludeInfo"),
    excludedCount: document.getElementById("excludedCount"),
    confettiLayer: document.getElementById("confettiLayer"),

    toast: document.getElementById("toast")
  };

  let state = {
    ids: [],
    rawCount: 0,
    duplicates: 0,
    overLimit: false,
    hash: "—",
    winners: [],
    drawing: false,
    hashRevision: 0,
    excludedIds: new Set()
  };

  function parseIds(text) {
    const tokens = text
      .split(/[\s,;]+/)
      .map(value => value.trim())
      .filter(Boolean);

    const unique = [];
    const seen = new Set();

    for (const token of tokens) {
      if (!seen.has(token)) {
        seen.add(token);
        unique.push(token);
      }
    }

    return {
      ids: unique.slice(0, MAX_IDS),
      rawCount: tokens.length,
      duplicates: Math.max(0, tokens.length - unique.length),
      overLimit: unique.length > MAX_IDS
    };
  }

  function canonicalList(ids) {
    return ids.join("\n");
  }

  async function sha256(text) {
    if (!window.crypto?.subtle) {
      return "SHA-256 unavailable";
    }

    const encoded = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", encoded);

    return [...new Uint8Array(digest)]
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function shortHash(hash) {
    if (!hash || hash === "—" || hash.length < 16) return hash;
    return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
  }

  function getWinnerCount() {
    const value = Number.parseInt(el.winnerCount.value, 10);
    return Number.isFinite(value) ? value : DEFAULT_WINNERS;
  }

  function getPool() {
    if (!el.excludeToggle.checked || state.excludedIds.size === 0) {
      return state.ids;
    }
    return state.ids.filter(id => !state.excludedIds.has(id));
  }

  function setWinnerCount(value) {
    const max = Math.max(1, getPool().length || MAX_IDS);
    const normalized = Math.max(1, Math.min(max, Number(value) || 1));

    el.winnerCount.value = String(normalized);
    validate();
  }

  function updateExcludeInfo() {
    const active = el.excludeToggle.checked && state.excludedIds.size > 0;
    el.excludeInfo.classList.toggle("hidden", !active);
    el.excludedCount.textContent = String(state.excludedIds.size);
  }

  function validate() {
    const winners = getWinnerCount();
    const pool = getPool();

    let message = "";
    let className = "validation";

    if (state.ids.length === 0) {
      message = "Добавьте участников, чтобы начать";
    } else if (state.overLimit) {
      message = `Лимит — ${MAX_IDS} уникальных ID`;
      className += " error";
    } else if (pool.length === 0) {
      message = "Все участники уже выигрывали";
      className += " error";
    } else if (winners < 1) {
      message = "Нужно выбрать хотя бы 1 ID";
      className += " error";
    } else if (winners > pool.length) {
      message = el.excludeToggle.checked && state.excludedIds.size > 0
        ? `Доступно ${pool.length} ID (без учёта победителей)`
        : `Загружено только ${pool.length} ID`;
      className += " error";
    } else {
      message = `${pool.length} участников → ${winners} победителей`;
      className += " ok";
    }

    el.validation.textContent = message;
    el.validation.className = className;

    el.startBtn.disabled =
      state.drawing ||
      pool.length === 0 ||
      winners < 1 ||
      winners > pool.length;

    updateExcludeInfo();
  }

  async function updateIds() {
    const revision = ++state.hashRevision;
    const parsed = parseIds(el.idsInput.value);

    state.ids = parsed.ids;
    state.rawCount = parsed.rawCount;
    state.duplicates = parsed.duplicates;
    state.overLimit = parsed.overLimit;
    state.excludedIds = new Set();

    el.idCount.textContent = String(state.ids.length);

    if (!state.ids.length) {
      state.hash = "—";
      el.listHash.textContent = "—";
      validate();
      return;
    }

    el.listHash.textContent = "…";

    const hash = await sha256(canonicalList(state.ids));

    if (revision !== state.hashRevision) {
      return;
    }

    state.hash = hash;
    el.listHash.textContent = shortHash(hash);

    validate();
  }

  function secureRandomIndex(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error("Invalid random range");
    }

    const RANGE = 0x100000000;
    const limit = Math.floor(RANGE / maxExclusive) * maxExclusive;
    const buffer = new Uint32Array(1);

    let value;

    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);

    return value % maxExclusive;
  }

  function pickWithoutReplacement(source, count) {
    const pool = [...source];
    const winners = [];

    for (let i = 0; i < count; i++) {
      const index = secureRandomIndex(pool.length);

      winners.push(pool[index]);

      pool[index] = pool[pool.length - 1];
      pool.pop();
    }

    return winners;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function animateRoulette(ids, winnerCount) {
    const duration = 2400;
    const startTime = performance.now();

    let iteration = 0;

    while (performance.now() - startTime < duration) {
      const previewId = ids[secureRandomIndex(ids.length)];

      el.rouletteNumber.textContent = previewId;

      const elapsed = performance.now() - startTime;
      const percent = Math.min(99, Math.round((elapsed / duration) * 100));

      el.rouletteProgress.textContent = `${percent}%`;

      iteration += 1;

      const wait = 42 + Math.min(100, iteration * 2.7);

      await delay(wait);
    }

    el.rouletteProgress.textContent = "Фиксируем результат…";

    await delay(320);
  }

  function renderResults(winners) {
    el.resultsGrid.replaceChildren();

    winners.forEach((id, index) => {
      const card = document.createElement("article");
      card.className = "result-card";
      card.style.animationDelay = `${Math.min(index, 20) * 35}ms`;

      const label = document.createElement("span");
      label.textContent = String(index + 1).padStart(2, "0");

      const value = document.createElement("strong");
      value.textContent = id;

      card.append(label, value);
      el.resultsGrid.appendChild(card);
    });
  }

  async function startDraw() {
    if (state.drawing) {
      return;
    }

    const winnerCount = getWinnerCount();

    validate();

    if (el.startBtn.disabled) {
      return;
    }

    state.drawing = true;
    validate();

    const drawIds = getPool();
    const drawHash = state.hash;

    el.resultsSection.classList.add("hidden");
    el.drawStage.classList.remove("hidden");

    el.drawStage.scrollIntoView({ behavior: "smooth", block: "center" });

    try {
      await animateRoulette(drawIds, winnerCount);

      const winners = pickWithoutReplacement(drawIds, winnerCount);
      state.winners = winners;

      if (el.excludeToggle.checked) {
        winners.forEach(id => state.excludedIds.add(id));
      }

      el.drawStage.classList.add("hit");

      if (winners.length === 1) {
        el.rouletteNumber.textContent = winners[0];
      } else {
        el.rouletteNumber.textContent = "DONE";
      }

      el.rouletteProgress.textContent = "Готово";

      renderResults(winners);

      const finishedAt = new Date();

      el.drawTime.textContent = finishedAt.toLocaleString("ru-RU");
      el.drawParticipants.textContent = String(drawIds.length);
      el.drawHash.textContent = shortHash(drawHash);

      await delay(450);

      el.resultsSection.classList.remove("hidden");
      spawnConfetti();
    } catch (error) {
      console.error(error);
      showToast("Ошибка: браузер не поддерживает безопасный генератор");
    } finally {
      state.drawing = false;
      validate();
    }
  }

  async function copyText(text, successMessage) {
    if (!text || text === "—") {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      return;
    } catch (_) {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      showToast(successMessage);
    }
  }

  let toastTimer = null;

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      el.toast.classList.remove("show");
    }, 1900);
  }

  const CONFETTI_COLORS = ["#f0b93a", "#ffe29a", "#ff2b12", "#2fe6b8"];

  function spawnConfetti() {
    el.confettiLayer.replaceChildren();

    const count = 60;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 220;
      const duration = 2.6 + Math.random() * 1.8;
      const delay = Math.random() * 0.5;
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const rounded = Math.random() > 0.5;

      piece.style.left = `${left}%`;
      piece.style.background = color;
      piece.style.setProperty("--drift", `${drift}px`);
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;
      if (rounded) piece.style.borderRadius = "50%";

      fragment.appendChild(piece);
    }

    el.confettiLayer.appendChild(fragment);

    clearTimeout(spawnConfetti._timer);
    spawnConfetti._timer = setTimeout(() => {
      el.confettiLayer.replaceChildren();
    }, 4600);
  }

  function resetDrawView() {
    state.winners = [];

    el.drawStage.classList.add("hidden");
    el.drawStage.classList.remove("hit");
    el.resultsSection.classList.add("hidden");
    el.confettiLayer.replaceChildren();

    el.rouletteNumber.textContent = "--------";
    el.rouletteProgress.textContent = "Подготовка…";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  el.idsInput.addEventListener("input", updateIds);

  el.clearIdsBtn.addEventListener("click", () => {
    el.idsInput.value = "";
    updateIds();
    el.idsInput.focus();
  });

  el.winnerCount.addEventListener("input", validate);

  el.winnerCount.addEventListener("change", () => {
    setWinnerCount(getWinnerCount());
  });

  el.minusBtn.addEventListener("click", () => {
    setWinnerCount(getWinnerCount() - 1);
  });

  el.plusBtn.addEventListener("click", () => {
    setWinnerCount(getWinnerCount() + 1);
  });

  el.startBtn.addEventListener("click", startDraw);

  el.copyHashBtn.addEventListener("click", () => {
    copyText(state.hash, "SHA-256 скопирован");
  });

  el.copyResultsBtn.addEventListener("click", () => {
    copyText(state.winners.join("\n"), "Список скопирован");
  });

  el.newDrawBtn.addEventListener("click", resetDrawView);
  el.closeResultsBtn.addEventListener("click", resetDrawView);

  el.excludeToggle.addEventListener("change", () => {
    setWinnerCount(getWinnerCount());
    validate();
  });

  el.resultsSection.addEventListener("click", (event) => {
    if (event.target === el.resultsSection) {
      resetDrawView();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.resultsSection.classList.contains("hidden")) {
      resetDrawView();
    }
  });

  updateIds();
})();
