/* Pocket Present: a deliberately small, HTML-safe Markdown subset. */
(function (root) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  function inline(text) {
    // Tokenize once. Never run markup substitutions over already generated HTML.
    const pattern = /`([^`\n]+)`|\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
    let html = '', cursor = 0;
    for (const match of text.matchAll(pattern)) {
      html += escape(text.slice(cursor, match.index));
      if (match[1] !== undefined) html += `<code>${escape(match[1])}</code>`;
      else if (match[2] !== undefined) {
        const href = match[3];
        html += /^(https?:\/\/|mailto:)/i.test(href) ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(match[2])}</a>` : escape(match[0]);
      } else if (match[4] !== undefined) html += `<strong>${escape(match[4])}</strong>`;
      else html += `<em>${escape(match[5])}</em>`;
      cursor = match.index + match[0].length;
    }
    return html + escape(text.slice(cursor));
  }
  function render(lines) {
    const output = []; let paragraph = [], list = [], listType = '';
    function flushParagraph() { if (paragraph.length) output.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; }
    function flushList() { if (list.length) output.push(`<${listType}>${list.map(line => `<li>${inline(line)}</li>`).join('')}</${listType}>`); list = []; listType = ''; }
    let fence = false, code = [], language = '';
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        if (fence) { output.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`); code = []; fence = false; }
        else { flushParagraph(); flushList(); fence = true; language = line.trim().slice(3); }
        continue;
      }
      if (fence) { code.push(line); continue; }
      const heading = /^(#{1,3})\s+(.+)$/.exec(line);
      const bullet = /^\s*(?:([-*])\s+|(\d+)\.\s+)(.+)$/.exec(line);
      if (heading) { flushParagraph(); flushList(); output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); }
      else if (bullet) {
        flushParagraph(); const type = bullet[2] ? 'ol' : 'ul';
        if (listType && listType !== type) flushList();
        listType = type; list.push(bullet[3]);
      } else if (/^>\s?/.test(line)) { flushParagraph(); flushList(); output.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); }
      else if (!line.trim()) { flushParagraph(); flushList(); }
      else { flushList(); paragraph.push(line); }
    }
    if (fence) output.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);
    flushParagraph(); flushList();
    return output.join('\n');
  }
  function parse(markdown) {
    const slides = []; let lines = [], notes = [], inNotes = false, fenced = false;
    function flush() {
      if (!lines.some(line => line.trim()) && !notes.length) return;
      const heading = lines.find(line => /^#{1,3}\s+/.test(line));
      slides.push({ html: render(lines), notes: notes.join('\n').trim(), title: heading ? heading.replace(/^#{1,3}\s+/, '') : `Slide ${slides.length + 1}` });
      lines = []; notes = []; inNotes = false;
    }
    for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
      if (!fenced && /^\s*---\s*$/.test(line)) { flush(); continue; }
      if (!fenced && /^\s*\?\?\?\s*$/.test(line)) { inNotes = true; continue; }
      if (inNotes) { notes.push(line); continue; }
      if (/^\s*```/.test(line)) fenced = !fenced;
      lines.push(line);
    }
    flush();
    return slides;
  }
  function exportedRuntime() {
    const slides = [...document.querySelectorAll('.slide')];
    let index = 0, start = null, elapsed = 0, interval = null;
    const counter = document.getElementById('counter');
    function show(next) {
      index = Math.max(0, Math.min(slides.length - 1, next));
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      counter.textContent = `${index + 1} / ${slides.length}`;
      document.getElementById('previous').disabled = index === 0;
      document.getElementById('next').disabled = index === slides.length - 1;
    }
    document.getElementById('previous').onclick = () => show(index - 1);
    document.getElementById('next').onclick = () => show(index + 1);
    document.getElementById('print').onclick = () => window.print();
    document.getElementById('fullscreen').onclick = async () => {
      try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
      catch { document.getElementById('fullscreen').textContent = 'Use browser fullscreen'; }
    };
    document.getElementById('timer').onclick = () => {
      const label = document.getElementById('timer');
      if (interval) { elapsed += Date.now() - start; clearInterval(interval); interval = null; label.title = 'Resume timer'; }
      else { start = Date.now(); label.title = 'Pause timer'; interval = setInterval(() => { const seconds = Math.floor((elapsed + Date.now() - start) / 1000); label.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }, 250); }
    };
    document.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target.matches('button,a,input,textarea,select')) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
      if (event.key === 'Home') show(0);
      if (event.key === 'End') show(slides.length - 1);
      if (event.key.toLowerCase() === 'b') document.body.classList.toggle('blackout');
    });
    document.body.addEventListener('click', () => document.body.classList.remove('blackout'));
    show(0);
  }
  const deckCSS = `:root{color-scheme:dark;--bg:#101824;--fg:#edf3fa;--accent:#91baff;--muted:#9daec4;--code:#1b283b}body[data-theme=paper]{color-scheme:light;--bg:#faf7ef;--fg:#25241f;--accent:#a64425;--muted:#777366;--code:#eeeadf}body[data-theme=grove]{--bg:#12251e;--fg:#e6f4e9;--accent:#b9d984;--muted:#9eb1a1;--code:#20382c}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif}.slide{min-height:calc(100vh - 64px);padding:clamp(28px,8vw,130px);display:flex;flex-direction:column;justify-content:center;overflow-wrap:anywhere}.slide[hidden]{display:none}h1{font-size:clamp(36px,6vw,84px);line-height:1.06;letter-spacing:-.05em;margin:0 0 .4em;color:var(--accent)}h2{font-size:clamp(30px,4.5vw,60px);line-height:1.15;letter-spacing:-.04em;margin:0 0 .5em}h3{font-size:clamp(24px,3vw,40px);margin:.4em 0}p,li,blockquote{font-size:clamp(18px,2.4vw,33px);line-height:1.55}p{margin:.4em 0}li{margin:.25em 0}ul,ol{padding-left:1.2em}strong{color:var(--accent)}a{color:var(--accent)}code{font-family:ui-monospace,Consolas,monospace;background:var(--code);font-size:.8em;padding:.15em .3em;border-radius:5px}pre{background:var(--code);padding:24px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(14px,1.6vw,24px);line-height:1.6}pre code{padding:0;font-size:inherit}blockquote{border-left:4px solid var(--accent);padding-left:24px;color:var(--muted);margin:20px 0}nav{position:fixed;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:10px;height:64px;background:var(--bg);border-top:1px solid var(--code);font:12px system-ui}button{background:var(--code);color:var(--fg);border:0;padding:9px 13px;border-radius:6px;cursor:pointer}button:disabled{opacity:.3}button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}#counter{min-width:55px;text-align:center}.blackout:after{content:'';position:fixed;inset:0;background:#000;z-index:10;pointer-events:none}@media(max-width:600px){nav{gap:5px}button{padding:9px 8px;font-size:11px}.slide{padding:30px 24px}}@media print{@page{size:landscape;margin:0}body{background:var(--bg)!important;print-color-adjust:exact;-webkit-print-color-adjust:exact}.slide,.slide[hidden]{display:flex!important;min-height:100vh;break-after:page;padding:50px 65px}.slide:last-of-type{break-after:auto}nav,.blackout:after{display:none!important}h1{font-size:52pt}h2{font-size:38pt}p,li,blockquote{font-size:21pt}pre{font-size:15pt}}`;
  function exportHTML(slides, options = {}) {
    if (!slides.length) throw new Error('Add some content before exporting.');
    const theme = ['midnight', 'paper', 'grove'].includes(options.theme) ? options.theme : 'midnight';
    const title = escape(options.title || slides[0].title || 'Pocket Present');
    // The export contains rendered content only. Author notes and source text are
    // deliberately excluded so a shared presentation cannot reveal private notes.
    const sections = slides.map((slide, index) => `<section class="slide" aria-label="Slide ${index + 1}"${index ? ' hidden' : ''}>${slide.html}</section>`).join('\n');
    return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>${title}</title><style>${deckCSS}</style></head><body data-theme="${theme}"><main>${sections}</main><nav aria-label="Presentation controls"><button id="previous" aria-label="Previous slide">←</button><span id="counter" aria-live="polite"></span><button id="next" aria-label="Next slide">→</button><button id="timer" title="Start / pause timer">0:00</button><button id="fullscreen">Fullscreen</button><button id="print">Print / PDF</button></nav><script>(${exportedRuntime.toString()})();<\/script></body></html>`;
  }
  const api = { parse, inline, escape, deckCSS, exportHTML };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PocketPresent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
