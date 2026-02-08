// DOM Elements
const el = {
    appTitle: document.getElementById('app-title'),
    langBtn: document.getElementById('lang-btn'),
    btnHeaderHome: document.getElementById('btn-header-home'),
    screens: {
        menu: document.getElementById('screen-menu'),
        game: document.getElementById('screen-game'),
        result: document.getElementById('screen-result'),
        quiz: document.getElementById('screen-quiz'),
        stats: document.getElementById('screen-stats')
    },
    menu: {
        labelMode: document.getElementById('label-learning-mode'),
        btnThDe: document.getElementById('btn-th-de'),
        btnDeTh: document.getElementById('btn-de-th'),
        btnThEn: document.getElementById('btn-th-en'),
        btnEnTh: document.getElementById('btn-en-th'),
        labelReview: document.getElementById('label-review'),
        btnReview: document.getElementById('btn-text-review'),
        btnReset: document.getElementById('btn-text-reset'),
        labelLevel: document.getElementById('label-level'),
        btnLevel: document.getElementById('btn-level-select'),
        levelDisplay: document.getElementById('level-display'),
        labelType: document.getElementById('label-type'),
        segFlashcards: document.getElementById('seg-flashcards'),
        segQuiz: document.getElementById('seg-quiz'),
        labelStats: document.getElementById('label-stats'),
        btnStats: document.getElementById('btn-open-stats')
    },
    game: {
        progressBar: document.getElementById('progress-fill'),
        card: document.getElementById('flashcard'),
        frontText: document.getElementById('front-text'),
        frontSub: document.getElementById('front-sub'),
        hint: document.getElementById('hint-flip'),
        backText: document.getElementById('back-text'),
        backSub: document.getElementById('back-sub'),
        btnWrong: document.getElementById('btn-wrong'),
        btnCorrect: document.getElementById('btn-correct'),
        btnHome: document.getElementById('btn-home'),
        controlsAnswer: document.getElementById('controls-answer'),
        controlsNav: document.getElementById('controls-nav'),
        btnAudioFront: document.getElementById('btn-audio-front'),
        btnAudioBack: document.getElementById('btn-audio-back')
    },
    quiz: {
        screen: document.getElementById('screen-quiz'),
        progressBar: document.getElementById('progress-fill-quiz'),
        question: document.getElementById('quiz-question'),
        subtext: document.getElementById('quiz-subtext'),
        options: document.getElementById('quiz-options'),
        controls: document.getElementById('controls-quiz-nav'),
        btnHome: document.getElementById('btn-quiz-home'),
        btnNext: document.getElementById('btn-quiz-next'),
        btnAudio: document.getElementById('btn-audio-quiz')
    },
    stats: {
        screen: document.getElementById('screen-stats'),
        totalScore: document.getElementById('stats-total-score'),
        labelTotal: document.getElementById('label-total-progress'),
        container: document.getElementById('stats-container'),
        btnClose: document.getElementById('btn-close-stats')
    },
    result: {
        title: document.getElementById('res-title'),
        msg: document.getElementById('res-msg'),
        valCorrect: document.getElementById('res-correct'),
        lblCorrect: document.getElementById('label-res-correct'),
        valWrong: document.getElementById('res-wrong'),
        lblWrong: document.getElementById('label-res-wrong'),
        btnRestart: document.getElementById('btn-restart')
    }
};

// State
const state = {
    lang: localStorage.getItem('thaiApp_lang') || 'de', // Interface language
    mode: null, // current learning mode
    deck: [], // cards to show
    currentIndex: 0,
    stats: { correct: 0, wrong: 0 },
    history: JSON.parse(localStorage.getItem('thaiApp_history')) || {},
    currentLevel: 'all', // 'all', 'A1', 'A2', 'Everyday'
    learningType: 'flashcards' // 'flashcards' or 'quiz'
};

// --- Initialization ---

function init() {
    updateUITexts();
    updateLevelDisplay();
    updateTypeDisplay();
    bindEvents();
}

