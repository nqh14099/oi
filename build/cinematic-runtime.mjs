/** Offline presentation orchestration. Content edits and temporary play state stay separate. */
export function startCinematicPresentation({ THREE, createSceneController, createInputController, createWorldEngine,
  createCinematicViews, registerCinematicWorld, createCinematicNumberAnimator }) {
  if (window.CPVApp) return window.CPVApp;
  // Capture the unmounted template, never the changing audience/editor DOM.
  const originalHTML = '<!doctype html>\n' + document.documentElement.outerHTML;
  const $ = id => document.getElementById(id);
  const viewport = $('viewport'), content = $('content'), controls = $('controls');
  const overlay = $('overlay'), panel = $('panel-content');
  const errors = [], cleanup = [], quizStates = new Map(), audioNodes = new Set();
  const objectURLs = new Set(), undo = [], redo = [];
  let data, navigation, world, input, views, worldScenes, destroyed = false;
  let notesWindow = null, focusReturn = null, activePanel = '', toastTimer, idleTimer, clockInterval;
  let transitionToken = 0, muted = true, audioContext = null, volume = 0.12;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches, quality = 'high';
  const numbers = createCinematicNumberAnimator({ roots: [content, $('scene-label'), $('chapter-label'), $('counter')], reducedMotion });
  const clock = { requested: false, elapsed: 0, activeSince: null };
  const baseline = new Map();
  let storageKey = '', restoredCount = 0;
  const make = (tag, text, className, doc = document) => {
    const node = doc.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  function listen(target, name, callback, options) {
    target.addEventListener(name, callback, options);
    cleanup.push(() => target.removeEventListener(name, callback, options));
  }
  function toast(message) {
    if (destroyed) return;
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3600);
  }
  function report(error) {
    const message = String(error?.message ?? error);
    errors.push(message);
    toast(`Presentation: ${message}`);
  }
  const currentScene = () => data.scenes[navigation.getState().sceneIndex];
  const currentBeat = () => currentScene().beats[navigation.getState().beatIndex];
  function quizState(scene = currentScene()) {
    if (!scene.quiz) return null;
    if (!quizStates.has(scene.id)) quizStates.set(scene.id, { selected: null, submitted: false });
    return quizStates.get(scene.id);
  }
  function editedValues(beat) {
    return { heading: beat.audience.heading, body: beat.audience.body, script: beat.presenter.script };
  }
  function validEdit(scene, patch) {
    return patch && typeof patch.heading === 'string' && patch.heading.trim().length > 0 && patch.heading.length <= 600 &&
      typeof patch.body === 'string' && patch.body.length <= 4000 && typeof patch.script === 'string' && patch.script.length <= 20000 &&
      (scene.id !== 15 || (patch.heading === 'Thank you for listening' && patch.body === ''));
  }
  function assignEdit(beat, patch) {
    beat.audience.heading = patch.heading;
    beat.audience.body = patch.body;
    beat.presenter.script = patch.script;
  }
  function persistEdits() {
    const edits = [];
    for (const scene of data.scenes) for (const beat of scene.beats) {
      const patch = editedValues(beat);
      if (JSON.stringify(patch) !== JSON.stringify(baseline.get(beat.id))) edits.push({ beatId: beat.id, ...patch });
    }
    try {
      if (edits.length) localStorage.setItem(storageKey, JSON.stringify({ version: 1, edits }));
      else localStorage.removeItem(storageKey);
      return true;
    } catch { return false; }
  }
  function restoreEdits(sourceJSON) {
    let hash = 2166136261;
    for (let index = 0; index < sourceJSON.length; index++) hash = Math.imul(hash ^ sourceJSON.charCodeAt(index), 16777619);
    storageKey = `cpv-cinematic-edits-v1:${location.pathname}:${hash >>> 0}`;
    for (const scene of data.scenes) for (const beat of scene.beats) baseline.set(beat.id, editedValues(beat));
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved?.version !== 1 || !Array.isArray(saved.edits)) return;
      for (const patch of saved.edits) {
        const scene = data.scenes.find(item => item.beats.some(beat => beat.id === patch.beatId));
        if (scene && validEdit(scene, patch)) {
          assignEdit(scene.beats.find(beat => beat.id === patch.beatId), patch);
          restoredCount++;
        }
      }
    } catch { /* file:// storage can be disabled; export remains available. */ }
  }
  function showControls() {
    if (destroyed) return;
    document.body.classList.add('show-controls');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!activePanel && !controls.contains(document.activeElement) && !window.matchMedia('(orientation: portrait)').matches)
        document.body.classList.remove('show-controls');
    }, 2800);
  }
  function stopAudio() {
    for (const oscillator of audioNodes) { try { oscillator.stop(); } catch {} }
    audioNodes.clear();
  }
  function playCue() {
    if (muted || !audioContext || document.hidden || activePanel || destroyed) return;
    if (audioContext.state === 'suspended') { audioContext.resume().catch(() => {}); return; }
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = 'sine';
    const time = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(392, time);
    oscillator.frequency.exponentialRampToValueAtTime(523.25, time + 0.08);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume * 0.3, time + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    audioNodes.add(oscillator);
    oscillator.onended = () => { audioNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time); oscillator.stop(time + 0.14);
  }
  // Scene 7 timeline cues share the user's existing audio permission and mute state.
  function playPressureCue(kind = 'tick', intensity = 1) {
    if (muted || reducedMotion || !audioContext || audioContext.state !== 'running' || document.hidden || activePanel || destroyed) return;
    if (kind && typeof kind === 'object') { intensity = kind.intensity ?? 1; kind = kind.type ?? 'tick'; }
    const level = Number.isFinite(intensity) ? Math.max(0, Math.min(1.6, intensity)) : 1;
    if (volume <= 0 || level <= 0) return;
    const layers = kind === 'impact' ? [
      ['sine', 118, 48, 0.18, 0.27], ['triangle', 1420, 290, 0.045, 0.08]
    ] : kind === 'click' ? [['triangle', 1260, 330, 0.055, 0.12]] : [['triangle', 1850, 740, 0.035, 0.065]];
    const time = audioContext.currentTime;
    for (const [wave, startHz, endHz, duration, amplitude] of layers) {
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(startHz, time);
      oscillator.frequency.exponentialRampToValueAtTime(endHz, time + duration);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume * level * amplitude, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      audioNodes.add(oscillator);
      oscillator.onended = () => { audioNodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(time); oscillator.stop(time + duration + 0.008);
    }
  }
  async function toggleMute() {
    muted = !muted;
    if (muted) stopAudio();
    else {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) { muted = true; toast('Sound is unavailable in this browser.'); }
      else {
        try { audioContext ??= new AudioCtor(); await audioContext.resume(); playCue(); }
        catch { muted = true; toast('Sound could not start. Try the Sound button again.'); }
      }
    }
    updateSoundButton();
  }
  function updateSoundButton() {
    const button = controls.querySelector('[data-action="mute"]');
    if (button) { button.setAttribute('aria-pressed', String(!muted)); button.textContent = muted ? 'Sound off' : 'Sound on'; }
  }
  function updateClock() {
    const now = performance.now();
    if (clock.activeSince !== null) clock.elapsed += Math.max(0, now - clock.activeSince);
    clock.activeSince = clock.requested && !document.hidden && currentScene().kind !== 'quiz' ? now : null;
  }
  function clockText() {
    const seconds = Math.floor((clock.elapsed + (clock.activeSince === null ? 0 : performance.now() - clock.activeSince)) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function clockDescription() {
    if (!clock.requested) return clock.elapsed ? 'Paused' : 'Ready — start manually';
    if (currentScene().kind === 'quiz') return 'Paused for quiz';
    if (document.hidden) return 'Paused while audience window is hidden';
    return 'Speaking timer running';
  }
  function setClock(action) {
    updateClock();
    if (action === 'reset') { clock.elapsed = 0; clock.requested = false; }
    else clock.requested = !clock.requested;
    clock.activeSince = null;
    updateClock(); updateNotesClock();
  }
  function transition(context) {
    const token = ++transitionToken;
    if (context.to.sceneId === 7) { content.classList.remove('is-transitioning'); return; }
    if (reducedMotion || document.hidden) return;
    return new Promise(resolve => {
      let timeout;
      const finish = () => {
        clearTimeout(timeout);
        context.signal.removeEventListener('abort', finish);
        if (token === transitionToken) content.classList.remove('is-transitioning');
        resolve();
      };
      content.classList.remove('is-transitioning');
      void content.offsetWidth;
      content.classList.add('is-transitioning');
      context.signal.addEventListener('abort', finish, { once: true });
      timeout = setTimeout(finish, 650);
    });
  }
  function render(state, event) {
    const scene = data.scenes[state.sceneIndex];
    document.body.dataset.scene = String(scene.id);
    document.body.dataset.beat = String(state.beatIndex);
    document.body.classList.toggle('is-outro', scene.id === 15);
    content.dataset.sceneId = String(scene.id); content.dataset.beatId = state.beatId;
    views.render(state, { quizState: quizState(scene), event, reducedMotion });
    if (activePanel || document.hidden) views.pause();
    if ($('scene-label')) $('scene-label').textContent = scene.id === 15 ? '' : `${String(scene.order).padStart(2, '0')} / 15`;
    if ($('counter')) $('counter').textContent = `${String(scene.order).padStart(2, '0')} / 15`;
    const chapter = data.chapters.find(item => item.id === scene.chapter);
    if ($('chapter-label')) $('chapter-label').textContent = scene.id === 15 ? '' : `${String(chapter.order).padStart(2, '0')} / ${chapter.title}`;
    if ($('beat-line')) {
      $('beat-line').style.width = `${100 * (state.beatIndex + 1) / scene.beats.length}%`;
      $('beat-line').hidden = scene.id === 15;
    }
    const previous = $('btn-prev') || controls.querySelector('[data-action="prev"]');
    const next = $('btn-next') || controls.querySelector('[data-action="next"]');
    if (previous) previous.disabled = state.sceneIndex === 0 && state.beatIndex === 0;
    if (next) next.disabled = state.sceneIndex === 14 && state.beatIndex === scene.beats.length - 1;
    if (scene.id === 15) { clearTimeout(idleTimer); document.body.classList.remove('show-controls'); }
    numbers.present(state, event);
    updateClock(); renderNotes();
    if (event?.type === 'navigate' && scene.id !== 7) playCue();
  }
  function closePanel() {
    if (!activePanel && !overlay.open) return false;
    activePanel = '';
    if (overlay.open) overlay.close();
    panel.replaceChildren();
    if (!document.hidden) { world?.resume(); views?.resume(); }
    const target = focusReturn?.isConnected ? focusReturn : viewport;
    target.focus({ preventScroll: true });
    focusReturn = null;
    showControls();
    return true;
  }
  function openPanel(name, title) {
    if (activePanel === name) { closePanel(); return false; }
    if (!activePanel) focusReturn = document.activeElement;
    activePanel = name;
    stopAudio(); world?.pause(); views?.pause(); numbers.finish();
    panel.replaceChildren();
    const header = make('div', null, 'panel-heading');
    const heading = make('h2', title); heading.id = 'panel-title';
    const close = make('button', '×', 'panel-close'); close.type = 'button'; close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', closePanel);
    header.append(heading, close); panel.append(header);
    overlay.setAttribute('aria-labelledby', heading.id);
    if (!overlay.open) overlay.showModal();
    close.focus(); showControls();
    return true;
  }
  function openOverview() {
    if (!openPanel('overview', 'Eight chapters. One connected story.')) return;
    const grid = make('div', null, 'overview-grid');
    const current = navigation.getState().sceneId;
    for (const scene of data.scenes) {
      const button = make('button', null, 'overview-item');
      button.type = 'button'; button.dataset.scene = String(scene.id);
      button.setAttribute('aria-current', scene.id === current ? 'step' : 'false');
      button.append(make('span', String(scene.order).padStart(2, '0'), 'overview-number'),
        make('strong', scene.title), make('small', data.chapters.find(chapter => chapter.id === scene.chapter).title));
      button.addEventListener('click', () => { closePanel(); navigation.goToScene(scene.id); viewport.focus({ preventScroll: true }); });
      grid.append(button);
    }
    panel.append(grid);
  }
  function sourceElements(scene, doc = document) {
    const list = make('ol', null, 'source-list', doc);
    for (const id of scene.sources || []) {
      const source = data.refs.find(item => item.id === id);
      if (!source) continue;
      const item = make('li', null, null, doc);
      item.append(make('strong', `${source.id} — ${source.title}`, null, doc));
      if (source.note) item.append(make('p', source.note, null, doc));
      if (source.url && /^https?:\/\//i.test(source.url)) {
        const link = make('a', 'Open original source (Internet)', null, doc);
        link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        item.append(link);
      }
      list.append(item);
    }
    if (!list.children.length) list.append(make('li', 'No separate source entry for this beat.', null, doc));
    return list;
  }
  function openSources() {
    if (!openPanel('sources', `Sources — Scene ${currentScene().order}`)) return;
    panel.append(sourceElements(currentScene()));
  }
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    objectURLs.add(url);
    const anchor = make('a'); anchor.href = url; anchor.download = name;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => { URL.revokeObjectURL(url); objectURLs.delete(url); }, 2000);
  }
  function exportHTML() {
    const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const pattern = /(<script\b(?=[^>]*\bid=["']presentation-data["'])[^>]*>)[\s\S]*?(<\/script\s*>)/i;
    if (!pattern.test(originalHTML)) throw new Error('The embedded presentation template could not be found.');
    return originalHTML.replace(pattern, (_match, opening, closing) => opening + json + closing);
  }
  function saveHTML() {
    download('reforming-vietnam-cinematic-edited.html', exportHTML(), 'text/html;charset=utf-8');
    toast('Đã tạo bản HTML. Mở file vừa tải để dùng bản chỉnh sửa.');
  }
  function downloadScript() {
    const lines = [`# ${data.title}`, '', 'Speaking estimate: 11 minutes plus 4–6 minutes for quizzes. Timing is unconfirmed.', ''];
    for (const scene of data.scenes) {
      lines.push(`## ${scene.order}. ${scene.title}`, '');
      for (const beat of scene.beats) lines.push(`### ${beat.order}. ${beat.label}`, '', beat.presenter.script, '');
      if (scene.quiz) lines.push(`Answer: ${scene.quiz.assessment.correctAnswerId}`, '', scene.quiz.assessment.explanation, '');
      for (const id of scene.sources || []) {
        const ref = data.refs.find(item => item.id === id);
        if (ref) lines.push(`- ${ref.id}: ${ref.title}. ${ref.note || ''} ${ref.url || ''}`);
      }
      lines.push('');
    }
    download('reforming-vietnam-speaker-script.md', lines.join('\n'), 'text/markdown;charset=utf-8');
  }
  function editorHistory(direction) {
    const source = direction === 'undo' ? undo : redo, target = direction === 'undo' ? redo : undo;
    const entry = source.pop();
    if (!entry) return;
    const scene = data.scenes.find(item => item.beats.some(beat => beat.id === entry.beatId));
    const beat = scene.beats.find(item => item.id === entry.beatId);
    assignEdit(beat, direction === 'undo' ? entry.before : entry.after); target.push(entry);
    persistEdits(); render(navigation.getState()); renderEditorBody();
  }
  function renderEditorBody() {
    const old = panel.querySelector('[data-editor-body]'); old?.remove();
    const body = make('div', null, 'panel-section'); body.dataset.editorBody = '';
    const scene = currentScene(), beat = currentBeat();
    body.append(make('p', `Cảnh ${scene.order} · Nhịp ${beat.order}/${scene.beats.length}`, 'editor-location'));
    const form = make('form'); form.lang = 'vi';
    const fields = {};
    for (const [name, title, rows] of [['heading', 'Tiêu đề hiển thị', 3], ['body', 'Nội dung hiển thị', 3], ['script', 'Lời dẫn riêng cho người trình bày', 7]]) {
      const label = make('label', title, 'panel-field');
      const field = make('textarea'); field.name = name; field.id = `edit-${name}`; field.rows = rows;
      field.value = editedValues(beat)[name]; field.maxLength = name === 'heading' ? 600 : name === 'body' ? 4000 : 20000;
      if (scene.id === 15 && name !== 'script') field.readOnly = true;
      label.append(field); form.append(label); fields[name] = field;
    }
    const status = make('p', undo.length ? 'Đã cập nhật nội dung.' : restoredCount ? 'Đã khôi phục nội dung đã lưu trên máy này.' : 'Chưa có thay đổi.', 'editor-status');
    status.setAttribute('role', 'status'); status.id = 'editor-status';
    const actions = make('div', null, 'panel-actions');
    const apply = make('button', 'Áp dụng', 'primary'); apply.type = 'submit'; apply.id = 'editor-apply';
    const undoButton = make('button', 'Hoàn tác'); undoButton.type = 'button'; undoButton.disabled = !undo.length; undoButton.dataset.editorUndo = '';
    const redoButton = make('button', 'Làm lại'); redoButton.type = 'button'; redoButton.disabled = !redo.length; redoButton.dataset.editorRedo = '';
    const save = make('button', 'Lưu file HTML'); save.type = 'button'; save.id = 'editor-export';
    undoButton.addEventListener('click', () => editorHistory('undo'));
    redoButton.addEventListener('click', () => editorHistory('redo'));
    save.addEventListener('click', () => { if (applyFields()) saveHTML(); });
    actions.append(apply, undoButton, redoButton, save); form.append(status, actions); body.append(form); panel.append(body);
    function applyFields() {
      const patch = Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value]));
      if (!validEdit(scene, patch)) { status.textContent = 'Kiểm tra tiêu đề và độ dài nội dung. Cảnh 15 chỉ giữ lời cảm ơn.'; return false; }
      const before = editedValues(beat);
      if (JSON.stringify(before) === JSON.stringify(patch)) { status.textContent = 'Không có thay đổi mới.'; return true; }
      assignEdit(beat, patch); undo.push({ beatId: beat.id, before, after: patch }); if (undo.length > 100) undo.shift(); redo.length = 0;
      const persisted = persistEdits(); render(navigation.getState());
      status.textContent = persisted ? 'Đã áp dụng và lưu trên máy này. Dùng Lưu file HTML để mang sang máy khác.' : 'Đã áp dụng. Trình duyệt không cho lưu cục bộ; hãy dùng Lưu file HTML.';
      undoButton.disabled = false; redoButton.disabled = true;
      return true;
    }
    form.addEventListener('submit', event => { event.preventDefault(); applyFields(); });
  }
  function openEditor() {
    if (!openPanel('editor', 'Chỉnh sửa nội dung')) return;
    panel.lang = 'vi'; renderEditorBody();
  }
  function openSettings() {
    if (!openPanel('settings', 'Presentation settings')) return;
    panel.lang = 'en';
    const motion = make('label', null, 'settings-row');
    const checkbox = make('input'); checkbox.type = 'checkbox'; checkbox.checked = reducedMotion; checkbox.id = 'setting-motion';
    motion.append(make('span', 'Reduced motion'), checkbox);
    checkbox.addEventListener('change', () => {
      reducedMotion = checkbox.checked; document.body.classList.toggle('reduced-motion', reducedMotion);
      if (reducedMotion && currentScene().id === 7) stopAudio();
      world?.setReducedMotion(reducedMotion); numbers.setReducedMotion(reducedMotion); views?.setReducedMotion(reducedMotion); navigation.replay();
    });
    const qualityRow = make('label', null, 'settings-row'), select = make('select'); select.id = 'setting-quality';
    for (const value of ['high', 'low']) { const option = make('option', value === 'high' ? 'High' : 'Low'); option.value = value; select.append(option); }
    select.value = quality; qualityRow.append(make('span', 'Visual quality'), select);
    select.addEventListener('change', () => { quality = select.value; world?.setQuality(quality); });
    const volumeRow = make('label', null, 'settings-row'), slider = make('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '0.4'; slider.step = '0.01'; slider.value = String(volume); slider.id = 'setting-volume';
    volumeRow.append(make('span', 'Cue volume'), slider); slider.addEventListener('input', () => { volume = Number(slider.value); });
    const actions = make('div', null, 'panel-actions');
    for (const [text, callback] of [['Sources for this scene', openSources], ['Download speaker script', downloadScript], ['Save HTML', saveHTML]]) {
      const button = make('button', text); button.type = 'button'; button.addEventListener('click', callback); actions.append(button);
    }
    panel.append(motion, qualityRow, volumeRow, actions,
      make('p', 'Space / → / Page Down: next beat · ← / Page Up: previous · R: replay · F: full screen · G: overview · E: edit · N: notes · M: sound · Esc: close', 'shortcut-guide'));
  }
  function renderNotes() {
    if (!notesWindow || notesWindow.closed) return;
    try {
      const doc = notesWindow.document, scene = currentScene(), beat = currentBeat(), state = navigation.getState();
      doc.getElementById('notes-position').textContent = `Scene ${scene.order} / 15 · Beat ${beat.order} / ${scene.beats.length}`;
      doc.getElementById('notes-heading').textContent = beat.audience.heading;
      doc.getElementById('notes-script').textContent = beat.presenter.script;
      const assessment = doc.getElementById('notes-assessment'); assessment.replaceChildren();
      if (scene.quiz) assessment.append(make('h3', `Presenter answer: ${scene.quiz.assessment.correctAnswerId}`, null, doc), make('p', scene.quiz.assessment.explanation, null, doc));
      const nextBeat = scene.beats[state.beatIndex + 1] || data.scenes[state.sceneIndex + 1]?.beats[0];
      doc.getElementById('notes-next').textContent = nextBeat ? `Next: ${nextBeat.audience.heading}` : 'End of presentation';
      doc.getElementById('notes-sources').replaceChildren(sourceElements(scene, doc));
      doc.getElementById('notes-prev').disabled = state.sceneIndex === 0 && state.beatIndex === 0;
      doc.getElementById('notes-forward').disabled = state.sceneIndex === 14;
      updateNotesClock();
    } catch { notesWindow = null; toast('Notes could not synchronize. Download the speaker script from Settings.'); }
  }
  function updateNotesClock() {
    if (!notesWindow || notesWindow.closed) return;
    try {
      const doc = notesWindow.document;
      doc.getElementById('notes-timer').textContent = `${clockText()} / 11:00`;
      doc.getElementById('notes-timer-state').textContent = clockDescription();
      doc.getElementById('notes-clock-toggle').textContent = clock.requested ? 'Pause timer' : clock.elapsed ? 'Resume timer' : 'Start timer';
    } catch { notesWindow = null; }
  }
  function openNotes() {
    if (notesWindow && !notesWindow.closed) { notesWindow.focus(); return; }
    notesWindow = window.open('', 'cpv-cinematic-presenter', 'popup,width=900,height=900');
    if (!notesWindow) { toast('Notes popup blocked. Allow popups, or download the speaker script in Settings.'); return; }
    const doc = notesWindow.document;
    doc.open();
    doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Presenter notes — Reforming Vietnam</title><style>body{margin:0;padding:30px;background:#111018;color:#f4eee1;font:17px/1.6 system-ui,sans-serif}main{max-width:900px;margin:auto}h1{font:36px/1.15 Georgia,serif}h2{font-size:20px}h3{font-size:17px;color:#dfbc79}p{white-space:pre-wrap}button{border:1px solid #76654b;background:#27202a;color:#f4eee1;padding:11px 16px;border-radius:6px;cursor:pointer;font:inherit}button:disabled{opacity:.4}button:focus-visible,a:focus-visible{outline:3px solid #77dce5;outline-offset:4px}nav{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0}.privacy{padding:12px 16px;background:#302128;border-left:3px solid #dfbc79;font-size:14px}.clock{display:flex;gap:15px;align-items:center;flex-wrap:wrap;border-block:1px solid #514137;padding:16px 0}.clock strong{font:32px/1 monospace}small,.muted{color:#b9b0a5}a{color:#77dce5}li{margin-bottom:16px}#notes-script{font-size:23px;line-height:1.65}.source-list p{font-size:14px}details{margin-top:24px}summary{cursor:pointer}#notes-assessment{border-left:3px solid #dfbc79;padding-left:18px}@media print{nav,.privacy,.clock button{display:none}body{background:white;color:black}}</style></head><body><main><p class="privacy">Presenter window: move this window to a separate display using Extend mode. Mirroring the desktop can expose these notes.</p><div class="clock"><strong id="notes-timer"></strong><div><span id="notes-timer-state"></span><br><small>11 minutes speaking + 4–6 minutes quiz; estimate only.</small></div><button id="notes-clock-toggle"></button><button id="notes-clock-reset">Reset timer</button></div><nav><button id="notes-prev">← Previous</button><button id="notes-forward">Next →</button><button id="notes-replay">Replay</button><button id="notes-download">Download script</button></nav><p id="notes-position" class="muted"></p><h1 id="notes-heading"></h1><p id="notes-script"></p><div id="notes-assessment"></div><p id="notes-next" class="muted"></p><details><summary>Sources for this scene</summary><div id="notes-sources"></div></details></main></body></html>');
    doc.close();
    for (const [id, fn] of [['notes-prev', () => navigation.previous()], ['notes-forward', () => navigation.next()],
      ['notes-replay', () => navigation.replay()], ['notes-clock-toggle', () => setClock('toggle')],
      ['notes-clock-reset', () => setClock('reset')], ['notes-download', downloadScript]]) doc.getElementById(id).addEventListener('click', fn);
    renderNotes(); notesWindow.focus();
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Full screen is unavailable in this browser.');
    } catch { toast('Full screen could not open. Use the browser full-screen command.'); }
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    clearTimeout(toastTimer); clearTimeout(idleTimer); clearInterval(clockInterval);
    cleanup.splice(0).forEach(fn => { try { fn(); } catch {} });
    stopAudio(); if (audioContext) audioContext.close().catch(() => {});
    for (const url of objectURLs) URL.revokeObjectURL(url); objectURLs.clear();
    numbers.destroy(); input?.destroy(); navigation?.destroy(); worldScenes?.destroy?.(); world?.destroy(); views?.destroy();
    try { if (notesWindow && !notesWindow.closed) notesWindow.close(); } catch {}
  }
  try {
    const sourceJSON = $('presentation-data').textContent;
    data = JSON.parse(sourceJSON); restoreEdits(sourceJSON);
    document.body.classList.toggle('reduced-motion', reducedMotion);
    navigation = createSceneController(data, { onTransition: transition, onError: report });
    views = createCinematicViews({ data, root: content, playCue: playPressureCue });
    render(navigation.getState());
    cleanup.push(navigation.subscribe((state, event) => {
      if (event.type !== 'navigate' && event.type !== 'replay') return;
      stopAudio(); render(state, event);
    }));
    try {
      world = createWorldEngine({ THREE, canvas: $('world'), fallbackCanvas: $('fallback'), navigation,
        quality, reducedMotion, onError: report });
      worldScenes = registerCinematicWorld?.(world, { THREE, data, numbers });
      world.initialize();
    } catch (error) { report(error); world?.destroy(); world = null; }
    input = createInputController(navigation, viewport, { isBlocked: () => Boolean(activePanel),
      callbacks: { fullscreen, overview: openOverview, editor: openEditor, notes: openNotes, mute: toggleMute, closePanel }, onError: report });
    const actions = { prev: () => navigation.previous(), next: () => navigation.next(), replay: () => navigation.replay(),
      fullscreen, overview: openOverview, editor: openEditor, edit: openEditor, notes: openNotes, mute: toggleMute,
      audio: toggleMute, settings: openSettings, sources: openSources };
    listen(controls, 'click', event => {
      const button = event.target.closest('[data-action]');
      if (!button || button.disabled || !controls.contains(button)) return;
      try { Promise.resolve(actions[button.dataset.action]?.()).catch(report); } catch (error) { report(error); }
    });
    listen(content, 'click', event => {
      const scene = currentScene(), state = quizState(scene);
      if (!state) return;
      const option = event.target.closest('[data-quiz-option]');
      const submit = event.target.closest('[data-quiz-submit]');
      const reset = event.target.closest('[data-quiz-reset]');
      let focusSelector;
      if (option && !state.submitted && scene.quiz.audience.options.some(item => item.id === option.dataset.quizOption)) {
        state.selected = option.dataset.quizOption; focusSelector = `[data-quiz-option="${state.selected}"]`;
      } else if (submit && state.selected && !state.submitted) { state.submitted = true; focusSelector = '[data-quiz-reset]'; }
      else if (reset) { state.selected = null; state.submitted = false; focusSelector = '[data-quiz-option="A"]'; }
      else return;
      views.render(navigation.getState(), { quizState: state });
      numbers.present(navigation.getState());
      content.querySelector(focusSelector)?.focus({ preventScroll: true });
    });
    listen(overlay, 'cancel', event => { event.preventDefault(); closePanel(); });
    listen(overlay, 'click', event => { if (event.target === overlay) { const bounds = panel.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel(); } });
    listen(viewport, 'click', event => {
      if (!event.target.closest('button,a,input,textarea,select,[contenteditable]')) viewport.focus({ preventScroll: true });
    });
    for (const name of ['pointermove', 'pointerdown', 'keydown', 'focusin']) listen(document, name, showControls, { passive: true });
    listen(controls, 'focusout', showControls);
    listen(document, 'visibilitychange', () => {
      updateClock(); updateNotesClock();
      if (document.hidden) { numbers.finish(); stopAudio(); audioContext?.suspend().catch(() => {}); world?.pause(); views?.pause(); content.classList.remove('is-transitioning'); }
      else if (!activePanel) {
        if (!muted && audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
        world?.resume(); views?.resume();
      }
    });
    listen(window, 'pagehide', event => { if (event.persisted) { input.disable(); world?.pause(); views?.pause(); stopAudio(); } else destroy(); });
    listen(window, 'pageshow', event => { if (event.persisted && !destroyed) { input.enable(); if (!activePanel && !document.hidden) { world?.resume(); views?.resume(); } } });
    clockInterval = setInterval(() => { updateClock(); updateNotesClock(); }, 1000);
    updateSoundButton(); showControls();
    listen(window.matchMedia('(prefers-reduced-motion: reduce)'), 'change', event => {
      reducedMotion = event.matches;
      if (reducedMotion && currentScene().id === 7) stopAudio();
      document.body.classList.toggle('reduced-motion', reducedMotion);
      numbers.setReducedMotion(reducedMotion); world?.setReducedMotion(reducedMotion); views?.setReducedMotion(reducedMotion);
    });
    window.CPVApp = Object.freeze({ navigation, world, input, views, numbers, destroy, exportHTML,
      getErrors: () => [...errors], getQuizState: (sceneId = navigation.getState().sceneId) => {
        const scene = data.scenes.find(item => String(item.id) === String(sceneId));
        return scene?.quiz ? { ...quizState(scene) } : null;
      }, getData: () => JSON.parse(JSON.stringify(data)), getWorldState: () => worldScenes?.getState?.(),
      setSceneTime: (sceneId, t) => worldScenes?.get?.(sceneId)?.setTime?.(t),
      getPressureState: () => views?.getPressureState(),
      getTimerState: () => ({ requested: clock.requested, elapsedMs: clock.elapsed + (clock.activeSince === null ? 0 : performance.now() - clock.activeSince), running: clock.activeSince !== null }),
      getAudioState: () => ({ muted, activeNodes: audioNodes.size }), threeRevision: THREE.REVISION,
      implementedSceneIds: Object.freeze(data.scenes.map(scene => scene.id)) });
    document.documentElement.dataset.presentationReady = 'true';
    return window.CPVApp;
  } catch (error) {
    report(error); destroy(); document.documentElement.dataset.presentationReady = 'false';
    if (!content.textContent.trim()) content.textContent = 'The presentation could not start. Please reopen the original HTML file.';
    return null;
  }
}
