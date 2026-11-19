/**
 * WORDIFY - English Vocabulary Learning Platform
 * Initial Data Store & Seed Information
 */

const initialData = {
  // Current user state
  user: {
    name: "Alex Morgan",
    email: "alex.morgan@wordify.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    level: 14,
    levelTitle: "Polyglot Apprentice",
    xp: 1420,
    xpToNextLevel: 2000,
    currentStreak: 14,
    freezeActive: true,
    wordsLearnedToday: 15,
    dailyGoal: 20,
    totalWordsLearned: 482,
    wordsMastered: 310,
    wordsLearning: 172,
    league: "Diamond League",
    leagueRank: 5,
    retentionRate: 94
  },

  // Weekly study metrics
  weeklyActivity: [
    { day: "Mon", words: 18, xp: 180, minutes: 25, active: true },
    { day: "Tue", words: 22, xp: 220, minutes: 30, active: true },
    { day: "Wed", words: 15, xp: 150, minutes: 20, active: true },
    { day: "Thu", words: 25, xp: 260, minutes: 35, active: true },
    { day: "Fri", words: 20, xp: 210, minutes: 28, active: true },
    { day: "Sat", words: 12, xp: 140, minutes: 18, active: true },
    { day: "Sun", words: 15, xp: 160, minutes: 22, active: true, isToday: true }
  ],

  // Today's featured word
  todayWord: {
    id: "word-today",
    word: "Serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    partOfSpeech: "noun",
    level: "C1",
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    example: "A fortunate stroke of serendipity brought the two researchers together at the international symposium.",
    synonyms: ["providence", "fluke", "happy chance", "coincidence"],
    collocations: ["pure serendipity", "stroke of serendipity", "rare serendipity"],
    isSaved: false
  },

  // Active module card for Continue Learning
  continueModule: {
    id: "unit-c1-collocations",
    title: "Advanced C1 Idioms & Collocations",
    subtitle: "High-level nuance for essays and natural dialogue",
    category: "Academic & Professional",
    progress: 68,
    wordsCount: 35,
    completedCount: 24,
    nextWord: "Barking up the wrong tree",
    estimatedMinutes: 6,
    badgeColor: "purple"
  },

  // Learn Units / Modules
  learningUnits: [
    {
      id: "unit-1",
      title: "Essential Everyday Phrasal Verbs",
      level: "B1",
      category: "Conversational",
      icon: "message-circle",
      totalWords: 30,
      completedWords: 30,
      progress: 100,
      status: "completed",
      description: "Master multi-word verbs used daily by native speakers in informal contexts."
    },
    {
      id: "unit-2",
      title: "Business & Workplace Fluency",
      level: "B2",
      category: "Professional",
      icon: "briefcase",
      totalWords: 40,
      completedWords: 34,
      progress: 85,
      status: "in-progress",
      description: "Crucial vocabulary for negotiations, presentations, and executive memos."
    },
    {
      id: "unit-3",
      title: "Academic & IELTS Band 8+ Vocabulary",
      level: "C1",
      category: "Academic",
      icon: "graduation-cap",
      totalWords: 50,
      completedWords: 34,
      progress: 68,
      status: "in-progress",
      description: "High-utility academic lexicon for writing Task 2 essays and formal discourse."
    },
    {
      id: "unit-4",
      title: "Expressive Adjectives & Nuance",
      level: "C2",
      category: "Literature",
      icon: "feather",
      totalWords: 35,
      completedWords: 7,
      progress: 20,
      status: "in-progress",
      description: "Vivid descriptors to elevate your expression from standard to eloquent."
    },
    {
      id: "unit-5",
      title: "Science, Tech & AI Discourse",
      level: "B2-C1",
      category: "Technology",
      icon: "cpu",
      totalWords: 45,
      completedWords: 0,
      progress: 0,
      status: "ready",
      description: "Modern terms for artificial intelligence, climate innovation, and biotech."
    },
    {
      id: "unit-6",
      title: "Diplomacy, Law & Politics",
      level: "C2",
      category: "Advanced",
      icon: "scale",
      totalWords: 40,
      completedWords: 0,
      progress: 0,
      status: "ready",
      description: "Institutional vocabulary for debate, international relations, and legal reasoning."
    }
  ],

  // Flashcards Study Sets
  flashcardDecks: {
    "c1-academic": {
      name: "IELTS Band 8+ Academic Lexicon",
      category: "IELTS & TOEFL",
      level: "C1-C2",
      cards: [
        {
          id: "fc-1",
          word: "Ubiquitous",
          phonetic: "/juːˈbɪk.wɪ.təs/",
          partOfSpeech: "adjective",
          definition: "Present, appearing, or found everywhere at the same time.",
          example: "Smartphones have become ubiquitous in both developed and developing societies.",
          synonyms: ["omnipresent", "pervasive", "universal"],
          antonyms: ["rare", "scarce"],
          collocations: ["ubiquitous presence", "become ubiquitous"],
          level: "C1",
          mastered: false
        },
        {
          id: "fc-2",
          word: "Exacerbate",
          phonetic: "/ɪɡˈzæs.ə.beɪt/",
          partOfSpeech: "verb",
          definition: "To make a problem, bad situation, or negative feeling worse.",
          example: "Unplanned urbanization can exacerbate traffic congestion and air pollution.",
          synonyms: ["aggravate", "worsen", "inflame"],
          antonyms: ["alleviate", "ameliorate"],
          collocations: ["exacerbate the crisis", "further exacerbate"],
          level: "C1",
          mastered: true
        },
        {
          id: "fc-3",
          word: "Ameliorate",
          phonetic: "/əˈmiːl.jə.reɪt/",
          partOfSpeech: "verb",
          definition: "To make something bad or unsatisfactory better.",
          example: "Government subsidies were introduced to ameliorate the economic hardship faced by farmers.",
          synonyms: ["improve", "enhance", "relieve"],
          antonyms: ["deteriorate", "exacerbate"],
          collocations: ["ameliorate conditions", "ameliorate poverty"],
          level: "C2",
          mastered: false
        },
        {
          id: "fc-4",
          word: "Pragmatic",
          phonetic: "/præɡˈmæt.ɪk/",
          partOfSpeech: "adjective",
          definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
          example: "We need to adopt a pragmatic approach to renewable energy adoption.",
          synonyms: ["practical", "down-to-earth", "utilitarian"],
          antonyms: ["idealistic", "impractical"],
          collocations: ["pragmatic solution", "pragmatic approach"],
          level: "C1",
          mastered: true
        },
        {
          id: "fc-5",
          word: "Ephemeral",
          phonetic: "/ɪˈfem.ər.əl/",
          partOfSpeech: "adjective",
          definition: "Lasting for a very short time; transitory.",
          example: "Social media trends are often ephemeral, vanishing within a matter of days.",
          synonyms: ["fleeting", "transient", "momentary"],
          antonyms: ["permanent", "enduring"],
          collocations: ["ephemeral nature", "ephemeral pleasures"],
          level: "C2",
          mastered: false
        },
        {
          id: "fc-6",
          word: "Corroborate",
          phonetic: "/kəˈrɒb.ə.reɪt/",
          partOfSpeech: "verb",
          definition: "To confirm or give support to a statement, theory, or finding with evidence.",
          example: "Subsequent empirical studies corroborated the scientist's initial hypothesis.",
          synonyms: ["substantiate", "verify", "validate"],
          antonyms: ["refute", "contradict"],
          collocations: ["corroborate evidence", "corroborate findings"],
          level: "C1",
          mastered: false
        }
      ]
    },
    "business-english": {
      name: "Executive Business English",
      category: "Corporate",
      level: "B2-C1",
      cards: [
        {
          id: "fc-b1",
          word: "Leverage",
          phonetic: "/ˈlev.ər.ɪdʒ/",
          partOfSpeech: "verb",
          definition: "To use something to maximum advantage.",
          example: "The firm seeks to leverage its strong brand equity to expand into emerging markets.",
          synonyms: ["utilize", "exploit", "capitalize on"],
          collocations: ["leverage assets", "strategic leverage"],
          level: "B2",
          mastered: true
        },
        {
          id: "fc-b2",
          word: "Synergy",
          phonetic: "/ˈsɪn.ə.dʒi/",
          partOfSpeech: "noun",
          definition: "The interaction of elements that when combined produce a total effect that is greater than the sum of the individual elements.",
          example: "The merger generated significant operational synergies across both regional offices.",
          synonyms: ["collaboration", "cooperation", "harmony"],
          collocations: ["create synergy", "synergistic effect"],
          level: "B2",
          mastered: false
        },
        {
          id: "fc-b3",
          word: "Discrepancy",
          phonetic: "/dɪˈskrep.ən.si/",
          partOfSpeech: "noun",
          definition: "An illogical or surprising lack of compatibility or similarity between two or more facts.",
          example: "The auditor identified a notable discrepancy between the receipts and quarterly reports.",
          synonyms: ["inconsistency", "variance", "disparity"],
          collocations: ["glaring discrepancy", "reconcile discrepancies"],
          level: "B2",
          mastered: true
        }
      ]
    }
  },

  // Vocabulary words for My Dictionary
  dictionary: [
    {
      id: "dict-1",
      word: "Serendipity",
      phonetic: "/ˌser.ənˈdɪp.ə.ti/",
      partOfSpeech: "noun",
      level: "C1",
      definition: "The occurrence and development of events by chance in a happy or beneficial way.",
      example: "Finding my dream mentor was pure serendipity at an unexpected tech seminar.",
      tags: ["Emotion", "Casual", "Literary"],
      dateAdded: "2026-11-19",
      isMastered: false,
      isStarred: true
    },
    {
      id: "dict-2",
      word: "Ubiquitous",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      partOfSpeech: "adjective",
      level: "C1",
      definition: "Present, appearing, or found everywhere simultaneously.",
      example: "Fast wireless internet has become ubiquitous in metropolitan cafes.",
      tags: ["Academic", "Technology", "IELTS"],
      dateAdded: "2026-11-18",
      isMastered: true,
      isStarred: true
    },
    {
      id: "dict-3",
      word: "Exacerbate",
      phonetic: "/ɪɡˈzæs.ə.beɪt/",
      partOfSpeech: "verb",
      level: "C1",
      definition: "To make a bad situation, problem, or pain even worse.",
      example: "Lack of sleep can severely exacerbate feelings of workplace anxiety.",
      tags: ["IELTS", "Health", "Formal"],
      dateAdded: "2026-11-17",
      isMastered: true,
      isStarred: false
    },
    {
      id: "dict-4",
      word: "Ameliorate",
      phonetic: "/əˈmiːl.jə.reɪt/",
      partOfSpeech: "verb",
      level: "C2",
      definition: "To make something bad or unsatisfactory noticeably better.",
      example: "Proper urban green spaces ameliorate both temperature and public wellbeing.",
      tags: ["Environment", "Academic", "IELTS"],
      dateAdded: "2026-11-16",
      isMastered: false,
      isStarred: true
    },
    {
      id: "dict-5",
      word: "Pragmatic",
      phonetic: "/præɡˈmæt.ɪk/",
      partOfSpeech: "adjective",
      level: "C1",
      definition: "Dealing with matters based on practical facts rather than theoretical ideas.",
      example: "Engineers tend to favor pragmatic and cost-effective design decisions.",
      tags: ["Business", "Philosophy", "Everyday"],
      dateAdded: "2026-11-15",
      isMastered: true,
      isStarred: false
    },
    {
      id: "dict-6",
      word: "Ephemeral",
      phonetic: "/ɪˈfem.ər.əl/",
      partOfSpeech: "adjective",
      level: "C2",
      definition: "Lasting for a brief or fleeting period of time.",
      example: "The cherry blossoms provide an ephemeral beauty each early spring.",
      tags: ["Nature", "Literary", "Poetic"],
      dateAdded: "2026-11-14",
      isMastered: false,
      isStarred: false
    },
    {
      id: "dict-7",
      word: "Corroborate",
      phonetic: "/kəˈrɒb.ə.reɪt/",
      partOfSpeech: "verb",
      level: "C1",
      definition: "To confirm or support a statement or finding with solid evidence.",
      example: "Eyewitness testimonies corroborated the security camera footage.",
      tags: ["Law", "Academic", "Journalism"],
      dateAdded: "2026-11-12",
      isMastered: false,
      isStarred: true
    },
    {
      id: "dict-8",
      word: "Resilient",
      phonetic: "/rɪˈzɪl.jənt/",
      partOfSpeech: "adjective",
      level: "B2",
      definition: "Able to withstand or recover quickly from difficult conditions.",
      example: "Children are often remarkably resilient when adjusting to new surroundings.",
      tags: ["Psychology", "Personal", "Everyday"],
      dateAdded: "2026-11-10",
      isMastered: true,
      isStarred: false
    },
    {
      id: "dict-9",
      word: "Eloquent",
      phonetic: "/ˈel.ə.kwənt/",
      partOfSpeech: "adjective",
      level: "C1",
      definition: "Fluent or persuasive in speaking or writing.",
      example: "Her eloquent keynote speech moved the entire auditorium to a standing ovation.",
      tags: ["Speech", "Communication"],
      dateAdded: "2026-11-08",
      isMastered: true,
      isStarred: false
    },
    {
      id: "dict-10",
      word: "Juxtaposition",
      phonetic: "/ˌdʒʌk.stə.pəˈzɪʃ.ən/",
      partOfSpeech: "noun",
      level: "C2",
      definition: "The fact of two things being seen or placed close together with contrasting effect.",
      example: "The juxtaposition of traditional wooden huts against modern glass skyscrapers was striking.",
      tags: ["Art", "Literature", "Architecture"],
      dateAdded: "2026-11-05",
      isMastered: false,
      isStarred: true
    }
  ],

  // Words that need review in the Spaced Repetition queue
  reviewQueue: [
    {
      id: "rev-1",
      word: "Ephemeral",
      phonetic: "/ɪˈfem.ər.əl/",
      partOfSpeech: "adjective",
      definition: "Lasting for a very brief time.",
      dueInterval: "Today",
      retentionScore: 60,
      urgency: "urgent",
      timesReviewed: 3
    },
    {
      id: "rev-2",
      word: "Ameliorate",
      phonetic: "/əˈmiːl.jə.reɪt/",
      partOfSpeech: "verb",
      definition: "To make a bad or painful situation better.",
      dueInterval: "Today",
      retentionScore: 72,
      urgency: "urgent",
      timesReviewed: 4
    },
    {
      id: "rev-3",
      word: "Corroborate",
      phonetic: "/kəˈrɒb.ə.reɪt/",
      partOfSpeech: "verb",
      definition: "To confirm with evidence or proof.",
      dueInterval: "Today",
      retentionScore: 68,
      urgency: "urgent",
      timesReviewed: 2
    },
    {
      id: "rev-4",
      word: "Juxtaposition",
      phonetic: "/ˌdʒʌk.stə.pəˈzɪʃ.ən/",
      partOfSpeech: "noun",
      definition: "Placing contrasting things side-by-side.",
      dueInterval: "Today",
      retentionScore: 75,
      urgency: "moderate",
      timesReviewed: 5
    },
    {
      id: "rev-5",
      word: "Meticulous",
      phonetic: "/məˈtɪk.jə.ləs/",
      partOfSpeech: "adjective",
      definition: "Showing great attention to detail; very careful.",
      dueInterval: "In 4 hours",
      retentionScore: 82,
      urgency: "moderate",
      timesReviewed: 6
    },
    {
      id: "rev-6",
      word: "Paradigm",
      phonetic: "/ˈpær.ə.daɪm/",
      partOfSpeech: "noun",
      definition: "A typical example or pattern of something; a model.",
      dueInterval: "Tomorrow",
      retentionScore: 88,
      urgency: "good",
      timesReviewed: 8
    },
    {
      id: "rev-7",
      word: "Catalyst",
      phonetic: "/ˈkæt.əl.ɪst/",
      partOfSpeech: "noun",
      definition: "A person or thing that precipitates an event or change.",
      dueInterval: "Tomorrow",
      retentionScore: 90,
      urgency: "good",
      timesReviewed: 9
    },
    {
      id: "rev-8",
      word: "Venerable",
      phonetic: "/ˈven.ər.ə.bəl/",
      partOfSpeech: "adjective",
      definition: "Accorded a great deal of respect, especially because of age or wisdom.",
      dueInterval: "Tomorrow",
      retentionScore: 85,
      urgency: "good",
      timesReviewed: 7
    }
  ],

  // IELTS High-Scoring Topics
  ieltsTopics: [
    {
      id: "ielts-env",
      title: "Environmental Policy & Climate Crisis",
      bandTarget: "Band 8.5",
      wordCount: 28,
      description: "Vital terminology for Task 2 essays on sustainability, renewable energy, and ecological degradation.",
      keyWords: ["Biodiversity loss", "Anthropogenic", "Mitigation strategies", "Renewable transition", "Ecological footprint"],
      sampleEssaySnippet: "Anthropogenic activities continue to accelerate the rate of environmental degradation..."
    },
    {
      id: "ielts-tech",
      title: "Artificial Intelligence & Automation",
      bandTarget: "Band 8.0+",
      wordCount: 32,
      description: "Express nuanced viewpoints regarding ethical AI, algorithmic bias, and labor market disruptions.",
      keyWords: ["Algorithmic bias", "Autonomous systems", "Technological redundancy", "Ubiquitous computing"],
      sampleEssaySnippet: "While proponents champion productivity gains, critics caution against widespread workforce redundancy..."
    },
    {
      id: "ielts-edu",
      title: "Pedagogy, Higher Education & EdTech",
      bandTarget: "Band 8.0",
      wordCount: 25,
      description: "Discuss curriculum reform, vocational training, holistic development, and distance learning.",
      keyWords: ["Holistic curriculum", "Pedagogical methodology", "Vocational aptitude", "Cognitive development"],
      sampleEssaySnippet: "Modern educational institutions should balance rigorous theoretical mastery with pragmatic vocational skills..."
    },
    {
      id: "ielts-soc",
      title: "Globalization, Demographics & Urbanization",
      bandTarget: "Band 8.5+",
      wordCount: 30,
      description: "Analyze rural-to-urban migration, aging populations, cultural homogenization, and infrastructure pressure.",
      keyWords: ["Demographic transition", "Cultural homogenization", "Urban sprawl", "Socio-economic disparity"],
      sampleEssaySnippet: "Unchecked urban sprawl often exacerbates socioeconomic disparities in metropolitan hubs..."
    }
  ],

  // Game Hub Modes
  gameModes: [
    {
      id: "game-match",
      title: "Match Madness",
      subtitle: "Lightning-fast definition pairs",
      icon: "zap",
      color: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50 dark:bg-amber-950/30",
      badge: "High Energy",
      xpReward: "+30 XP",
      difficulty: "Fast-Paced",
      activePlayers: "1.2k playing now",
      description: "Race against the clock to connect target vocabulary with their precise definitions. Build combo streaks!"
    },
    {
      id: "game-quiz",
      title: "Speed Quiz Blitz",
      subtitle: "4-Choice vocabulary challenge",
      icon: "award",
      color: "from-indigo-500 to-violet-600",
      lightBg: "bg-indigo-50 dark:bg-indigo-950/30",
      badge: "Popular",
      xpReward: "+40 XP",
      difficulty: "Intermediate",
      activePlayers: "2.4k playing now",
      description: "Test your quick recall with rapid-fire questions covering synonyms, antonyms, and context clues."
    },
    {
      id: "game-scramble",
      title: "Word Scramble",
      subtitle: "Letter rearrangement puzzle",
      icon: "shuffle",
      color: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      badge: "Spelling Mastery",
      xpReward: "+25 XP",
      difficulty: "Relaxing",
      activePlayers: "840 playing now",
      description: "Unscramble anagrams using hint definitions and phonetics to reinforce exact English spelling patterns."
    },
    {
      id: "game-context",
      title: "Sentence Detective",
      subtitle: "Fill the academic blank",
      icon: "search",
      color: "from-rose-500 to-pink-600",
      lightBg: "bg-rose-50 dark:bg-rose-950/30",
      badge: "IELTS Focus",
      xpReward: "+35 XP",
      difficulty: "Challenging",
      activePlayers: "1.1k playing now",
      description: "Identify which nuanced word fits perfectly into authentic C1/C2 sentences and university articles."
    }
  ],

  // Quick playable demo quiz questions for instant interactivity
  quickQuizQuestions: [
    {
      question: "Which word means 'present, appearing, or found everywhere'?",
      options: ["Ephemeral", "Ubiquitous", "Pragmatic", "Eloquent"],
      answerIndex: 1,
      explanation: "Ubiquitous (C1) describes something that seems to be everywhere at once."
    },
    {
      question: "Choose the word that means 'to make a bad situation even worse':",
      options: ["Ameliorate", "Corroborate", "Exacerbate", "Leverage"],
      answerIndex: 2,
      explanation: "Exacerbate means to worsen or aggravate a problem or condition."
    },
    {
      question: "What is the synonym for 'ephemeral'?",
      options: ["Fleeting", "Enduring", "Permanent", "Substantial"],
      answerIndex: 0,
      explanation: "Ephemeral refers to something lasting for only a brief or temporary duration."
    }
  ],

  // Recent Achievements
  achievements: [
    {
      id: "ach-1",
      title: "14-Day Streak Champion",
      desc: "Studied consecutively for 2 full weeks",
      icon: "flame",
      unlocked: true,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50"
    },
    {
      id: "ach-2",
      title: "Vocabulary Connoisseur",
      desc: "Mastered over 300 academic words",
      icon: "book-marked",
      unlocked: true,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
    },
    {
      id: "ach-3",
      title: "Speed Demon",
      desc: "Answered 10 quiz questions in under 30 seconds",
      icon: "zap",
      unlocked: true,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50"
    },
    {
      id: "ach-4",
      title: "IELTS Band 8.5 Master",
      desc: "Complete all 4 advanced IELTS topic modules",
      icon: "trophy",
      unlocked: false,
      color: "text-slate-400 bg-slate-100 dark:bg-slate-800"
    }
  ],

  // Notifications
  notifications: [
    {
      id: "notif-1",
      title: "Streak Safe! 🔥",
      desc: "You completed 15 words today. Keep up the momentum!",
      time: "25 min ago",
      read: false
    },
    {
      id: "notif-2",
      title: "Review Queue Alert",
      desc: "8 words are ready for your spaced repetition review.",
      time: "2 hours ago",
      read: false
    },
    {
      id: "notif-3",
      title: "Diamond League Update",
      desc: "You moved up to #5 in the weekly leaderboard!",
      time: "Yesterday",
      read: true
    }
  ]
};
