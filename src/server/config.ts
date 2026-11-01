/** Configured HTTP(S) service bases must never accept caller-controlled destinations. */
export function serviceBase(value: string | undefined): string {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return '';
    return url.href.replace(/\/+$/, '');
  } catch { return ''; }
}

export function publicOrigin(value: string | undefined): string | undefined {
  const base = serviceBase(value);
  return base ? new URL(base).origin : undefined;
}
