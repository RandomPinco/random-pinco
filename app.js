(() => {
  "use strict";

  const MAX_IDS = 50000;
  const DEFAULT_WINNERS = 5;
  const LANG_KEY = "pinco_lang";

  /* ---------------- I18N ---------------- */

  const I18N = {
    uz: {
      pageTitle: "PINCO — Tasodifiy tanlov",
      metaDescription: "PINCO ishtirokchilari uchun halol tasodifiy tanlov.",
      localTag: "brauzeringizda, lokal",
      participantsTitle: "Ishtirokchilar",
      clearBtn: "Tozalash",
      hashCopyAria: "Ro'yxat SHA-256 xeshini nusxalash",
      winnersTitle: "G'oliblar soni",
      decreaseAria: "Kamaytirish",
      increaseAria: "Ko'paytirish",
      excludeInfo: "oldin g'olib chiqqanlar qatnashmaydi — {n} ta",
      vAddParticipants: "Boshlash uchun ishtirokchilarni qo'shing",
      vLimit: "Limit — {max} ta noyob ID",
      vAllWon: "Yangi ro'yxat qo'shilishini kutmoqda",
      vMinOne: "Kamida 1 ta ID tanlanishi kerak",
      vAvailable: "Mavjud: {pool} ta ID",
      vReady: "{pool} ishtirokchi → {winners} g'olib",
      startBtn: "BOSHLASH",
      drawBadge: "tanlov ketmoqda",
      progressPreparing: "Tayyorlanmoqda…",
      progressFinalizing: "Natija aniqlanmoqda…",
      progressDone: "Tayyor",
      doneLabel: "TAYYOR",
      footerNote: "Tanlov butunlay brauzeringizda amalga oshiriladi. Ishtirokchilar ma'lumotlari hech qayerga yuborilmaydi.",
      winnersHeading: "G'oliblar",
      copyResultsBtn: "Ro'yxatni nusxalash",
      auditParticipants: "ishtirokchi",
      auditHashLabel: "xesh",
      newDrawBtn: "Yangi tanlov",
      closeAria: "Yopish",
      hashCopied: "SHA-256 nusxalandi",
      listCopied: "Ro'yxat nusxalandi",
      genError: "Xatolik: brauzer xavfsiz generatorni qo'llab-quvvatlamaydi",
      localeCode: "uz-UZ"
    },

    ru: {
      pageTitle: "PINCO — Случайный розыгрыш",
      metaDescription: "Честный случайный розыгрыш среди участников PINCO.",
      localTag: "локально, в браузере",
      participantsTitle: "Участники",
      clearBtn: "Очистить",
      hashCopyAria: "Скопировать SHA-256 хэш списка",
      winnersTitle: "Количество победителей",
      decreaseAria: "Уменьшить",
      increaseAria: "Увеличить",
      excludeInfo: "предыдущие победители не участвуют — {n}",
      vAddParticipants: "Добавьте участников, чтобы начать",
      vLimit: "Лимит — {max} уникальных ID",
      vAllWon: "Ожидаем новый список участников",
      vMinOne: "Нужно выбрать хотя бы 1 ID",
      vAvailable: "Доступно: {pool} ID",
      vReady: "{pool} участников → {winners} победителей",
      startBtn: "СТАРТ",
      drawBadge: "идёт розыгрыш",
      progressPreparing: "Подготовка…",
      progressFinalizing: "Фиксируем результат…",
      progressDone: "Готово",
      doneLabel: "ГОТОВО",
      footerNote: "Розыгрыш полностью выполняется в вашем браузере. Данные участников никуда не отправляются.",
      winnersHeading: "Победители",
      copyResultsBtn: "Копировать список",
      auditParticipants: "участников",
      auditHashLabel: "хэш",
      newDrawBtn: "Новый розыгрыш",
      closeAria: "Закрыть",
      hashCopied: "SHA-256 скопирован",
      listCopied: "Список скопирован",
      genError: "Ошибка: браузер не поддерживает безопасный генератор",
      localeCode: "ru-RU"
    },

    en: {
      pageTitle: "PINCO — Random Draw",
      metaDescription: "A fair random draw for PINCO participants.",
      localTag: "local, in your browser",
      participantsTitle: "Participants",
      clearBtn: "Clear",
      hashCopyAria: "Copy the list's SHA-256 hash",
      winnersTitle: "Number of winners",
      decreaseAria: "Decrease",
      increaseAria: "Increase",
      excludeInfo: "previous winners are excluded — {n}",
      vAddParticipants: "Add participants to get started",
      vLimit: "Limit — {max} unique IDs",
      vAllWon: "Waiting for a new participant list",
      vMinOne: "Select at least 1 ID",
      vAvailable: "Available: {pool} IDs",
      vReady: "{pool} participants → {winners} winners",
      startBtn: "START",
      drawBadge: "draw in progress",
      progressPreparing: "Preparing…",
      progressFinalizing: "Finalizing the result…",
      progressDone: "Done",
      doneLabel: "DONE",
      footerNote: "The draw runs entirely in your browser. Participant data is never sent anywhere.",
      winnersHeading: "Winners",
      copyResultsBtn: "Copy list",
      auditParticipants: "participants",
      auditHashLabel: "hash",
      newDrawBtn: "New draw",
      closeAria: "Close",
      hashCopied: "SHA-256 copied",
      listCopied: "List copied",
      genError: "Error: your browser doesn't support a secure generator",
      localeCode: "en-GB"
    }
  };

  function readStoredLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && I18N[stored]) return stored;
    } catch (_) { /* ignore */ }
    return "uz";
  }

  let lang = readStoredLang();

  function t(key, vars) {
    const dict = I18N[lang] || I18N.uz;
    let str = dict[key] ?? I18N.uz[key] ?? key;

    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }

    return str;
  }

  /* ---------------- DOM ---------------- */

  const el = {
    idsInput: document.getElementById("idsInput"),
    idCount: document.getElementById("idCount"),
    idLimit: document.getElementById("idLimit"),

    listHash: document.getElementById("listHash"),
    copyHashBtn: document.getElementById("copyHashBtn"),
    clearIdsBtn: document.getElementById("clearIdsBtn"),

    winnerCount: document.getElementById("winnerCount"),
    minusBtn: document.getElementById("minusBtn"),
    plusBtn: document.getElementById("plusBtn"),

    excludeInfo: document.getElementById("excludeInfo"),
    excludeInfoText: document.getElementById("excludeInfoText"),

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

    confettiLayer: document.getElementById("confettiLayer"),

    langBtns: document.querySelectorAll(".lang-btn"),

    toast: document.getElementById("toast")
  };

  // Winners are ALWAYS removed from the pool automatically.
  // The exclusion list only resets when the participant list itself changes.
  let state = {
    ids: [],
    duplicates: 0,
    overLimit: false,
    hash: "—",
    winners: [],
    drawing: false,
    hashRevision: 0,
    excludedIds: new Set()
  };

  /* ---------------- language application ---------------- */

  function applyStaticTranslations() {
    document.documentElement.lang = lang;
    document.title = t("pageTitle");

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("metaDescription"));

    document.querySelectorAll("[data-i18n]").forEach(node => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(node => {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });

    el.langBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  function setLanguage(nextLang) {
    if (!I18N[nextLang] || nextLang === lang) return;

    lang = nextLang;

    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ }

    applyStaticTranslations();
    updateExcludeInfo();

    if (!el.drawStage.classList.contains("hidden") && !state.drawing) {
      el.rouletteProgress.textContent = t("progressDone");
    } else if (el.drawStage.classList.contains("hidden")) {
      el.rouletteProgress.textContent = t("progressPreparing");
    }

    validate();
  }

  /* ---------------- parsing / hashing ---------------- */

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

  function formatNumber(n) {
    return n.toLocaleString("en-US").replace(/,/g, " ");
  }

  function getWinnerCount() {
    const value = Number.parseInt(el.winnerCount.value, 10);
    return Number.isFinite(value) ? value : DEFAULT_WINNERS;
  }

  // Pool = all loaded IDs minus everyone who has already won (auto).
  function getPool() {
    if (state.excludedIds.size === 0) {
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
    const active = state.excludedIds.size > 0;
    el.excludeInfo.classList.toggle("hidden", !active);
    el.excludeInfoText.textContent = t("excludeInfo", { n: formatNumber(state.excludedIds.size) });
  }

  function validate() {
    const winners = getWinnerCount();
    const pool = getPool();

    let message = "";
    let className = "validation";

    if (state.ids.length === 0) {
      message = t("vAddParticipants");
    } else if (state.overLimit) {
      message = t("vLimit", { max: formatNumber(MAX_IDS) });
      className += " error";
    } else if (pool.length === 0) {
      // Everyone already won — stay quiet, no scary error, just wait for a new list.
      message = t("vAllWon");
    } else if (winners < 1) {
      message = t("vMinOne");
      className += " error";
    } else if (winners > pool.length) {
      message = t("vAvailable", { pool: formatNumber(pool.length) });
      className += " error";
    } else {
      message = t("vReady", { pool: formatNumber(pool.length), winners: formatNumber(winners) });
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
    state.duplicates = parsed.duplicates;
    state.overLimit = parsed.overLimit;
    state.excludedIds = new Set(); // new list -> nobody has won yet

    el.idCount.textContent = formatNumber(state.ids.length);

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

  /* ---------------- randomness ---------------- */

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

  async function animateRoulette(ids) {
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

    el.rouletteProgress.textContent = t("progressFinalizing");

    await delay(320);
  }

  function renderResults(winners) {
    el.resultsGrid.replaceChildren();

    winners.forEach((id, index) => {
      const card = document.createElement("article");
      card.className = "result-card";
      card.style.animationDelay = `${Math.min(index, 20) * 55}ms`;

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
      await animateRoulette(drawIds);

      const winners = pickWithoutReplacement(drawIds, winnerCount);
      state.winners = winners;

      // Every winner is permanently removed from the pool from now on.
      winners.forEach(id => state.excludedIds.add(id));

      el.drawStage.classList.add("hit");

      if (winners.length === 1) {
        el.rouletteNumber.textContent = winners[0];
      } else {
        el.rouletteNumber.textContent = t("doneLabel");
      }

      el.rouletteProgress.textContent = t("progressDone");

      renderResults(winners);

      const finishedAt = new Date();

      el.drawTime.textContent = finishedAt.toLocaleString(t("localeCode"));
      el.drawParticipants.textContent = formatNumber(drawIds.length);
      el.drawHash.textContent = shortHash(drawHash);

      await delay(400);

      el.resultsSection.classList.remove("hidden");
      spawnConfetti();
    } catch (error) {
      console.error(error);
      showToast(t("genError"));
    } finally {
      state.drawing = false;
      validate();
    }
  }

  /* ---------------- clipboard / toast ---------------- */

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

  /* ---------------- confetti ---------------- */

  const CONFETTI_COLORS = ["#f0b93a", "#ffe29a", "#ff2b12", "#2fe6b8"];

  function spawnConfetti() {
    el.confettiLayer.replaceChildren();

    const count = 90;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 260;
      const duration = 2.6 + Math.random() * 2.0;
      const delay = Math.random() * 0.6;
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const rounded = Math.random() > 0.5;
      const size = 8 + Math.round(Math.random() * 6);

      piece.style.left = `${left}%`;
      piece.style.width = `${size}px`;
      piece.style.height = `${Math.round(size * 1.6)}px`;
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
    }, 5200);
  }

  function resetDrawView() {
    state.winners = [];

    el.drawStage.classList.add("hidden");
    el.drawStage.classList.remove("hit");
    el.resultsSection.classList.add("hidden");
    el.confettiLayer.replaceChildren();

    el.rouletteNumber.textContent = "--------";
    el.rouletteProgress.textContent = t("progressPreparing");

    validate();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- events ---------------- */

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
    copyText(state.hash, t("hashCopied"));
  });

  el.copyResultsBtn.addEventListener("click", () => {
    copyText(state.winners.join("\n"), t("listCopied"));
  });

  el.newDrawBtn.addEventListener("click", resetDrawView);
  el.closeResultsBtn.addEventListener("click", resetDrawView);

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

  el.langBtns.forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  /* ---------------- init ---------------- */

  el.idLimit.textContent = MAX_IDS.toLocaleString("en-US").replace(/,/g, " ");
  el.winnerCount.max = String(MAX_IDS);

  applyStaticTranslations();
  el.rouletteProgress.textContent = t("progressPreparing");
  updateIds();
})();
