// Top scroll-progress bar. The element is hidden by default in CSS and only
// revealed here, so it never shows a broken/empty bar when JS is disabled.
(function () {
  'use strict';
  var bar = document.getElementById('reading-progress');
  if (!bar) return;
  bar.hidden = false;

  var ticking = false;
  function update() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    bar.style.width = pct + '%';
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
