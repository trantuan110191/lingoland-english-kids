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
  drinks: { title: "Đồ uống", subtitle: "Nước ép, soda, sữa", color: "#bae6fd", text: "#075985", icon: "🧃" },
  play: { title: "Vui chơi", subtitle: "Bóng, cầu trượt, xích đu", color: "#fbcfe8", text: "#831843", icon: "⚽" }
};

var topicOrder = ["animals", "colors", "letters", "shapes", "fruits", "play", "numbers", "family", "vehicles", "clothes", "office", "drinks"];
var defaultUnlocked = ["animals", "colors", "letters", "shapes", "fruits", "play", "vehicles", "clothes", "office", "drinks"];

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
state.unlocked.fruits = true;
state.unlocked.play = true;

var topicMap = $("#topicMap");
var screens = {
  home: $("#homeScreen"),
  lesson: $("#lessonScreen"),
  bubble: $("#bubbleScreen"),
  toyBox: $("#toyBoxScreen"),
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
var bubbleTopicLabel = $("#bubbleTopicLabel");
var bubbleWord = $("#bubbleWord");
var bubbleMeaning = $("#bubbleMeaning");
var bubbleArena = $("#bubbleArena");
var sliceCanvas = $("#sliceCanvas");
var sliceContext = sliceCanvas && sliceCanvas.getContext ? sliceCanvas.getContext("2d") : null;
var sliceBurstLayer = $("#sliceBurstLayer");
var toyBoxWord = $("#toyBoxWord");
var toyShelf = $("#toyShelf");
var toyDropZone = $("#toyDropZone");

var bubbleState = {
  topic: state.topic,
  target: null,
  locked: false,
  slicing: false,
  slicePoints: [],
  sliceRaf: 0,
  ignoreClickUntil: 0
};

var soundState = {
  context: null,
  master: null,
  lastWhooshAt: 0
};

var toyBoxState = {
  target: null,
  locked: false,
  dragging: null
};

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

function audioContext() {
  var AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!soundState.context) {
    soundState.context = new AudioCtor();
    soundState.master = soundState.context.createGain();
    soundState.master.gain.value = .58;
    soundState.master.connect(soundState.context.destination);
  }
  if (soundState.context.state === "suspended" && soundState.context.resume) {
    soundState.context.resume().catch(function () {
      return;
    });
  }
  return soundState.context;
}

function playSliceWhoosh(force) {
  var nowMs = Date.now();
  if (nowMs - soundState.lastWhooshAt < 72) return;
  soundState.lastWhooshAt = nowMs;
  var context = audioContext();
  if (!context || !soundState.master) return;
  var strength = Math.max(.45, Math.min(force || 1, 1.35));
  var duration = .16 + strength * .04;
  var frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
  var buffer = context.createBuffer(1, frameCount, context.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < frameCount; i += 1) {
    var progress = i / frameCount;
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 1.7);
  }
  var source = context.createBufferSource();
  var filter = context.createBiquadFilter();
  var gain = context.createGain();
  var start = context.currentTime;
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2400 + strength * 500, start);
  filter.frequency.exponentialRampToValueAtTime(620, start + duration);
  filter.Q.value = .8;
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.18 * strength, start + .018);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundState.master);
  source.start(start);
  source.stop(start + duration + .02);
}

