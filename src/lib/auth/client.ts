'use client';

import { createAuthClient } from '@neondatabase/auth/next';

let clientInstance: ReturnType<typeof createAuthClient> | null = null;

export function getNeonAuthClient() {
  if (typeof window === 'undefined') return null;
  if (!clientInstance) {
    try {
      clientInstance = createAuthClient();
    } catch (e) {
      console.warn('Failed to initialize Neon Auth client:', e);
    }
  }
  return clientInstance;
}
