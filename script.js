// ============ 数据 ============
const tracks = [
  { title: "Concierto de Aranjuez", artist: "Chet Baker, Paul Desmond", audio: "Chet Baker,Paul Desmond - Concierto de Aranjuez.mp3" },
  { title: "1992 / Lord Knows", artist: "GALI", audio: "GALI - 1992  Lord Knows.mp3" },
  { title: "Street Lights", artist: "Kanye West", audio: "Kanye West - Street Lights.mp3" },
  { title: "m.A.A.d city", artist: "Kendrick Lamar, MC Eiht", audio: "Kendrick Lamar,MC Eiht - m.A.A.d city.mp3" },
  { title: "Venice Bitch", artist: "Lana Del Rey", audio: "Lana Del Rey - Venice Bh.mp3" },
  { title: "SWEET / I THOUGHT YOU WANTED TO DANCE", artist: "Tyler, The Creator, Brent Faiyaz, Fana Hues", audio: "Tyler, The Creator,Brent Faiyaz,Fana Hues - SWEET  I THOUGHT YOU WANTED TO DANCE.mp3" },
  { title: "FRAGILE", artist: "山下達郎", audio: "山下達郎 - FRAGILE.mp3" },
  { title: "工厂", artist: "张方钊", audio: "张方钊 - 工厂.mp3" },
  { title: "少年维持着烦恼", artist: "蛋堡", audio: "蛋堡 - 少年维持着烦恼.mp3" },
  { title: "未来浮云朝露", artist: "马赫mood", audio: "马赫mood - 未来浮云朝露.mp3" },
  { title: "Touch", artist: "Daft Punk, Paul Williams", audio: "Daft Punk,Paul Williams - Touch.mp3" },
  { title: "DAYDREAM", artist: "Fishmans", audio: "Fishmans - DAYDREAM.mp3" },
  { title: "Pyramids (Album Version)", artist: "Frank Ocean", audio: "Frank Ocean - Pyramids (Album Version).mp3" },
  { title: "4 Your Eyez Only", artist: "J. Cole", audio: "J. Cole - 4 Your Eyez Only.mp3" },
  { title: "采石", artist: "万能青年旅店", audio: "万能青年旅店 - 采石.flac" },
  { title: "模糊的脸", artist: "烧提碎", audio: "烧提碎 - 模糊的脸.mp3" },
  { title: "Never See Me Again", artist: "Kanye West", audio: "TheFloridaMan,GOAT - Never see me again（Explicit）.mp3" },
];

const works = [
  {
    mark: "01",
    title: "深夜频率",
    desc: "一张关于失眠的迷你专辑，用合成器和环境录音拼贴出来的城市夜景。",
    tags: ["EP", "Ambient", "2024"],
    cover: "linear-gradient(135deg, #e8e8e8, #ffffff)",
  },
  {
    mark: "02",
    title: " cassette diary ",
    desc: "把日常琐碎录进卡带再循环播放，每一面都是某一天的某一种心情。",
    tags: ["Demo", "Lo-fi", "2024"],
    cover: "linear-gradient(135deg, #ffffff, #dadada)",
  },
  {
    mark: "03",
    title: "雨声演习",
    desc: "用鼓机模拟一场不会停的雨，配上一段走神的钢琴。",
    tags: ["Single", "Piano", "2023"],
    cover: "linear-gradient(135deg, #c8c8c8, #f0f0f0)",
  },
  {
    mark: "04",
    title: "beats for nobody",
    desc: "一组写给空气的 beat，没人听也无所谓，它们就在那儿响着。",
    tags: ["Beat Pack", "Instrumental", "2023"],
    cover: "linear-gradient(135deg, #f0f0f0, #d0d0d0)",
  },
  {
    mark: "05",
    title: "凌晨四点的合成器",
    desc: "一个通宵的实验记录，从干净到噪，从清醒到迷糊。",
    tags: ["Experimental", "Synth", "2023"],
    cover: "linear-gradient(135deg, #e0e0e0, #ffffff)",
  },
  {
    mark: "06",
    title: "回家路上",
    desc: "为一段十分钟的步行做的配乐，节奏和脚步差不多快。",
    tags: ["Soundtrack", "Ambient", "2022"],
    cover: "linear-gradient(135deg, #ffffff, #c0c0c0)",
  },
];

// ============ 渲染：音乐推荐 ============
const trackList = document.getElementById("trackList");
const player = document.getElementById("player");
const playerPlay = document.getElementById("playerPlay");
const npTitle = document.getElementById("npTitle");
const timeCur = document.getElementById("timeCur");
const timeTotal = document.getElementById("timeTotal");
const progressWrap = document.getElementById("progressWrap");
const progressFill = document.getElementById("progressFill");
const progressThumb = document.getElementById("progressThumb");

