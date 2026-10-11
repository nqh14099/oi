import { presentationSchema, storyContract } from './data-schema.mjs';

// Returns path-qualified errors; validates data only, never academic truth or UI behavior.
export function validatePresentation(data) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  function check(value, schema, path) {
    if (schema.enum) {
      if (!schema.enum.includes(value)) fail(path, `expected ${schema.enum.map(v => JSON.stringify(v)).join(' | ')}`);
      return;
    }
    const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (schema.type === 'integer' ? !Number.isSafeInteger(value) : type !== schema.type) {
      fail(path, `expected ${schema.type}`); return;
    }
    if ((type === 'number') && !Number.isFinite(value)) { fail(path, 'expected finite number'); return; }
    if (schema.min !== undefined && (type === 'array' ? value.length : value) < schema.min) fail(path, `minimum ${schema.min}`);
    if (schema.max !== undefined && value > schema.max) fail(path, `maximum ${schema.max}`);
    if (schema.nonempty && !value.trim()) fail(path, 'must not be blank');
    if (schema.pattern && !schema.pattern.test(value)) fail(path, 'invalid ID');
    if (type === 'array') value.forEach((v, i) => check(v, schema.items, `${path}[${i}]`));
    if (type === 'object') {
      const fields = { ...schema.required, ...schema.optional };
      for (const key of Object.keys(schema.required)) if (!Object.hasOwn(value, key)) fail(`${path}.${key}`, 'required');
      for (const [key, val] of Object.entries(value)) {
        if (!Object.hasOwn(fields, key)) fail(`${path}.${key}`, 'unknown field (runtime state is not content)');
        else check(val, fields[key], `${path}.${key}`);
      }
    }
  }
  check(data, presentationSchema, '$');
  // Shape errors are enough to reject the input; do not dereference malformed values.
  if (errors.length) return { valid: false, errors };
  const unique = (items, path, key = 'id') => {
    const ids = new Set();
    items.forEach((item, i) => { if (ids.has(item[key])) fail(`${path}[${i}].${key}`, 'duplicate ID'); ids.add(item[key]); });
    return ids;
  };
  const ordered = (items, path) => items.forEach((v, i) => { if (v.order !== i + 1) fail(`${path}[${i}].order`, 'must match array position'); });
  unique(data.scenes, '$.scenes'); unique(data.chapters, '$.chapters');
  const refs = unique(data.refs, '$.refs');
  const characters = unique(data.characters, '$.characters');
  const assets = unique(data.assets ?? [], '$.assets');
  const cite = (ids, path) => {
    const seen = new Set();
    ids.forEach((id, i) => { if (!refs.has(id)) fail(`${path}[${i}]`, `unknown source ${id}`); if (seen.has(id)) fail(`${path}[${i}]`, 'duplicate source'); seen.add(id); });
  };
  ordered(data.scenes, '$.scenes'); ordered(data.chapters, '$.chapters');
  if (data.scenes.length !== 15) fail('$.scenes', 'exactly 15 scenes required');
  if (data.chapters.length !== 8) fail('$.chapters', 'exactly 8 chapters required');
  data.chapters.forEach((c, i) => { if (c.id !== i + 1) fail(`$.chapters[${i}].id`, 'chapter sequence must be 1–8'); });
  const beatIds = new Set(), quizIds = new Set(), objectIds = new Set(), claimIds = new Set();
  const register = (set, id, path) => { if (set.has(id)) fail(path, 'duplicate ID'); set.add(id); };
  data.scenes.forEach((s, i) => {
    const path = `$.scenes[${i}]`;
    if (s.id !== i + 1) fail(`${path}.id`, 'scene sequence must be 1–15');
    if (s.chapter !== storyContract.chapters[i]) fail(`${path}.chapter`, 'does not match SPEC storyboard');
    if (s.kind !== storyContract.kinds[i]) fail(`${path}.kind`, 'does not match SPEC scene');
    cite(s.sources, `${path}.sources`); ordered(s.beats, `${path}.beats`);
    if (s.timing && s.timing.clock !== (i >= 10 && i <= 13 ? 'quiz' : 'main')) fail(`${path}.timing.clock`, 'quiz time must remain outside main narration');
    s.beats.forEach((b, j) => {
      const bp = `${path}.beats[${j}]`; register(beatIds, b.id, `${bp}.id`);
      for (const [k, q] of (b.presenter.anticipatedQuestions ?? []).entries()) cite(q.sources, `${bp}.presenter.anticipatedQuestions[${k}].sources`);
      for (const [k, c] of (b.claims ?? []).entries()) {
        const cp = `${bp}.claims[${k}]`; register(claimIds, c.id, `${cp}.id`); cite(c.sources, `${cp}.sources`);
        if (c.kind === 'illustration' && c.verification !== 'not_applicable') fail(cp, 'illustrations are not verified outcomes');
        if (c.kind !== 'illustration' && c.verification === 'not_applicable') fail(cp, 'factual/policy/outcome claims require verification status');
        if (c.verification === 'verified' && !c.sources.length) fail(cp, 'verified claims need sources');
        if (c.verification === 'unverified' && !c.uncertainty) fail(cp, 'unverified claims need explicit uncertainty');
      }
      for (const [k, o] of (b.objects ?? []).entries()) {
        const op = `${bp}.objects[${k}]`; register(objectIds, o.id, `${op}.id`);
        if (o.type === 'image' && (!o.assetId || !assets.has(o.assetId))) fail(`${op}.assetId`, 'image needs a registered asset');
        if (o.type === 'image' && o.text !== undefined) fail(op, 'image content must use assetId');
        if (o.type === 'text' && (o.text === undefined || o.assetId !== undefined)) fail(op, 'text needs text content and no assetId');
      }
    });
    if (s.visual?.citizenId && !characters.has(s.visual.citizenId)) fail(`${path}.visual.citizenId`, 'unknown character');
    const isQuiz = i >= 10 && i <= 13;
    if (Boolean(s.quiz) !== isQuiz) fail(`${path}.quiz`, 'quiz required only in scenes 11–14');
    if (s.quiz) {
      register(quizIds, s.quiz.id, `${path}.quiz.id`);
      if (s.quiz.audience.options.length !== 4 || s.quiz.audience.options.map(o => o.id).join('') !== 'ABCD') fail(`${path}.quiz.audience.options`, 'exactly A–D in order required');
      if (s.quiz.assessment.correctAnswerId !== storyContract.answers[i - 10]) fail(`${path}.quiz.assessment.correctAnswerId`, 'expected D / A / C / B');
    }
  });
  const maze = data.scenes.find(s => s.id === 3), service = data.scenes.find(s => s.id === 7);
  if (!maze?.visual?.citizenId || maze.visual.citizenId !== service?.visual?.citizenId) fail('$.scenes', 'scenes 3 and 7 must share a registered citizenId');
  if (maze?.visual?.label !== 'Illustrative workflow') fail('$.scenes[2].visual.label', 'Illustrative workflow label required');
  if (service?.visual?.steps?.join('|') !== 'Submit|Process|Track|Receive' || !service.visual.help?.connected) fail('$.scenes[6].visual', 'four service steps and connected Help required');
  const map = data.scenes.find(s => s.id === 5)?.visual;
  if (!map || map.representation !== 'symbolic-blocks' || map.label !== 'Stylized illustration' || map.before !== 63 || map.after !== 34 || map.unchanged !== 11 || map.rearranged !== 52 || map.mergedGroups !== 23) fail('$.scenes[4].visual', '63→34 symbolic block contract required (11 + 52→23)');
  const end = data.scenes.find(s => s.id === 15);
  if (!end || end.title !== 'Thank you for listening' || end.subtitle !== '' || end.beats.length !== 1 ||
      end.beats[0].audience.heading !== 'Thank you for listening' || end.beats[0].audience.body !== '' ||
      end.beats[0].audience.keys.length || end.beats[0].audience.gloss || end.beats[0].objects?.length || end.visual) fail('$.scenes[14]', 'audience ending must be only Thank you for listening');
  for (const [i, a] of (data.assets ?? []).entries()) {
    if (!a.data.startsWith(`data:${a.mime};base64,`) || !/^[A-Za-z0-9+/]+={0,2}$/.test(a.data.split(',')[1] ?? '')) fail(`$.assets[${i}].data`, 'expected embedded base64 data URI matching MIME');
    if (a.originalAssetId && (!assets.has(a.originalAssetId) || a.originalAssetId === a.id)) fail(`$.assets[${i}].originalAssetId`, 'must reference a different registered original');
  }
  for (const [i, a] of (data.teamAssignments ?? []).entries()) if (!data.members.includes(a.member)) fail(`$.teamAssignments[${i}].member`, 'unknown member');
  data.refs.forEach((r, i) => { if (r.verification === 'verified' && !r.verificationNote) fail(`$.refs[${i}].verificationNote`, 'verified source records need an evidence note'); });
  return { valid: errors.length === 0, errors };
}
