import { describeUserAgent } from './user-agent';

// MAIR-930: the main browsers and systems, with a fallback on the raw string.
describe('describeUserAgent', () => {
  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0', 'Firefox 132', 'Windows', 'Ordinateur'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Chrome 131', 'Windows', 'Ordinateur'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70', 'Edge 131', 'Windows', 'Ordinateur'],
    ['Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 OPR/95.0.0.0', 'Opera 95', 'Windows NT 6.1', 'Ordinateur'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15', 'Safari 17', 'macOS 14.4', 'Ordinateur'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1', 'Safari 17', 'iOS 17.2', 'Téléphone'],
    ['Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1', 'Chrome 120', 'iOS 16.6', 'Tablette'],
    ['Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36', 'Samsung Internet 23', 'Android 14', 'Téléphone'],
    ['Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 'Chrome 119', 'Android 13', 'Tablette'],
    ['Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Chrome 120', 'ChromeOS', 'Ordinateur'],
    ['Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0', 'Firefox 121', 'Linux', 'Ordinateur'],
  ])('%s', (ua, browser, os, deviceType) => {
    expect(describeUserAgent(ua)).toEqual({ browser, os, deviceType });
  });

  it('falls back on the raw string, and on « inconnu » without a user-agent', () => {
    expect(describeUserAgent('curl/8.4.0')).toEqual({ browser: 'curl/8.4.0', os: 'Système inconnu', deviceType: 'Ordinateur' });
    expect(describeUserAgent(null)).toEqual({ browser: 'Navigateur inconnu', os: 'Système inconnu', deviceType: 'Ordinateur' });
  });
});
