import ollama from 'ollama';

const MODEL = 'minimax-m2.1:cloud';

function buildPrompt(query, sources) {
  let prompt = `You are an enterprise lead investigator. Extract detailed company intelligence for: "${query}"

Data:
${sources.map((s, i) => `[${i + 1}] ${s.title} | ${s.url}`).join('\n')}

Page Content:
${sources.map((s, i) => `[${i + 1}] ${s.url}\n${s.content ? s.content.slice(0, 600) : 'N/A'}`).join('\n\n')}

Emails found:
${sources.map((s, i) => s.emails?.length ? `[${i + 1}] ${s.emails.join(', ')}` : '').filter(Boolean).join('\n')}

Phones found:
${sources.map((s, i) => s.phones?.length ? `[${i + 1}] ${s.phones.join(', ')}` : '').filter(Boolean).join('\n')}

For each lead found, explore deeply and extract:
- name: Company or person name
- website: URL
- description: What they do (detailed)
- email: Any email found (if none, "Not found")
- phone: Any phone number (if none, "Not found")
- services: Key services offered
- relevance: Why they match the query

Return ONLY a JSON array. Valid JSON only. No markdown. No explanation.
Example:
[{"name":"Acme Corp","website":"https://acme.com","description":"Full-stack dev agency","email":"hello@acme.com","phone":"+1-555-0100","services":"Next.js, React, Node.js","relevance":"Direct match"}]`;

  return prompt;
}

function extractJson(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  try { return JSON.parse(cleaned); } catch {}
  if (cleaned.startsWith('{')) {
    const fixed = cleaned.endsWith(']') ? `[${cleaned.slice(0, -1)}]` : `[${cleaned}]`;
    try { return JSON.parse(fixed); } catch {}
  }
  try { return JSON.parse(`[${cleaned}]`); } catch {}
  return [];
}

export async function extractLeads(query, sources) {
  const prompt = buildPrompt(query, sources);
  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    options: { temperature: 0.1 }
  });
  return extractJson(response.message.content);
}
