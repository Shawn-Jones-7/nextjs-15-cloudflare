import type { NewsItemKey } from '@/types/intl.d'

export const newsItems = [
  { slug: 'expansion-2024', date: '2024-12-01' },
  { slug: 'partnership-announcement', date: '2024-11-15' },
  { slug: 'industry-award', date: '2024-10-20' },
] as const satisfies readonly { slug: NewsItemKey; date: string }[]

export type NewsSlug = (typeof newsItems)[number]['slug']

export function getAllNewsSlugs(): NewsSlug[] {
  return newsItems.map((item) => item.slug)
}