let currentTrack = null;
let audioPlayer = null;
let currentTrackData = null;
let isDragging = false;
let wasPlayingBeforeDrag = false;
let ignoreTrackClick = false;
let seekTimeout = null;
let currentPct = 0;

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function updateProgressUI(pct) {
  currentPct = Math.max(0, Math.min(1, pct));
  progressFill.style.width = `${currentPct * 100}%`;
  progressThumb.style.left = `${currentPct * 100}%`;
  if (audioPlayer && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
    timeCur.textContent = formatTime(currentPct * audioPlayer.duration);
  }
}

function updateProgress() {
  if (!audioPlayer || isDragging) return;
  if (isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
    const pct = audioPlayer.currentTime / audioPlayer.duration;
    updateProgressUI(pct);
  }
}

function setProgressFromEvent(e) {
  const rect = progressWrap.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const pct = rect.width > 0 ? x / rect.width : 0;
  updateProgressUI(pct);
  if (audioPlayer && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
    const newTime = pct * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
  }
}

function renderTracks() {
  trackList.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.innerHTML = `
      <span class="track-index">${String(i + 1).padStart(2, "0")}</span>
      <div class="track-info">
        <div class="track-title">${t.title}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
      <button class="track-play">▶</button>
    `;
    li.addEventListener("click", () => playTrack(li, t));
    trackList.appendChild(li);
  });
}

function loadTrack(track) {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.removeEventListener("timeupdate", updateProgress);
    audioPlayer.removeEventListener("ended", onEnded);
    audioPlayer.removeEventListener("loadedmetadata", onLoadedMetadata);
    audioPlayer.removeEventListener("durationchange", onLoadedMetadata);
  }
  audioPlayer = new Audio(`music/${track.audio}`);
  audioPlayer.preload = "auto";
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", onEnded);
  audioPlayer.addEventListener("loadedmetadata", onLoadedMetadata);
  audioPlayer.addEventListener("durationchange", onLoadedMetadata);
  currentPct = 0;
  updateProgressUI(0);
}

function onLoadedMetadata() {
  if (!audioPlayer) return;
  timeTotal.textContent = formatTime(audioPlayer.duration);
  updateProgress();
}

function onEnded() {
  if (currentTrack) currentTrack.classList.remove("playing");
  player.classList.remove("playing");
  playerPlay.textContent = "▶";
  npTitle.textContent = "— nothing —";
  currentPct = 0;
  updateProgressUI(0);
  currentTrack = null;
  currentTrackData = null;
}

function togglePlay() {
  if (!audioPlayer) return;
  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
    player.classList.add("playing");
    if (currentTrack) currentTrack.classList.add("playing");
    playerPlay.textContent = "⏸";
  } else {
    audioPlayer.pause();
    player.classList.remove("playing");
    if (currentTrack) currentTrack.classList.remove("playing");
    playerPlay.textContent = "▶";
  }
}

function playTrack(el, track) {
  if (ignoreTrackClick) {
    ignoreTrackClick = false;
    return;
  }

  const isSameTrack = currentTrackData && currentTrackData.audio === track.audio;
  if (isSameTrack) {
    togglePlay();
    return;
  }

  if (currentTrack && currentTrack !== el) currentTrack.classList.remove("playing");
  currentTrack = el;
  currentTrackData = track;
  el.classList.add("playing");

  npTitle.textContent = `${track.title} — ${track.artist}`;
  loadTrack(track);
  audioPlayer.play().catch(() => {});
  player.classList.add("playing");
  playerPlay.textContent = "⏸";
}

playerPlay.addEventListener("click", togglePlay);

progressWrap.addEventListener("mousedown", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging = true;
  progressWrap.classList.add("dragging");
  wasPlayingBeforeDrag = audioPlayer && !audioPlayer.paused;
  setProgressFromEvent(e);
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  setProgressFromEvent(e);
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  progressWrap.classList.remove("dragging");
  ignoreTrackClick = true;
  setTimeout(() => { ignoreTrackClick = false; }, 50);
});

progressWrap.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging = true;
  progressWrap.classList.add("dragging");
  wasPlayingBeforeDrag = audioPlayer && !audioPlayer.paused;
  setProgressFromEvent(e.touches[0]);
}, { passive: false });

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  setProgressFromEvent(e.touches[0]);
}, { passive: false });