function playSliceHit(correct) {
  var context = audioContext();
  if (!context || !soundState.master) return;
  var start = context.currentTime;
  var oscillator = context.createOscillator();
  var gain = context.createGain();
  oscillator.type = correct ? "triangle" : "sawtooth";
  oscillator.frequency.setValueAtTime(correct ? 520 : 220, start);
  oscillator.frequency.exponentialRampToValueAtTime(correct ? 1180 : 120, start + .18);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(correct ? .2 : .11, start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + .2);
  oscillator.connect(gain);
  gain.connect(soundState.master);
  oscillator.start(start);
  oscillator.stop(start + .22);
  if (correct) {
    setTimeout(function () {
      playSliceWhoosh(.6);
    }, 80);
  }
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
      if (state.topic === "play") {
        startToyBoxGame();
        return;
      }
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
    awardPoints(10, state.topic);
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

function unlockByScore() {
  if (state.score >= 140) unlockTopic("fruits");
  if (state.score >= 150) unlockTopic("shapes");
  if (state.score >= 170) unlockTopic("numbers");
  if (state.score >= 200) unlockTopic("family");
  if (state.score >= 230) unlockTopic("vehicles");
  if (state.score >= 260) unlockTopic("clothes");
  if (state.score >= 290) unlockTopic("office");
  if (state.score >= 320) unlockTopic("drinks");
  if (state.score >= 350) unlockTopic("play");
}

function awardPoints(points, topic) {
  state.score += points;
  state.streak += 1;
  if (topic) unlockTopic(topic);
  unlockByScore();
}

function playableWords(topic) {
  return topicWords(topic).filter(function (item) {
    return item.image;
  });
}

function bubbleWords() {
  var words = playableWords(bubbleState.topic);
  if (words.length >= 4) return words;
  bubbleState.topic = "animals";
  state.topic = "animals";
  return playableWords("animals");
}

function cueBubbleWord() {
  if (!bubbleState.target) return;
  speak(bubbleState.target.word, { rate: bubbleState.topic === "letters" ? 0.62 : 0.72, pitch: 1.12 });
}

function renderBubbleRound() {
  var words = bubbleWords();
  var meta = topicMeta[bubbleState.topic] || topicMeta.animals;
  var target = words[Math.floor(Math.random() * words.length)] || words[0];
  var distractors = shuffleItems(words.filter(function (item) {
    return item.word !== target.word;
  })).slice(0, 3);
  var choices = shuffleItems([target].concat(distractors)).slice(0, 4);

  bubbleState.target = target;
  bubbleState.locked = false;
  bubbleTopicLabel.textContent = meta.title;
  bubbleWord.textContent = target.word.toUpperCase();
  bubbleMeaning.textContent = target.vi || target.word;
  bubbleArena.innerHTML = "";

  for (var i = 0; i < choices.length; i += 1) {
    var choice = choices[i];
    var button = document.createElement("button");
    button.className = "bubble-choice bubble-choice-" + String(i + 1);
    button.type = "button";
    button.style.animationDelay = String(i * -0.42) + "s";
    button.setAttribute("data-word", choice.word);
    button.innerHTML = '<span class="bubble-shine"></span><img src="' + choice.image + '" alt="' + choice.word + '">';
    button.addEventListener("click", function () {
      if (Date.now() < bubbleState.ignoreClickUntil) return;
      var pickedWord = this.getAttribute("data-word");
      handleBubblePick(pickedWord === bubbleState.target.word, this, "tap");
    });
    bubbleArena.appendChild(button);
  }

  setTimeout(cueBubbleWord, 180);
}

function handleBubblePick(correct, element, mode) {
  if (bubbleState.locked) return;
  if (correct) {
    bubbleState.locked = true;
    awardPoints(5, bubbleState.topic);
    element.classList.add("popped");
    if (mode === "slice") element.classList.add("sliced");
    var buttons = bubbleArena.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].disabled = true;
    }
    speak(bubbleState.target.word, { rate: .74, pitch: 1.18 });
    saveState();
    updateStats();
    renderMap();
    setTimeout(renderBubbleRound, 1300);
  } else {
    state.streak = 0;
    element.classList.add("miss");
    if (mode === "slice") element.classList.add("sliced-miss");
    saveState();
    updateStats();
    setTimeout(function () {
      element.classList.remove("miss");
      element.classList.remove("sliced-miss");
      element.classList.remove("slice-hit");
    }, 420);
    cueBubbleWord();
  }
}

function startBubbleGame(topic) {
  bubbleState.topic = topic || state.topic || "animals";
  state.topic = bubbleState.topic;
  showScreen("bubble");
  resizeSliceCanvas();
  renderBubbleRound();
}

