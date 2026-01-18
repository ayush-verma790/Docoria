import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://docoria-bzu7.vercel.app/"

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
        '/redact',
        '/repair',
        '/html-to-pdf',
        '/pdf-to-excel',
        '/pdf-to-pptx',
        '/image-tools/bg-remover',
        '/image-tools/passport',
        '/image-tools/resize',
        '/image-tools/profile',
        '/image-tools/crop',
        '/image-tools/id-card',
        '/image-tools/blur',
        '/chat-pdf',
        '/auto-split',
        '/rotate',
        '/pdf-to-text',
        '/extract-images',
        '/extract-images',
        '/compare',
        '/blog',
        '/faq',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }))
}
