import { createContentLoader } from 'vitepress'

export default createContentLoader('blog/*.md', {
    excerpt: true,
    transform(raw) {
        return raw
            .filter(p => p.frontmatter.title && p.url !== '/blog/')
            .map(p => ({
                url: p.url,
                title: p.frontmatter.title,
                date: p.frontmatter.date ?? '',
                tags: p.frontmatter.tags ?? [],
                category: p.frontmatter.category ?? '',
                excerpt: p.frontmatter.excerpt ?? p.excerpt ?? '',
                author: p.frontmatter.author ?? 'Anonymous',
                avatar: p.frontmatter.avatar ?? '',
                cover: p.frontmatter.cover ?? ''
            }))
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    }
})