/* make-brief.js — 產生「今天上課重點_路上聽.docx」（為朗讀設計，純段落） */
const { Document, Packer, Paragraph, TextRun, BorderStyle } = require('docx');
const fs = require('fs'), path = require('path');
const FONT = { ascii:'微軟正黑體', eastAsia:'微軟正黑體', hAnsi:'微軟正黑體', cs:'微軟正黑體' };
const INK = '241C17', INK2 = '3A2E26', CLAY = 'C05F3C';

const SRC = fs.readFileSync(path.join(__dirname, 'brief.txt'), 'utf8').split('\n');
const kids = [];
SRC.forEach((raw, i) => {
  const line = raw.trim();
  if (!line) { return; }
  if (line.startsWith('# ')) {
    kids.push(new Paragraph({ spacing:{ after: 80 }, children:[
      new TextRun({ text: line.slice(2), font: FONT, size: 40, bold: true, color: INK })]}));
  } else if (line.startsWith('## ')) {
    kids.push(new Paragraph({
      spacing:{ before: 400, after: 160 },
      border:{ bottom:{ style: BorderStyle.SINGLE, size: 10, color: CLAY, space: 4 } },
      children:[new TextRun({ text: line.slice(3), font: FONT, size: 30, bold: true, color: CLAY })]}));
  } else {
    kids.push(new Paragraph({ spacing:{ after: 200, line: 380 }, children:[
      new TextRun({ text: line, font: FONT, size: 26, color: INK2 })]}));
  }
});

const doc = new Document({
  styles:{ default:{ document:{ run:{ font: FONT, size: 26, color: INK2 } } } },
  sections:[{ properties:{ page:{ margin:{ top:1134, bottom:1134, left:1134, right:1134 } } }, children: kids }]
});
const out = path.join(__dirname, '今天上課重點_路上聽.docx');
Packer.toBuffer(doc).then(b => { fs.writeFileSync(out, b); console.log('已產生：' + path.basename(out)); });
