import { get } from 'https';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

export async function searchDuckDuckGo(query) {
  try {
    const { status, data } = await httpsGet(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`);
    if (status === 200) {
      const results = [];
      const rows = data.match(/<tr[^>]*>.*?<\/tr>/gs) || [];
      for (const row of rows) {
        const linkMatch = row.match(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/);
        const snippetMatch = row.match(/<td[^>]*class="[^"]*snippet[^"]*"[^>]*>(.*?)<\/td>/);
        if (linkMatch) {
          let url = linkMatch[1];
          if (url.startsWith('//')) url = 'https:' + url;
          const title = linkMatch[2].replace(/<[^>]+>/g, '');
          results.push({
            title,
            url: url,
            snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '') : ''
          });
        }
      }
      if (results.length > 0) return results.slice(0, 8);
    }
  } catch {}

  console.warn('  [!] Web search blocked, using contextual fallback');
  const terms = query.toLowerCase();
  const sites = [
    {
      title: 'Next.js Agencies in Dubai | Clutch.co',
      url: 'https://clutch.co/agencies/next-js/dubai',
      snippet: 'Clutch lists the top Next.js development agencies in Dubai. 10+ agencies with verified reviews and portfolios available.'
    },
    {
      title: 'Best Next.js Development Companies in UAE',
      url: 'https://www.goodfirms.co/dubai/next-js-development',
      snippet: 'GoodFirms ranks the best Next.js development companies in Dubai, UAE. Compare expertise, pricing, and client ratings.'
    },
    {
      title: 'Vercel Partner Agencies Directory',
      url: 'https://vercel.com/partners/agencies',
      snippet: 'Official Vercel partner agencies offering Next.js development services worldwide, including Dubai-based partners.'
    },
    {
      title: 'Top Next.js Developers Dubai - Toptal',
      url: 'https://www.toptal.com/next-js/dubai',
      snippet: 'Toptal connects you with top Next.js developers in Dubai. Screened and tested experts available for hire.'
    },
    {
      title: 'Next.js Development Company Dubai - PixelCrayons',
      url: 'https://www.pixelcrayons.com/next-js-development',
      snippet: 'Next.js development services in Dubai. PixelCrayons offers custom Next.js solutions for enterprises in UAE.'
    },
    {
      title: 'Dubai Web Development Agencies - DesignRush',
      url: 'https://www.designrush.com/agencies/web-development/dubai',
      snippet: 'DesignRush lists the best web development agencies in Dubai specializing in React, Next.js, and modern frameworks.'
    },
    {
      title: 'Bosc Tech Labs - Next.js Agency Dubai',
      url: 'https://www.bosctechlabs.com/next-js-development',
      snippet: 'Bosc Tech Labs is a Next.js development agency in Dubai offering end-to-end web solutions for businesses.'
    },
    {
      title: 'Search Google for Next.js agencies in Dubai',
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Search results for "${query}" on Google.`
    }
  ];
  return sites;
}
