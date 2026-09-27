export function getKannadaVoices(voices) {
  return voices.filter(voice => /^kn(?:[-_]|$)/i.test(voice.lang))
    .sort((a, b) => Number(/^kn[-_]in$/i.test(b.lang)) - Number(/^kn[-_]in$/i.test(a.lang)));
}

export function createSpeechController(synth, Utterance, report = () => {}) {
  let generation = 0;
  let active = null;
  let timer;
  const supported = Boolean(synth && Utterance);
  function stop(announce = true) {
    generation++;
    clearTimeout(timer);
    active = null;
    if (supported) synth.cancel();
    if (announce) report({ state: "idle", message: "Audio stopped." });
  }
  function speak(text, voice, rate, id) {
    stop(false);
    if (!supported || !voice || !getKannadaVoices([voice]).length) {
      report({ state: "error", message: "A Kannada voice is required to play this phrase." });
      return false;
    }
    if (![0.6, 0.8, 1].includes(rate)) throw new RangeError("Unsupported speech rate");
    const token = generation;
    const utterance = new Utterance(text);
    active = utterance;
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = rate;
    const finish = (state, message) => {
      if (token !== generation) return;
      clearTimeout(timer);
      active = null;
      report({ state, message, id });
    };
    utterance.onstart = () => {
      if (token !== generation) return;
      clearTimeout(timer);
      report({ state: "playing", message: "Playing. Listen, then repeat.", id });
      timer = setTimeout(() => {
        if (token !== generation) return;
        stop(false);
        report({ state: "error", message: "Playback took too long. Try playing the phrase again.", id });
      }, 45000);
    };
    utterance.onend = () => finish("idle", "Finished. Replay or try another speed.");
    utterance.onerror = event => finish("error", "Audio could not play (" + event.error + "). Try again or choose another Kannada voice.");
    report({ state: "loading", message: "Starting audio…", id });
    timer = setTimeout(() => {
      if (token !== generation) return;
      stop(false);
      report({ state: "error", message: "The voice did not start. Try another Kannada voice or browser.", id });
    }, 10000);
    try { synth.speak(active); }
    catch { finish("error", "Audio could not start. Try another Kannada voice or browser."); return false; }
    return true;
  }
  return { supported, speak, stop };
}
