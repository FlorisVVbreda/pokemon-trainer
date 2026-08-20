// ---------------------------------------------------------------------
// Pokémon GO type-effectiviteit (aanvallend type -> verdedigend type)
// GO gebruikt geen immuniteiten: alles is 1.6x (super effectief),
// 1x (normaal) of 0.625x (niet effectief, ook waar de hoofdgames 0x geven)
// ---------------------------------------------------------------------
const N = TYPES.length;
const CHART = Array.from({ length: N }, () => new Array(N).fill(1));
const GO_SUPER = 1.6;
const GO_RESIST = 0.625;
const GO_STAB = 1.2;

// CP-multiplier per level (index = (level-1)*2), t/m level 51
const CPM = [0.094,0.135137,0.166398,0.192651,0.215732,0.236573,0.25572,0.27353,0.29025,0.306057,0.321088,0.335445,0.349213,0.362458,0.375236,0.387592,0.399567,0.411194,0.4225,0.432926,0.443108,0.45306,0.462798,0.472336,0.481685,0.490856,0.499858,0.508702,0.517394,0.525943,0.534354,0.542636,0.550793,0.558831,0.566755,0.574569,0.582279,0.589888,0.5974,0.604824,0.612157,0.619404,0.626567,0.633649,0.640653,0.647581,0.654436,0.661219,0.667934,0.674582,0.681165,0.687685,0.694144,0.700543,0.706884,0.713169,0.719399,0.725576,0.7317,0.734741,0.737769,0.740786,0.743789,0.746781,0.749761,0.752729,0.755686,0.75863,0.761564,0.764486,0.767397,0.770297,0.773187,0.776065,0.778933,0.78179,0.784637,0.787474,0.7903,0.792804,0.7953,0.797804,0.8003,0.802804,0.8053,0.807804,0.8103,0.812804,0.8153,0.817804,0.8203,0.822804,0.8253,0.827804,0.8303,0.832804,0.8353,0.837804,0.8403,0.842804,0.8453,0.847804];

function cpAtLevel(level, atk, def, hp, atkIV = 15, defIV = 15, hpIV = 15) {
  const cpm = CPM[Math.round((level - 1) * 2)];
  return Math.floor((atk + atkIV) * Math.sqrt(def + defIV) * Math.sqrt(hp + hpIV) * cpm * cpm / 10);
}

function setFx(atk, defs, mult) {
  const a = TYPES.indexOf(atk);
  for (const d of defs) CHART[a][TYPES.indexOf(d)] = mult;
}

setFx("normal", ["rock", "steel"], GO_RESIST);
setFx("normal", ["ghost"], GO_RESIST);

setFx("fire", ["fire", "water", "rock", "dragon"], GO_RESIST);
setFx("fire", ["grass", "ice", "bug", "steel"], GO_SUPER);

setFx("water", ["water", "grass", "dragon"], GO_RESIST);
setFx("water", ["fire", "ground", "rock"], GO_SUPER);

setFx("electric", ["electric", "grass", "dragon"], GO_RESIST);
setFx("electric", ["ground"], GO_RESIST);
setFx("electric", ["water", "flying"], GO_SUPER);

setFx("grass", ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], GO_RESIST);
setFx("grass", ["water", "ground", "rock"], GO_SUPER);

setFx("ice", ["fire", "water", "ice", "steel"], GO_RESIST);
setFx("ice", ["grass", "ground", "flying", "dragon"], GO_SUPER);

setFx("fighting", ["poison", "flying", "psychic", "bug", "fairy"], GO_RESIST);
setFx("fighting", ["ghost"], GO_RESIST);
setFx("fighting", ["normal", "ice", "rock", "dark", "steel"], GO_SUPER);

setFx("poison", ["poison", "ground", "rock", "ghost"], GO_RESIST);
setFx("poison", ["steel"], GO_RESIST);
setFx("poison", ["grass", "fairy"], GO_SUPER);

setFx("ground", ["grass", "bug"], GO_RESIST);
setFx("ground", ["flying"], GO_RESIST);
setFx("ground", ["fire", "electric", "poison", "rock", "steel"], GO_SUPER);

setFx("flying", ["electric", "rock", "steel"], GO_RESIST);
setFx("flying", ["grass", "fighting", "bug"], GO_SUPER);

setFx("psychic", ["psychic", "steel"], GO_RESIST);
setFx("psychic", ["dark"], GO_RESIST);
setFx("psychic", ["fighting", "poison"], GO_SUPER);

setFx("bug", ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], GO_RESIST);
setFx("bug", ["grass", "psychic", "dark"], GO_SUPER);

setFx("rock", ["fighting", "ground", "steel"], GO_RESIST);
setFx("rock", ["fire", "ice", "flying", "bug"], GO_SUPER);

setFx("ghost", ["dark"], GO_RESIST);
setFx("ghost", ["normal"], GO_RESIST);
setFx("ghost", ["psychic", "ghost"], GO_SUPER);

setFx("dragon", ["steel"], GO_RESIST);
setFx("dragon", ["fairy"], GO_RESIST);
setFx("dragon", ["dragon"], GO_SUPER);

setFx("dark", ["fighting", "dark", "fairy"], GO_RESIST);
setFx("dark", ["psychic", "ghost"], GO_SUPER);

