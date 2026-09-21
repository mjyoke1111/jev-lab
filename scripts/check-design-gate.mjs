import fs from 'node:fs';
const file=process.argv[2]||'docs/design-delivery-gate.md';
if(!fs.existsSync(file)){console.error(`Design gate FAIL: missing ${file}`);process.exit(1)}
const text=fs.readFileSync(file,'utf8');
const body=text.split(/^## Final status\s*$/mi)[0];
const checked=(body.match(/^- \[x\]/gmi)||[]).length;
const unchecked=(body.match(/^- \[ \]/gmi)||[]).length;
const final=text.split(/^## Final status\s*$/mi)[1]||'';
const pass=/^- \[x\] PASS\s*$/mi.test(final);
const fail=/^- \[x\] FAIL\s*$/mi.test(final);
if(!pass||fail||unchecked){console.error(`Design gate FAIL: checked=${checked}, unchecked=${unchecked}, pass=${pass}, fail=${fail}. Complete a run-specific copy before deploy.`);process.exit(1)}
console.log(`Design gate PASS: ${checked} checks in ${file}`);
