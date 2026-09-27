import { createRecordedController } from "./recorded.mjs";
import { phrases } from "./phrases.mjs";
import { getKannadaVoices, createSpeechController } from "./speech.mjs";

const voiceSelect = document.querySelector("#voice");
const rateSelect = document.querySelector("#rate");
const stopButton = document.querySelector("#stop");
const voiceStatus = document.querySelector("#voice-status");
const playbackStatus = document.querySelector("#playback-status");
const synth = window.speechSynthesis;
let voices = [];
let preferredVoice = "recorded";
try { preferredVoice = localStorage.getItem("kannada-prototype-voice") || "recorded"; } catch {}
function report(event) {
  playbackStatus.textContent = event.message;
  const busy = event.state === "loading" || event.state === "playing";
  stopButton.disabled = !busy;
  document.querySelectorAll(".phrase").forEach(card => {
    card.classList.toggle("playing", busy && card.dataset.id === event.id);
  });
}
const controller = createSpeechController(synth, window.SpeechSynthesisUtterance, report);
const recordings = createRecordedController(() => new Audio(), report);
function stopAll(announce = true) { controller.stop(false); recordings.stop(announce); }
const phraseList = document.querySelector("#phrases");
phrases.forEach((phrase, index) => {
  const card = document.createElement("article");
  card.className = "phrase";
  card.dataset.id = phrase.id;
  // Content is authored locally; use textContent so future data stays inert.
  const number = document.createElement("span");
  number.className = "number";
  number.textContent = String(index + 1).padStart(2, "0");
  const copy = document.createElement("div");
  const kannada = document.createElement("h3");
  kannada.lang = "kn";
  kannada.textContent = phrase.kannada;
  const roman = document.createElement("p");
  roman.className = "romanized";
  roman.textContent = phrase.romanized;
  const english = document.createElement("p");
  english.className = "meaning";
  english.textContent = phrase.english;
  const context = document.createElement("p");
  context.className = "hint";
  context.textContent = phrase.context;
  copy.append(kannada, roman, english, context);
  const play = document.createElement("button");
  play.className = "play";
  play.textContent = "▶ Listen";
  play.setAttribute("aria-label", "Listen: " + phrase.english);
  play.disabled = true;
  play.addEventListener("click", () => {
    stopAll(false);
    if (voiceSelect.value === "recorded") {
      recordings.play(new URL("./audio/" + phrase.id + ".mp3", import.meta.url).href, Number(rateSelect.value), phrase.id);
    } else {
      const voice = voices.find(item => item.voiceURI === voiceSelect.value);
      controller.speak(phrase.kannada, voice, Number(rateSelect.value), phrase.id);
    }
  });
  card.append(number, copy, play);
  phraseList.append(card);
});
function refreshVoices() {
  const previous = voiceSelect.value || preferredVoice;
  try { voices = controller.supported ? getKannadaVoices(synth.getVoices()) : []; }
  catch { voices = []; }
  voiceSelect.replaceChildren(new Option("Sapna · Saved Kannada audio", "recorded"));
  voices.forEach(voice => voiceSelect.add(new Option(voice.name + " · Browser voice", voice.voiceURI)));
  voiceSelect.value = voices.some(v => v.voiceURI === previous) ? previous : "recorded";
  if (previous !== voiceSelect.value) stopAll();
  voiceStatus.textContent = voices.length
    ? "Saved Kannada audio is ready. You can also compare " + voices.length + " browser voice(s)."
    : "Saved Kannada audio is ready. No installed voice is needed.";
  voiceSelect.disabled = false;
  document.querySelectorAll(".play").forEach(button => { button.disabled = false; });
}
voiceSelect.addEventListener("change", () => {
  stopAll();
  preferredVoice = voiceSelect.value;
  try { localStorage.setItem("kannada-prototype-voice", preferredVoice); } catch {}
});
rateSelect.addEventListener("change", () => {
  stopAll();
  playbackStatus.textContent = "Speed changed. Play a phrase to hear it.";
});
stopButton.addEventListener("click", () => stopAll());
document.querySelector("#refresh").addEventListener("click", refreshVoices);
if (controller.supported) synth.addEventListener("voiceschanged", refreshVoices);
window.addEventListener("pagehide", () => stopAll(false));
refreshVoices();