setFx("steel", ["fire", "water", "electric", "steel"], GO_RESIST);
setFx("steel", ["ice", "rock", "fairy"], GO_SUPER);

setFx("fairy", ["fire", "poison", "steel"], GO_RESIST);
setFx("fairy", ["fighting", "dragon", "dark"], GO_SUPER);

function typeMultiplier(atkIdx, defIdxs) {
  let m = 1;
  for (const d of defIdxs) m *= CHART[atkIdx][d];
  return Math.round(m * 10000) / 10000;
}

// ---------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------
const spriteUrl = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites/sprites/pokemon/other/official-artwork/${id}.png`;
const spriteFallback = (id) =>
  `https://cdn.jsdelivr.net/gh/PokeAPI/sprites/sprites/pokemon/${id}.png`;

const byId = new Map(); // speciesId -> raw row
const byDexFirst = new Map(); // dex -> first raw row (for evolution lookups)
for (const p of POKEMON) {
  byId.set(p[1], p);
  if (!byDexFirst.has(p[0])) byDexFirst.set(p[0], p);
}

function poke(p) {
  return {
    dex: p[0], id: p[1], name: p[2], types: p[3],
    atk: p[4], def: p[5], hp: p[6],
    fastNormal: p[7], fastElite: p[8], chargedNormal: p[9], chargedElite: p[10],
    tags: p[11],
    ivCp500: p[12], ivCp1500: p[13], ivCp2500: p[14],
    parent: p[15], buddyDistance: p[16], spriteId: p[17],
  };
}

const FAST_SET = new Set();
const ELITE_FAST_SET = new Set();
const CHARGED_SET = new Set();
const ELITE_CHARGED_SET = new Set();
for (const p of POKEMON) {
  p[7].forEach((i) => FAST_SET.add(i));
  p[8].forEach((i) => ELITE_FAST_SET.add(i));
  p[9].forEach((i) => CHARGED_SET.add(i));
  p[10].forEach((i) => ELITE_CHARGED_SET.add(i));
}

function moveInfo(i, eliteOverride) {
  const m = MOVES[i];
  return {
    idx: i, name: m[0], type: m[1], power: m[2], value: m[3], turns: m[4],
    isFast: m[5] === 1,
    elite: eliteOverride !== undefined ? eliteOverride : (m[5] === 1 ? ELITE_FAST_SET.has(i) : ELITE_CHARGED_SET.has(i)),
  };
}

const TYPE_LABEL = (i) => TYPES[i][0].toUpperCase() + TYPES[i].slice(1);
const titleCase = (s) => s.split(/[-_]/).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const TAG_LABEL = {
  legendary: "Legendarisch", mythical: "Mythisch", mega: "Mega", primal: "Primal",
  ultrabeast: "Ultrabeest", shadoweligible: "Shadow-geschikt",
  alolan: "Regionale vorm (Alola)", galarian: "Regionale vorm (Galar)",
  hisuian: "Regionale vorm (Hisui)", paldean: "Regionale vorm (Paldea)",
  regional: "Regionaal exclusief",
};
const TAG_CLASS = {
  legendary: "tag-legendary", mythical: "tag-mythical",
  mega: "tag-mega", primal: "tag-primal",
};

// ---------------------------------------------------------------------
// Live Pokémon GO events (LeekDuck, via de ScrapedDuck-spiegel op jsDelivr)
// Wordt gebruikt om te tonen of een Pokémon NU een Raid-boss/Spotlight is
// en of de shiny-kans daardoor tijdelijk verhoogd is.
// ---------------------------------------------------------------------
const EVENTS_URL = "https://cdn.jsdelivr.net/gh/bigfoott/ScrapedDuck@data/events.json";
let eventsPromise = null;

