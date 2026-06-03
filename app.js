var topicMeta = {
  animals: { title: "Động vật", subtitle: "Khám phá thế giới thú!", color: "#8ff199", text: "#00531d", icon: "🐘" },
  colors: { title: "Màu sắc", subtitle: "Thế giới rực rỡ", color: "#4c96fe", text: "#002e60", icon: "🌈" },
  letters: { title: "Chữ cái", subtitle: "A, B, C vui nhộn", color: "#ffd93d", text: "#725e00", icon: "🔤" },
  fruits: { title: "Trái cây", subtitle: "Ngọt ngào mỗi ngày", color: "#ffdad6", text: "#93000a", icon: "🍓" },
  numbers: { title: "Số đếm", subtitle: "1, 2, 3 thật dễ", color: "#d6e3ff", text: "#00468c", icon: "🔢" },
  family: { title: "Gia đình", subtitle: "Người thân quanh bé", color: "#ffe173", text: "#554500", icon: "👨‍👩‍👧" },
  shapes: { title: "Hình khối", subtitle: "Vuông, tròn, tam giác", color: "#e9d5ff", text: "#4c1d95", icon: "🔷" },
  vehicles: { title: "Phương tiện", subtitle: "Xe, tàu, máy bay", color: "#ccfbf1", text: "#134e4a", icon: "🚗" },
  clothes: { title: "Đồ dùng", subtitle: "Giày dép, quần áo", color: "#fed7aa", text: "#7c2d12", icon: "👕" },
  office: { title: "Văn phòng", subtitle: "Bút, giấy, máy tính", color: "#e0e7ff", text: "#3730a3", icon: "💼" },
  drinks: { title: "Đồ uống", subtitle: "Nước ép, soda, sữa", color: "#bae6fd", text: "#075985", icon: "🧃" }
};

var topicOrder = ["animals", "colors", "letters", "shapes", "fruits", "numbers", "family", "vehicles", "clothes", "office", "drinks"];
var defaultUnlocked = ["animals", "colors", "letters", "shapes", "vehicles", "clothes", "office", "drinks"];

function $(selector) {
  return document.querySelector(selector);
}

function safeGet(key, fallback) {
  try {
    var value = window.localStorage && window.localStorage.getItem(key);
    return value === null || value === undefined ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    if (window.localStorage) window.localStorage.setItem(key, value);
  } catch (error) {
    return;
  }
}

function loadUnlocked() {
  var raw = safeGet("lingolandUnlocked", JSON.stringify(defaultUnlocked));
  try {
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultUnlocked.slice();
  } catch (error) {
    return defaultUnlocked.slice();
  }
}

function makeUnlockedMap(items) {
  var map = {};
  for (var i = 0; i < items.length; i += 1) {
    map[items[i]] = true;
  }
  return map;
}

var state = {
  topic: "animals",
  index: 0,
  score: Number(safeGet("lingolandScore", "120")) || 120,
  streak: Number(safeGet("lingolandStreak", "0")) || 0,
  unlocked: makeUnlockedMap(loadUnlocked())
};
state.unlocked.vehicles = true;
state.unlocked.clothes = true;
state.unlocked.office = true;
state.unlocked.drinks = true;

var topicMap = $("#topicMap");
var screens = {
  home: $("#homeScreen"),
  lesson: $("#lessonScreen"),
  rewards: $("#rewardsScreen"),
  parent: $("#parentScreen")
};
var scoreText = $("#scoreText");
var wordVisual = $("#wordVisual");
var wordTitle = $("#wordTitle");
var wordMeaning = $("#wordMeaning");
var lessonTitle = $("#lessonTitle");
var choiceGrid = $("#choiceGrid");
var successOverlay = $("#successOverlay");
var stickerGrid = $("#stickerGrid");
var progressDots = $("#progressDots");
var collectionText = $("#collectionText");

function unlockedList() {
  var result = [];
  for (var topic in state.unlocked) {
    if (Object.prototype.hasOwnProperty.call(state.unlocked, topic) && state.unlocked[topic]) {
      result.push(topic);
    }
  }
  return result;
}

function isUnlocked(topic) {
  return !!state.unlocked[topic];
}

function unlockTopic(topic) {
  state.unlocked[topic] = true;
}

function allVocabulary() {
  return window.assetVocabulary || {};
}

function topicWords(topic) {
  var selectedTopic = topic || state.topic;
  var meta = topicMeta[selectedTopic] || topicMeta.animals;
  var source = meta.source || selectedTopic;
  var vocabulary = allVocabulary();
  return vocabulary[source] || vocabulary.animals || [];
}

function currentWord() {
  var words = topicWords();
  return words[state.index % words.length] || { word: "Lion", vi: "Lion", image: "assets/animals/lion.svg" };
}

function saveState() {
  safeSet("lingolandScore", String(state.score));
  safeSet("lingolandStreak", String(state.streak));
  safeSet("lingolandUnlocked", JSON.stringify(unlockedList()));
}

