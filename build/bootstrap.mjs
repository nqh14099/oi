/** Implemented scenes use lifecycle modules; later scenes retain the T08 diagnostic shell. */
export function startPresentation({ THREE, createSceneController, createInputController, createWorldEngine, createIntroScenes }) {
  if (window.CPVApp) return window.CPVApp;
  const content = document.getElementById('content');
  const controls = document.getElementById('controls');
  const errors = [], cleanup = [];
  let navigation, world, input, intro, introReady = false, destroyed = false;
  function report(error) {
    const message = String(error?.message ?? error);
    errors.push(message);
    const notice = document.getElementById('toast');
    notice.textContent = `Runtime: ${message}`;
    notice.classList.add('visible');
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cleanup.splice(0).forEach(fn => fn());
    input?.destroy(); world?.destroy(); intro?.destroy(); navigation?.destroy();
  }
  const listen = (target, type, fn) => {
    target.addEventListener(type, fn);
    cleanup.push(() => target.removeEventListener(type, fn));
  };
  try {
    const data = JSON.parse(document.getElementById('presentation-data').textContent);
    navigation = createSceneController(data, { onError: report });
    intro = createIntroScenes({ data, content });
    const buttons = Object.fromEntries([...controls.querySelectorAll('[data-action]')].map(button => [button.dataset.action, button]));
    for (const [action, button] of Object.entries(buttons)) {
      if (!['prev', 'next', 'replay', 'fullscreen'].includes(action)) {
        button.disabled = true;
        button.title = 'Unavailable in the T08 diagnostic view';
      }
    }
    const diagnostic = document.createElement('span');
    diagnostic.className = 'small';
    diagnostic.textContent = 'T08 diagnostic view';
    controls.append(diagnostic);
    cleanup.push(() => diagnostic.remove());
    document.body.classList.add('show-controls');
    function render(state) {
      const scene = data.scenes[state.sceneIndex], beat = scene.beats[state.beatIndex];
      diagnostic.hidden = intro.has(scene.id);
      if (!introReady || !intro.has(scene.id)) {
      const section = document.createElement('section');
      section.className = `scene${scene.kind === 'cover' ? ' cover' : ''}${scene.kind === 'outro' ? ' composition-center' : ''}`;
      const copy = document.createElement('div');
      copy.className = 'scene-content copy';
      const add = (tag, text, className) => {
        if (!text) return;
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = text;
        copy.append(node);
      };
      add(scene.kind === 'cover' || scene.kind === 'outro' ? 'h1' : 'h2', beat.audience.heading, 'scene-title');
      add('p', beat.audience.body, 'body');
      for (const key of beat.audience.keys) add('p', key, 'keyline');
      section.append(copy);
      content.replaceChildren(section);
      }
      if (introReady && !world) intro.renderFallback(state);
      // Never render quiz assessment, presenter scripts or references on the audience stage.
      document.getElementById('source-line').textContent = '';
      document.getElementById('scene-label').textContent = scene.kind === 'outro' ? '' : `${scene.order} / 15 · ${state.beatIndex + 1} / ${scene.beats.length}`;
      document.getElementById('counter').textContent = `${String(scene.order).padStart(2, '0')} / 15`;
      document.getElementById('beat-line').style.width = `${100 * (state.beatIndex + 1) / scene.beats.length}%`;
      buttons.prev.disabled = state.sceneIndex === 0 && state.beatIndex === 0;
      buttons.next.disabled = state.sceneIndex === data.scenes.length - 1 && state.beatIndex === scene.beats.length - 1;
      content.dataset.sceneId = String(state.sceneId);
      content.dataset.beatId = state.beatId;
    }
    render(navigation.getState());
    cleanup.push(navigation.subscribe((state, event) => {
      if (event.type === 'navigate' || event.type === 'replay') render(state);
    }));
    // DOM content initializes first and remains usable even if the GPU fails.
    try {
      world = createWorldEngine({ THREE, canvas: document.getElementById('world'),
        fallbackCanvas: document.getElementById('fallback'), navigation, onError: report });
      world.initialize();
      intro.register(world);
    } catch (error) { report(error); world?.destroy(); world = null; }
    introReady = true;
    if (!world) intro.renderFallback(navigation.getState());
    const fullscreen = () => {
      if (document.fullscreenElement) return document.exitFullscreen();
      if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return false;
      return document.documentElement.requestFullscreen();
    };
    input = createInputController(navigation, document.getElementById('viewport'), {
      callbacks: { fullscreen }, onError: report
    });
    const actions = { prev: () => navigation.previous(), next: () => navigation.next(), replay: () => navigation.replay(), fullscreen };
    listen(controls, 'click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button || button.disabled || !controls.contains(button)) return;
      try { Promise.resolve(actions[button.dataset.action]?.()).catch(report); } catch (error) { report(error); }
    });
    listen(window, 'pagehide', event => {
      if (event.persisted) { input.disable(); world?.pause(); }
      else destroy();
    });
    listen(window, 'pageshow', event => {
      if (event.persisted && !destroyed) { input.enable(); world?.resume(); }
    });
    window.CPVApp = Object.freeze({ navigation, world, input, destroy,
      getErrors: () => [...errors], diagnostic: true, implementedSceneIds: Object.freeze([1, 2]), threeRevision: THREE.REVISION });
    document.documentElement.dataset.presentationReady = 'true';
    return window.CPVApp;
  } catch (error) {
    destroy(); report(error);
    document.documentElement.dataset.presentationReady = 'false';
    if (!content.textContent.trim()) content.textContent = 'Presentation initialization failed. See the runtime error above.';
    return null;
  }
}
