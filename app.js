(() => {
  "use strict";

  const MAX_IDS = 1000;
  const DEFAULT_WINNERS = 5;

  const el = {
    idsInput: document.getElementById("idsInput"),
    idCount: document.getElementById("idCount"),
    duplicateInfo: document.getElementById("duplicateInfo"),
    listHash: document.getElementById("listHash"),
    copyHashBtn: document.getElementById("copyHashBtn"),
    clearIdsBtn: document.getElementById("clearIdsBtn"),
    winnerCount: document.getElementById("winnerCount"),
    minusBtn: document.getElementById("minusBtn"),
    plusBtn: document.getElementById("plusBtn"),
    validation: document.getElementById("validationMessage"),
    startBtn: document.getElementById("startBtn"),
    workspace: document.getElementById("workspace"),
    drawStage: document.getElementById("drawStage"),
    rouletteNumber: document.getElementById("rouletteNumber"),
    rouletteProgress: document.getElementById("rouletteProgress"),
    resultsSection: document.getElementById("resultsSection"),
    resultsGrid: document.getElementById("resultsGrid"),
    drawSummary: document.getElementById("drawSummary"),
    drawTime: document.getElementById("drawTime"),
    drawParticipants: document.getElementById("drawParticipants"),
    drawWinners: document.getElementById("drawWinners"),
    drawHash: document.getElementById("drawHash"),
    copyResultsBtn: document.getElementById("copyResultsBtn"),
    newDrawBtn: document.getElementById("newDrawBtn"),
    toast: document.getElementById("toast")
  };

  let state = {
    ids: [],
    rawCount: 0,
    duplicates: 0,
    hash: "—",
    winners: [],
    drawing: false,
    hashRevision: 0
  };

  function parseIds(text) {
    // IDs are kept as strings so leading zeroes are preserved.
    const tokens = text
      .split(/[\s,;]+/)
      .map((v) => v.trim())
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

  async function sha256(text) {
    if (!window.crypto?.subtle) return "SHA-256 unavailable";
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function canonicalList(ids) {
    // Exact order matters; every ID is separated by a LF newline.
    return ids.join("\n");
  }

  function getWinnerCount() {
    const value = Number.parseInt(el.winnerCount.value, 10);
    return Number.isFinite(value) ? value : DEFAULT_WINNERS;
  }

  function setWinnerCount(value) {
    const max = Math.max(1, state.ids.length || MAX_IDS);
    const normalized = Math.max(1, Math.min(max, Number(value) || 1));
    el.winnerCount.value = String(normalized);
    validate();
  }

  function validate() {
    const count = getWinnerCount();
    let text = "";
    let type = "";

    if (state.ids.length === 0) {
      text = "Добавьте ID участников, чтобы начать.";
    } else if (state.rawCount > MAX_IDS && state.ids.length >= MAX_IDS) {
      text = `Лимит — ${MAX_IDS} уникальных ID. Лишние значения не участвуют.`;
      type = "error";
    } else if (count < 1) {
      text = "Нужно выбрать хотя бы 1 ID.";
      type = "error";
    } else if (count > state.ids.length) {
      text = `Нельзя выбрать ${count}: загружено только ${state.ids.length} уникальных ID.`;
      type = "error";
    } else {
      text = `Готово: ${state.ids.length} участников → ${count} победителей.`;
      type = "ok";
    }

    el.validation.textContent = text;
    el.validation.className = `validation ${type}`.trim();
    el.startBtn.disabled =
      state.drawing ||
      state.ids.length === 0 ||
      count < 1 ||
      count > state.ids.length;
  }

  async function updateIds() {
    const revision = ++state.hashRevision;
    const parsed = parseIds(el.idsInput.value);

    state.ids = parsed.ids;
    state.rawCount = parsed.rawCount;
    state.duplicates = parsed.duplicates;

    el.idCount.textContent = String(state.ids.length);
    el.duplicateInfo.textContent = `Дубликатов: ${state.duplicates}`;
    el.listHash.textContent = state.ids.length ? "Вычисляется…" : "—";

    const hash = state.ids.length ? await sha256(canonicalList(state.ids)) : "—";
    if (revision !== state.hashRevision) return;

    state.hash = hash;
    el.listHash.textContent = hash;
    validate();
  }

  function secureRandomIndex(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error("Invalid random range");
    }

    // Rejection sampling prevents modulo bias.
    const RANGE = 0x100000000; // 2^32
    const limit = Math.floor(RANGE / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    let value;

    do {
      crypto.getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);

    return value % maxExclusive;
  }

  function pickWithoutReplacement(input, count) {
    const pool = [...input];
    const picked = [];

    for (let i = 0; i < count; i++) {
      const index = secureRandomIndex(pool.length);
      picked.push(pool[index]);
      pool[index] = pool[pool.length - 1];
      pool.pop();
    }

    return picked;
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function runAnimation(ids, count) {
    const duration = 2500;
    const started = performance.now();
    let iteration = 0;

    while (performance.now() - started < duration) {
      const preview = ids[secureRandomIndex(ids.length)];
      el.rouletteNumber.textContent = preview;
      const elapsed = performance.now() - started;
      const pct = Math.min(99, Math.round((elapsed / duration) * 100));
      el.rouletteProgress.textContent = `Случайный выбор • ${pct}%`;

      iteration++;
      const easingDelay = 45 + Math.min(90, iteration * 2.8);
      await delay(easingDelay);
    }

    el.rouletteProgress.textContent = `Фиксируем ${count} результат${count === 1 ? "" : "ов"}…`;
    await delay(280);
  }

  function renderResults(winners) {
    el.resultsGrid.replaceChildren();

    winners.forEach((id, index) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.style.animationDelay = `${Math.min(index, 20) * 35}ms`;

      const label = document.createElement("span");
      label.textContent = `WINNER ${String(index + 1).padStart(2, "0")}`;

      const value = document.createElement("strong");
      value.textContent = id;

      card.append(label, value);
      el.resultsGrid.appendChild(card);
    });
  }

  async function startDraw() {
    if (state.drawing) return;

    const count = getWinnerCount();
    validate();
    if (el.startBtn.disabled) return;

    state.drawing = true;
    validate();

    // Freeze the exact participant list and its hash for this draw.
    const drawIds = [...state.ids];
    const drawHash = state.hash;
    const drawStartedAt = new Date();

    el.resultsSection.classList.add("is-hidden");
    el.drawStage.classList.remove("is-hidden");
    el.startBtn.disabled = true;

    el.drawStage.scrollIntoView({ behavior: "smooth", block: "center" });

    try {
      await runAnimation(drawIds, count);

      // IMPORTANT: Winners are selected only now, after the animation.
      const winners = pickWithoutReplacement(drawIds, count);
      state.winners = winners;

      if (winners.length === 1) {
        el.rouletteNumber.textContent = winners[0];
      } else {
        el.rouletteNumber.textContent = "DONE";
      }
      el.rouletteProgress.textContent = "Розыгрыш завершён";

      renderResults(winners);

      const finishedAt = new Date();
      el.drawSummary.textContent = `${drawIds.length} участников • ${winners.length} выбранных ID`;
      el.drawTime.textContent = finishedAt.toLocaleString("ru-RU");
      el.drawParticipants.textContent = String(drawIds.length);
      el.drawWinners.textContent = String(winners.length);
      el.drawHash.textContent = drawHash;

      await delay(450);
      el.resultsSection.classList.remove("is-hidden");
      el.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error(error);
      showToast("Ошибка: браузер не поддерживает безопасный генератор.");
    } finally {
      state.drawing = false;
      validate();
    }
  }

  async function copyText(text, successMessage) {
    if (!text || text === "—") return;

    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      return;
    } catch (_) {
      // Fallback for older browsers / local file:// previews.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast(successMessage);
    }
  }

  let toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 1800);
  }

  function resetDrawView() {
    state.winners = [];
    el.drawStage.classList.add("is-hidden");
    el.resultsSection.classList.add("is-hidden");
    el.rouletteNumber.textContent = "--------";
    el.rouletteProgress.textContent = "Подготовка...";
    document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  el.idsInput.addEventListener("input", updateIds);

  el.clearIdsBtn.addEventListener("click", () => {
    el.idsInput.value = "";
    updateIds();
    el.idsInput.focus();
  });

  el.winnerCount.addEventListener("input", validate);
  el.winnerCount.addEventListener("change", () => setWinnerCount(getWinnerCount()));

  el.minusBtn.addEventListener("click", () => setWinnerCount(getWinnerCount() - 1));
  el.plusBtn.addEventListener("click", () => setWinnerCount(getWinnerCount() + 1));

  el.startBtn.addEventListener("click", startDraw);

  el.copyHashBtn.addEventListener("click", () =>
    copyText(state.hash, "SHA-256 скопирован")
  );

  el.copyResultsBtn.addEventListener("click", () => {
    // One ID per line = paste directly into one Google Sheets column.
    copyText(state.winners.join("\n"), "ID скопированы — вставьте в Google Sheets");
  });

  el.newDrawBtn.addEventListener("click", resetDrawView);

  updateIds();
})();