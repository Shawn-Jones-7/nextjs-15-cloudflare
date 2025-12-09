import Image from 'next/image'
import Link from 'next/link'

import type { Post } from '@/lib/blog'

import { ArrowRight, ImageIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { formatDate } from '@/lib/blog'
import { cn } from '@/lib/cn'
import { type Locale } from '@/lib/i18n/config'

interface BlogCardProperties {
  post: Post
  locale: Locale
  className?: string
}

export async function BlogCard({
  post,
  locale,
  className,
}: BlogCardProperties) {
  const t = await getTranslations({ locale, namespace: 'BlogPage' })

  return (
    <article
      className={cn(
        'group border-border bg-card text-card-foreground hover:border-primary/50 relative flex flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md',
        className,
      )}
    >
      <Link
        href={post.url}
        className='focus:ring-ring flex h-full flex-col rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none'
      >
        <div className='bg-muted relative aspect-video w-full overflow-hidden'>
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className='bg-muted text-muted-foreground flex h-full w-full items-center justify-center'>
              <ImageIcon className='h-12 w-12 opacity-20' aria-hidden='true' />
            </div>
          )}

          <div className='border-border/50 bg-background/90 text-foreground absolute start-4 top-4 z-10 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm'>
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </div>
        </div>

        <div className='flex flex-1 flex-col p-5'>
          {post.tags.length > 0 && (
            <div className='mb-3 flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-secondary text-secondary-foreground inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className='group-hover:text-primary mb-2 text-xl leading-tight font-semibold tracking-tight transition-colors'>
            {post.title}
          </h3>

          <p className='text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm'>
            {post.description}
          </p>

          <div className='text-primary mt-auto flex items-center text-sm font-medium'>
            {t('readMore')}
            <ArrowRight className='ms-1 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1' />
          </div>
        </div>
      </Link>
    </article>
  )
}
