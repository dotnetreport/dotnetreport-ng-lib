// Generates the Knockout templates for the Angular components from the main app's Razor views, so the
// templates are never copied by hand.
//   node scripts/sync-templates.mjs [path to the main app] [--out file]     (default: the folder above angular/)
// Writes projects/dotnetreport-lib/src/lib/templates.ts: the shared templates and the page markup of
// the report, dashboard, setup and users views.
//
// The Angular app uses Bootstrap 5 and Font Awesome 5, so the templates get the same small set of
// changes that used to be made by hand:
//   - pull-left / pull-right become float-start / float-end
//   - Font Awesome 4 outline icons (fa-lightbulb-o and so on) become their Font Awesome 5 names
//   - a few markup fixes listed in angularFixes below
//   - the components show their own "Account not Setup" message (noaccount-modal.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, '..');
// --out <file> writes somewhere else; the React package uses it for its own copy
const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const outArg = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const mainApp = path.resolve(args[0] || path.join(workspace, '..'));
const output = outArg ? path.resolve(outArg) : path.join(workspace, 'projects/dotnetreport-lib/src/lib/templates.ts');

const normalize = text => text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
const read = file => normalize(fs.readFileSync(path.join(mainApp, file), 'utf8'));

// Font Awesome 4 outline icons that were renamed in Font Awesome 5
const outlineIcons = {
  'lightbulb-o': 'fas fa-lightbulb',
  'file-excel-o': 'fas fa-file-excel',
  'file-pdf-o': 'fas fa-file-pdf',
  'file-word-o': 'fas fa-file-word',
  'file-o': 'fas fa-file',
  'trash-o': 'fa fa-trash',
  'comments-o': 'fa fa-comments',
  'comment-o': 'fa fa-comment',
  'clock-o': 'far fa-clock',
  'calendar-o': 'far fa-calendar',
  'star-o': 'far fa-star',
  'square-o': 'far fa-square',
  'check-square-o': 'far fa-check-square',
  'circle-o': 'far fa-circle',
  'folder-o': 'far fa-folder',
  'folder-open-o': 'far fa-folder-open',
  'envelope-o': 'far fa-envelope',
  'pencil-square-o': 'fas fa-edit',
  'share-square-o': 'fas fa-share-square',
  'bookmark-o': 'far fa-bookmark',
  'bell-o': 'far fa-bell',
  'sticky-note-o': 'far fa-sticky-note',
  'thumbs-o-up': 'far fa-thumbs-up',
  'thumbs-o-down': 'far fa-thumbs-down',
  'hdd-o': 'far fa-hdd',
  'floppy-o': 'far fa-save',
  'sun-o': 'far fa-sun',
  'moon-o': 'far fa-moon',
  'question-circle-o': 'far fa-question-circle',
  'times-circle-o': 'far fa-times-circle',
  'check-circle-o': 'far fa-check-circle',
  'dot-circle-o': 'far fa-dot-circle',
  'arrow-circle-o-right': 'far fa-arrow-alt-circle-right',
  'arrow-circle-o-left': 'far fa-arrow-alt-circle-left',
  'keyboard-o': 'far fa-keyboard',
  'building-o': 'far fa-building',
};

const angularFixes = [
  // The date format help is inline HTML that breaks inside a JS string; the component supplies it
  [/bsPopover: \{ trigger: 'focus', placement: 'bottom', html: true, title: 'Date Format Tokens', content: '.*?' \}">/s,
    "bsPopover: {\ntrigger: 'focus',\nplacement: 'bottom',\nhtml: true,\ntitle: 'Date Format Tokens',\ncontent:$root.dateFormatPopoverContent\n}\">"],
  // Back-ticks would end the template string
  [/`'all 0\.3s ease'`/g, "'all 0.3s ease'"],
  [/data-bind="with: DrillDownData, attr: \{class: 'table table-hover table-condensed '\}"/g, 'data-bind="with: DrillDownData"'],
  [/class="bubble-badge bg-primary"/g, 'class="bubble-badge"'],
  [/class="fa fa-signal" aria-hidden="true" title="Include in series"/g, 'class="fas fa-signal" aria-hidden="true" title="Include in series"'],
  [/(<!-- ko if: \$parent\.userSource\(\) === 'sql' -->\s*)<div class="mb-3">/g, `$1<div class="mb-3" data-bind="if: $parent.userSource() === 'sql'">`],
];

