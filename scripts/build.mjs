/**
 * Build and verification pass for the Ramble sorter package.
 *
 * The browser artifact is authored as the plain module-loader script the
 * Harness Client serves, so "build" here validates the exact files that will
 * be installed and exercises the pure sorter through the module's test hook.
 */
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

function readJson(relative) {
  return JSON.parse(readFileSync(join(root, relative), 'utf8'));
}

const pkg = readJson('package.json');

check('package name', pkg.name === 'dsh-ramble-sorter', pkg.name);
check('package version', /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(pkg.version), pkg.version);
check('bundle patch declared', pkg.dsh && pkg.dsh.bundle && pkg.dsh.bundle.patch === './cordis.patch.yml');
check(
  'client manifest',
  pkg.dsh && pkg.dsh.client && pkg.dsh.client.platform === 'web' && pkg.dsh.client.immediately === true,
  JSON.stringify(pkg.dsh && pkg.dsh.client)
);
check(
  'client injects shell packages',
  Array.isArray(pkg.dsh.client.inject) &&
    ['@deepseek-ai/dsh-client-locale', '@deepseek-ai/dsh-client-ui-layout', '@deepseek-ai/dsh-client-ui-sidebar'].every(
      (name) => pkg.dsh.client.inject.includes(name)
    )
);
check('module type', pkg.type === 'module');

for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (target.includes('*')) {
    check(`export ${subpath}`, readdirSync(join(root, dirname(target))).some((name) => name.endsWith('.json')));
  } else {
    let ok = true;
    try {
      statSync(join(root, target));
    } catch {
      ok = false;
    }
    check(`export ${subpath}`, ok, target);
  }
}

const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8').trim();
check('patch is an insert-only array', patch.startsWith('- insert:'));
check('patch has no groups or YAML extensions', !/!!|\bgroup\b|\binclude\b|&[a-z]|\*[a-z]/i.test(patch));
const patchId = (patch.match(/^\s*-\s*id:\s*'?([^'\n]+)'?$/m) || [])[1] || '';
const patchName = (patch.match(/^\s*name:\s*'?([^'\n]+)'?$/m) || [])[1] || '';
check('patch row id is package-prefixed', patchId.startsWith(`${pkg.name}:`), patchId);
check('patch row resolves this package', patchName === pkg.name, patchName);
check('single inserted row', (patch.match(/^\s*-\s*id:/gm) || []).length === 1);

for (const relative of ['locale/en.json', 'locale/zh.json']) {
  const locale = readJson(relative);
  check(`${relative} title`, typeof locale.meta.title === 'string' && locale.meta.title.length > 2);
  check(`${relative} description`, typeof locale.meta.description === 'string' && locale.meta.description.length > 20);
}

const icon = readFileSync(join(root, 'icon.svg'), 'utf8');
check('icon is SVG', /^<svg[\s>]/.test(icon.trim()) && /<\/svg>\s*$/.test(icon.trim()));
check('icon under 256 KiB', Buffer.byteLength(icon) < 256 * 1024, `${Buffer.byteLength(icon)} bytes`);

for (const entry of pkg.files) {
  if (entry.includes('*')) continue;
  let ok = true;
  try {
    statSync(join(root, entry));
  } catch {
    ok = false;
  }
  check(`file listed: ${entry}`, ok);
}