function loadEvents() {
  if (!eventsPromise) {
    eventsPromise = fetch(EVENTS_URL)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return eventsPromise;
}

function normPokeName(raw) {
  let s = raw.toLowerCase().trim();
  const m = s.match(/^(.*)\s*\((mega(?:\s*[xy])?|primal|armored|shadow)\)$/i);
  if (m) s = `${m[2]} ${m[1]}`;
  return s.replace(/[^a-z0-9]+/g, " ").trim();
}

function isEventActive(e, now) {
  const start = Date.parse(e.start);
  const end = Date.parse(e.end);
  return !isNaN(start) && !isNaN(end) && start <= now && now <= end;
}

// Zoekt of `target` nu ergens als Raid-boss / Spotlight-Pokémon voorkomt
// in de live, actieve events.
function findBoostsFor(target, events) {
  const now = Date.now();
  const key = normPokeName(target.name);
  const boosts = [];
  for (const e of events) {
    if (!isEventActive(e, now)) continue;
    const ex = e.extraData || {};
    const candidates = [];
    if (ex.raidbattles && ex.raidbattles.bosses) {
      for (const b of ex.raidbattles.bosses) candidates.push({ name: b.name, canBeShiny: !!b.canBeShiny, kind: "raid" });
    }
    if (ex.spotlight) {
      const list = ex.spotlight.list && ex.spotlight.list.length ? ex.spotlight.list : [ex.spotlight];
      for (const s of list) candidates.push({ name: s.name, canBeShiny: !!s.canBeShiny, kind: "spotlight", bonus: ex.spotlight.bonus });
    }
    for (const c of candidates) {
      if (normPokeName(c.name) === key) {
        boosts.push({ event: e, canBeShiny: c.canBeShiny, kind: c.kind, bonus: c.bonus });
        break;
      }
    }
  }
  return boosts;
}

function fmtEventDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------
// Move scoring
// ---------------------------------------------------------------------
function scoredMove(m, ownTypes, defTypes, atkStat) {
  const mult = defTypes ? typeMultiplier(m.type, defTypes) : 1;
  const stab = ownTypes.includes(m.type) ? GO_STAB : 1;
  const dpt = (m.power * mult * stab) / m.turns; // schade per beurt (~0.5s)
  const epRatio = m.isFast
    ? m.power * mult * stab + m.value * 0.5 // fast: schade + energiewaarde
    : (m.power * mult * stab * 100) / Math.max(1, m.value); // charged: schade per energie
  return { ...m, mult, stab, dpt, score: m.isFast ? dpt * 2 + m.value * 0.3 : epRatio };
}

function bestMoves(cand, defTypes, atkStat) {
  const fast = [...cand.fastNormal, ...cand.fastElite]
    .map((i) => scoredMove(moveInfo(i), cand.types, defTypes, atkStat))
    .sort((a, b) => b.score - a.score);
  const charged = [...cand.chargedNormal, ...cand.chargedElite]
    .map((i) => scoredMove(moveInfo(i), cand.types, defTypes, atkStat))
    .sort((a, b) => b.score - a.score);
  return { fast, charged };
}

// Losse groepen (gewone TM vs Elite TM) zodat spelers zonder Elite TM ook een goede optie zien.
// Elite-status is per Pokémon (dezelfde move kan bij het ene Pokémon gewoon en bij het andere
// Elite-only zijn), dus geven we die expliciet mee in plaats van te vertrouwen op de globale set.
function groupedMoves(cand, defTypes, atkStat) {
  const rank = (idxs, isElite) => idxs
    .map((i) => scoredMove(moveInfo(i, isElite), cand.types, defTypes, atkStat))
    .sort((a, b) => b.score - a.score);
  return {
    fastNormal: rank(cand.fastNormal, false),
    fastElite: rank(cand.fastElite, true),
    chargedNormal: rank(cand.chargedNormal, false),
    chargedElite: rank(cand.chargedElite, true),
  };
}

function moveGroupsHtml(groups, { showMult } = {}) {
  const sections = [
    ["Beste Snelle aanval — gewone TM", groups.fastNormal.slice(0, 1), "Geen gewone Snelle aanval beschikbaar."],
    ["Beste Snelle aanval — Elite TM", groups.fastElite.slice(0, 1), "Geen Elite-moves beschikbaar voor deze Pokémon."],
    ["Beste Speciale aanvallen — gewone TM", groups.chargedNormal.slice(0, 2), "Geen gewone Speciale aanvallen beschikbaar."],
    ["Beste Speciale aanvallen — Elite TM", groups.chargedElite.slice(0, 2), "Geen Elite-moves beschikbaar voor deze Pokémon."],
  ];
  if (sections.every(([, moves]) => moves.length === 0)) return `<div class="empty-msg">Geen aanvallen gevonden.</div>`;
  return sections
    .map(([title, moves, emptyMsg]) =>
      `<div class="move-group-title">${title}</div>` +
      (moves.length ? moves.map((m) => moveRow(m, { showMult })).join("") : `<div class="empty-msg">${emptyMsg}</div>`)
    )
    .join("");
}

function tmChip(m) {
  if (m.isFast) return m.elite ? `<span class="tm-chip tm-elite">Elite Fast TM</span>` : `<span class="tm-chip">Fast TM</span>`;
  return m.elite ? `<span class="tm-chip tm-elite">Elite Charged TM</span>` : `<span class="tm-chip">Charged TM</span>`;
}

function moveRow(m, { showMult } = {}) {
  const multLabel = showMult
    ? (m.mult >= GO_SUPER ? `<span style="color:var(--good)">×${m.mult} super effectief</span>`
       : m.mult <= GO_RESIST ? `<span style="color:var(--bad)">×${m.mult}</span>`
       : `×${m.mult}`)
    : "";
  const statLine = m.isFast
    ? `${m.power} schade · +${m.value} energie · ${m.turns} beurten`
    : `${m.power} schade · ${m.value} energie nodig · ${m.turns} beurten`;
  return `
    <div class="battle-move-row">
      <span class="type-badge" style="background:var(--t-${TYPES[m.type]})">${TYPE_LABEL(m.type)}</span>
      <div class="battle-move-mid">
        <div class="battle-move-name">${m.name}${m.isFast ? ' <span class="fast-tag">Snelle aanval</span>' : ' <span class="charged-tag">Speciale aanval</span>'}</div>
        <div class="battle-move-stats">${statLine}${showMult ? ` · ${multLabel}` : ""}</div>
      </div>
      ${tmChip(m)}
    </div>`;
}

// ---------------------------------------------------------------------
// Counter-algoritme
// ---------------------------------------------------------------------
function offenseScore(cand, defTypes) {
  const { fast, charged } = bestMoves(cand, defTypes, cand.atk);
  const bestFast = fast[0];
  const bestCharged = charged[0];
  const score = (bestCharged ? bestCharged.dpt : 0) * 1.4 + (bestFast ? bestFast.dpt : 0) * 0.6;
  return { score: score * (cand.atk / 180), bestFast, bestCharged, mult: bestCharged ? bestCharged.mult : 1 };
}

function findCounters(target, limit = 12) {
  const results = [];
  for (const raw of POKEMON) {
    const cand = poke(raw);
    if (cand.id === target.id) continue;
    if (!cand.fastNormal.length && !cand.fastElite.length) continue;
    if (!cand.chargedNormal.length && !cand.chargedElite.length) continue;
    const off = offenseScore(cand, target.types);
    if (!off.bestCharged) continue;
    const inc = offenseScore(target, cand.types);
    const bulk = Math.sqrt(cand.def * cand.hp) / 180;
    const score = off.score - inc.score * 0.6 + bulk * 0.5;
    results.push({ cand, off, inc, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function weaknessesOf(target) {
  const rows = [];
  for (let i = 0; i < N; i++) {
    const mult = typeMultiplier(i, target.types);
    if (mult > 1) rows.push({ type: i, mult });
  }
  rows.sort((a, b) => b.mult - a.mult || TYPES[a.type].localeCompare(TYPES[b.type]));
  return rows;
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------
const grid = document.getElementById("poke-grid");
const searchInput = document.getElementById("search");
const typeFiltersEl = document.getElementById("type-filters");
const pickerView = document.getElementById("picker-view");
const detailView = document.getElementById("detail-view");
const backBtn = document.getElementById("back-btn");

let activeTypeFilter = null;

// Maakt een niet-native element (div) ook met toetsenbord bedienbaar (Tab + Enter/Spatie) —
// fijn voor laptop/pc-gebruikers die niet met de muis klikken.
function makeClickable(el, handler) {
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.addEventListener("click", handler);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  });
}

function typeBadge(i) {
  const span = document.createElement("span");
  span.className = "type-badge";
  span.textContent = TYPE_LABEL(i);
  span.style.background = `var(--t-${TYPES[i]})`;
  return span;
}

function renderTypeFilters() {
  TYPES.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.className = "type-chip";
    btn.textContent = TYPE_LABEL(i);
    btn.style.background = `var(--t-${t})`;
    btn.addEventListener("click", () => {
      activeTypeFilter = activeTypeFilter === i ? null : i;
      renderGrid();
      [...typeFiltersEl.children].forEach((c, ci) => c.classList.toggle("active", ci === activeTypeFilter));
    });
    typeFiltersEl.appendChild(btn);
  });
}

function renderGrid() {
  const q = searchInput.value.trim().toLowerCase();
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const raw of POKEMON) {
    const [dex, id, name, types, , , , , , , , tags, , , , , , spriteId] = raw;
    if (activeTypeFilter !== null && !types.includes(activeTypeFilter)) continue;
    if (q && !id.includes(q) && !name.toLowerCase().includes(q) && String(dex) !== q) continue;

    const isMega = tags.includes("mega");
    const isPrimal = tags.includes("primal");
    const card = document.createElement("div");
    card.className = "poke-card";
    card.innerHTML = `
      ${isPrimal ? `<div class="variant-ribbon variant-4">Primal</div>` : isMega ? `<div class="variant-ribbon variant-1">Mega</div>` : ""}
      <img loading="lazy" src="${spriteUrl(spriteId)}" alt="${name}"
           onerror="this.onerror=null;this.src='${spriteFallback(spriteId)}'">
      <div class="num">#${String(dex).padStart(4, "0")}</div>
      <div class="name">${name}</div>
    `;
    const badges = document.createElement("div");
    badges.className = "type-badges";
    types.forEach((t) => badges.appendChild(typeBadge(t)));
    card.appendChild(badges);
    makeClickable(card, () => showDetail(id));
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function statRow(label, value, max) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `
    <div class="stat-row">
      <span>${label}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span>${value}</span>
    </div>`;
}

function obtainInfo(target) {
  const lines = [];
  if (target.tags.includes("primal")) {
    lines.push("Primal-vorm: tijdelijk te activeren tijdens gevecht met Mega-energie, na het vangen van de gewone vorm via een Raid.");
  } else if (target.tags.includes("mega")) {
    lines.push("Mega-evolueer een gewone versie van deze Pokémon met Mega-energie (verzameld via Mega Raids of dagelijkse Mega-gevechten).");
  } else if (target.parent) {
    const parentRow = byId.get(target.parent);
    const parentName = parentRow ? poke(parentRow).name : titleCase(target.parent);
    lines.push(`Evolueer vanuit ${parentName} met snoepjes (mogelijk ook een evolutie-item nodig).`);
  }
  if (target.tags.includes("legendary") || target.tags.includes("mythical") || target.tags.includes("ultrabeast")) {
    lines.push("Vooral te verkrijgen via Raids, Onderzoeksopdrachten of speciale evenementen.");
  } else if (!target.tags.includes("mega") && !target.tags.includes("primal")) {
    lines.push("In het wild te vangen, uit een ei te broeden, of als Raid-tegenstander tegen te komen.");
  }
  if (target.tags.includes("shadoweligible")) {
    lines.push("Kan ook verschijnen als Shadow-Pokémon bij Team GO Rocket (grunts, bazen of ballonnen).");
  }
  if (target.buddyDistance != null) {
    lines.push(`Als maatje: ${target.buddyDistance} km per snoepje.`);
  }
  if (target.tags.includes("regional")) {
    lines.push("Regionaal exclusief — spawnt normaal alleen in een bepaald deel van de wereld.");
  }
  return lines;
}

function quickfactsHtml(target) {
  const cp20 = cpAtLevel(20, target.atk, target.def, target.hp);
  const cp25 = cpAtLevel(25, target.atk, target.def, target.hp);
  return `
    <div class="quickfact-chip"><span>Hundo CP (100% IV)</span><b>L20: ${cp20} · L25 boost: ${cp25}</b></div>
    <div class="quickfact-chip" id="shiny-chip"><span>Shiny-kans</span><b>±1 op 500 (standaard)</b></div>
  `;
}

function ivRow(label, cap, ivs) {
  if (!ivs) return "";
  const [level, atk, def, hp] = ivs;
  return `<div class="info-row"><span>${label}</span><b>Level ${level} · Aanval ${atk} / Verdediging ${def} / Uith. ${hp}</b></div>`;
}

function renderDetail(id) {
  const raw = byId.get(id);
  const target = poke(raw);

  showView(detailView, navPokedex);

  document.getElementById("target-img").src = spriteUrl(target.spriteId);
  document.getElementById("target-img").onerror = function () {
    this.onerror = null;
    this.src = spriteFallback(target.spriteId);
  };
  const nameEl = document.getElementById("target-name");
  nameEl.textContent = `#${String(target.dex).padStart(4, "0")} ${target.name}`;
  nameEl.dataset.id = id;

  const tagsEl = document.getElementById("target-tags");
  tagsEl.innerHTML = "";
  target.tags.filter((t) => TAG_LABEL[t]).forEach((t) => {
    const tag = document.createElement("span");
    tag.className = `tag-badge ${TAG_CLASS[t] || "tag-mega"}`;
    tag.textContent = TAG_LABEL[t];
    tagsEl.appendChild(tag);
  });

  const typesEl = document.getElementById("target-types");
  typesEl.innerHTML = "";
  target.types.forEach((t) => typesEl.appendChild(typeBadge(t)));

  document.getElementById("target-quickfacts").innerHTML = quickfactsHtml(target);
  document.getElementById("event-banner-slot").innerHTML = "";
  loadEvents().then((events) => {
    if (!byId.get(id) || document.getElementById("target-name").dataset.id !== id) return;
    const boosts = findBoostsFor(target, events);
    const slot = document.getElementById("event-banner-slot");
    slot.innerHTML = boosts
      .map((b) => {
        const kindLabel = b.kind === "raid" ? "Nu een Raid-boss" : "Nu Spotlight Hour";
        const shinyNote = b.canBeShiny
          ? "Shiny mogelijk — en de kans is tijdens dit event verhoogd (exact percentage niet officieel bekend, maar duidelijk hoger dan normaal)."
          : "Geen shiny-boost tijdens dit specifieke event.";
        return `
          <a class="event-banner" href="${b.event.link}" target="_blank" rel="noopener">
            <div class="eb-title">🔥 ${kindLabel}: ${b.event.name}</div>
            <div class="eb-detail">Actief t/m ${fmtEventDate(b.event.end)} · ${shinyNote} Check de Hundo CP hierboven bij het vangen!</div>
          </a>`;
      })
      .join("");
    const shinyChip = document.getElementById("shiny-chip");
    if (shinyChip) {
      const shinyBoost = boosts.find((b) => b.canBeShiny);
      if (shinyBoost) {
        shinyChip.classList.add("shiny-boost");
        shinyChip.innerHTML = `<span>Shiny-kans</span><b>✨ NU VERHOOGD (${shinyBoost.event.name})</b>`;
      }
    }
  });

  document.getElementById("target-stats").innerHTML =
    statRow("Aanval", target.atk, 350) +
    statRow("Verdediging", target.def, 350) +
    statRow("Uithoudingsvermogen", target.hp, 500);

  const infoLines = obtainInfo(target);
  document.getElementById("info-panel").innerHTML = infoLines.map((l) => `<div class="info-flavor">${l}</div>`).join("");

  const ivHtml =
    ivRow("Little League (CP500)", 500, target.ivCp500) +
    ivRow("Great League (CP1500)", 1500, target.ivCp1500) +
    ivRow("Ultra League (CP2500)", 2500, target.ivCp2500) +
    `<div class="info-row"><span>Master League</span><b>Level 50-51 · 15/15/15 IV's</b></div>`;
  document.getElementById("location-list").innerHTML = ivHtml;

  document.getElementById("own-moves-list").innerHTML = moveGroupsHtml(groupedMoves(target, null, target.atk));

  const weakList = document.getElementById("weakness-list");
  const weaknesses = weaknessesOf(target);
  weakList.innerHTML = "";
  if (weaknesses.length === 0) {
    weakList.innerHTML = `<div class="empty-msg">Geen typevoordeel gevonden — gebruik rauwe kracht!</div>`;
  } else {
    for (const w of weaknesses) {
      const row = document.createElement("div");
      row.className = "weakness-row";
      row.appendChild(typeBadge(w.type));
      const mult = document.createElement("span");
      mult.className = "mult";
      mult.textContent = `×${w.mult}`;
      row.appendChild(mult);
      weakList.appendChild(row);
    }
  }

  const counterList = document.getElementById("counter-list");
  counterList.innerHTML = "";
  const counters = findCounters(target);
  if (counters.length === 0) {
    counterList.innerHTML = `<div class="empty-msg">Geen goede tegenstanders gevonden.</div>`;
  } else {
    counters.forEach((r, idx) => {
      const { cand, off, inc } = r;
      const card = document.createElement("div");
      card.className = "counter-card";

      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = spriteUrl(cand.spriteId);
      img.onerror = function () { this.onerror = null; this.src = spriteFallback(cand.spriteId); };
      card.appendChild(img);

      const info = document.createElement("div");
      const effLabel = off.mult >= GO_SUPER ? `<span style="color:var(--good)">×${off.mult} super effectief</span>`
                       : off.mult <= GO_RESIST ? `<span style="color:var(--bad)">×${off.mult}</span>`
                       : `×${off.mult}`;
      const incLabel = inc.bestCharged
        ? (inc.mult >= GO_SUPER ? `<span style="color:var(--bad)">×${inc.mult} terug</span>` : `×${inc.mult} terug`)
        : "geen effectieve aanval terug";
      const variantTag = cand.tags.includes("primal")
        ? `<span class="tag-badge tag-primal" style="font-size:0.65rem;padding:2px 8px;margin-left:6px;">Primal</span>`
        : cand.tags.includes("mega")
        ? `<span class="tag-badge tag-mega" style="font-size:0.65rem;padding:2px 8px;margin-left:6px;">Mega</span>`
        : "";

      info.innerHTML = `
        <div class="counter-rank">#${idx + 1}</div>
        <div class="counter-name">${cand.name}${variantTag}</div>
        <div class="type-badges"></div>
        <div class="counter-move">🗡️ <b>${off.bestCharged.name}</b> (${TYPE_LABEL(off.bestCharged.type)}, ${effLabel})</div>
        <div class="counter-reason">Ontvangt ${incLabel} van ${target.name}</div>
      `;
      info.querySelector(".type-badges").append(...cand.types.map(typeBadge));
      card.appendChild(info);
      makeClickable(card, () => showBattlePlan(cand.id, target.id));
      counterList.appendChild(card);
    });
  }
}

const battleView = document.getElementById("battle-view");
const battleBackBtn = document.getElementById("battle-back-btn");

function renderBattle(candId, targetId) {
  const cand = poke(byId.get(candId));
  const target = poke(byId.get(targetId));

  showView(battleView, navPokedex);

  document.getElementById("battle-cand-img").src = spriteUrl(cand.spriteId);
  document.getElementById("battle-cand-img").onerror = function () { this.onerror = null; this.src = spriteFallback(cand.spriteId); };
  document.getElementById("battle-cand-name").textContent = cand.name;
  const candTypesEl = document.getElementById("battle-cand-types");
  candTypesEl.innerHTML = "";
  cand.types.forEach((t) => candTypesEl.appendChild(typeBadge(t)));

  document.getElementById("battle-target-img").src = spriteUrl(target.spriteId);
  document.getElementById("battle-target-img").onerror = function () { this.onerror = null; this.src = spriteFallback(target.spriteId); };
  document.getElementById("battle-target-name").textContent = target.name;
  const targetTypesEl = document.getElementById("battle-target-types");
  targetTypesEl.innerHTML = "";
  target.types.forEach((t) => targetTypesEl.appendChild(typeBadge(t)));

  document.getElementById("battle-moves-title").textContent = `Beste aanvallen om ${target.name} te verslaan`;
  document.getElementById("battle-moves-list").innerHTML =
    moveGroupsHtml(groupedMoves(cand, target.types, cand.atk), { showMult: true });

  document.getElementById("battle-iv-panel").innerHTML =
    ivRow("Little League (CP500)", 500, cand.ivCp500) +
    ivRow("Great League (CP1500)", 1500, cand.ivCp1500) +
    ivRow("Ultra League (CP2500)", 2500, cand.ivCp2500) +
    `<div class="info-row"><span>Master League / Raids</span><b>Level 50-51 · 15/15/15 IV's</b></div>` +
    `<div class="info-flavor">Voor Raids maakt het niveau niet uit voor de CP-limiet — kies altijd de hoogst mogelijke IV's en level.</div>`;
}

// ---------------------------------------------------------------------
// Events / Raids / Coords-tabs: live kalender (LeekDuck via ScrapedDuck)
// ---------------------------------------------------------------------
const eventsView = document.getElementById("events-view");
const raidsView = document.getElementById("raids-view");
const coordsView = document.getElementById("coords-view");
const clipboardView = document.getElementById("clipboard-view");
const navPokedex = document.getElementById("nav-pokedex");
const navEvents = document.getElementById("nav-events");
const navRaids = document.getElementById("nav-raids");
const navCoords = document.getElementById("nav-coords");
const navClipboard = document.getElementById("nav-clipboard");

const ALL_VIEWS = [pickerView, detailView, battleView, eventsView, raidsView, coordsView, clipboardView];
const NAV_BUTTONS = [navPokedex, navEvents, navRaids, navCoords, navClipboard];

function showView(view, navBtn) {
  ALL_VIEWS.forEach((v) => v.classList.toggle("hidden", v !== view));
  NAV_BUTTONS.forEach((b) => b.classList.toggle("active", b === navBtn));
  if (view !== clipboardView) clipboardStopPolling();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const RAID_TYPES = new Set(["raid-battles", "raid-hour", "raid-day", "max-battles", "max-mondays"]);
const VENUE_TYPES = new Set(["pokemon-go-fest", "safari-zone", "go-tour"]);

function eventCardHtml(e, live) {
  const dateLabel = live
    ? `Actief t/m ${fmtEventDate(e.end)}`
    : `${fmtEventDate(e.start)} – ${fmtEventDate(e.end)}`;
  return `
    <a class="event-card" href="${e.link}" target="_blank" rel="noopener">
      <img loading="lazy" src="${e.image}" alt="" onerror="this.style.visibility='hidden'">
      <div>
        <div class="ec-name">${live ? '<span class="ec-live">Nu live</span>' : ""}${e.name}</div>
        <div class="ec-meta">${e.heading} · ${dateLabel}</div>
      </div>
    </a>`;
}

function renderEventLists(events, { statusEl, activeEl, upcomingEl, upcomingTitle, emptyMsg }) {
  const now = Date.now();
  const active = events.filter((e) => isEventActive(e, now)).sort((a, b) => Date.parse(a.end) - Date.parse(b.end));
  const upcoming = events
    .filter((e) => Date.parse(e.start) > now)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  statusEl.textContent = active.length ? "" : emptyMsg;
  statusEl.classList.toggle("hidden", active.length > 0);

  activeEl.innerHTML = active.map((e) => eventCardHtml(e, true)).join("");
  if (upcoming.length) {
    upcomingTitle.classList.remove("hidden");
    upcomingEl.innerHTML = upcoming.map((e) => eventCardHtml(e, false)).join("");
  } else {
    upcomingTitle.classList.add("hidden");
    upcomingEl.innerHTML = "";
  }
}

function renderEvents() {
  showView(eventsView, navEvents);
  const statusEl = document.getElementById("events-status");
  const activeEl = document.getElementById("events-active-list");
  const upcomingEl = document.getElementById("events-upcoming-list");
  const upcomingTitle = document.getElementById("events-upcoming-title");
  statusEl.textContent = "Events laden…";
  statusEl.classList.remove("hidden");
  activeEl.innerHTML = "";
  upcomingEl.innerHTML = "";
  upcomingTitle.classList.add("hidden");

  loadEvents().then((events) => {
    if (!events.length) {
      statusEl.textContent = "Kon de live events niet laden. Bekijk ze rechtstreeks op LeekDuck.com (link hierboven).";
      return;
    }
    renderEventLists(events, { statusEl, activeEl, upcomingEl, upcomingTitle, emptyMsg: "Geen events op dit moment actief." });
  });
}

function renderRaids() {
  showView(raidsView, navRaids);
  const statusEl = document.getElementById("raids-status");
  const activeEl = document.getElementById("raids-active-list");
  const upcomingEl = document.getElementById("raids-upcoming-list");
  const upcomingTitle = document.getElementById("raids-upcoming-title");
  statusEl.textContent = "Raids laden…";
  statusEl.classList.remove("hidden");
  activeEl.innerHTML = "";
  upcomingEl.innerHTML = "";
  upcomingTitle.classList.add("hidden");

  loadEvents().then((events) => {
    const raidEvents = events.filter((e) => RAID_TYPES.has(e.eventType));
    if (!raidEvents.length) {
      statusEl.textContent = "Kon de live raids niet laden. Bekijk de volledige lineup op LeekDuck.com (link hierboven).";
      return;
    }
    renderEventLists(raidEvents, { statusEl, activeEl, upcomingEl, upcomingTitle, emptyMsg: "Geen raid-events op dit moment actief." });
  });
}

function renderCoords() {
  showView(coordsView, navCoords);
  const statusEl = document.getElementById("coords-status");
  const listEl = document.getElementById("coords-list");
  statusEl.textContent = "Locaties laden…";
  statusEl.classList.remove("hidden");
  listEl.innerHTML = "";

  loadEvents().then((events) => {
    const venueEvents = events
      .filter((e) => VENUE_TYPES.has(e.eventType))
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    if (!venueEvents.length) {
      statusEl.textContent = "Momenteel staat er geen fysiek evenement met een specifieke locatie gepland. Check de officiële Niantic-pagina hierboven voor het laatste nieuws.";
      return;
    }
    statusEl.textContent = "";
    const now = Date.now();
    listEl.innerHTML = venueEvents.map((e) => eventCardHtml(e, isEventActive(e, now))).join("");
  });
}

// ---------------------------------------------------------------------
// Klembord-tab: tekst delen tussen je eigen apparaten (laptop <-> telefoon)
// via een eigen Firebase Realtime Database. Alleen bedoeld voor je eigen
// apparaten — niet geadverteerd, geen echte toegangscontrole.
// ---------------------------------------------------------------------
const CLIPBOARD_URL = "https://pokemon-clipbord-default-rtdb.firebaseio.com/clipboard.json";
let clipboardPollTimer = null;
let clipboardLastTs = 0;

function clipboardShowIncoming(data, attemptAutoCopy) {
  if (!data || !data.text || !data.ts || data.ts === clipboardLastTs) return;
  clipboardLastTs = data.ts;

  document.getElementById("clipboard-empty").classList.add("hidden");
  const filled = document.getElementById("clipboard-filled");
  filled.classList.remove("hidden");
  document.getElementById("clipboard-text-display").textContent = data.text;
  document.getElementById("clipboard-copy-status").textContent = "";

  if (attemptAutoCopy && navigator.clipboard && document.hasFocus()) {
    navigator.clipboard.writeText(data.text).then(() => {
      document.getElementById("clipboard-copy-status").textContent = "Automatisch gekopieerd ✓";
    }).catch(() => {});
  }
}

function clipboardPoll(attemptAutoCopy) {
  fetch(CLIPBOARD_URL)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => clipboardShowIncoming(data, attemptAutoCopy))
    .catch(() => {});
}

function clipboardStopPolling() {
  if (clipboardPollTimer) {
    clearInterval(clipboardPollTimer);
    clipboardPollTimer = null;
  }
}

function renderClipboard() {
  showView(clipboardView, navClipboard);
  clipboardPoll(false);
  clipboardStopPolling();
  clipboardPollTimer = setInterval(() => clipboardPoll(true), 3000);
}

document.getElementById("clipboard-send-btn").addEventListener("click", () => {
  const input = document.getElementById("clipboard-input");
  const btn = document.getElementById("clipboard-send-btn");
  const val = input.value.trim();
  if (!val) return;
  const original = btn.textContent;
  fetch(CLIPBOARD_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: val, ts: Date.now() }),
  }).then((r) => {
    if (!r.ok) throw new Error("send failed");
    btn.textContent = "Verstuurd ✓";
    input.value = "";
    setTimeout(() => { btn.textContent = original; }, 1400);
  }).catch(() => {
    btn.textContent = "Mislukt — probeer opnieuw";
    setTimeout(() => { btn.textContent = original; }, 1800);
  });
});

