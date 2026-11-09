/* ==========================================================================
   script.js
   1) Loading screen   2) Page logic (data, cards, filters, logos, scrolling)
   ========================================================================== */

/* ------------------------------------------------------------------
   Loading screen logic
   - Shows a progress ring and rotating funny messages
   - Stays for at least 4s, never longer than 9s
   - Finishes once the main script sets window.__ready = true
   ------------------------------------------------------------------ */
(function () {
  const loader  = document.getElementById("ld");
  const arc     = document.getElementById("arc");
  const percent = document.getElementById("pc");
  const quote   = document.getElementById("qt");

  const QUOTES = [
    "Convincing the cloud to wake up…",
    "Counting badges twice, just to be sure…",
    "Asking Gemini to hurry up (it said no)…",
    "Closing 47 browser tabs…",
    "Brewing chai for the servers…",
    "Redeeming access codes… yours too 👀",
    "Teaching the spreadsheet to behave…",
    "Almost there, pinky promise 🤞"
  ];

  // Shuffle the quotes (Fisher-Yates)
  for (let i = QUOTES.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [QUOTES[i], QUOTES[j]] = [QUOTES[j], QUOTES[i]];
  }

  // Rotate the quote every 1.3s with a short fade
  let quoteIndex = 0;
  quote.textContent = QUOTES[0];
  setInterval(() => {
    quote.classList.add("f");
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % QUOTES.length;
      quote.textContent = QUOTES[quoteIndex];
      quote.classList.remove("f");
    }, 350);
  }, 1300);

  // Progress ring
  const CIRCUMFERENCE = 2 * Math.PI * 72;
  const MIN_MS = 4000;   // minimum time on screen
  const MAX_MS = 9000;   // give up waiting after this long
  const startTime = performance.now();
  let shown = 0;         // percentage currently drawn
  let finished = false;

  arc.style.strokeDasharray = CIRCUMFERENCE;

  function tick(now) {
    const elapsed = now - startTime;
    const ready = window.__ready === true;

    // Climb to 96% while waiting; jump to 100% once data is ready
    const target = (ready && elapsed >= MIN_MS)
      ? 100
      : Math.min(elapsed / MIN_MS, 1) * 96;

    shown += (target - shown) * 0.12;                  // ease towards target
    if (target === 100 && shown > 99.4) shown = 100;

    arc.style.strokeDashoffset = CIRCUMFERENCE * (1 - shown / 100);
    percent.textContent = Math.round(shown) + "%";

    if (shown >= 100 || elapsed > MAX_MS) {
      if (!finished) {
        finished = true;
        setTimeout(() => {
          loader.classList.add("out");
          document.body.classList.remove("loading");
          setTimeout(() => loader.remove(), 800);
        }, 250);
      }
      return;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ==========================================================================
   SETTINGS
   ========================================================================== */

// Live data: a Google Apps Script URL that returns
// { status: "success", data: [ ...participants ], updated: "date text" }.
const API_URL = "https://script.google.com/macros/s/AKfycbx4mPoVFCLahR6pi6PkOuDYu-opOf04kjMU4L0Zk8USuQF1_qIR69FnqEsL61fKGTPa/exec";
const TIMEOUT_MS = 8000;

// Image used for the floating Google Cloud logos
const CLOUD_LOGO = "google-cloud.png";

// Filter buttons: [key, label]
const FILTERS = [
  ["all",    "All"],
  ["gear",   "GEAR badge"],
  ["nogear", "No GEAR badge"],
  ["red",    "Code redeemed"],
  ["pend",   "Code pending"]
];

// What each filter keeps
const FILTER_TESTS = {
  all:    ()  => true,
  gear:   (p) => p.gear,
  nogear: (p) => !p.gear,
  red:    (p) => p.r,
  pend:   (p) => !p.r
};


/* ==========================================================================
   PARTICIPANT DATA (Empty Initial State)
   ========================================================================== */
let PARTICIPANTS = [];


/* ==========================================================================
   STATE
   ========================================================================== */
let activeFilter = "all";
let searchTerm   = "";
let sortMode     = "name";


/* ==========================================================================
   HELPERS
   ========================================================================== */
const $ = (selector) => document.querySelector(selector);

// Escape text before putting it into HTML
const escapeHTML = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));

