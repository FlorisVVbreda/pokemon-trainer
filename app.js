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
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const spriteFallback = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

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
    card.addEventListener("click", () => showDetail(id));
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

function ivRow(label, cap, ivs) {
  if (!ivs) return "";
  const [level, atk, def, hp] = ivs;
  return `<div class="info-row"><span>${label}</span><b>Level ${level} · Aanval ${atk} / Verdediging ${def} / Uith. ${hp}</b></div>`;
}

function showDetail(id) {
  const raw = byId.get(id);
  const target = poke(raw);

  pickerView.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("target-img").src = spriteUrl(target.spriteId);
  document.getElementById("target-img").onerror = function () {
    this.onerror = null;
    this.src = spriteFallback(target.spriteId);
  };
  document.getElementById("target-name").textContent = `#${String(target.dex).padStart(4, "0")} ${target.name}`;

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

  const { fast, charged } = bestMoves(target, null, target.atk);
  const ownMoves = [...fast.slice(0, 2), ...charged.slice(0, 3)];
  const ownMovesEl = document.getElementById("own-moves-list");
  ownMovesEl.innerHTML = ownMoves.length
    ? ownMoves.map((m) => moveRow(m)).join("")
    : `<div class="empty-msg">Geen aanvallen gevonden.</div>`;

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
      card.addEventListener("click", () => showBattlePlan(cand.id, target.id));
      counterList.appendChild(card);
    });
  }
}

const battleView = document.getElementById("battle-view");
const battleBackBtn = document.getElementById("battle-back-btn");
let battleReturnTarget = null;

function showBattlePlan(candId, targetId) {
  const cand = poke(byId.get(candId));
  const target = poke(byId.get(targetId));
  battleReturnTarget = targetId;

  detailView.classList.add("hidden");
  pickerView.classList.add("hidden");
  battleView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

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
  const { fast, charged } = bestMoves(cand, target.types, cand.atk);
  const moves = [...fast.slice(0, 1), ...charged.slice(0, 3)];
  const movesEl = document.getElementById("battle-moves-list");
  movesEl.innerHTML = moves.length
    ? moves.map((m) => moveRow(m, { showMult: true })).join("")
    : `<div class="empty-msg">Geen effectieve aanvallen gevonden.</div>`;

  document.getElementById("battle-iv-panel").innerHTML =
    ivRow("Little League (CP500)", 500, cand.ivCp500) +
    ivRow("Great League (CP1500)", 1500, cand.ivCp1500) +
    ivRow("Ultra League (CP2500)", 2500, cand.ivCp2500) +
    `<div class="info-row"><span>Master League / Raids</span><b>Level 50-51 · 15/15/15 IV's</b></div>` +
    `<div class="info-flavor">Voor Raids maakt het niveau niet uit voor de CP-limiet — kies altijd de hoogst mogelijke IV's en level.</div>`;
}

battleBackBtn.addEventListener("click", () => {
  battleView.classList.add("hidden");
  if (battleReturnTarget != null) {
    showDetail(battleReturnTarget);
  } else {
    pickerView.classList.remove("hidden");
  }
});

backBtn.addEventListener("click", () => {
  detailView.classList.add("hidden");
  pickerView.classList.remove("hidden");
});

searchInput.addEventListener("input", renderGrid);

renderTypeFilters();
renderGrid();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
