(function () {
  "use strict";

  var layout = document.querySelector("[data-course-layout]");
  var menuToggle = document.querySelector("[data-course-menu-toggle]");
  var menuClose = document.querySelector("[data-course-menu-close]");
  var backdrop = document.querySelector("[data-course-backdrop]");

  function setMenu(open) {
    if (!layout || !menuToggle || !backdrop) return;
    layout.classList.toggle("is-menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;
    document.body.classList.toggle("course-menu-open", open);
    if (open && menuClose) menuClose.focus();
    if (!open) menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  if (menuClose) menuClose.addEventListener("click", function () { setMenu(false); });
  if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && layout && layout.classList.contains("is-menu-open")) {
      setMenu(false);
    }
  });

  var root = document.querySelector("[data-request-lifecycle]");
  if (root) {

  var steps = [
    {
      id: "receive",
      request: "Received · validating",
      input: "Chat API payload",
      cache: "0 positions",
      client: "Waiting",
      explanation: "The API layer parses the request, checks policy, assigns an ID, and records the deadline."
    },
    {
      id: "render",
      request: "Validated · rendering",
      input: "Messages → chat template",
      cache: "0 positions",
      client: "Waiting",
      explanation: "Structured roles and content become one model-specific sequence with control tokens."
    },
    {
      id: "tokenize",
      request: "Prepared",
      input: "8 prompt token IDs",
      cache: "0 positions",
      client: "Waiting",
      explanation: "The tokenizer converts the rendered prompt to IDs and the server validates the context budget."
    },
    {
      id: "queue",
      request: "Admitted · waiting",
      input: "8 prompt token IDs",
      cache: "0 positions reserved",
      client: "Waiting",
      explanation: "Admission succeeds. The request waits until the scheduler grants token and memory budget."
    },
    {
      id: "prefill",
      request: "Running prefill",
      input: "All 8 prompt tokens",
      cache: "8 prompt positions",
      client: "Waiting",
      explanation: "Prefill processes the prompt, writes its K/V state, and produces final-position logits."
    },
    {
      id: "sample",
      request: "First token selected",
      input: "Prefill logits",
      cache: "8 positions",
      client: "“Paris”",
      explanation: "The sampler selects “Paris.” The client may see it now, but Paris does not have cached K/V yet."
    },
    {
      id: "decode",
      request: "Running decode",
      input: "Latest token: “Paris”",
      cache: "9 positions",
      client: "“Paris”",
      explanation: "Decode feeds Paris, appends its K/V, and produces logits for the following token."
    },
    {
      id: "stream",
      request: "Decoded text available",
      input: "Selected token: “.”",
      cache: "9 positions",
      client: "“Paris.”",
      explanation: "Stable detokenized text is emitted. A transport chunk is not required to equal one model token."
    },
    {
      id: "eos",
      request: "Terminal token selected",
      input: "Selected token: <eos>",
      cache: "10 positions",
      client: "“Paris.”",
      explanation: "EOS completes generation. It does not need another model call, so its own K/V is unnecessary."
    },
    {
      id: "cleanup",
      request: "Finished · stop",
      input: "No more model work",
      cache: "0 positions · released",
      client: "Final response complete",
      explanation: "The server records usage and finish reason, closes the stream, removes scheduler state, and frees cache memory."
    }
  ];

  var state = -1;
  var sendButton = root.querySelector("[data-lifecycle-send]");
  var nextButton = root.querySelector("[data-lifecycle-next]");
  var cancelButton = root.querySelector("[data-lifecycle-cancel]");
  var resetButton = root.querySelector("[data-lifecycle-reset]");
  var requestValue = root.querySelector("[data-lifecycle-request]");
  var inputValue = root.querySelector("[data-lifecycle-input]");
  var cacheValue = root.querySelector("[data-lifecycle-cache]");
  var clientValue = root.querySelector("[data-lifecycle-client]");
  var explanation = root.querySelector("[data-lifecycle-explanation]");
  var live = root.querySelector("[data-lifecycle-live]");
  var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-lifecycle-node]"));

  function render() {
    nodes.forEach(function (node, index) {
      node.classList.toggle("is-complete", state >= 0 && index < state);
      node.classList.toggle("is-active", index === state);
    });

    if (state < 0) {
      requestValue.textContent = "Not sent";
      inputValue.textContent = "—";
      cacheValue.textContent = "0 positions";
      clientValue.textContent = "Nothing yet";
      explanation.textContent = "Press Send to create the request. The model has not received anything yet.";
      sendButton.disabled = false;
      nextButton.disabled = true;
      cancelButton.disabled = true;
      live.textContent = "Simulation reset.";
      return;
    }

    var step = steps[state];
    requestValue.textContent = step.request;
    inputValue.textContent = step.input;
    cacheValue.textContent = step.cache;
    clientValue.textContent = step.client;
    explanation.textContent = step.explanation;
    sendButton.disabled = true;
    nextButton.disabled = state >= steps.length - 1;
    cancelButton.disabled = state >= steps.length - 2;
    live.textContent = "Step " + (state + 1) + " of " + steps.length + ": " + step.id + ". " + step.explanation;
  }

  sendButton.addEventListener("click", function () {
    state = 0;
    render();
    nextButton.focus();
  });

  nextButton.addEventListener("click", function () {
    if (state < steps.length - 1) state += 1;
    render();
  });

  cancelButton.addEventListener("click", function () {
    var wasStreaming = state > 6;
    state = steps.length - 1;
    steps[state] = {
      id: "cleanup",
      request: "Cancelled · cleaned up",
      input: "No more model work",
      cache: "0 positions · released",
      client: wasStreaming ? "Partial response closed" : "Stream closed",
      explanation: "Cancellation propagates from the connection to request state, scheduler work, and KV-cache cleanup."
    };
    render();
  });

  resetButton.addEventListener("click", function () {
    state = -1;
    render();
    sendButton.focus();
  });

  render();
  }

  var tensorRoot = document.querySelector("[data-tensor-explorer]");
  if (tensorRoot) {
    var tensorInputs = {};
    Array.prototype.forEach.call(tensorRoot.querySelectorAll("[data-tensor-input]"), function (input) {
      tensorInputs[input.getAttribute("data-tensor-input")] = input;
    });

    var phaseInputs = Array.prototype.slice.call(tensorRoot.querySelectorAll("[data-tensor-phase]"));
    var validation = tensorRoot.querySelector("[data-tensor-validation]");
    var prefillTokens = Number(tensorInputs.newTokens.value);

    function numberValue(name) {
      return Number(tensorInputs[name].value);
    }

    function setText(selector, value) {
      var element = tensorRoot.querySelector(selector);
      if (element) element.textContent = value;
    }

    function shape(values) {
      return "[" + values.join(",") + "]";
    }

    function formatBytes(bytes) {
      var units = ["bytes", "KiB", "MiB", "GiB", "TiB"];
      var value = bytes;
      var unit = 0;
      while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
      }
      var digits = value >= 100 || unit === 0 ? 0 : value >= 10 ? 1 : 2;
      return value.toFixed(digits) + " " + units[unit];
    }

    function currentPhase() {
      var selected = phaseInputs.filter(function (input) { return input.checked; })[0];
      return selected ? selected.value : "prefill";
    }

    function renderTensorExplorer() {
      var phase = currentPhase();
      var batch = numberValue("batch");
      var newTokens = numberValue("newTokens");
      var cached = numberValue("cached");
      var layers = numberValue("layers");
      var queryHeads = numberValue("queryHeads");
      var kvHeads = numberValue("kvHeads");
      var headDim = numberValue("headDim");
      var bytesPerElement = numberValue("bytes");
      var hiddenDim = queryHeads * headDim;
      var total = cached + newTokens;
      var validGroups = queryHeads % kvHeads === 0;
      var groupSize = validGroups ? queryHeads / kvHeads : null;
      var kvPerToken = 2 * layers * kvHeads * headDim * bytesPerElement;
      var totalKv = batch * total * kvPerToken;

      setText('[data-tensor-output="newTokens"]', String(newTokens));
      setText('[data-tensor-output="cached"]', String(cached));
      setText('[data-tensor-output="layers"]', String(layers));
      setText('[data-tensor-shape="hidden"]', shape([batch, newTokens, hiddenDim]));
      setText('[data-tensor-shape="query"]', shape([batch, queryHeads, newTokens, headDim]));
      setText('[data-tensor-shape="newKv"]', shape([batch, kvHeads, newTokens, headDim]));
      setText('[data-tensor-shape="cache"]', shape([batch, kvHeads, total, headDim]));
      setText('[data-tensor-shape="scores"]', shape([batch, queryHeads, newTokens, total]));
      setText('[data-tensor-shape="output"]', shape([batch, newTokens, hiddenDim]));
      setText('[data-tensor-shape="memory"]', formatBytes(totalKv));
      setText('[data-tensor-cache-hint]', "T = " + cached + " + " + newTokens + " = " + total);
      setText('[data-tensor-metric="phase"]', (phase === "decode" ? "Decode" : "Prefill") + " · S = " + newTokens);
      setText('[data-tensor-metric="total"]', "T = " + total);
      setText('[data-tensor-metric="perToken"]', formatBytes(kvPerToken));
      setText('[data-tensor-metric="sharing"]', validGroups ? groupSize + " query head" + (groupSize === 1 ? "" : "s") + " / KV head" : "Invalid head grouping");

      var caption;
      if (phase === "decode") {
        caption = "Cached decode: one new query row reads " + total + " retained positions and appends one K/V position per layer.";
      } else if (cached > 0) {
        caption = "Chunked prefill: " + newTokens + " new query rows extend a cached prefix of " + cached + " positions.";
      } else {
        caption = "Fresh prefill: " + newTokens + " query rows establish " + total + " retained positions.";
      }
      setText('[data-tensor-caption]', caption);

      validation.classList.toggle("is-error", !validGroups);
      validation.textContent = validGroups
        ? "Valid GQA layout: Hq is divisible by Hkv. Hidden width D = " + queryHeads + " × " + headDim + " = " + hiddenDim + "."
        : "Invalid layout: query heads must be divisible by KV heads for this GQA mapping.";
    }

    phaseInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (!input.checked) return;
        if (input.value === "decode") {
          prefillTokens = Math.max(2, numberValue("newTokens"));
          tensorInputs.newTokens.value = "1";
          tensorInputs.newTokens.disabled = true;
          if (numberValue("cached") === 0) tensorInputs.cached.value = "128";
        } else {
          tensorInputs.newTokens.disabled = false;
          tensorInputs.newTokens.value = String(prefillTokens);
        }
        renderTensorExplorer();
      });
    });

    Object.keys(tensorInputs).forEach(function (name) {
      tensorInputs[name].addEventListener("input", renderTensorExplorer);
      tensorInputs[name].addEventListener("change", renderTensorExplorer);
    });

    renderTensorExplorer();
  }

  var performanceRoot = document.querySelector("[data-performance-lab]");
  if (performanceRoot) {
    var performanceInputs = {};
    Array.prototype.forEach.call(performanceRoot.querySelectorAll("[data-performance-input]"), function (input) {
      performanceInputs[input.getAttribute("data-performance-input")] = input;
    });

    var performanceModes = Array.prototype.slice.call(performanceRoot.querySelectorAll("[data-performance-mode]"));
    var performanceCurves = {
      throughput: performanceRoot.querySelector('[data-performance-curve="throughput"]'),
      latency: performanceRoot.querySelector('[data-performance-curve="latency"]')
    };
    var performancePoints = {
      throughput: performanceRoot.querySelector('[data-performance-point="throughput"]'),
      latency: performanceRoot.querySelector('[data-performance-point="latency"]')
    };
    var performanceHealth = performanceRoot.querySelector("[data-performance-health]");
    var performanceLive = performanceRoot.querySelector("[data-performance-live]");

    function performanceClamp(minimum, maximum, value) {
      return Math.max(minimum, Math.min(maximum, value));
    }

    function performanceValue(name) {
      return Number(performanceInputs[name].value);
    }

    function performanceMode() {
      var selected = performanceModes.filter(function (input) { return input.checked; })[0];
      return selected ? selected.value : "chat";
    }

    function performanceText(selector, value) {
      var node = performanceRoot.querySelector(selector);
      if (node) node.textContent = value;
    }

    function performanceMilliseconds(value) {
      return value >= 1000 ? (value / 1000).toFixed(value >= 10000 ? 1 : 2) + " s" : Math.round(value) + " ms";
    }

    function performanceNumber(value, digits) {
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: digits == null ? 0 : digits
      }).format(value);
    }

    function performanceModel(rate) {
      var concurrency = performanceValue("concurrency");
      var prompt = performanceValue("prompt");
      var output = performanceValue("output");
      var batchFactor = 0.5 + 0.5 * (1 - Math.exp(-concurrency / 18));
      var shapeFactor = Math.pow(1024 / prompt, 0.2) * Math.pow(128 / output, 0.08);
      var capacity = performanceClamp(7, 58, 44 * batchFactor * shapeFactor);
      var utilization = rate / capacity;
      var network = 55;
      var prefill = 70 + prompt * 0.16;
      var queue = utilization <= 0.55
        ? 12 * utilization
        : 8 + 240 * Math.pow((utilization - 0.55) / 0.45, 2);

      if (utilization > 1) {
        queue += 1200 * Math.pow(utilization - 1, 1.8);
      }

      var contextPenalty = 1.5 * Math.log(prompt / 128) / Math.log(2);
      var tpot = 15 + contextPenalty
        + 8 * Math.max(0, utilization - 0.3)
        + 40 * Math.pow(Math.max(0, utilization - 0.75), 1.6);
      var ttft = network + prefill + queue;
      var decode = (output - 1) * tpot;
      var e2e = ttft + decode;
      var degradation = utilization > 1 ? Math.max(0.82, 1 - 0.04 * (utilization - 1)) : 1;
      var completedRate = Math.min(rate, capacity * degradation);
      var outputThroughput = completedRate * output;
      var mode = performanceMode();
      var attainment;

      if (mode === "chat") {
        var ttftAttainment = ttft <= 1000 ? 1 : performanceClamp(0.05, 1, 1000 / ttft);
        var tpotAttainment = tpot <= 50 ? 1 : performanceClamp(0.05, 1, 50 / tpot);
        attainment = ttftAttainment * tpotAttainment;
      } else {
        attainment = e2e <= 30000 ? 1 : performanceClamp(0.05, 1, 30000 / e2e);
      }

      return {
        rate: rate,
        capacity: capacity,
        utilization: utilization,
        network: network,
        queue: queue,
        prefill: prefill,
        tpot: tpot,
        ttft: ttft,
        decode: decode,
        e2e: e2e,
        completedRate: completedRate,
        outputThroughput: outputThroughput,
        goodput: completedRate * attainment,
        withinSlo: attainment === 1
      };
    }

    function performancePath(points) {
      return points.map(function (point, index) {
        return (index === 0 ? "M" : "L") + point[0].toFixed(1) + " " + point[1].toFixed(1);
      }).join(" ");
    }

    function performancePosition(rate, metric, maxThroughput, maxLatency) {
      var left = 62;
      var top = 32;
      var width = 542;
      var height = 220;
      var x = left + (rate - 1) / 63 * width;
      var normalized = metric.outputThroughput === undefined
        ? Math.log1p(metric.ttft) / Math.log1p(maxLatency)
        : metric.outputThroughput / maxThroughput;
      var y = top + height - performanceClamp(0, 1, normalized) * height;
      return [x, y];
    }

    function renderPerformanceChart(current) {
      var samples = [];
      var index;
      for (index = 0; index < 25; index += 1) {
        var rate = 1 + index * 63 / 24;
        samples.push(performanceModel(rate));
      }

      var maxThroughput = Math.max.apply(null, samples.map(function (sample) { return sample.outputThroughput; })) * 1.05;
      var maxLatency = Math.max.apply(null, samples.map(function (sample) { return sample.ttft; })) * 1.05;
      var throughputPoints = samples.map(function (sample) {
        return performancePosition(sample.rate, { outputThroughput: sample.outputThroughput }, maxThroughput, maxLatency);
      });
      var latencyPoints = samples.map(function (sample) {
        return performancePosition(sample.rate, { ttft: sample.ttft }, maxThroughput, maxLatency);
      });

      performanceCurves.throughput.setAttribute("d", performancePath(throughputPoints));
      performanceCurves.latency.setAttribute("d", performancePath(latencyPoints));

      var currentRate = performanceClamp(1, 64, current.rate);
      var throughputPoint = performancePosition(currentRate, { outputThroughput: current.outputThroughput }, maxThroughput, maxLatency);
      var latencyPoint = performancePosition(currentRate, { ttft: current.ttft }, maxThroughput, maxLatency);

      performancePoints.throughput.setAttribute("cx", throughputPoint[0]);
      performancePoints.throughput.setAttribute("cy", throughputPoint[1]);
      performancePoints.latency.setAttribute("cx", latencyPoint[0]);
      performancePoints.latency.setAttribute("cy", latencyPoint[1]);

      var kneeRate = performanceClamp(1, 64, current.capacity * 0.82);
      var kneeX = 62 + (kneeRate - 1) / 63 * 542;
      var knee = performanceRoot.querySelector("[data-performance-knee]");
      var kneeLabel = performanceRoot.querySelector("[data-performance-knee-label]");
      knee.setAttribute("x1", kneeX);
      knee.setAttribute("x2", kneeX);
      kneeLabel.setAttribute("x", kneeX);

      var relationship = current.utilization < 0.7
        ? "There is headroom: added load still converts mostly into completed work."
        : current.utilization < 1
          ? "You are approaching the knee: throughput gains are shrinking while queueing accelerates."
          : "Offered load exceeds modeled capacity: the queue grows while completed throughput is capped.";
      performanceText("[data-performance-chart-summary]", relationship + " Estimated knee: " + performanceNumber(kneeRate, 1) + " req/s.");
    }

    function renderPerformanceLab() {
      var concurrency = performanceValue("concurrency");
      var arrival = performanceValue("arrival");
      var prompt = performanceValue("prompt");
      var output = performanceValue("output");
      var mode = performanceMode();
      var metric = performanceModel(arrival);

      performanceText('[data-performance-output="concurrency"]', String(concurrency));
      performanceText('[data-performance-output="arrival"]', arrival + " req/s");
      performanceText('[data-performance-output="prompt"]', performanceNumber(prompt) + " tok");
      performanceText('[data-performance-output="output"]', performanceNumber(output) + " tok");
      performanceText('[data-performance-metric="ttft"]', performanceMilliseconds(metric.ttft));
      performanceText('[data-performance-metric="tpot"]', performanceMilliseconds(metric.tpot) + "/tok");
      performanceText('[data-performance-metric="e2e"]', performanceMilliseconds(metric.e2e));
      performanceText('[data-performance-metric="throughput"]', performanceNumber(metric.outputThroughput) + " tok/s");
      performanceText('[data-performance-metric="goodput"]', performanceNumber(metric.goodput, 1) + " req/s");

      performanceText('[data-performance-time="network"]', performanceMilliseconds(metric.network));
      performanceText('[data-performance-time="queue"]', performanceMilliseconds(metric.queue));
      performanceText('[data-performance-time="prefill"]', performanceMilliseconds(metric.prefill));
      performanceText('[data-performance-time="decode"]', performanceMilliseconds(metric.decode));
      performanceText('[data-performance-boundary="first"]', "first token · " + performanceMilliseconds(metric.ttft));

      var timelineScales = {
        network: Math.sqrt(metric.network),
        queue: Math.sqrt(Math.max(5, metric.queue)),
        prefill: Math.sqrt(metric.prefill),
        decode: Math.sqrt(metric.decode)
      };
      Object.keys(timelineScales).forEach(function (name) {
        var segment = performanceRoot.querySelector('[data-performance-segment="' + name + '"]');
        segment.style.flexGrow = String(timelineScales[name]);
      });

      if (mode === "chat") {
        performanceText('[data-performance-slo="ttft"]', "Chat target ≤ 1,000 ms");
        performanceText('[data-performance-slo="tpot"]', "Chat target ≤ 50 ms/tok");
        performanceText('[data-performance-slo="goodput"]', "Requests meeting both chat SLOs");
        performanceHealth.textContent = metric.withinSlo ? "Within chat SLO" : "Outside chat SLO";
      } else {
        performanceText('[data-performance-slo="ttft"]', "Observed, not the batch objective");
        performanceText('[data-performance-slo="tpot"]', "Observed, not the batch objective");
        performanceText('[data-performance-slo="goodput"]', "Requests completing within 30 s");
        performanceHealth.textContent = metric.withinSlo ? "Within batch deadline" : "Outside batch deadline";
      }
      performanceHealth.classList.toggle("is-overloaded", !metric.withinSlo || metric.utilization >= 1);

      var queueShare = metric.queue / metric.ttft * 100;
      var explanation = queueShare > 35
        ? "Queueing now dominates startup. More offered work is waiting rather than becoming useful throughput."
        : prompt >= 3072
          ? "Prefill dominates startup because this is a long-prompt workload. Compare TTFT only against a matching prompt distribution."
          : "Startup is controlled; decode duration now depends mainly on answer length and token cadence.";
      performanceText("[data-performance-explanation]", explanation);

      renderPerformanceChart(metric);
      performanceLive.textContent = "Modeled TTFT " + performanceMilliseconds(metric.ttft)
        + ", TPOT " + performanceMilliseconds(metric.tpot) + " per token, end-to-end "
        + performanceMilliseconds(metric.e2e) + ", and goodput " + performanceNumber(metric.goodput, 1)
        + " requests per second.";
    }

    Object.keys(performanceInputs).forEach(function (name) {
      performanceInputs[name].addEventListener("input", renderPerformanceLab);
      performanceInputs[name].addEventListener("change", renderPerformanceLab);
    });
    performanceModes.forEach(function (input) {
      input.addEventListener("change", renderPerformanceLab);
    });

    renderPerformanceLab();
  }
})();
