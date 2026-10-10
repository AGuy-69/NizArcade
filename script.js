/* ------------------------------------------------------------------
   ADD PROJECTS HERE.
   Each name must match the files inside the PROJECTS folder:
     PROJECTS/<name>/index.html   the game folder (index.html plus its assets)
     PROJECTS/<name>.instruction  plain text shown under "Instructions"
     PROJECTS/<name>.png          the thumbnail
   Browsers can't list folders, so this array is the project list.
------------------------------------------------------------------- */
const PROJECTS = [
  "Bunny jump",
  "Advanced Engine Sim",
  "Submarine",
  "Asteroid shooter",
  "Protect the underwater",
  "Recycle Trash",
  "Game buang sampah wlee",
  "Trash Tycoon",
  "GreenSkyline",
  "Car Engine",
  "Fih",
  "Boating",
  "Dropper",
  "Stones n Boat",
  "cepatmakan",
  "Unicorn Rainbow Run Bottles Edition",
  "Bad Red",
  "Squirrel Game",
  "Birdy",
  "Squirell Fashion"
];

const $ = id => document.getElementById(id);
// html -> PROJECTS/<name>/index.html (game folder); png and instruction -> PROJECTS/<name>.<ext>
const path = (n, ext) => ext === "html"
  ? "PROJECTS/" + encodeURIComponent(n) + "/index.html"
  : "PROJECTS/" + encodeURIComponent(n) + "." + ext;
const grid = $("grid"), ambient = $("ambient");
let currentName = "";

const go = name => { hideResults(); location.hash = "play=" + encodeURIComponent(name); };
const random = () => PROJECTS[Math.floor(Math.random() * PROJECTS.length)];

/* blurred artwork behind the page: the glass has something colourful to refract */
function setAmbient(names) {
  ambient.innerHTML = "";
  ambient.classList.toggle("single", names.length === 1);
  names.forEach(n => {
    const i = new Image();
    i.alt = "";
    i.decoding = "async";
    i.src = path(n, "png");
    i.onerror = () => i.remove();
    ambient.appendChild(i);
  });
}

const AMBIENT = [...PROJECTS].sort(() => Math.random() - 0.5).slice(0, 8);   // a few images are plenty once blurred

