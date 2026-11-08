const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'qa-artifacts');
fs.mkdirSync(output, { recursive: true });
const expectedResume = '3d247448177c5e6b281239884671b8b0126329baaa18fb0118e1e9b60fdc08f5';
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp4': 'video/mp4' };
  fs.stat(file, (error, stat) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(res);
  });
});
(async () => {
  let browser;
  const results = [];
  try {
    await new Promise(resolve => server.listen(8877, '127.0.0.1', resolve));
    browser = await chromium.launch();
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce', acceptDownloads: true });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const base = 'http://127.0.0.1:8877/';
      await page.goto(base + 'index.html', { waitUntil: 'networkidle' });
      await page.evaluate(() => { document.querySelectorAll('img').forEach(img => img.loading = 'eager'); });
      await page.waitForFunction(() => [...document.images].every(i => i.complete), { timeout: 30000 });
      const homeImages = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
      assert.deepEqual(homeImages, [], 'Homepage images must load');
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      assert.ok(overflow.content <= overflow.viewport + 1, JSON.stringify(overflow));
      await page.locator('#skills').scrollIntoViewIfNeeded();
      await page.locator('.scene-craft-feature').screenshot({ path: path.join(output, `featured-card-${viewport.width}.png`) });
      await page.screenshot({ path: path.join(output, `portfolio-skills-${viewport.width}.png`) });
      await page.locator('.scene-craft-feature .skill-repo').click();
      await page.waitForURL('**/skills/kenny-scene-craft.html');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
      assert.equal(await page.locator('.catalog-list li').count(), 40);
      const detailOverflow = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      assert.ok(detailOverflow.content <= detailOverflow.viewport + 1, JSON.stringify(detailOverflow));
      await page.screenshot({ path: path.join(output, `scene-craft-${viewport.width}.png`), fullPage: true });
      await page.getByRole('link', { name: '浏览 40 项技能 ↓' }).click();
      await page.waitForURL('**#catalog');
      await page.getByRole('link', { name: '查看验证记录', exact: true }).click();
      await page.waitForURL('**#validation');
      // Header navigation is intentionally hidden on mobile; both hero anchors remain usable.
      await page.locator('.back').click();
      await page.waitForURL('**/index.html#skills');
      for (const route of ['blender-asset-pipeline.html', 'camera-shot-library.html']) {
        await page.locator(`#skills .skill-grid a[href="skills/${route}"]`).click();
        await page.waitForURL('**/skills/' + route);
        await page.locator('.back').click();
        await page.waitForURL('**/index.html#skills');
      }
      await page.locator('#resources').scrollIntoViewIfNeeded();
      const pending = page.waitForEvent('download');
      await page.locator('a.resource-download[href*="likeng-lightai-resume.pdf"]').click();
      const download = await pending;
      const file = path.join(output, `resume-${viewport.width}.pdf`);
      await download.saveAs(file);
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expectedResume);
      assert.deepEqual(errors, [], 'Browser JavaScript errors');
      results.push({ viewport, homeOverflow: overflow, detailOverflow, imagesLoaded: true, catalogCount: 40, newCardAndAnchors: true, oldSkillLinks: true, resumeHash: expectedResume, javascriptErrors: errors });
      await page.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed: true, results }, null, 2));
  } catch (error) {
    if (browser) {
      for (const context of browser.contexts()) {
        for (const page of context.pages()) {
          await page.screenshot({ path: path.join(output, `failure-${page.viewportSize()?.width || 'unknown'}.png`), fullPage: true }).catch(() => {});
        }
      }
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed: false, results, error: String(error), stack: error.stack }, null, 2));
    throw error;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})();
