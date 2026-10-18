// Audience layers. All course text and assessments come from content.json.
// Coordinates are CSS percentages of the shared 1600 × 900 stage.
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name, cls = '') => {
  const paths = {
    person: '<circle cx="12" cy="7" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4M9 21v-5m6 5v-5"/>',
    submit: '<path d="M7 3h8l4 4v14H5V3h2m8 0v5h4M8 13h8m-8 4h5"/>',
    process: '<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
    track: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    receive: '<path d="M4 5h16v15H4zM8 3v4m8-4v4M8 13l3 3 5-6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1-1.5 3m0 3h.01"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  };
  return `<svg class="line-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const body = (text, cls = '') => text ? `<p class="scene-body ${cls}" data-editable="body">${escapeHTML(text)}</p>` : '';
const keys = (items, cls = '') => items?.length ? `<div class="scene-keys ${cls}">${items.map(item => `<span>${escapeHTML(item)}</span>`).join('')}</div>` : '';
const mark = text => `<p class="representation-label">${escapeHTML(text)}</p>`;
const title = (text, cls = '') => `<h2 class="display ${cls}" data-editable="heading">${escapeHTML(text)}</h2>`;

function cover(scene, beat, i) {
  if (i > 0) return `<section class="scene cover question-cover" aria-label="${escapeHTML(scene.title)}"><div class="cover-question">${title(beat.audience.heading)}${body(beat.audience.body)}</div><div class="question-rule" aria-hidden="true"></div></section>`;
  return `<section class="scene cover"><div class="cover-copy"><h1 class="cover-title" data-editable="heading">${escapeHTML(beat.audience.heading).replace('REFORMING ', '<span class="cover-opening">Reforming</span> ').replace('VIETNAM’S ', '<span class="cover-nation">Vietnam’s</span> ').replace('POLITICAL SYSTEM', '<span class="cover-subject">political system</span>')}</h1><p class="cover-context">${escapeHTML(scene.subtitle)}</p></div><div class="cover-rule" aria-hidden="true"></div></section>`;
}

function system(scene, beat, i) {
  const labels=[['party','Leadership','Communist Party of Vietnam'],['state','Management','State'],['front','Participation','Vietnam Fatherland Front'],['organisations','','Socio-political organisations'],['people','The people’s mastery','People']];
  return `<section class="scene system-exhibit" data-system-beat="${i}"><header class="system-heading"><p class="system-kicker">THE POLITICAL SYSTEM</p>${title(scene.title)}</header><div class="system-labels" aria-label="Components and roles of the political system">${labels.map(([key,role,name])=>`<div class="system-label system-label-${key} ${(i===0?key==='party':i===1?['state','front','organisations'].includes(key):key==='people')?'is-emphasis':''}" data-system-label="${key}"><strong>${name}</strong><span class="system-role">${role}</span></div>`).join('')}</div><div class="system-explanation">${body(beat.audience.heading,'system-thought')}${body(beat.audience.body)}</div><p class="system-note">Symbolic installation · Connections do not indicate reporting lines</p></section>`;
}
function maze(scene, beat, i) {
  return `<section class="scene maze ${i >= 2 ? 'routes-clear' : ''}"><div class="maze-copy">${title(beat.audience.heading)}${body(beat.audience.body)}${keys(beat.audience.keys.filter(k => !['Illustration', 'Apply Reform'].includes(k)))}</div>${mark('Illustrative workflow')}<div class="workflow-state" aria-hidden="true"><span class="workflow-dot"></span>${i < 2 ? 'One citizen. One application.' : 'Clear responsibility. Connected routes.'}</div></section>`;
}

function history(scene, beat, i) {
  const year=beat.label,caption=beat.audience.heading.replace(/^\d{4}\s*·\s*/, '');
  return `<section class="scene archive-exhibition"><header class="archive-heading"><p>VIETNAM’S POLITICAL DEVELOPMENT</p><h2>The archives of reform</h2></header><p class="archive-disclaimer">Illustrated covers · Not original historical documents</p><div class="archive-index" aria-label="Historical milestones">${scene.beats.map((b,n)=>`<span class="${n===i?'selected':''}">${escapeHTML(b.label)}</span>`).join('')}</div><div class="archive-information"><strong class="archive-year">${escapeHTML(year)}</strong><div><p class="archive-kind">${escapeHTML(beat.audience.keys.join(' · '))}</p><h3 data-editable="heading">${escapeHTML(caption)}</h3></div>${body(beat.audience.body)}</div></section>`;
}
function restructuring(scene, beat, i) {
  const counters = `<div class="restructure-numbers" aria-label="63 to 34"><span class="number-before ${i === 0 ? 'current' : ''}">63</span>${icon('arrow')}<span class="number-after ${i > 0 ? 'current' : ''}">34</span></div>`;
  const detail = i === 2 ? `<div class="two-tiers"><strong>Province</strong>${icon('arrow')}<strong>Commune</strong></div>` : '';
  return `<section class="scene restructuring"><div class="restructure-copy">${counters}<p class="restructure-unit">Provincial-level units</p><div class="restructure-caption">${title(beat.audience.heading)}${body(beat.audience.body)}${detail}${i === 3 ? keys(beat.audience.keys, 'success-keys') : ''}</div></div><div class="restructure-legend"><span class="legend-dot"></span>11 unchanged<span class="legend-dot rearranged"></span>52 → 23</div>${mark('Generalised 3D map')}</section>`;
}

function integrity(scene, beat, i) {
  return `<section class="scene integrity"><div class="integrity-title"><h2 class="display">No<br>exceptions.</h2><p class="policy-label">${escapeHTML(scene.subtitle)}</p></div><div class="integrity-principles">${scene.beats.map((b, index) => `<div class="integrity-principle ${index === i ? 'active' : ''}"><span class="principle-mark" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHTML(b.audience.heading)}</h3>${index === i ? body(b.audience.body) : ''}</div>`).join('')}</div></section>`;
}

function services(scene, beat, i) {
  const names = scene.visual?.steps || ['Submit', 'Process', 'Track', 'Receive'];
  return `<section class="scene services"><div class="services-copy">${title(beat.audience.heading)}${body(beat.audience.body)}</div><div class="service-route" aria-label="Submit, Process, Track, Receive, with connected Help"><div class="service-mobile-line" aria-hidden="true"></div>${names.map((name, index) => `<div class="service-station ${index === i ? 'active' : ''} ${index < i ? 'complete' : ''}" style="--station:${index};--station-x:${25 + index * 20}%">${icon(['submit','process','track','receive'][index])}<span>${escapeHTML(name)}</span></div>`).join('')}<div class="service-help">${icon('help')}<span>Help</span></div></div>${keys(beat.audience.keys, 'service-evidence')}</section>`;
}

function students(scene, beat, i, data) {
  return `<section class="scene students"><div class="student-copy">${title(beat.audience.heading)}${body(beat.audience.body)}</div><div class="student-roster">${data.members.map((member, index) => `<div class="student"><span class="student-order" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div><strong>${escapeHTML(typeof member === 'string' ? member : member.name)}</strong></div></div>`).join('')}</div></section>`;
}

function responsibility(scene, beat, i) {
  return `<section class="scene responsibility"><div class="commitment-copy">${title(beat.audience.heading)}${body(beat.audience.body)}</div><div class="commitment-sequence">${scene.beats.map((b, index) => `<div class="commitment ${index === i ? 'active' : ''}"><span class="commitment-index">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHTML(b.audience.heading)}</h3><p>${escapeHTML(b.audience.keys[0] || '')}</p></div>`).join('')}</div></section>`;
}

function vision(scene, beat, i) {
  const labels = ['Implementation', 'Development goal', 'Long-term vision'];
  return `<section class="scene vision"><h2 class="vision-title">${escapeHTML(scene.title)}</h2><div class="vision-copy"><h3 data-editable="heading">${escapeHTML(labels[i])}</h3>${body(beat.audience.body)}<p class="vision-status">${i === 0 ? 'Verified structural change · Outcomes need evidence' : 'Goal · Not an achieved result'}</p></div><div class="vision-horizon">${scene.beats.map((b, index) => `<div class="horizon-stop ${index === i ? 'active' : ''}" style="--horizon-x:${28+index*24}%;--horizon-y:${42-index*6}%"><span>${escapeHTML(b.label)}</span><small>${escapeHTML(index === 0 ? 'Implementation' : 'Goal')}</small></div>`).join('')}</div></section>`;
}

function quiz(scene, beat, i, data, quizState = {}) {
  const q = scene.quiz;
  const selected = quizState.selected || null;
  const submitted = !!quizState.submitted;
  const result = submitted ? (selected === q.assessment.correctAnswerId ? 'Correct.' : `Correct answer: ${escapeHTML(q.assessment.correctAnswerId)}.`) : '';
  return `<section class="scene quiz ${submitted ? 'quiz-submitted' : ''}"><div class="quiz-heading"><span class="quiz-number" aria-label="Question ${scene.id - 10}">${String(scene.id - 10).padStart(2, '0')}</span><h2>${escapeHTML(scene.title)}</h2><p>Choose A, B, C or D.</p></div><div class="quiz-main"><h3 class="quiz-question">${escapeHTML(q.audience.question)}</h3><div class="quiz-options" role="group" aria-label="Answer options">${q.audience.options.map(option => {
    const chosen = selected === option.id;
    const correct = submitted && option.id === q.assessment.correctAnswerId;
    const incorrect = submitted && chosen && !correct;
    return `<button type="button" class="quiz-option ${chosen ? 'selected' : ''} ${correct ? 'correct' : ''} ${incorrect ? 'incorrect' : ''}" data-option="${escapeHTML(option.id)}" data-quiz-option="${escapeHTML(option.id)}" aria-pressed="${chosen}" ${submitted ? 'disabled' : ''}><span class="option-id">${escapeHTML(option.id)}</span><span class="option-text">${escapeHTML(option.text)}</span><span class="option-indicator" aria-hidden="true">${correct ? icon('check') : ''}</span></button>`;
  }).join('')}</div><div class="quiz-actions"><button type="button" class="primary-button" data-action="quiz-submit" data-quiz-submit ${!selected || submitted ? 'disabled' : ''}>Submit ${icon('arrow')}</button><button type="button" class="quiet-button" data-action="quiz-reset" data-quiz-reset>Reset</button><span class="quiz-result" role="status">${result}</span></div>${submitted ? `<div class="quiz-explanation" data-quiz-explanation><p>${escapeHTML(q.assessment.explanation)}</p></div>` : ''}</div></section>`;
}

export function createCinematicViews({ data, root, playCue }) {
  let previousKey = '';
  const pressure = typeof createPressureScene === 'function' ? createPressureScene({ root, playCue }) : null;
  const renderers = {1:cover,2:system,3:maze,4:history,5:restructuring,6:integrity,7:services,8:students,9:responsibility,10:vision,11:quiz,12:quiz,13:quiz,14:quiz};
  return {
    render(state, {quizState, event, reducedMotion = false} = {}) {
      const sceneIndex = state.sceneIndex ?? 0;
      const beatIndex = state.beatIndex ?? 0;
      const scene = data.scenes[sceneIndex];
      if (!scene) return;
      const beat = scene.beats[Math.min(beatIndex, scene.beats.length - 1)];
      const renderScene = renderers[scene.id];
      const key = `${scene.id}:${beat.id}`;
      root.dataset.sceneId = String(scene.id);
      root.dataset.beatId = beat.id;
      if (scene.id === 7 && pressure) {
        pressure.present(scene, beatIndex, event, { reducedMotion });
        previousKey = key;
        return;
      }
      if (previousKey.startsWith('7:') && pressure) pressure.unmount();
      const markup=renderScene ? renderScene(scene, beat, beatIndex, data, quizState) : `<section class="scene outro"><h1 data-editable="heading">${escapeHTML(beat.audience.heading)}</h1></section>`;
      // Keep spatial anchors alive through internal beats; only the spoken thought changes.
      if(scene.id===10&&previousKey?.startsWith(`${scene.id}:`)){
        const template=document.createElement('template');template.innerHTML=markup;
        const selectors=['.vision-copy h3','.vision-copy .scene-body','.vision-status'];
        for(const selector of selectors){const current=root.querySelector(selector),next=template.content.querySelector(selector);if(current&&next)current.innerHTML=next.innerHTML;}
        const anchors='.horizon-stop';
        root.querySelectorAll(anchors).forEach((node,index)=>{node.className=template.content.querySelectorAll(anchors)[index].className;});
      }else root.innerHTML=markup;
      // Quiz selection redraws retain keyboard focus without replaying the scene.
      if (previousKey === key && quizState?.selected && !quizState?.submitted) root.querySelector(`[data-option="${quizState.selected}"]`)?.focus({preventScroll:true});
      previousKey = key;
    },
    pause() { pressure?.pause(); },
    resume() { pressure?.resume(); },
    setReducedMotion(value) { pressure?.setReducedMotion(value); },
    getPressureState() { return pressure?.getState(); },
    destroy() { pressure?.destroy(); root.replaceChildren(); previousKey = ''; },
  };
}
