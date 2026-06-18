```
╔══════════════════════════════════════════╗
║     NEXAGAZE - Agentic Transformer      ║
║     AI-Powered Lead Intelligence CLI     ║
╠══════════════════════════════════════════╣
║  Built by Nexagaze Founder Bilal        ║
║  Contact: ai@nexagaze.com               ║
╚══════════════════════════════════════════╝
```

# Agentic Transformer — nexagaze project

> Built by Founder Bilal

CLI lead generation tool. Scrapes websites, extracts emails/phones using Ollama AI, saves leads to JSON.

## SEO Keywords
lead generation tool, CLI scraper, email extractor, phone scraper, Ollama AI leads, web scraping agent, nexagaze, open source lead gen, Founder Bilal

## Tech Stack
- Node.js
- Axios (HTTP client)
- Cheerio (HTML parsing)
- Ollama AI (intelligence extraction)
- DuckDuckGo search integration

## Setup
```bash
npm install
npm start
```

## Features
- Search the web or crawl a specific URL
- Deep crawling with multi-page support
- AI-powered lead extraction via Ollama
- Saves leads as JSON files with timestamps
- Extracts names, emails, phones, and relevance scores

## 📖 Documentation

### Architecture
CLI application (Node.js). Three modules work together:
- `search.js` — DuckDuckGo search fallback
- `crawler.js` — Fetches pages via Jina AI Reader API + cheerio parsing
- `agent.js` — Ollama chat for lead extraction

### API Reference
```
Usage: node index.js [query]
If no query provided, prompts interactively.
Output: leads-<timestamp>.json
```

### Data Flow
1. User enters query → search for company URLs
2. Crawler fetches each URL → extracts emails/phones via regex
3. Agent sends scraped data to Ollama → parses structured leads
4. Saves to `leads-<timestamp>.json`

## License
MIT — see [LICENSE](LICENSE)

---

**Contact:** ai@nexagaze.com | **WhatsApp:** 03103860653

---

## 🤝 Hire Me

Need a more advanced version? Want this built in Python, Rust, Go, or another language?  
I build custom AI agents, automation tools, and full-stack applications.

**Founder Bilal** — nexagaze  
📧 **Email:** ai@nexagaze.com  
📱 **WhatsApp:** 03103860653  
🌐 **GitHub:** [github.com/your-profile](https://github.com/your-profile)

> *"I don't just build projects — I build solutions that scale."*