function speechText(word) {
  var selectedWord = word || currentWord();
  if (state.topic === "letters" && selectedWord.word.length === 1) return selectedWord.word + ".";
  return selectedWord.word;
}

function speak(text, options) {
  var settings = options || {};
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  if (!settings.keepQueue) window.speechSynthesis.cancel();
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = settings.rate || 0.8;
  utterance.pitch = settings.pitch || 1.08;
  window.speechSynthesis.speak(utterance);
}

function renderImage(word) {
  wordVisual.innerHTML = "";
  if (word.image) {
    var img = document.createElement("img");
    img.src = word.image;
    img.alt = word.word;
    img.onerror = function () {
      var meta = topicMeta[state.topic] || topicMeta.animals;
      wordVisual.innerHTML = '<span class="emoji-fallback">' + meta.icon + "</span>";
    };
    wordVisual.appendChild(img);
  } else {
    var fallbackMeta = topicMeta[state.topic] || topicMeta.animals;
    wordVisual.innerHTML = '<span class="emoji-fallback">' + fallbackMeta.icon + "</span>";
  }
}

function renderWord() {
  var word = currentWord();
  var meta = topicMeta[state.topic] || topicMeta.animals;
  lessonTitle.textContent = "Bé nghe từ và chọn đúng ảnh nhé!";
  wordTitle.textContent = word.word.toUpperCase();
  wordMeaning.textContent = word.vi || word.word;
  renderImage(word);
  renderChoices(word);
  $("#parentTopic").textContent = meta.title;
}

function shuffleItems(items) {
  var result = items.slice();
  result.sort(function () {
    return Math.random() - 0.5;
  });
  return result;
}

function renderChoices(correctWord) {
  var words = topicWords().filter(function (item) {
    return item.image;
  });
  var distractorPool = words.filter(function (item) {
    return item.word !== correctWord.word;
  });
  var distractors = shuffleItems(distractorPool).slice(0, 3);
  var choices = shuffleItems([correctWord].concat(distractors)).slice(0, 4);

  choiceGrid.innerHTML = "";
  for (var i = 0; i < choices.length; i += 1) {
    var choice = choices[i];
    var button = document.createElement("button");
    button.className = "choice-card";
    button.type = "button";
    button.innerHTML = '<img src="' + choice.image + '" alt="' + choice.word + '">';
    button.setAttribute("data-word", choice.word);
    button.addEventListener("click", function () {
      var isCorrect = this.getAttribute("data-word") === correctWord.word;
      handleFeedback(isCorrect, this);
    });
    choiceGrid.appendChild(button);
  }
}

function renderMap() {
  topicMap.innerHTML = "";
  for (var i = 0; i < topicOrder.length; i += 1) {
    var topic = topicOrder[i];
    var meta = topicMeta[topic];
    var unlocked = isUnlocked(topic);
    var island = document.createElement("article");
    island.className = "island";
    island.style.animationDelay = String(i * -0.55) + "s";
    island.innerHTML =
      '<button class="island-card" type="button" style="background:' + meta.color + "; color:" + meta.text + '" data-topic="' + topic + '">' +
      '<div class="island-img">' + meta.icon + "</div>" +
      "<h2>" + meta.title + "</h2>" +
      "<p>" + meta.subtitle + "</p>" +
      '<div class="progress-line">' +
      '<span class="status-dot"><span class="material-symbols-outlined filled">' + (unlocked ? "check" : "lock") + "</span></span>" +
      '<span class="status-bar"><span class="status-fill" style="width:' + (unlocked ? 75 : 0) + '%"></span></span>' +
      "</div>" +
      "</button>";

    island.querySelector("button").addEventListener("click", function () {
      state.topic = this.getAttribute("data-topic");
      state.index = 0;
      renderWord();
      showScreen("lesson");
      setTimeout(function () {
        speak(speechText());
      }, 240);
    });
    topicMap.appendChild(island);
  }
}

function setActiveClass(element, active) {
  if (!element) return;
  if (active) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}

function showScreen(name) {
  for (var key in screens) {
    if (Object.prototype.hasOwnProperty.call(screens, key)) {
      setActiveClass(screens[key], key === name);
    }
  }
  var buttons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < buttons.length; i += 1) {
    setActiveClass(buttons[i], buttons[i].getAttribute("data-screen") === name);
  }
  if (name === "rewards") renderRewards();
  if (name === "parent") updateStats();
}

function nextWord(step) {
  var movement = typeof step === "number" ? step : 1;
  var words = topicWords();
  state.index = (state.index + movement + words.length) % words.length;
  renderWord();
  speak(speechText());
}

