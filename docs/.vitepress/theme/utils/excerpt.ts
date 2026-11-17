// Turns a VitePress content-loader `excerpt` (rendered HTML) into a short
// plain-text preview, for places that show text only (no v-html).
//
// Two things need stripping beyond the obvious tags:
// - The excerpt's leading <h1> is the post's own title, which call sites
//   already show as their own heading — keeping it would duplicate it.
// - VitePress's header-anchor plugin embeds a literal "&ZeroWidthSpace;"
//   entity as the (invisible) permalink symbol inside heading HTML. Since
//   this text is never re-parsed as HTML (no v-html here), that entity
//   would otherwise survive tag-stripping and render as visible characters.
export function cleanExcerpt(raw: string, maxLength = 160): string {
  return raw
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&ZeroWidthSpace;/g, "")
    .trim()
    .slice(0, maxLength);
}
