import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'

export type Article = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImageUrl: string | null
  category: string | null
  authorName: string
  publishedAt: string
}

/** Published articles, newest first (RLS hides drafts and posts scheduled for later). */
export const getArticles = cache(async (): Promise<Article[]> => {
  const { data } = await createPublicClient()
    .from('articles')
    .select('id, slug, title, excerpt, body, cover_image_url, category, author_name, published_at')
    .order('published_at', { ascending: false })
  return (data ?? []).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    coverImageUrl: a.cover_image_url,
    category: a.category,
    authorName: a.author_name,
    publishedAt: a.published_at,
  }))
})

export const getArticle = cache(async (slug: string) => (await getArticles()).find((a) => a.slug === slug) ?? null)

export type Block = { kind: 'h2'; text: string } | { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }

/**
 * Articles are written in the admin as plain text: a blank line between paragraphs,
 * "## " to start a heading, and "- " at the start of each list item.
 */
export function parseBody(body: string): Block[] {
  return body
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map<Block>((chunk) => {
      if (chunk.startsWith('## ')) return { kind: 'h2', text: chunk.slice(3).trim() }
      const lines = chunk.split('\n').map((l) => l.trim())
      if (lines.every((l) => /^[-*] /.test(l))) return { kind: 'ul', items: lines.map((l) => l.slice(2).trim()) }
      return { kind: 'p', text: lines.join(' ') }
    })
}

export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).length / 220))
}
