const topicMeta = {
  animals: { title: "Động vật", subtitle: "Khám phá thế giới thú!", color: "#8ff199", text: "#00531d", icon: "🐘" },
  colors: { title: "Màu sắc", subtitle: "Thế giới rực rỡ", color: "#4c96fe", text: "#002e60", icon: "🌈" },
  letters: { title: "Chữ cái", subtitle: "A, B, C vui nhộn", color: "#ffd93d", text: "#725e00", icon: "🔤" },
  fruits: { title: "Trái cây", subtitle: "Ngọt ngào mỗi ngày", color: "#ffdad6", text: "#93000a", icon: "🍓" },
  numbers: { title: "Số đếm", subtitle: "1, 2, 3 thật dễ", color: "#d6e3ff", text: "#00468c", icon: "🔢" },
  family: { title: "Gia đình", subtitle: "Người thân quanh bé", color: "#ffe173", text: "#554500", icon: "👨‍👩‍👧" },
  shapes: { title: "Hình khối", subtitle: "Vuông, tròn, tam giác", color: "#e9d5ff", text: "#4c1d95", icon: "🔷" },
  vehicles: { title: "Phương tiện", subtitle: "Xe, tàu, máy bay", color: "#ccfbf1", text: "#134e4a", icon: "🚗" }
};

const state = {
  topic: "animals",
  index: 0,
  score: Number(localStorage.getItem("lingolandScore") || 120),
  streak: Number(localStorage.getItem("lingolandStreak") || 0),
  unlocked: new Set(JSON.parse(localStorage.getItem("lingolandUnlocked") || '["animals","colors","letters","shapes","vehicles"]'))
};
state.unlocked.add("vehicles");

const $ = (selector) => document.querySelector(selector);
const topicMap = $("#topicMap");
const screens = {
  home: $("#homeScreen"),
  lesson: $("#lessonScreen"),
  rewards: $("#rewardsScreen"),
  parent: $("#parentScreen")
};
const scoreText = $("#scoreText");
const wordVisual = $("#wordVisual");
const wordTitle = $("#wordTitle");
const wordMeaning = $("#wordMeaning");
const lessonTitle = $("#lessonTitle");
const letterTiles = $("#letterTiles");
const choiceGrid = $("#choiceGrid");
const successOverlay = $("#successOverlay");
const modalMessage = $("#modalMessage");
const stickerGrid = $("#stickerGrid");
const progressDots = $("#progressDots");
const collectionText = $("#collectionText");

function allVocabulary() {
  return window.assetVocabulary || {};
}

function topicWords(topic = state.topic) {
  const meta = topicMeta[topic] || topicMeta.animals;
  return allVocabulary()[meta.source || topic] || allVocabulary().animals || [];
}

function currentWord() {
  const words = topicWords();
  return words[state.index % words.length] || { word: "Lion", vi: "Lion", image: "assets/animals/lion.svg" };
}

function saveState() {
  localStorage.setItem("lingolandScore", String(state.score));
  localStorage.setItem("lingolandStreak", String(state.streak));
  localStorage.setItem("lingolandUnlocked", JSON.stringify([...state.unlocked]));
}
function speechText(word = currentWord()) {
  if (state.topic === "letters" && word.word.length === 1) return `${word.word}.`;
  return word.word;
}


function speak(text, options = {}) {
  if (!("speechSynthesis" in window)) return;
  if (!options.keepQueue) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = options.rate || 0.8;
  utterance.pitch = options.pitch || 1.08;
  window.speechSynthesis.speak(utterance);
}

const letterSounds = {
  A: "ay", B: "bee", C: "see", D: "dee", E: "ee", F: "eff", G: "gee", H: "aitch", I: "eye", J: "jay", K: "kay", L: "ell", M: "em",
  N: "en", O: "oh", P: "pee", Q: "cue", R: "are", S: "ess", T: "tee", U: "you", V: "vee", W: "double you", X: "ex", Y: "why", Z: "zee"
};

function speakQueued(text, delay = 0, options = {}) {
  setTimeout(() => speak(text, { keepQueue: true, rate: 0.68, pitch: 1.14, ...options }), delay);
}

function renderImage(word) {
  wordVisual.innerHTML = "";
  if (word.image) {
    const img = document.createElement("img");
    img.src = word.image;
    img.alt = word.word;
    img.onerror = () => {
      wordVisual.innerHTML = `<span class="emoji-fallback">${topicMeta[state.topic]?.icon || "⭐"}</span>`;
    };
    wordVisual.appendChild(img);
  } else {
    wordVisual.innerHTML = `<span class="emoji-fallback">${topicMeta[state.topic]?.icon || "⭐"}</span>`;
  }
}

function renderWord() {
  const word = currentWord();
  const meta = topicMeta[state.topic] || topicMeta.animals;
  lessonTitle.textContent = "Bé nghe từ và chọn đúng ảnh nhé!";
  wordTitle.textContent = word.word.toUpperCase();
  wordMeaning.textContent = word.vi || word.word;
  renderImage(word);
  renderChoices(word);
  $("#parentTopic").textContent = meta.title;
}

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function renderChoices(correctWord) {
  const words = topicWords().filter((item) => item.image);
  const distractors = shuffleItems(words.filter((item) => item.word !== correctWord.word)).slice(0, 3);
  const choices = shuffleItems([correctWord, ...distractors]).slice(0, 4);

  choiceGrid.innerHTML = "";
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-card";
    button.type = "button";
    button.innerHTML = `
      <img src="${choice.image}" alt="${choice.word}">
    `;
    button.addEventListener("click", () => {
      const isCorrect = choice.word === correctWord.word;
      handleFeedback(isCorrect, button);
    });
    choiceGrid.appendChild(button);
  });
}

