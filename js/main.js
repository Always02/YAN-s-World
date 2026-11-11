import { config } from "./content.js?v=20261111e";
import { tracks, playlistUrl } from "./playlist.js?v=20261111e";
import { birdSets, cameraPhotos, birdSrc, cameraSrc } from "./gallery.js?v=20261111e";
import { createWorld } from "./world.js?v=20261111e";

const $ = (id) => document.getElementById(id);

// debug hook
window.addEventListener("error", (event) => {
  document.body.dataset.error = `${event.message || "error"} @ ${event.filename || ""}:${event.lineno || ""}`;
});
window.addEventListener("unhandledrejection", (event) => {
  document.body.dataset.error = `rejection: ${event.reason?.message || event.reason}`;
});

const gate = $("gate");
const gateForm = $("gate-form");
const password = $("password");
const gateError = $("gate-error");
const worldEl = $("world");
const loading = $("loading");
const bubble = $("bubble");
const bubbleTitle = $("bubble-title");
const bubbleBody = $("bubble-body");
const letterEl = $("letter");
const letterKicker = $("letter-kicker");
const letterTitle = $("letter-title");
const letterBody = $("letter-body");
const letterSign = $("letter-sign");
const hint = $("hint");
const hud = $("hud");
const intro = $("intro");
const backButton = $("back");

const recordEl = $("record");
const recordSleeve = $("record-sleeve");
const recordLabel = $("record-label");
const recordTitle = $("record-title");
const recordArtist = $("record-artist");
const recordAlbum = $("record-album");
const recordPlay = $("record-play");
const recordCount = $("record-count");

const tapeEl = $("tape");
const tapeAudio = $("tape-audio");
const tapePlay = $("tape-play");
const tapeProgress = $("tape-progress");
const tapeTime = $("tape-time");

const articleEl = $("article");
const articleKicker = $("article-kicker");
const articleTitle = $("article-title");
const articleSub = $("article-sub");
const articleBody = $("article-body");

const camEl = $("cam");
const camDeck = $("cam-deck");
const camCount = $("cam-count");
const camFile = $("cam-file");
const moviesEl = $("movies");
const moviesRow = $("movies-row");
const albumEl = $("album");
const albumMain = $("album-main");
const albumB = $("album-b");
const albumC = $("album-c");
const albumName = $("album-name");
const albumIndex = $("album-index");
const albumCount = $("album-count");

const STORAGE_KEY = "a-little-world.unlocked";
const SONG_URL = "https://music.163.com/song?id=";

let world = null;
let booted = false;
let introTimer = 0;
let activeKey = null;
let recordIndex = -1;
let bubbleFrame = 0;

document.title = config.title;
$("gate-hint").textContent = config.hint;
$("intro-text").textContent = config.intro || "";

/* ------------------------------------------------------------------
   进门
------------------------------------------------------------------- */
function enter(instant = false) {
  gate.classList.add("is-leaving");
  window.setTimeout(() => {
    gate.hidden = true;
  }, instant ? 0 : 900);
  boot();
}

gateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = password.value.trim();

  if (value === config.password) {
    sessionStorage.setItem(STORAGE_KEY, "1");
    gateError.textContent = "";
    enter();
  } else {
    gateError.textContent = "密码不对，再想想。";
    password.value = "";
    password.focus();
    gateForm.classList.remove("shake");
    void gateForm.offsetWidth;
    gateForm.classList.add("shake");
  }
});

if (sessionStorage.getItem(STORAGE_KEY) === "1") {
  enter(true);
}

/* ------------------------------------------------------------------
   启动
------------------------------------------------------------------- */
function boot() {
  if (booted) return;
  booted = true;

  worldEl.hidden = false;
  hud.hidden = false;
  hint.hidden = false;
  loading.hidden = false;

  try {
    world = createWorld(worldEl, config);
  } catch (error) {
    console.error(error);
    document.body.dataset.error = error?.message || String(error);
    $("fallback").hidden = false;
    loading.hidden = true;
    return;
  }

  world.onSelect = openBubble;
  world.onClose = closeBubble;
  world.onLetter = openTape;
  world.onNotebook = openArticle;
  world.onCrate = openCrate;
  world.onPlaylist = () => window.open(playlistUrl, "_blank", "noopener");
  world.onMonitor = showNextWallpaper;
  world.onMonitorDouble = pauseMonitorMusic;
  world.onKeyboard = playRusty;
  world.onKnight = openKnight;
  world.onCamera = openCamera;
  world.onBirds = openAlbum;
  world.onBirdbook = handleBirdbook;
  world.onMovies = openMovies;
  world.onMap = openMapDraw;
  world.onLibrary = openLibrary;
  world.onPoster = () => $("poster-edit").classList.add("is-open");
  world.onReady = onWorldReady;

  window.setTimeout(() => hint.classList.add("is-dim"), 9000);
  tickBubble();
}

function onWorldReady() {
  loading.classList.add("is-done");
  window.setTimeout(() => {
    loading.hidden = true;
    loading.classList.remove("is-done");
  }, 720);

  if (config.intro) {
    intro.classList.add("is-on");
    window.clearTimeout(introTimer);
    introTimer = window.setTimeout(() => intro.classList.remove("is-on"), 5600);
  }

  // 调试：?open=desk 打开某个气泡，?record=1 打开唱片
  const params = new URLSearchParams(location.search);
  const openKey = params.get("open");
  if (openKey && config.hotspots[openKey]) {
    world.focus(openKey);
    openBubble(openKey, config.hotspots[openKey]);
  }
  if (params.get("snap") === "1") {
    window.setTimeout(() => world.snap(), 60);
  }
  if (params.get("record") === "1") {
    openRecord(0);
  }
  if (params.get("screen")) {
    showNextWallpaper();
  }
  if (params.get("rusty") === "1") {
    playRusty();
  }
  if (params.get("tape") === "1") {
    openTape();
  }
  if (params.get("article") === "1") {
    openArticle();
  }
  if (params.get("camera") === "1") {
    openCamera();
  }
  if (params.get("birds") === "1") {
    if (params.get("birdpage")) albumPage = Number(params.get("birdpage")) || 0;
    openAlbum();
  }
  if (params.get("notes")) {
    startNotes(params.get("notes"));
  }
  if (params.get("movies") === "1") {
    openMovies();
  }
  if (params.get("map") === "1") {
    openMapDraw();
  }
  if (params.get("library") === "1") {
    openLibrary();
  }
}

