/**
 * WORDIFY - Storage & State Management
 * Handles localStorage persistence and data operations
 */

const STORAGE_KEYS = {
  THEME: "wordify_theme",
  USER: "wordify_user",
  DICTIONARY: "wordify_dictionary",
  FLASHCARDS: "wordify_flashcards",
  REVIEW_QUEUE: "wordify_review_queue",
  SETTINGS: "wordify_settings"
};

const Storage = {
  // Theme management
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  initTheme() {
    const savedTheme = this.getTheme();
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }
  },

  // User profile & stats
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
    user.xp += points;
    if (user.xp >= user.xpToNextLevel) {
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.35);
    }
    this.saveUser(user);
    return user;
  },

  recordWordLearned() {
    const user = this.getUser();
    user.wordsLearnedToday += 1;
    user.totalWordsLearned += 1;
    this.saveUser(user);
    return user;
  },

  // Dictionary management
  getDictionary() {
    const data = localStorage.getItem(STORAGE_KEYS.DICTIONARY);
    if (!data) {
      this.saveDictionary(initialData.dictionary);
      return [...initialData.dictionary];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [...initialData.dictionary];
    }
  },

  saveDictionary(list) {
    localStorage.setItem(STORAGE_KEYS.DICTIONARY, JSON.stringify(list));
  },

  addDictionaryWord(wordObj) {
    const list = this.getDictionary();
    const newWord = {
      id: "dict-" + Date.now(),
      dateAdded: new Date().toISOString().split("T")[0],
      isMastered: false,
      isStarred: false,
      ...wordObj
    };
    list.unshift(newWord);
    this.saveDictionary(list);
    return newWord;
  },

  deleteDictionaryWord(id) {
    let list = this.getDictionary();
    list = list.filter(item => item.id !== id);
    this.saveDictionary(list);
    return list;
  },

  toggleBookmark(id) {
    const list = this.getDictionary();
    const item = list.find(w => w.id === id);
    if (item) {
      item.isStarred = !item.isStarred;
      this.saveDictionary(list);
      return item.isStarred;
    }
    return false;
  },

  toggleMastered(id) {
    const list = this.getDictionary();
    const item = list.find(w => w.id === id);
    if (item) {
      item.isMastered = !item.isMastered;
      this.saveDictionary(list);
      // update user count
      const user = this.getUser();
      if (item.isMastered) {
        user.wordsMastered += 1;
        user.wordsLearning = Math.max(0, user.wordsLearning - 1);
      } else {
        user.wordsMastered = Math.max(0, user.wordsMastered - 1);
        user.wordsLearning += 1;
      }
      this.saveUser(user);
      return item.isMastered;
    }
    return false;
  },

  // Flashcards state
  getFlashcardDecks() {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!data) {
      this.saveFlashcardDecks(initialData.flashcardDecks);
      return { ...initialData.flashcardDecks };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return { ...initialData.flashcardDecks };
    }
  },

  saveFlashcardDecks(decks) {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(decks));
  },

  updateCardMastery(deckKey, cardId, isMastered) {
    const decks = this.getFlashcardDecks();
    if (decks[deckKey]) {
      const card = decks[deckKey].cards.find(c => c.id === cardId);
      if (card) {
        card.mastered = isMastered;
        this.saveFlashcardDecks(decks);
      }
    }
  },

  // Review Queue (Spaced Repetition)
  getReviewQueue() {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEW_QUEUE);
    if (!data) {
      this.saveReviewQueue(initialData.reviewQueue);
      return [...initialData.reviewQueue];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [...initialData.reviewQueue];
    }
  },

  saveReviewQueue(queue) {
    localStorage.setItem(STORAGE_KEYS.REVIEW_QUEUE, JSON.stringify(queue));
  },

  completeReviewCard(cardId, rating) {
    let queue = this.getReviewQueue();
    queue = queue.filter(item => item.id !== cardId);
    this.saveReviewQueue(queue);

    // Award XP based on rating
    const xpMap = { hard: 5, good: 10, easy: 15 };
    const xpEarned = xpMap[rating] || 10;
    this.addXP(xpEarned);

    return { remaining: queue.length, xpEarned };
  },

  // Settings
  getSettings() {
    const defaultSettings = {
      accentVoice: "en-US",
      playbackSpeed: 1.0,
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

  // Reset demo data
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.DICTIONARY);
    localStorage.removeItem(STORAGE_KEYS.FLASHCARDS);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    location.reload();
  }
};

// Initialize theme on script load
Storage.initTheme();
