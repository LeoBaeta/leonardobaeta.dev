// Builds a sticky table of contents from H2/H3 headings in the post body.
// Only renders when there are 3+ headings (otherwise it adds noise). The sidebar
// is desktop-only via CSS; heading anchors work regardless.
(function () {
  'use strict';
  var container = document.getElementById('post-toc');
  var body = document.querySelector('.post-body');
  if (!container || !body) return;

  var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
  if (headings.length < 3) return;

  var used = {};
  function slugify(text) {
    var base = text.toLowerCase().trim().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
    var slug = base, n = 2;
    while (used[slug]) slug = base + '-' + n++;
    used[slug] = true;
    return slug;
  }

  var list = document.createElement('ul');
  var links = {};
  headings.forEach(function (h) {
    if (!h.id) h.id = slugify(h.textContent);
    var li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    links[h.id] = a;
  });

  var title = document.createElement('p');
  title.className = 'toc-title';
  title.textContent = 'On this page';
  container.appendChild(title);
  container.appendChild(list);
  container.hidden = false;

  // Highlight the active section as the reader scrolls.
  var current = null;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (current) current.classList.remove('is-active');
        current = links[entry.target.id];
        if (current) current.classList.add('is-active');
      }
    });
  }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });
  headings.forEach(function (h) { observer.observe(h); });
})();
