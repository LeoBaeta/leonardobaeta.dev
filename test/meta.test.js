'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildJsonLd, buildSiteJsonLd } = require('../src/lib/meta');

const siteConfig = {
  siteUrl: 'https://example.test',
  authorName: 'A',
  authorGithub: '',
  authorLinkedIn: '',
};

// JSON-LD is interpolated raw into a <script type="application/ld+json"> block
// (layout.ejs), so a bare `<` in any field would let post frontmatter close the
// script element early and inject markup.
test('escapes < > & so JSON-LD cannot break out of its script block', () => {
  const post = {
    title: 'Evil</script><script>alert(1)</script>',
    description: 'a & b',
    slug: 'x',
    date: '2026-01-01',
  };
  const meta = { canonical: 'https://example.test/posts/x', ogImage: null };
  const json = buildJsonLd(post, siteConfig, meta);

  assert.ok(!json.includes('<'), 'no raw < in JSON-LD output');
  assert.ok(!json.includes('>'), 'no raw > in JSON-LD output');
  assert.ok(!json.includes('&'), 'no raw & in JSON-LD output');
  // Escaping must be transparent - the parsed value round-trips unchanged.
  assert.equal(JSON.parse(json).headline, post.title);
  assert.equal(JSON.parse(json).description, post.description);
});

test('escapes site-identity JSON-LD too', () => {
  const json = buildSiteJsonLd({ ...siteConfig, authorName: '</script>x' });
  assert.ok(!json.includes('<'));
  assert.equal(JSON.parse(json)['@graph'][0].name, '</script>x');
});

test('emits valid JSON-LD for an ordinary post', () => {
  const post = { title: 'T', description: 'd', slug: 'x', date: '2026-01-01' };
  const meta = { canonical: 'https://example.test/posts/x', ogImage: null };
  const data = JSON.parse(buildJsonLd(post, siteConfig, meta));
  assert.equal(data['@type'], 'BlogPosting');
  assert.equal(data.headline, 'T');
  assert.equal(data.dateModified, '2026-01-01');
  assert.equal(data.image, undefined);
});
