import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Run from repo root:
//   node scripts/pregenerate-elephant-covers.mjs
//
// Requires:
//   KIE_API_KEY in your environment (.env.local is loaded by Next, not by Node)
// Example:
//   $env:KIE_API_KEY="..."
//   node scripts/pregenerate-elephant-covers.mjs

const KIE_API_KEY = process.env.KIE_API_KEY;
if (!KIE_API_KEY) {
  console.error('Missing KIE_API_KEY in environment.');
  process.exit(1);
}

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'elephant-covers');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createTask(prompt) {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2-text-to-image',
      input: {
        prompt,
        aspect_ratio: '1:1',
        resolution: '1K',
      },
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.code !== 200 || !json?.data?.taskId) {
    throw new Error(`KIE createTask failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json.data.taskId;
}

async function pollResultUrl(taskId, timeoutMs = 240_000) {
  const started = Date.now();
  let attempt = 0;
  while (Date.now() - started < timeoutMs) {
    attempt++;
    await sleep(Math.min(2000 + attempt * 900, 12000));
    const res = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${KIE_API_KEY}` },
    });
    const json = await res.json().catch(() => null);
    const state = json?.data?.state;
    if (!res.ok) continue;
    if (state === 'fail') throw new Error(`KIE task failed: ${json?.data?.failMsg || 'unknown error'}`);
    if (state === 'success') {
      const resultJsonStr = json?.data?.resultJson;
      let result;
      try { result = resultJsonStr ? JSON.parse(resultJsonStr) : null; } catch { result = null; }
      const url = result?.resultUrls?.[0] || null;
      if (!url) throw new Error('No result url');
      return url;
    }
  }
  throw new Error('Timed out waiting for task');
}

async function downloadToFile(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filePath, buf);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const bookDataUrl = pathToFileURL(path.join(ROOT, 'lib', 'bookData.js')).href;
  const { BOOKS } = await import(bookDataUrl);

  for (const b of BOOKS) {
    const outPath = path.join(OUT_DIR, `${b.id}.png`);

    try {
      await fs.access(outPath);
      console.log('exists', b.id);
      continue;
    } catch {}

    console.log('generate', b.id);
    const taskId = await createTask(b.coverPrompt);
    const url = await pollResultUrl(taskId);
    await downloadToFile(url, outPath);
    console.log('saved', outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

