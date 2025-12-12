import type { CaseItemKey } from '@/types/intl.d'

export const caseStudies = [
  { slug: 'logistics-optimization', industry: 'logistics' },
  { slug: 'supply-chain-integration', industry: 'manufacturing' },
  { slug: 'global-expansion', industry: 'retail' },
] as const satisfies readonly { slug: CaseItemKey; industry: string }[]

export type CaseSlug = (typeof caseStudies)[number]['slug']
export type CaseIndustry = (typeof caseStudies)[number]['industry']

export function getAllCaseSlugs(): CaseSlug[] {
  return caseStudies.map((item) => item.slug)
}
