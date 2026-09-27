export function createRecordedController(makeAudio, report) {
  let active = null, generation = 0, timer;
  function stop(announce = true) {
    generation++;
    clearTimeout(timer);
    if (active) {
      active.onplaying = active.onended = active.onerror = null;
      active.pause();
      active.removeAttribute("src");
      active.load();
      active = null;
    }
    if (announce) report({ state: "idle", message: "Audio stopped." });
  }
  async function play(url, rate, id) {
    stop(false);
    const token = generation;
    const audio = makeAudio();
    active = audio;
    const current = () => token === generation;
    const failed = () => {
      if (!current()) return;
      stop(false);
      report({state:"error", message:"Audio could not play. Check your connection and try again.", id});
    };
    audio.src = url;
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.onplaying = () => {
      if (!current()) return;
      clearTimeout(timer);
      report({state:"playing",message:"Playing saved Kannada audio. Listen, then repeat.",id});
    };
    audio.onended = () => {
      if (!current()) return;
      stop(false);
      report({state:"idle",message:"Finished. Replay or try another speed.",id});
    };
    audio.onerror = failed;
    report({state:"loading",message:"Loading Kannada audio…",id});
    timer = setTimeout(failed, 15000);
    try { await audio.play(); } catch { failed(); }
  }
  return {play, stop};
}