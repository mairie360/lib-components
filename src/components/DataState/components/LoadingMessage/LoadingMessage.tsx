'use client';

import React from 'react';

import { useMountedAnnouncement } from '../../../use-mounted-announcement';

/**
 * Text of the loading status. It lives as long as the loading state, so its message is written after the status
 * region exists each time the data area enters loading, the first time or after empty / error (RGAA 7.5).
 */
export const LoadingMessage = ({ message }: { message: string }) => <span className="sr-only">{useMountedAnnouncement(message)}</span>;
