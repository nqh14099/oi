import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePresentation } from '../build/validate-data.mjs';

const path = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../build/content.json', import.meta.url));
try {
  const data = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  const result = validatePresentation(data);
  if (!result.valid) {
    console.error(result.errors.join('\n')); process.exitCode = 1;
  } else console.log(`PASS: ${data.scenes.length} scenes, ${data.chapters.length} chapters, 4 quizzes; presentation data valid.`);
} catch (error) {
  console.error(`FAIL: ${path}: ${error.message}`); process.exitCode = 1;
}
