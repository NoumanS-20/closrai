(function () {
  "use strict";
  if (window.__closrAiEmbedLoaded) return;
  window.__closrAiEmbedLoaded = true;

  function currentScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (s.src && s.src.indexOf("/embed.js") !== -1) return s;
    }
    return null;
  }

  var script = currentScript();
  var dataset = (script && script.dataset) || {};
  var persona = (dataset.persona || "sales").toLowerCase();
  if (["sales", "support", "care"].indexOf(persona) === -1) persona = "sales";
  var voice = dataset.voice !== "0" && dataset.voice !== "false";

  // Origin defaults to where embed.js was loaded from.
  var origin = (function () {
    if (script && script.src) {
      try {
        return new URL(script.src).origin;
      } catch {
        /* fall through */
      }
    }
    return window.location.origin;
  })();

  var THEME = {
    sales: { color: "#10b981", grad: "linear-gradient(135deg,#10b981,#38bdf8)" },
    support: { color: "#38bdf8", grad: "linear-gradient(135deg,#38bdf8,#a78bfa)" },
    care: { color: "#a78bfa", grad: "linear-gradient(135deg,#a78bfa,#e879f9)" },
  };
  var theme = THEME[persona];

  var launcher = document.createElement("button");
  launcher.setAttribute("aria-label", "Open ClosrAI chat");
  launcher.style.cssText = [
    "position:fixed",
    "right:20px",
    "bottom:20px",
    "z-index:2147483646",
    "width:56px",
    "height:56px",
    "border-radius:50%",
    "border:none",
    "cursor:pointer",
    "box-shadow:0 10px 30px rgba(0,0,0,0.35)",
    "background:" + theme.grad,
    "color:#0a0a0a",
    "font-family:system-ui,-apple-system,sans-serif",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "transition:transform 150ms ease",
  ].join(";");
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  launcher.addEventListener("mouseenter", function () {
    launcher.style.transform = "scale(1.05)";
  });
  launcher.addEventListener("mouseleave", function () {
    launcher.style.transform = "scale(1)";
  });

  var panel = document.createElement("div");
  panel.style.cssText = [
    "position:fixed",
    "right:20px",
    "bottom:88px",
    "z-index:2147483646",
    "width:min(420px,calc(100vw - 40px))",
    "height:min(680px,calc(100vh - 120px))",
    "border-radius:20px",
    "overflow:hidden",
    "box-shadow:0 20px 60px rgba(0,0,0,0.45)",
    "display:none",
    "background:#0a0a0a",
    "border:1px solid #27272a",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.allow = "microphone";
  iframe.style.cssText =
    "border:0;width:100%;height:100%;background:transparent";
  iframe.src =
    origin +
    "/embed?persona=" +
    encodeURIComponent(persona) +
    "&voice=" +
    (voice ? "1" : "0");
  panel.appendChild(iframe);

  var closeBtn = document.createElement("button");
  closeBtn.setAttribute("aria-label", "Close ClosrAI chat");
  closeBtn.style.cssText = [
    "position:absolute",
    "top:8px",
    "right:8px",
    "width:28px",
    "height:28px",
    "border-radius:50%",
    "border:1px solid #3f3f46",
    "background:rgba(0,0,0,0.6)",
    "color:#a1a1aa",
    "cursor:pointer",
    "font-size:14px",
    "line-height:1",
    "z-index:2",
  ].join(";");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", function () {
    panel.style.display = "none";
  });
  panel.appendChild(closeBtn);

  launcher.addEventListener("click", function () {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  function mount() {
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
