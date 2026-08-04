// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"

const BASE_URL = "https://yves-janvier.lovable.app"

const SUPABASE_URL = "https://qfnqmdmsapovxdjwdhsx.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbnFtZG1zYXBvdnhkandkaHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTIwMDgsImV4cCI6MjA2MTg2ODAwOH0.COLWed6k7Mw7kAevxuJtZtJv_Z0YTu4p9GN1NBTH_kY"

interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/portfolio", changefreq: "weekly", priority: "0.9" },
  { path: "/work", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/content/blog", changefreq: "daily", priority: "0.7" },
  { path: "/journal", changefreq: "weekly", priority: "0.7" },
  { path: "/now", changefreq: "monthly", priority: "0.5" },
  { path: "/resources", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
]

async function fetchRows(
  table: string,
  query: string,
): Promise<Record<string, string>[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!res.ok) return []
    return (await res.json()) as Record<string, string>[]
  } catch {
    return []
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

async function main() {
  const [posts, projects] = await Promise.all([
    fetchRows("blog_posts", "select=slug,updated_at&published=eq.true"),
    fetchRows("portfolio_projects", "select=slug,updated_at"),
  ])

  const dynamicEntries: SitemapEntry[] = [
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/blog/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : undefined,
        changefreq: "monthly" as const,
        priority: "0.8",
      })),
    ...projects
      .filter((p) => p.slug)
      .map((p) => ({
        path: `/portfolio/${p.slug}`,
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : undefined,
        changefreq: "monthly" as const,
        priority: "0.8",
      })),
  ]

  const entries = [...staticEntries, ...dynamicEntries]
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries))
  console.log(`sitemap.xml written (${entries.length} entries)`)
}

main()
