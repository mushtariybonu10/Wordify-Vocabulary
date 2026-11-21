/**
 * WORDIFY - Storage & State Management
 * Persistent Storage Architecture for Vocabulary, CEFR Levels, Favorites, Difficulties, and Audio Settings
 */

const STORAGE_KEYS = {
  THEME: "wordify_theme",
  USER: "wordify_user",
  VOCAB_STATE: "wordify_vocab_state",
  SELECTED_LEVEL: "wordify_selected_level",
  REVIEW_QUEUE: "wordify_review_queue",
  SETTINGS: "wordify_settings",
  GAME_STATS: "wordify_game_stats"
};

const Storage = {
  // ----------------------------------------------------
  // 1. Theme Management
  // ----------------------------------------------------
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  },

  initTheme() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const savedTheme = this.getTheme();
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }
  },

  // ----------------------------------------------------
  // 2. User Stats & Gamification
  // ----------------------------------------------------
  getUser() {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      this.saveUser(initialData.user);
      return { ...initialData.user };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return { ...initialData.user };
    }
  },

  saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  updateUser(updates) {
    const current = this.getUser();
    const updated = { ...current, ...updates };
    this.saveUser(updated);
    return updated;
  },

  addXP(points) {
    const user = this.getUser();
    user.xp = (user.xp || 0) + points;
    if (user.xp >= user.xpToNextLevel) {
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.35);
    }
    this.saveUser(user);
    return user;
  },

  recordWordLearned() {
    const user = this.getUser();
    user.wordsLearnedToday = (user.wordsLearnedToday || 0) + 1;
    user.totalWordsLearned = (user.totalWordsLearned || 0) + 1;
    this.saveUser(user);
    return user;
  },

  // ----------------------------------------------------
  // 3. Selected CEFR Level Persistence
  // ----------------------------------------------------
  getSelectedLevel() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_LEVEL) || "all";
  },

  setSelectedLevel(level) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_LEVEL, level || "all");
    return level;
  },

  // ----------------------------------------------------
  // 4. Vocabulary Learning State (Mastered, Difficult, Favorite)
  // ----------------------------------------------------
  getVocabStateMap() {
    const data = localStorage.getItem(STORAGE_KEYS.VOCAB_STATE);
    if (!data) {
      // Seed initial states for a few sample words
      const initialMap = {
        "v-a1-1": { isMastered: true, isDifficult: false, isFavorite: true },
        "v-a1-5": { isMastered: true, isDifficult: false, isFavorite: false },
        "v-b1-1": { isMastered: false, isDifficult: true, isFavorite: true },
        "v-b2-11": { isMastered: true, isDifficult: false, isFavorite: true },
        "v-c1-1": { isMastered: true, isDifficult: false, isFavorite: true },
        "v-c1-3": { isMastered: false, isDifficult: true, isFavorite: false },
        "v-c1-5": { isMastered: false, isDifficult: true, isFavorite: true }
      };
      this.saveVocabStateMap(initialMap);
      return initialMap;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  },

  saveVocabStateMap(map) {
    localStorage.setItem(STORAGE_KEYS.VOCAB_STATE, JSON.stringify(map));
  },

  getAllVocabulary() {
    const stateMap = this.getVocabStateMap();
    return initialData.vocabulary.map(item => {
      const state = stateMap[item.id] || {};
      return {
        ...item,
        isMastered: state.isMastered || false,
        isDifficult: state.isDifficult || false,
        isFavorite: state.isFavorite || false,
        dateLearned: state.dateLearned || null
      };
    });
  },

  getVocabularyWord(id) {
    const list = this.getAllVocabulary();
    return list.find(w => w.id === id) || null;
  },

  toggleFavorite(id) {
    const stateMap = this.getVocabStateMap();
    if (!stateMap[id]) stateMap[id] = {};
    stateMap[id].isFavorite = !stateMap[id].isFavorite;
    this.saveVocabStateMap(stateMap);
    return stateMap[id].isFavorite;
  },

  toggleDifficult(id) {
    const stateMap = this.getVocabStateMap();
    if (!stateMap[id]) stateMap[id] = {};
    stateMap[id].isDifficult = !stateMap[id].isDifficult;
    if (stateMap[id].isDifficult) {
      stateMap[id].isMastered = false;
    }
    this.saveVocabStateMap(stateMap);
    this.syncStatsWithVocab();
    return stateMap[id].isDifficult;
  },

  markKnown(id, isKnown = true) {
    const stateMap = this.getVocabStateMap();
    if (!stateMap[id]) stateMap[id] = {};
    const previouslyMastered = !!stateMap[id].isMastered;
    stateMap[id].isMastered = isKnown;
    if (isKnown) {
      stateMap[id].isDifficult = false;
      stateMap[id].dateLearned = new Date().toISOString().split("T")[0];
      if (!previouslyMastered) {
        this.addXP(15);
        this.recordWordLearned();
      }
    }
    this.saveVocabStateMap(stateMap);
    this.syncStatsWithVocab();
    return isKnown;
  },

  markDifficult(id, isDifficult = true) {
    const stateMap = this.getVocabStateMap();
    if (!stateMap[id]) stateMap[id] = {};
    stateMap[id].isDifficult = isDifficult;
    if (isDifficult) {
      stateMap[id].isMastered = false;
    }
    this.saveVocabStateMap(stateMap);
    this.syncStatsWithVocab();
    return isDifficult;
  },

  syncStatsWithVocab() {
    const list = this.getAllVocabulary();
    const masteredCount = list.filter(w => w.isMastered).length;
    const learningCount = list.length - masteredCount;
    this.updateUser({
      wordsMastered: masteredCount,
      wordsLearning: learningCount
    });
  },

  // ----------------------------------------------------
  // 5. Search and Multi-Criteria Filtering
  // ----------------------------------------------------
  getFilteredVocabulary({ search = "", level = "all", category = "all", status = "all" } = {}) {
    let list = this.getAllVocabulary();

    // 1. Search Query: Matches English word, Uzbek translation, definition, and category
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item => {
        return (
          item.word.toLowerCase().includes(q) ||
          item.uzbek.toLowerCase().includes(q) ||
          (item.definition && item.definition.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.example && item.example.toLowerCase().includes(q))
        );
      });
    }

    // 2. CEFR Level Filter
    if (level && level !== "all") {
      list = list.filter(item => item.level === level);
    }

    // 3. Category Filter
    if (category && category !== "all") {
      list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // 4. Status Filter
    if (status === "favorite") {
      list = list.filter(item => item.isFavorite);
    } else if (status === "difficult") {
      list = list.filter(item => item.isDifficult);
    } else if (status === "mastered" || status === "known") {
      list = list.filter(item => item.isMastered);
    } else if (status === "learning") {
      list = list.filter(item => !item.isMastered);
    }

    return list;
  },

  // Custom Word Creation (For Dictionary Add Modal)
  addCustomWord(wordObj) {
    const customId = "v-custom-" + Date.now();
    const newWord = {
      id: customId,
      domain: "General",
      level: wordObj.level || "B1",
      category: wordObj.category || "Daily Life",
      image: wordObj.image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
      synonyms: [],
      ...wordObj
    };
    initialData.vocabulary.unshift(newWord);
    
    // Save state
    const stateMap = this.getVocabStateMap();
    stateMap[customId] = {
      isMastered: false,
      isDifficult: false,
      isFavorite: false,
      dateLearned: null
    };
    this.saveVocabStateMap(stateMap);
    this.addXP(20);
    this.syncStatsWithVocab();
    return newWord;
  },

  deleteVocabularyWord(id) {
    const idx = initialData.vocabulary.findIndex(w => w.id === id);
    if (idx !== -1) {
      initialData.vocabulary.splice(idx, 1);
    }
    const stateMap = this.getVocabStateMap();
    delete stateMap[id];
    this.saveVocabStateMap(stateMap);
    this.syncStatsWithVocab();
    return true;
  },

  // ----------------------------------------------------
  // 6. Review Queue (Spaced Repetition)
  // ----------------------------------------------------
  getReviewQueue() {
    const list = this.getAllVocabulary();
    // Return difficult words or unmastered words prioritized
    const difficultWords = list.filter(w => w.isDifficult);
    const unmastered = list.filter(w => !w.isMastered && !w.isDifficult).slice(0, 8);
    const combined = [...difficultWords, ...unmastered];
    
    return combined.map((item, idx) => ({
      id: item.id,
      word: item.word,
      uzbek: item.uzbek,
      phonetic: item.phonetic,
      partOfSpeech: item.partOfSpeech,
      definition: item.definition,
      example: item.example,
      uzbekSentence: item.uzbekSentence,
      level: item.level,
      category: item.category,
      image: item.image,
      dueInterval: item.isDifficult ? "Urgent (Difficult)" : "Today",
      retentionScore: item.isDifficult ? 45 : 75 + (idx % 20),
      urgency: item.isDifficult ? "urgent" : "moderate"
    }));
  },

  completeReviewCard(cardId, rating) {
    const xpMap = { hard: 5, good: 10, easy: 15 };
    const xpEarned = xpMap[rating] || 10;
    this.addXP(xpEarned);

    if (rating === "easy") {
      this.markKnown(cardId, true);
    } else if (rating === "hard") {
      this.markDifficult(cardId, true);
    }

    return { remaining: this.getReviewQueue().length, xpEarned };
  },

  // ----------------------------------------------------
  // 7. Settings & Audio Configuration
  // ----------------------------------------------------
  getSettings() {
    const defaultSettings = {
      accentVoice: "en-US", // "en-US" (American) or "en-GB" (British)
      playbackSpeed: 1.0,   // 0.8, 1.0, 1.2
      soundEffects: true,
      dailyReminder: true,
      dailyGoalWords: 20,
      targetGoal: "IELTS Band 8.5"
    };
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // ----------------------------------------------------
  // 8. Game Arena Analytics & Statistics
  // ----------------------------------------------------
  getGameStats() {
    const defaultStats = {
      totalGamesPlayed: 8,
      totalGameXp: 320,
      highScores: {
        "game-missing-letters": 95,
        "game-word-picture-match": 100,
        "game-unscramble": 90,
        "game-listen-choose": 100,
        "game-translation": 85,
        "game-guess-picture": 90,
        "game-complete-sentence": 100,
        "game-memory-cards": 100,
        "game-spelling-challenge": 90,
        "game-synonym-match": 95
      },
      gamesPlayedMap: {
        "game-missing-letters": 2,
        "game-word-picture-match": 1,
        "game-unscramble": 1,
        "game-listen-choose": 2,
        "game-translation": 1,
        "game-guess-picture": 1
      }
    };
    const data = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (!data) return defaultStats;
    try {
      return { ...defaultStats, ...JSON.parse(data) };
    } catch (e) {
      return defaultStats;
    }
  },

  saveGameStats(stats) {
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  },

  recordGamePlayed(gameId, score, xpEarned, accuracy = 100) {
    const stats = this.getGameStats();
    stats.totalGamesPlayed = (stats.totalGamesPlayed || 0) + 1;
    stats.totalGameXp = (stats.totalGameXp || 0) + xpEarned;
    
    if (!stats.highScores) stats.highScores = {};
    if (!stats.highScores[gameId] || score > stats.highScores[gameId]) {
      stats.highScores[gameId] = score;
    }

    if (!stats.gamesPlayedMap) stats.gamesPlayedMap = {};
    stats.gamesPlayedMap[gameId] = (stats.gamesPlayedMap[gameId] || 0) + 1;

    this.saveGameStats(stats);
    this.addXP(xpEarned);
    this.recordWordLearned(); // counts towards daily progress
    return stats;
  },

  // ----------------------------------------------------
  // 9. Factory Reset
  // ----------------------------------------------------
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.VOCAB_STATE);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_LEVEL);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
    location.reload();
  }
};

// Initialize theme immediately
Storage.initTheme();
