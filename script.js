/* ------------------------------------------------------------------
   ADD PROJECTS HERE.
   Each name must match the files inside the PROJECTS folder:
     PROJECTS/<name>.html        the embed (loaded in the player)
     PROJECTS/<name>.instruction plain text shown under "Instructions"
     PROJECTS/<name>.png         the thumbnail
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
  "Squirrel Game"
];

 
const $ = id => document.getElementById(id);
const path = (n, ext) => "PROJECTS/" + encodeURIComponent(n) + "." + ext;
const grid = $("grid"), ambient = $("ambient");
 
function setAmbient(names) {
  ambient.innerHTML = "";
  ambient.classList.toggle("single", names.length === 1);
  names.forEach(n => {
    const i = new Image();
    i.src = path(n, "png");
    i.onerror = () => i.remove();
    ambient.appendChild(i);
  });
}
 
function renderGrid(filter = "") {
  grid.innerHTML = "";
  const list = ORDER.filter(n => n.toLowerCase().includes(filter.toLowerCase()));
  $("empty").hidden = list.length > 0;
  list.forEach(name => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = '<div class="thumb"><img alt=""><span class="play">Play</span></div><h3></h3>';
    card.querySelector("h3").textContent = name;
    const img = card.querySelector("img");
    img.src = path(name, "png");
    img.onerror = () => img.remove();
    card.onclick = () => { location.hash = "play=" + encodeURIComponent(name); };
    grid.appendChild(card);
  });
}
 
async function openProject(name) {
  $("home").hidden = true;
  $("player").hidden = false;
  $("p-title").textContent = name;
  document.title = name + " – Nizcade";
  setAmbient([name]);
  loadFrame(name);
 
  const inst = $("inst");
  inst.textContent = "Loading instructions …";
  try {
    const res = await fetch(path(name, "instruction"));
    if (!res.ok) throw 0;
    inst.textContent = (await res.text()).trim();
  } catch {
    inst.textContent = "No instructions for this project.";
  }
}
 
function loadFrame(name) {
  const f = $("frame");
  $("loader").hidden = false;
  f.onload = () => { $("loader").hidden = true; f.focus(); };
  f.src = "about:blank";
  setTimeout(() => { f.src = path(name, "html"); }, 30);
}
 
function closeProject() {
  $("frame").src = "about:blank";   // stops audio and the game
  $("player").hidden = true;
  $("home").hidden = false;
  document.title = "Nizcade";
  setAmbient(ORDER);
}
 
function route() {
  const m = location.hash.match(/^#play=(.+)$/);
  const name = m && decodeURIComponent(m[1]);
  if (name && PROJECTS.includes(name)) openProject(name);
  else closeProject();
}
 
$("search").oninput = e => renderGrid(e.target.value);
$("back").onclick = () => { location.hash = ""; };
$("home-link").onclick = e => { e.preventDefault(); location.hash = ""; };
$("reload").onclick = () => loadFrame(decodeURIComponent(location.hash.slice(6)));
$("full").onclick = () => {
  const s = $("stage");
  document.fullscreenElement ? document.exitFullscreen() : s.requestFullscreen();
};
$("unfull").onclick = () => document.exitFullscreen();
document.addEventListener("fullscreenchange", () => {
  const on = !!document.fullscreenElement;
  $("unfull").hidden = !on;
  $("full").textContent = on ? "Exit fullscreen" : "Fullscreen";
  if (!on) $("frame").focus();
});
window.onhashchange = route;
 
renderGrid();
route();
 