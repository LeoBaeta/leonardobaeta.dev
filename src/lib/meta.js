'use strict';

/**
 * JSON.stringify, hardened for embedding directly inside a <script> element.
 *
 * JSON.stringify leaves `<` untouched, so a post title containing `</script>`
 * would close the ld+json block early and let frontmatter inject markup. Every
 * replacement below is a valid JSON string escape, so a parser sees the exact
 * same value; only the HTML/JS-significant characters are hidden. U+2028 and
 * U+2029 are legal in JSON but are line terminators in JS, so they go too.
 */
function stringifyForScript(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Single source of truth for per-page SEO/social metadata.
 * @param {object} post - PostMeta from the index
 * @param {object} siteConfig - app.locals.siteConfig
 * @returns {{ title: string, description: string, canonical: string, ogImage: (string|null) }}
 */
function buildMeta(post, siteConfig) {
  const base = String(siteConfig.siteUrl || '').replace(/\/$/, '');
  return {
    title: post.title,
    description: post.description,
    canonical: `${base}/posts/${post.slug}`,
    ogImage: post.image ? `${base}${post.image.startsWith('/') ? '' : '/'}${post.image}` : null,
  };
}

/**
 * schema.org/BlogPosting JSON-LD for a post, as a JSON string.
 * Omits the image field entirely when the post has none.
 */
function buildJsonLd(post, siteConfig, meta) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: meta.canonical,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Person',
      name: siteConfig.authorName,
      sameAs: [siteConfig.authorGithub, siteConfig.authorLinkedIn].filter(Boolean),
    },
  };
  if (meta.ogImage) data.image = meta.ogImage;
  return stringifyForScript(data);
}

/**
 * Site-identity JSON-LD (WebSite + Person) for non-post pages such as the
 * homepage and /about. Helps Google tie the domain to a named author and
 * surface sitelinks. Returns a JSON string.
 */
function buildSiteJsonLd(siteConfig) {
  const base = String(siteConfig.siteUrl || '').replace(/\/$/, '');
  return stringifyForScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: siteConfig.authorName,
        description: 'Field notes on embedded Linux, C/C++, and the hard edges of systems programming.',
        publisher: { '@id': `${base}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${base}/#person`,
        name: siteConfig.authorName,
        url: `${base}/`,
        sameAs: [siteConfig.authorGithub, siteConfig.authorLinkedIn].filter(Boolean),
      },
    ],
  });
}

module.exports = { buildMeta, buildJsonLd, buildSiteJsonLd };
