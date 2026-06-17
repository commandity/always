import { createContentLoader } from 'vitepress'

export default createContentLoader('citations/*.md', {
    excerpt: true,
    transform(raw) {
        return raw
            .filter(p => p.frontmatter.text)
            .map(p => ({
                url: p.url,
                text: p.frontmatter.text,
                author: p.frontmatter.author ?? '佚名',
                source: p.frontmatter.source ?? '',
                date: p.frontmatter.date ?? '',
                tags: p.frontmatter.tags ?? [],
                category: p.frontmatter.category ?? '',
            }))
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    }
})
