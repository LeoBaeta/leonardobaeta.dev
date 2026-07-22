// Wires the server-rendered "Copy" buttons in code block headers.
(function () {
  'use strict';
  document.querySelectorAll('.post-body .code-cp').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var fig = btn.closest('.code');
      var code = fig && fig.querySelector('code');
      var text = code ? code.innerText : (fig.querySelector('pre') || {}).innerText || '';
      navigator.clipboard.writeText(text).then(
        function () { flash('Copied!'); },
        function () { flash('Copy failed'); }
      );
    });

    function flash(label) {
      btn.textContent = label;
      btn.classList.add('is-flashed');
      setTimeout(function () {
        btn.textContent = 'Copy';
        btn.classList.remove('is-flashed');
      }, 1500);
    }
  });
})();
