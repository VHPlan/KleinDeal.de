import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kleindeal.de';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/api/*',
        '/messages',
        '/my-listings',
        '/profile',
        '/staging-login',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
