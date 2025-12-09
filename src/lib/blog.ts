import { type Locale } from '@/lib/i18n/config'

export interface Post {
  title: string
  description: string
  date: string
  image?: string
  tags: string[]
  slug: string
  locale: Locale
  url: string
  content: string
}

async function loadPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('#velite')
    return posts as Post[]
  } catch {
    return []
  }
}

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const posts = await loadPosts()
  return posts
    .filter((post) => post.locale === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(
  slug: string,
  locale: Locale,
): Promise<Post | undefined> {
  const posts = await loadPosts()
  return posts.find((post) => post.slug === slug && post.locale === locale)
}

export async function getPostSlugs(locale: Locale): Promise<string[]> {
  const posts = await getAllPosts(locale)
  return posts.map((post) => post.slug)
}

export async function getAllPostSlugs(): Promise<
  { slug: string; locale: Locale }[]
> {
  const posts = await loadPosts()
  return posts.map((post) => ({ slug: post.slug, locale: post.locale }))
}

export function formatDate(dateString: string, locale: Locale): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
