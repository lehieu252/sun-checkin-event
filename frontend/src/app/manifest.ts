import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plug in to evolution',
    short_name: 'Plug in',
    description: 'Sun check-in event display',
    start_url: '/',
    display: 'fullscreen',
    background_color: '#f8fbea',
    theme_color: '#ffa724',
    orientation: 'landscape',
    icons: [
      {
        src: '/sun.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