document.addEventListener("touchend", () => {
  if (!isDragging) return;
  isDragging = false;
  progressWrap.classList.remove("dragging");
  ignoreTrackClick = true;
  setTimeout(() => { ignoreTrackClick = false; }, 50);
});

// ============ 渲染：专辑列表 ============
const albumsGrid = document.getElementById("albumsGrid");

const albums = [
  {
    title: "亚特兰蒂斯",
    cover: "albums/atlantis/亚特兰蒂斯.png",
    folder: "atlantis",
    desc: "Loop By Trick<br>Vocal/Tag By 白",
    tracks: [
      { title: "亚特兰蒂斯", file: "亚特兰蒂斯.mp3" },
    ],
  },
  {
    title: "半年后的我",
    cover: "albums/halfyear/Mimikyu.jpg",
    folder: "halfyear",
    desc: "26年7月至10月期间，我做了什么？",
    tracks: [
      { title: "PainMelody_Memphis", file: "PainMelody_Memphis.mp3" },
      { title: "Roll it", file: "Roll it.mp3" },
      { title: "2000s SWAG in Church", file: "2000s SWAG in Church.mp3" },
      { title: "FIJI REMIX", file: "FIJI REMIX.mp3" },
      { title: "0908_Drill_PRACT", file: "0908_Drill_PRACT.mp3" },
      { title: "newjazz_swagshiii", file: "newjazz_swagshiii.mp3" },
      { title: "CUT", file: "CUT.mp3" },
    ],
  },
  {
    title: "Samurai？",
    cover: "albums/samurai/Samurai.png",
    folder: "samurai",
    desc: "我偏爱的，误打误撞的，Nujabes Type？",
    tracks: [
      { title: "Samurai？", file: "Y4M - Samurai？.mp3" },
    ],
  },
  {
    title: "1 STEP PRACTICE",
    cover: "albums/1step/1 Step.png",
    folder: "1step",
    desc: "这张记录了我从26年4月开始自学beat制作至6月间的一些垃圾，一些不舍抛弃的记忆",
    tracks: [
      { title: "A", file: "Y4M - A.mp3" },
      { title: "B", file: "Y4M - B.mp3" },
      { title: "C", file: "Y4M - C.mp3" },
      { title: "D", file: "Y4M - D.mp3" },
      { title: "E", file: "Y4M - E.mp3" },
      { title: "F", file: "Y4M - F.mp3" },
      { title: "G", file: "Y4M - G.mp3" },
    ],
  },
  {
    title: "Rain,Shanghai",
    cover: "albums/rain/RSHCOVER.jpg",
    folder: "rain",
    desc: "上海一直在下雨",
    tracks: [
      { title: "Rain,Shanghai", file: "Rain,Shanghai.mp3" },
    ],
  },
];

let currentAlbumTrack = null;

function renderAlbums() {
  albumsGrid.innerHTML = "";
  albums.forEach((album, albumIdx) => {
    const card = document.createElement("div");
    card.className = "album-card";

    const tracksHtml = album.tracks
      .map(
        (t, i) => `
      <div class="album-track" data-album="${albumIdx}" data-track="${i}">
        <span class="at-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="at-title">${t.title}</span>
        <button class="at-play">▶</button>
      </div>
    `
      )
      .join("");

    card.innerHTML = `
      <div class="album-cover">
        <img src="${album.cover}" alt="${album.title}" />
        <div class="album-expand-icon">≡</div>
      </div>
      <div class="album-info">
        <div class="album-title">${album.title}</div>
        <div class="album-meta">${album.tracks.length} TRACKS</div>
      </div>
      <div class="album-tracks">
        <div class="album-desc">${album.desc}</div>
        <div class="album-track-list">${tracksHtml}</div>
      </div>
    `;

    const cover = card.querySelector(".album-cover");
    cover.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    card.querySelectorAll(".album-track").forEach((trackEl) => {
      trackEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const trackIdx = parseInt(trackEl.dataset.track);
        const track = album.tracks[trackIdx];
        playAlbumTrack(trackEl, album, track);
      });
    });

    albumsGrid.appendChild(card);
  });
}

