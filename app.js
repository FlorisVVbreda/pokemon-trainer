// ---------------------------------------------------------------------
// Type-effectiviteitstabel (aanvallend type -> verdedigend type)
// Indices komen overeen met de TYPES-array in data.js
// ---------------------------------------------------------------------
const N = TYPES.length;
const CHART = Array.from({ length: N }, () => new Array(N).fill(1));

function setFx(atk, defs, mult) {
  const a = TYPES.indexOf(atk);
  for (const d of defs) CHART[a][TYPES.indexOf(d)] = mult;
}

setFx("normal", ["rock", "steel"], 0.5);
setFx("normal", ["ghost"], 0);

setFx("fire", ["fire", "water", "rock", "dragon"], 0.5);
setFx("fire", ["grass", "ice", "bug", "steel"], 2);

setFx("water", ["water", "grass", "dragon"], 0.5);
setFx("water", ["fire", "ground", "rock"], 2);

setFx("electric", ["electric", "grass", "dragon"], 0.5);
setFx("electric", ["ground"], 0);
setFx("electric", ["water", "flying"], 2);

setFx("grass", ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], 0.5);
setFx("grass", ["water", "ground", "rock"], 2);

setFx("ice", ["fire", "water", "ice", "steel"], 0.5);
setFx("ice", ["grass", "ground", "flying", "dragon"], 2);

setFx("fighting", ["poison", "flying", "psychic", "bug", "fairy"], 0.5);
setFx("fighting", ["ghost"], 0);
setFx("fighting", ["normal", "ice", "rock", "dark", "steel"], 2);

setFx("poison", ["poison", "ground", "rock", "ghost"], 0.5);
setFx("poison", ["steel"], 0);
setFx("poison", ["grass", "fairy"], 2);

setFx("ground", ["grass", "bug"], 0.5);
setFx("ground", ["flying"], 0);
setFx("ground", ["fire", "electric", "poison", "rock", "steel"], 2);

setFx("flying", ["electric", "rock", "steel"], 0.5);
setFx("flying", ["grass", "fighting", "bug"], 2);

setFx("psychic", ["psychic", "steel"], 0.5);
setFx("psychic", ["dark"], 0);
setFx("psychic", ["fighting", "poison"], 2);

setFx("bug", ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], 0.5);
setFx("bug", ["grass", "psychic", "dark"], 2);

setFx("rock", ["fighting", "ground", "steel"], 0.5);
setFx("rock", ["fire", "ice", "flying", "bug"], 2);

setFx("ghost", ["dark"], 0.5);
setFx("ghost", ["normal"], 0);
setFx("ghost", ["psychic", "ghost"], 2);

setFx("dragon", ["steel"], 0.5);
setFx("dragon", ["fairy"], 0);
setFx("dragon", ["dragon"], 2);

setFx("dark", ["fighting", "dark", "fairy"], 0.5);
setFx("dark", ["psychic", "ghost"], 2);

setFx("steel", ["fire", "water", "electric", "steel"], 0.5);
setFx("steel", ["ice", "rock", "fairy"], 2);

setFx("fairy", ["fire", "poison", "steel"], 0.5);
setFx("fairy", ["fighting", "dragon", "dark"], 2);

function typeMultiplier(atkIdx, defIdxs) {
  let m = 1;
  for (const d of defIdxs) m *= CHART[atkIdx][d];
  return m;
}

// ---------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------
const spriteUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const spriteFallback = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const byId = new Map();
for (const p of POKEMON) byId.set(p[0], p);

function poke(p) {
  return {
    id: p[0], name: p[1], types: p[2],
    hp: p[3][0], atk: p[3][1], def: p[3][2], spa: p[3][3], spd: p[3][4], spe: p[3][5],
    moves: p[4],
    variant: p[5], baseDex: p[6],
    genus: p[7], flavor: p[8],
    height: p[9], weight: p[10],
    abilities: p[11], evolvesFrom: p[12], locations: p[13], rarity: p[14],
  };
}

function moveInfo(i) {
  const m = MOVES[i];
  return { name: m[0], type: m[1], power: m[2], acc: m[3], cls: m[4] };
}

const TYPE_LABEL = (i) => TYPES[i][0].toUpperCase() + TYPES[i].slice(1);

