import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(req: Request) {
  const { url }: { url: string } = await req.json();

  try {
    new URL(url);
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return Response.json({ error: `Site returned ${res.status}` }, { status: 400 });
    }

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.length < 200) {
      return Response.json({ error: 'Failed to extract article text' }, { status: 400 });
    }

    return Response.json({
      title: article.title,
      text: article.textContent.trim(),
    });
  } catch {
    return Response.json({ error: 'Failed to load page' }, { status: 500 });
  }
}