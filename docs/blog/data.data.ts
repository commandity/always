// docs/blog/data.data.ts
import { createContentLoader } from 'vitepress'

export interface Post {
    title: string
    url: string
    date: string
    excerpt: string
    cover: string
    category: string
    tags: string[]
    author: string
    avatar: string
}

export default createContentLoader('blog/*.md', {
    excerpt: true,
    transform(raw): Post[] {
        return raw
            .map(({ url, frontmatter, excerpt }) => ({
                title: frontmatter.title ?? '未命名文章',
                url,
                date: frontmatter.date ?? '',
                excerpt: excerpt ?? '',
                cover: frontmatter.cover ?? '',
                category: frontmatter.category ?? '',
                tags: frontmatter.tags ?? [],
                author: frontmatter.author ?? '',
                avatar: frontmatter.avatar ?? '',
            }))
            .filter(p => p.date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
})