function bindEvents() {
    // Language Toggle
    el.langBtn.addEventListener('click', toggleLanguage);

    // Header Home
    if (el.btnHeaderHome) el.btnHeaderHome.addEventListener('click', showMenu);

    // Level Toggle
    if (el.menu.btnLevel) el.menu.btnLevel.addEventListener('click', toggleLevel);

    // Type Toggle (Segmented Control)
    if (el.menu.segFlashcards) el.menu.segFlashcards.addEventListener('click', () => setType('flashcards'));
    if (el.menu.segQuiz) el.menu.segQuiz.addEventListener('click', () => setType('quiz'));

    // Stats
    if (el.menu.btnStats) el.menu.btnStats.addEventListener('click', showStats);
    if (el.stats.btnClose) el.stats.btnClose.addEventListener('click', showMenu);

    // Audio Interactions
    if (el.game.btnAudioFront) el.game.btnAudioFront.addEventListener('click', (e) => { e.stopPropagation(); playAudio('front'); });
    if (el.game.btnAudioBack) el.game.btnAudioBack.addEventListener('click', (e) => { e.stopPropagation(); playAudio('back'); });
    if (el.quiz.btnAudio) el.quiz.btnAudio.addEventListener('click', () => playAudio('quiz'));

    // Quiz Interactions
    if (el.quiz.btnNext) el.quiz.btnNext.addEventListener('click', nextCard);
    if (el.quiz.btnHome) el.quiz.btnHome.addEventListener('click', showMenu);

    // Menu Buttons
    document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => startMode(btn.dataset.mode));
    });

    document.getElementById('btn-review-errors').addEventListener('click', startReviewMode);
    document.getElementById('btn-reset').addEventListener('click', resetProgress);

    // Game Interactions
    el.game.card.addEventListener('click', flipCard);
    el.game.btnCorrect.addEventListener('click', (e) => { e.stopPropagation(); handleAnswer(true); });
    el.game.btnWrong.addEventListener('click', (e) => { e.stopPropagation(); handleAnswer(false); });
    el.game.btnHome.addEventListener('click', showMenu);

    // Result Interactions
    el.result.btnRestart.addEventListener('click', showMenu);
}

// --- Core Logic ---

function toggleLanguage() {
    state.lang = state.lang === 'de' ? 'th' : 'de';
    localStorage.setItem('thaiApp_lang', state.lang);
    updateUITexts();
    updateLevelDisplay();
    updateTypeDisplay();
}

function toggleLevel() {
    const levels = ['all', 'A1', 'A2', 'Everyday', 'Numbers'];
    let idx = levels.indexOf(state.currentLevel);
    idx = (idx + 1) % levels.length;
    state.currentLevel = levels[idx];
    updateLevelDisplay();
}

function updateLevelDisplay() {
    const t = UI_TEXTS[state.lang];
    const map = {
        'all': t.level_all,
        'A1': t.level_a1,
        'A2': t.level_a2,
        'Everyday': t.level_everyday,
        'Numbers': t.level_numbers
    };
    if (el.menu.levelDisplay) {
        el.menu.levelDisplay.textContent = map[state.currentLevel];
    }
}

function setType(type) {
    state.learningType = type;
    updateTypeDisplay();
}

function updateTypeDisplay() {
    // Update Segmented Control UI
    if (state.learningType === 'flashcards') {
        el.menu.segFlashcards.classList.add('active');
        el.menu.segQuiz.classList.remove('active');
    } else {
        el.menu.segFlashcards.classList.remove('active');
        el.menu.segQuiz.classList.add('active');
    }

    // Also update button text if we still used the old button but we are not
    const t = UI_TEXTS[state.lang];
    if (el.menu.segFlashcards) el.menu.segFlashcards.textContent = t.type_flashcards;
    if (el.menu.segQuiz) el.menu.segQuiz.textContent = t.type_quiz;
}

