import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to Google Fonts for optimal loading of telemetry fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      {/* We apply a default team class here (e.g., theme-ferrari) which binds to our v4 CSS variables */}
      <body class="theme-ferrari antialiased bg-carbon-800 text-gray-100 font-mono selection:bg-neon-red selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}