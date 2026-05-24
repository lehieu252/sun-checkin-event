import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'We are made of sun',
    short_name: 'We are made of sun',
    description: 'We are made of sun',
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
