/** Readable device of a session, from its raw user-agent (MAIR-930). */
export interface DescribedUserAgent {
  /** « Firefox 132 », or the raw user-agent when the browser is not recognised. */
  browser: string;
  /** « Windows », « macOS 14.4 », « Android 14 »… or « Système inconnu ». */
  os: string;
  deviceType: 'Ordinateur' | 'Téléphone' | 'Tablette';
}

const major = (version: string | undefined) => version?.split('.')[0];
const dotted = (version: string | undefined) => version?.replace(/_/g, '.');

const browsers: Array<[RegExp, string]> = [
  [/\bEdg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
  [/\b(?:OPR|Opera)\/([\d.]+)/, 'Opera'],
  [/\bSamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
  [/\b(?:Firefox|FxiOS)\/([\d.]+)/, 'Firefox'],
  [/\b(?:Chrome|CriOS)\/([\d.]+)/, 'Chrome'],
  [/\bVersion\/([\d.]+).*\bSafari\//, 'Safari'],
];

function describeOs(ua: string): string {
  let match: RegExpMatchArray | null;
  if ((match = ua.match(/\b(?:iPhone|CPU) OS ([\d_]+)/))) return `iOS ${dotted(match[1])}`;
  if (/\biPad\b/.test(ua) && (match = ua.match(/\bOS ([\d_]+)/))) return `iPadOS ${dotted(match[1])}`;
  if ((match = ua.match(/\bAndroid ([\d.]+)/))) return `Android ${match[1]}`;
  if (/\bCrOS\b/.test(ua)) return 'ChromeOS';
  if (/\bWindows NT 10\.0\b/.test(ua)) return 'Windows'; // 10 and 11 share the same token
  if ((match = ua.match(/\bWindows NT ([\d.]+)/))) return `Windows NT ${match[1]}`;
  if ((match = ua.match(/\bMac OS X ([\d_]+)/))) return `macOS ${dotted(match[1])}`;
  if (/\bLinux\b/.test(ua)) return 'Linux';
  return 'Système inconnu';
}

function describeDevice(ua: string): DescribedUserAgent['deviceType'] {
  if (/\biPad\b|\bTablet\b/.test(ua) || (/\bAndroid\b/.test(ua) && !/\bMobile\b/.test(ua))) return 'Tablette';
  if (/\biPhone\b|\bMobile\b/.test(ua)) return 'Téléphone';
  return 'Ordinateur';
}

/** `describeUserAgent(ua)` → `{ browser: 'Firefox 132', os: 'Windows', deviceType: 'Ordinateur' }`. */
export function describeUserAgent(userAgent: string | null | undefined): DescribedUserAgent {
  const ua = (userAgent ?? '').trim();
  if (!ua) return { browser: 'Navigateur inconnu', os: 'Système inconnu', deviceType: 'Ordinateur' };
  let browser = ua;
  for (const [pattern, name] of browsers) {
    const match = ua.match(pattern);
    if (match) { browser = `${name} ${major(match[1])}`; break; }
  }
  return { browser, os: describeOs(ua), deviceType: describeDevice(ua) };
}
