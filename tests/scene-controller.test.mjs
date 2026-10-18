import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSceneController } from '../build/scene-controller.mjs';

const data = JSON.parse(readFileSync(new URL('../build/content.json', import.meta.url), 'utf8'));
const position = state => [state.sceneId, state.beatIndex, state.beatId];
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('initial state is Scene 1 Beat 0 and snapshots are immutable', () => {
  const c = createSceneController(data), s = c.getState();
  assert.deepEqual(position(s), [1, 0, 's01-b01']); assert.equal(s.sceneIndex, 0);
  assert.equal(s.transition.status, 'idle'); assert.equal(s.transition.version, 0);
  assert.ok(Object.isFrozen(s)); assert.ok(Object.isFrozen(s.transition));
});
test('next consumes all beats before a scene change; previous reverses every step', () => {
  const c = createSceneController(data);
  const expected = data.scenes.flatMap(s => s.beats.map((b, i) => [s.id, i, b.id]));
  for (const p of expected.slice(1)) assert.deepEqual(position(c.next()), p);
  const end = c.getState(); assert.equal(c.next(), end);
  for (const p of expected.slice(0, -1).reverse()) assert.deepEqual(position(c.previous()), p);
  const start = c.getState(); assert.equal(c.previous(), start);
});
test('stable IDs and explicit zero-based indices resolve without numeric ambiguity', () => {
  const c = createSceneController(data);
  assert.deepEqual(position(c.goToScene(3, 2)), [3, 2, 's03-b03']);
  assert.deepEqual(position(c.goToScene('5', 1)), [5, 1, 's05-b02']);
  assert.equal(c.goToScene({ index: 5 }, 2).sceneId, 6);
  assert.equal(c.goToScene({ index: 14 }).sceneId, 15);
  assert.equal(c.goToScene(0).sceneId, 1);
  assert.equal(c.goToScene(7).beatIndex, 0);
});
test('source content remains unchanged; controller stores IDs, not narration', () => {
  const fixture = structuredClone(data), before = JSON.stringify(fixture);
  const c = createSceneController(fixture); c.goToScene(3, 2); c.replay();
  assert.equal(JSON.stringify(fixture), before);
  assert.equal(Object.hasOwn(c.getState(), 'audience'), false);
  fixture.scenes[2].id = 99; fixture.scenes[2].beats.pop();
  assert.equal(c.goToScene(3, 5).beatId, 's03-b06');
});
test('subscribers receive exact beat/scene changes, with no duplicate no-op events', () => {
  const c = createSceneController(data), events = [];
  const unsubscribe = c.subscribe((s, e) => events.push({ s, e }));
  c.previous(); c.goToScene(1); assert.equal(events.length, 0);
  c.next(); c.next(); c.goToScene(2, 0);
  assert.equal(events.length, 2); assert.deepEqual(events.map(v => v.e.sceneChanged), [false, true]);
  assert.deepEqual(events.map(v => [v.s.sceneId, v.s.beatIndex]), [[1, 1], [2, 0]]);
  assert.ok(events.every(v => Object.isFrozen(v.e)));
  unsubscribe(); c.next(); assert.equal(events.length, 2);
});
test('replay preserves position, increments its token, and never resets external quiz/audio data', () => {
  const c = createSceneController(data); c.goToScene(11);
  const old = c.getState(), external = { submitted: true, muted: true }; let event;
  c.subscribe((_, e) => { event = e; });
  const replayed = c.replay(); assert.deepEqual(position(replayed), position(old));
  assert.equal(replayed.transition.version, old.transition.version + 1);
  assert.equal(event.type, 'replay'); assert.equal(event.sceneChanged, false);
  assert.deepEqual(external, { submitted: true, muted: true });
});
test('invalid direct requests throw without changing state or notifying', () => {
  const c = createSceneController(data); c.goToScene(3, 1); let calls = 0; c.subscribe(() => calls++);
  const before = c.getState();
  for (const target of [99, -1, 1.5, NaN, Infinity, null, undefined, 'missing', {}, { index: -1 }, { index: 15 }, { index: 1.5 }, { index: 0, extra: true }]) assert.throws(() => c.goToScene(target), RangeError);
  for (const b of [-1, 6, 1.5, NaN, '1', null]) assert.throws(() => c.goToScene(3, b), RangeError);
  assert.equal(c.getState(), before); assert.equal(calls, 0);
});
test('rapid navigation cancels old transitions and stale completion cannot replace the latest state', async () => {
  const tasks = [], c = createSceneController(data, { onTransition(ctx) { const d = deferred(); tasks.push({ ctx, ...d }); return d.promise; } });
  c.next(); c.next(); c.next();
  assert.deepEqual(position(c.getState()), [2, 1, 's02-b02']); assert.equal(c.getState().transition.status, 'running');
  assert.ok(tasks[0].ctx.signal.aborted && tasks[1].ctx.signal.aborted);
  assert.equal(tasks[0].ctx.isCurrent(), false); assert.equal(tasks[0].ctx.complete(), false);
  tasks[1].resolve(); tasks[0].reject(new Error('obsolete')); await flush();
  assert.equal(c.getState().transition.status, 'running'); assert.equal(tasks[2].ctx.isCurrent(), true);
  tasks[2].resolve(); await flush(); assert.equal(c.getState().transition.status, 'idle');
  assert.deepEqual(position(c.getState()), [2, 1, 's02-b02']);
});
test('completion hook finishes once; stale promises and no-op navigation do not notify again', async () => {
  const d = deferred(); let ctx; const events = [];
  const c = createSceneController(data, { onTransition(context) { ctx = context; return d.promise; } });
  c.subscribe((s, e) => events.push(e.type)); c.next();
  const token = c.getState().transition.version; c.goToScene(1, 1);
  assert.equal(c.getState().transition.version, token); assert.equal(ctx.signal.aborted, false);
  assert.equal(ctx.complete(), true); assert.equal(ctx.complete(), false);
  d.resolve(); await flush(); assert.deepEqual(events, ['navigate', 'transition-complete']);
});
test('replay cancels pending work at the same logical position', async () => {
  const tasks = [], c = createSceneController(data, { onTransition(ctx) { const d = deferred(); tasks.push({ ctx, ...d }); return d.promise; } });
  c.goToScene(5, 1); const before = position(c.getState()); c.replay();
  assert.deepEqual(position(c.getState()), before); assert.ok(tasks[0].ctx.signal.aborted);
  assert.equal(tasks[1].ctx.reason, 'replay'); tasks[0].resolve(); tasks[1].resolve(); await flush();
  assert.equal(c.getState().transition.status, 'idle');
});
test('synchronous/reduced-motion hooks settle without moving to another beat', () => {
  let count = 0; const c = createSceneController(data, { onTransition() { count++; } });
  assert.equal(c.next().transition.status, 'idle'); assert.equal(c.getState().beatIndex, 1); assert.equal(count, 1);
});
test('hook errors settle current transition, report once, and allow later navigation', async () => {
  const errors = [], events = []; const c = createSceneController(data, { onTransition() { throw new Error('failed'); }, onError: e => errors.push(e.message) });
  c.subscribe((s, e) => events.push(e)); c.next();
  assert.equal(c.getState().transition.status, 'idle'); assert.deepEqual(errors, ['failed']);
  assert.equal(events[1].type, 'transition-error'); assert.equal(events[1].sceneChanged, false);
  c.previous(); assert.equal(c.getState().beatIndex, 0);
  const d = deferred(); const async = createSceneController(data, { onTransition: () => d.promise, onError: e => errors.push(e.message) });
  async.next(); d.reject(new Error('async failed')); await flush();
  assert.equal(async.getState().transition.status, 'idle'); assert.equal(errors.at(-1), 'async failed');
});
test('a rejection with no error payload remains an error event', async () => {
  const events = [], errors = [];
  const c = createSceneController(data, { onTransition: () => Promise.reject(), onError: e => errors.push(e) });
  c.subscribe((_, event) => events.push(event)); c.next(); await flush();
  assert.equal(events.at(-1).type, 'transition-error'); assert.deepEqual(errors, [undefined]);
  assert.equal(c.getState().transition.status, 'idle');
});
test('subscriber failures and reentrant navigation cannot deliver obsolete states afterward', () => {
  const errors = [], seen = []; let redirected = false;
  const c = createSceneController(data, { onError: e => errors.push(e.message) });
  c.subscribe(() => { throw new Error('listener failed'); });
  c.subscribe(() => { if (!redirected) { redirected = true; c.goToScene(7, 2); } });
  c.subscribe(s => seen.push(position(s)));
  c.next(); assert.deepEqual(seen, [[7, 2, 's07-b03']]); assert.equal(errors.length, 2);
});
test('abort callbacks see the latest committed destination and may safely navigate again', () => {
  const tasks = []; let abortPosition;
  const c = createSceneController(data, { onTransition(ctx) { tasks.push(ctx); if (tasks.length === 1) ctx.signal.addEventListener('abort', () => { abortPosition = position(c.getState()); c.goToScene(7); }); return new Promise(() => {}); } });
  c.next(); c.next();
  assert.deepEqual(abortPosition, [2, 0, 's02-b01']); assert.equal(c.getState().sceneId, 7);
  assert.equal(tasks.length, 2); assert.equal(tasks[1].to.sceneId, 7); c.destroy();
});
test('unsubscribe/destroy during dispatch and late async completion are safe', async () => {
  const d = deferred(); let ctx, calls = 0;
  const c = createSceneController(data, { onTransition: context => { ctx = context; return d.promise; } });
  c.subscribe(() => calls++); c.next(); c.destroy(); c.destroy();
  assert.ok(ctx.signal.aborted); assert.equal(ctx.complete(), false);
  const frozen = c.getState(); assert.ok(frozen.destroyed);
  c.next(); c.previous(); c.replay(); c.goToScene(99); c.subscribe(() => calls++);
  d.resolve(); await flush(); assert.equal(c.getState(), frozen); assert.equal(calls, 1);
  const other = createSceneController(data); let later = 0;
  other.subscribe(() => other.destroy()); other.subscribe(() => later++); other.next(); assert.equal(later, 0);
  const third = createSceneController(data); let remove;
  third.subscribe(() => remove()); remove = third.subscribe(() => later++); third.next(); assert.equal(later, 0);
});
test('bad topology is reported precisely without inventing beats', () => {
  for (const [mutate, pattern] of [
    [d => d.scenes.pop(), /exactly 15/],
    [d => delete d.scenes[4].beats, /scenes\[4\]\.beats/],
    [d => d.scenes[4].beats = [], /scenes\[4\]\.beats/],
    [d => d.scenes[0].order = 2, /scenes\[0\]\.order/],
    [d => d.scenes[4].beats[1].order = 3, /scenes\[4\]\.beats\[1\]\.order/],
    [d => d.scenes[1].id = 1, /duplicate scene ID/],
    [d => d.scenes[1].beats[0].id = 's01-b01', /duplicate beat ID/],
    [d => delete d.scenes[2].beats[0].id, /scenes\[2\]\.beats\[0\]\.id/],
    [d => delete d.scenes[2].beats[1], /scenes\[2\]\.beats\[1\]\.id/],
    [d => delete d.scenes[2], /scenes\[2\]\.id/]
  ]) { const broken = structuredClone(data); mutate(broken); assert.throws(() => createSceneController(broken), pattern); }
  assert.throws(() => createSceneController(null), /scenes/);
  assert.throws(() => createSceneController(data, { onTransition: 1 }), /onTransition/);
  assert.throws(() => createSceneController(data).subscribe(null), /subscriber/);
});
