'use strict';

const markdownIt = require('markdown-it');
const { escapeXml } = require('./xml');

let _md = null;    // lazy-initialized on first renderPost call
let _hl = null;    // highlighter reference used to build _md

const THEME = 'night-owl';

function _highlight(highlighter, code, lang) {
  const language = (lang || '').trim() || 'text';
  try {
    return highlighter.codeToHtml(code, { lang: language, theme: THEME });
  } catch {
    // Language not in the loaded set - render a plain, escaped block.
    return `<pre class="shiki"><code>${escapeXml(code)}</code></pre>`;
  }
}

function _initMd(highlighter) {
  _hl = highlighter;
  _md = markdownIt({
    html: false,        // no raw HTML passthrough - security requirement (FR32)
    linkify: true,      // auto-link bare URLs
    typographer: false, // off by design: it rewrites ASCII quotes and dashes into
                        // smart quotes / em-dashes, and site text stays ASCII.
  });

  // Custom fence renderer: wraps each block in a <figure class="code"> with a
  // header (language label + copy button), and wraps blocks marked with a
  // `reference` info flag (e.g. ```bash reference) in a collapsible <details>.
  _md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = (token.info || '').trim();
    const [lang, ...flags] = info.split(/\s+/);
    const label = lang ? escapeXml(lang.toUpperCase()) : 'TEXT';
    const pre = _highlight(highlighter, token.content, lang);
    const figure =
      '<figure class="code">' +
        '<figcaption class="code-hd">' +
          `<span class="code-lang">${label}</span>` +
          '<button type="button" class="code-cp">Copy</button>' +
        '</figcaption>' +
        `<div class="code-body">${pre}</div>` +
      '</figure>';
    if (flags.includes('reference')) {
      return `<details class="reference-block"><summary>Reference (${label})</summary>${figure}</details>\n`;
    }
    return figure + '\n';
  };

  // Video embeds: an allowlisted `@[youtube](VIDEO_ID "optional title")` block on
  // its own line. We emit a controlled iframe ourselves rather than enabling raw
  // HTML passthrough (html:false stays on), and only the privacy-preserving
  // youtube-nocookie origin is used - which CSP frame-src is set to match.
  const YT_RE = /^@\[youtube\]\(([\w-]{11})(?:\s+"([^"]*)")?\)\s*$/;
  _md.block.ruler.before('fence', 'youtube', (state, startLine, _endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const m = YT_RE.exec(state.src.slice(start, state.eMarks[startLine]));
    if (!m) return false;
    if (silent) return true;
    const token = state.push('youtube', 'div', 0);
    token.meta = { id: m[1], title: m[2] || 'YouTube video' };
    token.map = [startLine, startLine + 1];
    token.block = true;
    state.line = startLine + 1;
    return true;
  });

  _md.renderer.rules.youtube = (tokens, idx) => {
    const { id, title } = tokens[idx].meta;
    const src = `https://www.youtube-nocookie.com/embed/${escapeXml(id)}`;
    return (
      '<figure class="post-video">' +
        `<iframe src="${src}" title="${escapeXml(title)}" loading="lazy" ` +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
      '</figure>\n'
    );
  };
}

/**
 * Render a post's markdown body to HTML using markdown-it + shiki.
 * The highlighter is created once in bootstrap.js and passed in here.
 * Routes must never call shiki or markdown-it directly.
 *
 * @param {{ content: string }} post - PostMeta with raw markdown body
 * @param {object} highlighter - shiki Highlighter instance
 * @returns {string} - rendered HTML
 */
function renderPost(post, highlighter) {
  if (!_md || _hl !== highlighter) _initMd(highlighter);
  return _md.render(post.content || '');
}

module.exports = { renderPost };
