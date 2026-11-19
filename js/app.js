/**
 * WORDIFY - English Vocabulary Learning Platform
 * Core Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentView: "dashboard",
    currentDeckKey: "c1-academic",
    currentCardIndex: 0,
    currentReviewIndex: 0,
    quizQuestionIndex: 0,
    quizScore: 0,
    dictFilterStatus: "all",
    dictSearchQuery: "",
    learnFilterLevel: "all"
  };

  // ========================================================
  // 1. ROUTING & NAVIGATION
  // ========================================================
  const viewTitles = {
    dashboard: { title: "Dashboard", subtitle: "Welcome back, Alex · Let's master 5 more words today" },
    learn: { title: "Learn Words", subtitle: "Systematic CEFR-aligned vocabulary curriculum" },
    flashcards: { title: "Flashcards", subtitle: "Active recall study sets with 3D flip and native pronunciation" },
    games: { title: "Games & Arena", subtitle: "Gamified vocabulary drills to strengthen recall speed" },
    ielts: { title: "IELTS Vocabulary", subtitle: "Academic Band 8.0 - 9.0 Lexicon & Collocations for Task 2" },
    dictionary: { title: "My Dictionary", subtitle: "Your personal word bank and custom vocabulary journal" },
    review: { title: "Spaced Repetition Review", subtitle: "Scientifically scheduled reviews for permanent retention" },
    statistics: { title: "Learning Analytics", subtitle: "In-depth insights into your CEFR progress and retention curve" },
    settings: { title: "Settings & Preferences", subtitle: "Manage speech engine, daily targets, and account options" }
  };

  function switchView(viewName) {
    if (!viewTitles[viewName]) viewName = "dashboard";
    state.currentView = viewName;

    // Hide all view panels
    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.add("hidden");
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove("hidden");
    }

    // Update Header Titles
    const titleEl = document.getElementById("current-page-title");
    const subEl = document.getElementById("current-page-subtitle");
    if (titleEl && viewTitles[viewName]) {
      titleEl.textContent = viewTitles[viewName].title;
    }
    if (subEl && viewTitles[viewName]) {
      subEl.textContent = viewTitles[viewName].subtitle;
    }

    // Update Desktop Sidebar Active Classes
    document.querySelectorAll("#sidebar-nav .nav-item").forEach(item => {
      if (item.getAttribute("data-nav") === viewName) {
        item.classList.add("nav-item-active");
        item.classList.remove("text-slate-600", "dark:text-slate-300");
      } else {
        item.classList.remove("nav-item-active");
        item.classList.add("text-slate-600", "dark:text-slate-300");
      }
    });

    // Update Mobile Bottom Nav Active Classes
    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      if (btn.getAttribute("data-nav") === viewName) {
        btn.classList.add("text-brand-600", "dark:text-brand-400");
        btn.classList.remove("text-slate-400");
      } else {
        btn.classList.remove("text-brand-600", "dark:text-brand-400");
        btn.classList.add("text-slate-400");
      }
    });

    // Update URL hash without reload
    window.location.hash = viewName;

    // View specific initializations
    if (viewName === "flashcards") {
      renderFlashcard();
    } else if (viewName === "dictionary") {
      renderDictionary();
    } else if (viewName === "review") {
      renderReviewQueue();
    } else if (viewName === "learn") {
      renderLearnUnits();
    } else if (viewName === "games") {
      renderGameModes();
      renderQuizQuestion();
    } else if (viewName === "ielts") {
      renderIeltsTopics();
    } else if (viewName === "statistics") {
      renderStatistics();
    }

    // Close Mobile Drawer if open
    closeMobileDrawer();

    // Scroll to top of main content
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.scrollTop = 0;

    // Refresh Lucide Icons
    refreshIcons();
  }

  // Handle URL hash changes
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && viewTitles[hash]) {
      switchView(hash);
    }
  });

  // Attach nav click handlers
  document.querySelectorAll("[data-nav]").forEach(elem => {
    elem.addEventListener("click", (e) => {
      const target = elem.getAttribute("data-nav");
      if (target) {
        switchView(target);
      }
    });
  });

  // ========================================================
  // 2. MOBILE DRAWER NAVIGATION
  // ========================================================
  const mobileDrawer = document.getElementById("mobile-drawer");
  const mobileDrawerContent = document.getElementById("mobile-drawer-content");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileBottomMenuTrigger = document.getElementById("mobile-bottom-menu-trigger");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");
  const mobileNavItems = document.getElementById("mobile-nav-items");

  // Populate mobile drawer nav items
  function buildMobileDrawerItems() {
    if (!mobileNavItems) return;
    mobileNavItems.innerHTML = "";
    
    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "learn", label: "Learn Words", icon: "book-open", badge: "6 Units" },
      { id: "flashcards", label: "Flashcards", icon: "layers" },
      { id: "games", label: "Games", icon: "gamepad-2", badge: "Play" },
      { id: "ielts", label: "IELTS Vocabulary", icon: "award", badge: "Band 8+" },
      { id: "dictionary", label: "My Dictionary", icon: "bookmark" },
      { id: "review", label: "Review", icon: "rotate-ccw", badge: "8 Due" },
      { id: "statistics", label: "Statistics", icon: "bar-chart-3" },
      { id: "settings", label: "Settings", icon: "settings" }
    ];

    navItems.forEach(item => {
      const a = document.createElement("a");
      a.href = `#${item.id}`;
      a.setAttribute("data-nav", item.id);
      a.className = "flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
      
      let badgeHtml = "";
      if (item.badge) {
        badgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">${item.badge}</span>`;
      }

      a.innerHTML = `
        <div class="flex items-center gap-3.5">
          <i data-lucide="${item.icon}" class="w-5 h-5"></i>
          <span>${item.label}</span>
        </div>
        ${badgeHtml}
      `;

      a.addEventListener("click", () => {
        switchView(item.id);
        closeMobileDrawer();
      });

      mobileNavItems.appendChild(a);
    });
  }

  function openMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerContent) return;
    mobileDrawer.classList.remove("hidden");
    setTimeout(() => {
      mobileDrawerContent.classList.remove("-translate-x-full");
    }, 10);
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerContent) return;
    mobileDrawerContent.classList.add("-translate-x-full");
    setTimeout(() => {
      mobileDrawer.classList.add("hidden");
    }, 280);
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileDrawer);
  if (mobileBottomMenuTrigger) mobileBottomMenuTrigger.addEventListener("click", openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener("click", closeMobileDrawer);
  if (mobileDrawer) {
    mobileDrawer.addEventListener("click", (e) => {
      if (e.target === mobileDrawer) closeMobileDrawer();
    });
  }

  // ========================================================
  // 3. THEME TOGGLE (LIGHT / DARK)
  // ========================================================
  function toggleTheme() {
    const currentTheme = Storage.getTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    Storage.setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`, "info");
    refreshIcons();
  }

  const themeToggleSidebar = document.getElementById("theme-toggle-sidebar");
  const themeToggleHeader = document.getElementById("theme-toggle-header");
  const themeToggleDrawer = document.getElementById("theme-toggle-drawer");

  if (themeToggleSidebar) themeToggleSidebar.addEventListener("click", toggleTheme);
  if (themeToggleHeader) themeToggleHeader.addEventListener("click", toggleTheme);
  if (themeToggleDrawer) themeToggleDrawer.addEventListener("click", toggleTheme);

  // ========================================================
  // 4. AUDIO / PRONUNCIATION ENGINE (Web Speech API)
  // ========================================================
  function playAudio(text, btnElement = null) {
    if (!('speechSynthesis' in window)) {
      showToast("Speech synthesis not supported in this browser", "warning");
      return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = Storage.getSettings();
    utterance.lang = settings.accentVoice || "en-US";
    utterance.rate = parseFloat(settings.playbackSpeed) || 1.0;
    utterance.pitch = 1.0;

    // Optional animation on button
    if (btnElement) {
      btnElement.classList.add("audio-playing");
      utterance.onend = () => btnElement.classList.remove("audio-playing");
      utterance.onerror = () => btnElement.classList.remove("audio-playing");
    }

    window.speechSynthesis.speak(utterance);
  }

  // Global delegate for audio buttons with data-pronounce attribute
  document.addEventListener("click", (e) => {
    const audioBtn = e.target.closest(".audio-btn");
    if (audioBtn) {
      e.stopPropagation();
      const word = audioBtn.getAttribute("data-pronounce");
      if (word) {
        playAudio(word, audioBtn);
      }
    }
  });

  // ========================================================
  // 5. TOAST NOTIFICATIONS
  // ========================================================
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const typeStyles = {
      success: "bg-emerald-600 text-white",
      info: "bg-brand-600 text-white",
      warning: "bg-amber-600 text-white",
      danger: "bg-rose-600 text-white"
    };

    const typeIcons = {
      success: "check-circle",
      info: "sparkles",
      warning: "alert-triangle",
      danger: "x-circle"
    };

    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold transform transition-all duration-300 translate-y-4 opacity-0 ${typeStyles[type] || typeStyles.info}`;
    toast.innerHTML = `
      <i data-lucide="${typeIcons[type] || 'info'}" class="w-4 h-4"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ========================================================
  // 6. DASHBOARD COMPONENTS & METRICS
  // ========================================================
  function updateDashboardMetrics() {
    const user = Storage.getUser();
    
    // Header pills
    const headerStreak = document.getElementById("header-streak-count");
    const headerXp = document.getElementById("header-xp-count");
    const headerGoal = document.getElementById("header-goal-text");
    if (headerStreak) headerStreak.textContent = user.currentStreak;
    if (headerXp) headerXp.textContent = user.xp.toLocaleString();
    if (headerGoal) headerGoal.textContent = `${user.wordsLearnedToday} / ${user.dailyGoal} Words`;

    // Sidebar card
    const sideGoalText = document.getElementById("sidebar-daily-goal-text");
    const sideProgressBar = document.getElementById("sidebar-daily-progress-bar");
    if (sideGoalText) sideGoalText.textContent = `${user.wordsLearnedToday} / ${user.dailyGoal}`;
    if (sideProgressBar) {
      const pct = Math.min(100, Math.round((user.wordsLearnedToday / user.dailyGoal) * 100));
      sideProgressBar.style.width = `${pct}%`;
    }

    // Metric cards
    const mGoal = document.getElementById("metric-daily-goal");
    const mStreak = document.getElementById("metric-streak");
    const mXp = document.getElementById("metric-xp");
    const mTotal = document.getElementById("metric-total-words");

    if (mGoal) mGoal.textContent = user.wordsLearnedToday;
    if (mStreak) mStreak.textContent = user.currentStreak;
    if (mXp) mXp.textContent = user.xp.toLocaleString();
    if (mTotal) mTotal.textContent = user.totalWordsLearned;

    // Dictionary count badge
    const dictCount = document.getElementById("sidebar-dict-count");
    if (dictCount) {
      const words = Storage.getDictionary();
      dictCount.textContent = words.length;
    }

    // Review due badge
    const reviewQueue = Storage.getReviewQueue();
    const reviewBadge = document.getElementById("sidebar-review-badge");
    const srsDueCount = document.getElementById("srs-due-count");
    if (reviewBadge) reviewBadge.textContent = `${reviewQueue.length} Due`;
    if (srsDueCount) srsDueCount.textContent = `${reviewQueue.length} Words Due`;
  }

  // Render Weekly Activity Bar Chart
  function renderWeeklyChart() {
    const container = document.getElementById("weekly-chart-bars");
    if (!container) return;
    container.innerHTML = "";

    const maxWords = 30;
    initialData.weeklyActivity.forEach(item => {
      const col = document.createElement("div");
      col.className = "flex flex-col items-center gap-2 group cursor-pointer h-full justify-end";

      const heightPct = Math.round((item.words / maxWords) * 100);
      const isToday = item.isToday;

      col.innerHTML = `
        <div class="relative w-full flex flex-col items-center justify-end h-36">
          <!-- Tooltip on hover -->
          <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg whitespace-nowrap z-20">
            ${item.words} words · ${item.xp} XP
          </div>
          
          <!-- Bar -->
          <div class="w-7 sm:w-10 rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${isToday ? 'bg-gradient-to-t from-brand-600 to-accent-purple shadow-md shadow-brand-500/20' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-brand-300'}" style="height: ${heightPct}%;">
          </div>
        </div>
        <span class="text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}">${item.day}</span>
      `;

      container.appendChild(col);
    });
  }

  // Today's Word Component
  function initTodayWord() {
    const today = initialData.todayWord;
    const titleEl = document.getElementById("today-word-title");
    const phoneEl = document.getElementById("today-word-phonetic");
    const posEl = document.getElementById("today-word-pos");
    const defEl = document.getElementById("today-word-def");
    const exEl = document.getElementById("today-word-example");
    const synEl = document.getElementById("today-word-synonyms");
    const audioBtn = document.getElementById("today-word-audio-btn");
    const saveBtn = document.getElementById("today-word-save-btn");
    const saveText = document.getElementById("today-word-save-text");

    if (titleEl) titleEl.textContent = today.word;
    if (phoneEl) phoneEl.textContent = today.phonetic;
    if (posEl) posEl.textContent = today.partOfSpeech;
    if (defEl) defEl.textContent = today.definition;
    if (exEl) exEl.textContent = `"${today.example}"`;

    if (synEl) {
      synEl.innerHTML = today.synonyms.map(syn => `
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">${syn}</span>
      `).join("");
    }

    if (audioBtn) {
      audioBtn.onclick = () => playAudio(today.word, audioBtn);
    }

    if (saveBtn) {
      saveBtn.onclick = () => {
        const dict = Storage.getDictionary();
        const exists = dict.find(w => w.word.toLowerCase() === today.word.toLowerCase());
        if (!exists) {
          Storage.addDictionaryWord({
            word: today.word,
            phonetic: today.phonetic,
            partOfSpeech: today.partOfSpeech,
            level: today.level,
            definition: today.definition,
            example: today.example,
            tags: ["Featured", "Daily"]
          });
          showToast(`"${today.word}" added to your dictionary!`, "success");
          if (saveText) saveText.textContent = "Saved in Dictionary ✓";
          saveBtn.classList.add("bg-emerald-600");
          saveBtn.classList.remove("bg-brand-600");
          updateDashboardMetrics();
        } else {
          showToast(`"${today.word}" is already in your dictionary.`, "info");
        }
      };
    }
  }

  // Dashboard Words to Review Preview
  function renderDashboardReviewPreview() {
    const container = document.getElementById("dashboard-review-preview");
    if (!container) return;

    const queue = Storage.getReviewQueue().slice(0, 3);
    container.innerHTML = "";

    queue.forEach(item => {
      const div = document.createElement("div");
      div.className = "flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";
      div.innerHTML = `
        <div class="flex items-center gap-2.5">
          <button class="audio-btn p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-white dark:hover:bg-slate-700" data-pronounce="${item.word}" title="Pronounce">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
          </button>
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white block">${item.word}</span>
            <span class="text-[10px] text-slate-400">${item.partOfSpeech} · Score: ${item.retentionScore}%</span>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.urgency === 'urgent' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700'}">
          ${item.dueInterval}
        </span>
      `;
      container.appendChild(div);
    });
  }

  // Dashboard Achievements List
  function renderDashboardAchievements() {
    const container = document.getElementById("dashboard-achievements-list");
    if (!container) return;
    container.innerHTML = "";

    initialData.achievements.slice(0, 3).forEach(ach => {
      const div = document.createElement("div");
      div.className = "flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800";
      div.innerHTML = `
        <div class="w-8 h-8 rounded-xl ${ach.color} flex items-center justify-center flex-shrink-0">
          <i data-lucide="${ach.icon}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${ach.title}</span>
            <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i>
          </div>
          <span class="text-[10px] text-slate-400 line-clamp-1">${ach.desc}</span>
        </div>
      `;
      container.appendChild(div);
    });
  }

  // ========================================================
  // 7. LEARN WORDS VIEW
  // ========================================================
  function renderLearnUnits() {
    const grid = document.getElementById("learning-units-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = initialData.learningUnits.filter(unit => {
      if (state.learnFilterLevel === "all") return true;
      return unit.level.includes(state.learnFilterLevel);
    });

    filtered.forEach(unit => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";
      
      const isCompleted = unit.progress === 100;
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <i data-lucide="${unit.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${unit.level}</span>
              ${isCompleted ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">Done ✓</span>' : ''}
            </div>
          </div>

          <h3 class="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">${unit.title}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">${unit.description}</p>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs font-bold mb-2">
            <span class="text-slate-400">${unit.completedWords} / ${unit.totalWords} Words</span>
            <span class="text-brand-600 dark:text-brand-400">${unit.progress}%</span>
          </div>

          <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
            <div class="h-full bg-gradient-to-r from-brand-500 to-accent-purple rounded-full progress-pill" style="width: ${unit.progress}%"></div>
          </div>

          <div class="flex items-center gap-2">
            <button class="study-unit-btn flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2" data-unit-id="${unit.id}">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>
              <span>Study Unit</span>
            </button>
            <button class="preview-unit-words-btn p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors" data-unit-id="${unit.id}" title="Word List">
              <i data-lucide="list" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach click listeners to Study Unit buttons
    grid.querySelectorAll(".study-unit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchView("flashcards");
        showToast("Loaded flashcard deck for this unit", "info");
      });
    });

    grid.querySelectorAll(".preview-unit-words-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchView("dictionary");
        showToast("Filtered dictionary for unit words", "info");
      });
    });
  }

  // Learn level filter tabs
  document.querySelectorAll(".learn-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".learn-filter-btn").forEach(b => {
        b.className = "learn-filter-btn px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white";
      });
      btn.className = "learn-filter-btn px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] text-brand-600 dark:text-brand-400 shadow-xs font-bold";
      state.learnFilterLevel = btn.getAttribute("data-filter") || "all";
      renderLearnUnits();
      refreshIcons();
    });
  });

  // ========================================================
  // 8. FLASHCARDS CONTROLLER (3D Flip & Anki-Style Rating)
  // ========================================================
  const flashcardContainer = document.getElementById("flashcard-flip-container");
  const flashcardInner = document.getElementById("flashcard-inner");
  let isCardFlipped = false;

  function flipCard() {
    if (!flashcardInner) return;
    isCardFlipped = !isCardFlipped;
    if (isCardFlipped) {
      flashcardInner.classList.add("rotate-y-180");
    } else {
      flashcardInner.classList.remove("rotate-y-180");
    }
  }

  if (flashcardContainer) {
    flashcardContainer.addEventListener("click", (e) => {
      // Don't flip if clicking direct audio buttons or interactive elements
      if (e.target.closest(".audio-btn") || e.target.closest("button")) return;
      flipCard();
    });
  }

  // Spacebar flips card; Arrow keys navigate
  document.addEventListener("keydown", (e) => {
    if (state.currentView !== "flashcards") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.code === "Space") {
      e.preventDefault();
      flipCard();
    } else if (e.code === "ArrowRight") {
      nextCard();
    } else if (e.code === "ArrowLeft") {
      prevCard();
    }
  });

  function getActiveDeck() {
    const decks = Storage.getFlashcardDecks();
    return decks[state.currentDeckKey] || decks["c1-academic"];
  }

  function renderFlashcard() {
    const deck = getActiveDeck();
    const cards = deck.cards;
    if (!cards || cards.length === 0) return;

    if (state.currentCardIndex >= cards.length) state.currentCardIndex = 0;
    if (state.currentCardIndex < 0) state.currentCardIndex = cards.length - 1;

    const card = cards[state.currentCardIndex];

    // Reset flip orientation
    isCardFlipped = false;
    if (flashcardInner) flashcardInner.classList.remove("rotate-y-180");

    // Front elements
    const frontWord = document.getElementById("fc-front-word");
    const frontPhonetic = document.getElementById("fc-front-phonetic");
    const frontPos = document.getElementById("fc-front-pos");
    const frontAudio = document.getElementById("fc-front-audio");

    if (frontWord) frontWord.textContent = card.word;
    if (frontPhonetic) frontPhonetic.textContent = card.phonetic;
    if (frontPos) frontPos.textContent = card.partOfSpeech;
    if (frontAudio) {
      frontAudio.setAttribute("data-pronounce", card.word);
    }

    // Back elements
    const backDef = document.getElementById("fc-back-definition");
    const backEx = document.getElementById("fc-back-example");
    const backSyn = document.getElementById("fc-back-synonyms");
    const backLevel = document.getElementById("fc-back-level");

    if (backDef) backDef.textContent = card.definition;
    if (backEx) backEx.textContent = `"${card.example}"`;
    if (backSyn) backSyn.textContent = card.synonyms ? card.synonyms.join(", ") : "N/A";
    if (backLevel) backLevel.textContent = card.level || "C1";

    // Counter & Progress Bar
    const counter = document.getElementById("flashcard-counter");
    const progBar = document.getElementById("flashcard-progress-bar");
    const deckBadge = document.getElementById("flashcard-deck-badge");

    if (counter) counter.textContent = `Card ${state.currentCardIndex + 1} of ${cards.length}`;
    if (deckBadge) deckBadge.textContent = `${card.level} · ${card.partOfSpeech}`;
    if (progBar) {
      const pct = Math.round(((state.currentCardIndex + 1) / cards.length) * 100);
      progBar.style.width = `${pct}%`;
    }

    // Star icon state
    const starBtn = document.getElementById("fc-star-btn");
    if (starBtn) {
      starBtn.classList.toggle("text-amber-500", !!card.mastered);
    }

    refreshIcons();
  }

  function nextCard() {
    const deck = getActiveDeck();
    state.currentCardIndex = (state.currentCardIndex + 1) % deck.cards.length;
    renderFlashcard();
  }

  function prevCard() {
    const deck = getActiveDeck();
    state.currentCardIndex = (state.currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
    renderFlashcard();
  }

  const fcNextBtn = document.getElementById("fc-next-btn");
  const fcPrevBtn = document.getElementById("fc-prev-btn");
  const fcShuffleBtn = document.getElementById("fc-shuffle-btn");
  const fcDeckSelect = document.getElementById("flashcard-deck-select");
  const fcMasteredBtn = document.getElementById("fc-mastered-btn");
  const fcLearningBtn = document.getElementById("fc-learning-btn");

  if (fcNextBtn) fcNextBtn.addEventListener("click", nextCard);
  if (fcPrevBtn) fcPrevBtn.addEventListener("click", prevCard);

  if (fcShuffleBtn) {
    fcShuffleBtn.addEventListener("click", () => {
      const deck = getActiveDeck();
      deck.cards.sort(() => Math.random() - 0.5);
      state.currentCardIndex = 0;
      renderFlashcard();
      showToast("Cards shuffled!", "info");
    });
  }

  if (fcDeckSelect) {
    fcDeckSelect.addEventListener("change", (e) => {
      state.currentDeckKey = e.target.value;
      state.currentCardIndex = 0;
      renderFlashcard();
    });
  }

  if (fcMasteredBtn) {
    fcMasteredBtn.addEventListener("click", () => {
      const deck = getActiveDeck();
      const card = deck.cards[state.currentCardIndex];
      Storage.updateCardMastery(state.currentDeckKey, card.id, true);
      Storage.addXP(15);
      Storage.recordWordLearned();
      showToast(`Mastered "${card.word}"! +15 XP earned 🌟`, "success");
      updateDashboardMetrics();
      nextCard();
    });
  }

  if (fcLearningBtn) {
    fcLearningBtn.addEventListener("click", () => {
      const deck = getActiveDeck();
      const card = deck.cards[state.currentCardIndex];
      Storage.updateCardMastery(state.currentDeckKey, card.id, false);
      showToast(`Keep practicing "${card.word}". Added to review queue.`, "info");
      nextCard();
    });
  }

  // ========================================================
  // 9. GAMES VIEW & SPEED QUIZ BLITZ DEMO
  // ========================================================
  function renderGameModes() {
    const grid = document.getElementById("all-games-grid");
    if (!grid) return;
    grid.innerHTML = "";

    initialData.gameModes.forEach(mode => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${mode.color} text-white flex items-center justify-center font-bold shadow-md">
              <i data-lucide="${mode.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${mode.lightBg} text-slate-700 dark:text-slate-300">${mode.badge}</span>
              <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">${mode.xpReward}</span>
            </div>
          </div>

          <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">${mode.title}</h3>
          <p class="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">${mode.subtitle}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">${mode.description}</p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium">${mode.activePlayers}</span>
          <button class="launch-quick-quiz-btn px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-all">
            Play Game
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".launch-quick-quiz-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        switchView("games");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Ready for Speed Quiz! Choose an answer below.", "info");
      });
    });
  }

  // Interactive Playable Mini Demo in Games View
  function renderQuizQuestion() {
    const qIndex = state.quizQuestionIndex % initialData.quickQuizQuestions.length;
    const q = initialData.quickQuizQuestions[qIndex];

    const qNum = document.getElementById("quiz-question-number");
    const qText = document.getElementById("quiz-question-text");
    const optContainer = document.getElementById("quiz-options-container");
    const feedbackBox = document.getElementById("quiz-feedback-box");

    if (qNum) qNum.textContent = `Question ${qIndex + 1} of ${initialData.quickQuizQuestions.length}`;
    if (qText) qText.textContent = q.question;
    if (feedbackBox) {
      feedbackBox.classList.add("hidden");
      feedbackBox.className = "mt-4 p-3 rounded-xl hidden text-xs font-semibold";
    }

    if (!optContainer) return;
    optContainer.innerHTML = "";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt-btn p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-slate-50 dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 text-left transition-all flex items-center justify-between";
      btn.innerHTML = `
        <span>${opt}</span>
        <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center">${['A', 'B', 'C', 'D'][idx]}</span>
      `;

      btn.addEventListener("click", () => {
        // Disable other buttons
        optContainer.querySelectorAll("button").forEach(b => b.disabled = true);

        if (idx === q.answerIndex) {
          btn.classList.add("bg-emerald-500", "text-white", "border-emerald-600");
          Storage.addXP(25);
          updateDashboardMetrics();
          showToast("Correct! +25 XP awarded 🚀", "success");

          if (feedbackBox) {
            feedbackBox.classList.remove("hidden");
            feedbackBox.classList.add("bg-emerald-50", "dark:bg-emerald-950/40", "text-emerald-700", "dark:text-emerald-300");
            feedbackBox.innerHTML = `
              <div class="flex items-center justify-between">
                <span>✓ Excellent! ${q.explanation}</span>
                <button id="quiz-next-q-btn" class="ml-2 px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700">Next Question →</button>
              </div>
            `;
            document.getElementById("quiz-next-q-btn")?.addEventListener("click", () => {
              state.quizQuestionIndex++;
              renderQuizQuestion();
            });
          }
        } else {
          btn.classList.add("bg-rose-500", "text-white", "border-rose-600");
          // highlight correct one
          const correctBtn = optContainer.querySelectorAll("button")[q.answerIndex];
          if (correctBtn) correctBtn.classList.add("bg-emerald-100", "dark:bg-emerald-900/50", "border-emerald-500");

          if (feedbackBox) {
            feedbackBox.classList.remove("hidden");
            feedbackBox.classList.add("bg-rose-50", "dark:bg-rose-950/40", "text-rose-700", "dark:text-rose-300");
            feedbackBox.innerHTML = `
              <div class="flex items-center justify-between">
                <span>Not quite. ${q.explanation}</span>
                <button id="quiz-retry-btn" class="ml-2 px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700">Try Next →</button>
              </div>
            `;
            document.getElementById("quiz-retry-btn")?.addEventListener("click", () => {
              state.quizQuestionIndex++;
              renderQuizQuestion();
            });
          }
        }
      });

      optContainer.appendChild(btn);
    });
  }

  // Quick play button on dashboard cards
  document.querySelectorAll(".launch-quick-quiz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchView("games");
    });
  });

  // ========================================================
  // 10. IELTS VOCABULARY VIEW
  // ========================================================
  function renderIeltsTopics() {
    const grid = document.getElementById("ielts-topics-grid");
    if (!grid) return;
    grid.innerHTML = "";

    initialData.ieltsTopics.forEach(topic => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              ${topic.bandTarget} Focus
            </span>
            <span class="text-xs font-bold text-slate-400">${topic.wordCount} Academic Terms</span>
          </div>

          <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">${topic.title}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">${topic.description}</p>

          <!-- Key terms preview -->
          <div class="mb-4">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">High-Score Collocations</span>
            <div class="flex flex-wrap gap-1.5">
              ${topic.keyWords.map(kw => `
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  ${kw}
                </span>
              `).join("")}
            </div>
          </div>

          <!-- Essay Snippet Box -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-6">
            <span class="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider block mb-1">Task 2 Model Sentence</span>
            <p class="text-xs text-slate-600 dark:text-slate-300 italic">"${topic.sampleEssaySnippet}"</p>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button class="practice-ielts-btn w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2" data-topic-id="${topic.id}">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>Practice Band 8+ Set</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    grid.querySelectorAll(".practice-ielts-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.currentDeckKey = "c1-academic";
        switchView("flashcards");
        showToast("Loaded IELTS academic deck into flashcards", "info");
      });
    });
  }

  // ========================================================
  // 11. MY DICTIONARY VIEW (Search, Filter, Add, Star, Delete)
  // ========================================================
  function renderDictionary() {
    const grid = document.getElementById("dictionary-words-grid");
    const emptyState = document.getElementById("dict-empty-state");
    if (!grid) return;

    let words = Storage.getDictionary();

    // Filter by Search Query
    if (state.dictSearchQuery.trim()) {
      const q = state.dictSearchQuery.toLowerCase();
      words = words.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.definition.toLowerCase().includes(q) ||
        (w.tags && w.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Filter by Status Tab
    if (state.dictFilterStatus === "starred") {
      words = words.filter(w => w.isStarred);
    } else if (state.dictFilterStatus === "mastered") {
      words = words.filter(w => w.isMastered);
    } else if (state.dictFilterStatus === "learning") {
      words = words.filter(w => !w.isMastered);
    }

    grid.innerHTML = "";

    if (words.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    } else {
      if (emptyState) emptyState.classList.add("hidden");
    }

    words.forEach(item => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card";
      
      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <button class="audio-btn p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 hover:scale-110 transition-transform" data-pronounce="${item.word}" title="Pronounce">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
            <div>
              <h4 class="font-display font-bold text-lg text-slate-900 dark:text-white">${item.word}</h4>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span class="font-mono">${item.phonetic || ''}</span>
                <span>•</span>
                <span class="italic">${item.partOfSpeech}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/60">
              ${item.level || 'C1'}
            </span>
            <button class="dict-star-btn p-1.5 rounded-lg text-slate-300 hover:text-amber-500 transition-colors ${item.isStarred ? 'text-amber-500' : ''}" data-word-id="${item.id}" title="Star word">
              <i data-lucide="star" class="w-4 h-4 fill-current"></i>
            </button>
            <button class="dict-delete-btn p-1.5 rounded-lg text-slate-300 hover:text-rose-500 transition-colors" data-word-id="${item.id}" title="Remove word">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          ${item.definition}
        </p>

        ${item.example ? `
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic mb-4">
            "${item.example}"
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div class="flex flex-wrap gap-1">
            ${(item.tags || []).map(t => `<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">${t}</span>`).join('')}
          </div>
          <button class="dict-mastered-toggle text-xs font-bold px-2.5 py-1 rounded-lg ${item.isMastered ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}" data-word-id="${item.id}">
            ${item.isMastered ? 'Mastered ✓' : 'Learning'}
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // Star toggle handlers
    grid.querySelectorAll(".dict-star-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.toggleBookmark(id);
        renderDictionary();
        refreshIcons();
      });
    });

    // Mastered toggle handlers
    grid.querySelectorAll(".dict-mastered-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.toggleMastered(id);
        renderDictionary();
        updateDashboardMetrics();
      });
    });

    // Delete word handlers
    grid.querySelectorAll(".dict-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.deleteDictionaryWord(id);
        showToast("Word removed from your dictionary", "info");
        renderDictionary();
        updateDashboardMetrics();
        refreshIcons();
      });
    });

    refreshIcons();
  }

  // Dictionary Search input handler
  const dictSearchInput = document.getElementById("dict-search-input");
  if (dictSearchInput) {
    dictSearchInput.addEventListener("input", (e) => {
      state.dictSearchQuery = e.target.value;
      renderDictionary();
    });
  }

  // Dictionary Status Filters (All / Starred / Mastered / Learning)
  document.querySelectorAll(".dict-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dict-filter-btn").forEach(b => {
        b.className = "dict-filter-btn px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold";
      });
      btn.className = "dict-filter-btn px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold";
      state.dictFilterStatus = btn.getAttribute("data-status") || "all";
      renderDictionary();
    });
  });

  // Modal: Add Custom Word Handlers
  const addWordModal = document.getElementById("add-word-modal");
  const addWordModalBtn = document.getElementById("add-word-modal-btn");
  const closeAddModalBtn = document.getElementById("close-add-modal-btn");
  const cancelAddModalBtn = document.getElementById("cancel-add-modal-btn");
  const addWordForm = document.getElementById("add-word-form");

  function openAddModal() {
    if (addWordModal) addWordModal.classList.remove("hidden");
  }

  function closeAddModal() {
    if (addWordModal) addWordModal.classList.add("hidden");
    if (addWordForm) addWordForm.reset();
  }

  if (addWordModalBtn) addWordModalBtn.addEventListener("click", openAddModal);
  if (closeAddModalBtn) closeAddModalBtn.addEventListener("click", closeAddModal);
  if (cancelAddModalBtn) cancelAddModalBtn.addEventListener("click", closeAddModal);
  if (addWordModal) {
    addWordModal.addEventListener("click", (e) => {
      if (e.target === addWordModal) closeAddModal();
    });
  }

  if (addWordForm) {
    addWordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const word = document.getElementById("modal-word-input").value.trim();
      const phonetic = document.getElementById("modal-phonetic-input").value.trim();
      const pos = document.getElementById("modal-pos-input").value;
      const level = document.getElementById("modal-level-input").value;
      const def = document.getElementById("modal-def-input").value.trim();
      const example = document.getElementById("modal-example-input").value.trim();

      if (!word || !def) {
        showToast("Word and Definition are required", "warning");
        return;
      }

      Storage.addDictionaryWord({
        word,
        phonetic,
        partOfSpeech: pos,
        level,
        definition: def,
        example,
        tags: ["Custom", level]
      });

      Storage.addXP(20);
      showToast(`Added "${word}" to dictionary! +20 XP`, "success");
      updateDashboardMetrics();
      closeAddModal();
      renderDictionary();
    });
  }

  // ========================================================
  // 12. REVIEW VIEW (SPACED REPETITION CONTROLLER)
  // ========================================================
  function renderReviewQueue() {
    const queue = Storage.getReviewQueue();
    const activeBox = document.getElementById("srs-active-box");
    const fullTable = document.getElementById("srs-full-queue-table");

    if (!queue || queue.length === 0) {
      if (activeBox) {
        activeBox.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <i data-lucide="check-circle-2" class="w-8 h-8"></i>
            </div>
            <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white">All Caught Up! 🎉</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">You have reviewed all due words for today. Next review interval unlocks in 4 hours.</p>
          </div>
        `;
      }
      if (fullTable) fullTable.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">No words currently waiting in review queue.</p>`;
      refreshIcons();
      return;
    }

    if (state.currentReviewIndex >= queue.length) state.currentReviewIndex = 0;
    const item = queue[state.currentReviewIndex];

    const cardTitle = document.getElementById("srs-card-title");
    const wordDisplay = document.getElementById("srs-word-display");
    const phoneticDisplay = document.getElementById("srs-phonetic-display");
    const defDisplay = document.getElementById("srs-def-display");
    const audioBtn = document.getElementById("srs-audio-btn");
    const progressText = document.getElementById("srs-card-progress");
    const answerReveal = document.getElementById("srs-answer-reveal");
    const showAnsBtn = document.getElementById("srs-show-answer-btn");

    if (cardTitle) cardTitle.textContent = item.word;
    if (wordDisplay) wordDisplay.textContent = item.word;
    if (phoneticDisplay) phoneticDisplay.textContent = `${item.phonetic} • ${item.partOfSpeech}`;
    if (defDisplay) defDisplay.textContent = item.definition;
    if (progressText) progressText.textContent = `Card ${state.currentReviewIndex + 1} of ${queue.length}`;
    if (audioBtn) audioBtn.setAttribute("data-pronounce", item.word);

    // Hide answer initially
    if (answerReveal) answerReveal.classList.add("hidden");
    if (showAnsBtn) {
      showAnsBtn.classList.remove("hidden");
      showAnsBtn.onclick = () => {
        answerReveal.classList.remove("hidden");
        showAnsBtn.classList.add("hidden");
      };
    }

    // Attach SRS Rating Buttons
    document.querySelectorAll(".srs-rate-btn").forEach(btn => {
      btn.onclick = () => {
        const rating = btn.getAttribute("data-rating");
        const res = Storage.completeReviewCard(item.id, rating);
        showToast(`Reviewed "${item.word}" (${rating}) · +${res.xpEarned} XP!`, "success");
        updateDashboardMetrics();
        renderReviewQueue();
      };
    });

    // Populate full queue table
    if (fullTable) {
      fullTable.innerHTML = "";
      queue.forEach(qItem => {
        const row = document.createElement("div");
        row.className = "py-3 flex items-center justify-between text-xs";
        row.innerHTML = `
          <div class="flex items-center gap-3">
            <button class="audio-btn p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800" data-pronounce="${qItem.word}">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
            <div>
              <span class="font-bold text-slate-900 dark:text-white">${qItem.word}</span>
              <span class="text-slate-400 block">${qItem.partOfSpeech} · Reviewed ${qItem.timesReviewed || 1}x</span>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-slate-400">Retention: ${qItem.retentionScore}%</span>
            <span class="font-bold px-2.5 py-1 rounded-full ${qItem.urgency === 'urgent' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700'}">
              ${qItem.dueInterval}
            </span>
          </div>
        `;
        fullTable.appendChild(row);
      });
    }

    refreshIcons();
  }

  // ========================================================
  // 13. STATISTICS VIEW & HEATMAP
  // ========================================================
  function renderStatistics() {
    const heatmap = document.getElementById("stats-heatmap-grid");
    if (!heatmap) return;
    heatmap.innerHTML = "";

    // Generate 12 columns x 7 rows = 84 days of mock activity
    const levels = ["bg-slate-200 dark:bg-slate-700", "bg-indigo-200 dark:bg-indigo-900", "bg-indigo-400 dark:bg-indigo-700", "bg-indigo-600 dark:bg-indigo-500"];
    
    for (let c = 0; c < 12; c++) {
      const col = document.createElement("div");
      col.className = "flex flex-col gap-1.5";
      for (let r = 0; r < 7; r++) {
        const cell = document.createElement("div");
        const lvlIdx = Math.floor(Math.random() * levels.length);
        cell.className = `w-4 h-4 rounded-xs ${levels[lvlIdx]} transition-transform hover:scale-125`;
        cell.title = `Day ${c * 7 + r + 1}: ${lvlIdx * 8 + 4} words studied`;
        col.appendChild(cell);
      }
      heatmap.appendChild(col);
    }
  }

  // ========================================================
  // 14. SETTINGS VIEW
  // ========================================================
  const voiceAccentSelect = document.getElementById("settings-voice-accent");
  const voiceSpeedSelect = document.getElementById("settings-voice-speed");
  const dailyGoalSelect = document.getElementById("settings-daily-goal");
  const testAudioBtn = document.getElementById("test-audio-settings-btn");
  const dangerResetBtn = document.getElementById("danger-reset-btn");

  if (voiceAccentSelect) {
    const s = Storage.getSettings();
    voiceAccentSelect.value = s.accentVoice || "en-US";
    voiceAccentSelect.addEventListener("change", (e) => {
      const current = Storage.getSettings();
      current.accentVoice = e.target.value;
      Storage.saveSettings(current);
      showToast("Voice accent preference saved", "info");
    });
  }

  if (voiceSpeedSelect) {
    const s = Storage.getSettings();
    voiceSpeedSelect.value = s.playbackSpeed || 1.0;
    voiceSpeedSelect.addEventListener("change", (e) => {
      const current = Storage.getSettings();
      current.playbackSpeed = parseFloat(e.target.value);
      Storage.saveSettings(current);
      showToast("Playback speed updated", "info");
    });
  }

  if (dailyGoalSelect) {
    const user = Storage.getUser();
    dailyGoalSelect.value = user.dailyGoal || 20;
    dailyGoalSelect.addEventListener("change", (e) => {
      const newGoal = parseInt(e.target.value, 10);
      Storage.updateUser({ dailyGoal: newGoal });
      updateDashboardMetrics();
      showToast(`Daily learning target updated to ${newGoal} words`, "success");
    });
  }

  if (testAudioBtn) {
    testAudioBtn.addEventListener("click", () => {
      playAudio("Serendipity. The occurrence of events by chance in a happy or beneficial way.", testAudioBtn);
    });
  }

  if (dangerResetBtn) {
    dangerResetBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all data and start fresh?")) {
        Storage.resetAll();
      }
    });
  }

  const resetProgressBtn = document.getElementById("reset-progress-btn");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      if (confirm("Reset demo data to initial state?")) {
        Storage.resetAll();
      }
    });
  }

  // ========================================================
  // 15. GLOBAL SPOTLIGHT QUICK SEARCH (CTRL + K)
  // ========================================================
  const searchModal = document.getElementById("quick-search-modal");
  const searchTrigger = document.getElementById("global-search-trigger");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const searchInput = document.getElementById("spotlight-search-input");
  const searchResults = document.getElementById("spotlight-results");

  function openSearchModal() {
    if (searchModal) {
      searchModal.classList.remove("hidden");
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
        renderSearchResults("");
      }
    }
  }

  function closeSearchModal() {
    if (searchModal) searchModal.classList.add("hidden");
  }

  if (searchTrigger) searchTrigger.addEventListener("click", openSearchModal);
  if (mobileSearchBtn) mobileSearchBtn.addEventListener("click", openSearchModal);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearchModal();
    } else if (e.key === "Escape" && searchModal && !searchModal.classList.contains("hidden")) {
      closeSearchModal();
    }
  });

  if (searchModal) {
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    searchResults.innerHTML = "";

    const q = query.toLowerCase().trim();
    const dict = Storage.getDictionary();
    const matched = dict.filter(item => 
      !q || item.word.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matched.length === 0) {
      searchResults.innerHTML = `<div class="p-4 text-xs text-slate-400 text-center">No words found matching "${query}"</div>`;
      return;
    }

    matched.forEach(item => {
      const row = document.createElement("div");
      row.className = "p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <i data-lucide="book" class="w-4 h-4 text-brand-500"></i>
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white block">${item.word}</span>
            <span class="text-[11px] text-slate-400 line-clamp-1">${item.definition}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">${item.level || 'C1'}</span>
      `;

      row.addEventListener("click", () => {
        closeSearchModal();
        switchView("dictionary");
        state.dictSearchQuery = item.word;
        if (dictSearchInput) dictSearchInput.value = item.word;
        renderDictionary();
      });

      searchResults.appendChild(row);
    });

    refreshIcons();
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderSearchResults(e.target.value);
    });
  }

  // ========================================================
  // 16. NOTIFICATIONS & USER MENUS
  // ========================================================
  const notifBtn = document.getElementById("notifications-btn");
  const notifPopover = document.getElementById("notifications-popover");
  const userMenuBtn = document.getElementById("user-menu-btn");
  const userMenuPopover = document.getElementById("user-menu-popover");

  function togglePopover(popover) {
    if (!popover) return;
    const isHidden = popover.classList.contains("hidden");
    // Close other popovers first
    if (notifPopover) notifPopover.classList.add("hidden");
    if (userMenuPopover) userMenuPopover.classList.add("hidden");

    if (isHidden) {
      popover.classList.remove("hidden");
    }
  }

  if (notifBtn) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePopover(notifPopover);
      renderNotifications();
    });
  }

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePopover(userMenuPopover);
    });
  }

  // Close menus on click outside
  document.addEventListener("click", () => {
    if (notifPopover) notifPopover.classList.add("hidden");
    if (userMenuPopover) userMenuPopover.classList.add("hidden");
  });

  function renderNotifications() {
    const list = document.getElementById("notifications-list");
    if (!list) return;
    list.innerHTML = "";

    initialData.notifications.forEach(n => {
      const item = document.createElement("div");
      item.className = "py-3 flex items-start gap-3";
      item.innerHTML = `
        <div class="w-2 h-2 rounded-full ${n.read ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-500'} mt-1.5 flex-shrink-0"></div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-slate-800 dark:text-white">${n.title}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${n.desc}</div>
          <span class="text-[10px] text-slate-400 mt-1 block">${n.time}</span>
        </div>
      `;
      list.appendChild(item);
    });
  }

  const markNotifsRead = document.getElementById("mark-notifs-read");
  if (markNotifsRead) {
    markNotifsRead.addEventListener("click", (e) => {
      e.stopPropagation();
      initialData.notifications.forEach(n => n.read = true);
      renderNotifications();
      showToast("All notifications marked as read", "info");
    });
  }

  // ========================================================
  // 17. ICON REFRESH HELPER
  // ========================================================
  function refreshIcons() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // ========================================================
  // 18. APP INITIALIZATION
  // ========================================================
  function initApp() {
    buildMobileDrawerItems();
    updateDashboardMetrics();
    renderWeeklyChart();
    initTodayWord();
    renderDashboardReviewPreview();
    renderDashboardAchievements();
    renderLearnUnits();
    renderFlashcard();
    renderGameModes();
    renderQuizQuestion();
    renderIeltsTopics();
    renderDictionary();
    renderReviewQueue();
    renderStatistics();

    // Check initial hash route or default to dashboard
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash && viewTitles[initialHash]) {
      switchView(initialHash);
    } else {
      switchView("dashboard");
    }

    refreshIcons();
  }

  initApp();
});
