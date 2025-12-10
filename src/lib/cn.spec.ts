import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes with false', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles conditional classes with undefined', () => {
    expect(cn('foo', undefined, 'baz')).toBe('foo baz')
  })

  it('handles conditional classes with null', () => {
    expect(cn('foo', null, 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('returns empty string for empty input', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string for all falsy values', () => {
    expect(cn(false, null, undefined, '')).toBe('')
  })

  it('handles complex Tailwind merging', () => {
    expect(cn('text-sm text-base', 'text-lg')).toBe('text-lg')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('handles object inputs with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})
