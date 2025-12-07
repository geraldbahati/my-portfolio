'use client';

import { useEffect } from 'react';
import { initConsoleFilter } from '@/lib/console-filter';

/**
 * Console Filter Component
 * Initializes console filtering on mount to suppress non-critical logs in production
 */
export function ConsoleFilter() {
  useEffect(() => {
    initConsoleFilter();
  }, []);

  return null;
}
