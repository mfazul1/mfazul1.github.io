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

  function normalize(path) {
    var p = path || "";
    if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1);
    return p.toLowerCase();
  }

  function markActiveNav() {
    var links = document.querySelectorAll(
      "body.theme-3d .header-3d .navbar-nav a"
    );
    var currentPath = normalize(window.location.pathname);

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("href");
      if (!href || href.indexOf("http") === 0 || href.charAt(0) === "#") continue;

      var a = document.createElement("a");
      a.href = href;
      var targetPath = normalize(a.pathname);

      var isActive =
        currentPath === targetPath ||
        (targetPath.length > 1 &&
          currentPath.indexOf(targetPath + "/") === 0);

      if (isActive) {
        link.classList.add("active");
        if (link.getAttribute("aria-current") !== "page") {
          link.setAttribute("aria-current", "page");
        }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindHeader3dPad();
      markActiveNav();
    });
  } else {
    bindHeader3dPad();
    markActiveNav();
  }

  window.addEventListener("resize", function () {
    requestAnimationFrame(syncHeader3dPad);
  });
  window.addEventListener("load", syncHeader3dPad);
})();
