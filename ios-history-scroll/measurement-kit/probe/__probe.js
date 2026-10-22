// TEMP probe – never commit. Tracks on-screen content position per frame on the timeline scroller.
(function () {
  if (location.search.indexOf("nodefer") >= 0) window.__T3_PROBE_NO_DEFER = true;
  var t0 = performance.now(), buf = [], touching = false, lastScrollAt = -1e9;
  function now() { return Math.round(performance.now() - t0); }
  function push(e) { e.t = now(); e.touching = touching; buf.push(e); }
  setInterval(function () { if (!buf.length) return; var b = buf; buf = []; navigator.sendBeacon("http://127.0.0.1:47999/", JSON.stringify(b)); }, 500);
  push({ k: "probe-loaded", noDefer: !!window.__T3_PROBE_NO_DEFER, hasScrollEnd: "onscrollend" in window });
  window.__T3_PROBE_LOG = function (e) { push(e); };
  document.addEventListener("scrollend", function (ev) { if (ev.target && ev.target.classList && ev.target.classList.contains("messages-timeline-scroll")) push({ k: "scrollend-event", sinceScroll: Math.round(performance.now() - lastScrollAt) }); }, { capture: true });
  function scroller() { return document.querySelector(".messages-timeline-scroll"); }
  var desc = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop");
  var origBy = Element.prototype.scrollBy;
  Element.prototype.scrollBy = function (a) {
    if (this.classList && this.classList.contains("messages-timeline-scroll")) push({ k: "scrollBy", top: a && a.top, touchingNow: touching, sinceScroll: Math.round(performance.now() - lastScrollAt) });
    return origBy.apply(this, arguments);
  };
  document.addEventListener("touchstart", function () { touching = true; push({ k: "touchstart" }); }, { capture: true, passive: true });
  document.addEventListener("touchend", function () { touching = false; push({ k: "touchend" }); }, { capture: true, passive: true });
  document.addEventListener("scroll", function (ev) { if (ev.target && ev.target.classList && ev.target.classList.contains("messages-timeline-scroll")) lastScrollAt = performance.now(); }, { capture: true, passive: true });
  var anchor = null, anchorText = "", lastTop = null, lastScroll = null;
  function pick(el) {
    var r = el.getBoundingClientRect();
    var p = document.elementFromPoint(r.left + r.width / 2, r.top + r.height * 0.45);
    while (p && p !== el && !(p.textContent && p.textContent.trim().length > 20 && p.children.length <= 3)) p = p.parentElement;
    if (!p || p === el) return null;
    return p;
  }
  function frame() {
    var el = scroller();
    var active = touching || performance.now() - lastScrollAt < 400;
    if (el && active) {
      if (!anchor || !anchor.isConnected || anchor.textContent.slice(0, 80) !== anchorText) {
        anchor = pick(el); anchorText = anchor ? anchor.textContent.slice(0, 80) : ""; lastTop = null;
      }
      if (anchor) {
        var top = anchor.getBoundingClientRect().top, st = desc.get.call(el);
        var vr = el.getBoundingClientRect();
        if (top < vr.top - 50 || top > vr.bottom + 50) { anchor = null; lastTop = null; }
        else {
          if (lastTop !== null) push({ k: "f", dy: Math.round((top - lastTop) * 10) / 10, dScroll: Math.round((st - lastScroll) * 10) / 10 });
          lastTop = top; lastScroll = st;
        }
      }
    } else { lastTop = null; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