const client = readFileSync(join(root, 'client.js'), 'utf8');
check('client module id matches package', client.includes(`id: '${pkg.name}'`));
check(
  'client does not persist or archive',
  !/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/.test(client)
);
check(
  'client only calls the sort route',
  !/XMLHttpRequest/.test(client) &&
    (client.match(/fetch\s*\(/g) || []).length === 1 &&
    client.includes("fetch('/ramble-sorter/sort'")
);

let captured = null;
const context = {
  window: {
    __ModuleLoader__: {
      load(definition) {
        captured = definition;
      },
    },
  },
  console,
  setTimeout,
  clearTimeout,
};
try {
  new vm.Script(client, { filename: 'client.js' }).runInNewContext(context);
  check('client script parses', true);
} catch (error) {
  check('client script parses', false, String(error && error.message));
}

const ReactStub = {
  createElement() {
    return null;
  },
  useState() {
    return [undefined, () => {}];
  },
  useEffect() {},
  useRef() {
    return { current: 0 };
  },
  Fragment: 'Fragment',
};

let api = null;
if (captured) {
  check('module id', captured.id === pkg.name, captured.id);
  try {
    api = captured.factory((name) => {
      if (name === 'react') return ReactStub;
      throw new Error(`unexpected require: ${name}`);
    });
    check('client exports apply', typeof api.apply === 'function');
    check(
      'client injects services',
      Array.isArray(api.inject) && ['slots', 'locale', 'layout'].every((name) => api.inject.includes(name))
    );
  } catch (error) {
    check('client factory runs', false, String(error && error.message));
  }
}

/* ---------- behaviour checks on the pure sorter ---------- */
if (api && api.__test) {
  const { analyze, buildBrief, buildFlowDocument, copyText } = api.__test;

  const sample = `ok so the sidebar, the session list — it keeps jumping to the top whenever a new message comes in, super annoying. I think it's the sort order, not sure. I want it to stay where it is unless I'm already at the top. oh and maybe pinning? not important. and don't touch the title generation, that works. actually wait, the jumping is only on mobile I think.`;
  const sampleAnalysis = analyze(sample);
  const sampleBrief = buildBrief(sampleAnalysis, {}, { assumeUnanswered: false });

  check('sample finds requirements', sampleBrief.requirements.length >= 1, String(sampleBrief.requirements.length));
  check('sample finds constraints', sampleBrief.constraints.length >= 1);
  check('sample finds a bug', sampleBrief.bugs.length >= 1);
  check('sample parks the pinning idea', sampleBrief.parked.length >= 1);
  check('sample labels the guess', sampleBrief.hypotheses.length >= 1);
  check(
    'sample resolves the pronoun',
    sampleBrief.requirements.some((requirement) => /session list/i.test(requirement.text)),
    sampleBrief.requirements.map((requirement) => requirement.text).join(' | ')
  );
  check(
    'sample scopes the bug from the correction',
    sampleBrief.bugs.some((bug) => /mobile/i.test(bug.where)),
    sampleBrief.bugs.map((bug) => bug.where).join(' | ')
  );
  const sampleMarkdown = sampleBrief.markdown;
  for (const heading of [
    '## Goal',
    '## Requirements',
    '## Constraints',
    '## Bug reports',
    '## Not now (non-goals)',
    '## Hypotheses (unverified)',
    '## Open questions',
  ]) {
    check(`sample markdown has ${heading}`, sampleMarkdown.includes(heading));
  }
  check(
    'assumptions stay in the four large categories',
    sampleBrief.assumptions.every((assumption) => ['scope', 'target', 'ordering', 'intent'].includes(assumption.kind))
  );
  check(
    'assumptions never mention spelling or grammar',
    sampleBrief.assumptions.every((assumption) => !/spelling|grammar|typo/i.test(assumption.text))
  );
  const copyKeys = new Set(
    Array.from(client.matchAll(/[^a-z]t(?:r)?\('([^']+)'/g))
      .map((match) => match[1])
      .filter((key) => !key.endsWith('.'))
  );
  for (const key of copyKeys) {
    check(`copy key exists: ${key}`, Object.prototype.hasOwnProperty.call(api.__test.EN, key));
  }
  check('no unanswered conflicts on the sample', sampleAnalysis.contradictions.length === 0, String(sampleAnalysis.contradictions.length));

  const compound = analyze('Add a refresh button and remove the old toolbar.');
  check('compound ask splits', compound.requirements.length === 2, String(compound.requirements.length));

  const fix = analyze('Stop the list from jumping when a message arrives.');
  check(
    'imperative “stop” stays a requirement',
    fix.requirements.length === 1 && fix.constraints.length === 0,
    `${fix.requirements.length} requirements / ${fix.constraints.length} constraints`
  );

  const vague = analyze('Make the panel faster.');
  check(
    'vague target becomes an explicit question',
    vague.openQuestions.some((question) => /No measurable target/.test(question)),
    vague.openQuestions.join(' | ')
  );

  const scoped = analyze('It only jumps on mobile. It also jumps on desktop too.');
  check('scope contradiction detected', scoped.contradictions.some((conflict) => conflict.kind === 'scope'));

  const unresolved = analyze('Fix it.');
  check(
    'unresolved reference becomes an open question',
    unresolved.openQuestions.some((question) => /what does “it” refer to/i.test(question)),
    unresolved.openQuestions.join(' | ')
  );

  const conflictText =
    'Change the title generation to include dates, and do not touch the title generation.';
  const conflict = analyze(conflictText);
  check('contradiction detected', conflict.contradictions.length >= 1, String(conflict.contradictions.length));
  const conflictBrief = buildBrief(conflict, {}, { assumeUnanswered: true });
  check('draft-anyway keeps an assumption', conflictBrief.assumptions.length >= 1);
  check(
    'draft-anyway keeps an open question',
    conflictBrief.questions.some((question) => /Unresolved/i.test(question))
  );
  const firstConflict = conflict.contradictions[0];
  const answeredBrief = firstConflict
    ? buildBrief(
        conflict,
        { [firstConflict.id]: { value: 'keep', text: '' } },
        { assumeUnanswered: false }
      )
    : { decisions: [] };
  check(
    'answered conflict becomes a decision',
    answeredBrief.decisions.length >= 1,
    answeredBrief.decisions.join(' | ')
  );

  const empty = analyze('   ');
  check('empty input stays empty', empty.requirements.length === 0 && empty.bugs.length === 0);

  const page = buildFlowDocument(sampleBrief);
  check('diagram page is standalone HTML', page.startsWith('<!doctype html>') && page.includes('</html>'));
  check('diagram page has no external resources', !/https?:\/\//.test(page));
  check('diagram page is labelled Archify', /Archify page/.test(page));

  const copied = copyText(sampleBrief);
  check('copy keeps the must tone', /\*\*must\*\*/.test(copied));
  check('copy carries assumptions as a footnote', !sampleBrief.assumptions.length || /not instructions/.test(copied));

  /* ---------- lifecycle: register and release both halves ---------- */
  const applied = [];
  const disposers = [];
  let activePanel = 'ramble-sorter';
  const fakeCtx = {
    effect(callback, label) {
      const dispose = callback();
      disposers.push(dispose);
      applied.push(`effect:${label}`);
      return dispose;
    },
    locale: {
      register(namespace) {
        applied.push(`dictionary:${namespace}`);
        return () => {};
      },
      bind() {
        return (key) => api.__test.EN[key] || key;
      },
    },
    slots: {
      inject(name, callback) {
        applied.push(`inject:${name}`);
        const dispose = callback();
        disposers.push(dispose);
        return dispose;
      },
      register(options) {
        applied.push(`register:${options.name}:${options.id || options.key}`);
        return () => {};
      },
    },
    layout: {
      selectPanel(id) {
        applied.push(`select:${id}`);
      },
      panelInfo: {
        getSnapshot() {
          return { activePanelId: activePanel };
        },
      },
    },
  };
  api.apply(fakeCtx);
  check('host lifecycle registers locale', applied.includes('dictionary:ramble-sorter'));
  check(
    'host lifecycle registers sidebar entry',
    applied.includes('register:sidebar.panellist:ramble-sorter')
  );
  check('host lifecycle registers main page', applied.includes('register:main:ramble-sorter'));
  for (const dispose of disposers.reverse()) if (typeof dispose === 'function') dispose();
  check('disposal leaves our own panel', applied.includes('select:null'), applied.join(', '));
  activePanel = 'plugins';
  applied.length = 0;
  api.apply(fakeCtx);
  for (const dispose of disposers.splice(0).reverse()) if (typeof dispose === 'function') dispose();
  check(
    'disposal keeps a different panel selected',
    !applied.includes('select:null'),
    applied.join(', ')
  );
}

const passed = checks.filter((entry) => entry.ok).length;
console.log(`Ramble sorter build: ${passed}/${checks.length} checks passed`);
for (const failure of failures) console.error(`FAIL ${failure}`);
if (failures.length) process.exit(1);