// "Abhinav Singh" -> "AS"
const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// Stable colour per name (0-359)
const hueFromName = (name) =>
  [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;

const percentOf = (value, total) => (total ? Math.round((value / total) * 100) : 0);


/* ==========================================================================
   RENDER: STAT CHIPS + FILTER BUTTONS
   ========================================================================== */
function renderStats() {
  const total       = PARTICIPANTS.length;
  const withGear    = PARTICIPANTS.filter((p) => p.gear).length;
  const redeemed    = PARTICIPANTS.filter((p) => p.r).length;
  const totalBadges = PARTICIPANTS.reduce((sum, p) => sum + p.c, 0);
  const withMilestone = PARTICIPANTS.filter((p) => !/^no milestone/i.test(p.m)).length;

  // Count participants per milestone name
  const milestoneCounts = {};
  PARTICIPANTS.forEach((p) => {
    milestoneCounts[p.m] = (milestoneCounts[p.m] || 0) + 1;
  });

  const mainChips = [
    ["Confirmed",      total],
    ["GEAR badge",     withGear],
    ["Codes redeemed", redeemed],
    ["Skill badges",   totalBadges],
    ["Milestones",     withMilestone]
  ];

  $("#stats").innerHTML =
    mainChips
      .map(([label, value]) =>
        `<div class="chip"><b data-n="${value}">0</b><span>${label}</span></div>`)
      .join("") +
    Object.entries(milestoneCounts)
      .map(([name, count]) =>
        `<div class="chip alt"><b>${count}</b><span>${escapeHTML(name)}</span></div>`)
      .join("");

  // Filter buttons
  $("#fl").innerHTML = FILTERS
    .map(([key, label]) =>
      `<button class="pill${key === activeFilter ? " on" : ""}" data-f="${key}">${label}</button>`)
    .join("");

  // Count-up animation for the main numbers
  document.querySelectorAll("[data-n]").forEach((el) => {
    const target = +el.dataset.n;
    const start  = performance.now();

    (function step(now) {
      const progress = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));  // ease-out
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  });
}


/* ==========================================================================
   RENDER: PARTICIPANT CARDS
   ========================================================================== */

// HTML for one participant card
function cardHTML(person, number, maxBadges) {
  const hue = hueFromName(person.n);
  const avatarBg =
    `linear-gradient(135deg, hsl(${hue} 50% 85%), hsl(${(hue + 40) % 360} 55% 76%))`;

  const badgeList = person.b.length
    ? `<details>
         <summary>${person.c} skill badge${person.c > 1 ? "s" : ""}</summary>
         <ul>${person.b.map((b) => `<li>${escapeHTML(b)}</li>`).join("")}</ul>
       </details>`
    : "";

  const skillsLink = person.su
    ? `<a href="${escapeHTML(person.su)}" target="_blank" rel="noopener">Skills profile ↗</a>` : "";
  const devLink = person.du
    ? `<a href="${escapeHTML(person.du)}" target="_blank" rel="noopener">Developer ↗</a>` : "";

  const skillsOk = /good/i.test(person.sp) ? "ok" : "";
  const devOk    = /good/i.test(person.dp) ? "ok" : "";
  const barWidth = percentOf(person.c, maxBadges);

  return `
    <article class="card p">
      <div class="head">
        <div class="av" style="background:${avatarBg}">${escapeHTML(initials(person.n))}</div>
        <div>
          <div class="nm">${escapeHTML(person.n)}</div>
          <div class="idx">#${String(number).padStart(2, "0")}</div>
        </div>
      </div>

      <div class="meta">
        <div><small>GEAR badge</small><span>${person.gear ? "Earned" : "Not yet"}</span></div>
        <div><small>Access code</small><span>${person.r ? "Redeemed" : "Pending"}</span></div>
        <div><small>Milestone</small><span>${escapeHTML(person.m)}</span></div>
        <div><small>Skill badges</small><span>${person.c}</span></div>
      </div>

      <div class="bar" style="margin:0"><b style="width:${barWidth}%"></b></div>

      <div class="tags" style="margin:0">
        <span class="tag ${skillsOk}"><i class="dot"></i>Skills: ${escapeHTML(person.sp)}</span>
        <span class="tag ${devOk}"><i class="dot"></i>Dev: ${escapeHTML(person.dp)}</span>
      </div>

      ${badgeList}

      <div class="links">${skillsLink}${devLink}</div>
    </article>`;
}

// Apply search + filter + sort, then draw the cards
function renderList() {
  const visible = PARTICIPANTS.filter((p) =>
    p.n.toLowerCase().includes(searchTerm) && FILTER_TESTS[activeFilter](p)
  );

  const byName = (a, b) => a.n.localeCompare(b.n);
  visible.sort((a, b) => {
    if (sortMode === "badges") return (b.c - a.c) || byName(a, b);
    if (sortMode === "gear")   return (b.gear - a.gear) || byName(a, b);
    return byName(a, b);
  });

  $("#cnt").textContent = `Showing ${visible.length} of ${PARTICIPANTS.length}`;

  const maxBadges = Math.max(8, ...PARTICIPANTS.map((p) => p.c));

  $("#grid").innerHTML = visible.length
    ? visible.map((p) => cardHTML(p, PARTICIPANTS.indexOf(p) + 1, maxBadges)).join("")
    : `<div class="empty card">No learners match that search.</div>`;
}

function renderAll() {
  renderStats();
  renderList();
}


/* ==========================================================================
   DATA FETCHING LOGIC (No Fallback)
   ========================================================================== */
function showError(msg) {
  console.error("Study Jam data failed to load:", msg);
  
  // Dashboard empty states
  const dash = `<div class="chip"><b>—</b><span>Unavailable</span></div>`;
  $("#stats").innerHTML = dash;
  $("#cnt").textContent = "";
  $("#asof").textContent = "unavailable";
  
  // Grid error message
  $("#grid").innerHTML = `
    <div class="empty card err">
      <b>Couldn't load learner data</b>
      <p>${escapeHTML(msg)}</p>
      <button class="pill on" id="retry" type="button" style="margin-top:1rem; cursor:pointer;">Try again</button>
    </div>`;
}

function showLoading() {
  $("#cnt").textContent = "Loading…";
  $("#grid").innerHTML = `<div class="empty card">Loading learner data…</div>`;
}

async function loadData() {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  
  try {
    if (!API_URL) throw new Error("API_URL is not set.");
    const res = await fetch(API_URL, { signal: ctl.signal });
    
    if (!res.ok) throw new Error("Server responded with HTTP " + res.status + ".");
    
    const r = await res.json();
    if (r.status !== "success" || !Array.isArray(r.data)) {
      throw new Error(r.message || "Unexpected response from the server.");
    }
    
    PARTICIPANTS = r.data;
    if (r.updated) $("#asof").textContent = r.updated;
    
    renderAll();
  } catch (e) {
    showError(e.name === "AbortError" ? "The request timed out." : (e.message || "Network error."));
  } finally {
    clearTimeout(tm);
    window.__ready = true;
  }
}


/* ==========================================================================
   EVENTS
   ========================================================================== */

// Search as you type
$("#q").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  if (PARTICIPANTS.length) renderList();
});

