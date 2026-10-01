const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parse, inline, exportHTML } = require('../core.js');
test('split slides, keep fences intact, and isolate speaker notes', () => {
  const slides = parse('# First\r\n\r\n???\r\nprivate notes\r\n---\r\n## Second\r\n```txt\r\n---\r\n???\r\n```');
  assert.equal(slides.length, 2);
  assert.equal(slides[0].notes, 'private notes');
  assert.match(slides[1].html, /---\n\?\?\?/);
  assert.equal(slides[1].notes, '');
});
test('HTML input is escaped, including closing script tags and SVG', () => {
  const html = parse('# <script>alert(1)</script>\n<img src=x onerror=alert(1)>')[0].html;
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;/);
});
test('inline code stays literal and dangerous links never become anchors', () => {
  assert.equal(inline('`**literal**`'), '<code>**literal**</code>');
  assert.doesNotMatch(inline('[x](javascript:alert) [y](data:text/html,test)'), /<a/);
  assert.doesNotMatch(inline('[x](//example.com)'), /<a/);
  assert.match(inline('[x](https://example.com?a=1&b=2)'), /href="https:\/\/example.com\?a=1&amp;b=2"/);
  assert.match(inline('**bold** *italics*'), /<strong>bold<\/strong> <em>italics<\/em>/);
});
test('lists, quotes and code blocks', () => {
  const html = parse('# Title\n\n- one\n- two\n\n1. first\n2. second\n\n> quote\n\n```js\nconst x = "<tag>";\n```')[0].html;
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<ol>/); assert.match(html, /<blockquote>quote/);
  assert.match(html, /&lt;tag&gt;/);
});
test('empty slides, unclosed fences and notes-only slides', () => {
  assert.deepEqual(parse('  \n---\n'), []);
  assert.match(parse('```\nunfinished')[0].html, /unfinished<\/code>/);
  assert.equal(parse('???\nnotes')[0].notes, 'notes');
});
test('standalone export excludes notes, escapes title, embeds all assets', () => {
  const slides = parse('# Hello\n\n???\nUNIQUE_PRIVATE_NOTE');
  const html = exportHTML(slides, { theme: 'paper', title: '</title><script>bad</script>' });
  assert.doesNotMatch(html, /UNIQUE_PRIVATE_NOTE/);
  assert.doesNotMatch(html, /<script src|<link/);
  assert.match(html, /data-theme="paper"/);
  assert.match(html, /&lt;\/title&gt;/);
  assert.match(html, /connect-src 'none'/);
  assert.equal((html.match(/<script>/g) || []).length, 1);
  assert.throws(() => exportHTML([]), /content/);
  assert.match(exportHTML(slides, { theme: 'injected" onload="bad' }), /data-theme="midnight"/);
});
test('generated runtime compiles without dependencies', () => {
  const html = exportHTML(parse('# One\n---\n# Two'));
  const runtime = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new Function(runtime));
});
