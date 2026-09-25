(function () {
  "use strict";

  var headings = document.querySelectorAll(
    ".post .entry #agent-instruction-block, .post .entry #copyable-agent-instruction"
  );

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand("copy");
    } finally {
      field.remove();
    }
  }

  headings.forEach(function (heading) {
    var block = heading.nextElementSibling;
    var code;
    while (block && !/^H[12]$/.test(block.tagName)) {
      code = block.querySelector("pre code");
      if (code) break;
      block = block.nextElementSibling;
    }
    if (!code) return;

    var toolbar = document.createElement("div");
    toolbar.className = "prompt-copy-toolbar";
    var status = document.createElement("span");
    status.className = "prompt-copy-status";
    status.setAttribute("role", "status");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-copy-button";
    button.textContent = "Copy instructions";
    toolbar.appendChild(status);
    toolbar.appendChild(button);
    block.parentNode.insertBefore(toolbar, block);

    button.addEventListener("click", async function () {
      button.disabled = true;
      status.textContent = "";
      var copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code.textContent);
          copied = true;
        }
      } catch (error) {
        // Older browsers or denied clipboard access can use the fallback.
      }
      if (!copied) {
        try {
          copied = fallbackCopy(code.textContent);
        } catch (error) {
          copied = false;
        }
      }
      button.disabled = false;
      button.focus({ preventScroll: true });
      if (copied) {
        status.textContent = "Copied!";
      } else {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = "Copy unavailable. Instructions selected; use your device’s Copy command.";
      }
    });
  });
})();