/* a colour for each tile, taken from its artwork (falls back to one made from the name) */
function nameColor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 70% 62%)`;
}

function tint(img, card, name) {
  card.style.setProperty("--c", nameColor(name));
  const apply = () => {
    try {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 12;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, 12, 12);
      const d = cx.getImageData(0, 0, 12, 12).data;
      let r = 0, g = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) {
        const wt = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) + 8;   // favour colourful pixels
        r += d[i] * wt; g += d[i + 1] * wt; b += d[i + 2] * wt; w += wt;
      }
      r /= w * 255; g /= w * 255; b /= w * 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      let h = 0;
      if (dl) h = mx === r ? ((g - b) / dl) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
      h = Math.round(((h * 60) + 360) % 360);
      card.style.setProperty("--c", `hsl(${h} 72% 62%)`);
    } catch { /* image blocked (e.g. opened from a file): keep the name colour */ }
  };
  if (img.complete && img.naturalWidth) apply();
  else img.addEventListener("load", apply, { once: true });
}

function makeCard(name) {
  const card = document.createElement("button");
  card.className = "card";
  card.innerHTML = '<div class="thumb"><span class="initial"></span><img alt="" loading="lazy" decoding="async"></div><h3></h3>';
  card.querySelector("h3").textContent = name;
  card.querySelector(".initial").textContent = name.trim().charAt(0).toUpperCase();
  const img = card.querySelector("img");
  img.src = path(name, "png");
  img.onerror = () => img.remove();   // falls back to the coloured initial
  tint(img, card, name);
  card.onclick = () => go(name);
  return card;
}

/* the cat guide */
const GREETING = "Hi! Pick a game, any game.";
const CAT_LINES = ["Meow! Pick one!", "I like them all.", "Psst… try Surprise me!", GREETING];
const say = text => { $("bubble").textContent = text; };
function hop() {
  const cat = $("cat");
  cat.classList.remove("hop");
  void cat.offsetWidth;
  cat.classList.add("hop");
}

/* spotlight hero: search, suggestions, surprise me */
const search = $("search"), results = $("results");
let matches = [], active = 0;

function hideResults() {
  results.hidden = true;
  search.setAttribute("aria-expanded", "false");
}

function renderResults() {
  const q = search.value.trim().toLowerCase();
  matches = q ? PROJECTS.filter(n => n.toLowerCase().includes(q)).slice(0, 5) : [];
  active = Math.min(active, Math.max(matches.length - 1, 0));
  results.innerHTML = "";
  if (!matches.length) return hideResults();
  matches.forEach((name, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    const b = document.createElement("button");
    b.className = "result" + (i === active ? " on" : "");
    b.tabIndex = -1;
    b.innerHTML = '<span class="rthumb"><img alt=""></span><span class="rname"></span><span class="rgo">Play</span>';
    b.querySelector(".rname").textContent = name;
    const im = b.querySelector("img");
    im.src = path(name, "png");
    im.onerror = () => im.remove();
    b.onmousedown = e => { e.preventDefault(); go(name); };   // before the input loses focus
    li.appendChild(b);
    results.appendChild(li);
  });
  results.hidden = false;
  search.setAttribute("aria-expanded", "true");
}

function setupSpot() {
  [...PROJECTS].sort(() => Math.random() - 0.5).slice(0, 4).forEach(n => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = n;
    b.onclick = () => go(n);
    b.onmouseenter = b.onfocus = () => say(`Try ${n}!`);
    b.onmouseleave = b.onblur = () => say(search.value.trim() ? $("bubble").textContent : GREETING);
    $("chips").appendChild(b);
  });
  $("bar-search").onclick = () => {
    if (!$("player").hidden) location.hash = "";
    scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => search.focus({ preventScroll: true }), 300);
  };
  $("surprise").onclick = () => { hop(); say("Ooh, a surprise!"); setTimeout(() => go(random()), 450); };
  const catImg = $("cat").querySelector("img");
  catImg.onerror = () => { $("guide").hidden = true; };
  $("cat").onclick = () => { hop(); say(CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)]); };
  search.oninput = () => {
    active = 0; renderGrid(search.value); renderResults();
    const q = search.value.trim().toLowerCase(), n = PROJECTS.filter(p => p.toLowerCase().includes(q)).length;
    say(!q ? GREETING : n === 0 ? "Hmm, I can't find that one." : n === 1 ? "Found it! Press Enter." : `${n} games match. Nice!`);
  };
  search.onfocus = renderResults;
  search.onblur = hideResults;
  search.onkeydown = e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!matches.length) return;
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      renderResults();
    } else if (e.key === "Enter" && matches.length) {
      go(matches[active]);
    } else if (e.key === "Escape") {
      search.value = ""; renderGrid(""); hideResults();
    }
  };
}

const cards = new Map();   // built once, then shown/hidden: no re-created images or re-computed colours while typing
function renderGrid(filter = "") {
  const q = filter.trim().toLowerCase();
  if (!cards.size) PROJECTS.forEach(n => { const c = makeCard(n); cards.set(n, c); grid.appendChild(c); });
  let shown = 0;
  cards.forEach((c, n) => { const ok = n.toLowerCase().includes(q); c.hidden = !ok; if (ok) shown++; });
  $("empty").hidden = shown > 0;
  $("count").textContent = q ? `${shown} of ${PROJECTS.length}` : `${PROJECTS.length} games`;
}

/* the plot twist: lines appear one by one when scrolled into view */
function setupTwist() {
  const lines = [...document.querySelectorAll(".twist .t")];
  const show = () => lines.forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 1100 + (i > 0 ? 400 : 0)));
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion:reduce)").matches) {
    lines.forEach(el => el.classList.add("on"));
    return;
  }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); show(); }
  }, { threshold: 0.5 });
  io.observe($("twist"));
}

async function openProject(name) {
  currentName = name;
  if (!$("home").hidden) homeScroll = scrollY;
  $("home").hidden = true;
  $("player").hidden = false;
  document.body.classList.add("playing");
  $("p-title").textContent = name;
  document.title = name + " – Nizcade";
  setAmbient([name]);
  window.scrollTo({ top: 0, behavior: "instant" });
  loadFrame(name);

  const inst = $("inst");
  inst.textContent = "Loading…";
  try {
    const res = await fetch(path(name, "instruction"));
    if (!res.ok) throw new Error(res.status);
    const text = (await res.text()).trim();
    if (currentName === name) inst.textContent = text || "No instructions for this game.";
  } catch {
    if (currentName === name) inst.textContent = "No instructions for this game.";
  }
}

// Set to false to skip the download-progress step and load the game straight into the frame.
const TRACK_PROGRESS = false;   // games are now folders with separate assets, so the game shows its own progress bar
let loadId = 0, loadCtrl, homeScroll = 0;

function setProgress(pct, label) {
  const track = $("load-track");
  track.classList.toggle("indet", pct == null);
  if (pct == null) track.removeAttribute("aria-valuenow");
  else { $("load-fill").style.width = pct + "%"; track.setAttribute("aria-valuenow", Math.round(pct)); }
  $("load-label").textContent = label;
  $("load-pct").textContent = pct == null ? "" : Math.round(pct) + "%";
}

/* Downloads the game with a real progress bar, then starts it from the browser cache. */
async function loadFrame(name) {
  const id = ++loadId, f = $("frame"), url = path(name, "html");
  if (loadCtrl) loadCtrl.abort();
  loadCtrl = new AbortController();
  $("loader").hidden = false;
  $("loader").classList.remove("err");
  $("load-fill").style.width = "0%";
  setProgress(TRACK_PROGRESS ? 0 : null, TRACK_PROGRESS ? "Downloading" : "Loading");
  try {   // friendly message if the folder name or path is wrong
    const head = await fetch(url, { method: "HEAD", signal: loadCtrl.signal });
    if (!head.ok && head.status !== 405) {
      if (id === loadId) {
        $("loader").classList.add("err");
        $("load-label").textContent = `Couldn't find this game. Check that PROJECTS/${name}/index.html exists.`;
      }
      return;
    }
  } catch (e) { if (e.name === "AbortError") return; }
  if (id !== loadId) return;
  f.onload = null;
  f.src = "about:blank";

  if (TRACK_PROGRESS) try {
    const res = await fetch(url, { signal: loadCtrl.signal });
    if (!res.ok) throw new Error(res.status);
    const total = +res.headers.get("Content-Length") || 0;
    const reader = res.body.getReader();
    let got = 0;
    if (!total) setProgress(null, "Downloading");
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (id !== loadId) return;
      got += value.length;
      if (total && got <= total) setProgress(got / total * 100, "Downloading");
      else setProgress(null, "Downloading");   // size unknown (e.g. compressed)
    }
  } catch (e) {
    if (e.name === "AbortError" || id !== loadId) return;
    // download tracking failed: just let the frame load the game itself
  }
  if (id !== loadId) return;

  await new Promise(r => setTimeout(r, 30));   // same short pause the original version used
  if (id !== loadId) return;
  setProgress(null, "Loading");
  f.onload = () => {
    try { if (f.contentWindow.location.href === "about:blank") return; } catch {}
    if (id !== loadId) return;
    $("loader").hidden = true;
    f.focus();
  };
  f.src = url;
}