function toAngular(html) {
  html = html.replace(/\bpull-left\b/g, 'float-start').replace(/\bpull-right\b/g, 'float-end');
  html = html.replace(/\bfa fa-([a-z0-9-]+-o(?:-[a-z]+)?)\b/g, (match, name) => outlineIcons[name] || match);
  for (const [find, replace] of angularFixes) html = html.replace(find, replace);
  return html;
}

// The components show their own "Account not Setup" message; the main app's points to its own setup pages
function useAngularNoAccountModal(html) {
  const start = html.indexOf('<div class="modal" id="noaccountModal"');
  const end = start < 0 ? -1 : html.indexOf('<script', start);
  if (start < 0 || end < 0) throw new Error('noaccountModal not found in the templates partial');
  const angularModal = normalize(fs.readFileSync(path.join(here, 'noaccount-modal.html'), 'utf8'));
  return html.slice(0, start) + angularModal + html.slice(end);
}

const escapeForTemplateString = s => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

// Index after the "}" that closes the block opening at text[open]
function blockEnd(text, open, file) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return i + 1;
  }
  throw new Error('Unbalanced braces in ' + file);
}

// The page markup of a view: @{ } and @section blocks are dropped (keeping the head section's <style>
// blocks), and the admin mode @if is kept since the markup has its own visible binding.
function viewPage(file) {
  let html = read(file).replace(/@\*[\s\S]*?\*@/g, '').replace(/^@using .*$/gm, '');
  let styles = '';
  const razorBlock = /@(?:section\s+(\w+)\s*|if\s*\(ViewBag\.AllowAdminMode == true\)\s*)?\{/g;
  let m;
  while ((m = razorBlock.exec(html))) {
    const open = m.index + m[0].length - 1;
    const end = blockEnd(html, open, file);
    const inner = html.slice(open + 1, end - 1);
    const keep = m[0].startsWith('@if') ? inner : '';
    if (m[1] === 'head') styles += (inner.match(/<style[\s\S]*?<\/style>/g) || []).join('\n');
    html = html.slice(0, m.index) + keep + html.slice(end);
    razorBlock.lastIndex = m.index;
  }
  return toAngular((styles ? styles + '\n' : '') + html.trim() + '\n');
}

const reportTemplates = toAngular(useAngularNoAccountModal(read('Views/Shared/_DotnetReportTemplatesPartial.cshtml')));
const pages = {
  REPORT_PAGE: viewPage('Views/DotNetReport/Index.cshtml'),
  DASHBOARD_PAGE: viewPage('Views/DotNetReport/Dashboard.cshtml'),
  SETUP_PAGE: viewPage('Views/DotNetSetup/Index.cshtml'),
  USERS_PAGE: viewPage('Views/DotNetSetup/Users.cshtml'),
};

// Ids the components look up before binding, so a renamed element fails here instead of at runtime
const required = {
  REPORT_PAGE: ['modal-reportbuilder'],
  DASHBOARD_PAGE: ['modal-reportbuilder'],
  SETUP_PAGE: [],
  USERS_PAGE: ['users-access'],
};
for (const [name, html] of Object.entries(pages)) {
  const leftover = html.match(/@(model|Html|Url|await|if|foreach|section|using|\{|ViewBag|Model)\b/);
  if (leftover) throw new Error(`Razor syntax left in ${name}: ${leftover[0]}`);
  const missing = required[name].filter(id => !html.includes(`id="${id}"`) && !reportTemplates.includes(`id="${id}"`));
  if (missing.length) throw new Error(`${name} is missing #${missing.join(', #')}`);
}
const leftover = reportTemplates.match(/@(model|Html|await|if|foreach|\{|ViewBag|Model)\b/);
if (leftover) throw new Error('Razor syntax left in the templates: ' + leftover[0]);

const source = `// Generated by scripts/sync-templates.mjs from the main app's Razor views. Do not edit by hand:
// change the views, then run "npm run sync-templates".

export const REPORT_TEMPLATES = \`${escapeForTemplateString(reportTemplates)}\`;

export const SETUP_TEMPLATES = REPORT_TEMPLATES;
${Object.entries(pages).map(([name, html]) => `\nexport const ${name} = \`${escapeForTemplateString(html)}\`;\n`).join('')}`;
fs.writeFileSync(output, source);
const count = (reportTemplates.match(/type="text\/html"/g) || []).length;
console.log(`sync-templates: ${count} templates and ${Object.keys(pages).length} pages from ${mainApp} written to ${path.relative(workspace, output)}`);
