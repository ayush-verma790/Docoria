import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/'],
        },
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || "https://docorio-bzu7.vercel.app"}/sitemap.xml`,
    }
}
