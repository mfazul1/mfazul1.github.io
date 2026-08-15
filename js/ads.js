/* AdSense helper
   Keeps ad slots enabled (so they start serving automatically once the
   AdSense account is approved) but hides any slot that stays empty so it
   does not render as a blank/broken box on the page. */
(function () {
  "use strict";

  var DONE_ATTR = "data-ad-checked";

  function hideEmptyAdContainers() {
    var containers = document.querySelectorAll(".ad-container");
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      if (container.getAttribute(DONE_ATTR) === "true") {
        continue;
      }
      var ins = container.querySelector("ins.adsbygoogle");
      if (!ins) {
        continue;
      }
      var served = ins.querySelector("iframe");
      var hasText = ins.textContent && ins.textContent.trim().length > 0;
      if (!served && !hasText) {
        container.style.display = "none";
      }
      container.setAttribute(DONE_ATTR, "true");
    }
  }

  function schedule() {
    var run = function () {
      window.setTimeout(hideEmptyAdContainers, 2500);
    };
    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run);
    }
  }

  schedule();
  // Re-check a few times in case ads render late.
  window.setTimeout(hideEmptyAdContainers, 6000);
  window.setTimeout(hideEmptyAdContainers, 12000);
})();