function toyWords() {
  return playableWords("play");
}

function cueToyWord() {
  if (!toyBoxState.target) return;
  speak(toyBoxState.target.word, { rate: .74, pitch: 1.14 });
}

function startToyBoxGame() {
  state.topic = "play";
  showScreen("toyBox");
  renderToyBoxRound();
}

function renderToyBoxRound() {
  var words = toyWords();
  var target = words[Math.floor(Math.random() * words.length)] || words[0];
  var distractors = shuffleItems(words.filter(function (item) {
    return item.word !== target.word;
  })).slice(0, 3);
  var choices = shuffleItems([target].concat(distractors)).slice(0, 4);

  toyBoxState.target = target;
  toyBoxState.locked = false;
  toyBoxState.dragging = null;
  toyBoxWord.textContent = target.word.toUpperCase();
  toyDropZone.classList.remove("toy-drop-correct", "toy-drop-wrong", "ready");
  toyShelf.innerHTML = "";

  for (var i = 0; i < choices.length; i += 1) {
    var choice = choices[i];
    var button = document.createElement("button");
    button.className = "toy-card";
    button.type = "button";
    button.setAttribute("data-word", choice.word);
    button.innerHTML = '<img src="' + choice.image + '" alt="' + choice.word + '"><b>' + choice.word + "</b>";
    button.addEventListener("pointerdown", startToyDrag, { passive: false });
    toyShelf.appendChild(button);
  }

  setTimeout(cueToyWord, 220);
}

function startToyDrag(event) {
  if (toyBoxState.locked || !screens.toyBox.classList.contains("active")) return;
  var element = event.currentTarget;
  toyBoxState.dragging = {
    element: element,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    dy: 0
  };
  element.classList.remove("toy-wrong");
  element.classList.add("dragging");
  if (element.setPointerCapture) element.setPointerCapture(event.pointerId);
  toyDropZone.classList.add("ready");
  if (event.cancelable) event.preventDefault();
}

function moveToyDrag(event) {
  var drag = toyBoxState.dragging;
  if (!drag || drag.pointerId !== event.pointerId) return;
  drag.dx = event.clientX - drag.startX;
  drag.dy = event.clientY - drag.startY;
  drag.element.style.transform = "translate(" + drag.dx + "px, " + drag.dy + "px) scale(1.08) rotate(3deg)";
  if (event.cancelable) event.preventDefault();
}

function endToyDrag(event) {
  var drag = toyBoxState.dragging;
  if (!drag || drag.pointerId !== event.pointerId) return;
  var element = drag.element;
  var rect = toyDropZone.getBoundingClientRect();
  var inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (element.releasePointerCapture) {
    try {
      element.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Safari can throw if capture already ended; the drop should still count.
    }
  }
  toyBoxState.dragging = null;
  toyDropZone.classList.remove("ready");
  element.classList.remove("dragging");
  if (inside) {
    handleToyDrop(element.getAttribute("data-word") === toyBoxState.target.word, element);
  } else {
    resetToyCard(element);
  }
}

function resetToyCard(element) {
  element.style.transform = "";
}

function handleToyDrop(correct, element) {
  if (toyBoxState.locked) return;
  if (correct) {
    toyBoxState.locked = true;
    awardPoints(5, "play");
    element.classList.add("toy-accepted");
    toyDropZone.classList.add("toy-drop-correct");
    createSparkles(toyDropZone);
    speak(toyBoxState.target.word, { rate: .72, pitch: 1.2 });
    saveState();
    updateStats();
    renderMap();
    setTimeout(renderToyBoxRound, 1400);
  } else {
    state.streak = 0;
    toyDropZone.classList.add("toy-drop-wrong");
    element.classList.add("toy-wrong");
    saveState();
    updateStats();
    setTimeout(function () {
      toyDropZone.classList.remove("toy-drop-wrong");
      resetToyCard(element);
      element.classList.remove("toy-wrong");
    }, 500);
    cueToyWord();
  }
}

