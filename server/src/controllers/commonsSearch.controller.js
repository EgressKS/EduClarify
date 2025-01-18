import { buildFallbackImageQuery } from '../services/ask.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const cache = new Map();
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.ts > CACHE_MS) {
      cache.delete(key);
    }
  }
}

function extractMetadata(extmeta = {}) {
  const author =
    extmeta?.Artist?.value ||
    extmeta?.Author?.value ||
    extmeta?.Creator?.value ||
    'Unknown';
  const license =
    extmeta?.License?.value ||
    extmeta?.Copyright?.value ||
    'Unknown license';
  const licenseUrl = extmeta?.License_url?.value || '';
  return { author, license, licenseUrl };
}

async function queryCommons(rawQuery) {
  let search = rawQuery.trim();
  const hasFileFilter = /\bfiletype:|\bfilemime:/i.test(search);
  if (!hasFileFilter) {
    search +=
      ' filetype:bitmap|drawing -filemime:pdf -filemime:application/pdf -filemime:djvu';
  }

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '6',
    gsrlimit: '50',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '800',
    uselang: 'en',
  });

  const url = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EduClarifyAI/1.0' },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`Wikimedia API error: ${res.status}`);
  }

  return res.json();
}

function getRefinedImageQuery(query) {
  const refined = buildFallbackImageQuery(query);
  if (typeof refined === 'string' && refined.trim().length > 1) {
    return refined.trim();
  }
  return null;
}

export const commonsSearchController = asyncHandler(async (req, res) => {
  const query =
    (req.query.query || req.query.q || '').toString().trim();

  if (!query) {
    return res
      .status(400)
      .json({ error: 'Query parameter "query" or "q" is required' });
  }

  cleanCache();
  const cacheKey = `v1:${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res
      .status(200)
      .set('Access-Control-Allow-Origin', '*')
      .json(cached.data);
  }

  let effectiveQuery = query;
  const refinedQuery = getRefinedImageQuery(query);
  if (refinedQuery) {
    effectiveQuery = refinedQuery;
  }

  const candidateQueries = Array.from(
    new Set([effectiveQuery, query].filter(Boolean)),
  );
  const parts = effectiveQuery
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (!candidateQueries.includes(part)) {
      candidateQueries.push(part);
    }
  }

  const rawTokens = effectiveQuery
    .toLowerCase()
    .split(/[\s,]+/g)
    .map((token) => token.trim())
    .filter(Boolean);
  const keywords = Array.from(
    new Set(rawTokens.filter((token) => token.length > 2)),
  );

  const candidates = [];
  const images = [];

  for (const candidate of candidateQueries) {
    if (images.length >= 8) break;
    const data = await queryCommons(candidate);
    const pages = Object.values(data.query?.pages || {});

    for (const page of pages) {
      if (images.length >= 8) break;
      const info = page.imageinfo?.[0];
      if (!info) continue;

      const mime = info.mime || '';
      if (!mime.startsWith('image/')) continue;

      const { author, license, licenseUrl } = extractMetadata(
        info.extmetadata,
      );

      const item = {
        title: String(page.title || '').replace(/^File:/, ''),
        thumbUrl: info.thumburl || info.url,
        fullUrl: info.url,
        mime,
        author,
        license,
        licenseUrl,
      };

      if (!images.some((img) => img.fullUrl === item.fullUrl)) {
        const desc = String(
          info.extmetadata?.ImageDescription?.value || '',
        );
        const haystack = `${item.title} ${desc}`.toLowerCase();
        let score = 0;
        for (const keyword of keywords) {
          if (keyword && haystack.includes(keyword)) {
            score += 1;
          }
        }
        candidates.push({ img: item, score });
        images.push(item);
      }
    }
  }

  if (images.length === 0) {
    const expanded = `${effectiveQuery} (diagram OR schematic OR illustration)`;
    const data = await queryCommons(expanded);
    const pages = Object.values(data.query?.pages || {});
    for (const page of pages) {
      if (images.length >= 8) break;
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const mime = info.mime || '';
      if (!mime.startsWith('image/')) continue;
      const { author, license, licenseUrl } = extractMetadata(
        info.extmetadata,
      );
      const item = {
        title: String(page.title || '').replace(/^File:/, ''),
        thumbUrl: info.thumburl || info.url,
        fullUrl: info.url,
        mime,
        author,
        license,
        licenseUrl,
      };
      if (!images.some((img) => img.fullUrl === item.fullUrl)) {
        const desc = String(info.extmetadata?.ImageDescription?.value || '');
        const haystack = `${item.title} ${desc}`.toLowerCase();
        let score = 0;
        for (const keyword of keywords) {
          if (keyword && haystack.includes(keyword)) {
            score += 1;
          }
        }
        candidates.push({ img: item, score });
        images.push(item);
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const ranked = [];
  for (const candidate of candidates) {
    if (ranked.length >= 8) break;
    if (!ranked.some((img) => img.fullUrl === candidate.img.fullUrl)) {
      ranked.push(candidate.img);
    }
  }

  const finalImages = ranked.length > 0 ? ranked : images.slice(0, 8);
  const result = {
    query,
    images: finalImages,
    total: finalImages.length,
    ts: new Date().toISOString(),
  };

  cache.set(cacheKey, { data: result, ts: Date.now() });

  res
    .status(200)
    .set('Access-Control-Allow-Origin', '*')
    .json(result);
});

