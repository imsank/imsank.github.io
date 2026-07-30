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
  if (!root) return;

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
})();