function isBubbleScreenActive() {
  return screens.bubble && screens.bubble.classList.contains("active");
}

function resizeSliceCanvas() {
  if (!sliceCanvas || !sliceContext) return;
  var ratio = Math.min(window.devicePixelRatio || 1, 2);
  var width = window.innerWidth || document.documentElement.clientWidth || 1;
  var height = window.innerHeight || document.documentElement.clientHeight || 1;
  var pixelWidth = Math.round(width * ratio);
  var pixelHeight = Math.round(height * ratio);
  if (sliceCanvas.width !== pixelWidth || sliceCanvas.height !== pixelHeight) {
    sliceCanvas.width = pixelWidth;
    sliceCanvas.height = pixelHeight;
    sliceCanvas.style.width = width + "px";
    sliceCanvas.style.height = height + "px";
  }
  sliceContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function scheduleSliceDraw() {
  if (bubbleState.sliceRaf || !window.requestAnimationFrame) return;
  bubbleState.sliceRaf = window.requestAnimationFrame(drawSliceTrail);
}

function drawSliceTrail() {
  bubbleState.sliceRaf = 0;
  if (!sliceContext) return;
  resizeSliceCanvas();
  var now = Date.now();
  var width = window.innerWidth || document.documentElement.clientWidth || 1;
  var height = window.innerHeight || document.documentElement.clientHeight || 1;
  bubbleState.slicePoints = bubbleState.slicePoints.filter(function (point) {
    return now - point.time < 260;
  });
  sliceContext.clearRect(0, 0, width, height);
  if (bubbleState.slicePoints.length > 1) {
    for (var i = 1; i < bubbleState.slicePoints.length; i += 1) {
      var previous = bubbleState.slicePoints[i - 1];
      var current = bubbleState.slicePoints[i];
      var age = Math.max(0, Math.min(1, (now - current.time) / 260));
      var alpha = 1 - age;
      sliceContext.lineCap = "round";
      sliceContext.lineJoin = "round";
      sliceContext.strokeStyle = "rgba(255,255,255," + String(alpha * .95) + ")";
      sliceContext.lineWidth = 18 * alpha + 4;
      sliceContext.beginPath();
      sliceContext.moveTo(previous.x, previous.y);
      sliceContext.lineTo(current.x, current.y);
      sliceContext.stroke();
      sliceContext.strokeStyle = "rgba(255,217,61," + String(alpha * .88) + ")";
      sliceContext.lineWidth = 7 * alpha + 2;
      sliceContext.beginPath();
      sliceContext.moveTo(previous.x, previous.y);
      sliceContext.lineTo(current.x, current.y);
      sliceContext.stroke();
      sliceContext.strokeStyle = "rgba(76,150,254," + String(alpha * .82) + ")";
      sliceContext.lineWidth = 3 * alpha + 1;
      sliceContext.beginPath();
      sliceContext.moveTo(previous.x, previous.y);
      sliceContext.lineTo(current.x, current.y);
      sliceContext.stroke();
    }
  }
  if (bubbleState.slicePoints.length || bubbleState.slicing) scheduleSliceDraw();
}

function addSlicePoint(event) {
  var previous = bubbleState.slicePoints[bubbleState.slicePoints.length - 1];
  bubbleState.slicePoints.push({ x: event.clientX, y: event.clientY, time: Date.now() });
  if (bubbleState.slicePoints.length > 14) bubbleState.slicePoints.shift();
  scheduleSliceDraw();
  if (!previous) return 0;
  var dx = event.clientX - previous.x;
  var dy = event.clientY - previous.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function shouldIgnoreSliceTarget(target) {
  return !!(target && target.closest && target.closest(".bubble-icon-btn, .top-app-bar, .bottom-nav, .modal"));
}

function startSlice(event) {
  if (!isBubbleScreenActive() || shouldIgnoreSliceTarget(event.target)) return;
  bubbleState.slicing = true;
  bubbleState.slicePoints = [];
  bubbleState.ignoreClickUntil = Date.now() + 360;
  audioContext();
  addSlicePoint(event);
  playSliceWhoosh(.72);
  checkSliceHit(event.clientX, event.clientY);
  if (event.cancelable) event.preventDefault();
}

function moveSlice(event) {
  if (!bubbleState.slicing || !isBubbleScreenActive()) return;
  bubbleState.ignoreClickUntil = Date.now() + 360;
  var distance = addSlicePoint(event);
  if (distance > 10) playSliceWhoosh(Math.min(1.35, distance / 56));
  checkSliceHit(event.clientX, event.clientY);
  if (event.cancelable) event.preventDefault();
}

function endSlice() {
  bubbleState.slicing = false;
  scheduleSliceDraw();
}

function checkSliceHit(x, y) {
  if (!bubbleArena || bubbleState.locked) return;
  var buttons = bubbleArena.querySelectorAll(".bubble-choice:not(.slice-hit):not(.popped)");
  for (var i = 0; i < buttons.length; i += 1) {
    var button = buttons[i];
    if (button.disabled) continue;
    var rect = button.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var radius = Math.min(rect.width, rect.height) * .54;
    var dx = x - centerX;
    var dy = y - centerY;
    if (dx * dx + dy * dy <= radius * radius) {
      var isCorrect = button.getAttribute("data-word") === bubbleState.target.word;
      button.classList.add("slice-hit");
      bubbleState.ignoreClickUntil = Date.now() + 520;
      createSliceBurst(button, isCorrect, x, y);
      playSliceHit(isCorrect);
      handleBubblePick(isCorrect, button, "slice");
      if (isCorrect) return;
    }
  }
}

function createSliceBurst(element, correct, x, y) {
  var cut = document.createElement("span");
  cut.className = "slice-cut" + (correct ? "" : " wrong");
  element.appendChild(cut);
  setTimeout(function () {
    if (cut.parentNode) cut.parentNode.removeChild(cut);
  }, 620);

  var layer = sliceBurstLayer || document.body;
  var colors = correct ? ["#ffd93d", "#ffffff", "#4c96fe", "#8ff199"] : ["#ffffff", "#bae6fd", "#ffd93d"];
  for (var i = 0; i < 14; i += 1) {
    var shard = document.createElement("span");
    shard.className = "slice-shard";
    shard.style.left = String(x) + "px";
    shard.style.top = String(y) + "px";
    shard.style.background = colors[i % colors.length];
    shard.style.setProperty("--dx", String((Math.random() - .5) * 230) + "px");
    shard.style.setProperty("--dy", String((Math.random() - .7) * 190) + "px");
    shard.style.setProperty("--rot", String((Math.random() * 220) - 110) + "deg");
    layer.appendChild(shard);
    setTimeout(function (node) {
      return function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      };
    }(shard), 820);
  }
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
    startBubbleGame(state.topic);
  });
  $("#bubbleHomeBtn").addEventListener("click", function () {
    showScreen("home");
  });
  $("#bubbleReplayBtn").addEventListener("click", function () {
    cueBubbleWord();
  });
  $("#toyBoxHomeBtn").addEventListener("click", function () {
    showScreen("home");
  });
  $("#toyBoxReplayBtn").addEventListener("click", function () {
    cueToyWord();
  });
  if (screens.toyBox) {
    screens.toyBox.addEventListener("pointermove", moveToyDrag, { passive: false });
    screens.toyBox.addEventListener("pointerup", endToyDrag);
    screens.toyBox.addEventListener("pointercancel", endToyDrag);
  }
  if (screens.bubble) {
    screens.bubble.addEventListener("pointerdown", startSlice, { passive: false });
    window.addEventListener("pointermove", moveSlice, { passive: false });
    window.addEventListener("pointerup", endSlice);
    window.addEventListener("pointercancel", endSlice);
    window.addEventListener("resize", resizeSliceCanvas);
  }
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