function updateUITexts() {
    const t = UI_TEXTS[state.lang];
    el.appTitle.textContent = t.title;
    el.langBtn.textContent = state.lang === 'de' ? '🇩🇪' : '🇹🇭';

    // Menu
    if (el.menu.labelMode) el.menu.labelMode.textContent = t.mode_label;
    if (el.menu.btnThDe) el.menu.btnThDe.textContent = t.mode_th_de;
    if (el.menu.btnDeTh) el.menu.btnDeTh.textContent = t.mode_de_th;
    if (el.menu.btnThEn) el.menu.btnThEn.textContent = t.mode_th_en;
    if (el.menu.btnEnTh) el.menu.btnEnTh.textContent = t.mode_en_th;

    if (el.menu.labelReview) el.menu.labelReview.textContent = t.mode_review;
    if (el.menu.btnReview) el.menu.btnReview.textContent = t.mode_review;
    if (el.menu.btnReset) el.menu.btnReset.textContent = t.reset_progress;

    if (el.menu.labelLevel) el.menu.labelLevel.textContent = t.level_label;
    if (el.menu.labelType) el.menu.labelType.textContent = t.type_label;
    if (el.menu.btnStats) el.menu.btnStats.textContent = t.stats_btn;
    if (el.menu.labelStats) el.menu.labelStats.textContent = t.stats_header;

    if (el.stats.labelTotal) el.stats.labelTotal.textContent = t.stats_header;
    if (el.stats.btnClose) el.stats.btnClose.textContent = t.stats_back;

    // Game
    el.game.hint.textContent = t.flip_hint;
    el.game.btnCorrect.textContent = t.btn_correct;
    el.game.btnWrong.textContent = t.btn_wrong;
    el.game.btnHome.textContent = t.restart_btn;

    // Result
    el.result.title.textContent = t.completed_title;
    el.result.msg.textContent = t.completed_msg;
    el.result.lblCorrect.textContent = t.stats_correct;
    el.result.lblWrong.textContent = t.stats_wrong;
    el.result.btnRestart.textContent = t.btn_next;

    updateLevelDisplay();
    updateTypeDisplay();
}

function getFilteredDeck() {
    if (state.currentLevel === 'all') {
        return vocabList;
    }
    return vocabList.filter(item => item.level === state.currentLevel);
}

function startMode(mode) {
    state.mode = mode;
    state.deck = [...getFilteredDeck()];

    if (state.deck.length === 0) {
        alert(state.lang === 'de' ? "Keine Vokabeln in diesem Level gefunden!" : "ไม่พบคำศัพท์ในระดับนี้!");
        return;
    }

    shuffleDeck(state.deck);
    startGame();
}

function startReviewMode() {
    state.mode = 'review';
    // Filter for unknown cards AND current level 
    const baseDeck = getFilteredDeck();
    state.deck = baseDeck.filter(item => state.history[item.id] === 'unknown');

    if (state.deck.length === 0) {
        alert(state.lang === 'de' ? "Keine Fehler zum Wiederholen (in diesem Level)!" : "ไม่มีข้อผิดพลาดให้ทบทวน (ในระดับนี้)!");
        return;
    }

    shuffleDeck(state.deck);
    startGame();
}

function startGame() {
    state.currentIndex = 0;
    state.stats = { correct: 0, wrong: 0 };

    if (state.learningType === 'quiz') {
        showScreen('quiz');
        renderQuizQuestion();
    } else {
        showScreen('game');
        renderCard();
    }
    updateProgress();

    // Reset controls
    el.game.controlsAnswer.classList.remove('hidden');
    el.game.controlsNav.classList.add('hidden');
}

function renderCard() {
    const item = state.deck[state.currentIndex];
    const mode = state.mode;

    // Determine Front/Back based on mode
    let frontMain, frontSub, backMain, backSub;

    // Logic to switch sides
    const isThaiFront = mode === 'th-de' || mode === 'th-en' || mode === 'review';
    const isGermanTarget = mode === 'th-de' || mode === 'de-th' || mode === 'review';

    if (mode === 'th-de' || mode === 'th-en' || mode === 'review') {
        // Front: Thai
        frontMain = item.thai;
        frontSub = item.transliteration;

        // Back: Target
        backMain = isGermanTarget ? item.german : item.english;
        backSub = isGermanTarget ? item.english : item.german;
    } else {
        // Front: German or English
        frontMain = isGermanTarget ? item.german : item.english;
        frontSub = "";

        // Back: Thai
        backMain = item.thai;
        backSub = item.transliteration;
    }

    // Update DOM
    el.game.frontText.textContent = frontMain;
    el.game.frontSub.textContent = frontSub;
    el.game.backText.textContent = backMain;
    el.game.backSub.textContent = backSub;

    // Reset Flip
    el.game.card.classList.remove('flipped');
}

function flipCard() {
    el.game.card.classList.toggle('flipped');
}

function handleAnswer(isCorrect) {
    const item = state.deck[state.currentIndex];

    // Update stats
    if (isCorrect) {
        state.stats.correct++;
        state.history[item.id] = 'known';
    } else {
        state.stats.wrong++;
        state.history[item.id] = 'unknown';
    }

    // Save history
    localStorage.setItem('thaiApp_history', JSON.stringify(state.history));

    // Next Card
    nextCard();
}

