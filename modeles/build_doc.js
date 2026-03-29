const fs = require('fs');
const content = fs.readFileSync('C:/Users/Seck Loué/Desktop/notariat-agent-ia/modeles/acte_vente_immobiliere_CI.md', 'utf8');

// Parse markdown to structured sections
const lines = content.split('\n');
let sections = [];
let currentText = '';

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '---') continue;
  if (trimmed === '') {
    if (currentText) { sections.push({ style: 'NORMAL_TEXT', text: currentText }); currentText = ''; }
    continue;
  }

  if (trimmed.startsWith('# ') && !trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
    if (currentText) { sections.push({ style: 'NORMAL_TEXT', text: currentText }); currentText = ''; }
    sections.push({ style: 'HEADING_1', text: trimmed.replace(/^# /, '').replace(/\*\*/g, '') });
  } else if (trimmed.startsWith('## ')) {
    if (currentText) { sections.push({ style: 'NORMAL_TEXT', text: currentText }); currentText = ''; }
    sections.push({ style: 'HEADING_2', text: trimmed.replace(/^## /, '').replace(/\*\*/g, '') });
  } else if (trimmed.startsWith('### ')) {
    if (currentText) { sections.push({ style: 'NORMAL_TEXT', text: currentText }); currentText = ''; }
    sections.push({ style: 'HEADING_3', text: trimmed.replace(/^### /, '').replace(/\*\*/g, '') });
  } else {
    // Clean markdown
    let clean = trimmed
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\|/g, ' | ')
      .replace(/\s+/g, ' ');
    if (clean.match(/^[\-\|]+$/)) continue; // skip table separators
    currentText = currentText ? currentText + '\n' + clean : clean;
  }
}
if (currentText) sections.push({ style: 'NORMAL_TEXT', text: currentText });

// Build requests
let requests = [];
let fullText = '';
let ranges = [];

for (const s of sections) {
  const start = fullText.length + 1;
  fullText += s.text + '\n';
  ranges.push({ style: s.style, start });
}

requests.push({ insertText: { location: { index: 1 }, text: fullText } });

for (const r of ranges) {
  if (r.style !== 'NORMAL_TEXT') {
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: r.start, endIndex: r.start + 1 },
        paragraphStyle: { namedStyleType: r.style },
        fields: 'namedStyleType'
      }
    });
  }
}

const body = JSON.stringify({ requests });
fs.writeFileSync('C:/Users/Seck Loué/Desktop/notariat-agent-ia/modeles/batch_body.json', body);
console.log('OK -', requests.length, 'requests,', fullText.length, 'chars');
