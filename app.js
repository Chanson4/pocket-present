'use strict';
const $ = id => document.getElementById(id);
const EXAMPLE = `# Small tools.\nBig possibilities.\n\nA whole presentation in **one offline file**.\n\n???\nWelcome everyone. These notes stay with the author.\n\n---\n\n## Less setup. More story.\n\n- Write familiar Markdown\n- Pick a look that fits your talk\n- Share one HTML file\n- Present without Wi-Fi\n\n???\nPause here and ask about their workflow.\n\n---\n\n## Built for the moment\n\n\`\`\`javascript\nconst idea = "something worth sharing";\npresent(idea);\n\`\`\`\n\n> Your words deserve a clear canvas.\n\n---\n\n# Ready when you are.\n\nUse **arrow keys** to navigate.\nPress **B** for a blackout.\nPrint your deck to **PDF**.\n\n[Explore the source](https://github.com/Chanson4/pocket-present)`;
let slides = [], index = 0;
function status(text, error = false) { $('status').textContent = text; $('status').classList.toggle('error', error); }
function show(next = index) {
  index = Math.max(0, Math.min(Math.max(0, slides.length - 1), next));
  const slide = slides[index];
  $('preview').innerHTML = slide ? slide.html : '<h2>Your next great idea starts here.</h2><p>Write Markdown on the left, or load the example.</p>';
  $('notes').textContent = slide && slide.notes ? slide.notes : 'Use ??? to add private speaker notes.';
  $('position').textContent = slides.length ? `${index + 1} / ${slides.length}` : '0 / 0';
  $('slide-count').textContent = `${slides.length} slide${slides.length === 1 ? '' : 's'}`;
  $('preview-title').textContent = slides.length ? `SLIDE ${index + 1}` : '';
  $('previous').disabled = index === 0;
  $('next').disabled = index >= slides.length - 1;
  $('export').disabled = !slides.length;
}
function update() { slides = PocketPresent.parse($('source').value); show(); status('Everything stays in this tab. Save your Markdown before closing.'); }
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('source').addEventListener('input', update);
$('example').addEventListener('click', () => { $('source').value = EXAMPLE; index = 0; update(); });
$('clear').addEventListener('click', () => { $('source').value = ''; $('title').value = ''; update(); status('Cleared. Nothing was saved in browser storage.'); });
$('previous').addEventListener('click', () => show(index - 1));
$('next').addEventListener('click', () => show(index + 1));
$('theme').addEventListener('change', () => $('preview').dataset.theme = $('theme').value);
$('save-source').addEventListener('click', () => { download('presentation.md', $('source').value, 'text/markdown;charset=utf-8'); status('Markdown saved, including speaker notes.'); });
$('export').addEventListener('click', () => {
  try {
    const html = PocketPresent.exportHTML(slides, { theme: $('theme').value, title: $('title').value.trim() });
    download('presentation.html', html, 'text/html;charset=utf-8');
    status('Presentation downloaded. Open it in a browser; speaker notes are excluded.');
  } catch (error) { status(error.message, true); }
});
$('file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 512 * 1024) { status('Please choose a Markdown file smaller than 512 KB.', true); event.target.value = ''; return; }
  try { $('source').value = await file.text(); index = 0; update(); status('Markdown opened locally.'); }
  catch { status('Could not read the selected file.', true); }
  event.target.value = '';
});
let savedSource = '';
$('save-source').addEventListener('click', () => { savedSource = $('source').value; });
window.addEventListener('beforeunload', event => { if ($('source').value && $('source').value !== savedSource) { event.preventDefault(); event.returnValue = ''; } });
update();
