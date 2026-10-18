// Scene 4 — THE REFORM ARCHIVE layer (3D volumes + orbit canvas live in the world engine).
function history(scene, beat, i) {
  const year = beat.label, caption = beat.audience.heading.replace(/^\d{4}\s*·\s*/, '');
  const volume = [0, 1, 1][i] ?? 0, V = ARCHIVE_VOLUMES[volume];
  return `<section class="scene reform-archive" data-volume="${volume}"><canvas class="archive-orbit" aria-hidden="true"></canvas>
<header class="archive-masthead"><p>THE REFORM ARCHIVE</p><span>A History of Political Transformation</span></header>
<h2 class="sr-only">Reform — the archives of political transformation</h2>
<p class="archive-lede">Three perspectives on the necessity, transformation, and future of Vietnam’s political system.</p>
<aside class="archive-volume-card" data-v="${V.id}" aria-live="polite"><p class="archive-volume-kicker">${escapeHTML(V.kicker)}</p><h3>${escapeHTML(V.title)}</h3><p class="archive-volume-sub">${escapeHTML(V.subtitle)}</p><ul>${V.topics.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul><button type="button" class="archive-volume-link" data-archive-go="${V.scene}">${escapeHTML(V.link)} →</button></aside>
<div class="archive-milestone"><div class="archive-index" aria-label="Historical milestones">${scene.beats.map((b, n) => `<span class="${n === i ? 'selected' : ''}">${escapeHTML(b.label)}</span>`).join('')}</div>
<strong class="archive-year">${escapeHTML(year)}</strong><p class="archive-kind">${escapeHTML(beat.audience.keys.join(' · '))}</p><h3 data-editable="heading">${escapeHTML(caption)}</h3>${body(beat.audience.body)}</div>
<p class="archive-disclaimer">Illustrated covers and image slots · not original historical documents · select a volume to explore (optional)</p></section>`;
}
// Scene 8 — one beat, internal documentary timeline. No roster / member names.
function students(scene, beat, i, data) {
  const img = id => (typeof CPVAssets !== 'undefined' && CPVAssets.scene7[id]) || '';
  const moments = [['S8-01', 'Understand', 'Read the sources. Check the facts.', 'administration'], ['S8-02', 'Participate', 'Discuss, cooperate, contribute.', 'cooperation'], ['S8-03', 'Take responsibility', 'Explain honestly. Own our work.', 'accountability']];
  return `<section class="scene students doc-moment" aria-label="${escapeHTML(scene.title)}">
<figure class="moment-hero" data-image-slot="S8-HERO"><img src="${img('citizens')}" alt="" decoding="async"><figcaption>IMAGE SLOT S8-HERO · citizens · source pending</figcaption></figure>
<h2 class="moment-question">What would you do?</h2>
<div class="moment-triad">${moments.map(([id, word, line, asset], n) => `<figure class="moment" style="--n:${n}" data-image-slot="${id}"><div class="moment-image"><img src="${img(asset)}" alt="" decoding="async"></div><figcaption><span>${String(n + 1).padStart(2, '0')}</span><strong>${word}</strong><small>${line}</small></figcaption></figure>`).join('')}</div>
<svg class="moment-lines" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><path d="M372 610 C372 760 800 700 800 900"/><path d="M800 610 L800 900"/><path d="M1228 610 C1228 760 800 700 800 900"/></svg>
<div class="moment-close"><h2 class="display" data-editable="heading">${escapeHTML(beat.audience.heading)}</h2>${body(beat.audience.body)}</div></section>`;
}
// Scene 9 — three responsibility branches continuing the three Scene 8 lines.
function responsibility(scene, beat, i) {
  return `<section class="scene responsibility branches" data-branch="${i}"><svg class="branch-lines" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">${[0, 1, 2].map(n => `<path class="${n === i ? 'active' : n < i ? 'done' : ''}" d="M800 0 C800 140 ${330 + n * 470} 170 ${330 + n * 470} 330"/>`).join('')}</svg><div class="commitment-copy">${title(beat.audience.heading)}${body(beat.audience.body)}</div><div class="commitment-sequence">${scene.beats.map((b, index) => `<div class="commitment ${index === i ? 'active' : ''} ${index < i ? 'done' : ''}"><span class="commitment-index">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHTML(b.audience.heading)}</h3><p>${escapeHTML(b.audience.keys[0] || '')}</p></div>`).join('')}</div></section>`;
}
