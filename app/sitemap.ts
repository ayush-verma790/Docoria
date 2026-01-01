import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://docorio.com'

    const routes = [
        '',
        '/convert',
        '/merge',
        '/split',
        '/compress',
        '/sign',
        '/edit',
        '/pdf-to-jpg',
        '/image-to-pdf',
        '/watermark',
        '/organize',
        '/scanner',
        '/protect',
        '/unlock',
        '/qrcode',
        '/page-numbers',
        '/metadata',
        '/flatten',
        '/resize',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }))
}
