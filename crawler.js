import axios from 'axios';
import * as cheerio from 'cheerio';

const JINA_API = 'https://r.jina.ai';
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const INTERESTING_RE = /\/(about|contact|team|services|company|who-we-are|meet-our-team|leadership|management|founder|ceo|our-team|support|reach-us|get-in-touch)\b/i;

function extractEmails(text) {
  const matches = text.match(EMAIL_RE) || [];
  return [...new Set(matches.map(e => e.toLowerCase()))];
}

function extractPhones(text) {
  const matches = text.match(PHONE_RE) || [];
  return [...new Set(matches)];
}

function findDeepLinks($, baseUrl) {
  const links = new Set();
  const base = new URL(baseUrl);
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === base.hostname && INTERESTING_RE.test(url.pathname)) {
        links.add(url.origin + url.pathname.replace(/\/$/, ''));
      }
    } catch {}
  });
  return [...links];
}

export async function crawl(url, timeout = 12000) {
  const baseUrl = url.replace(/\/$/, '');
  const combined = { homepage: null, deepPages: [], emails: [], phones: [] };

  async function fetchViaJina(targetUrl) {
    try {
      const { data } = await axios.get(`${JINA_API}/${targetUrl}`, {
        timeout,
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
      });
      return typeof data === 'string' ? data : data.data?.content || data.content || '';
    } catch {}
    return null;
  }

  async function fetchViaCheerio(targetUrl) {
    try {
      const { data } = await axios.get(targetUrl, {
        timeout,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const emails = extractEmails(data);
      const phones = extractPhones(data);
      const $ = cheerio.load(data);
      $('script, style, iframe').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      const subLinks = findDeepLinks($, targetUrl);
      return { text, emails, phones, subLinks };
    } catch { return { text: null, emails: [], phones: [], subLinks: [] }; }
  }

  const page1 = await fetchViaCheerio(baseUrl);
  combined.homepage = page1.text ? page1.text.slice(0, 3000) : await fetchViaJina(baseUrl);

  if (page1.emails) combined.emails.push(...page1.emails);
  if (page1.phones) combined.phones.push(...page1.phones);
  if (page1.text) {
    combined.emails.push(...extractEmails(page1.text));
    combined.phones.push(...extractPhones(page1.text));
  }

  const subUrls = page1.subLinks || [];
  for (const subUrl of subUrls.slice(0, 4)) {
    const text = await fetchViaJina(subUrl) || (await fetchViaCheerio(subUrl)).text;
    if (text) {
      combined.deepPages.push({ url: subUrl, content: text.slice(0, 2000) });
      combined.emails.push(...extractEmails(text));
      combined.phones.push(...extractPhones(text));
    }
  }

  combined.emails = [...new Set(combined.emails)];
  combined.phones = [...new Set(combined.phones)];

  let fullText = combined.homepage || '';
  for (const p of combined.deepPages) {
    fullText += `\n\n--- ${p.url} ---\n${p.content}`;
  }

  return {
    text: fullText.slice(0, 5000),
    emails: combined.emails,
    phones: combined.phones,
    pagesCrawled: 1 + combined.deepPages.length
  };
}
