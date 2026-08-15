/* AdSense helper
   Keeps ad slots enabled (so they start serving automatically once the
   AdSense account is approved) but hides any slot that did not fill with
   a real ad (blocked, unfilled, pending approval, etc.) so it does not
   render as a blank/broken box on the page.

   Detection uses Google's own data-ad-status attribute on the <ins>
   element: it only equals "filled" when a real ad is showing. Anything
   else (no attribute, "unfilled", "unfill-optimized", or the "This
   content is blocked" error iframe) is treated as empty and hidden. */
(function () {
  "use strict";

  function updateAdContainers() {
    var containers = document.querySelectorAll(".ad-container");
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      var ins = container.querySelector("ins.adsbygoogle");
      if (!ins) {
        continue;
      }
      if (ins.getAttribute("data-ad-status") === "filled") {
        container.style.display = "";
      } else {
        container.style.display = "none";
      }
    }
  }

  function schedule() {
    var run = function () {
      window.setTimeout(updateAdContainers, 2500);
    };
    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run);
    }
  }

  schedule();
  // Re-check a few times in case ads render late.
  window.setTimeout(updateAdContainers, 6000);
  window.setTimeout(updateAdContainers, 12000);
})();
