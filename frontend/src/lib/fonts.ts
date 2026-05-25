import localFont from 'next/font/local';

/** SVN-Gilroy — Medium (500), SemiBold (600), Italic (400) */
export const gilroy = localFont({
  src: [
    {
      path: '../fonts/SVN-Gilroy-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/SVN-Gilroy-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/SVN-Gilroy-Italic.otf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

export const seona = localFont({
  src: '../fonts/Seona-DEMO.otf',
  weight: '400',
  variable: '--font-seona',
  display: 'swap',
});

export const artnik = localFont({
  src: '../fonts/TBJArtnik-Regular.otf',
  weight: '400',
  variable: '--font-artnik',
  display: 'swap',
});

export const arialBold = localFont({
  src: '../fonts/arialbd.ttf',
  weight: '700',
  variable: '--font-arial-bold',
  display: 'swap',
});

/** All local font CSS variables for layout.tsx */
export const localFontVariables = [
  gilroy.variable,
  seona.variable,
  artnik.variable,
  arialBold.variable,
].join(' ');
