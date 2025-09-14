import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

async function run() {
  console.log('🔍 Script starting', { cwd: process.cwd(), node: process.version });
  // Read file input into an array
  const inputPath = path.resolve(process.cwd(), 'input.txt');
  if (!fs.existsSync(inputPath)) {
    console.error('❌ input.txt not found at', inputPath);
    process.exitCode = 2;
    return;
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  // normalize CRLF -> LF so splitting is consistent across platforms
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    console.warn('⚠️ input.txt parsed as 0 non-empty lines. Raw length:', raw.length);
    console.warn('⚠️ input.txt preview (first 300 chars):', normalized.slice(0, 300));
    console.warn('ℹ️ Ensure each URL is on its own line and the file is saved with UTF-8 encoding.');
    process.exitCode = 0;
    return;
  }

  console.log(`📄 Read ${lines.length} lines from input.txt`);

  // Optional filter: when ONLY_X=1, only process X/Twitter URLs from input
  const onlyX = (process.env.ONLY_X === '1');
  if (onlyX) {
    const filtered = lines.filter(u => {
      try { return ['x.com', 'twitter.com'].some(h => new URL(u).hostname.toLowerCase().includes(h)); }
      catch (e) { return false; }
    });
    console.log(`🔎 ONLY_X=1 active — filtered ${lines.length} -> ${filtered.length} URLs`);
    // replace lines with filtered set
    lines.length = 0;
    lines.push(...filtered);
    if (lines.length === 0) {
      console.warn('⚠️ ONLY_X filter left 0 URLs to process — exiting.');
      process.exitCode = 0;
      return;
    }
  }

  // Launch browser visibly (not headless)
  console.log('🌐 Launching puppeteer...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,   // show browser
      defaultViewport: null, // use full window
      args: ["--start-maximized"]
    });
    console.log('✅ Puppeteer launched');
  } catch (err) {
    console.error('❌ Failed to launch puppeteer:', err && err.message ? err.message : err);
    throw err;
  }

  const page = await browser.newPage();

  // Load comments from post.txt (one per line). Fall back to a default message when empty.
  const postsPath = path.resolve(process.cwd(), 'post.txt');
  let comments = [];
  if (fs.existsSync(postsPath)) {
    try {
      const rawPosts = fs.readFileSync(postsPath, 'utf-8');
      comments = rawPosts.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        .split('\n').map(s => s.trim()).filter(Boolean);
      console.log(`📄 Read ${comments.length} comments from post.txt`);
    } catch (err) {
      console.warn('⚠️ Failed to read post.txt, will use default comment:', err && err.message ? err.message : err);
      comments = [];
    }
  } else {
    console.log('ℹ️ post.txt not found; using default simulated message');
  }

  // round-robin index for comments
  let commentIndex = 0;

  for (const url of lines) {
    console.log(`Visiting: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });
    // If the site looks like X/Twitter, simulate posting a comment instead of actually posting.
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
        const message = (comments.length > 0) ? comments[commentIndex % comments.length] : 'Automated test comment (simulated)';
        commentIndex++;
        await simulatePostOnX(page, url, message);
      } else {
        // pause so user can see the page
        await new Promise(res => setTimeout(res, 5000)); // wait 5s to see it
      }
    } catch (err) {
      console.warn('⚠️ Error parsing URL, continuing:', err && err.message ? err.message : err);
    }
  }

  console.log("✅ Done. Closing browser.");
  await browser.close();
}
// Simulate posting a comment on X (Twitter) without performing any real network action.
// This helper demonstrates the steps Puppeteer would take and logs those steps.
async function simulatePostOnX(page, url, message) {
  console.log(`✉️ Simulating post on X for ${url}`);
  console.log('  - ensure user is logged in (simulation)');
  console.log('  - locate compose box or tweet textarea (simulation)');
  console.log(`  - type message: "${message}" (simulation)`);
  console.log('  - click post button (simulation)');
  // Optionally, we could take a screenshot to show the simulated state.
  try {
    const safeName = url.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
    const out = `simulated_post_${safeName}.png`;
    await page.screenshot({ path: out, fullPage: false });
    console.log(`  - screenshot saved to ${out} (visual simulation)`);
  } catch (err) {
    console.warn('  - screenshot failed (non-fatal):', err && err.message ? err.message : err);
  }
  // Wait briefly so the user can see what's happening in the visible browser.
  await new Promise(res => setTimeout(res, 2500));
  console.log('✅ Simulation complete for', url);
}

run().catch(err => {
  console.error("❌ Script failed:", err);
});
