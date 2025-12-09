import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { MDXContent } from '@/components/blog/mdx-content'
import { ArticleJsonLd } from '@/components/seo/structured-data'
import { Button } from '@/components/ui/button'
import { formatDate, getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import { type Locale } from '@/lib/i18n/config'
import { buildPageMetadata, siteUrl } from '@/lib/i18n/metadata'

interface Properties {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  const allSlugs = await getAllPostSlugs()
  return allSlugs.map(({ slug, locale }) => ({ locale, slug }))
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)

  if (!post) {
    return {}
  }

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    locale,
    pathname: `/blog/${slug}`,
    type: 'article',
    publishedTime: post.date,
    image: post.image ? `${siteUrl}${post.image}` : undefined,
    tags: post.tags,
  })
}

export default async function BlogPostPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await getPostBySlug(slug, locale)

  if (!post) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'BlogPage' })
  const readingTime = Math.max(
    1,
    Math.ceil(post.content.split(/\s+/).length / 200),
  )

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        locale={locale}
        slug={slug}
        section='news'
      />
      <article className='container ms-auto me-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20'>
        <div className='text-muted-foreground mb-8 flex items-center gap-2 text-sm'>
          <Button
            variant='ghost'
            size='sm'
            asChild
            className='hover:text-primary ps-0 hover:bg-transparent'
          >
            <Link href={`/${locale}/blog`}>
              <ArrowLeft className='me-1 size-4 rtl:rotate-180' />
              {t('backToBlog')}
            </Link>
          </Button>
        </div>

        <header className='mb-10 flex flex-col gap-6'>
          {post.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-secondary/50 text-secondary-foreground ring-secondary-foreground/10 inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                >
                  <Tag className='me-1.5 size-3 opacity-60' />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:leading-[1.1]'>
            {post.title}
          </h1>

          <div className='border-border text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-6 text-sm'>
            <div className='flex items-center gap-2'>
              <Calendar className='size-4' />
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='size-4' />
              <span>
                {readingTime} {t('minRead')}
              </span>
            </div>
          </div>
        </header>

        {post.image && (
          <div className='border-border bg-muted mb-12 overflow-hidden rounded-xl border shadow-sm'>
            <div className='relative aspect-video w-full'>
              <Image
                src={post.image}
                alt={post.title}
                fill
                className='object-cover'
                priority
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'
              />
            </div>
          </div>
        )}

        <MDXContent
          code={post.content}
          className='prose prose-slate dark:prose-invert prose-headings:scroll-m-20 prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:border-b prose-h2:pb-2 prose-h2:text-3xl prose-h2:first:mt-0 prose-h3:mt-8 prose-h3:text-2xl prose-p:leading-7 prose-p:[&:not(:first-child)]:mt-6 prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-blockquote:border-s-4 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:ps-4 prose-blockquote:italic prose-ul:my-6 prose-ul:ms-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ms-6 prose-ol:list-decimal prose-li:mt-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-hr:my-8 max-w-none'
        />

        <div className='border-border mt-16 flex justify-center border-t pt-8'>
          <Button variant='outline' size='lg' asChild className='group'>
            <Link href={`/${locale}/blog`}>
              <ArrowLeft className='me-2 size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1' />
              {t('returnToBlog')}
            </Link>
          </Button>
        </div>
      </article>
    </>
  )
}
