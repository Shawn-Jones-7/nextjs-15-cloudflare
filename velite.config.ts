import { defineConfig, defineCollection, s } from 'velite';

const locales = ['en', 'zh', 'es', 'ar'] as const;

const posts = defineCollection({
  name: 'Post',
  pattern: '{en,zh,es,ar}/blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(300),
      date: s.isodate(),
      image: s.string().optional(),
      tags: s.array(s.string()).default([]),
      // eslint-disable-next-line security/detect-unsafe-regex
      slug: s.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      content: s.mdx(),
    })
    .transform((data, { meta }) => {
      const pathSegments = meta.path.split('/');
      const localeSegment = pathSegments.find((seg) => locales.includes(seg as (typeof locales)[number]));
      const locale = (localeSegment ?? 'en') as (typeof locales)[number];
      return {
        ...data,
        locale,
        url: `/${locale}/blog/${data.slug}`,
      };
    }),
});

export default defineConfig({
  root: 'src/content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