function handleFeedback(correct, element) {
  if (correct) {
    state.score += 10;
    state.streak += 1;
    unlockTopic(state.topic);
    if (state.score >= 140) unlockTopic("fruits");
    if (state.score >= 150) unlockTopic("shapes");
    if (state.score >= 170) unlockTopic("numbers");
    if (state.score >= 200) unlockTopic("family");
    if (state.score >= 230) unlockTopic("vehicles");
    if (state.score >= 260) unlockTopic("clothes");
    if (state.score >= 290) unlockTopic("office");
    if (state.score >= 320) unlockTopic("drinks");
    element.classList.add("choice-correct");
    var buttons = choiceGrid.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i] !== element) buttons[i].disabled = true;
    }
    speak(speechText(), { rate: state.topic === "letters" ? 0.62 : 0.72 });
    setTimeout(function () {
      nextWord(1);
    }, 2600);
  } else {
    state.streak = 0;
    speak(speechText());
  }
  saveState();
  updateStats();
  renderMap();
}

function allWordsList() {
  var vocabulary = allVocabulary();
  var result = [];
  for (var topic in vocabulary) {
    if (Object.prototype.hasOwnProperty.call(vocabulary, topic)) {
      result = result.concat(vocabulary[topic]);
    }
  }
  return result;
}

function renderRewards() {
  var words = allWordsList();
  var unlockedCount = Math.min(20, Math.max(6, Math.floor(state.score / 20)));
  progressDots.innerHTML = "";
  for (var i = 0; i < 5; i += 1) {
    var dot = document.createElement("span");
    dot.className = "progress-dot" + (i < Math.ceil(unlockedCount / 4) ? " unlocked" : "");
    progressDots.appendChild(dot);
  }
  collectionText.textContent = "Đã sưu tập: " + unlockedCount + "/20";
  stickerGrid.innerHTML = "";
  var fixed = [
    { icon: "grade", name: "Siêu Sao", color: "primary" },
    { icon: "military_tech", name: "Vô Địch", color: "secondary" },
    { icon: "pets", name: "Bạn Cún", color: "tertiary" },
    { icon: "rocket_launch", name: "Bay Cao", color: "primary" }
  ];
  var cards = fixed.concat(words.slice(0, 8));
  for (var cardIndex = 0; cardIndex < 12; cardIndex += 1) {
    var item = cards[cardIndex];
    var unlocked = cardIndex < unlockedCount && item;
    var card = document.createElement("button");
    card.className = "sticker-card" + (unlocked ? "" : " locked");
    card.type = "button";
    if (!unlocked) {
      card.innerHTML = '<span class="material-symbols-outlined">' + (cardIndex % 2 ? "lock" : "help_center") + "</span><b>" + (cardIndex % 2 ? "Chưa mở" : "? ? ?") + "</b>";
    } else if (item.icon) {
      card.innerHTML = '<span class="material-symbols-outlined filled">' + item.icon + "</span><b>" + item.name + "</b>";
    } else {
      card.innerHTML = '<img src="' + item.image + '" alt="' + item.word + '"><b>' + (item.vi || item.word) + "</b>";
    }
    card.addEventListener("click", function () {
      createSparkles(this);
    });
    stickerGrid.appendChild(card);
  }
}

function createSparkles(element) {
  if (element.classList.contains("locked")) return;
  var colors = ["#ffe173", "#ffd93d", "#4c96fe", "#8ff199"];
  for (var i = 0; i < 12; i += 1) {
    var sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = String(Math.random() * 100) + "%";
    sparkle.style.top = String(Math.random() * 100) + "%";
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    element.appendChild(sparkle);
    setTimeout(function (node) {
      return function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      };
    }(sparkle), 800);
  }
  speak("Wow!");
}

function updateStats() {
  scoreText.textContent = state.score;
  $("#parentScore").textContent = state.score;
  $("#parentStreak").textContent = state.streak;
}

function wireEvents() {
  $("#homeLogoBtn").addEventListener("click", function () {
    showScreen("home");
  });
  $("#parentBtn").addEventListener("click", function () {
    showScreen("parent");
  });
  $("#quickGameBtn").addEventListener("click", function () {
    showScreen("lesson");
  });
  $("#sayWordBtn").addEventListener("click", function () {
    speak(speechText());
  });
  $("#prevBtn").addEventListener("click", function () {
    nextWord(-1);
  });
  $("#nextBtn").addEventListener("click", function () {
    nextWord(1);
  });
  $("#continueBtn").addEventListener("click", function () {
    successOverlay.classList.add("hidden");
    nextWord(1);
  });
  var navButtons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < navButtons.length; i += 1) {
    navButtons[i].addEventListener("click", function () {
      showScreen(this.getAttribute("data-screen"));
    });
  }
}

function showFatalError(error) {
  if (!topicMap) return;
  topicMap.innerHTML = '<article class="island"><button class="island-card" type="button" style="background:#ffdad6;color:#93000a"><div class="island-img">!</div><h2>Reload</h2><p>Safari cần tải lại trang</p></button></article>';
  if (window.console && window.console.error) window.console.error(error);
}

try {
  renderMap();
  renderWord();
  renderRewards();
  updateStats();
  wireEvents();
} catch (error) {
  showFatalError(error);
}