/* ------------------------------------------------------------------
   气泡
------------------------------------------------------------------- */
function openBubble(key, data) {
  if (!data) return;

  activeKey = key;

  if (key === "calendar") {
    const today = new Date();
    data = { ...data, title: `${today.getMonth() + 1}月${today.getDate()}日` };
  }
  bubbleTitle.textContent = data.title || "";
  bubbleBody.textContent = data.body || "";

  if (key === "guitar" || key === "drums") {
    toggleObjectSound(key);
  }

  bubble.classList.add("is-open");
  bubble.setAttribute("aria-hidden", "false");
  backButton.hidden = false;
  hint.classList.add("is-dim");
  positionBubble();
}

function closeBubble() {
  activeKey = null;
  knightLine = 0;
  knightFinished = false;
  $("poster-edit").classList.remove("is-open");
  window.clearTimeout(rustyTimer);
  bubble.classList.remove("is-open");
  bubble.setAttribute("aria-hidden", "true");
  backButton.hidden = true;
}

function positionBubble() {
  if (!activeKey || !world) return;

  const rect = world.getScreenRect(activeKey);
  if (!rect) {
    bubble.style.opacity = "0";
    return;
  }
  bubble.style.opacity = "";

  const bw = bubble.offsetWidth;
  const bh = bubble.offsetHeight;
  const gap = 18;
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let mode = "above";
  let left = rect.cx;
  let top = rect.top - gap;

  if (top - bh < margin) {
    mode = "below";
    top = rect.bottom + gap;
  }

  const rectW = rect.right - rect.left;
  const rectH = rect.bottom - rect.top;
  if (rectW > rectH * 1.45) {
    if (rect.right + gap + bw < vw - margin) {
      mode = "right";
      left = rect.right + gap;
      top = rect.top + (rect.bottom - rect.top) * 0.22;
    } else {
      mode = "left";
      left = rect.left - gap;
      top = rect.top + (rect.bottom - rect.top) * 0.22;
    }
  }

  if (mode === "above" || mode === "below") {
    left = Math.min(Math.max(left, bw / 2 + margin), vw - bw / 2 - margin);
  } else if (mode === "right") {
    left = Math.min(left, vw - bw - margin);
  } else {
    left = Math.max(left, bw + margin);
  }

  top = Math.min(Math.max(top, margin), vh - bh - margin);

  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
  bubble.classList.toggle("is-below", mode === "below");
  bubble.classList.toggle("is-right", mode === "right");
  bubble.classList.toggle("is-left", mode === "left");
}

function tickBubble() {
  bubbleFrame = requestAnimationFrame(tickBubble);
  if (activeKey) positionBubble();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(bubbleFrame);
  else tickBubble();
});

/* ------------------------------------------------------------------
   唱片
------------------------------------------------------------------- */
function renderTrack() {
  const track = tracks[recordIndex];
  if (!track) return;

  recordSleeve.style.backgroundImage = `url("${track.cover}")`;
  recordLabel.style.backgroundImage = `url("${track.cover}")`;
  recordTitle.textContent = track.title;
  recordArtist.textContent = track.artist;
  recordAlbum.textContent = track.album;
  recordPlay.href = SONG_URL + track.id;
  recordCount.textContent = `${String(recordIndex + 1).padStart(2, "0")} / ${String(tracks.length).padStart(2, "0")}`;
}

function openRecord(index) {
  recordEl.classList.remove("is-playing");
  recordIndex = ((index % tracks.length) + tracks.length) % tracks.length;
  renderTrack();
  recordEl.querySelectorAll(".record__art, .record__meta").forEach((el) => {
    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
  });
  closeBubble();
  world?.exitFocus();
  recordEl.classList.add("is-open");
  recordEl.setAttribute("aria-hidden", "false");
}

function closeRecord() {
  recordEl.classList.remove("is-open", "is-playing");
  recordEl.setAttribute("aria-hidden", "true");
}

function openCrate() {
  openRecord(recordIndex + 1);
}

$("record-close").addEventListener("click", closeRecord);
$("record-backdrop").addEventListener("click", closeRecord);

let switching = false;

function switchTrack(step) {
  if (switching) return;
  const dir = step > 0 ? 1 : -1;
  const layers = [
    recordEl.querySelector(".record__art"),
    recordEl.querySelector(".record__meta")
  ].filter(Boolean);

  switching = true;
  layers.forEach((el) => {
    el.style.transition = "transform .18s ease, opacity .18s ease";
    el.style.transform = `translateX(${-34 * dir}px)`;
    el.style.opacity = "0";
  });

  window.setTimeout(() => {
    recordIndex = (recordIndex + step + tracks.length) % tracks.length;
    renderTrack();

    layers.forEach((el) => {
      el.style.transition = "none";
      el.style.transform = `translateX(${34 * dir}px)`;
      el.style.opacity = "0";
    });

    requestAnimationFrame(() => {
      layers.forEach((el) => {
        el.style.transition = "transform .28s cubic-bezier(.2,.7,.2,1), opacity .28s ease";
        el.style.transform = "translateX(0)";
        el.style.opacity = "1";
      });
    });

    window.setTimeout(() => {
      switching = false;
    }, 300);
  }, 180);
}

$("record-prev").addEventListener("click", () => switchTrack(-1));
$("record-next").addEventListener("click", () => switchTrack(1));
recordPlay.addEventListener("click", () => {
  recordEl.classList.add("is-playing");
});

/* ------------------------------------------------------------------
   电影木箱
------------------------------------------------------------------- */
const MOVIES = [
  { title: "奥德赛", img: "./movies/odyssey.jpg" },
  { title: "浴血黑帮", img: "./movies/peaky.jpg" },
  { title: "天空之城", img: "./movies/castle.jpg" },
  { title: "路边野餐", img: "./movies/kaili.jpg" },
  { title: "人生大事", img: "./movies/stars.jpg" }
];

