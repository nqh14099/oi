import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { assembleHTML, readInputs, serializeData, validateHTML } from '../build/assemble.mjs';

const files = await readInputs();
const data = JSON.parse(files['content.json']);
const html = assembleHTML(files);
const script = (html, id) => html.match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)</script>`))[1];
test('deterministic output, exact data, four inline scripts and no remaining template slots', () => {
  assert.equal(assembleHTML(files), html);
  assert.deepEqual(validateHTML(html, data), { scenes: 15, scripts: 4, assets: 0 });
  // Three.js legitimately uses window.__THREE__; it is not a template slot.
  for (const token of ['__CSS__', '__DATA__', '__THREE__', '__WORLD__', '__APP__']) assert.ok(!html.includes(`>${token}<`));
});
test('CommonJS Three initializes and the actual linked module graph works without require/import', () => {
  const context = { console, AbortController };
  const result = runInNewContext(script(html, 'three-runtime') + script(html, 'world-engine') +
    script(html, 'app-runtime').split('CPVBootstrap.startPresentation(')[0] +
    `\nconst navigation = CPVNavigation.createSceneController(${serializeData(data)});
    navigation.next(); const next = navigation.getState(); navigation.previous();
    [CPVThree.REVISION, next.beatIndex, navigation.getState().beatIndex, typeof CPVInput.createInputController,
      CPVWorld.createWorldMaterial(CPVThree, 'gold').isMaterial, typeof CPVWorld.createWorldEngine];`, context);
  assert.deepEqual(Array.from(result), ['180', 1, 0, 'function', true, 'function']);
  assert.ok(html.includes(files['vendor/THREE-LICENSE.txt']));
});
test('editable hostile strings stay JSON data, never markup or replacement directives', () => {
  const changed = structuredClone(data);
  changed.scenes[0].beats[0].audience.body = '</script><script>throw 123</script><img src=x onerror=alert(1)> __APP__ $& \u2028\u2029';
  const output = assembleHTML({ ...files, 'content.json': JSON.stringify(changed) });
  assert.deepEqual(JSON.parse(script(output, 'presentation-data')), changed);
  assert.equal([...output.matchAll(/<script\b/gi)].length, 4);
  assert.ok(!output.includes('<img src=x'));
  assert.ok(!files['bootstrap.mjs'].includes('innerHTML'));
});
test('missing inputs, incorrect/duplicate/unknown placeholder contexts fail explicitly', async () => {
  assert.throws(() => assembleHTML({ ...files, 'world.js': '' }), /Missing or empty input/);
  for (const template of [files['shell.html'].replace('id="app-style"', 'id="wrong"'), files['shell.html'] + '__CSS__', files['shell.html'] + '__UNKNOWN__']) {
    assert.throws(() => assembleHTML({ ...files, 'shell.html': template }), /placeholder|context|Template/);
  }
  await assert.rejects(readInputs('/not-a-project'), /Required input build\//);
});
test('invalid data, unexpected module dependencies and CSS terminators fail before output', () => {
  const bad = structuredClone(data); bad.scenes.pop();
  assert.throws(() => assembleHTML({ ...files, 'content.json': JSON.stringify(bad) }), /Content validation/);
  assert.throws(() => assembleHTML({ ...files, 'input-controller.mjs': 'import x from "elsewhere";\n' + files['input-controller.mjs'] }), SyntaxError);
  assert.throws(() => assembleHTML({ ...files, 'style.css': '</style>' }), /terminator/);
});
test('runtime resources must be embedded; citation URLs in data are allowed', () => {
  assert.throws(() => assembleHTML({ ...files, 'shell.html': files['shell.html'].replace('</head>', '<link href="https://example.com/font.css" rel="stylesheet"></head>') }), /external resource/);
  for (const resource of ['url(./asset.png)', 'url("https://example.com/a.png")', 'url(blob:temporary)']) {
    assert.throws(() => assembleHTML({ ...files, 'style.css': files['style.css'] + `.probe{background:${resource}}` }), /unbundled CSS/);
  }
  const embedded = assembleHTML({ ...files, 'style.css': files['style.css'] + '.probe{background:url("data:image/png;base64,YQ==")}' });
  assert.ok(embedded.includes('data:image/png;base64,YQ=='));
  assert.ok(data.refs.some(source => source.url.startsWith('https://')));
});
test('registered assets are carried in JSON and missing asset references are rejected', () => {
  const changed = structuredClone(data);
  changed.assets = [{ id: 'test-image', mime: 'image/png', data: 'data:image/png;base64,YQ==' }];
  const output = assembleHTML({ ...files, 'content.json': JSON.stringify(changed) });
  assert.equal(validateHTML(output, changed).assets, 1);
  changed.assets[0].data = './test-image.png';
  assert.throws(() => assembleHTML({ ...files, 'content.json': JSON.stringify(changed) }), /embedded base64/);
});
