/**
 * WORDIFY - English Vocabulary Learning Platform
 * Core Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    currentView: "dashboard",
    selectedLevel: Storage.getSelectedLevel() || "all",
    flashcardCategory: "all",
    flashcardStatus: "all",
    flashcardCards: [],
    currentCardIndex: 0,
    currentReviewIndex: 0,
    quizQuestionIndex: 0,
    quizScore: 0,
    dictSearchQuery: "",
    dictLevel: "all",
    dictCategory: "all",
    dictStatus: "all",
    learnFilterLevel: "all",
    learnCategory: "all",
    voiceAccent: Storage.getSettings().accentVoice || "en-US",
    voiceSpeed: parseFloat(Storage.getSettings().playbackSpeed) || 1.0,
    lastSpokenWord: "Serendipity"
  };

  // ========================================================
  // 1. ROUTING & VIEW CONTROLLER
  // ========================================================
  const viewTitles = {
    dashboard: { title: "Dashboard", subtitle: "Welcome back, Alex · Let's master 5 more words today" },
    learn: { title: "Learn Words", subtitle: "Systematic CEFR curriculum with General English & IELTS vocabulary" },
    flashcards: { title: "Flashcards", subtitle: "Active recall study sets with illustrations, Uzbek meanings & native speech" },
    games: { title: "Games & Arena", subtitle: "Gamified vocabulary drills to strengthen recall speed" },
    ielts: { title: "IELTS Vocabulary", subtitle: "Academic Band 8.0 - 9.0 Lexicon & Collocations for Task 2" },
    dictionary: { title: "My Dictionary", subtitle: "Bilingual English-Uzbek word bank with real-time search & filters" },
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
      loadFlashcardDeck();
    } else if (viewName === "dictionary") {
      renderDictionary();
    } else if (viewName === "review") {
      renderReviewQueue();
    } else if (viewName === "learn") {
      renderLearnUnits();
    } else if (viewName === "games") {
      if (typeof GamesEngine !== "undefined") {
        GamesEngine.init();
      }
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

  function buildMobileDrawerItems() {
    if (!mobileNavItems) return;
    mobileNavItems.innerHTML = "";
    
    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "learn", label: "Learn Words", icon: "book-open", badge: "A1-C1" },
      { id: "flashcards", label: "Flashcards", icon: "layers" },
      { id: "games", label: "Games", icon: "gamepad-2", badge: "Play" },
      { id: "ielts", label: "IELTS Vocabulary", icon: "award", badge: "Band 8+" },
      { id: "dictionary", label: "My Dictionary", icon: "bookmark" },
      { id: "review", label: "Review", icon: "rotate-ccw", badge: "SRS" },
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
  // 4. AUDIO & SPEECH SYNTHESIS ENGINE (Web Speech API)
  // ========================================================
  let availableVoices = [];

  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function playAudio(text, btnElement = null) {
    if (!('speechSynthesis' in window)) {
      showToast("Speech synthesis not supported in this browser", "warning");
      return;
    }

    if (!text) return;
    state.lastSpokenWord = text;

    // Cancel any active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.voiceSpeed || 1.0;
    utterance.pitch = 1.0;

    // Pick British or American voice based on user preference
    const targetLang = state.voiceAccent || "en-US";
    utterance.lang = targetLang;

    if (availableVoices.length > 0) {
      let matchedVoice = null;
      if (targetLang === "en-GB") {
        matchedVoice = availableVoices.find(v => v.lang === "en-GB" || v.name.toLowerCase().includes("british") || v.name.toLowerCase().includes("uk"));
      } else {
        matchedVoice = availableVoices.find(v => v.lang === "en-US" || v.name.toLowerCase().includes("united states") || v.name.toLowerCase().includes("us"));
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    if (btnElement) {
      btnElement.classList.add("audio-playing");
      utterance.onend = () => btnElement.classList.remove("audio-playing");
      utterance.onerror = () => btnElement.classList.remove("audio-playing");
    }

    window.speechSynthesis.speak(utterance);
  }

  function repeatLastAudio() {
    if (state.lastSpokenWord) {
      playAudio(state.lastSpokenWord);
      showToast(`Repeating: "${state.lastSpokenWord}"`, "info");
    }
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
    window.updateDashboardMetrics = updateDashboardMetrics;
    const user = Storage.getUser();
    const vocabList = Storage.getAllVocabulary();
    const masteredCount = vocabList.filter(w => w.isMastered).length;
    const learningCount = vocabList.length - masteredCount;

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
    if (mTotal) mTotal.textContent = vocabList.length;

    // Dictionary count badge
    const dictCount = document.getElementById("sidebar-dict-count");
    if (dictCount) {
      dictCount.textContent = vocabList.length;
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
          <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg whitespace-nowrap z-20">
            ${item.words} words · ${item.xp} XP
          </div>
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
    if (posEl) posEl.textContent = `${today.partOfSpeech} · Uzbek: ${today.uzbek}`;
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
        Storage.toggleFavorite("v-c1-22");
        showToast(`Saved "${today.word}" to your Starred vocabulary!`, "success");
        if (saveText) saveText.textContent = "Saved in Dictionary ✓";
        saveBtn.classList.add("bg-emerald-600");
        saveBtn.classList.remove("bg-brand-600");
        updateDashboardMetrics();
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
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 dark:text-white">${item.word}</span>
              <span class="text-[10px] text-brand-600 font-semibold">(${item.uzbek})</span>
            </div>
            <span class="text-[10px] text-slate-400">${item.level} · ${item.category}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${item.urgency === 'urgent' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700' : 'bg-indigo-100 dark:bg-indigo-950/60 text-brand-700'}">
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
  // 7. LEARN WORDS VIEW (CEFR Levels & Categories)
  // ========================================================
  function renderLearnUnits() {
    const grid = document.getElementById("learning-units-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const allVocab = Storage.getAllVocabulary();

    // Filter units by CEFR level & category
    const filteredUnits = initialData.learningUnits.filter(unit => {
      const matchesLevel = state.learnFilterLevel === "all" || unit.level === state.learnFilterLevel;
      const matchesCat = state.learnCategory === "all" || unit.category.toLowerCase().includes(state.learnCategory.toLowerCase());
      return matchesLevel && matchesCat;
    });

    if (filteredUnits.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <i data-lucide="book-open" class="w-10 h-10 text-brand-500 mx-auto mb-3"></i>
          <h4 class="font-bold text-base text-slate-900 dark:text-white">No units match the selected filters</h4>
          <p class="text-xs text-slate-400 mt-1">Try switching to "All Levels" or reset category filters.</p>
        </div>
      `;
      refreshIcons();
      return;
    }

    filteredUnits.forEach(unit => {
      // Calculate real counts from master vocabulary
      const unitWords = allVocab.filter(w => w.level === unit.level);
      const masteredInUnit = unitWords.filter(w => w.isMastered).length;
      const totalInUnit = unitWords.length || unit.totalWords;
      const progressPct = totalInUnit > 0 ? Math.round((masteredInUnit / totalInUnit) * 100) : 0;
      const isCompleted = progressPct === 100;

      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";
      
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <i data-lucide="${unit.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">${unit.level}</span>
              ${isCompleted ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">Mastered ✓</span>' : ''}
            </div>
          </div>

          <h3 class="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">${unit.title}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">${unit.description}</p>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs font-bold mb-2">
            <span class="text-slate-400">${masteredInUnit} / ${totalInUnit} Words Mastered</span>
            <span class="text-brand-600 dark:text-brand-400 font-extrabold">${progressPct}%</span>
          </div>

          <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
            <div class="h-full bg-gradient-to-r from-brand-500 to-accent-purple rounded-full progress-pill" style="width: ${progressPct}%"></div>
          </div>

          <div class="flex items-center gap-2">
            <button class="study-unit-btn flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2" data-unit-level="${unit.level}">
              <i data-lucide="layers" class="w-3.5 h-3.5"></i>
              <span>Study ${unit.level} Flashcards</span>
            </button>
            <button class="preview-unit-words-btn p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors" data-unit-level="${unit.level}" title="Browse words in Dictionary">
              <i data-lucide="book-open" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach click listeners to Study buttons
    grid.querySelectorAll(".study-unit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lvl = btn.getAttribute("data-unit-level");
        state.selectedLevel = lvl;
        Storage.setSelectedLevel(lvl);
        switchView("flashcards");
        showToast(`Loaded ${lvl} vocabulary flashcards`, "info");
      });
    });

    grid.querySelectorAll(".preview-unit-words-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lvl = btn.getAttribute("data-unit-level");
        state.dictLevel = lvl;
        switchView("dictionary");
        showToast(`Filtered dictionary by CEFR level ${lvl}`, "info");
      });
    });

    refreshIcons();
  }

  // Learn level filter tabs
  document.querySelectorAll(".learn-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".learn-filter-btn").forEach(b => {
        b.className = "learn-filter-btn px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white";
      });
      btn.className = "learn-filter-btn px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] text-brand-600 dark:text-brand-400 shadow-xs font-bold";
      state.learnFilterLevel = btn.getAttribute("data-filter") || "all";
      renderLearnUnits();
    });
  });

  const learnCategorySelect = document.getElementById("learn-category-select");
  if (learnCategorySelect) {
    learnCategorySelect.addEventListener("change", (e) => {
      state.learnCategory = e.target.value;
      renderLearnUnits();
    });
  }

  // ========================================================
  // 8. FLASHCARDS CONTROLLER (3D Flip, Audio, Images & Rating)
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
      if (e.target.closest(".audio-btn") || e.target.closest("button") || e.target.closest("select")) return;
      flipCard();
    });
  }

  // Spacebar flips card; Arrow keys navigate; 'R' repeats audio
  document.addEventListener("keydown", (e) => {
    if (state.currentView !== "flashcards") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

    if (e.code === "Space") {
      e.preventDefault();
      flipCard();
    } else if (e.code === "ArrowRight") {
      nextCard();
    } else if (e.code === "ArrowLeft") {
      prevCard();
    } else if (e.key.toLowerCase() === "r") {
      repeatLastAudio();
    }
  });

  function loadFlashcardDeck() {
    state.flashcardCards = Storage.getFilteredVocabulary({
      level: state.selectedLevel,
      category: state.flashcardCategory,
      status: state.flashcardStatus
    });

    if (state.currentCardIndex >= state.flashcardCards.length) {
      state.currentCardIndex = 0;
    }

    // Sync CEFR chips active state
    document.querySelectorAll(".fc-level-chip").forEach(chip => {
      if (chip.getAttribute("data-level") === state.selectedLevel) {
        chip.className = "fc-level-chip px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-xs";
      } else {
        chip.className = "fc-level-chip px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200";
      }
    });

    // Sync Category & Status Selects
    const catSelect = document.getElementById("fc-category-select");
    const statusSelect = document.getElementById("fc-status-select");
    if (catSelect) catSelect.value = state.flashcardCategory;
    if (statusSelect) statusSelect.value = state.flashcardStatus;

    renderFlashcard();
  }

  function renderFlashcard() {
    const cards = state.flashcardCards;
    const counter = document.getElementById("flashcard-counter");
    const progBar = document.getElementById("flashcard-progress-bar");
    const deckBadge = document.getElementById("flashcard-deck-badge");

    // Reset flip orientation
    isCardFlipped = false;
    if (flashcardInner) flashcardInner.classList.remove("rotate-y-180");

    if (!cards || cards.length === 0) {
      if (counter) counter.textContent = "0 Cards";
      if (progBar) progBar.style.width = "0%";
      if (deckBadge) deckBadge.textContent = "Empty Selection";

      const frontWord = document.getElementById("fc-front-word");
      const frontPhonetic = document.getElementById("fc-front-phonetic");
      const frontPos = document.getElementById("fc-front-pos");
      const frontImg = document.getElementById("fc-front-img");
      const fallbackBox = document.getElementById("fc-front-img-fallback");

      if (frontWord) frontWord.textContent = "No Cards Match Filter";
      if (frontPhonetic) frontPhonetic.textContent = "Select 'All Levels' or change category";
      if (frontPos) frontPos.textContent = "";
      if (frontImg) frontImg.style.display = "none";
      if (fallbackBox) fallbackBox.classList.remove("hidden");
      return;
    }

    if (state.currentCardIndex >= cards.length) state.currentCardIndex = 0;
    if (state.currentCardIndex < 0) state.currentCardIndex = cards.length - 1;

    const card = cards[state.currentCardIndex];
    state.lastSpokenWord = card.word;

    // Front elements
    const frontWord = document.getElementById("fc-front-word");
    const frontPhonetic = document.getElementById("fc-front-phonetic");
    const frontPos = document.getElementById("fc-front-pos");
    const frontAudio = document.getElementById("fc-front-audio");
    const frontImg = document.getElementById("fc-front-img");
    const fallbackBox = document.getElementById("fc-front-img-fallback");
    const frontLevelBadge = document.getElementById("fc-front-level-badge");
    const frontCategoryBadge = document.getElementById("fc-front-category-badge");
    const diffIndicator = document.getElementById("fc-difficult-indicator");
    const knownIndicator = document.getElementById("fc-known-indicator");
    const starBtn = document.getElementById("fc-star-btn");

    if (frontWord) frontWord.textContent = card.word;
    if (frontPhonetic) frontPhonetic.textContent = card.phonetic;
    if (frontPos) frontPos.textContent = card.partOfSpeech;
    if (frontLevelBadge) frontLevelBadge.textContent = card.level;
    if (frontCategoryBadge) frontCategoryBadge.textContent = card.category;
    if (frontAudio) frontAudio.setAttribute("data-pronounce", card.word);

    // Front Image handling with graceful fallback
    if (frontImg && fallbackBox) {
      if (card.image) {
        frontImg.src = card.image;
        frontImg.alt = `${card.word} illustration`;
        frontImg.style.display = "block";
        fallbackBox.classList.add("hidden");
      } else {
        frontImg.style.display = "none";
        fallbackBox.classList.remove("hidden");
      }
    }

    // Status indicators
    if (diffIndicator) diffIndicator.classList.toggle("hidden", !card.isDifficult);
    if (knownIndicator) knownIndicator.classList.toggle("hidden", !card.isMastered);
    if (starBtn) {
      starBtn.classList.toggle("text-amber-500", !!card.isFavorite);
      starBtn.classList.toggle("text-slate-400", !card.isFavorite);
    }

    // Back elements
    const backUzbek = document.getElementById("fc-back-uzbek");
    const backDef = document.getElementById("fc-back-definition");
    const backEx = document.getElementById("fc-back-example");
    const backUzbekSent = document.getElementById("fc-back-uzbek-sentence");
    const backSyn = document.getElementById("fc-back-synonyms");
    const backLevel = document.getElementById("fc-back-level");
    const backPos = document.getElementById("fc-back-pos");
    const backAudio = document.getElementById("fc-back-audio");

    if (backUzbek) backUzbek.textContent = card.uzbek;
    if (backDef) backDef.textContent = card.definition;
    if (backEx) backEx.textContent = `"${card.example}"`;
    if (backUzbekSent) backUzbekSent.textContent = `"${card.uzbekSentence || ''}"`;
    if (backSyn) backSyn.textContent = card.synonyms && card.synonyms.length > 0 ? card.synonyms.join(", ") : "N/A";
    if (backLevel) backLevel.textContent = card.level;
    if (backPos) backPos.textContent = card.partOfSpeech;
    if (backAudio) backAudio.setAttribute("data-pronounce", card.word);

    // Counter & Progress Bar
    if (counter) counter.textContent = `Card ${state.currentCardIndex + 1} of ${cards.length}`;
    if (deckBadge) deckBadge.textContent = `${state.selectedLevel === 'all' ? 'All Levels' : state.selectedLevel} · ${card.category}`;
    if (progBar) {
      const pct = Math.round(((state.currentCardIndex + 1) / cards.length) * 100);
      progBar.style.width = `${pct}%`;
    }

    refreshIcons();
  }

  function nextCard() {
    if (state.flashcardCards.length === 0) return;
    state.currentCardIndex = (state.currentCardIndex + 1) % state.flashcardCards.length;
    renderFlashcard();
  }

  function prevCard() {
    if (state.flashcardCards.length === 0) return;
    state.currentCardIndex = (state.currentCardIndex - 1 + state.flashcardCards.length) % state.flashcardCards.length;
    renderFlashcard();
  }

  // Flashcard Control Listeners
  const fcNextBtn = document.getElementById("fc-next-btn");
  const fcPrevBtn = document.getElementById("fc-prev-btn");
  const fcShuffleBtn = document.getElementById("fc-shuffle-btn");
  const fcStarBtn = document.getElementById("fc-star-btn");
  const fcDifficultBtn = document.getElementById("fc-difficult-btn");
  const fcLearningBtn = document.getElementById("fc-learning-btn");
  const fcMasteredBtn = document.getElementById("fc-mastered-btn");
  const fcRepeatAudio = document.getElementById("fc-repeat-audio");

  if (fcNextBtn) fcNextBtn.addEventListener("click", nextCard);
  if (fcPrevBtn) fcPrevBtn.addEventListener("click", prevCard);

  if (fcShuffleBtn) {
    fcShuffleBtn.addEventListener("click", () => {
      state.flashcardCards.sort(() => Math.random() - 0.5);
      state.currentCardIndex = 0;
      renderFlashcard();
      showToast("Deck shuffled randomly!", "info");
    });
  }

  if (fcStarBtn) {
    fcStarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = state.flashcardCards[state.currentCardIndex];
      if (card) {
        const isFav = Storage.toggleFavorite(card.id);
        card.isFavorite = isFav;
        renderFlashcard();
        showToast(isFav ? `Starred "${card.word}" ⭐` : `Removed "${card.word}" from favorites`, "info");
      }
    });
  }

  if (fcDifficultBtn) {
    fcDifficultBtn.addEventListener("click", () => {
      const card = state.flashcardCards[state.currentCardIndex];
      if (card) {
        Storage.markDifficult(card.id, true);
        card.isDifficult = true;
        card.isMastered = false;
        showToast(`Marked "${card.word}" as Difficult ⚠️ Added to review queue.`, "warning");
        updateDashboardMetrics();
        nextCard();
      }
    });
  }

  if (fcLearningBtn) {
    fcLearningBtn.addEventListener("click", () => {
      const card = state.flashcardCards[state.currentCardIndex];
      if (card) {
        showToast(`Keep practicing "${card.word}".`, "info");
        nextCard();
      }
    });
  }

  if (fcMasteredBtn) {
    fcMasteredBtn.addEventListener("click", () => {
      const card = state.flashcardCards[state.currentCardIndex];
      if (card) {
        Storage.markKnown(card.id, true);
        card.isMastered = true;
        card.isDifficult = false;
        showToast(`Mastered "${card.word}" (${card.uzbek})! +15 XP earned 🌟`, "success");
        updateDashboardMetrics();
        nextCard();
      }
    });
  }

  if (fcRepeatAudio) {
    fcRepeatAudio.addEventListener("click", (e) => {
      e.stopPropagation();
      repeatLastAudio();
    });
  }

  // CEFR Level Chips Click Listeners
  document.querySelectorAll(".fc-level-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const level = chip.getAttribute("data-level");
      state.selectedLevel = level;
      Storage.setSelectedLevel(level);
      state.currentCardIndex = 0;
      loadFlashcardDeck();
    });
  });

  // Category & Status filter listeners in Flashcards
  const fcCatSelect = document.getElementById("fc-category-select");
  const fcStatSelect = document.getElementById("fc-status-select");

  if (fcCatSelect) {
    fcCatSelect.addEventListener("change", (e) => {
      state.flashcardCategory = e.target.value;
      state.currentCardIndex = 0;
      loadFlashcardDeck();
    });
  }

  if (fcStatSelect) {
    fcStatSelect.addEventListener("change", (e) => {
      state.flashcardStatus = e.target.value;
      state.currentCardIndex = 0;
      loadFlashcardDeck();
    });
  }

  // Voice Accent Switcher (American vs British)
  const fcVoiceUs = document.getElementById("fc-voice-us");
  const fcVoiceUk = document.getElementById("fc-voice-uk");
  const fcSpeedSelect = document.getElementById("fc-speed-select");

  function setVoiceAccent(accent) {
    state.voiceAccent = accent;
    const settings = Storage.getSettings();
    settings.accentVoice = accent;
    Storage.saveSettings(settings);

    if (fcVoiceUs && fcVoiceUk) {
      if (accent === "en-US") {
        fcVoiceUs.className = "fc-voice-btn px-2.5 py-1 rounded-lg bg-white dark:bg-[#111827] text-brand-600 dark:text-brand-400 shadow-xs font-bold";
        fcVoiceUk.className = "fc-voice-btn px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white";
        showToast("Pronunciation set to American English 🇺🇸", "info");
      } else {
        fcVoiceUk.className = "fc-voice-btn px-2.5 py-1 rounded-lg bg-white dark:bg-[#111827] text-brand-600 dark:text-brand-400 shadow-xs font-bold";
        fcVoiceUs.className = "fc-voice-btn px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white";
        showToast("Pronunciation set to British English 🇬🇧", "info");
      }
    }
  }

  if (fcVoiceUs) fcVoiceUs.addEventListener("click", () => setVoiceAccent("en-US"));
  if (fcVoiceUk) fcVoiceUk.addEventListener("click", () => setVoiceAccent("en-GB"));

  if (fcSpeedSelect) {
    fcSpeedSelect.value = state.voiceSpeed.toString();
    fcSpeedSelect.addEventListener("change", (e) => {
      state.voiceSpeed = parseFloat(e.target.value);
      const settings = Storage.getSettings();
      settings.playbackSpeed = state.voiceSpeed;
      Storage.saveSettings(settings);
      showToast(`Playback speed set to ${state.voiceSpeed}x`, "info");
    });
  }

  // ========================================================
  // 9. MY DICTIONARY VIEW (Dual-language search & Filtering)
  // ========================================================
  function renderDictionary() {
    const grid = document.getElementById("dictionary-words-grid");
    const emptyState = document.getElementById("dict-empty-state");
    const totalCountEl = document.getElementById("dict-total-count");
    if (!grid) return;

    const words = Storage.getFilteredVocabulary({
      search: state.dictSearchQuery,
      level: state.dictLevel,
      category: state.dictCategory,
      status: state.dictStatus
    });

    if (totalCountEl) totalCountEl.textContent = Storage.getAllVocabulary().length;

    grid.innerHTML = "";

    if (words.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    } else {
      if (emptyState) emptyState.classList.add("hidden");
    }

    words.forEach(item => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";
      
      card.innerHTML = `
        <div>
          <!-- Top Row: Thumbnail + Word + Translation -->
          <div class="flex items-start gap-3.5 mb-3">
            <div class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
              ${item.image ? `
                <img src="${item.image}" alt="${item.word}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
                <div class="hidden text-brand-600 font-bold text-xs"><i data-lucide="book" class="w-5 h-5"></i></div>
              ` : `
                <div class="text-brand-600 font-bold text-xs"><i data-lucide="book" class="w-5 h-5"></i></div>
              `}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="font-display font-extrabold text-lg text-slate-900 dark:text-white truncate">${item.word}</h4>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                    ${item.level}
                  </span>
                  <button class="dict-star-btn p-1.5 rounded-lg text-slate-300 hover:text-amber-500 transition-colors ${item.isFavorite ? 'text-amber-500' : ''}" data-word-id="${item.id}" title="Star word">
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                  </button>
                  <button class="dict-diff-btn p-1.5 rounded-lg text-slate-300 hover:text-amber-600 transition-colors ${item.isDifficult ? 'text-amber-500' : ''}" data-word-id="${item.id}" title="Toggle Difficult">
                    <i data-lucide="alert-triangle" class="w-4 h-4 fill-current"></i>
                  </button>
                </div>
              </div>

              <!-- Uzbek translation highlight -->
              <div class="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                🇺🇿 ${item.uzbek}
              </div>

              <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span class="font-mono">${item.phonetic || ''}</span>
                <span>•</span>
                <span class="italic">${item.partOfSpeech}</span>
                <span>•</span>
                <span class="font-semibold text-slate-500 dark:text-slate-400">${item.category}</span>
              </div>
            </div>
          </div>

          <!-- English Definition -->
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            ${item.definition}
          </p>

          <!-- Contextual Example with Uzbek sentence translation -->
          ${item.example ? `
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs mb-3 space-y-1">
              <p class="text-slate-700 dark:text-slate-200 italic">"${item.example}"</p>
              ${item.uzbekSentence ? `
                <p class="text-slate-500 dark:text-slate-400 font-medium">🇺🇿 "${item.uzbekSentence}"</p>
              ` : ''}
            </div>
          ` : ''}

          <!-- Synonyms -->
          ${item.synonyms && item.synonyms.length > 0 ? `
            <div class="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
              <span class="font-semibold text-slate-400">Synonyms:</span>
              ${item.synonyms.map(s => `<span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${s}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button class="audio-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 hover:bg-indigo-100 font-bold transition-colors" data-pronounce="${item.word}" title="Listen">
            <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
            <span>Pronounce</span>
          </button>

          <div class="flex items-center gap-2">
            <button class="dict-mastered-toggle text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${item.isMastered ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}" data-word-id="${item.id}">
              ${item.isMastered ? 'Mastered ✓' : 'Mark Known'}
            </button>
            <button class="dict-delete-btn p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" data-word-id="${item.id}" title="Remove word">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Star toggle handlers
    grid.querySelectorAll(".dict-star-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.toggleFavorite(id);
        renderDictionary();
        refreshIcons();
      });
    });

    // Difficult toggle handlers
    grid.querySelectorAll(".dict-diff-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.toggleDifficult(id);
        renderDictionary();
        updateDashboardMetrics();
        refreshIcons();
      });
    });

    // Mastered toggle handlers
    grid.querySelectorAll(".dict-mastered-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        const word = Storage.getVocabularyWord(id);
        if (word) {
          Storage.markKnown(id, !word.isMastered);
          renderDictionary();
          updateDashboardMetrics();
        }
      });
    });

    // Delete word handlers
    grid.querySelectorAll(".dict-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-word-id");
        Storage.deleteVocabularyWord(id);
        showToast("Word removed from your dictionary", "info");
        renderDictionary();
        updateDashboardMetrics();
      });
    });

    refreshIcons();
  }

  // Dictionary Search input handler (dual language English/Uzbek)
  const dictSearchInput = document.getElementById("dict-search-input");
  if (dictSearchInput) {
    dictSearchInput.addEventListener("input", (e) => {
      state.dictSearchQuery = e.target.value;
      renderDictionary();
    });
  }

  // Dictionary CEFR level filter buttons
  document.querySelectorAll(".dict-level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dict-level-btn").forEach(b => {
        b.className = "dict-level-btn px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200";
      });
      btn.className = "dict-level-btn px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-bold shadow-xs";
      state.dictLevel = btn.getAttribute("data-level") || "all";
      renderDictionary();
    });
  });

  // Dictionary Category filter dropdown
  const dictCategoryFilter = document.getElementById("dict-category-filter");
  if (dictCategoryFilter) {
    dictCategoryFilter.addEventListener("change", (e) => {
      state.dictCategory = e.target.value;
      renderDictionary();
    });
  }

  // Dictionary Status filter chips
  document.querySelectorAll(".dict-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dict-filter-btn").forEach(b => {
        b.className = "dict-filter-btn px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold";
      });
      btn.className = "dict-filter-btn px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold";
      state.dictStatus = btn.getAttribute("data-status") || "all";
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
      const uzbek = document.getElementById("modal-uzbek-input").value.trim();
      const phonetic = document.getElementById("modal-phonetic-input").value.trim();
      const pos = document.getElementById("modal-pos-input").value;
      const level = document.getElementById("modal-level-input").value;
      const category = document.getElementById("modal-category-input").value;
      const def = document.getElementById("modal-def-input").value.trim();
      const example = document.getElementById("modal-example-input").value.trim();
      const uzbekSentence = document.getElementById("modal-uzbek-sentence-input").value.trim();

      if (!word || !uzbek || !def) {
        showToast("Word, Uzbek translation, and Definition are required", "warning");
        return;
      }

      Storage.addCustomWord({
        word,
        uzbek,
        phonetic,
        partOfSpeech: pos,
        level,
        category,
        definition: def,
        example,
        uzbekSentence
      });

      showToast(`Added "${word}" (${uzbek}) to dictionary! +20 XP`, "success");
      updateDashboardMetrics();
      closeAddModal();
      renderDictionary();
    });
  }

  // ========================================================
  // 10. REVIEW VIEW (SPACED REPETITION CONTROLLER)
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
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">You have reviewed all due and difficult words. Next review wave unlocks shortly.</p>
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

    if (cardTitle) cardTitle.textContent = `${item.word} (${item.uzbek})`;
    if (wordDisplay) wordDisplay.textContent = item.word;
    if (phoneticDisplay) phoneticDisplay.textContent = `${item.phonetic} • ${item.partOfSpeech} • ${item.level}`;
    if (defDisplay) {
      defDisplay.innerHTML = `
        <div class="font-bold text-brand-600 dark:text-brand-400 mb-1">🇺🇿 ${item.uzbek}</div>
        <div>${item.definition}</div>
        ${item.example ? `<div class="mt-2 text-xs text-slate-500 italic">"${item.example}"</div>` : ''}
      `;
    }
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
              <span class="text-brand-600 font-semibold ml-1.5">(${qItem.uzbek})</span>
              <span class="text-slate-400 block text-[11px]">${qItem.partOfSpeech} · ${qItem.level} · ${qItem.category}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-slate-400">Score: ${qItem.retentionScore}%</span>
            <span class="font-bold px-2.5 py-1 rounded-full ${qItem.urgency === 'urgent' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700' : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600'}">
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
  // 11. GAMES VIEW & ARENA HOOK
  // ========================================================
  function renderGameModes() {
    if (typeof GamesEngine !== "undefined") {
      GamesEngine.init();
    }
  }

  // Quick play buttons on dashboard cards
  document.querySelectorAll(".launch-quick-quiz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchView("games");
      if (typeof GamesEngine !== "undefined") {
        GamesEngine.launchGame("game-missing-letters");
      }
    });
  });

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
  // 12. IELTS VOCABULARY VIEW
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

          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-6">
            <span class="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider block mb-1">Task 2 Model Sentence</span>
            <p class="text-xs text-slate-600 dark:text-slate-300 italic">"${topic.sampleEssaySnippet}"</p>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button class="practice-ielts-btn w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2" data-topic-id="${topic.id}">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>Practice IELTS Flashcards</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    grid.querySelectorAll(".practice-ielts-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedLevel = "C1";
        state.flashcardCategory = "Environment";
        Storage.setSelectedLevel("C1");
        switchView("flashcards");
        showToast("Loaded IELTS Academic study set into flashcards", "info");
      });
    });
  }

  // ========================================================
  // 13. STATISTICS VIEW & HEATMAP
  // ========================================================
  function renderStatistics() {
    const heatmap = document.getElementById("stats-heatmap-grid");
    if (!heatmap) return;
    heatmap.innerHTML = "";

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
      setVoiceAccent(e.target.value);
    });
  }

  if (voiceSpeedSelect) {
    const s = Storage.getSettings();
    voiceSpeedSelect.value = s.playbackSpeed || 1.0;
    voiceSpeedSelect.addEventListener("change", (e) => {
      state.voiceSpeed = parseFloat(e.target.value);
      const current = Storage.getSettings();
      current.playbackSpeed = state.voiceSpeed;
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
    const vocab = Storage.getAllVocabulary();
    const matched = vocab.filter(item => 
      !q || 
      item.word.toLowerCase().includes(q) || 
      item.uzbek.toLowerCase().includes(q) ||
      (item.definition && item.definition.toLowerCase().includes(q))
    ).slice(0, 8);

    if (matched.length === 0) {
      searchResults.innerHTML = `<div class="p-4 text-xs text-slate-400 text-center">No vocabulary found matching "${query}"</div>`;
      return;
    }

    matched.forEach(item => {
      const row = document.createElement("div");
      row.className = "p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            ${item.image ? `<img src="${item.image}" alt="${item.word}" class="w-full h-full object-cover">` : `<i data-lucide="book" class="w-4 h-4 text-brand-500"></i>`}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 dark:text-white">${item.word}</span>
              <span class="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">(${item.uzbek})</span>
            </div>
            <span class="text-[11px] text-slate-400 line-clamp-1">${item.definition}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">${item.level}</span>
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
  // 18. INITIALIZE APPLICATION
  // ========================================================
  function initApp() {
    buildMobileDrawerItems();
    updateDashboardMetrics();
    renderWeeklyChart();
    initTodayWord();
    renderDashboardReviewPreview();
    renderDashboardAchievements();
    renderLearnUnits();
    loadFlashcardDeck();
    if (typeof GamesEngine !== "undefined") {
      GamesEngine.init();
    }
    renderIeltsTopics();
    renderDictionary();
    renderReviewQueue();
    renderStatistics();

    // Route based on URL hash or default to dashboard
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
