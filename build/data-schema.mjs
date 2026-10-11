// Native, dependency-free schema descriptors. No runtime/editor state belongs here.
const string = { type: 'string' };
const text = { type: 'string', nonempty: true };
const id = { type: 'string', pattern: /^[A-Za-z][A-Za-z0-9_-]*$/ };
const number = { type: 'number' };
const positive = { type: 'integer', min: 1 };
const enumeration = (...values) => ({ enum: values });
const array = (items, min = 0) => ({ type: 'array', items, min });
const object = (required, optional = {}) => ({ type: 'object', required, optional });
const sourceIds = array(id);
const timing = object({ seconds: { type: 'number', min: 0 }, status: enumeration('estimated', 'verified'), clock: enumeration('main', 'quiz') });
const presenter = object({ script: string }, {
  transition: string, cues: array(string), anticipatedQuestions: array(object({ question: text, answer: text, sources: sourceIds }))
});
const audience = object({ heading: string, body: string, keys: array(string) }, { gloss: string });
const claim = object({
  id, field: enumeration('heading', 'body', 'keys'),
  kind: enumeration('fact', 'policy_intention', 'illustration', 'demonstrated_outcome'),
  verification: enumeration('verified', 'unverified', 'not_applicable'), sources: sourceIds
}, { uncertainty: text });
const transform = object({}, {
  x: number, y: number, width: { type: 'number', min: 0 }, height: { type: 'number', min: 0 },
  scale: { type: 'number', min: 0 }, rotation: number, opacity: { type: 'number', min: 0, max: 1 },
  font: string, fontSize: { type: 'number', min: 0 }, color: string, depth: number,
  backgroundSensitivity: { type: 'number', min: 0 }, cameraPerspective: number
});
const editableObject = object({ id, type: enumeration('text', 'image'), transform }, { text: string, assetId: id });
const quiz = object({
  id,
  audience: object({ question: text, options: array(object({ id: enumeration('A', 'B', 'C', 'D'), text }), 4) }),
  assessment: object({ correctAnswerId: enumeration('A', 'B', 'C', 'D'), explanation: text }),
  behavior: object({
    reveal: enumeration('after-submit'), submit: enumeration('evaluate-selection'),
    reset: enumeration('clear-selection-and-feedback'), autoAdvance: enumeration(false)
  })
});
const visual = object({}, {
  citizenId: id, label: string,
  representation: enumeration('symbolic-blocks', 'illustrative-workflow', 'citizen-journey'),
  before: positive, after: positive, unchanged: positive, rearranged: positive, mergedGroups: positive,
  steps: array(string), help: object({ label: enumeration('Help'), connected: enumeration(true) })
});
const scene = object({
  id: positive, order: positive, chapter: positive, title: string, subtitle: string,
  kind: enumeration('cover', 'system', 'maze', 'history', 'map', 'integrity', 'services', 'divider', 'responsibility', 'vision', 'quiz', 'outro'),
  beats: array(object({ id, order: positive, label: text, audience, presenter }, { claims: array(claim), objects: array(editableObject) }), 1),
  sources: sourceIds
}, { timing, quiz, visual, layout: object({}, { cameraPerspective: number, parallaxDepth: number }) });

export const presentationSchema = object({
  schemaVersion: enumeration(1),
  title: enumeration('REFORMING VIETNAM’S POLITICAL SYSTEM'),
  course: enumeration('History of the Communist Party of Vietnam'), topic: enumeration('Topic 6'),
  languages: object({ audience: enumeration('en'), presenter: enumeration('en'), editor: enumeration('vi'),
    gloss: object({ language: enumeration('vi'), enabledByDefault: enumeration(false) }) }),
  members: array(text, 1),
  chapters: array(object({ id: positive, order: positive, title: text }), 8),
  characters: array(object({ id, style: enumeration('minimal-stylized-citizen') }), 1),
  refs: array(object({ id, title: text, url: string, note: string }, {
    publisher: string, date: string, origin: enumeration('supplied', 'cross_check'),
    verification: enumeration('unreviewed', 'verified', 'unverified'), verificationNote: text
  }), 1),
  scenes: array(scene, 15)
}, {
  assets: array(object({ id, mime: enumeration('image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'), data: text }, {
    width: positive, height: positive, originalAssetId: id
  })),
  teamAssignments: array(object({ member: text, role: text, contribution: string }))
});

export const storyContract = Object.freeze({
  chapters: [1, 1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 8, 8],
  kinds: ['cover', 'system', 'maze', 'history', 'map', 'integrity', 'services', 'divider', 'responsibility', 'vision', 'quiz', 'quiz', 'quiz', 'quiz', 'outro'],
  answers: ['D', 'A', 'C', 'B']
});