document.getElementById("clipboard-copy-btn").addEventListener("click", () => {
  const val = document.getElementById("clipboard-text-display").textContent;
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    document.getElementById("clipboard-copy-status").textContent = "Gekopieerd naar klembord ✓";
  }).catch(() => {
    document.getElementById("clipboard-copy-status").textContent = "Kopiëren mislukt — selecteer de tekst handmatig.";
  });
});

// ---------------------------------------------------------------------
// Navigatie via de History API: elke stap (overzicht -> detail ->
// gevechtsplan -> events/raids/coords) is een eigen history-entry,
// zodat de terug-swipe op telefoons (en de browser-terugknop) een
// stap terug doet in de app in plaats van de app/pagina te verlaten.
// ---------------------------------------------------------------------
function renderPicker() {
  showView(pickerView, navPokedex);
}

function applyState(state) {
  if (!state || state.view === "picker") renderPicker();
  else if (state.view === "detail") renderDetail(state.id);
  else if (state.view === "battle") renderBattle(state.candId, state.targetId);
  else if (state.view === "events") renderEvents();
  else if (state.view === "raids") renderRaids();
  else if (state.view === "coords") renderCoords();
  else if (state.view === "clipboard") renderClipboard();
}

function showDetail(id) {
  history.pushState({ view: "detail", id }, "", `#${id}`);
  renderDetail(id);
}

