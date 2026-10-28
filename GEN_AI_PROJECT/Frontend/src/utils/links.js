/**
 * Turns whatever the user typed into a safe, clickable link with a friendly label.
 *   linkedin.com/in/vishant-sutar-1a2b3c4d  ->  { label: "LinkedIn · Vishant Sutar", href: "https://linkedin.com/in/..." }
 *   github.com/vishantsutar                 ->  { label: "GitHub · vishantsutar", ... }
 *   vishant.dev                             ->  { label: "Portfolio · vishant.dev", ... }
 * Only http(s) links are returned, so "javascript:" style input can never become a link.
 */

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// "vishant-sutar-1a2b3c4d5" -> "Vishant Sutar" (drops LinkedIn's trailing random id)
const prettifyLinkedinSlug = (slug) => {
  const words = decodeURIComponent(slug).split(/[-_.]+/).filter(Boolean);
  if (words.length > 1) {
    const last = words[words.length - 1];
    if (/\d/.test(last) && last.length >= 5) words.pop();
  }
  return titleCase(words.join(' '));
};

export function parseLink(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  // Add https:// when the user typed a bare "github.com/me"
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(text);
  const candidate = hasScheme ? text : `https://${text}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return { href: null, label: text };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { href: null, label: text };
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);
  const href = url.href;

  if (host.endsWith('linkedin.com')) {
    const i = parts.findIndex((p) => p === 'in' || p === 'pub');
    const slug = i >= 0 ? parts[i + 1] : parts[0];
    return { href, label: slug ? `LinkedIn · ${prettifyLinkedinSlug(slug)}` : 'LinkedIn' };
  }
  if (host.endsWith('github.com')) {
    return { href, label: parts[0] ? `GitHub · ${parts[0]}` : 'GitHub' };
  }
  if (host.endsWith('leetcode.com')) {
    const u = parts[0] === 'u' ? parts[1] : parts[0];
    return { href, label: u ? `LeetCode · ${u}` : 'LeetCode' };
  }
  if (host.endsWith('twitter.com') || host === 'x.com') {
    return { href, label: parts[0] ? `X · @${parts[0]}` : 'X' };
  }
  return { href, label: `Portfolio · ${host}${parts.length ? '/' + parts.join('/') : ''}`.replace(/\/$/, '') };
}
