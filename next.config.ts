import './src/env';

import type { NextConfig } from 'next';

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import createNextIntlPlugin from 'next-intl/plugin';

void initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: {
    hooks: {
      beforeCompile: {
        tapPromise: (name: string, callback: () => Promise<void>) => void;
      };
    };
  }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const development = process.env.NODE_ENV !== 'production';
      const { build } = await import('velite');
      await build({ watch: development, clean: !development });
    });
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  webpack: (config: { plugins: { push: (plugin: VeliteWebpackPlugin) => void } }) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

export default withNextIntl(nextConfig);