// Sort dropdown
$("#so").addEventListener("change", (e) => {
  sortMode = e.target.value;
  if (PARTICIPANTS.length) renderList();
});

// Filter buttons (one listener for all of them)
$("#fl").addEventListener("click", (e) => {
  const button = e.target.closest("[data-f]");
  if (!button) return;

  activeFilter = button.dataset.f;
  document.querySelectorAll("#fl .pill")
    .forEach((pill) => pill.classList.toggle("on", pill === button));
  if (PARTICIPANTS.length) renderList();
});

// Retry button event listener via event delegation on the grid
$("#grid").addEventListener("click", (e) => {
  if (e.target.id === "retry") {
    showLoading();
    loadData();
  }
});

// Search button / Enter key -> jump down to the participants
const goToPeople = () => $("#people").scrollIntoView({ behavior: "smooth" });
$("#fb").addEventListener("click", goToPeople);
$("#q").addEventListener("keydown", (e) => { if (e.key === "Enter") goToPeople(); });

// Floating buttons
$("#up").addEventListener("click", () => scrollTo({ top: 0 }));
$("#cp").addEventListener("click", () => document.body.classList.toggle("compact"));

// Fade sections in when they scroll into view
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(".rv").forEach((el) => revealObserver.observe(el));


/* ==========================================================================
   GOOGLE CLOUD LOGOS
   ========================================================================== */
