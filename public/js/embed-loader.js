// Async WASM embed loader (stub). Runs after first paint (deferred). Reads the
// .wasm path from each .embed-slot and instantiates it. On any failure it swaps
// in a static "demo unavailable" message rather than throwing. No real demo
// exists yet - this is the loading/fallback scaffolding the demo will plug into.
(function () {
  'use strict';
  var slots = document.querySelectorAll('.embed-slot[data-wasm]');
  slots.forEach(function (slot) {
    var src = slot.getAttribute('data-wasm');
    var loading = slot.querySelector('.embed-loading');

    function fail(msg) {
      if (loading) loading.textContent = msg || 'Interactive demo unavailable.';
    }

    if (!('WebAssembly' in window)) return fail('Your browser does not support WebAssembly.');

    fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed: ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        // A real demo would mount its canvas/UI here using `result.instance`.
        if (loading) loading.remove();
        slot.dataset.loaded = 'true';
      })
      .catch(function () {
        fail('Interactive demo unavailable.');
      });
  });
})();
