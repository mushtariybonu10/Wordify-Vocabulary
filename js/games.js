/**
 * WORDIFY - Vocabulary Games & Interactive Arena Engine
 * Complete interactive gamified vocabulary learning system
 */

// ========================================================
// 1. SYNTHESIZED SOUND EFFECTS ENGINE (Web Audio API)
// ========================================================
const GameAudio = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext)) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
  },

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  },

  playError() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.setValueAtTime(175, now + 0.1);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  },

  playFlip() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(720, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  },

  speakWord(text, rate = 1.0) {
    if (typeof window === "undefined" || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const settings = typeof Storage !== "undefined" ? Storage.getSettings() : {};
      utterance.rate = rate;
      utterance.lang = settings.accentVoice || "en-US";
      
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let matched = null;
        if (utterance.lang === "en-GB") {
          matched = voices.find(v => v.lang === "en-GB" || v.name.toLowerCase().includes("british") || v.name.toLowerCase().includes("uk"));
        } else {
          matched = voices.find(v => v.lang === "en-US" || v.name.toLowerCase().includes("us") || v.name.toLowerCase().includes("united states"));
        }
        if (matched) utterance.voice = matched;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
};

// ========================================================
// 2. CORE GAMES ENGINE CONTROLLER
// ========================================================
const GamesEngine = {
  activeGameId: null,
  activeFilter: "all",
  currentRound: 0,
  totalRounds: 5,
  score: 0,
  xpEarned: 0,
  correctAnswers: 0,
  roundWords: [],
  activeWord: null,
  gameData: {},
  sessionWords: [],
  hintUsedThisRound: false,
  difficulty: "medium", // For missing letters: easy (1), medium (2), hard (3)

  // Initialize engine & listeners
  init() {
    this.renderHub();
    this.bindEvents();
  },

  bindEvents() {
    // Category filter tabs
    document.querySelectorAll(".game-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter") || "all";
        this.activeFilter = filter;
        document.querySelectorAll(".game-filter-btn").forEach(b => {
          b.className = "game-filter-btn px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap";
        });
        btn.className = "game-filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-xs whitespace-nowrap";
        this.renderHub();
      });
    });

    // Arena navigation back button
    const backBtn = document.getElementById("arena-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.exitToHub());
    }

    // Sound toggle button in arena
    const soundToggle = document.getElementById("arena-sound-toggle");
    const soundIcon = document.getElementById("arena-sound-icon");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        GameAudio.enabled = !GameAudio.enabled;
        if (soundIcon) {
          soundIcon.setAttribute("data-lucide", GameAudio.enabled ? "volume-2" : "volume-x");
          if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
        }
      });
    }

    // Global keyboard listener for interactive word games
    document.addEventListener("keydown", (e) => {
      if (!this.activeGameId) return;
      if (document.getElementById("games-arena-view")?.classList.contains("hidden")) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (this.activeGameId === "game-missing-letters") {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          this.handleMissingLetterInput(key);
        }
      } else if (this.activeGameId === "game-unscramble") {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          this.handleUnscrambleKey(key);
        } else if (e.code === "Backspace") {
          this.unscramblePopLetter();
        } else if (e.code === "Enter") {
          this.checkUnscramble();
        }
      }
    });
  },

  // ----------------------------------------------------
  // Render Games Hub Catalog & Stats
  // ----------------------------------------------------
  renderHub() {
    const grid = document.getElementById("all-games-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const games = initialData.gameModes || [];
    const filtered = games.filter(g => {
      if (this.activeFilter === "all") return true;
      return g.category === this.activeFilter;
    });

    // Update Quick Stats in Hub Bar
    const stats = typeof Storage !== "undefined" && Storage.getGameStats ? Storage.getGameStats() : { totalGamesPlayed: 14, totalGameXp: 480 };
    const user = typeof Storage !== "undefined" ? Storage.getUser() : { currentStreak: 12 };
    const gamesPlayedEl = document.getElementById("hub-stat-games-played");
    const xpWonEl = document.getElementById("hub-stat-xp-won");
    const streakEl = document.getElementById("hub-stat-streak");

    if (gamesPlayedEl) gamesPlayedEl.textContent = stats.totalGamesPlayed || 0;
    if (xpWonEl) xpWonEl.textContent = `+${stats.totalGameXp || 0} XP`;
    if (streakEl) streakEl.textContent = `${user.currentStreak || 1} Days`;

    filtered.forEach(game => {
      const card = document.createElement("div");
      card.className = "bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all interactive-card flex flex-col justify-between";

      const diffColors = {
        "Easy": "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60",
        "Medium": "bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800/60",
        "Hard": "bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800/60",
        "Multi-Level": "bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 border border-brand-200 dark:border-brand-800/60"
      };

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/10">
              <i data-lucide="${game.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${diffColors[game.difficulty] || diffColors.Medium}">
                ${game.difficulty}
              </span>
              <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                ${game.xpReward}
              </span>
            </div>
          </div>

          <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">${game.title}</h3>
          <p class="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">${game.subtitle} · <span class="text-slate-400 font-normal">${game.category}</span></p>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">${game.description}</p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${game.activePlayers || "Live Game"}</span>
          </span>
          <button class="play-game-btn px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 dark:bg-white dark:hover:bg-brand-500 text-white dark:text-slate-900 dark:hover:text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2" data-game-id="${game.id}">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
            <span>Play Game</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach click events to Play Game buttons
    grid.querySelectorAll(".play-game-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const gameId = btn.getAttribute("data-game-id");
        this.launchGame(gameId);
      });
    });

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
  },

  // ----------------------------------------------------
  // Launch Game Arena & Show Start Screen
  // ----------------------------------------------------
  launchGame(gameId) {
    const game = (initialData.gameModes || []).find(g => g.id === gameId);
    if (!game) return;

    this.activeGameId = gameId;

    // Switch container visibility
    const hubView = document.getElementById("games-hub-view");
    const arenaView = document.getElementById("games-arena-view");
    if (hubView) hubView.classList.add("hidden");
    if (arenaView) arenaView.classList.remove("hidden");

    // Update Arena Navigation Bar Info
    const titleEl = document.getElementById("arena-game-title");
    const catEl = document.getElementById("arena-game-category");
    const diffEl = document.getElementById("arena-game-diff");
    if (titleEl) titleEl.textContent = game.title;
    if (catEl) catEl.textContent = game.category;
    if (diffEl) diffEl.textContent = game.difficulty;

    // Scroll smoothly to top of game arena
    window.scrollTo({ top: 120, behavior: "smooth" });

    this.renderStartScreen(game);
  },

  exitToHub() {
    this.activeGameId = null;
    const hubView = document.getElementById("games-hub-view");
    const arenaView = document.getElementById("games-arena-view");
    if (arenaView) arenaView.classList.add("hidden");
    if (hubView) hubView.classList.remove("hidden");
    this.renderHub();
  },

  // ----------------------------------------------------
  // 3. START SCREEN (Instructions & Difficulty)
  // ----------------------------------------------------
  renderStartScreen(game) {
    const stage = document.getElementById("game-stage-content");
    if (!stage) return;

    const gameInstructions = {
      "game-missing-letters": [
        "Words are presented with blank letter tiles.",
        "Choose or type the missing letters to complete the target vocabulary.",
        "Use the Hint button to reveal Uzbek translations or parts of speech."
      ],
      "game-word-picture-match": [
        "Connect 4 English vocabulary cards with their photographic illustrations.",
        "Desktop: Drag and drop the word card directly onto the matching picture.",
        "Mobile: Tap a word card, then tap its matching picture card."
      ],
      "game-unscramble": [
        "Letters are scrambled into an anagram puzzle.",
        "Click letter tiles or use your physical keyboard to place letters in order.",
        "Use Backspace to remove letters or Shuffle to reorder tiles."
      ],
      "game-listen-choose": [
        "Listen to the authentic English audio pronunciation.",
        "Select the correct vocabulary word from the four multiple-choice options.",
        "You can replay the audio at normal or slower learner speed."
      ],
      "game-translation": [
        "Inspect the Uzbek translation and English context definition.",
        "Type the exact English vocabulary word from active memory.",
        "Submissions are case-insensitive and check spelling accuracy."
      ],
      "game-guess-picture": [
        "Examine the real-world high-resolution photograph.",
        "Identify which English vocabulary item the picture represents.",
        "Instant audio feedback and sentence usage follow each choice."
      ],
      "game-complete-sentence": [
        "Read an authentic contextual sentence with a missing vocabulary word.",
        "Read the Uzbek sentence translation for clues.",
        "Select the word that best completes the sentence grammatically and semantically."
      ],
      "game-memory-cards": [
        "Cards are placed face-down on the board.",
        "Flip two cards at a time to find matching English words and Uzbek meanings.",
        "Complete the grid in as few turns as possible for bonus XP."
      ],
      "game-spelling-challenge": [
        "Listen to the spoken English word without seeing its text.",
        "Type the exact spelling into the input field.",
        "Optional hints provide English definitions and word length."
      ],
      "game-synonym-match": [
        "Match 4 advanced vocabulary words with their closest synonyms.",
        "Tap a word on the left, then tap its synonym on the right.",
        "Expand lexical precision for C1/IELTS Academic Task 2 writing."
      ]
    };

    const instructions = gameInstructions[game.id] || [
      "Follow the on-screen prompts and select or type the correct answer.",
      "Earn XP and build your streak with each correct response."
    ];

    let difficultySelectorHtml = "";
    if (game.id === "game-missing-letters") {
      difficultySelectorHtml = `
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Missing Letters Difficulty:</label>
          <div class="flex items-center gap-3">
            <button class="diff-opt-btn flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 bg-slate-50 dark:bg-slate-800" data-diff="easy">Easy (1 blank)</button>
            <button class="diff-opt-btn flex-1 py-2 px-3 rounded-xl border-2 border-brand-500 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40" data-diff="medium">Medium (2 blanks)</button>
            <button class="diff-opt-btn flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 bg-slate-50 dark:bg-slate-800" data-diff="hard">Hard (3 blanks)</button>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `
      <div class="max-w-xl mx-auto w-full text-center py-4">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr ${game.color} text-white flex items-center justify-center font-bold mx-auto mb-6 shadow-xl shadow-brand-500/20">
          <i data-lucide="${game.icon}" class="w-10 h-10"></i>
        </div>

        <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">${game.title}</h2>
        <p class="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-semibold mb-6">${game.subtitle}</p>

        <!-- Instruction Card -->
        <div class="text-left bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-6 space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-brand-500"></i>
            <span>How to Play & Scoring</span>
          </div>
          <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            ${instructions.map(ins => `
              <li class="flex items-start gap-2">
                <span class="text-brand-500 font-bold">•</span>
                <span>${ins}</span>
              </li>
            `).join("")}
          </ul>
          ${difficultySelectorHtml}
        </div>

        <div class="flex items-center gap-3 justify-center">
          <button id="start-game-now-btn" class="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2">
            <i data-lucide="play" class="w-4 h-4 fill-current"></i>
            <span>Start Challenge</span>
          </button>
          <button id="cancel-game-btn" class="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors">
            Exit
          </button>
        </div>
      </div>
    `;

    // Handle difficulty selection
    stage.querySelectorAll(".diff-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        stage.querySelectorAll(".diff-opt-btn").forEach(b => {
          b.className = "diff-opt-btn flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 bg-slate-50 dark:bg-slate-800";
        });
        btn.className = "diff-opt-btn flex-1 py-2 px-3 rounded-xl border-2 border-brand-500 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40";
        this.difficulty = btn.getAttribute("data-diff") || "medium";
      });
    });

    document.getElementById("start-game-now-btn")?.addEventListener("click", () => {
      this.startGame(game.id, this.difficulty);
    });

    document.getElementById("cancel-game-btn")?.addEventListener("click", () => {
      this.exitToHub();
    });

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
  },

  // ----------------------------------------------------
  // 4. START GAME SESSION (5 Rounds)
  // ----------------------------------------------------
  startGame(gameId, difficulty = "medium") {
    this.activeGameId = gameId;
    this.difficulty = difficulty;
    this.currentRound = 0;
    this.totalRounds = 5;
    this.score = 0;
    this.xpEarned = 0;
    this.correctAnswers = 0;
    this.sessionWords = [];
    this.gameData = {};

    // Get 5 distinct vocabulary words
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    this.roundWords = shuffled.slice(0, this.totalRounds);

    this.loadRound(0);
  },

  // Load specific round
  loadRound(roundIndex) {
    this.currentRound = roundIndex;
    this.activeWord = this.roundWords[roundIndex];
    this.hintUsedThisRound = false;

    // Update Arena Indicators
    const counterEl = document.getElementById("arena-round-counter");
    const scoreEl = document.getElementById("arena-score-counter");
    const progEl = document.getElementById("arena-progress-bar");

    if (counterEl) counterEl.textContent = `Round ${roundIndex + 1} of ${this.totalRounds}`;
    if (scoreEl) scoreEl.textContent = `Score: ${this.score} • +${this.xpEarned} XP`;
    if (progEl) progEl.style.width = `${Math.round(((roundIndex) / this.totalRounds) * 100)}%`;

    // Render game specific round UI
    switch (this.activeGameId) {
      case "game-missing-letters":
        this.renderMissingLettersRound();
        break;
      case "game-word-picture-match":
        this.renderWordPictureMatchRound();
        break;
      case "game-unscramble":
        this.renderUnscrambleRound();
        break;
      case "game-listen-choose":
        this.renderListenChooseRound();
        break;
      case "game-translation":
        this.renderTranslationRound();
        break;
      case "game-guess-picture":
        this.renderGuessPictureRound();
        break;
      case "game-complete-sentence":
        this.renderCompleteSentenceRound();
        break;
      case "game-memory-cards":
        this.renderMemoryCardsRound();
        break;
      case "game-spelling-challenge":
        this.renderSpellingRound();
        break;
      case "game-synonym-match":
        this.renderSynonymMatchRound();
        break;
      default:
        this.renderListenChooseRound();
    }

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
  },

  // Advance to next round or finish
  advanceRound() {
    if (this.currentRound + 1 < this.totalRounds) {
      this.loadRound(this.currentRound + 1);
    } else {
      this.finishGame();
    }
  },

  // Universal Round Feedback Box Handler
  showFeedbackCard(container, isCorrect, explanation, customNextText = "Next Question →") {
    if (isCorrect) {
      GameAudio.playSuccess();
      const points = 25 - (this.hintUsedThisRound ? 10 : 0);
      this.score += points;
      this.xpEarned += 10;
      this.correctAnswers++;
      if (this.activeWord && !this.sessionWords.some(w => w.id === this.activeWord.id)) {
        this.sessionWords.push(this.activeWord);
      }
    } else {
      GameAudio.playError();
      if (this.activeWord && !this.sessionWords.some(w => w.id === this.activeWord.id)) {
        this.sessionWords.push(this.activeWord);
      }
    }

    const scoreEl = document.getElementById("arena-score-counter");
    if (scoreEl) scoreEl.textContent = `Score: ${this.score} • +${this.xpEarned} XP`;

    const feedbackBox = document.createElement("div");
    feedbackBox.className = `mt-6 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 game-pop ${
      isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
    }`;

    feedbackBox.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} flex items-center justify-center flex-shrink-0 font-bold">
          <i data-lucide="${isCorrect ? 'check' : 'x'}" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="font-display font-bold text-sm">${isCorrect ? 'Correct! Well done 🎉' : 'Incorrect'}</div>
          <div class="text-xs opacity-90 mt-0.5">${explanation}</div>
        </div>
      </div>
      <button id="game-continue-btn" class="px-6 py-2.5 rounded-xl ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'} font-bold text-xs shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap">
        <span>${customNextText}</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(feedbackBox);

    document.getElementById("game-continue-btn")?.addEventListener("click", () => {
      this.advanceRound();
    });

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
  },

  // ========================================================
  // GAME 1: MISSING LETTERS
  // ========================================================
  renderMissingLettersRound() {
    const stage = document.getElementById("game-stage-content");
    const word = this.activeWord.word.toUpperCase();
    
    // Choose missing indices based on difficulty
    const indicesToHideCount = this.difficulty === "easy" ? 1 : this.difficulty === "hard" ? 3 : 2;
    const cleanLetters = [];
    for (let i = 0; i < word.length; i++) {
      if (/[A-Z]/.test(word[i])) cleanLetters.push(i);
    }

    // Pick random indices to hide
    const shuffledIdx = [...cleanLetters].sort(() => Math.random() - 0.5);
    const hiddenIndices = new Set(shuffledIdx.slice(0, Math.min(indicesToHideCount, cleanLetters.length - 1)));
    
    this.gameData = {
      targetWord: word,
      hiddenIndices: hiddenIndices,
      userLetters: {}, // idx -> letter
      completed: false
    };

    // Find the first hidden index
    const firstMissing = Array.from(hiddenIndices).sort((a,b) => a - b)[0];
    this.gameData.activeSlotIdx = firstMissing;

    // Build letter buttons for on-screen keyboard (missing letters + distractors)
    const neededLetters = Array.from(hiddenIndices).map(idx => word[idx]);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const distractors = alphabet.filter(l => !neededLetters.includes(l)).sort(() => Math.random() - 0.5).slice(0, 6);
    const keypadLetters = [...neededLetters, ...distractors].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-brand-600 border border-blue-200 dark:border-blue-800">Missing Letters Drill</span>
            <span class="text-xs text-slate-400 italic">${this.activeWord.partOfSpeech} · Level ${this.activeWord.level}</span>
          </div>
          <button id="ml-hint-btn" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Hint (-5 pts)</span>
          </button>
        </div>

        <div id="ml-hint-box" class="hidden p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
          🇺🇿 Uzbek: <strong>${this.activeWord.uzbek}</strong> · Def: ${this.activeWord.definition}
        </div>

        <!-- Word Tiles Display -->
        <div class="py-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3" id="ml-slots-rack">
          ${word.split("").map((letter, idx) => {
            if (hiddenIndices.has(idx)) {
              return `
                <div class="slot-blank w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-brand-600 transition-all cursor-pointer ${idx === firstMissing ? 'active-slot' : ''}" data-slot-idx="${idx}">
                  _
                </div>
              `;
            } else {
              return `
                <div class="w-10 h-12 sm:w-12 sm:h-14 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white select-none">
                  ${letter}
                </div>
              `;
            }
          }).join("")}
        </div>

        <div class="text-center text-xs font-semibold text-slate-400">
          Type the missing letter on your keyboard or tap below:
        </div>

        <!-- On-Screen Keyboard -->
        <div class="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto" id="ml-keypad">
          ${keypadLetters.map(l => `
            <button class="ml-key-btn w-10 h-11 sm:w-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-800 dark:text-white font-extrabold text-base shadow-xs transition-all active:scale-95" data-key="${l}">
              ${l}
            </button>
          `).join("")}
        </div>

        <div id="ml-feedback-area"></div>
      </div>
    `;

    // Hint trigger
    document.getElementById("ml-hint-btn")?.addEventListener("click", () => {
      this.hintUsedThisRound = true;
      document.getElementById("ml-hint-box")?.classList.remove("hidden");
    });

    // Keypad clicks
    stage.querySelectorAll(".ml-key-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        this.handleMissingLetterInput(key);
      });
    });

    // Slot clicks
    stage.querySelectorAll(".slot-blank").forEach(slot => {
      slot.addEventListener("click", () => {
        const idx = parseInt(slot.getAttribute("data-slot-idx"), 10);
        this.gameData.activeSlotIdx = idx;
        stage.querySelectorAll(".slot-blank").forEach(s => s.classList.remove("active-slot"));
        slot.classList.add("active-slot");
      });
    });
  },

  handleMissingLetterInput(letter) {
    if (this.gameData.completed) return;
    const targetWord = this.gameData.targetWord;
    const activeSlot = this.gameData.activeSlotIdx;
    if (activeSlot === undefined || activeSlot === null) return;

    const slotEl = document.querySelector(`[data-slot-idx="${activeSlot}"]`);
    if (!slotEl) return;

    if (targetWord[activeSlot] === letter) {
      // Correct letter
      GameAudio.playSuccess();
      slotEl.textContent = letter;
      slotEl.classList.remove("border-dashed", "active-slot");
      slotEl.classList.add("bg-emerald-500", "text-white", "border-emerald-600", "game-pop");
      this.gameData.userLetters[activeSlot] = letter;

      // Find next unfilled slot
      const unfilled = Array.from(this.gameData.hiddenIndices).filter(idx => !this.gameData.userLetters[idx]);
      if (unfilled.length > 0) {
        this.gameData.activeSlotIdx = unfilled[0];
        const nextSlot = document.querySelector(`[data-slot-idx="${unfilled[0]}"]`);
        if (nextSlot) nextSlot.classList.add("active-slot");
      } else {
        // All filled and matched!
        this.gameData.completed = true;
        GameAudio.speakWord(this.activeWord.word);
        const feedbackContainer = document.getElementById("ml-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(
            feedbackContainer,
            true,
            `<strong>${this.activeWord.word}</strong> (${this.activeWord.partOfSpeech}) — 🇺🇿 ${this.activeWord.uzbek}. "${this.activeWord.definition}"`
          );
        }
      }
    } else {
      // Wrong letter
      GameAudio.playError();
      slotEl.classList.add("game-shake", "border-rose-500");
      setTimeout(() => {
        slotEl.classList.remove("game-shake", "border-rose-500");
      }, 400);
    }
  },

  // ========================================================
  // GAME 2: WORD AND PICTURE MATCHING (Drag & Drop + Tap)
  // ========================================================
  renderWordPictureMatchRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    // Pick 4 words with images
    const pool = all.filter(w => w.image).sort(() => Math.random() - 0.5).slice(0, 4);
    const words = [...pool].sort(() => Math.random() - 0.5);
    const pictures = [...pool].sort(() => Math.random() - 0.5);

    this.gameData = {
      totalPairs: 4,
      matchedPairs: 0,
      selectedWordId: null,
      selectedPicId: null
    };

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">Word & Picture Matching</span>
          <span class="text-xs font-bold text-slate-400" id="wpm-pairs-counter">Matched: 0 / 4</span>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Desktop: Drag the word onto the matching photo. Mobile: Tap a word, then tap its photo.
        </p>

        <!-- 2 Columns: Words & Pictures -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Word Cards Column -->
          <div class="space-y-3" id="wpm-words-column">
            ${words.map(w => `
              <div class="wpm-word-card p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between shadow-xs select-none" draggable="true" data-word-id="${w.id}">
                <div>
                  <h4 class="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">${w.word}</h4>
                  <div class="text-[11px] text-brand-600 font-semibold">🇺🇿 ${w.uzbek}</div>
                </div>
                <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                  <i data-lucide="move" class="w-3.5 h-3.5"></i>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Picture Cards Column -->
          <div class="grid grid-cols-2 gap-3" id="wpm-pics-column">
            ${pictures.map(p => `
              <div class="wpm-pic-card group relative h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 cursor-pointer transition-all shadow-xs" data-pic-id="${p.id}">
                <img src="${p.image}" alt="Vocabulary Illustration" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
                <div class="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors pointer-events-none"></div>
                <div class="wpm-match-overlay absolute inset-0 bg-emerald-600/90 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 opacity-0 pointer-events-none transition-opacity">
                  <i data-lucide="check-circle" class="w-6 h-6"></i>
                  <span class="wpm-matched-label">Matched!</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div id="wpm-feedback-area"></div>
      </div>
    `;

    // Drag and Drop Event Listeners
    stage.querySelectorAll(".wpm-word-card").forEach(wCard => {
      wCard.addEventListener("dragstart", (e) => {
        const id = wCard.getAttribute("data-word-id");
        e.dataTransfer.setData("text/plain", id);
        wCard.classList.add("drag-source-active");
      });

      wCard.addEventListener("dragend", () => {
        wCard.classList.remove("drag-source-active");
      });

      // Tap-to-match for mobile
      wCard.addEventListener("click", () => {
        if (wCard.classList.contains("item-match-connected")) return;
        stage.querySelectorAll(".wpm-word-card").forEach(c => c.classList.remove("item-match-selected"));
        wCard.classList.add("item-match-selected");
        this.gameData.selectedWordId = wCard.getAttribute("data-word-id");
        this.checkTapMatch();
      });
    });

    stage.querySelectorAll(".wpm-pic-card").forEach(pCard => {
      pCard.addEventListener("dragover", (e) => {
        e.preventDefault();
        pCard.classList.add("drop-target-hover");
      });

      pCard.addEventListener("dragleave", () => {
        pCard.classList.remove("drop-target-hover");
      });

      pCard.addEventListener("drop", (e) => {
        e.preventDefault();
        pCard.classList.remove("drop-target-hover");
        const wordId = e.dataTransfer.getData("text/plain");
        const picId = pCard.getAttribute("data-pic-id");
        this.evaluateMatch(wordId, picId, pCard);
      });

      // Tap-to-match for mobile
      pCard.addEventListener("click", () => {
        if (pCard.classList.contains("item-match-connected")) return;
        stage.querySelectorAll(".wpm-pic-card").forEach(c => c.classList.remove("item-match-selected"));
        pCard.classList.add("item-match-selected");
        this.gameData.selectedPicId = pCard.getAttribute("data-pic-id");
        this.checkTapMatch();
      });
    });
  },

  checkTapMatch() {
    if (this.gameData.selectedWordId && this.gameData.selectedPicId) {
      const pCard = document.querySelector(`[data-pic-id="${this.gameData.selectedPicId}"]`);
      this.evaluateMatch(this.gameData.selectedWordId, this.gameData.selectedPicId, pCard);
      this.gameData.selectedWordId = null;
      this.gameData.selectedPicId = null;
    }
  },

  evaluateMatch(wordId, picId, picCardElement) {
    const wordCard = document.querySelector(`[data-word-id="${wordId}"]`);
    if (!wordCard || !picCardElement) return;

    if (wordId === picId) {
      // MATCH!
      GameAudio.playSuccess();
      wordCard.classList.remove("item-match-selected");
      wordCard.classList.add("item-match-connected", "border-emerald-500", "bg-emerald-50", "dark:bg-emerald-950/40");
      wordCard.setAttribute("draggable", "false");

      picCardElement.classList.remove("item-match-selected");
      picCardElement.classList.add("item-match-connected", "border-emerald-500");
      const overlay = picCardElement.querySelector(".wpm-match-overlay");
      if (overlay) overlay.classList.remove("opacity-0");

      this.gameData.matchedPairs++;
      this.score += 25;
      this.xpEarned += 8;

      const counter = document.getElementById("wpm-pairs-counter");
      if (counter) counter.textContent = `Matched: ${this.gameData.matchedPairs} / 4`;

      if (this.gameData.matchedPairs >= 4) {
        const feedbackContainer = document.getElementById("wpm-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(feedbackContainer, true, "All 4 picture pairs correctly matched! Fantastic visual recall.");
        }
      }
    } else {
      // MISMATCH
      GameAudio.playError();
      wordCard.classList.add("game-shake", "border-rose-500");
      picCardElement.classList.add("game-shake", "border-rose-500");
      setTimeout(() => {
        wordCard.classList.remove("game-shake", "border-rose-500", "item-match-selected");
        picCardElement.classList.remove("game-shake", "border-rose-500", "item-match-selected");
      }, 400);
    }
  },

  // ========================================================
  // GAME 3: UNSCRAMBLE THE WORD
  // ========================================================
  renderUnscrambleRound() {
    const stage = document.getElementById("game-stage-content");
    const targetWord = this.activeWord.word.toUpperCase();
    
    // Scramble letters ensuring scrambled !== targetWord
    let scrambled = targetWord.split("").sort(() => Math.random() - 0.5);
    while (scrambled.join("") === targetWord && targetWord.length > 2) {
      scrambled = targetWord.split("").sort(() => Math.random() - 0.5);
    }

    this.gameData = {
      targetWord: targetWord,
      scrambledTiles: scrambled.map((letter, i) => ({ id: `t-${i}`, letter, placed: false })),
      placedTiles: [],
      completed: false
    };

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800">Word Unscramble</span>
          <button id="uns-hint-btn" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Hint (-5 pts)</span>
          </button>
        </div>

        <div id="uns-hint-box" class="hidden p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
          🇺🇿 Meaning: <strong>${this.activeWord.uzbek}</strong> · Clue: ${this.activeWord.definition}
        </div>

        <!-- Target Placement Rack -->
        <div class="py-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3" id="uns-target-rack">
          ${targetWord.split("").map((_, i) => `
            <div class="uns-slot w-11 h-13 sm:w-13 sm:h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-xl sm:text-2xl font-extrabold text-brand-600 cursor-pointer transition-all" data-slot-index="${i}">
            </div>
          `).join("")}
        </div>

        <!-- Controls: Clear / Shuffle -->
        <div class="flex items-center justify-center gap-3">
          <button id="uns-shuffle-btn" class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <i data-lucide="shuffle" class="w-3.5 h-3.5"></i>
            <span>Shuffle</span>
          </button>
          <button id="uns-clear-btn" class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <i data-lucide="delete" class="w-3.5 h-3.5"></i>
            <span>Clear / Backspace</span>
          </button>
        </div>

        <!-- Scrambled Available Letter Pool -->
        <div class="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto" id="uns-source-pool">
          ${this.gameData.scrambledTiles.map(t => `
            <button class="uns-tile letter-tile w-11 h-12 sm:w-12 sm:h-14 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-sm flex items-center justify-center text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white" data-tile-id="${t.id}">
              ${t.letter}
            </button>
          `).join("")}
        </div>

        <div id="uns-feedback-area"></div>
      </div>
    `;

    // Bind Hint
    document.getElementById("uns-hint-btn")?.addEventListener("click", () => {
      this.hintUsedThisRound = true;
      document.getElementById("uns-hint-box")?.classList.remove("hidden");
    });

    // Bind Shuffle
    document.getElementById("uns-shuffle-btn")?.addEventListener("click", () => {
      const available = this.gameData.scrambledTiles.filter(t => !t.placed).sort(() => Math.random() - 0.5);
      const pool = document.getElementById("uns-source-pool");
      if (pool) {
        pool.innerHTML = "";
        available.forEach(t => {
          const btn = document.createElement("button");
          btn.className = "uns-tile letter-tile w-11 h-12 sm:w-12 sm:h-14 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-sm flex items-center justify-center text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white";
          btn.setAttribute("data-tile-id", t.id);
          btn.textContent = t.letter;
          btn.onclick = () => this.unscramblePushTile(t.id);
          pool.appendChild(btn);
        });
      }
    });

    // Bind Clear
    document.getElementById("uns-clear-btn")?.addEventListener("click", () => {
      this.unscramblePopLetter();
    });

    // Tile Clicks
    stage.querySelectorAll(".uns-tile").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tile-id");
        this.unscramblePushTile(id);
      });
    });
  },

  unscramblePushTile(tileId) {
    if (this.gameData.completed) return;
    const tile = this.gameData.scrambledTiles.find(t => t.id === tileId);
    if (!tile || tile.placed) return;

    tile.placed = true;
    this.gameData.placedTiles.push(tile);
    GameAudio.playFlip();

    // Hide from source pool
    const btn = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (btn) btn.classList.add("hidden");

    // Add to next open slot
    const slotIdx = this.gameData.placedTiles.length - 1;
    const slot = document.querySelector(`[data-slot-index="${slotIdx}"]`);
    if (slot) {
      slot.textContent = tile.letter;
      slot.classList.remove("border-dashed");
      slot.classList.add("bg-white", "dark:bg-[#111827]", "border-brand-500", "shadow-sm", "game-pop");
      slot.onclick = () => this.unscrambleRemoveAtSlot(slotIdx);
    }

    // If rack is full, validate!
    if (this.gameData.placedTiles.length === this.gameData.targetWord.length) {
      this.checkUnscramble();
    }
  },

  unscramblePopLetter() {
    if (this.gameData.placedTiles.length === 0 || this.gameData.completed) return;
    const lastTile = this.gameData.placedTiles.pop();
    lastTile.placed = false;

    const slotIdx = this.gameData.placedTiles.length;
    const slot = document.querySelector(`[data-slot-index="${slotIdx}"]`);
    if (slot) {
      slot.textContent = "";
      slot.classList.add("border-dashed");
      slot.classList.remove("bg-white", "dark:bg-[#111827]", "border-brand-500", "shadow-sm", "game-pop");
      slot.onclick = null;
    }

    const btn = document.querySelector(`[data-tile-id="${lastTile.id}"]`);
    if (btn) btn.classList.remove("hidden");
  },

  unscrambleRemoveAtSlot(slotIdx) {
    if (this.gameData.completed) return;
    // Remove the tile at this slot and shift subsequent
    const tile = this.gameData.placedTiles[slotIdx];
    if (!tile) return;
    tile.placed = false;

    const btn = document.querySelector(`[data-tile-id="${tile.id}"]`);
    if (btn) btn.classList.remove("hidden");

    this.gameData.placedTiles.splice(slotIdx, 1);

    // Re-render rack
    for (let i = 0; i < this.gameData.targetWord.length; i++) {
      const s = document.querySelector(`[data-slot-index="${i}"]`);
      if (s) {
        if (i < this.gameData.placedTiles.length) {
          s.textContent = this.gameData.placedTiles[i].letter;
          s.classList.remove("border-dashed");
          s.classList.add("bg-white", "dark:bg-[#111827]", "border-brand-500");
        } else {
          s.textContent = "";
          s.classList.add("border-dashed");
          s.classList.remove("bg-white", "dark:bg-[#111827]", "border-brand-500");
          s.onclick = null;
        }
      }
    }
  },

  handleUnscrambleKey(letter) {
    if (this.gameData.completed) return;
    // Find unplaced tile matching letter
    const available = this.gameData.scrambledTiles.find(t => !t.placed && t.letter === letter);
    if (available) {
      this.unscramblePushTile(available.id);
    }
  },

  checkUnscramble() {
    const userSpelling = this.gameData.placedTiles.map(t => t.letter).join("");
    const target = this.gameData.targetWord;
    const rack = document.getElementById("uns-target-rack");

    if (userSpelling === target) {
      this.gameData.completed = true;
      GameAudio.speakWord(this.activeWord.word);
      document.querySelectorAll(".uns-slot").forEach(s => {
        s.classList.add("bg-emerald-500", "text-white", "border-emerald-600");
      });
      const feedbackContainer = document.getElementById("uns-feedback-area");
      if (feedbackContainer) {
        this.showFeedbackCard(
          feedbackContainer,
          true,
          `<strong>${this.activeWord.word}</strong> — 🇺🇿 ${this.activeWord.uzbek}. "${this.activeWord.definition}"`
        );
      }
    } else {
      GameAudio.playError();
      if (rack) {
        rack.classList.add("game-shake");
        setTimeout(() => rack.classList.remove("game-shake"), 400);
      }
    }
  },

  // ========================================================
  // GAME 4: LISTEN AND CHOOSE
  // ========================================================
  renderListenChooseRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    // Pick 3 distractors
    const distractors = all.filter(w => w.id !== this.activeWord.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [this.activeWord, ...distractors].sort(() => Math.random() - 0.5);

    // Auto-play audio pronunciation
    setTimeout(() => {
      GameAudio.speakWord(this.activeWord.word);
    }, 250);

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-purple-600 border border-purple-200 dark:border-purple-800">Listen & Choose</span>
          <span class="text-xs text-slate-400 italic">Select the word you hear</span>
        </div>

        <!-- Audio Player Hero Card -->
        <div class="py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/80 text-center flex flex-col items-center justify-center gap-3">
          <button id="lc-play-audio-btn" class="w-20 h-20 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 transition-transform hover:scale-105 active:scale-95 group">
            <i data-lucide="volume-2" class="w-10 h-10 group-hover:scale-110 transition-transform"></i>
          </button>
          <div class="text-sm font-bold text-slate-800 dark:text-white">Tap to Replay Audio</div>
          <button id="lc-play-slow-btn" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
            <span>🐢 Play Slower (0.75x)</span>
          </button>
        </div>

        <!-- 4 Multiple Choice Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="lc-options-grid">
          ${options.map((opt, i) => `
            <button class="lc-option-btn p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-brand-500 font-extrabold text-sm sm:text-base text-slate-800 dark:text-white transition-all flex items-center justify-between" data-word-id="${opt.id}">
              <span>${opt.word}</span>
              <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center justify-center font-bold">${['A', 'B', 'C', 'D'][i]}</span>
            </button>
          `).join("")}
        </div>

        <div id="lc-feedback-area"></div>
      </div>
    `;

    document.getElementById("lc-play-audio-btn")?.addEventListener("click", () => {
      GameAudio.speakWord(this.activeWord.word, 1.0);
    });

    document.getElementById("lc-play-slow-btn")?.addEventListener("click", () => {
      GameAudio.speakWord(this.activeWord.word, 0.75);
    });

    stage.querySelectorAll(".lc-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        stage.querySelectorAll(".lc-option-btn").forEach(b => b.disabled = true);
        const selectedId = btn.getAttribute("data-word-id");
        const isCorrect = selectedId === this.activeWord.id;

        if (isCorrect) {
          btn.classList.add("bg-emerald-500", "text-white", "border-emerald-600");
        } else {
          btn.classList.add("bg-rose-500", "text-white", "border-rose-600");
          const correctBtn = stage.querySelector(`[data-word-id="${this.activeWord.id}"]`);
          if (correctBtn) correctBtn.classList.add("bg-emerald-100", "dark:bg-emerald-950/60", "border-emerald-500", "text-emerald-700");
        }

        const feedbackContainer = document.getElementById("lc-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(
            feedbackContainer,
            isCorrect,
            `Word spoken: <strong>${this.activeWord.word}</strong> — 🇺🇿 ${this.activeWord.uzbek}. (${this.activeWord.definition})`
          );
        }
      });
    });
  },

  // ========================================================
  // GAME 5: TRANSLATION CHALLENGE (Type English Word)
  // ========================================================
  renderTranslationRound() {
    const stage = document.getElementById("game-stage-content");
    const targetWord = this.activeWord.word;

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800">Translation Challenge</span>
          <button id="tc-hint-btn" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Hint (-5 pts)</span>
          </button>
        </div>

        <!-- Uzbek Prompt Card -->
        <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div class="text-xs uppercase tracking-wider font-bold text-slate-400">Translate to English</div>
          <h3 class="font-display font-extrabold text-2xl sm:text-3xl text-brand-600 dark:text-brand-400">🇺🇿 ${this.activeWord.uzbek}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 italic max-w-md mx-auto">"${this.activeWord.definition}"</p>
        </div>

        <div id="tc-hint-box" class="hidden p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 text-center">
          First letter: <strong>${targetWord[0].toUpperCase()}</strong> · Word length: <strong>${targetWord.length} letters</strong>
        </div>

        <!-- Typing Input Form -->
        <form id="tc-form" class="max-w-md mx-auto space-y-3">
          <div class="relative">
            <input type="text" id="tc-input" class="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-base focus:border-brand-500 focus:outline-hidden transition-all text-center" placeholder="Type English equivalent..." autocomplete="off" autofocus />
          </div>
          <button type="submit" class="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-brand-600 dark:bg-white dark:hover:bg-brand-500 text-white dark:text-slate-900 dark:hover:text-white font-extrabold text-sm shadow-md transition-all">
            Submit Translation
          </button>
        </form>

        <div id="tc-feedback-area"></div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById("tc-input")?.focus();
    }, 150);

    document.getElementById("tc-hint-btn")?.addEventListener("click", () => {
      this.hintUsedThisRound = true;
      document.getElementById("tc-hint-box")?.classList.remove("hidden");
    });

    const form = document.getElementById("tc-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("tc-input");
        if (!input) return;

        const val = input.value.trim();
        if (!val) return;

        input.disabled = true;
        const isMatch = val.toLowerCase() === targetWord.toLowerCase();

        GameAudio.speakWord(targetWord);

        const feedbackContainer = document.getElementById("tc-feedback-area");
        if (feedbackContainer) {
          if (isMatch) {
            this.showFeedbackCard(feedbackContainer, true, `Correct! <strong>${targetWord}</strong> (${this.activeWord.partOfSpeech}) — "${this.activeWord.example}"`);
          } else {
            this.showFeedbackCard(feedbackContainer, false, `You typed: "<em>${val}</em>" · Correct English: <strong>${targetWord}</strong>`);
          }
        }
      });
    }
  },

  // ========================================================
  // GAME 6: GUESS THE PICTURE
  // ========================================================
  renderGuessPictureRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    // Pick 3 distractors
    const distractors = all.filter(w => w.id !== this.activeWord.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [this.activeWord, ...distractors].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 border border-cyan-200 dark:border-cyan-800">Guess the Picture</span>
          <span class="text-xs text-slate-400 italic">Select the vocabulary item pictured</span>
        </div>

        <!-- High-res Image Preview Card -->
        <div class="relative h-48 sm:h-56 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 max-w-lg mx-auto">
          <img src="${this.activeWord.image}" alt="Vocabulary photograph" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'" />
        </div>

        <!-- 4 Multiple Choice Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="gp-options-grid">
          ${options.map((opt, i) => `
            <button class="gp-option-btn p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-brand-500 font-extrabold text-sm sm:text-base text-slate-800 dark:text-white transition-all flex items-center justify-between" data-word-id="${opt.id}">
              <div class="text-left">
                <div>${opt.word}</div>
                <div class="text-[11px] text-slate-400 font-normal">${opt.partOfSpeech} · ${opt.level}</div>
              </div>
              <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center justify-center font-bold">${['A', 'B', 'C', 'D'][i]}</span>
            </button>
          `).join("")}
        </div>

        <div id="gp-feedback-area"></div>
      </div>
    `;

    stage.querySelectorAll(".gp-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        stage.querySelectorAll(".gp-option-btn").forEach(b => b.disabled = true);
        const selectedId = btn.getAttribute("data-word-id");
        const isCorrect = selectedId === this.activeWord.id;

        GameAudio.speakWord(this.activeWord.word);

        if (isCorrect) {
          btn.classList.add("bg-emerald-500", "text-white", "border-emerald-600");
        } else {
          btn.classList.add("bg-rose-500", "text-white", "border-rose-600");
          const correctBtn = stage.querySelector(`[data-word-id="${this.activeWord.id}"]`);
          if (correctBtn) correctBtn.classList.add("bg-emerald-100", "dark:bg-emerald-950/60", "border-emerald-500", "text-emerald-700");
        }

        const feedbackContainer = document.getElementById("gp-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(
            feedbackContainer,
            isCorrect,
            `<strong>${this.activeWord.word}</strong> — 🇺🇿 ${this.activeWord.uzbek}. "${this.activeWord.example}"`
          );
        }
      });
    });
  },

  // ========================================================
  // GAME 7: COMPLETE THE SENTENCE (Cloze Reading)
  // ========================================================
  renderCompleteSentenceRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    const targetWord = this.activeWord.word;
    const example = this.activeWord.example || `The concept of ${targetWord} is central to academic study.`;
    
    // Replace word in example sentence with blank
    const regex = new RegExp(`\\b${targetWord}\\b`, "i");
    const sentenceWithBlank = example.replace(regex, `_________`);

    // Pick 3 distractors of same part of speech if possible
    const distractors = all
      .filter(w => w.id !== this.activeWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [this.activeWord, ...distractors].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 border border-fuchsia-200 dark:border-fuchsia-800">Complete the Sentence</span>
          <span class="text-xs text-slate-400 italic">Select the best context fit</span>
        </div>

        <!-- Sentence Card -->
        <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Contextual Sentence</div>
          <p id="cs-sentence-text" class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
            "${sentenceWithBlank}"
          </p>
          ${this.activeWord.uzbekSentence ? `
            <div class="text-xs text-brand-600 dark:text-brand-400 font-medium">
              🇺🇿 "${this.activeWord.uzbekSentence}"
            </div>
          ` : ''}
        </div>

        <!-- 4 Multiple Choice Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="cs-options-grid">
          ${options.map((opt, i) => `
            <button class="cs-option-btn p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-brand-500 font-extrabold text-sm sm:text-base text-slate-800 dark:text-white transition-all flex items-center justify-between" data-word-id="${opt.id}">
              <div class="text-left">
                <div>${opt.word}</div>
                <div class="text-[11px] text-slate-400 font-normal">🇺🇿 ${opt.uzbek}</div>
              </div>
              <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center justify-center font-bold">${['A', 'B', 'C', 'D'][i]}</span>
            </button>
          `).join("")}
        </div>

        <div id="cs-feedback-area"></div>
      </div>
    `;

    stage.querySelectorAll(".cs-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        stage.querySelectorAll(".cs-option-btn").forEach(b => b.disabled = true);
        const selectedId = btn.getAttribute("data-word-id");
        const isCorrect = selectedId === this.activeWord.id;

        const sentEl = document.getElementById("cs-sentence-text");
        if (sentEl) {
          sentEl.innerHTML = `"${example.replace(regex, `<span class="text-emerald-500 underline font-extrabold">${targetWord}</span>`)}"`;
        }

        GameAudio.speakWord(example);

        if (isCorrect) {
          btn.classList.add("bg-emerald-500", "text-white", "border-emerald-600");
        } else {
          btn.classList.add("bg-rose-500", "text-white", "border-rose-600");
          const correctBtn = stage.querySelector(`[data-word-id="${this.activeWord.id}"]`);
          if (correctBtn) correctBtn.classList.add("bg-emerald-100", "dark:bg-emerald-950/60", "border-emerald-500", "text-emerald-700");
        }

        const feedbackContainer = document.getElementById("cs-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(
            feedbackContainer,
            isCorrect,
            `Fit: <strong>${targetWord}</strong> — ${this.activeWord.definition}`
          );
        }
      });
    });
  },

  // ========================================================
  // GAME 8: MEMORY CARDS (Concentration Pair Matching)
  // ========================================================
  renderMemoryCardsRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    // Pick 4 words = 8 cards (4 English, 4 Uzbek)
    const pool = all.sort(() => Math.random() - 0.5).slice(0, 4);

    const cards = [];
    pool.forEach(w => {
      cards.push({ id: `en-${w.id}`, wordId: w.id, text: w.word, type: "en", label: "EN" });
      cards.push({ id: `uz-${w.id}`, wordId: w.id, text: w.uzbek, type: "uz", label: "UZ" });
    });
    cards.sort(() => Math.random() - 0.5);

    this.gameData = {
      cards: cards,
      flippedCards: [],
      matchedPairsCount: 0,
      turnsCount: 0,
      isLock: false
    };

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 border border-brand-200 dark:border-brand-800">Memory Cards Matching</span>
          <div class="text-xs font-bold text-slate-400" id="mc-stats-tracker">Turns: 0 · Matched: 0 / 4</div>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Flip face-down cards to discover matching pairs of English words and Uzbek meanings.
        </p>

        <!-- 8 Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 memory-grid max-w-2xl mx-auto py-4">
          ${cards.map((c, i) => `
            <div class="memory-card rounded-2xl" data-card-idx="${i}" data-word-id="${c.wordId}">
              <!-- Card Back (Face Down) -->
              <div class="memory-card-front bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 transition-colors">
                <div class="w-8 h-8 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center text-brand-600 font-display font-extrabold text-sm shadow-xs">
                  W
                </div>
                <span class="text-[10px] font-bold text-slate-400">WORDIFY</span>
              </div>

              <!-- Card Front (Face Up) -->
              <div class="memory-card-back bg-white dark:bg-[#111827] border-2 border-brand-500 shadow-md p-3 flex flex-col items-center justify-center text-center">
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${c.type === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'} mb-1">${c.label}</span>
                <span class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">${c.text}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <div id="mc-feedback-area"></div>
      </div>
    `;

    stage.querySelectorAll(".memory-card").forEach(cardEl => {
      cardEl.addEventListener("click", () => {
        if (this.gameData.isLock) return;
        if (cardEl.classList.contains("is-flipped")) return;

        const idx = parseInt(cardEl.getAttribute("data-card-idx"), 10);
        const cardObj = this.gameData.cards[idx];

        GameAudio.playFlip();
        cardEl.classList.add("is-flipped");
        this.gameData.flippedCards.push({ element: cardEl, data: cardObj });

        if (this.gameData.flippedCards.length === 2) {
          this.gameData.turnsCount++;
          this.checkMemoryMatch();
        }
      });
    });
  },

  checkMemoryMatch() {
    this.gameData.isLock = true;
    const [first, second] = this.gameData.flippedCards;
    const isMatch = first.data.wordId === second.data.wordId;

    const statsEl = document.getElementById("mc-stats-tracker");

    if (isMatch) {
      GameAudio.playSuccess();
      first.element.querySelector(".memory-card-back")?.classList.add("bg-emerald-50", "border-emerald-500");
      second.element.querySelector(".memory-card-back")?.classList.add("bg-emerald-50", "border-emerald-500");
      
      this.gameData.matchedPairsCount++;
      this.score += 25;
      this.xpEarned += 10;
      this.gameData.flippedCards = [];
      this.gameData.isLock = false;

      if (statsEl) statsEl.textContent = `Turns: ${this.gameData.turnsCount} · Matched: ${this.gameData.matchedPairsCount} / 4`;

      if (this.gameData.matchedPairsCount >= 4) {
        const feedbackContainer = document.getElementById("mc-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(
            feedbackContainer,
            true,
            `All memory pairs matched in ${this.gameData.turnsCount} turns! Superb concentration.`
          );
        }
      }
    } else {
      GameAudio.playError();
      setTimeout(() => {
        first.element.classList.remove("is-flipped");
        second.element.classList.remove("is-flipped");
        this.gameData.flippedCards = [];
        this.gameData.isLock = false;
        if (statsEl) statsEl.textContent = `Turns: ${this.gameData.turnsCount} · Matched: ${this.gameData.matchedPairsCount} / 4`;
      }, 850);
    }
  },

  // ========================================================
  // GAME 9: SPELLING CHALLENGE (Audio + Typing)
  // ========================================================
  renderSpellingRound() {
    const stage = document.getElementById("game-stage-content");
    const targetWord = this.activeWord.word;

    setTimeout(() => {
      GameAudio.speakWord(targetWord);
    }, 250);

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 border border-amber-200 dark:border-amber-800">Spelling Challenge</span>
          <button id="sc-hint-btn" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="help-circle" class="w-3.5 h-3.5 text-amber-500"></i>
            <span>Hint (-5 pts)</span>
          </button>
        </div>

        <!-- Audio Player Hero Card -->
        <div class="py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/80 text-center flex flex-col items-center justify-center gap-3">
          <button id="sc-play-audio-btn" class="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 group">
            <i data-lucide="volume-2" class="w-10 h-10 group-hover:scale-110 transition-transform"></i>
          </button>
          <div class="text-sm font-bold text-slate-800 dark:text-white">Listen to the word & type exact spelling</div>
          <button id="sc-play-slow-btn" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            🐢 Hear Slower (0.75x)
          </button>
        </div>

        <div id="sc-hint-box" class="hidden p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 text-center">
          🇺🇿 Uzbek: <strong>${this.activeWord.uzbek}</strong> · Length: <strong>${targetWord.length} letters</strong>
        </div>

        <!-- Spelling Input Form -->
        <form id="sc-form" class="max-w-md mx-auto space-y-3">
          <input type="text" id="sc-input" class="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-base focus:border-amber-500 focus:outline-hidden transition-all text-center tracking-wider" placeholder="Spell the word you heard..." autocomplete="off" autofocus />
          <button type="submit" class="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all">
            Check Spelling
          </button>
        </form>

        <div id="sc-feedback-area"></div>
      </div>
    `;

    setTimeout(() => {
      document.getElementById("sc-input")?.focus();
    }, 150);

    document.getElementById("sc-play-audio-btn")?.addEventListener("click", () => {
      GameAudio.speakWord(targetWord, 1.0);
    });

    document.getElementById("sc-play-slow-btn")?.addEventListener("click", () => {
      GameAudio.speakWord(targetWord, 0.75);
    });

    document.getElementById("sc-hint-btn")?.addEventListener("click", () => {
      this.hintUsedThisRound = true;
      document.getElementById("sc-hint-box")?.classList.remove("hidden");
    });

    const form = document.getElementById("sc-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("sc-input");
        if (!input) return;

        const val = input.value.trim();
        if (!val) return;

        input.disabled = true;
        const isMatch = val.toLowerCase() === targetWord.toLowerCase();

        GameAudio.speakWord(targetWord);

        const feedbackContainer = document.getElementById("sc-feedback-area");
        if (feedbackContainer) {
          if (isMatch) {
            this.showFeedbackCard(feedbackContainer, true, `Flawless spelling! <strong>${targetWord}</strong> — 🇺🇿 ${this.activeWord.uzbek}`);
          } else {
            this.showFeedbackCard(feedbackContainer, false, `You spelled: "<em>${val}</em>" · Correct: <strong>${targetWord}</strong>`);
          }
        }
      });
    }
  },

  // ========================================================
  // GAME 10: SYNONYM MATCH (Two-Column Pairing)
  // ========================================================
  renderSynonymMatchRound() {
    const stage = document.getElementById("game-stage-content");
    const all = typeof Storage !== "undefined" ? Storage.getAllVocabulary() : initialData.vocabulary;
    
    // Pick 4 words that have synonyms
    const pool = all.filter(w => w.synonyms && w.synonyms.length > 0).sort(() => Math.random() - 0.5).slice(0, 4);

    const words = [...pool].sort(() => Math.random() - 0.5);
    const synonyms = pool.map(w => ({ wordId: w.id, synonym: w.synonyms[0] })).sort(() => Math.random() - 0.5);

    this.gameData = {
      matchedCount: 0,
      selectedWordId: null,
      selectedSynonymId: null
    };

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 border border-teal-200 dark:border-teal-800">Synonym Match</span>
          <span class="text-xs font-bold text-slate-400" id="sm-counter">Pairs: 0 / 4</span>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Match each target vocabulary word on the left with its closest synonym on the right.
        </p>

        <!-- 2 Columns: Words & Synonyms -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <!-- Left: Target Words -->
          <div class="space-y-2.5" id="sm-words-col">
            ${words.map(w => `
              <button class="sm-word-btn w-full p-4 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 font-extrabold text-sm sm:text-base text-slate-800 dark:text-white text-left transition-all flex items-center justify-between shadow-xs" data-word-id="${w.id}">
                <div>
                  <div>${w.word}</div>
                  <div class="text-[11px] text-slate-400 font-normal italic">${w.partOfSpeech}</div>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
              </button>
            `).join("")}
          </div>

          <!-- Right: Synonyms -->
          <div class="space-y-2.5" id="sm-syn-col">
            ${synonyms.map(s => `
              <button class="sm-syn-btn w-full p-4 rounded-2xl bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 font-extrabold text-sm sm:text-base text-slate-800 dark:text-white text-left transition-all flex items-center justify-between shadow-xs" data-syn-id="${s.wordId}">
                <span>${s.synonym}</span>
                <i data-lucide="sparkles" class="w-4 h-4 text-teal-500"></i>
              </button>
            `).join("")}
          </div>
        </div>

        <div id="sm-feedback-area"></div>
      </div>
    `;

    // Word button selection
    stage.querySelectorAll(".sm-word-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("item-match-connected")) return;
        stage.querySelectorAll(".sm-word-btn").forEach(b => b.classList.remove("item-match-selected"));
        btn.classList.add("item-match-selected");
        this.gameData.selectedWordId = btn.getAttribute("data-word-id");
        this.checkSynonymMatch();
      });
    });

    // Synonym button selection
    stage.querySelectorAll(".sm-syn-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("item-match-connected")) return;
        stage.querySelectorAll(".sm-syn-btn").forEach(b => b.classList.remove("item-match-selected"));
        btn.classList.add("item-match-selected");
        this.gameData.selectedSynonymId = btn.getAttribute("data-syn-id");
        this.checkSynonymMatch();
      });
    });
  },

  checkSynonymMatch() {
    if (!this.gameData.selectedWordId || !this.gameData.selectedSynonymId) return;

    const wordBtn = document.querySelector(`.sm-word-btn[data-word-id="${this.gameData.selectedWordId}"]`);
    const synBtn = document.querySelector(`.sm-syn-btn[data-syn-id="${this.gameData.selectedSynonymId}"]`);
    if (!wordBtn || !synBtn) return;

    if (this.gameData.selectedWordId === this.gameData.selectedSynonymId) {
      // MATCH!
      GameAudio.playSuccess();
      wordBtn.classList.remove("item-match-selected");
      wordBtn.classList.add("item-match-connected", "border-emerald-500", "bg-emerald-50", "dark:bg-emerald-950/40");
      synBtn.classList.remove("item-match-selected");
      synBtn.classList.add("item-match-connected", "border-emerald-500", "bg-emerald-50", "dark:bg-emerald-950/40");

      this.gameData.matchedCount++;
      this.score += 25;
      this.xpEarned += 10;
      this.gameData.selectedWordId = null;
      this.gameData.selectedSynonymId = null;

      const counter = document.getElementById("sm-counter");
      if (counter) counter.textContent = `Pairs: ${this.gameData.matchedCount} / 4`;

      if (this.gameData.matchedCount >= 4) {
        const feedbackContainer = document.getElementById("sm-feedback-area");
        if (feedbackContainer) {
          this.showFeedbackCard(feedbackContainer, true, "All 4 academic synonyms successfully matched!");
        }
      }
    } else {
      // MISMATCH
      GameAudio.playError();
      wordBtn.classList.add("game-shake", "border-rose-500");
      synBtn.classList.add("game-shake", "border-rose-500");
      setTimeout(() => {
        wordBtn.classList.remove("game-shake", "border-rose-500", "item-match-selected");
        synBtn.classList.remove("game-shake", "border-rose-500", "item-match-selected");
        this.gameData.selectedWordId = null;
        this.gameData.selectedSynonymId = null;
      }, 400);
    }
  },

  // ========================================================
  // 5. FINAL RESULTS SCREEN
  // ========================================================
  finishGame() {
    const stage = document.getElementById("game-stage-content");
    if (!stage) return;

    const accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);
    const finalScore = this.score;
    const finalXp = this.xpEarned;

    // Persist to Storage
    if (typeof Storage !== "undefined" && Storage.recordGamePlayed) {
      Storage.recordGamePlayed(this.activeGameId, finalScore, finalXp, accuracy);
    }

    // Refresh Dashboard Header stats
    if (typeof updateDashboardMetrics === "function") {
      updateDashboardMetrics();
    }

    // Play celebration chime
    GameAudio.playSuccess();

    stage.innerHTML = `
      <div class="max-w-xl mx-auto w-full text-center py-6 space-y-6">
        <div class="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <i data-lucide="trophy" class="w-10 h-10"></i>
        </div>

        <div>
          <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Challenge Completed! 🎉</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Excellent drill session. All earned XP and accuracy metrics have been saved.</p>
        </div>

        <!-- 3 Performance Metric Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Score</div>
            <div class="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1">${finalScore}</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
            <div class="font-display font-extrabold text-xl text-emerald-600 mt-1">${accuracy}%</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Awarded</div>
            <div class="font-display font-extrabold text-xl text-brand-600 mt-1">+${finalXp} XP</div>
          </div>
        </div>

        <!-- Words Reviewed List -->
        ${this.sessionWords.length > 0 ? `
          <div class="text-left bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Words Practiced in this Game</div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              ${this.sessionWords.map(w => `
                <div class="py-2 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2.5">
                    <button class="audio-btn p-1.5 rounded-lg text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700" data-pronounce="${w.word}">
                      <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white">${w.word}</span>
                      <span class="text-brand-600 font-semibold ml-1">(${w.uzbek})</span>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${w.level}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="flex items-center gap-3 justify-center pt-2">
          <button id="results-play-again-btn" class="px-7 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            <span>Play Again</span>
          </button>
          <button id="results-exit-btn" class="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors">
            Back to All Games
          </button>
        </div>
      </div>
    `;

    document.getElementById("results-play-again-btn")?.addEventListener("click", () => {
      this.startGame(this.activeGameId, this.difficulty);
    });

    document.getElementById("results-exit-btn")?.addEventListener("click", () => {
      this.exitToHub();
    });

    if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
  }
};
