import './globals.css'
import localFont from 'next/font/local'
import ClientLayout from '../components/ClientLayout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import YandexMetrika from '@/components/YandexMetrika'
import Providers from '@/components/Providers' // Импортируем наш провайдер

const molot = localFont({
  src: [
    {
      path: '../../public/fonts/molot.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-molot',
  display: 'swap',
})

const bebas = localFont({
  src: [
    {
      path: '../../public/fonts/bebasneuecyrillic.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-bebas',
  display: 'swap',
})

const bengaly = localFont({
  src: [
    {
      path: '../../public/fonts/agbengaly.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-bengaly',
  display: 'swap',
})

export const metadataBase = new URL('https://contrast-shop.ru');  
export const metadata = {
  title: {
    default: 'КОНТРАСТ - Кожаные аксессуары ручной работы из Итальянской кожи',
    template: '%s | КОНТРАСТ'
  },
  description: 'Ручной пошив кожаных ремней, кошельков, сумок и аксессуаров из натуральной Итальянской кожи премиум-качества. Индивидуальный заказ от 3 дней. Доставка по РФ.',
  keywords: 'кожаные ремни ручной работы, премиум кожаные аксессуары, индивидуальный пошив, итальянская кожа, кожаные кошельки, сумки из кожи, картхолдеры, портмоне',
  authors: [{ name: 'Степан Семенов' }],
  creator: 'ИП Семенов Степан Алексеевич',
  publisher: 'ИП Семенов Степан Алексеевич',

  icons: {
    icon: '/icon.png',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
  },
  
  openGraph: {
    title: 'КОНТРАСТ - Кожаные аксессуары ручной работы',
    description: 'Ручной пошив из натуральной Итальянской кожи. Индивидуальный заказ от 3 дней.',
    url: 'https://contrast-shop.ru/',
    siteName: 'КОНТРАСТ',
    logo: 'https://contrast-shop.ru/og-image-big.png',
    images: [
      {
        url: 'https://contrast-shop.ru/og-image-big.png',
        width: 1920,
        height: 640,
        alt: 'КОНТРАСТ - Кожаные аксессуары ручной работы',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'КОНТРАСТ - Кожаные аксессуары ручной работы',
    description: 'Ручной пошив из натуральной Итальянской кожи',
    images: ['https://contrast-shop.ru/og-image-big.png'],
  },

  vk: {
    images: ['https://contrast-shop.ru/og-image-big.png'],
  },

  other: {
    'geo.region': 'RU',
    'geo.placename': 'Russia',
  },
}


export default function RootLayout({ children }) {
  return (
    <html
      lang='ru'
      data-scroll-behavior='smooth'
      className={`${molot.variable} ${bebas.variable} ${bengaly.variable} antialiased`}>
        <head>
          <link rel="canonical" href="https://contrast-shop.ru/"/>
          <link rel="image_src" href="https://contrast-shop.ru/og-image-big.png"/>
          <meta name="yandex-verification" content="1aef5f034f13a568" />
        {/* Структурированные данные JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Handicraft",
              "name": "КОНТРАСТ",
              "description": "Мастерская кожаных аксессуаров ручной работы из Итальянской кожи",
              "url": "https://contrast-shop.ru/",
              "logo": "https://contrast-shop.ru//og-image-big.png",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "RU"
              },
              "founder": {
                "@type": "Person",
                "name": "Степан Семенов",
                "description": "Мастер с 6-летним опытом ручного пошива кожаных изделий"
              },
              "makesOffer": {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Кожаные аксессуары ручной работы",
                  "description": "Ремни, кошельки, сумки, портмоне из натуральной Итальянской кожи",
                  "material": "Натуральная кожа"
                }
              },
              "areaServed": "RU",
              "sameAs": [
                "https://vk.com/contrast_hm",
                "https://t.me/st_semenov"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <Header />
          <ClientLayout>
            {children}
          </ClientLayout>
          <Footer />
          <YandexMetrika/>
        </Providers>
      </body>
    </html>
  )
}