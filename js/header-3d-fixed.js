(function () {
  function syncHeader3dPad() {
    var header = document.querySelector("body.theme-3d .header-3d.default-header");
    if (!header || !document.body.classList.contains("theme-3d")) return;
    var h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-3d-h", h + "px");
  }

  function bindHeader3dPad() {
    syncHeader3dPad();
    var nav = document.getElementById("navbarSupportedContent");
    if (nav) {
      nav.addEventListener("shown.bs.collapse", syncHeader3dPad);
      nav.addEventListener("hidden.bs.collapse", syncHeader3dPad);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindHeader3dPad);
  } else {
    bindHeader3dPad();
  }

  window.addEventListener("resize", function () {
    requestAnimationFrame(syncHeader3dPad);
  });
  window.addEventListener("load", syncHeader3dPad);
})();