function playAlbumTrack(el, album, track) {
  const audioSrc = `albums/${album.folder}/${track.file}`;

  if (currentAlbumTrack && currentAlbumTrack !== el) {
    currentAlbumTrack.classList.remove("playing");
  }
  currentAlbumTrack = el;

  const sameAsCurrent =
    audioPlayer && audioPlayer.src.endsWith(track.file);

  if (sameAsCurrent && !audioPlayer.paused) {
    audioPlayer.pause();
    el.classList.remove("playing");
    player.classList.remove("playing");
    playerPlay.textContent = "▶";
    return;
  }

  if (sameAsCurrent && audioPlayer.paused) {
    audioPlayer.play().catch(() => {});
    el.classList.add("playing");
    player.classList.add("playing");
    playerPlay.textContent = "⏸";
    return;
  }

  loadTrackForAlbum(audioSrc);
  audioPlayer.play().catch(() => {});
  el.classList.add("playing");
  player.classList.add("playing");
  playerPlay.textContent = "⏸";
  npTitle.textContent = `${track.title} — ${album.title}`;
}

function loadTrackForAlbum(src) {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.removeEventListener("timeupdate", updateProgress);
    audioPlayer.removeEventListener("ended", onAlbumEnded);
    audioPlayer.removeEventListener("loadedmetadata", onLoadedMetadata);
    audioPlayer.removeEventListener("durationchange", onLoadedMetadata);
  }
  audioPlayer = new Audio(src);
  audioPlayer.preload = "auto";
  audioPlayer.addEventListener("timeupdate", updateProgress);
  audioPlayer.addEventListener("ended", onAlbumEnded);
  audioPlayer.addEventListener("loadedmetadata", onLoadedMetadata);
  audioPlayer.addEventListener("durationchange", onLoadedMetadata);
  currentPct = 0;
  updateProgressUI(0);
}

function onAlbumEnded() {
  if (currentAlbumTrack) currentAlbumTrack.classList.remove("playing");
  player.classList.remove("playing");
  playerPlay.textContent = "▶";
  npTitle.textContent = "— nothing —";
  currentPct = 0;
  updateProgressUI(0);
  currentAlbumTrack = null;
  if (currentTrack) {
    currentTrack.classList.remove("playing");
    currentTrack = null;
  }
}

// ============ 导航切换 ============
const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".panel");
const content = document.querySelector(".content");

function switchTo(target) {
  navItems.forEach((n) => n.classList.toggle("active", n.dataset.target === target));
  panels.forEach((p) => {
    const isTarget = p.id === target;
    p.classList.toggle("active", isTarget);
    if (isTarget) {
      // 重置动画
      p.style.animation = "none";
      void p.offsetWidth;
      p.style.animation = "";
    }
  });
  // 切换面板时滚回顶部，但保持底部 findme 在当前面板之下
  content.scrollTop = 0;
}

navItems.forEach((item) => {
  item.addEventListener("click", () => switchTo(item.dataset.target));
});

// ============ Reveal 鼠标透视 ============
const revealContainer = document.querySelector(".reveal-container");
const revealTop = document.getElementById("revealTop");

if (revealContainer && revealTop) {
  const REVEAL_RADIUS = 84;
  const MASK_GRADIENT = "transparent 55%, rgba(0,0,0,0.4) 75%, black 100%";

  revealContainer.addEventListener("mousemove", (e) => {
    const rect = revealContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mask = `radial-gradient(circle ${REVEAL_RADIUS}px at ${x}px ${y}px, ${MASK_GRADIENT})`;
    revealTop.style.webkitMaskImage = mask;
    revealTop.style.maskImage = mask;
  });

  revealContainer.addEventListener("mouseleave", () => {
    const mask = `radial-gradient(circle ${REVEAL_RADIUS}px at -200px -200px, ${MASK_GRADIENT})`;
    revealTop.style.webkitMaskImage = mask;
    revealTop.style.maskImage = mask;
  });
}

// ============ WeChat 复制 ============
const wechatChip = document.getElementById("wechatChip");
wechatChip.addEventListener("click", async () => {
  const id = wechatChip.dataset.wechat;
  const hint = wechatChip.querySelector(".cc-hint");
  try {
    await navigator.clipboard.writeText(id);
  } catch {
    // 降级方案
    const ta = document.createElement("textarea");
    ta.value = id;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  const old = hint.textContent;
  hint.textContent = "已复制 ✓";
  wechatChip.classList.add("copied");
  setTimeout(() => {
    hint.textContent = old;
  wechatChip.classList.remove("copied");
}, 1600);
});

// ============ Splash 启动页 ============
const splash = document.getElementById("splash");
let splashHidden = false;

function hideSplash() {
  if (splashHidden) return;
  splashHidden = true;
  splash.classList.add("hidden");
}

splash.addEventListener("click", hideSplash);
setTimeout(hideSplash, 3000);

// ============ 初始化 ============
renderTracks();
renderAlbums();
document.getElementById("year").textContent = new Date().getFullYear();
