import { MDXRemote } from 'next-mdx-remote/rsc'

interface MDXContentProperties {
  source: string
  className?: string
}

export function MDXContent({ source, className }: MDXContentProperties) {
  return (
    <div className={className}>
      <MDXRemote source={source} />
    </div>
  )
}
