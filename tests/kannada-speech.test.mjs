import test from "node:test";
import assert from "node:assert/strict";
import { getKannadaVoices, createSpeechController } from "../hobby/learn-kannada/speech.mjs";
const kn = { lang: "kn-IN", voiceURI: "kannada" };
function setup() {
  const spoken = [], events = [];
  let cancelled = 0;
  const synth = { cancel() { cancelled++; }, speak(u) { spoken.push(u); } };
  class Utterance { constructor(text) { this.text = text; } }
  const controller = createSpeechController(synth, Utterance, e => events.push(e));
  return { controller, spoken, events, synth, get cancelled() { return cancelled; } };
}
test("select Kannada only, preferring kn-IN", () => {
  assert.deepEqual(getKannadaVoices([{lang:"en-IN"}, {lang:"kn"}, kn]), [kn, {lang:"kn"}]);
});
test("reject English and missing voices instead of using a default", () => {
  const s = setup();
  assert.equal(s.controller.speak("test", {lang:"en-IN"}, 0.8, "a"), false);
  assert.equal(s.controller.speak("test", null, 0.8, "a"), false);
  assert.equal(s.spoken.length, 0);
});
test("use explicit voice and all three rates", () => {
  const s = setup();
  for (const rate of [0.6, 0.8, 1]) {
    s.controller.speak("ನಮಸ್ಕಾರ", kn, rate, "a");
    assert.equal(s.spoken.at(-1).voice, kn);
    assert.equal(s.spoken.at(-1).lang, "kn-IN");
    assert.equal(s.spoken.at(-1).rate, rate);
  }
  s.controller.stop();
});
test("replacement cancels speech and ignores cancelled utterance callbacks", () => {
  const s = setup();
  s.controller.speak("first", kn, 0.8, "a");
  const first = s.spoken[0];
  s.controller.speak("second", kn, 0.8, "b");
  const count = s.events.length;
  first.onstart(); first.onend(); first.onerror({error:"interrupted"});
  assert.equal(s.events.length, count);
  assert.equal(s.cancelled, 2);
  s.controller.stop();
});
test("playback, completion, errors and stop report their state", () => {
  const s = setup();
  s.controller.speak("test", kn, 0.8, "a");
  s.spoken[0].onstart();
  assert.equal(s.events.at(-1).state, "playing");
  s.spoken[0].onend();
  assert.equal(s.events.at(-1).state, "idle");
  s.controller.speak("test", kn, 0.8, "a");
  s.spoken[1].onerror({error:"network"});
  assert.equal(s.events.at(-1).state, "error");
  s.controller.stop();
  assert.equal(s.events.at(-1).state, "idle");
});
test("unsupported browser and synchronous speech failures are graceful", () => {
  const absent = createSpeechController(null, null);
  assert.equal(absent.supported, false);
  assert.equal(absent.speak("test", kn, 0.8, "a"), false);
  const s = setup();
  s.synth.speak = () => { throw new Error("failure"); };
  assert.equal(s.controller.speak("test", kn, 0.8, "a"), false);
  assert.equal(s.events.at(-1).state, "error");
});
