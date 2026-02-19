'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { POSTHOG_KEY, POSTHOG_HOST } from '@/lib/posthog';

// ─── Init PostHog once on client ────────────────────────────────────────────
if (typeof window !== 'undefined') {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    capture_pageview: false, // We fire manually via PageviewTracker
    capture_pageleave: true,
  });
}

// ─── Pageview tracker (fires on route changes) ───────────────────────────────
function PageviewTracker() {
  const ph = usePostHog();

  useEffect(() => {
    ph?.capture('$pageview');
  }, [ph]);

  return null;
}

// ─── Provider wrapper ────────────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      {children}
    </PHProvider>
  );
}