const movieDeck = $("movies-deck");
const movieReview = $("mv-review");
const movieReviewTitle = $("mv-review-title");
const movieReviewText = $("mv-review-text");

let movieIndex = 0;
let movieCards = [];
let movieReviews = {};

try {
  movieReviews = JSON.parse(localStorage.getItem("alw.movieReviews") || "{}") || {};
} catch (error) {
  movieReviews = {};
}

function buildMovieCards() {
  if (movieCards.length) return;

  MOVIES.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "movies__card";
    card.style.backgroundImage = `url("${movie.img}")`;
    card.addEventListener("click", () => {
      if (index === movieIndex) {
        openMovieReview();
      } else {
        movieIndex = index;
        updateMovie();
      }
    });
    movieDeck.appendChild(card);
    movieCards.push(card);
  });
}

function updateMovie() {
  buildMovieCards();
  const total = MOVIES.length;
  movieIndex = ((movieIndex % total) + total) % total;

  movieCards.forEach((card, index) => {
    let offset = index - movieIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const abs = Math.abs(offset);
    const scale = Math.max(0.6, 1 - abs * 0.16);
    card.style.transform = `translate(${offset * 230}px, ${abs * 14}px) rotateY(${offset * -7}deg) scale(${scale})`;
    card.style.zIndex = String(30 - abs);
    card.style.opacity = String(Math.max(0, 1 - abs * 0.3));
    card.style.filter = `brightness(${Math.max(0.5, 1 - abs * 0.2)})`;
  });
}

function openMovieReview() {
  const movie = MOVIES[movieIndex];
  movieReviewTitle.textContent = movie.title;
  movieReviewText.value = movieReviews[movie.title] || "";
  movieReview.hidden = false;
  movieReviewText.focus();
}

function saveMovieReview() {
  const movie = MOVIES[movieIndex];
  movieReviews[movie.title] = movieReviewText.value;
  try {
    localStorage.setItem("alw.movieReviews", JSON.stringify(movieReviews));
  } catch (error) {
    // ignore
  }
  movieReview.hidden = true;
}

function openMovies() {
  closeBubble();
  updateMovie();
  moviesEl.classList.add("is-open");
  moviesEl.setAttribute("aria-hidden", "false");
}

function closeMovies() {
  movieReview.hidden = true;
  moviesEl.classList.remove("is-open");
  moviesEl.setAttribute("aria-hidden", "true");
}

$("movies-close").addEventListener("click", closeMovies);
$("movies-backdrop").addEventListener("click", closeMovies);
$("mv-prev").addEventListener("click", () => {
  movieIndex -= 1;
  updateMovie();
});
$("mv-next").addEventListener("click", () => {
  movieIndex += 1;
  updateMovie();
});
$("mv-review-save").addEventListener("click", saveMovieReview);
movieReview.addEventListener("click", (event) => {
  if (event.target === movieReview) movieReview.hidden = true;
});

/* ------------------------------------------------------------------
   悬浮书架
------------------------------------------------------------------- */
const libraryEl = $("library");
const libraryBooks = $("library-books");

const DEFAULT_BOOKS = [
  { title: "三体", color: "#2f4a6b", height: 286 },
  { title: "刀锋", color: "#b5713f", height: 258 },
  { title: "不能承受的生命之轻", color: "#7d94a6", height: 272 },
  { title: "1984", color: "#3d3b36", height: 244 },
  { title: "局外人", color: "#a8694f", height: 266 },
  { title: "变形记", color: "#5c6b4f", height: 236 }
];