function renderMap() {
  const topicOrder = ["animals", "colors", "letters", "shapes", "fruits", "numbers", "family", "vehicles"];
  topicMap.innerHTML = "";
  topicOrder.forEach((topic, idx) => {
    const meta = topicMeta[topic];
    const unlocked = state.unlocked.has(topic);
    const island = document.createElement("article");
    island.className = "island";
    island.style.animationDelay = `${idx * -0.55}s`;
    island.innerHTML = `
      <button class="island-card" type="button" style="background:${meta.color}; color:${meta.text}" data-topic="${topic}">
        <div class="island-img">${meta.icon}</div>
        <h2>${meta.title}</h2>
        <p>${meta.subtitle}</p>
        <div class="progress-line">
          <span class="status-dot"><span class="material-symbols-outlined filled">${unlocked ? "check" : "lock"}</span></span>
          <span class="status-bar"><span class="status-fill" style="width:${unlocked ? 75 : 0}%"></span></span>
        </div>
      </button>
    `;
    island.querySelector("button").addEventListener("click", () => {
      state.topic = topic;
      state.index = 0;
      renderWord();
      showScreen("lesson");
      setTimeout(() => speak(speechText()), 240);
    });
    topicMap.appendChild(island);
  });
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => el.classList.toggle("active", key === name));
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.screen === name));
  if (name === "rewards") renderRewards();
  if (name === "parent") updateStats();
}

function nextWord(step = 1) {
  const words = topicWords();
  state.index = (state.index + step + words.length) % words.length;
  renderWord();
  speak(speechText());
}

function handleFeedback(correct, element) {
  if (correct) {
    state.score += 10;
    state.streak += 1;
    state.unlocked.add(state.topic);
    if (state.score >= 140) state.unlocked.add("fruits");
    if (state.score >= 150) state.unlocked.add("shapes");
    if (state.score >= 170) state.unlocked.add("numbers");
    if (state.score >= 200) state.unlocked.add("family");
    if (state.score >= 230) state.unlocked.add("vehicles");
    element.classList.add("choice-correct");
    choiceGrid.querySelectorAll("button").forEach((button) => {
      if (button !== element) button.disabled = true;
    });
    speak(speechText(), { rate: state.topic === "letters" ? 0.62 : 0.72 });
    setTimeout(() => nextWord(1), 2600);
  } else {
    state.streak = 0;
    speak(speechText());
  }
  saveState();
  updateStats();
  renderMap();
}

function renderRewards() {
  const words = Object.values(allVocabulary()).flat();
  const unlockedCount = Math.min(20, Math.max(6, Math.floor(state.score / 20)));
  progressDots.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const dot = document.createElement("span");
    dot.className = `progress-dot ${i < Math.ceil(unlockedCount / 4) ? "unlocked" : ""}`;
    progressDots.appendChild(dot);
  }
  collectionText.textContent = `Đã sưu tập: ${unlockedCount}/20`;
  stickerGrid.innerHTML = "";
  const fixed = [
    { icon: "grade", name: "Siêu Sao", color: "primary" },
    { icon: "military_tech", name: "Vô Địch", color: "secondary" },
    { icon: "pets", name: "Bạn Cún", color: "tertiary" },
    { icon: "rocket_launch", name: "Bay Cao", color: "primary" }
  ];
  const cards = [...fixed, ...words.slice(0, 8)];
  for (let i = 0; i < 12; i++) {
    const item = cards[i];
    const unlocked = i < unlockedCount && item;
    const card = document.createElement("button");
    card.className = `sticker-card ${unlocked ? "" : "locked"}`;
    card.type = "button";
    if (!unlocked) {
      card.innerHTML = `<span class="material-symbols-outlined">${i % 2 ? "lock" : "help_center"}</span><b>${i % 2 ? "Chưa mở" : "? ? ?"}</b>`;
    } else if (item.icon) {
      card.innerHTML = `<span class="material-symbols-outlined filled">${item.icon}</span><b>${item.name}</b>`;
    } else {
      card.innerHTML = `<img src="${item.image}" alt="${item.word}"><b>${item.vi || item.word}</b>`;
    }
    card.addEventListener("click", () => createSparkles(card));
    stickerGrid.appendChild(card);
  }
}

function createSparkles(element) {
  if (element.classList.contains("locked")) return;
  for (let i = 0; i < 12; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.background = ["#ffe173", "#ffd93d", "#4c96fe", "#8ff199"][Math.floor(Math.random() * 4)];
    element.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
  speak("Wow!");
}

function updateStats() {
  scoreText.textContent = state.score;
  $("#parentScore").textContent = state.score;
  $("#parentStreak").textContent = state.streak;
}

function wireEvents() {
  $("#homeLogoBtn").addEventListener("click", () => showScreen("home"));
  $("#parentBtn").addEventListener("click", () => showScreen("parent"));
  $("#quickGameBtn").addEventListener("click", () => showScreen("lesson"));
  $("#sayWordBtn").addEventListener("click", () => speak(speechText()));
  $("#prevBtn").addEventListener("click", () => nextWord(-1));
  $("#nextBtn").addEventListener("click", () => nextWord(1));
  $("#continueBtn").addEventListener("click", () => {
    successOverlay.classList.add("hidden");
    nextWord(1);
  });
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.screen));
  });
}

renderMap();
renderWord();
renderRewards();
updateStats();
wireEvents();
