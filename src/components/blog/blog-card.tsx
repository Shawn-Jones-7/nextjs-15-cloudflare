import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { type Locale } from '@/lib/i18n/config';
import { formatDate, type Post } from '@/lib/blog';
import { cn } from '@/lib/cn';

interface BlogCardProperties {
  post: Post;
  locale: Locale;
  className?: string;
}

export async function BlogCard({ post, locale, className }: BlogCardProperties) {
  const t = await getTranslations({ locale, namespace: 'BlogPage' });

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50',
        className
      )}
    >
      <Link
        href={post.url}
        className="flex h-full flex-col rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <ImageIcon className="h-12 w-12 opacity-20" aria-hidden="true" />
            </div>
          )}

          <div className="absolute start-4 top-4 z-10 rounded-md border border-border/50 bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="mb-2 text-xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>

          <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {post.description}
          </p>

          <div className="mt-auto flex items-center text-sm font-medium text-primary">
            {t('readMore')}
            <ArrowRight className="ms-1 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