function nextCard() {
    state.currentIndex++;
    updateProgress();

    if (state.currentIndex >= state.deck.length) {
        finishGame();
    } else {
        if (state.learningType === 'quiz') {
            renderQuizQuestion();
        } else {
            renderCard();
        }
    }
}

// --- Audio Logic ---

function speakText(text, lang) {
    if (!text) return;
    // Check supported voices
    // const voices = window.speechSynthesis.getVoices();
    // console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

    // Cancel current speech to avoid queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;

    // utterance.onstart = () => console.log("Audio started");
    // utterance.onend = () => console.log("Audio finished");
    // utterance.onerror = (e) => console.error("Audio error:", e);

    window.speechSynthesis.speak(utterance);
}

function playAudio(context) {
    const item = state.deck[state.currentIndex];
    const mode = state.mode;

    let textToSpeak = "";
    let lang = "th-TH"; // Default

    // Determine what text is where
    // Common checks for source/target based on mode
    const isThaiSource = mode === 'th-de' || mode === 'th-en' || mode === 'review';
    const isGermanTarget = mode === 'th-de' || mode === 'de-th' || mode === 'review';

    if (context === 'quiz') {
        // Question text
        if (isThaiSource) {
            textToSpeak = item.thai;
            lang = "th-TH";
        } else {
            textToSpeak = isGermanTarget ? item.german : item.english;
            lang = isGermanTarget ? "de-DE" : "en-US";
        }
    } else if (context === 'front') {
        if (isThaiSource) {
            textToSpeak = item.thai;
            lang = "th-TH";
        } else {
            textToSpeak = isGermanTarget ? item.german : item.english;
            lang = isGermanTarget ? "de-DE" : "en-US";
        }
    } else if (context === 'back') {
        // Opposite of front
        if (isThaiSource) {
            // Front was Thai, so back is Target
            textToSpeak = isGermanTarget ? item.german : item.english;
            lang = isGermanTarget ? "de-DE" : "en-US";
        } else {
            // Front was Target, so back is Thai
            textToSpeak = item.thai;
            lang = "th-TH";
        }
    }

    speakText(textToSpeak, lang);
}

// --- Quiz Logic ---

function renderQuizQuestion() {
    const item = state.deck[state.currentIndex];
    const mode = state.mode;

    console.log("Rendering Quiz Question:", { index: state.currentIndex, item, mode });

    // Safety check
    if (!item) {
        console.error("Quiz Error: Item is undefined", state.currentIndex);
        el.quiz.question.textContent = "Error: Item Missing";
        return;
    }

    // Setup question text similar to flashcard front
    let questionText = "";
    let questionSub = "";
    let targetKey = "english";

    const isThaiSource = mode === 'th-de' || mode === 'th-en' || mode === 'review';
    const isGermanTarget = mode === 'th-de' || mode === 'de-th' || mode === 'review';

    if (isThaiSource) {
        questionText = item.thai;
        questionSub = item.transliteration || "";
        targetKey = isGermanTarget ? 'german' : 'english';
    } else {
        questionText = isGermanTarget ? item.german : item.english;
        // Optional: If you want to show Thai subtext when asking in German, uncomment below
        // questionSub = ""; 
        targetKey = 'thai';
    }

    // Fallback if text is missing
    if (!questionText) {
        console.warn("Quiz Warning: Text missing for item", item);
        questionText = "???";
    }

    console.log("Quiz Render:", { text: questionText, sub: questionSub });
    el.quiz.question.textContent = questionText;
    el.quiz.subtext.textContent = questionSub;

    // Generate Options
    const correctAnswer = item[targetKey];
    if (!correctAnswer) {
        console.error("Quiz Error: Target missing", item);
        return;
    }

    // Determine if we need subtext for answers (only if answers are Thai)
    const showAnswerSub = (targetKey === 'thai');

    // Create option objects: { text, sub, isCorrect }
    let options = [{
        text: correctAnswer,
        sub: showAnswerSub ? item.transliteration : null,
        isCorrect: true
    }];

    // Get 3 distractors
    const pool = vocabList.filter(v => v.id !== item.id && v[targetKey]);
    for (let i = 0; i < 3; i++) {
        if (pool.length > 0) {
            const randIdx = Math.floor(Math.random() * pool.length);
            const distractor = pool[randIdx];

            options.push({
                text: distractor[targetKey],
                sub: showAnswerSub ? distractor.transliteration : null,
                isCorrect: false
            });

            pool.splice(randIdx, 1);
        }
    }

    shuffleDeck(options);

    // Render Buttons
    el.quiz.options.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';

        // Render content: Main text + Optional subtext
        let html = `<span class="btn-text">${opt.text}</span>`;
        if (opt.sub) {
            html += `<span class="btn-sub">${opt.sub}</span>`;
        }
        btn.innerHTML = html;

        // Determine language for this option
        let optLang = 'th-TH'; // default
        if (targetKey === 'german') optLang = 'de-DE';
        if (targetKey === 'english') optLang = 'en-US';

        btn.onclick = () => {
            speakText(opt.text, optLang);
            checkQuizAnswer(btn, opt.isCorrect, item.id, correctAnswer);
        };
        el.quiz.options.appendChild(btn);
    });

    el.quiz.controls.classList.add('hidden');
}

