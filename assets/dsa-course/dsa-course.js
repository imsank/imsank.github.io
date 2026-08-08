(function () {
  var toggle = document.querySelector("[data-course-menu-toggle]");
  var close = document.querySelector("[data-course-menu-close]");
  var sidebar = document.querySelector("[data-course-sidebar]");
  var backdrop = document.querySelector("[data-course-backdrop]");

  if (!toggle || !sidebar || !backdrop) return;

  function setOpen(open) {
    sidebar.classList.toggle("is-open", open);
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("course-menu-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  if (close) close.addEventListener("click", function () { setOpen(false); });
  backdrop.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 960) setOpen(false);
  });
})();

(function () {
  "use strict";

  var calloutTypes = [
    ["Evolution trigger", "evolution"],
    ["Failure boundary", "failure"],
    ["Overkill warning", "overkill"],
    ["Production connection", "production"],
    ["Implementation note", "implementation"]
  ];

  document.querySelectorAll(".course-reading blockquote").forEach(function (quote) {
    var strong = quote.querySelector("strong");
    if (!strong) return;
    quote.classList.add("course-callout");
    var label = strong.textContent || "";
    calloutTypes.forEach(function (entry) {
      if (label.indexOf(entry[0]) === 0) quote.classList.add("course-callout--" + entry[1]);
    });
  });

  var root = document.querySelector("[data-dsa-graph-lab]");
  if (!root) return;

  var controls = {};
  root.querySelectorAll("[data-dsa-control]").forEach(function (control) {
    controls[control.getAttribute("data-dsa-control")] = control;
  });

  var actions = {};
  root.querySelectorAll("[data-dsa-action]").forEach(function (button) {
    actions[button.getAttribute("data-dsa-action")] = button;
  });

  var output = {
    result: root.querySelector("[data-dsa-result]"),
    current: root.querySelector("[data-dsa-current]"),
    frontier: root.querySelector("[data-dsa-frontier]"),
    visited: root.querySelector("[data-dsa-visited]"),
    work: root.querySelector("[data-dsa-work]"),
    caption: root.querySelector("[data-dsa-caption]"),
    progress: root.querySelector("[data-dsa-progress]"),
    invariant: root.querySelector("[data-dsa-invariant]"),
    explanation: root.querySelector("[data-dsa-explanation]")
  };

  var canvas = root.querySelector("[data-dsa-canvas]");
  var context = canvas.getContext("2d");
  var steps = [];
  var stepIndex = -1;
  var timer = null;

  var scenarios = {
    base: {
      start: "0",
      nodes: [
        { id: "0", x: 105, y: 190 }, { id: "1", x: 270, y: 85 },
        { id: "2", x: 270, y: 295 }, { id: "3", x: 435, y: 190 },
        { id: "4", x: 590, y: 190 }, { id: "5", x: 625, y: 65 },
        { id: "6", x: 715, y: 65 }
      ],
      edges: [
        ["0", "1", false], ["0", "2", false], ["1", "3", false],
        ["2", "3", false], ["3", "4", false], ["5", "6", false]
      ]
    },
    override: {
      start: "S",
      target: "T",
      nodes: [
        { id: "S", x: 90, y: 200 }, { id: "A", x: 245, y: 95 },
        { id: "B", x: 245, y: 305 }, { id: "X", x: 455, y: 200 },
        { id: "T", x: 665, y: 200 }
      ],
      edges: [
        ["S", "B", false], ["S", "A", false], ["A", "X", true],
        ["B", "X", false], ["X", "T", true]
      ]
    }
  };

  function stateLabel(state) {
    if (controls.scenario.value === "override") {
      return state.node + "·" + (state.override ? "token" : "spent");
    }
    return state.node;
  }

  function stateKey(state) {
    if (controls.scenario.value === "override" && controls["state-key"].value === "expanded") {
      return state.node + "|" + (state.override ? "1" : "0");
    }
    return state.node;
  }

  function neighbors(graph, state) {
    var result = [];
    graph.edges.forEach(function (edge) {
      var next = null;
      if (edge[0] === state.node) next = edge[1];
      if (edge[1] === state.node) next = edge[0];
      if (next == null) return;
      if (edge[2] && !state.override) return;
      result.push({ node: next, override: edge[2] ? false : state.override, locked: edge[2] });
    });
    return result;
  }

  function snapshot(message, current, frontier, seen, edgeChecks, duplicates) {
    return {
      message: message,
      current: current ? { node: current.node, override: current.override } : null,
      frontier: frontier.map(function (state) { return { node: state.node, override: state.override }; }),
      seen: Array.from(seen),
      edgeChecks: edgeChecks,
      duplicates: duplicates
    };
  }

  function buildSteps() {
    stopPlaying();
    var graph = scenarios[controls.scenario.value];
    var frontier = [{ node: graph.start, override: true }];
    var seen = new Set();
    var timing = controls.timing.value;
    var edgeChecks = 0;
    var duplicates = 0;
    var generated = [];

    if (timing === "discovery") seen.add(stateKey(frontier[0]));
    generated.push(snapshot("Discover the source and place it in the frontier.", null, frontier, seen, edgeChecks, duplicates));

    var guard = 0;
    while (frontier.length && guard < 100) {
      guard += 1;
      var current = controls.frontier.value === "queue" ? frontier.shift() : frontier.pop();
      var key = stateKey(current);

      if (timing === "removal" && seen.has(key)) {
        duplicates += 1;
        generated.push(snapshot("Remove " + stateLabel(current) + ", but skip it because that key was already processed.", current, frontier, seen, edgeChecks, duplicates));
        continue;
      }
      if (timing === "removal") seen.add(key);

      var added = [];
      var blocked = 0;
      scenarios[controls.scenario.value].edges.forEach(function (edge) {
        if (edge[0] === current.node || edge[1] === current.node) edgeChecks += 1;
      });

      neighbors(graph, current).forEach(function (next) {
        var nextKey = stateKey(next);
        if (seen.has(nextKey)) {
          duplicates += 1;
          return;
        }
        if (timing === "removal" && frontier.some(function (queued) { return stateKey(queued) === nextKey; })) {
          duplicates += 1;
        }
        if (timing === "discovery") seen.add(nextKey);
        frontier.push(next);
        added.push(stateLabel(next));
      });

      if (controls.scenario.value === "override" && !current.override) {
        graph.edges.forEach(function (edge) {
          if (edge[2] && (edge[0] === current.node || edge[1] === current.node)) blocked += 1;
        });
      }

      var message = "Process " + stateLabel(current) + ".";
      if (added.length) message += " Schedule " + added.join(", ") + ".";
      else message += " No new state is scheduled.";
      if (blocked) message += " A locked edge is unavailable because the override was already spent.";
      generated.push(snapshot(message, current, frontier, seen, edgeChecks, duplicates));
    }

    steps = generated;
    stepIndex = -1;
  }

  function palette() {
    var dark = document.documentElement.dataset.theme === "dark";
    return {
      text: dark ? "#f1f5f9" : "#172033",
      muted: dark ? "#94a3b8" : "#64748b",
      edge: dark ? "#526176" : "#b4becb",
      panel: dark ? "#20283a" : "#ffffff",
      discovered: dark ? "#60a5fa" : "#2563eb",
      frontier: dark ? "#c4b5fd" : "#7c3aed",
      current: dark ? "#fbbf24" : "#d97706",
      locked: dark ? "#fb7185" : "#be123c"
    };
  }

  function visitedNodes(step) {
    var nodes = new Set();
    step.seen.forEach(function (key) { nodes.add(String(key).split("|")[0]); });
    return nodes;
  }

  function draw() {
    var graph = scenarios[controls.scenario.value];
    var step = stepIndex >= 0 ? steps[stepIndex] : { seen: [], frontier: [], current: null };
    var colors = palette();
    var ratio = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || 760;
    var height = width * 400 / 760;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio * width / 760, 0, 0, ratio * height / 400, 0, 0);
    context.clearRect(0, 0, 760, 400);

    graph.edges.forEach(function (edge) {
      var a = graph.nodes.find(function (node) { return node.id === edge[0]; });
      var b = graph.nodes.find(function (node) { return node.id === edge[1]; });
      context.save();
      context.strokeStyle = edge[2] ? colors.locked : colors.edge;
      context.lineWidth = edge[2] ? 4 : 3;
      if (edge[2]) context.setLineDash([9, 8]);
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      if (edge[2]) {
        context.fillStyle = colors.locked;
        context.font = "700 13px Inter, sans-serif";
        context.textAlign = "center";
        context.fillText("LOCKED", (a.x + b.x) / 2, (a.y + b.y) / 2 - 10);
      }
      context.restore();
    });

    var seen = visitedNodes(step);
    var frontierNodes = new Set(step.frontier.map(function (state) { return state.node; }));
    graph.nodes.forEach(function (node) {
      var fill = colors.panel;
      if (seen.has(node.id)) fill = colors.discovered;
      if (frontierNodes.has(node.id)) fill = colors.frontier;
      if (step.current && step.current.node === node.id) fill = colors.current;
      context.beginPath(); context.arc(node.x, node.y, 28, 0, Math.PI * 2);
      context.fillStyle = fill; context.fill();
      context.strokeStyle = colors.text; context.lineWidth = 2; context.stroke();
      context.fillStyle = (seen.has(node.id) || frontierNodes.has(node.id) || (step.current && step.current.node === node.id)) ? "#ffffff" : colors.text;
      context.font = "700 16px Inter, sans-serif"; context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText(node.id, node.x, node.y);
    });

    context.fillStyle = colors.muted;
    context.font = "600 12px Inter, sans-serif";
    context.textAlign = "left";
    context.fillText("discovered", 20, 374);
    context.fillStyle = colors.discovered; context.fillRect(92, 364, 14, 14);
    context.fillStyle = colors.muted; context.fillText("frontier", 125, 374);
    context.fillStyle = colors.frontier; context.fillRect(177, 364, 14, 14);
    context.fillStyle = colors.muted; context.fillText("current", 210, 374);
    context.fillStyle = colors.current; context.fillRect(260, 364, 14, 14);
  }

  function render() {
    var hasStep = stepIndex >= 0;
    var step = hasStep ? steps[stepIndex] : null;
    var graph = scenarios[controls.scenario.value];
    var finished = hasStep && stepIndex === steps.length - 1;

    output.current.textContent = step && step.current ? stateLabel(step.current) : "Not started";
    output.frontier.textContent = step ? "[" + step.frontier.map(stateLabel).join(", ") + "]" : "[]";
    output.visited.textContent = step ? "{" + step.seen.join(", ") + "}" : "{}";
    output.work.textContent = step ? step.edgeChecks + " edge checks · " + step.duplicates + " duplicate attempts" : "0 edge checks · 0 duplicates";
    output.progress.textContent = "Step " + (hasStep ? stepIndex + 1 : 0) + " of " + steps.length;
    output.explanation.textContent = step ? step.message : "Press Start to discover the source state.";
    output.invariant.textContent = controls.timing.value === "discovery"
      ? "Visited means discovered and scheduled."
      : "Visited means removed and processed; duplicate scheduling is possible.";

    output.caption.textContent = controls.scenario.value === "base"
      ? "Undirected links; start at station 0. Stack and queue orders reach the same five-station component."
      : "Locked edges consume one override. Compare node-only and expanded visited keys at X.";

    output.result.className = "dsa-lab__badge";
    if (!finished) output.result.textContent = hasStep ? "Running" : "Ready";
    if (finished && controls.scenario.value === "base") {
      output.result.textContent = "5 stations reached"; output.result.classList.add("is-success");
    }
    if (finished && controls.scenario.value === "override") {
      var reached = step.seen.some(function (key) { return String(key).split("|")[0] === graph.target; });
      var unsafe = controls["state-key"].value === "node";
      output.result.textContent = reached ? (unsafe ? "Target reached by order, key unsafe" : "Target reached safely") : "Target missed · state incomplete";
      output.result.classList.add(reached && !unsafe ? "is-success" : "is-failure");
    }

    actions.previous.disabled = !hasStep || stepIndex === 0;
    actions.next.disabled = finished;
    actions.next.textContent = !hasStep ? "Start" : "Next";
    draw();
  }

  function stopPlaying() {
    if (timer) window.clearInterval(timer);
    timer = null;
    if (actions.play) actions.play.textContent = "Play";
  }

  function reset() { buildSteps(); render(); }

  Object.keys(controls).forEach(function (name) {
    controls[name].addEventListener("change", function () {
      if (name === "scenario") {
        controls["state-key"].disabled = controls.scenario.value === "base";
        controls["state-key"].value = "node";
      }
      reset();
    });
  });

  actions.reset.addEventListener("click", reset);
  actions.previous.addEventListener("click", function () { stopPlaying(); if (stepIndex > 0) stepIndex -= 1; render(); });
  actions.next.addEventListener("click", function () { if (stepIndex < steps.length - 1) stepIndex += 1; render(); });
  actions.play.addEventListener("click", function () {
    if (timer) { stopPlaying(); return; }
    if (stepIndex === steps.length - 1) stepIndex = -1;
    actions.play.textContent = "Pause";
    var delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1400 : 850;
    timer = window.setInterval(function () {
      if (stepIndex < steps.length - 1) { stepIndex += 1; render(); }
      else stopPlaying();
    }, delay);
  });

  window.addEventListener("resize", draw);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  controls["state-key"].disabled = true;
  reset();
})();