const titleCase = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const VARIANT_TAG = { 1: "Mega", 2: "Mega", 3: "Mega", 4: "Primal" };
const VARIANT_SUFFIX = { 2: " X", 3: " Y" };

function displayName(p) {
  const variant = p.variant ?? 0;
  if (!variant) return titleCase(p.name);
  const suffix = { 1: "-mega", 2: "-mega-x", 3: "-mega-y", 4: "-primal" }[variant];
  const base = titleCase(p.name.slice(0, -suffix.length));
  return `${VARIANT_TAG[variant]} ${base}${VARIANT_SUFFIX[variant] || ""}`;
}

function prettyLocation(slug) {
  return titleCase(slug.replace(/-area$/, ""));
}

const RARITY_LABEL = { 1: "Legendarisch", 2: "Mythisch" };

// ---------------------------------------------------------------------
// Counter-algoritme
// ---------------------------------------------------------------------
function bestMoveAgainst(attacker, defenderTypes) {
  let best = null;
  for (const mi of attacker.moves) {
    const m = moveInfo(mi);
    const mult = typeMultiplier(m.type, defenderTypes);
    if (mult === 0) continue;
    const stab = attacker.types.includes(m.type) ? 1.5 : 1;
    const atkStat = m.cls === 0 ? attacker.atk : attacker.spa;
    const score = m.power * (m.acc / 100) * mult * stab * (atkStat / 80);
    if (!best || score > best.score) best = { ...m, mult, stab, score };
  }
  return best;
}

