'use client';

import React from 'react';
import { Check, Copy, Download } from 'lucide-react';

import { Button } from '../Button';
import { componentMarker } from '../component-marker';
import { useCopyFeedback } from '../clipboard';

export interface RecoveryCodesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The codes, shown in two numbered columns. */
  codes: readonly string[];
  /** Name of the downloaded text file. */
  filename?: string;
  /** Called after the codes reached the clipboard. */
  onCopy?: () => void;
  /** Called after the file download was started. */
  onDownload?: () => void;
}

/** The text copied and downloaded: one code per line. */
export const recoveryCodesText = (codes: readonly string[]) => `${codes.join('\n')}\n`;

/**
 * One-time recovery codes (MAIR-1070, Figma `Base/RecoveryCodes`): numbered monospace list in two columns,
 * « Copier les codes » and « Télécharger (.txt) ». The codes stay in the page: no network call here.
 */
export function RecoveryCodes({ codes, filename = 'codes-de-secours.txt', onCopy, onDownload, className = '', style, ...props }: RecoveryCodesProps) {
  const { copied, copy } = useCopyFeedback({ onCopy });
  const download = () => {
    const url = URL.createObjectURL(new Blob([recoveryCodesText(codes)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onDownload?.();
  };
  const half = Math.ceil(codes.length / 2);
  return (
    <div {...props} {...componentMarker('RecoveryCodes', props)} className={`flex flex-col border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] ${className}`.trim()} style={{ gap: 'var(--mairie-space-m)', padding: 'var(--mairie-space-m)', borderRadius: 'var(--mairie-radius-m)', ...style }}>
      <ol aria-label="Codes de secours" className="m-0 grid list-none grid-flow-col p-0 font-mono text-[var(--mairie-text)]" style={{ gridTemplateRows: `repeat(${half}, auto)`, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--mairie-space-s) var(--mairie-space-l)', fontSize: 'var(--mairie-text-m)' }}>
        {codes.map((code, index) => (
          <li key={`${index}-${code}`} className="flex items-baseline" style={{ gap: 'var(--mairie-space-s)' }}>
            <span aria-hidden="true" className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{String(index + 1).padStart(2, '0')}</span>
            <span>{code}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap" style={{ gap: 'var(--mairie-space-s)' }}>
        <Button variant="outline" tone="neutral" icon={copied ? Check : Copy} label={copied ? 'Codes copiés' : 'Copier les codes'} onClick={() => { void copy(recoveryCodesText(codes)); }} />
        <Button variant="outline" tone="neutral" icon={Download} label="Télécharger (.txt)" onClick={download} />
      </div>
      <span role="status" aria-live="polite" className="sr-only">{copied ? 'Codes de secours copiés' : ''}</span>
    </div>
  );
}