function showBattlePlan(candId, targetId) {
  history.pushState({ view: "battle", candId, targetId }, "", `#battle-${candId}-${targetId}`);
  renderBattle(candId, targetId);
}

function navigateTo(view) {
  history.pushState({ view }, "", `#${view}`);
  applyState({ view });
}

window.addEventListener("popstate", (e) => applyState(e.state));
history.replaceState({ view: "picker" }, "", location.pathname + location.search);

battleBackBtn.addEventListener("click", () => history.back());
backBtn.addEventListener("click", () => history.back());
navPokedex.addEventListener("click", () => { if (!navPokedex.classList.contains("active")) navigateTo("picker"); });
navEvents.addEventListener("click", () => { if (!navEvents.classList.contains("active")) navigateTo("events"); });
navRaids.addEventListener("click", () => { if (!navRaids.classList.contains("active")) navigateTo("raids"); });
navCoords.addEventListener("click", () => { if (!navCoords.classList.contains("active")) navigateTo("coords"); });
navClipboard.addEventListener("click", () => { if (!navClipboard.classList.contains("active")) navigateTo("clipboard"); });

searchInput.addEventListener("input", renderGrid);

// Escape gaat een stap terug — fijn voor toetsenbordgebruik op pc/laptop
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && history.state && history.state.view !== "picker") {
    history.back();
  }
});

renderTypeFilters();
renderGrid();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
