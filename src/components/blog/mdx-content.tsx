'use client';

import * as runtime from 'react/jsx-runtime';
import { useMemo } from 'react';

interface MDXContentProperties {
  code: string;
  className?: string;
}

export function MDXContent({ code, className }: MDXContentProperties) {
  // Velite compiles MDX to a function string that expects jsx-runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Component = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const mdxFunction = new Function(code);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const { default: MDXComponent } = mdxFunction(runtime);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return MDXComponent;
  }, [code]);

  return (
    <div className={className}>
      <Component />
    </div>
  );
}
