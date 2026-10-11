import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validatePresentation } from '../build/validate-data.mjs';

const fixture = JSON.parse(readFileSync(new URL('../build/content.json', import.meta.url), 'utf8'));
const cli = fileURLToPath(new URL('../scripts/validate-presentation.mjs', import.meta.url));
test('approved data validates, narration/quiz estimates remain separate', () => {
  assert.deepEqual(validatePresentation(fixture), { valid: true, errors: [] });
  const total = clock => fixture.scenes.filter(s => s.timing.clock === clock).reduce((n, s) => n + s.timing.seconds, 0);
  assert.equal(total('main'), 660); assert.equal(total('quiz'), 300);
});
test('optional timing, assets, claim classifications and presenter cues work', () => {
  const data = structuredClone(fixture); delete data.scenes[0].timing;
  data.assets = [{ id: 'image-original', mime: 'image/png', data: 'data:image/png;base64,YQ==' }];
  const b = data.scenes[0].beats[0];
  b.objects = [{ id: 'image-1', type: 'image', assetId: 'image-original', transform: { opacity: 0.5 } }];
  b.presenter.transition = 'Continue to the system.';
  b.claims = [
    { id: 'illustration-1', field: 'heading', kind: 'illustration', verification: 'not_applicable', sources: [] },
    { id: 'uncertain-1', field: 'body', kind: 'fact', verification: 'unverified', sources: [], uncertainty: 'Source review pending.' }
  ];
  assert.equal(validatePresentation(data).valid, true);
});
const invalid = [
  ['missing scene', d => d.scenes.pop(), /scenes/],
  ['extra scene', d => d.scenes.push(structuredClone(d.scenes[0])), /exactly 15/],
  ['chapter count', d => d.chapters.pop(), /chapters/],
  ['scene order', d => [d.scenes[0], d.scenes[1]] = [d.scenes[1], d.scenes[0]], /sequence|position/],
  ['chapter mapping', d => d.scenes[4].chapter = 3, /storyboard/],
  ['scene kind', d => d.scenes[2].kind = 'system', /SPEC scene/],
  ['duplicate scene ID', d => d.scenes[1].id = 1, /duplicate ID/],
  ['duplicate beat ID across scenes', d => d.scenes[1].beats[0].id = d.scenes[0].beats[0].id, /duplicate ID/],
  ['beat order', d => d.scenes[0].beats[0].order = 2, /position/],
  ['unknown source', d => d.scenes[0].sources.push('MISSING'), /unknown source/],
  ['duplicate source register ID', d => d.refs[1].id = d.refs[0].id, /duplicate ID/],
  ['private question source', d => d.scenes[0].beats[0].presenter.anticipatedQuestions = [{ question: 'Why?', answer: 'Explain.', sources: ['MISSING'] }], /unknown source/],
  ['wrong answer', d => d.scenes[10].quiz.assessment.correctAnswerId = 'A', /D \/ A \/ C \/ B/],
  ['missing option', d => d.scenes[10].quiz.audience.options.pop(), /options/],
  ['duplicate option ID', d => d.scenes[10].quiz.audience.options[1].id = 'A', /A–D/],
  ['quiz outside allowed scenes', d => d.scenes[0].quiz = structuredClone(d.scenes[10].quiz), /quiz required only/],
  ['missing quiz', d => delete d.scenes[10].quiz, /quiz required only/],
  ['explanation in audience', d => d.scenes[10].quiz.audience.explanation = 'Answer disclosed', /unknown field/],
  ['automatic advance', d => d.scenes[10].quiz.behavior.autoAdvance = true, /expected false/],
  ['premature reveal', d => d.scenes[10].quiz.behavior.reveal = 'always', /after-submit/],
  ['no reset contract', d => delete d.scenes[10].quiz.behavior.reset, /required/],
  ['different citizen', d => d.scenes[6].visual.citizenId = 'other-citizen', /citizenId/],
  ['missing citizen', d => delete d.scenes[2].visual.citizenId, /share a registered/],
  ['incorrect symbolic counts', d => d.scenes[4].visual.mergedGroups = 24, /63→34/],
  ['disconnected Help', d => d.scenes[6].visual.help.connected = false, /expected true/],
  ['ending body', d => d.scenes[14].beats[0].audience.body = 'Our future', /ending/],
  ['ending subtitle', d => d.scenes[14].subtitle = 'Sources', /ending/],
  ['ending image', d => d.scenes[14].beats[0].objects = [{ id: 'flag', type: 'text', text: 'Flag', transform: {} }], /ending/],
  ['quiz counted as narration', d => d.scenes[10].timing.clock = 'main', /outside main/],
  ['negative estimate', d => d.scenes[0].timing.seconds = -1, /minimum/],
  ['malformed presenter', d => d.scenes[0].beats[0].presenter = null, /expected object/],
  ['temporary state', d => d.currentScene = 1, /unknown field/],
  ['dangling image', d => d.scenes[0].beats[0].objects = [{ id: 'missing-image', type: 'image', assetId: 'MISSING', transform: {} }], /registered asset/],
  ['remote asset', d => d.assets = [{ id: 'remote', mime: 'image/png', data: 'https://example.org/image.png' }], /embedded/],
  ['source status without evidence', d => d.refs[0].verification = 'verified', /evidence note/],
  ['verified claim without source', d => d.scenes[0].beats[0].claims = [{ id: 'unsupported', field: 'body', kind: 'demonstrated_outcome', verification: 'verified', sources: [] }], /need sources/],
  ['unverified claim without uncertainty', d => d.scenes[0].beats[0].claims = [{ id: 'unsupported', field: 'body', kind: 'fact', verification: 'unverified', sources: [] }], /explicit uncertainty/]
];
for (const [name, mutate, message] of invalid) test(`rejects ${name}`, () => {
  const data = structuredClone(fixture); mutate(data);
  const result = validatePresentation(data);
  assert.equal(result.valid, false); assert.match(result.errors.join('\n'), message);
});
test('validator rejects malformed roots without throwing', () => {
  for (const value of [null, [], {}, 42]) assert.equal(validatePresentation(value).valid, false);
});
test('CLI exits 0 for fixture, 1 for malformed JSON and invalid data', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cpv-data-test-'));
  try {
    const run = path => spawnSync(process.execPath, [cli, path], { encoding: 'utf8' });
    assert.equal(spawnSync(process.execPath, [cli], { encoding: 'utf8', cwd: dir }).status, 0);
    const path = join(dir, 'invalid.json');
    writeFileSync(path, '{'); assert.equal(run(path).status, 1); assert.match(run(path).stderr, /FAIL/);
    writeFileSync(path, '{}'); assert.equal(run(path).status, 1); assert.match(run(path).stderr, /required/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
