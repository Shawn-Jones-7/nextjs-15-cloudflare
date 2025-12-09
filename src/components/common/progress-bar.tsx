'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export function ProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="oklch(0.205 0 0)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
