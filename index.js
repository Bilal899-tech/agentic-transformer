import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, 'output');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
import { createInterface } from 'readline';
import { searchDuckDuckGo } from './search.js';
import { crawl } from './crawler.js';
import { extractLeads } from './agent.js';

const isUrl = s => /^https?:\/\//i.test(s.trim());

let input = process.argv.slice(2).join(' ');
if (!input) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  input = await new Promise(res => rl.question('Enter URL or search query: ', res));
  rl.close();
}

console.log(`\n╔══════════════════════════════════════════╗`);
console.log(`║     NEXAGAZE - Agentic Transformer      ║`);
console.log(`║     AI-Powered Lead Intelligence CLI     ║`);
console.log(`╠══════════════════════════════════════════╣`);
console.log(`║  Built by Nexagaze Founder Bilal        ║`);
console.log(`║  Contact: ai@nexagaze.com               ║`);
console.log(`╚══════════════════════════════════════════╝`);
console.log(`\n[agentic-transformer] Input: "${input}"\n`);

let sources = [];

if (isUrl(input)) {
  console.log('[1/2] Deep crawling target URL...');
  const result = await crawl(input);
  if (result?.text) {
    console.log(`       OK (${result.pagesCrawled} pages, ${result.emails.length} emails, ${result.phones.length} phones)\n`);
    sources.push({
      title: input.replace(/^https?:\/\//, '').split('/')[0],
      url: input,
      content: result.text,
      emails: result.emails,
      phones: result.phones
    });
  } else {
    console.log('       FAILED\n');
  }
} else {
  console.log('[1/3] Searching the web...');
  const searchResults = await searchDuckDuckGo(input);
  console.log(`       Found ${searchResults.length} results\n`);

  console.log('[2/3] Deep crawling pages...');
  const tasks = searchResults.map(r => crawl(r.url).then(c => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet,
    content: c?.text || null,
    emails: c?.emails || [],
    phones: c?.phones || [],
    pagesCrawled: c?.pagesCrawled || 0
  })));
  const settled = await Promise.allSettled(tasks);
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value.content) {
      const v = s.value;
      console.log(`       ${v.url}... OK (${v.pagesCrawled}p, ${v.emails.length}e, ${v.phones.length}ph)`);
      sources.push(v);
    } else {
      console.log(`       FAILED`);
    }
  }
}

if (sources.length === 0) {
  console.log('\nNo data to analyze.\n');
console.log(`\n╔══════════════════════════════════════════╗`);
console.log(`║      Agentic Transformer Complete!      ║`);
console.log(`║     Nexagaze — AI Lead Intelligence     ║`);
console.log(`╚══════════════════════════════════════════╝\n`);

process.exitCode = 0;
} else {
  const step = isUrl(input) ? '2' : '3';
  console.log(`\n[${step}/3] Extracting intelligence with AI...`);
  const leads = await extractLeads(input, sources);

  if (leads.length === 0) {
    console.log('       No leads extracted.\n');
  } else {
    const filename = join(outputDir, `leads-${Date.now()}.json`);
    writeFileSync(filename, JSON.stringify(leads, null, 2));
    console.log(`       ${leads.length} leads saved to ${filename}\n`);
    console.log('=== EXTRACTED LEADS ===');
    console.table(leads.map(l => ({
      name: l.name,
      website: l.website,
      email: l.email || '-',
      phone: l.phone || '-',
      relevance: l.relevance
    })));
  }
}

process.exitCode = 0;
