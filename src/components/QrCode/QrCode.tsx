'use client';

import React from 'react';
import qrcode from 'qrcode-generator';

import { componentMarker } from '../component-marker';

export interface QrCodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The text encoded (an `otpauth://` URI for the authenticator app). */
  value: string;
  /** Side of the square in px, quiet zone included (192 by default). */
  size?: number;
  /** Accessible name of the image. */
  label?: string;
  /** Error correction level (M by default). */
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
}

/** Width of the quiet zone, in modules (the QR specification asks for 4). */
const QUIET_ZONE = 4;

/**
 * QR code drawn as an inline SVG (MAIR-1068, Figma `Base/QrCode`): no network, no image request, the value
 * never leaves the page. Always black on white, in light and dark mode, because scanners need the contrast.
 * Meant for the authenticator-app setup: pair it with a `CopyField` that shows the same secret as text.
 */
export function QrCode({ value, size = 192, label = 'Code QR', errorCorrection = 'M', className = '', style, ...props }: QrCodeProps) {
  const path = React.useMemo(() => {
    const code = qrcode(0, errorCorrection);
    code.addData(value, 'Byte');
    code.make();
    const count = code.getModuleCount();
    let d = '';
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) {
        if (code.isDark(row, column)) d += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { d, span: count + QUIET_ZONE * 2 };
  }, [value, errorCorrection]);
  return (
    <div {...props} {...componentMarker('QrCode', props)} className={`inline-block shrink-0 overflow-hidden ${className}`.trim()} style={{ width: size, height: size, borderRadius: 'var(--mairie-radius-m)', border: '1px solid var(--mairie-border)', ...style }}>
      <svg role="img" aria-label={label} viewBox={`0 0 ${path.span} ${path.span}`} width="100%" height="100%" shapeRendering="crispEdges" style={{ display: 'block' }}>
        <rect width={path.span} height={path.span} fill="var(--mairie-qr-light)" />
        <path d={path.d} fill="var(--mairie-qr-dark)" />
      </svg>
    </div>
  );
}