let libraryData = (() => {
  try {
    const raw = localStorage.getItem("alw.books");
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (error) {
    // ignore
  }
  return DEFAULT_BOOKS.map((book) => ({ ...book }));
})();

function saveLibrary() {
  try {
    localStorage.setItem("alw.books", JSON.stringify(libraryData));
  } catch (error) {
    // ignore
  }
}

function renderLibrary() {
  libraryBooks.innerHTML = "";

  libraryData.forEach((book, index) => {
    const spine = document.createElement("div");
    spine.className = "library__book";
    spine.style.height = `${book.height}px`;
    spine.style.background = `linear-gradient(90deg, ${book.color}, rgba(0,0,0,0.35))`;
    spine.title = book.title;

    const label = document.createElement("span");
    label.textContent = book.title;
    spine.appendChild(label);

    spine.addEventListener("click", () => {
      openReader(book);
    });

    libraryBooks.appendChild(spine);
  });
}

function openLibrary() {
  closeBubble();
  renderLibrary();
  libraryEl.classList.add("is-open");
  libraryEl.setAttribute("aria-hidden", "false");
}

function closeLibrary() {
  libraryEl.classList.remove("is-open");
  libraryEl.setAttribute("aria-hidden", "true");
}

$("library-close").addEventListener("click", closeLibrary);
$("library-backdrop").addEventListener("click", closeLibrary);
$("library-add").addEventListener("click", () => {
  const title = window.prompt("放一本什么书？");
  if (!title || !title.trim()) return;
  const link = window.prompt("书的链接（可留空，支持网页 / PDF / EPUB）") || "";
  libraryData.push({
    title: title.trim(),
    link: link.trim(),
    color: ["#2f4a6b", "#b5713f", "#7d94a6", "#3d3b36", "#a8694f", "#5c6b4f"][libraryData.length % 6],
    height: 236 + Math.floor(Math.random() * 50)
  });
  saveLibrary();
  renderLibrary();
});

function openReader(book) {
  const reader = $("reader");
  const frame = $("reader-frame");
  const openLink = $("reader-open");
  const tip = $("reader-tip");

  $("reader-title").textContent = book.title;

  if (book.link) {
    frame.style.display = "block";
    frame.src = book.link;
    openLink.href = book.link;
    openLink.style.display = "";
    tip.hidden = false;
    tip.textContent = "部分网站禁止内嵌，加载空白时点右上角「在新标签打开」";
  } else {
    frame.style.display = "none";
    frame.removeAttribute("src");
    openLink.style.display = "none";
    tip.hidden = false;
    tip.textContent = "这本书还没放链接，重新添加时可以填一个网页 / PDF / EPUB 地址";
  }

  reader.hidden = false;
}

function closeReader() {
  $("reader").hidden = true;
  $("reader-frame").removeAttribute("src");
}

$("reader-close").addEventListener("click", closeReader);

$("poster-file").addEventListener("change", () => {
  const file = ($("poster-file").files || [])[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    world?.setPosterImage?.(img);
    URL.revokeObjectURL(url);
    $("poster-edit").classList.remove("is-open");
  };
  img.src = url;
  $("poster-file").value = "";
});

/* ------------------------------------------------------------------
   地图：城市记忆 / 涂鸦 / 加地点
------------------------------------------------------------------- */
const mapdrawEl = $("mapdraw");
const mapWrap = mapdrawEl.querySelector(".mapdraw__wrap");
const mapCanvas = $("mapdraw-canvas");
const mapCtx = mapCanvas.getContext("2d");
const mapMarkersBox = $("mapdraw-markers");
const mapBar = mapdrawEl.querySelector(".mapdraw__bar");
const mapMemory = $("mapdraw-memory");
const mapMemoryTitle = $("mapdraw-memory-title");
const mapMemoryText = $("mapdraw-memory-text");
const mapDeleteBtn = $("mapdraw-memory-delete");
const mapAddPanel = $("mapadd");
let pendingSpot = null;
let pendingMarkerEl = null;

function clearPendingSpot() {
  if (pendingMarkerEl) {
    pendingMarkerEl.remove();
    pendingMarkerEl = null;
  }
  pendingSpot = null;
  mapAddPanel.hidden = true;
}
const mapEditBtn = $("map-edit");
const mapDrawBtn = $("map-draw");
const mapAddBtn = $("map-add");
const mapEraseBtn = $("map-erase");

const MAP_W = 1400;
const MAP_H = 1000;
let mapColor = "#2b2b2a";
let mapErasing = false;
let mapDrawing = false;
let mapLast = null;
let mapMode = "view";

mapCanvas.width = MAP_W;
mapCanvas.height = MAP_H;

const defaultMarkers = [
  { name: "成都", x: 0.497, y: 0.644, builtin: true, memory: "" },
  { name: "北京", x: 0.695, y: 0.394, builtin: true, memory: "" }
];

let mapMarkers = (() => {
  try {
    const raw = localStorage.getItem("alw.mapPins");
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (error) {
    // ignore
  }
  return defaultMarkers.map((marker) => ({ ...marker }));
})();

let currentMarker = null;

function saveMarkers() {
  try {
    localStorage.setItem("alw.mapPins", JSON.stringify(mapMarkers));
  } catch (error) {
    // ignore
  }
}

function renderMarkers() {
  mapMarkersBox.innerHTML = "";

  mapMarkers.forEach((marker) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mapdraw__marker${marker.builtin ? " mapdraw__marker--builtin" : " mapdraw__marker--custom"}`;
    button.style.left = `${marker.x * 100}%`;
    button.style.top = `${marker.y * 100}%`;
    button.textContent = marker.builtin ? "" : marker.name;
    button.setAttribute("aria-label", `${marker.name}记忆`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openMemory(marker);
    });
    mapMarkersBox.appendChild(button);
  });
}

function openMemory(marker) {
  currentMarker = marker;
  mapMemoryTitle.textContent = `${marker.name}记忆`;
  mapMemoryText.value = marker.memory || "";
  mapDeleteBtn.hidden = mapMode !== "edit";
  mapMemory.hidden = false;
  window.setTimeout(() => mapMemoryText.focus(), 30);
}

function closeMemory() {
  if (currentMarker) {
    currentMarker.memory = mapMemoryText.value;
    saveMarkers();
  }
  currentMarker = null;
  mapMemory.hidden = true;
}

function setMode(mode) {
  if (mode !== "place") clearPendingSpot();
  mapMode = mode;
  mapCanvas.classList.toggle("is-editing", mode === "draw");
  mapBar.hidden = mode !== "draw";
  mapWrap.classList.toggle("is-placing", mode === "place");
  [mapEditBtn, mapDrawBtn, mapAddBtn].forEach((button) => button.classList.remove("is-active"));
  if (mode === "edit") mapEditBtn.classList.add("is-active");
  if (mode === "draw") mapDrawBtn.classList.add("is-active");
  if (mode === "place") mapAddBtn.classList.add("is-active");
}

function loadMapDrawing() {
  mapCtx.clearRect(0, 0, MAP_W, MAP_H);
  try {
    const saved = localStorage.getItem("alw.mapDrawing");
    if (!saved) return;
    const img = new Image();
    img.onload = () => mapCtx.drawImage(img, 0, 0, MAP_W, MAP_H);
    img.src = saved;
  } catch (error) {
    // ignore
  }
}

function mapPoint(event) {
  const rect = mapCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * MAP_W,
    y: ((event.clientY - rect.top) / rect.height) * MAP_H
  };
}

mapCanvas.addEventListener("pointerdown", (event) => {
  if (mapMode !== "draw") return;
  mapDrawing = true;
  mapLast = mapPoint(event);
  mapCanvas.setPointerCapture(event.pointerId);
});

mapCanvas.addEventListener("pointermove", (event) => {
  if (mapMode !== "draw" || !mapDrawing) return;
  const point = mapPoint(event);
  mapCtx.globalCompositeOperation = mapErasing ? "destination-out" : "source-over";
  mapCtx.strokeStyle = mapColor;
  mapCtx.lineWidth = mapErasing ? 26 : 7;
  mapCtx.lineCap = "round";
  mapCtx.lineJoin = "round";
  mapCtx.beginPath();
  mapCtx.moveTo(mapLast.x, mapLast.y);
  mapCtx.lineTo(point.x, point.y);
  mapCtx.stroke();
  mapCtx.globalCompositeOperation = "source-over";
  mapLast = point;
});

mapCanvas.addEventListener("pointerup", () => { mapDrawing = false; });
mapCanvas.addEventListener("pointercancel", () => { mapDrawing = false; });

document.querySelectorAll(".mapdraw__dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    mapColor = dot.dataset.color;
    mapErasing = false;
    mapEraseBtn.classList.remove("is-active");
    document.querySelectorAll(".mapdraw__dot").forEach((item) => item.classList.remove("is-active"));
    dot.classList.add("is-active");
  });
});

mapEraseBtn.addEventListener("click", () => {
  mapErasing = !mapErasing;
  mapEraseBtn.classList.toggle("is-active", mapErasing);
});

function openMapDraw() {
  closeBubble();
  loadMapDrawing();
  renderMarkers();
  setMode("view");
  mapdrawEl.classList.add("is-open");
  mapdrawEl.setAttribute("aria-hidden", "false");
}

function closeMapDraw() {
  setMode("view");
  closeMemory();
  mapdrawEl.classList.remove("is-open");
  mapdrawEl.setAttribute("aria-hidden", "true");
}

mapEditBtn.addEventListener("click", () => setMode("edit"));
mapDrawBtn.addEventListener("click", () => setMode(mapMode === "draw" ? "view" : "draw"));
mapAddBtn.addEventListener("click", () => setMode(mapMode === "place" ? "view" : "place"));

$("mapdraw-close").addEventListener("click", closeMapDraw);
$("mapdraw-memory-close").addEventListener("click", closeMemory);
mapDeleteBtn.addEventListener("click", () => {
  if (!currentMarker) return;
  if (!window.confirm(`删除「${currentMarker.name}」这个地点？`)) return;
  const index = mapMarkers.indexOf(currentMarker);
  if (index >= 0) mapMarkers.splice(index, 1);
  saveMarkers();
  renderMarkers();
  currentMarker = null;
  closeMemory();
});
mapMemory.addEventListener("click", (event) => {
  if (event.target === mapMemory) closeMemory();
});

$("mapdraw-clear").addEventListener("click", () => {
  mapCtx.clearRect(0, 0, MAP_W, MAP_H);
  try { localStorage.removeItem("alw.mapDrawing"); } catch (error) { /* ignore */ }
  world?.setMapDrawing?.(null);
});

$("mapdraw-save").addEventListener("click", () => {
  const url = mapCanvas.toDataURL("image/png");
  try { localStorage.setItem("alw.mapDrawing", url); } catch (error) { /* ignore */ }
  world?.setMapDrawing?.(url);
  saveMarkers();
  setMode("view");
});

mapWrap.addEventListener("click", (event) => {
  if (mapMode !== "place") return;
  if (event.target.closest(".mapdraw__marker") || event.target.closest(".mapadd")) return;

  const rect = mapWrap.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return;

  clearPendingSpot();
  pendingSpot = { x, y };
  pendingMarkerEl = document.createElement("button");
  pendingMarkerEl.type = "button";
  pendingMarkerEl.className = "mapdraw__marker mapdraw__marker--custom mapdraw__marker--pending";
  pendingMarkerEl.style.left = `${x * 100}%`;
  pendingMarkerEl.style.top = `${y * 100}%`;
  pendingMarkerEl.textContent = "?";
  pendingMarkerEl.addEventListener("click", (event) => event.stopPropagation());
  mapMarkersBox.appendChild(pendingMarkerEl);
  mapAddPanel.hidden = false;
});

$("mapadd-yes").addEventListener("click", () => {
  if (!pendingSpot) return;
  const name = window.prompt("这个地点叫什么？");
  if (name && name.trim()) {
    mapMarkers.push({ name: name.trim(), x: pendingSpot.x, y: pendingSpot.y, memory: "" });
    saveMarkers();
    renderMarkers();
  }
  clearPendingSpot();
  setMode("view");
});

$("mapadd-no").addEventListener("click", () => {
  clearPendingSpot();
  setMode("view");
});


/* ------------------------------------------------------------------
   相机相册 / 鸟相册
------------------------------------------------------------------- */
const GALLERY_KEY = "alw.gallery.v1";
let galleryStore = { bird: {}, camera: [] };

try {
  const raw = localStorage.getItem(GALLERY_KEY);
  if (raw) galleryStore = Object.assign(galleryStore, JSON.parse(raw));
} catch (error) {
  // ignore
}

function persistGallery() {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(galleryStore));
  } catch (error) {
    // 存不下就只在本次会话里用
  }
}

function readCompressed(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1000;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function cameraList() {
  return [...cameraPhotos.map(cameraSrc), ...galleryStore.camera];
}

let camIndex = 0;
let camCards = [];

function updateCam() {
  const total = camCards.length;
  if (!total) return;
  camIndex = ((camIndex % total) + total) % total;

  camCards.forEach((card, index) => {
    let offset = index - camIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const abs = Math.abs(offset);
    const scale = Math.max(0.6, 1 - abs * 0.16);
    card.style.transform = `translate(${offset * 240}px, ${abs * 12}px) rotateY(${offset * -7}deg) scale(${scale})`;
    card.style.zIndex = String(30 - abs);
    card.style.opacity = String(Math.max(0, 1 - abs * 0.3));
    card.style.filter = `brightness(${Math.max(0.5, 1 - abs * 0.2)})`;
  });

  camCount.textContent = `${String(camIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

function renderCamera() {
  const list = cameraList();
  camDeck.innerHTML = "";
  camCards = [];

  list.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "cam__card";
    card.style.backgroundImage = `url("${src}")`;
    card.addEventListener("click", () => {
      if (index === camIndex) {
        const img = new Image();
        img.onload = () => world?.setFrameImage?.(img);
        img.src = src;
        closeCamera();
      } else {
        camIndex = index;
        updateCam();
      }
    });
    camDeck.appendChild(card);
    camCards.push(card);
  });

  updateCam();
}

function openCamera() {
  renderCamera();
  closeBubble();
  camEl.classList.add("is-open");
  camEl.setAttribute("aria-hidden", "false");
}

function closeCamera() {
  camEl.classList.remove("is-open");
  camEl.setAttribute("aria-hidden", "true");
}

$("cam-prev").addEventListener("click", () => {
  camIndex -= 1;
  updateCam();
});

$("cam-next").addEventListener("click", () => {
  camIndex += 1;
  updateCam();
});

camFile.addEventListener("change", () => {
  Array.from(camFile.files || []).forEach((file) => {
    readCompressed(file, (data) => {
      galleryStore.camera.push(data);
      persistGallery();
      camIndex = cameraList().length - 1;
      renderCamera();
    });
  });
  camFile.value = "";
});

/* ------------------------------------------------------------------
   百鸟图鉴（连续摄影集）
------------------------------------------------------------------- */
const ALBUM_KEY = "alw.album.v3";
const albumBook = $("album-book");
const albumCountEl = $("album-count");
const lightbox = $("lightbox");
const lightboxImg = $("lightbox-img");

const baseAlbumPhotos = birdSets.flatMap((set) => set.photos.map(birdSrc));

let albumPhotos = (() => {
  try {
    const raw = localStorage.getItem(ALBUM_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch (error) {
    // ignore
  }
  return [...baseAlbumPhotos];
})();

let albumPage = 0;
let albumSpreads = [];

function persistAlbum() {
  try {
    localStorage.setItem(ALBUM_KEY, JSON.stringify(albumPhotos));
  } catch (error) {
    // ignore
  }
}

function buildSpreads() {
  albumSpreads = [{ type: "cover" }];
  let index = 0;
  let step = 0;

  while (index < albumPhotos.length) {
    if (index === 8 && albumPhotos.length > 12) {
      albumSpreads.push({ type: "divider" });
    }
    const mod = step % 3;
    const wanted = mod === 0 ? 1 : mod === 1 ? 3 : 2;
    const count = Math.min(wanted, albumPhotos.length - index);
    albumSpreads.push({
      type: mod === 0 ? "full" : mod === 1 ? "stack" : "pair",
      from: index,
      count
    });
    index += count;
    step += 1;
  }
}

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

function movePhoto(index, dir) {
  const target = index + dir;
  if (target < 0 || target >= albumPhotos.length) return;
  [albumPhotos[index], albumPhotos[target]] = [albumPhotos[target], albumPhotos[index]];
  persistAlbum();
  renderAlbum();
}

function removePhoto(index) {
  albumPhotos.splice(index, 1);
  persistAlbum();
  renderAlbum();
}

let replaceIndex = -1;

function replacePhoto(index) {
  replaceIndex = index;
  $("album-replace").click();
}

function makeFigure(src, index, style, options = {}) {
  const figure = document.createElement("figure");
  figure.className = `album__figure${options.bleed ? " is-bleed" : ""}`;
  Object.assign(figure.style, style);

  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.loading = "lazy";
  img.addEventListener("click", () => openLightbox(src));
  figure.appendChild(img);

  const tools = document.createElement("div");
  tools.className = "album__tools";
  tools.innerHTML = '<button data-act="left" type="button">‹</button><button data-act="right" type="button">›</button><button data-act="rep" type="button">↻</button><button data-act="del" type="button">×</button>';
  tools.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = event.target.dataset.act;
    if (action === "left") movePhoto(index, -1);
    if (action === "right") movePhoto(index, 1);
    if (action === "del") removePhoto(index);
    if (action === "rep") replacePhoto(index);
  });
  figure.appendChild(tools);

  return figure;
}

function pageBase(className) {
  const page = document.createElement("div");
  page.className = `album__page ${className}`;
  return page;
}

function renderAlbum() {
  buildSpreads();
  albumPage = Math.max(0, Math.min(albumPage, albumSpreads.length - 1));

  albumBook.innerHTML = "";
  const spread = albumSpreads[albumPage];
  const left = pageBase("album__page--left");
  const right = pageBase("album__page--right");

  if (spread.type === "cover") {
    const cover = document.createElement("div");
    cover.className = "album__cover";
    cover.innerHTML = `
      <div class="album__cover-photo" style="background-image:url('${albumPhotos[0] || ""}')"></div>
      <div class="album__cover-text">
        <img class="album__cover-guan" src="./art/guan.png" alt="观">
        <div class="album__cover-meta">百鸟图鉴<br>A BOOK OF BIRDS<br>盐</div>
      </div>`;
    albumBook.appendChild(cover);
  } else if (spread.type === "divider") {
    const divider = document.createElement("div");
    divider.className = "album__divider";
    divider.innerHTML = `<span>观</span><p>百鸟图鉴<br>盐 摄<br>2026</p>`;
    albumBook.appendChild(divider);
  } else {
    const photos = albumPhotos.slice(spread.from, spread.from + spread.count);

    if (spread.type === "full") {
      left.appendChild(makeFigure(photos[0], spread.from, { left: "5%", top: "6%", width: "90%", height: "80%" }, { bleed: true }));
      const caption = document.createElement("div");
      caption.className = "album__caption";
      caption.style.left = "5%";
      caption.style.bottom = "5%";
      caption.textContent = `NO. ${String(spread.from + 1).padStart(2, "0")} · 观鸟`;
      left.appendChild(caption);
    }

    if (spread.type === "stack") {
      left.appendChild(makeFigure(photos[0], spread.from, { left: "7%", top: "9%", width: "86%", height: "78%" }));
      if (photos[1]) {
        right.appendChild(makeFigure(photos[1], spread.from + 1, { left: "12%", top: "12%", width: "76%", height: "36%" }));
      }
      if (photos[2]) {
        right.appendChild(makeFigure(photos[2], spread.from + 2, { left: "24%", top: "55%", width: "60%", height: "30%" }, { bleed: true }));
      }
    }

    if (spread.type === "pair") {
      left.appendChild(makeFigure(photos[0], spread.from, { left: "0%", top: "10%", width: "86%", height: "78%" }, { bleed: true }));
      if (photos[1]) {
        right.appendChild(makeFigure(photos[1], spread.from + 1, { left: "14%", top: "26%", width: "72%", height: "46%" }));
      }
    }

    const folioLeft = document.createElement("div");
    folioLeft.className = "album__folio album__folio--l";
    folioLeft.textContent = String(albumPage * 2 + 1).padStart(2, "0");
    left.appendChild(folioLeft);

    const folioRight = document.createElement("div");
    folioRight.className = "album__folio album__folio--r";
    folioRight.textContent = String(albumPage * 2 + 2).padStart(2, "0");
    right.appendChild(folioRight);

    albumBook.appendChild(left);
    albumBook.appendChild(right);
  }

  const gutter = document.createElement("div");
  gutter.className = "album__gutter";
  albumBook.appendChild(gutter);

  albumCountEl.textContent = `${String(albumPage + 1).padStart(2, "0")} / ${String(albumSpreads.length).padStart(2, "0")}`;
}

let birdbookClicks = 0;

function handleBirdbook() {
  if (birdbookClicks % 2 === 0) {
    openBubble("birdbook", config.hotspots.birdbook);
  } else {
    closeBubble();
    openAlbum();
  }
  birdbookClicks += 1;
}

function openAlbum() {
  closeBubble();
  renderAlbum();
  albumEl.classList.add("is-open");
  albumEl.setAttribute("aria-hidden", "false");
}

function closeAlbum() {
  closeLightbox();
  albumEl.classList.remove("is-open");
  albumEl.setAttribute("aria-hidden", "true");
}

$("cam-close").addEventListener("click", closeCamera);
$("cam-backdrop").addEventListener("click", closeCamera);
$("album-close").addEventListener("click", closeAlbum);
$("album-backdrop").addEventListener("click", closeAlbum);
lightbox.addEventListener("click", closeLightbox);

$("album-prev").addEventListener("click", () => {
  albumPage -= 1;
  renderAlbum();
});

$("album-next").addEventListener("click", () => {
  albumPage += 1;
  renderAlbum();
});

$("album-add").addEventListener("change", (event) => {
  Array.from(event.target.files || []).forEach((file) => {
    readCompressed(file, (data) => {
      albumPhotos.push(data);
      persistAlbum();
      renderAlbum();
    });
  });
  event.target.value = "";
});

$("album-replace").addEventListener("change", (event) => {
  const file = (event.target.files || [])[0];
  if (!file || replaceIndex < 0) return;
  readCompressed(file, (data) => {
    albumPhotos[replaceIndex] = data;
    replaceIndex = -1;
    persistAlbum();
    renderAlbum();
  });
  event.target.value = "";
});

/* ------------------------------------------------------------------
   磁带 / 文章 / 乐器声音
------------------------------------------------------------------- */
const objectSounds = {
  guitar: new Audio("./audio/guitar.m4a"),
  drums: new Audio("./audio/drums.mp3")
};

Object.values(objectSounds).forEach((audio) => {
  audio.preload = "none";
});

function toggleObjectSound(key) {
  Object.entries(objectSounds).forEach(([name, audio]) => {
    if (name !== key) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  const audio = objectSounds[key];
  if (!audio) return;

  if (audio.paused) {
    stopBg();
    audio.volume = 0.55;
    audio.play().catch(() => {});
    startNotes(key);
  } else {
    audio.pause();
    audio.currentTime = 0;
    stopNotes();
  }
}

let knightLine = 0;
let knightFinished = false;

function openKnight() {
  const lines = config.knightLines || [];
  if (!lines.length || knightFinished) return;

  if (knightLine < lines.length) {
    openBubble("knight", { title: "", body: lines[knightLine] });
    knightLine += 1;
    return;
  }

  openBubble("knight", { title: "", body: "……" });
  knightFinished = true;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function openTape() {
  closeBubble();
  tapeEl.classList.add("is-open");
  tapeEl.setAttribute("aria-hidden", "false");
}

function closeTape() {
  tapeAudio.pause();
  stopNotes();
  tapeEl.classList.remove("is-open", "is-playing");
  tapeEl.setAttribute("aria-hidden", "true");
}

function toggleTape() {
  if (tapeAudio.paused) {
    stopBg();
    tapeAudio.volume = 0.7;
    tapeAudio.play().then(() => {
      tapeEl.classList.add("is-playing");
      startNotes("letter");
    }).catch(() => {});
  } else {
    tapeAudio.pause();
    tapeEl.classList.remove("is-playing");
    stopNotes();
  }
}

tapePlay.addEventListener("click", toggleTape);
$("tape-close").addEventListener("click", closeTape);
$("tape-backdrop").addEventListener("click", closeTape);

tapeAudio.addEventListener("timeupdate", () => {
  const ratio = tapeAudio.duration ? tapeAudio.currentTime / tapeAudio.duration : 0;
  tapeProgress.style.width = `${Math.min(100, ratio * 100)}%`;
  tapeTime.textContent = formatTime(tapeAudio.currentTime);
});

tapeAudio.addEventListener("ended", () => {
  tapeEl.classList.remove("is-playing");
  tapeProgress.style.width = "0%";
  tapeTime.textContent = "00:00";
  tapeAudio.currentTime = 0;
});

function openArticle() {
  const data = config.article;
  if (!data) return;

  articleKicker.textContent = data.kicker || "";
  articleTitle.textContent = data.title || "";
  articleSub.textContent = data.subtitle || "";
  articleBody.innerHTML = "";

  (data.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    articleBody.appendChild(p);
  });

  closeBubble();
  articleEl.classList.add("is-open");
  articleEl.setAttribute("aria-hidden", "false");
}

function closeArticle() {
  articleEl.classList.remove("is-open");
  articleEl.setAttribute("aria-hidden", "true");
}

$("article-close").addEventListener("click", () => {
  closeArticle();
  world?.exitFocus();
});

$("article-backdrop").addEventListener("click", () => {
  closeArticle();
  world?.exitFocus();
});

/* ------------------------------------------------------------------
   淇★紙鏃х殑淇＄焊锛屼繚鐣欎絾涓嶅啀浣跨敤锛?------------------------------------------------------------------- */
function openLetter() {
  letterKicker.textContent = config.letter.kicker || "";
  letterTitle.textContent = config.letter.title || "";
  letterSign.textContent = config.letter.sign || "";

  letterBody.innerHTML = "";
  config.letter.paragraphs.forEach((text) => {
    if (!text) return;
    const p = document.createElement("p");
    p.textContent = text;
    letterBody.appendChild(p);
  });

  closeBubble();
  letterEl.classList.add("is-open");
  letterEl.setAttribute("aria-hidden", "false");
  hint.classList.add("is-dim");
}

function closeLetter() {
  letterEl.classList.remove("is-open");
  letterEl.setAttribute("aria-hidden", "true");
}

$("letter-close").addEventListener("click", () => {
  closeLetter();
  world?.exitFocus();
});
$("letter-backdrop").addEventListener("click", () => {
  closeLetter();
  world?.exitFocus();
});

/* ------------------------------------------------------------------
   锈湖环境音（用你给的曲子）
------------------------------------------------------------------- */
const rustyAudio = new Audio("./audio/rusty.mp3");
rustyAudio.loop = true;
rustyAudio.volume = 0.9;

const hollowAudio = new Audio("./audio/hollow.mp3");
hollowAudio.loop = true;
hollowAudio.volume = 0.5;

const silksongAudio = new Audio("./audio/silksong.mp3");
silksongAudio.loop = true;
silksongAudio.volume = 0.5;

const notesLayer = $("notes");
let noteTimer = 0;

function startNotes(key) {
  stopNotes();
  noteTimer = window.setInterval(() => {
    const rect = world?.getScreenRect?.(key);
    if (!rect) return;
    const width = rect.right - rect.left;
    const el = document.createElement("span");
    el.className = "note";
    el.textContent = Math.random() < 0.5 ? "♪" : "♫";
    el.style.left = `${rect.cx + (Math.random() - 0.5) * width * 0.7}px`;
    el.style.top = `${rect.top + Math.random() * 24}px`;
    notesLayer.appendChild(el);
    window.setTimeout(() => el.remove(), 2900);
  }, 520);
}

function stopNotes() {
  window.clearInterval(noteTimer);
  noteTimer = 0;
  notesLayer.innerHTML = "";
}

function stopWallpaperMusic() {
  hollowAudio.pause();
  silksongAudio.pause();
}

function stopBg() {
  rustyAudio.pause();
  hollowAudio.pause();
  silksongAudio.pause();
}

function stopAllAudio() {
  Object.values(objectSounds).forEach((audio) => audio.pause());
  tapeAudio.pause();
  stopNotes();
}

function startRustyAmbient() {
  stopBg();
  rustyAudio.currentTime = 0;
  rustyAudio.play().catch(() => {});
  startNotes("keyboard");
}

function stopRustyAmbient() {
  rustyAudio.pause();
}

/* ------------------------------------------------------------------
   显示器：壁纸轮播 / 键盘：锈湖生日
------------------------------------------------------------------- */
const wallpapers = [
  "./screen/wp1.jpg",
  "./screen/wp2.jpg",
  "./screen/wp3.jpg",
  "./screen/wp4.jpg"
].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const rustyImage = new Image();
rustyImage.src = "./screen/rusty.jpg";

let wallpaperIndex = -1;
let rustyTimer = 0;

function showOnScreen(img) {
  if (!world) return;
  if (img.complete && img.naturalWidth) world.setScreenImage(img);
  else img.addEventListener("load", () => world.setScreenImage(img), { once: true });
}

function showScreenHint() {
  const hintEl = $("screen-hint");
  const rect = world?.getScreenRect?.("monitor");
  if (rect) {
    hintEl.style.left = `${Math.min(rect.right + 10, window.innerWidth - 180)}px`;
    hintEl.style.top = `${rect.cy - 14}px`;
  }
  hintEl.classList.add("is-open");
  window.clearTimeout(showScreenHint.timer);
  showScreenHint.timer = window.setTimeout(() => hintEl.classList.remove("is-open"), 3200);
}

function pauseMonitorMusic() {
  stopBg();
  stopNotes();
  showScreenHint();
}

function showNextWallpaper() {
  wallpaperIndex = (wallpaperIndex + 1) % wallpapers.length;
  showOnScreen(wallpapers[wallpaperIndex]);

  if (hollowAudio.paused && silksongAudio.paused) {
    stopBg();
    const track = Math.random() < 0.5 ? hollowAudio : silksongAudio;
    track.currentTime = 0;
    track.play().catch(() => {});
    startNotes("monitor");
  }
}

function playRusty() {
  if (!world) return;
  window.clearTimeout(rustyTimer);
  world.screenBlack();
  rustyTimer = window.setTimeout(() => {
    showOnScreen(rustyImage);
    startRustyAmbient();
  }, 1500);
}

/* ------------------------------------------------------------------
   杩斿洖 / 閿洏
------------------------------------------------------------------- */
function goBack() {
  closeBubble();
  closeLetter();
  closeRecord();
  closeTape();
  closeArticle();
  closeCamera();
  closeAlbum();
  closeMovies();
  closeMapDraw();
  closeLibrary();
  closeReader();
  Object.values(objectSounds).forEach((audio) => audio.pause());
  world?.exitFocus();
}

backButton.addEventListener("click", goBack);

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (camEl.classList.contains("is-open")) {
    closeCamera();
    return;
  }
  if (albumEl.classList.contains("is-open")) {
    closeAlbum();
    return;
  }
  if (moviesEl.classList.contains("is-open")) {
    closeMovies();
    return;
  }
  if (mapdrawEl.classList.contains("is-open")) {
    closeMapDraw();
    return;
  }
  if (libraryEl.classList.contains("is-open")) {
    closeLibrary();
    return;
  }
  if (tapeEl.classList.contains("is-open")) {
    closeTape();
    return;
  }
  if (articleEl.classList.contains("is-open")) {
    closeArticle();
    world?.exitFocus();
    return;
  }
  if (recordEl.classList.contains("is-open")) {
    closeRecord();
    return;
  }
  if (letterEl.classList.contains("is-open")) {
    closeLetter();
    world?.exitFocus();
    return;
  }
  if (activeKey) {
    goBack();
  }
});