function checkQuizAnswer(btn, isCorrect, itemId, correctAnswer) {
    // Disable all buttons
    const buttons = el.quiz.options.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        state.stats.correct++;
        state.history[itemId] = 'known';
        el.quiz.controls.classList.remove('hidden');
    } else {
        // Wrong
        btn.classList.add('wrong');
        // Find and highlight correct answer
        buttons.forEach(button => { // Renamed 'btn' to 'button' to avoid conflict with parameter
            // Check if the button's main text content matches the correct answer
            // Using textContent directly might include subtext, so check the span specifically
            const btnTextSpan = button.querySelector('.btn-text');
            if (btnTextSpan && btnTextSpan.textContent === correctAnswer) {
                button.classList.add('correct-border');
            }
        });
        // meaningful feedback: highlight correct one
        state.stats.wrong++;
        state.history[itemId] = 'unknown';

        // Find correct button to highlight green?
        // For now just show Next.
        el.quiz.controls.classList.remove('hidden');
    }
    localStorage.setItem('thaiApp_history', JSON.stringify(state.history));
}

// --- Stats Logic ---

function showStats() {
    showScreen('stats');

    // Calculate stats per level
    const levels = ['A1', 'A2', 'Everyday', 'Numbers'];
    const container = el.stats.container;
    container.innerHTML = '';

    let totalKnown = 0;
    let totalItems = 0;

    levels.forEach(lvl => {
        const items = vocabList.filter(i => i.level === lvl);
        if (items.length === 0) return;

        const knownCount = items.filter(i => state.history[i.id] === 'known').length;
        const pct = Math.round((knownCount / items.length) * 100);

        totalKnown += knownCount;
        totalItems += items.length;

        const card = document.createElement('div');
        card.className = 'stats-card';
        card.innerHTML = `
            <div class="stats-row">
                <span>${lvl}</span>
                <span>${pct}%</span>
            </div>
            <div class="stats-progress-bg">
                <div class="stats-progress-fill" style="width: ${pct}%"></div>
            </div>
            <div class="stats-label" style="font-size: 13px; color: #86868B">
                ${knownCount} / ${items.length} ${state.lang === 'de' ? 'gelernt' : 'เรียนรู้แล้ว'}
            </div>
        `;
        container.appendChild(card);
    });

    const totalPct = totalItems > 0 ? Math.round((totalKnown / totalItems) * 100) : 0;
    el.stats.totalScore.textContent = `${totalPct}%`;
}

function setProgressBar(bar, pct) {
    if (bar) bar.style.width = `${pct}%`;
}

function updateProgress() {
    const pct = state.deck.length > 0 ? (state.currentIndex / state.deck.length) * 100 : 0;
    setProgressBar(el.game.progressBar, pct);
    setProgressBar(el.quiz.progressBar, pct);
}

function finishGame() {
    showScreen('result');
    el.result.valCorrect.textContent = state.stats.correct;
    el.result.valWrong.textContent = state.stats.wrong;
}

function resetProgress() {
    if (confirm(state.lang === 'de' ? "Wirklich alles zurücksetzen?" : "รีเซ็ตใหม่ทั้งหมด?")) {
        state.history = {};
        localStorage.removeItem('thaiApp_history');
        alert(state.lang === 'de' ? "Fortschritt gelöscht." : "ลบความคืบหน้าแล้ว");
        showStats(); // Refresh stats if open
    }
}

// Helpers
function showScreen(screenName) {
    Object.values(el.screens).forEach(s => s.classList.remove('active'));
    el.screens[screenName].classList.add('active');
}

function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showMenu() {
    showScreen('menu');
}

// Start
init();
