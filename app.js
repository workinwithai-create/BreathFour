const CDN = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@main/public/samples";
const STEPS = 16;
const CHORUS = 4;
const BREATH = 4;
const VERSE = 4;
const TOTAL = CHORUS + BREATH + VERSE;
const recipes = [
  { id: "kick-hole", name: "Kick hole", blurb: "Kick leaves bars 5–7. Snare stays on 2 and 4." },
  { id: "bass-out", name: "Bass out", blurb: "Upright drops. Piano holds the chord." },
  { id: "tom-break", name: "Tom break", blurb: "Low piano as toms down bars 7–8." },
  { id: "nylon-answer", name: "Nylon answer", blurb: "Nylon answers the chorus line, then yields." },
  { id: "trumpet-call", name: "Trumpet call", blurb: "Trumpet states the answer on bar 6." },
  { id: "hat-only", name: "Hat only", blurb: "Kit is hats. No kick, no snare, until verse." },
  { id: "stop-four", name: "Stop on 4", blurb: "Bar 8 is air until beat 4." },
  { id: "violin-hold", name: "Violin hold", blurb: "Violin holds the 5th through the breath." },
  { id: "crash-air", name: "Crash then air", blurb: "One crash on bar 5. Then almost nothing." },
  { id: "clap-pocket", name: "Clap pocket", blurb: "Soft snare on the and of 2 and 4. Human pocket." }
];
function bar(symbol, piano, guitar, bass) { return { symbol, piano, guitar, bass }; }
const grooves = [
  { id: "amber", name: "Amber Breath", bpm: 96, key: "A minor",
    chorus: [bar("Am", [45, 48, 52, 57], [45, 52, 57], 33), bar("F", [41, 45, 48, 53], [41, 48, 53], 41), bar("C", [48, 52, 55, 60], [48, 52, 55], 36), bar("G", [43, 47, 50, 55], [43, 47, 50], 31)],
    breath: [bar("Am", [45, 48, 52, 57], [45, 52, 57], 33), bar("Am", [45, 48, 52, 57], [45, 52, 57], 33), bar("F", [41, 45, 48, 53], [41, 48, 53], 41), bar("E", [40, 44, 47, 52], [40, 47, 52], 28)],
    verse: [bar("Am", [45, 48, 52, 57], [45, 52, 57], 33), bar("F", [41, 45, 48, 53], [41, 48, 53], 41), bar("C", [48, 52, 55, 60], [48, 52, 55], 36), bar("G", [43, 47, 50, 55], [43, 47, 50], 31)] },
  { id: "porch", name: "Porch Air", bpm: 84, key: "E major",
    chorus: [bar("E", [40, 44, 47, 52], [40, 47, 52], 28), bar("B", [35, 39, 42, 47], [35, 42, 47], 23), bar("C#m", [44, 47, 51, 56], [44, 51, 56], 32), bar("A", [33, 37, 40, 45], [33, 40, 45], 33)],
    breath: [bar("E", [40, 44, 47, 52], [40, 47, 52], 28), bar("E", [40, 44, 47, 52], [40, 47, 52], 28), bar("A", [33, 37, 40, 45], [33, 40, 45], 33), bar("B", [35, 39, 42, 47], [35, 42, 47], 23)],
    verse: [bar("E", [40, 44, 47, 52], [40, 47, 52], 28), bar("A", [33, 37, 40, 45], [33, 40, 45], 33), bar("C#m", [44, 47, 51, 56], [44, 51, 56], 32), bar("B", [35, 39, 42, 47], [35, 42, 47], 23)] },
  { id: "fold", name: "Fold Radio", bpm: 108, key: "D minor",
    chorus: [bar("Dm", [38, 41, 45, 50], [38, 45, 50], 26), bar("Bb", [34, 38, 41, 46], [34, 41, 46], 34), bar("F", [41, 45, 48, 53], [41, 48, 53], 29), bar("C", [36, 40, 43, 48], [36, 43, 48], 24)],
    breath: [bar("Dm", [38, 41, 45, 50], [38, 45, 50], 26), bar("Dm", [38, 41, 45, 50], [38, 45, 50], 26), bar("Bb", [34, 38, 41, 46], [34, 41, 46], 34), bar("A", [33, 37, 40, 45], [33, 40, 45], 33)],
    verse: [bar("Dm", [38, 41, 45, 50], [38, 45, 50], 26), bar("Bb", [34, 38, 41, 46], [34, 41, 46], 34), bar("F", [41, 45, 48, 53], [41, 48, 53], 29), bar("C", [36, 40, 43, 48], [36, 43, 48], 24)] }
];
const state = { groove: grooves[0], recipe: recipes[0], playing: false, bar: 0, mode: null };
let ctx, bus, buffers = {};
async function load() {
  ctx = new AudioContext();
  bus = ctx.createGain();
  bus.gain.value = 0.35;
  bus.connect(ctx.destination);
  const files = [
    ["kick", `${CDN}/drums/kick.mp3`], ["snare", `${CDN}/drums/snare.mp3`], ["hat", `${CDN}/drums/hihat.mp3`], ["crash", `${CDN}/drums/crash.mp3`],
    ["pC3", `${CDN}/piano/C3.mp3`], ["pC4", `${CDN}/piano/C4.mp3`], ["pA3", `${CDN}/piano/A3.mp3`],
    ["bE1", `${CDN}/bass/E1.mp3`], ["bA1", `${CDN}/bass/A1.mp3`], ["bC2", `${CDN}/bass/C2.mp3`],
    ["gE2", `${CDN}/guitar/E2.mp3`], ["gA2", `${CDN}/guitar/A2.mp3`], ["gE3", `${CDN}/guitar/E3.mp3`],
    ["tC4", `${CDN}/trumpet/C4.mp3`], ["vA3", `${CDN}/violin/A3.mp3`]
  ];
  let n = 0;
  for (const [k, url] of files) {
    try { const r = await fetch(url); buffers[k] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn(k, e); }
    n++;
    document.getElementById("status").textContent = `Seating chairs ${n}/${files.length}`;
  }
  document.getElementById("status").textContent = "Chairs seated · live FluidR3 + kit";
}
function playBuf(name, when, rate = 1, gain = 0.4) {
  const b = buffers[name];
  if (!b || !ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = b;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start(when);
}
function rateFromMidi(midi, baseMidi) { return Math.pow(2, (midi - baseMidi) / 12); }
function chordAt(i) {
  if (i < CHORUS) return state.groove.chorus[i];
  if (i < CHORUS + BREATH) return state.groove.breath[i - CHORUS];
  return state.groove.verse[i - CHORUS - BREATH];
}
function zone(i) { if (i < CHORUS) return "chorus"; if (i < CHORUS + BREATH) return "breath"; return "verse"; }
function scheduleBar(barIndex, t0, stepDur) {
  const ch = chordAt(barIndex);
  const z = zone(barIndex);
  const rec = state.recipe.id;
  const onBreath = z === "breath";
  const onVerse = z === "verse";
  const onChorus = z === "chorus";
  for (let s = 0; s < STEPS; s++) {
    const when = t0 + s * stepDur;
    const stopAir = onBreath && rec === "stop-four" && barIndex === 7 && s < 12;
    if (stopAir) continue;
    const hatOnly = onBreath && rec === "hat-only";
    const kickHole = onBreath && rec === "kick-hole" && barIndex < 7;
    if (s % 2 === 0) playBuf("hat", when, 1, onBreath ? 0.05 : 0.07);
    if (s === 0 && !hatOnly && !kickHole) playBuf("kick", when, 1, onVerse ? 0.5 : 0.7);
    if (s === 8 && !hatOnly) playBuf("snare", when, 1, onBreath ? 0.28 : 0.45);
    if (onBreath && rec === "clap-pocket" && (s === 6 || s === 14)) playBuf("snare", when, 1.08, 0.16);
    if (onBreath && rec === "tom-break" && barIndex >= 6 && (s === 10 || s === 12 || s === 14)) {
      playBuf("pC3", when, rateFromMidi(ch.piano[0] || 48, 48), 0.32);
    }
    if (s === 0) {
      const pianoGain = onBreath && (rec === "bass-out" || rec === "crash-air") ? 0.18 : onChorus ? 0.3 : 0.2;
      if (!(onBreath && rec === "crash-air" && barIndex > 4)) {
        playBuf("pC4", when, rateFromMidi(ch.piano[2] || 60, 60), pianoGain);
        playBuf("pA3", when, rateFromMidi(ch.piano[1] || 57, 57), pianoGain * 0.7);
      }
      const bassOut = onBreath && (rec === "bass-out" || rec === "hat-only" || rec === "crash-air");
      if (!bassOut) playBuf("bA1", when, rateFromMidi(ch.bass, 33), onVerse ? 0.32 : 0.45);
      if (!(onBreath && rec === "hat-only")) {
        playBuf("gA2", when, rateFromMidi(ch.guitar[0] || 45, 45), onBreath && rec === "nylon-answer" ? 0.12 : onChorus ? 0.22 : 0.14);
      }
    }
    if (onBreath && rec === "nylon-answer" && (s === 4 || s === 10)) {
      playBuf("gE3", when, rateFromMidi((ch.guitar[2] || 57) + (s === 10 ? 2 : 0), 52), 0.3);
    }
    if (onBreath && rec === "trumpet-call" && barIndex === 5 && (s === 0 || s === 6 || s === 10)) {
      playBuf("tC4", when, rateFromMidi(ch.piano[s === 10 ? 3 : 2] || 64, 60), 0.34);
    }
    if (onBreath && rec === "violin-hold" && s === 0) {
      playBuf("vA3", when, rateFromMidi(ch.piano[2] || 64, 57), 0.22);
    }
    if (onBreath && rec === "crash-air" && barIndex === 4 && s === 0) playBuf("crash", when, 1, 0.28);
    if (onVerse && barIndex === 8 && s === 0) playBuf("crash", when, 1, 0.14);
  }
}
let timer = null;
function stop() { state.playing = false; state.mode = null; if (timer) clearTimeout(timer); timer = null; paintBars(); }
async function play(mode) {
  if (!ctx) await load();
  if (ctx.state === "suspended") await ctx.resume();
  stop();
  state.playing = true;
  state.mode = mode;
  const startBar = mode === "eight" ? CHORUS : 0;
  const endBar = mode === "loop" ? CHORUS : TOTAL;
  const stepDur = 60 / state.groove.bpm / 4;
  let barIndex = startBar;
  const tick = () => {
    if (!state.playing) return;
    if (barIndex >= endBar) { if (mode === "loop") barIndex = startBar; else { stop(); return; } }
    state.bar = barIndex;
    paintBars();
    scheduleBar(barIndex, ctx.currentTime + 0.02, stepDur);
    barIndex += 1;
    timer = setTimeout(tick, STEPS * stepDur * 1000);
  };
  tick();
}
function punch() {
  const g = state.groove, r = state.recipe;
  return `BreathFour punch list
${g.name} · ${g.bpm} BPM · ${g.key} · ${r.name}

The problem: chorus one runs into verse two. No air. The song feels like one loop wearing two names.
The move: ${r.blurb}

Chorus (bars 1-4)
${g.chorus.map((b, i) => `  ${i + 1}. ${b.symbol}`).join("\n")}

Breath (bars 5-8) — ${r.name}
${g.breath.map((b, i) => `  ${i + 5}. ${b.symbol}`).join("\n")}

Verse re-entry (bars 9-12)
${g.verse.map((b, i) => `  ${i + 9}. ${b.symbol}`).join("\n")}

Live chairs only. Distinct from LiftTwo, ThinFour, FadeEight, TagFour, ModEight, PreEight, AfterHook, EndEight, LastHook.
Drop the WAV on bars 5-8. Do not paste chorus one into verse two.`;
}
function paintGrooves() {
  const el = document.getElementById("grooves");
  el.innerHTML = "";
  grooves.forEach(g => {
    const b = document.createElement("button");
    b.className = "card" + (state.groove.id === g.id ? " on" : "");
    b.innerHTML = `<b>${g.name}</b><span>${g.bpm} BPM · ${g.key}</span>`;
    b.onclick = () => { state.groove = g; render(); };
    el.appendChild(b);
  });
}
function paintRecipes() {
  const el = document.getElementById("recipes");
  el.innerHTML = "";
  recipes.forEach(r => {
    const b = document.createElement("button");
    b.className = "card" + (state.recipe.id === r.id ? " on" : "");
    b.innerHTML = `<b>${r.name}</b><span>${r.blurb}</span>`;
    b.onclick = () => { state.recipe = r; render(); };
    el.appendChild(b);
  });
}
function paintBars() {
  const el = document.getElementById("bars");
  el.innerHTML = "";
  for (let i = 0; i < TOTAL; i++) {
    const ch = chordAt(i);
    const z = zone(i);
    const d = document.createElement("div");
    d.className = "bar " + z + (state.playing && state.bar === i ? " active" : "");
    const label = z === "chorus" ? "C" : z === "breath" ? "B" : "V";
    d.innerHTML = `<div class="n">${i + 1} · ${label}</div><div class="c">${ch.symbol}</div>`;
    el.appendChild(d);
  }
}
function render() { paintGrooves(); paintRecipes(); paintBars(); document.getElementById("punch").textContent = punch(); }
document.getElementById("playA").onclick = () => play("loop");
document.getElementById("playB").onclick = () => play("cut");
document.getElementById("play8").onclick = () => play("eight");
document.getElementById("stop").onclick = stop;
document.getElementById("copy").onclick = () => navigator.clipboard.writeText(punch());
render();
load();