function closeProject() {
  loadId++;
  if (loadCtrl) loadCtrl.abort();
  currentName = "";
  $("frame").src = "about:blank";   // stops audio and the game
  $("player").hidden = true;
  $("home").hidden = false;
  document.body.classList.remove("playing");
  scrollTo({ top: homeScroll, behavior: "instant" });   // back to where you were in the list
  document.title = "Nizcade";
  setAmbient(AMBIENT);
}

function route() {
  const m = location.hash.match(/^#play=(.+)$/);
  const name = m && decodeURIComponent(m[1]);
  if (name && PROJECTS.includes(name)) openProject(name);
  else closeProject();
}

const restart = () => currentName && loadFrame(currentName);

$("back").onclick = () => { location.hash = ""; };
$("home-link").onclick = e => { e.preventDefault(); location.hash = ""; };
$("reload").onclick = restart;
$("reload-fs").onclick = restart;
$("full").onclick = () => {
  document.fullscreenElement ? document.exitFullscreen() : $("stage").requestFullscreen();
};
$("unfull").onclick = () => document.exitFullscreen();
document.addEventListener("fullscreenchange", () => {
  const on = !!document.fullscreenElement;
  $("fs-tools").hidden = !on;
    if (!on) $("frame").focus();
});
window.onhashchange = route;

setupSpot();
renderGrid();
setupTwist();
route();

/* backdrop effects: one frame-throttled pointer handler; variables live on #fx so the page isn't restyled on every move */
const fx = $("fx"), cat = $("cat");
let px = 0, py = 0, pq = false;
document.addEventListener("pointermove", e => {
  px = e.clientX; py = e.clientY;
  if (pq) return;
  pq = true;
  requestAnimationFrame(() => {
    pq = false;
    fx.style.setProperty("--mx", px + "px");
    fx.style.setProperty("--my", py + "px");
    fx.classList.add("lit");
    if (!$("home").hidden && !$("guide").hidden && scrollY < innerHeight) {
      const r = cat.getBoundingClientRect();
      const tilt = Math.max(-10, Math.min(10, (px - (r.left + r.width / 2)) / innerWidth * 30));
      cat.style.setProperty("--tilt", tilt.toFixed(1) + "deg");
    }
  });
}, { passive: true });
document.addEventListener("pointerleave", () => fx.classList.remove("lit"));

/* the resting pattern fades out as you scroll down and returns as you scroll up */
let fq = false;
const updateFade = () => { fq = false; fx.style.setProperty("--fade", Math.max(0, 1 - scrollY / (innerHeight * 0.6)).toFixed(3)); };
addEventListener("scroll", () => { if (!fq) { fq = true; requestAnimationFrame(updateFade); } }, { passive: true });
updateFade();

/* Esc goes back from a game (when focus is on the page, not inside the game) */
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("player").hidden && !document.fullscreenElement) location.hash = "";
});