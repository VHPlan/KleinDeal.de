import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.APP_ENV === 'staging';

  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/profile/', '/messages/', '/my-listings/'],
    },
    sitemap: 'https://kleindeal.de/sitemap.xml',
  };
}
