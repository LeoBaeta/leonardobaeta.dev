'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPostIndex } = require('../src/lib/post-index');

function file(slug, fm = {}, body = 'body') {
  const front = Object.assign(
    { title: 'T', date: '2026-01-01', slug, description: 'd', status: 'published' },
    fm
  );
  const yaml = Object.entries(front)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : v}`)
    .join('\n');
  return { filepath: `${slug}.md`, content: `---\n${yaml}\n---\n${body}` };
}

test('indexes a valid post', () => {
  const { index, errors } = buildPostIndex([file('hello')]);
  assert.equal(index.size, 1);
  assert.equal(errors.length, 0);
  assert.equal(index.get('hello').title, 'T');
});

test('skips a post missing a required field', () => {
  const bad = { filepath: 'bad.md', content: `---\ntitle: x\n---\nbody` };
  const { index, errors } = buildPostIndex([bad]);
  assert.equal(index.size, 0);
  assert.ok(errors.some((e) => e.field === 'date' || e.field === 'slug' || e.field === 'description' || e.field === 'status'));
});

test('rejects an invalid slug format', () => {
  const { index, errors } = buildPostIndex([file('Bad_Slug')]);
  assert.equal(index.size, 0);
  assert.ok(errors.some((e) => e.field === 'slug'));
});

test('filters drafts in production', () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const { index } = buildPostIndex([file('pub'), file('draft', { status: 'draft' })]);
  process.env.NODE_ENV = prev;
  assert.equal(index.size, 1);
  assert.ok(index.has('pub'));
  assert.ok(!index.has('draft'));
});

test('computes series prev/next and total', () => {
  const files = [
    file('p1', { series: 's', series_part: 1 }),
    file('p2', { series: 's', series_part: 2 }),
    file('p3', { series: 's', series_part: 3 }),
  ];
  const { index } = buildPostIndex(files);
  const p2 = index.get('p2');
  assert.equal(p2.total, 3);
  assert.equal(p2.prev.slug, 'p1');
  assert.equal(p2.next.slug, 'p2'.replace('2', '3'));
  assert.equal(index.get('p1').prev, null);
  assert.equal(index.get('p3').next, null);
});

test('builds redirect map and drops cycles', () => {
  const { redirectMap } = buildPostIndex([file('new', { redirectFrom: ['old'] })]);
  assert.equal(redirectMap.get('old'), 'new');
});