const HERO_LOGOS = [
  [ 5, 22, 60,  0,   -8, .90],
  [14, 58, 44, 1.2,  10, .80],
  [27, 18, 36,  2,  -12, .65],
  [72, 20, 38, 1.8,   6, .70],
  [82, 56, 54,  .8,  -8, .90],
  [93, 24, 48, 2.2,  10, .90],
  [22, 74, 46, 1.6,   8, .85],
  [90, 74, 50, 1.4,   8, .85]
];

const FOOTER_LOGOS = [
  [10, 34, 48,  0,   -8, .90],
  [24, 58, 36, 1.2,  10, .75],
  [42, 22, 42,  .6,   6, .85],
  [60, 54, 44, 1.6,  -8, .85],
  [76, 24, 38,  .3,   8, .75],
  [88, 52, 46, 2.2,  -6, .85]
];

// Place the logos inside a container
function scatterLogos(containerId, positions) {
  const container = document.getElementById(containerId);
  if (!container) return;

  positions.forEach(([left, top, size, delay, rotation, opacity]) => {
    const img = new Image();
    img.src = CLOUD_LOGO;
    img.alt = "";
    img.style.cssText =
      `left:${left}%; top:${top}%; --s:${size}; --d:${delay}s; --r:${rotation}deg; --o:${opacity}`;
    img.onerror = () => img.remove();      // quietly skip if the file is missing
    container.appendChild(img);
  });
}

scatterLogos("gc",  HERO_LOGOS);
scatterLogos("gc2", FOOTER_LOGOS);


/* ==========================================================================
   SMOOTH MOUSE-WHEEL SCROLLING
   ========================================================================== */
(function () {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchDevice  = matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || touchDevice) return;

  let current = scrollY;   // position being drawn
  let target  = scrollY;   // position we are heading to
  let frame   = 0;         // running animation frame (0 = idle)

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const jumpTo    = (y) => scrollTo({ top: y, behavior: "instant" });

  function animate() {
    current += (target - current) * 0.12;

    if (Math.abs(target - current) < 0.5) {   // close enough: stop
      current = target;
      jumpTo(current);
      frame = 0;
      return;
    }
    jumpTo(current);
    frame = requestAnimationFrame(animate);
  }

  addEventListener("wheel", (e) => {
    if (e.ctrlKey || document.body.classList.contains("loading")) return;
    e.preventDefault();

    if (!frame) current = target = scrollY;
    const delta = e.deltaY * (e.deltaMode === 1 ? 32 : 1);   // lines -> pixels
    target = Math.max(0, Math.min(maxScroll(), target + delta));

    if (!frame) frame = requestAnimationFrame(animate);
  }, { passive: false });

  // Keep in sync when scrolled by keyboard, scrollbar or links
  addEventListener("scroll", () => {
    if (!frame) current = target = scrollY;
  }, { passive: true });
})();


/* ==========================================================================
   START
   ========================================================================== */
loadData();
