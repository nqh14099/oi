const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/nqhuy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const outDir = path.resolve(__dirname, '../work/scene1-cinematic');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    executablePath: 'C:/Users/nqhuy/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });

  const pageErrors = [];

  // 1. Desktop 1600x900 session
  const desktopContext = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  const page = await desktopContext.newPage();
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  console.log('Navigating to presentation...');
  await page.goto('file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html');
  await page.waitForFunction(() => window.CPVApp);

  console.log('Starting native MediaRecorder on WebGL canvas...');
  await page.evaluate(() => {
    window._recordedChunks = [];
    const canvas = document.getElementById('world');
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    window._mediaRecorder = new MediaRecorder(stream, { mimeType });
    window._mediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) window._recordedChunks.push(e.data);
    };
    window._mediaRecorder.start(100);
  });

  console.log('Stepping through Scene 1 intro animation from 0s to 6.5s...');
  for (let t = 0; t <= 6.5; t += 0.05) {
    await page.evaluate(currT => {
      window.CPVApp.setSceneTime(1, currT);
    }, t);

    // Capture the 3 key requested moments during the timeline
    if (Math.abs(t - 0.7) < 0.025) {
      await page.waitForTimeout(50);
      const shotA = path.join(outDir, 'scene1_shot_a_extreme_closeup.png');
      await page.screenshot({ path: shotA });
      console.log('Captured Shot A (Extreme close-up):', shotA);
    }
    if (Math.abs(t - 2.2) < 0.025) {
      await page.waitForTimeout(50);
      const shotB = path.join(outDir, 'scene1_shot_b_orbit_convergence.png');
      await page.screenshot({ path: shotB });
      console.log('Captured Shot B (Cinematic orbit & convergence):', shotB);
    }
    if (Math.abs(t - 4.8) < 0.025) {
      await page.waitForTimeout(50);
      const shotC = path.join(outDir, 'scene1_shot_c_hero_reveal.png');
      await page.screenshot({ path: shotC });
      console.log('Captured Shot C (Hero reveal completed):', shotC);
    }

    await page.waitForTimeout(40);
  }

  const videoBase64 = await page.evaluate(async () => {
    return new Promise(resolve => {
      window._mediaRecorder.onstop = async () => {
        const blob = new Blob(window._recordedChunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      };
      window._mediaRecorder.stop();
    });
  });

  const targetVideo = path.join(outDir, 'scene1_living_flag.webm');
  fs.writeFileSync(targetVideo, Buffer.from(videoBase64, 'base64'));
  fs.copyFileSync(targetVideo, path.join(outDir, 'scene1_intro_cinematic.webm'));
  console.log('Saved video (', fs.statSync(targetVideo).size, 'bytes) to:', targetVideo);

  // Set time to 4.8s explicitly for completed holding keyframe screenshot
  await page.evaluate(() => {
    window.CPVApp.setSceneTime(1, 4.8);
  });
  await page.waitForTimeout(100);

  const desktopScreenshot = path.join(outDir, 'scene1_intro_1600x900_completed.png');
  await page.screenshot({ path: desktopScreenshot });
  console.log('Saved completed desktop screenshot:', desktopScreenshot);

  // 4. Capture proof screenshot from an oblique camera perspective
  // showing the wave folds visibly rippling across the letter forms
  console.log('Capturing cloth curvature proof from oblique camera angle...');
  await page.evaluate(() => {
    window._scene1ObliqueProof = true;
    window.CPVApp.setSceneTime(1, 4.8);
  });
  await page.waitForTimeout(200);
  const proofScreenshot = path.join(outDir, 'scene1_cloth_curvature_proof.png');
  await page.screenshot({ path: proofScreenshot });
  console.log('Saved cloth curvature proof screenshot:', proofScreenshot);

  // Restore hero view
  await page.evaluate(() => {
    window._scene1ObliqueProof = false;
    window.CPVApp.setSceneTime(1, 4.8);
  });
  await page.waitForTimeout(100);

  // Test navigation to Beat 1 and back
  console.log('Testing navigation to Beat 1 (question)...');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const beat1Screenshot = path.join(outDir, 'scene1_beat1_question.png');
  await page.screenshot({ path: beat1Screenshot });
  console.log('Saved beat 1 screenshot:', beat1Screenshot);

  console.log('Testing navigation back to Beat 0 (re-reveal)...');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);

  await page.close();
  await desktopContext.close();

  // 2. Portrait test
  console.log('Testing portrait viewport (430x932)...');
  const portraitContext = await browser.newContext({
    viewport: { width: 430, height: 932 }
  });
  const portraitPage = await portraitContext.newPage();
  portraitPage.on('pageerror', err => pageErrors.push(err.message));

  await portraitPage.goto('file:///D:/Downloads/CPV/dist/reforming_vietnam_complete.html');
  await portraitPage.waitForFunction(() => window.CPVApp);
  await portraitPage.evaluate(() => {
    window.CPVApp.setSceneTime(1, 4.8);
  });
  await portraitPage.waitForTimeout(300);

  const portraitScreenshot = path.join(outDir, 'scene1_portrait_completed.png');
  await portraitPage.screenshot({ path: portraitScreenshot });
  console.log('Saved portrait screenshot:', portraitScreenshot);

  await portraitPage.close();
  await portraitContext.close();

  await browser.close();

  console.log('Page errors:', pageErrors);
  console.log('Verification completed successfully!');
})();