function findCounters(target, limit = 12) {
  const results = [];
  for (const raw of POKEMON) {
    if (raw[0] === target.id) continue;
    const cand = poke(raw);
    const off = bestMoveAgainst(cand, target.types);
    if (!off) continue;
    const inc = bestMoveAgainst(target, cand.types);
    const speedBonus = (cand.spe - target.spe) * 0.4;
    const incScore = inc ? inc.score : 0;
    const score = off.score - incScore * 0.85 + speedBonus;
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
    const [id, name, types, , , variant, baseDex] = raw;
    if (activeTypeFilter !== null && !types.includes(activeTypeFilter)) continue;
    const nice = displayName({ name, variant });
    if (q && !name.includes(q) && !nice.toLowerCase().includes(q) && String(baseDex) !== q) continue;

    const card = document.createElement("div");
    card.className = "poke-card";
    card.innerHTML = `
      ${variant ? `<div class="variant-ribbon variant-${variant}">${VARIANT_TAG[variant]}${VARIANT_SUFFIX[variant] || ""}</div>` : ""}
      <img loading="lazy" src="${spriteUrl(id)}" alt="${nice}"
           onerror="this.onerror=null;this.src='${spriteFallback(id)}'">
      <div class="num">#${String(baseDex).padStart(4, "0")}</div>
      <div class="name">${nice}</div>
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

function statRow(label, value, max = 255) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `
    <div class="stat-row">
      <span>${label}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span>${value}</span>
    </div>`;
}

function showDetail(id) {
  const raw = byId.get(id);
  const target = poke(raw);

  pickerView.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("target-img").src = spriteUrl(target.id);
  document.getElementById("target-img").onerror = function () {
    this.onerror = null;
    this.src = spriteFallback(target.id);
  };
  document.getElementById("target-name").textContent =
    `#${String(target.baseDex).padStart(4, "0")} ${displayName(target)}`;

  const tagsEl = document.getElementById("target-tags");
  tagsEl.innerHTML = "";
  if (target.variant) {
    const tag = document.createElement("span");
    tag.className = `tag-badge ${target.variant === 4 ? "tag-primal" : "tag-mega"}`;
    tag.textContent = target.variant === 4 ? "Primal" : "Mega-evolutie";
    tagsEl.appendChild(tag);
  }
  if (target.rarity) {
    const tag = document.createElement("span");
    tag.className = `tag-badge ${target.rarity === 2 ? "tag-mythical" : "tag-legendary"}`;
    tag.textContent = RARITY_LABEL[target.rarity];
    tagsEl.appendChild(tag);
  }

  const typesEl = document.getElementById("target-types");
  typesEl.innerHTML = "";
  target.types.forEach((t) => typesEl.appendChild(typeBadge(t)));

  document.getElementById("target-stats").innerHTML =
    statRow("HP", target.hp) +
    statRow("Aanval", target.atk) +
    statRow("Verdediging", target.def) +
    statRow("Sp. aanval", target.spa) +
    statRow("Sp. verd.", target.spd) +
    statRow("Snelheid", target.spe);

  const abilityNames = target.abilities.map((i) => titleCase(ABILITIES[i])).join(", ") || "Onbekend";
  document.getElementById("info-panel").innerHTML = `
    <div class="info-row"><span>Categorie</span><b>${target.genus || "Onbekend"}</b></div>
    <div class="info-row"><span>Lengte</span><b>${(target.height / 10).toFixed(1)} m</b></div>
    <div class="info-row"><span>Gewicht</span><b>${(target.weight / 10).toFixed(1)} kg</b></div>
    <div class="info-row"><span>Vaardigheden</span><b>${abilityNames}</b></div>
    ${target.flavor ? `<div class="info-flavor">“${target.flavor}”<span class="lang-note">Pokédex-tekst (Engels) — er bestaat geen officiële Nederlandse versie.</span></div>` : ""}
  `;

  const locEl = document.getElementById("location-list");
  locEl.innerHTML = "";
  if (target.variant) {
    const base = byId.get(target.baseDex);
    const baseName = base ? displayName(poke(base)) : "de basisvorm";
    const msg = target.variant === 4
      ? `Dit is een Primal-vorm. Vang eerst een gewone ${baseName} en laat deze tijdens gevecht Primal Reversion ondergaan met de bijbehorende Rode/Blauwe Oerdiamant.`
      : `Dit is een Mega-evolutie. Vang eerst een gewone ${baseName} en laat deze tijdens gevecht Mega-evolueren met de bijbehorende Mega Steen.`;
    locEl.innerHTML = `<div class="empty-msg">${msg}</div>`;
  } else if (target.locations.length > 0) {
    target.locations.forEach((li) => {
      const chip = document.createElement("span");
      chip.className = "location-chip";
      chip.textContent = prettyLocation(LOCATIONS[li]);
      locEl.appendChild(chip);
    });
  } else if (target.evolvesFrom != null) {
    const base = byId.get(target.evolvesFrom);
    const baseName = base ? displayName(poke(base)) : "een eerdere vorm";
    locEl.innerHTML = `<div class="empty-msg">Niet rechtstreeks vangbaar — verkrijgbaar door ${baseName} te laten evolueren.</div>`;
  } else {
    locEl.innerHTML = `<div class="empty-msg">Niet vangbaar in het wild — mogelijk verkrijgbaar via eieren, ruilen of speciale ontmoetingen.</div>`;
  }

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
      img.src = spriteUrl(cand.id);
      img.onerror = function () { this.onerror = null; this.src = spriteFallback(cand.id); };
      card.appendChild(img);

      const info = document.createElement("div");
      const effLabel = off.mult >= 2 ? `<span style="color:var(--good)">×${off.mult} super effectief</span>`
                       : off.mult < 1 ? `<span style="color:var(--bad)">×${off.mult}</span>`
                       : `×${off.mult}`;
      const incLabel = inc
        ? (inc.mult >= 2 ? `<span style="color:var(--bad)">×${inc.mult} terug</span>` : `×${inc.mult} terug`)
        : "geen effect terug";
      const variantTag = cand.variant
        ? `<span class="tag-badge ${cand.variant === 4 ? "tag-primal" : "tag-mega"}" style="font-size:0.65rem;padding:2px 8px;margin-left:6px;">${cand.variant === 4 ? "Primal" : "Mega"}</span>`
        : "";

      info.innerHTML = `
        <div class="counter-rank">#${idx + 1}</div>
        <div class="counter-name">${displayName(cand)}${variantTag}</div>
        <div class="type-badges"></div>
        <div class="counter-move">🗡️ <b>${titleCase(off.name)}</b> (${TYPE_LABEL(off.type)}, ${effLabel})</div>
        <div class="counter-reason">Ontvangt ${incLabel} van ${displayName(target)}</div>
      `;
      info.querySelector(".type-badges").append(...cand.types.map(typeBadge));
      card.appendChild(info);
      card.addEventListener("click", () => showDetail(cand.id));
      counterList.appendChild(card);
    });
  }
}

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
