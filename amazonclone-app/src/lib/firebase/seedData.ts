// ============================================================================
// Catalog Seed Data — Categories & Products
// Cloudinary image URLs + realistic specs, variants, pricing, and stock
// ============================================================================
import type { Category, Product } from '@/types';

export const SEED_CATEGORIES: Category[] = [
  {
    "id": "cat-electronics",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Noise-canceling headphones, tablets, gaming consoles, smart speakers, and personal audio.",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "itemCount": 12
  },
  {
    "id": "cat-computers",
    "name": "Computers & Accessories",
    "slug": "computers",
    "description": "Laptops, desktop PCs, curved gaming monitors, mechanical keyboards, and external hard drives.",
    "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    "itemCount": 14
  },
  {
    "id": "cat-fashion",
    "name": "Fashion & Apparel",
    "slug": "fashion",
    "description": "Women dresses, men sport coats, kids outfits, gold jewelry, and vegan leather handbags.",
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    "itemCount": 15
  },
  {
    "id": "cat-home-garden",
    "name": "Home & Garden",
    "slug": "home-garden",
    "description": "Kitchen appliances, cookware sets, robot vacuums, queen pillows, and home decor.",
    "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    "itemCount": 14
  },
  {
    "id": "cat-home-kitchen",
    "name": "Home & Kitchen",
    "slug": "home-kitchen",
    "description": "Kitchen coffee makers, nonstick pots and pans, robot vacuums, and living room comfort.",
    "image": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    "itemCount": 14
  },
  {
    "id": "cat-beauty",
    "name": "Beauty & Personal Care",
    "slug": "beauty",
    "description": "COSRX snail mucin serums, salon hair dryers, matte velvet lipsticks, and luxury perfumes.",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    "itemCount": 8
  },
  {
    "id": "cat-toys",
    "name": "Toys & Games",
    "slug": "toys",
    "description": "Super Mario figures, wooden building blocks, plush teddy bears, and high-speed RC trucks.",
    "image": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80",
    "itemCount": 8
  },
  {
    "id": "cat-sports",
    "name": "Sports & Outdoors",
    "slug": "sports",
    "description": "Adjustable dumbbells, fitness trackers, athletic moisture-wicking shirts, and premium yoga mats.",
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    "itemCount": 8
  },
  {
    "id": "cat-books",
    "name": "Books",
    "slug": "books",
    "description": "Bestselling paperbacks, hardcovers, self-improvement, and timeless business literature.",
    "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  }
];

export const SEED_PRODUCTS: Product[] = [
  // ── Electronics ─────────────────────────────────────────────────────────────
  {
    id: 'prod-sony-wh1000xm5',
    sku: 'SNY-WH1000XM5-BLK',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling Over-Ear Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    description:
      'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality. With newly developed 30mm drivers and lightweight carbon fiber composite, enjoy high-resolution audio tuned to perfection.',
    price: 348.0,
    originalPrice: 399.99,
    compareAtPrice: 399.99,
    discountPercent: 13,
    category: 'electronics',
    categoryName: 'Electronics',
    brand: 'Sony',
    stock: 28,
    status: 'active',
    rating: 4.7,
    reviewCount: 14820,
    isPrimeEligible: true,
    isBestSeller: true,
    isFeatured: true,
    tags: ['headphones', 'bluetooth', 'noise-canceling', 'wireless', 'sony'],
    features: [
      'Industry Leading Noise Cancellation with two processors and 8 microphones',
      'Ultra-comfortable, lightweight design with soft-fit leather',
      'Up to 30-hour battery life with 3-minute quick charge for 3 hours of playback',
      'Crystal clear hands-free calling with 4 beamforming microphones and AI noise reduction',
      'Multipoint connection allows seamless pairing with two devices at once',
    ],
    specifications: {
      Brand: 'Sony',
      'Model Name': 'WH1000XM5',
      Color: 'Black',
      'Form Factor': 'Over Ear',
      Connectivity: 'Bluetooth 5.2, 3.5mm Aux',
      'Battery Life': '30 Hours',
      'Noise Control': 'Active Noise Cancellation',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        alt: 'Sony WH-1000XM5 Wireless Headphones in Black',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        alt: 'Sony WH-1000XM5 Side Profile and Earcup',
      },
      {
        url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
        alt: 'Sony WH-1000XM5 Folded in Case',
      },
    ],
    variants: [
      {
        id: 'var-sony-black',
        sku: 'SNY-WH1000XM5-BLK',
        title: 'Black',
        price: 348.0,
        compareAtPrice: 399.99,
        stock: 28,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        attributes: { Color: 'Black' },
      },
      {
        id: 'var-sony-silver',
        sku: 'SNY-WH1000XM5-SLV',
        title: 'Platinum Silver',
        price: 348.0,
        compareAtPrice: 399.99,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
        attributes: { Color: 'Platinum Silver' },
      },
      {
        id: 'var-sony-blue',
        sku: 'SNY-WH1000XM5-BLU',
        title: 'Midnight Blue',
        price: 378.0,
        compareAtPrice: 399.99,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
        attributes: { Color: 'Midnight Blue' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 10:00 PM',
      standardDeliveryDate: 'Thursday, Oct 15',
    },
    seller: { id: 'seller-official-sony', name: 'Sony Direct Store', rating: 4.8 },
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-airpods-pro-2',
    sku: 'APL-APP2-USBC',
    title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds with USB-C MagSafe Case',
    slug: 'apple-airpods-pro-2nd-gen',
    description:
      'AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation than the previous generation, with Transparency mode that lets you hear the world around you and all-new Adaptive Audio that dynamically tailors noise control to your environment.',
    price: 189.99,
    originalPrice: 249.0,
    compareAtPrice: 249.0,
    discountPercent: 24,
    category: 'electronics',
    categoryName: 'Electronics',
    brand: 'Apple',
    stock: 45,
    status: 'active',
    rating: 4.8,
    reviewCount: 31200,
    isPrimeEligible: true,
    isBestSeller: true,
    isFeatured: true,
    tags: ['airpods', 'apple', 'earbuds', 'wireless', 'usb-c'],
    features: [
      'Up to 2x more Active Noise Cancellation with H2 chip',
      'Adaptive Audio dynamically blends Transparency and Noise Cancellation',
      'Personalized Spatial Audio with dynamic head tracking',
      'MagSafe Charging Case (USB-C) with Precision Finding and speaker',
      'Dust, sweat, and water resistant (IP54)',
    ],
    specifications: {
      Brand: 'Apple',
      Model: 'AirPods Pro (2nd Gen)',
      Color: 'White',
      Audio: 'Personalized Spatial Audio',
      Connector: 'USB-C',
      'Battery Life': 'Up to 30 hours with case',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        alt: 'Apple AirPods Pro 2 with Charging Case',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=80',
        alt: 'Apple AirPods Pro In Ear Placement',
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 8:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-apple', name: 'Apple Authorized Reseller', rating: 4.9 },
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-echo-dot-5',
    sku: 'AMZ-ECHODOT-5TH',
    title: 'All-new Echo Dot (5th Gen) | Smart speaker with bigger vibrant sound and Alexa',
    slug: 'all-new-echo-dot-5th-gen',
    description:
      'Our best sounding Echo Dot yet — Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room. Control smart home devices, play music, set timers and more.',
    price: 49.99,
    originalPrice: 59.99,
    compareAtPrice: 59.99,
    discountPercent: 17,
    category: 'electronics',
    categoryName: 'Electronics',
    brand: 'Amazon',
    stock: 90,
    status: 'active',
    rating: 4.6,
    reviewCount: 42300,
    isPrimeEligible: true,
    isBestSeller: false,
    tags: ['alexa', 'echo', 'smart-home', 'speaker'],
    features: [
      'Our best sounding Echo Dot with deeper bass and clear vocals',
      'Voice control your entertainment across Amazon Music, Spotify, Apple Music',
      'Built-in motion and temperature sensors for automated smart routines',
      'Tap to snooze your alarm clock',
    ],
    specifications: {
      Brand: 'Amazon',
      Model: 'Echo Dot (5th Gen)',
      Connectivity: 'Dual-band Wi-Fi & Bluetooth',
      Dimensions: '3.9" x 3.9" x 3.5"',
      Weight: '10.7 oz (304g)',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
        alt: 'Echo Dot 5th Gen on nightstand',
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-echo-charcoal',
        sku: 'AMZ-ECHODOT-5TH-CHR',
        title: 'Charcoal',
        price: 49.99,
        stock: 50,
        attributes: { Color: 'Charcoal' },
      },
      {
        id: 'var-echo-white',
        sku: 'AMZ-ECHODOT-5TH-WHT',
        title: 'Glacier White',
        price: 49.99,
        stock: 25,
        attributes: { Color: 'Glacier White' },
      },
      {
        id: 'var-echo-blue',
        sku: 'AMZ-ECHODOT-5TH-BLU',
        title: 'Deep Sea Blue',
        price: 49.99,
        stock: 15,
        attributes: { Color: 'Deep Sea Blue' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 2:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-amazon', name: 'Amazon.com', rating: 4.9 },
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-samsung-oled-65',
    sku: 'SAM-QN65S90C-4K',
    title: 'SAMSUNG 65-Inch Class OLED 4K S90C Series Smart TV with Dolby Atmos',
    slug: 'samsung-65-inch-oled-4k-s90c',
    description:
      'Step up to OLED technology with bold contrast, dramatic sound, and vibrant colors. See your movies, games, and content burst to life with pure blacks and Pantone-validated color fidelity powered by the Neural Quantum Processor with 4K Upscaling.',
    price: 1597.99,
    originalPrice: 2599.99,
    compareAtPrice: 2599.99,
    discountPercent: 39,
    category: 'electronics',
    categoryName: 'Electronics',
    brand: 'Samsung',
    stock: 4, // Low stock test
    status: 'active',
    rating: 4.6,
    reviewCount: 1850,
    isPrimeEligible: true,
    isBestSeller: false,
    tags: ['tv', 'oled', '4k', 'samsung', 'smart-tv'],
    features: [
      'OLED Technology with Neural Quantum Processor with 4K Upscaling',
      'Quantum HDR OLED reveals fine details in deep blacks and vivid brights',
      'Motion Xcelerator Turbo Pro delivers up to 144Hz refresh rate for gaming',
      'Object Tracking Sound Lite & Dolby Atmos 3D audio experience',
    ],
    specifications: {
      Brand: 'Samsung',
      'Screen Size': '65 Inches',
      'Display Technology': 'OLED',
      Resolution: '4K (3840 x 2160)',
      'Refresh Rate': '144 Hz',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
        alt: 'Samsung 65-inch OLED TV in living room',
        isPrimary: true,
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 3,
      fastestDeliveryDate: 'Saturday, Oct 17',
      standardDeliveryDate: 'Monday, Oct 19',
    },
    seller: { id: 'seller-samsung', name: 'Samsung Electronics', rating: 4.7 },
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },

  // ── Computers & Accessories ────────────────────────────────────────────────
  {
    id: 'prod-macbook-air-m3-15',
    sku: 'APL-MBA15-M3-256',
    title: 'Apple 2024 MacBook Air 15-inch Laptop with M3 chip, 8GB Unified Memory, 256GB SSD',
    slug: 'apple-2024-macbook-air-15-inch-m3',
    description:
      'The 15-inch MacBook Air is impossibly thin with an expansive Liquid Retina display. Powered by the M3 chip, with up to 18 hours of battery life and a portable design, you can take work and play anywhere with blazing fast responsiveness.',
    price: 1099.0,
    originalPrice: 1299.0,
    compareAtPrice: 1299.0,
    discountPercent: 15,
    category: 'computers',
    categoryName: 'Computers & Accessories',
    brand: 'Apple',
    stock: 19,
    status: 'active',
    rating: 4.9,
    reviewCount: 3840,
    isPrimeEligible: true,
    isBestSeller: true,
    isFeatured: true,
    tags: ['laptop', 'macbook', 'apple', 'm3', 'ultrabook'],
    features: [
      'Supercharged by Apple M3 chip with 8-core CPU and 10-core GPU',
      'Up to 18 hours of all-day battery life',
      'Brilliant 15.3-inch Liquid Retina display with 500 nits of brightness',
      'MagSafe 3 charging port, two Thunderbolt ports, headphone jack',
      '1080p FaceTime HD camera, three-mic array, six-speaker sound with Spatial Audio',
    ],
    specifications: {
      Brand: 'Apple',
      'Model Name': 'MacBook Air 15',
      Screen: '15.3-Inch Liquid Retina',
      Processor: 'Apple M3 Chip',
      RAM: '8GB Unified Memory',
      Storage: '256GB SSD',
      Weight: '3.3 lbs (1.51 kg)',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        alt: 'Apple MacBook Air 15 open on clean desk',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        alt: 'MacBook Air aluminum chassis profile',
      },
    ],
    variants: [
      {
        id: 'var-mba-midnight-256',
        sku: 'APL-MBA15-M3-256-MID',
        title: 'Midnight - 256GB SSD',
        price: 1099.0,
        compareAtPrice: 1299.0,
        stock: 9,
        attributes: { Color: 'Midnight', Storage: '256GB' },
      },
      {
        id: 'var-mba-spacegray-256',
        sku: 'APL-MBA15-M3-256-GRY',
        title: 'Space Gray - 256GB SSD',
        price: 1099.0,
        compareAtPrice: 1299.0,
        stock: 10,
        attributes: { Color: 'Space Gray', Storage: '256GB' },
      },
      {
        id: 'var-mba-starlight-512',
        sku: 'APL-MBA15-M3-512-STR',
        title: 'Starlight - 512GB SSD',
        price: 1299.0,
        compareAtPrice: 1499.0,
        stock: 6,
        attributes: { Color: 'Starlight', Storage: '512GB' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 1:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-apple', name: 'Apple Authorized Reseller', rating: 4.9 },
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-logitech-mx-master-3s',
    sku: 'LOG-MXM3S-GRPH',
    title: 'Logitech MX Master 3S Wireless Performance Mouse with Quiet Clicks and 8K DPI',
    slug: 'logitech-mx-master-3s-wireless-mouse',
    description:
      'An icon remastered. Feel every moment of your workflow with Quiet Clicks and an 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling delivers remarkable speed and precision, and the ergonomic silhouette supports your palm and fingers all day.',
    price: 99.99,
    originalPrice: 119.99,
    compareAtPrice: 119.99,
    discountPercent: 17,
    category: 'computers',
    categoryName: 'Computers & Accessories',
    brand: 'Logitech',
    stock: 55,
    status: 'active',
    rating: 4.7,
    reviewCount: 16900,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['mouse', 'logitech', 'wireless', 'ergonomic', 'mx-master'],
    features: [
      'Quiet Clicks with 90% less click noise',
      '8K DPI any-surface tracking, including on glass',
      'MagSpeed scroll wheel: 1,000 lines per second with pixel-precise stops',
      'Connect up to 3 devices via Bluetooth or Logi Bolt USB receiver',
      'USB-C rechargeable with up to 70 days battery life',
    ],
    specifications: {
      Brand: 'Logitech',
      'Sensor Technology': 'Darkfield High Precision (8000 DPI)',
      Buttons: '7 Buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode, Middle)',
      'Battery Type': 'Rechargeable Li-Po (500 mAh)',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        alt: 'Logitech MX Master 3S Mouse on desk',
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-mx-graphite',
        sku: 'LOG-MXM3S-GRPH',
        title: 'Graphite',
        price: 99.99,
        stock: 35,
        attributes: { Color: 'Graphite' },
      },
      {
        id: 'var-mx-palegray',
        sku: 'LOG-MXM3S-PGRY',
        title: 'Pale Gray',
        price: 99.99,
        stock: 20,
        attributes: { Color: 'Pale Gray' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 5:00 PM',
      standardDeliveryDate: 'Thursday, Oct 15',
    },
    seller: { id: 'seller-logitech', name: 'Logitech Store', rating: 4.8 },
    createdAt: '2026-09-06T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-dell-ultrasharp-27',
    sku: 'DEL-U2723QE-4K',
    title: 'Dell UltraSharp 27 4K UHD USB-C Hub Monitor (U2723QE) with IPS Black',
    slug: 'dell-ultrasharp-27-4k-monitor',
    description:
      'Be your most productive on this 27-inch 4K monitor featuring brilliant color and contrast with groundbreaking IPS Black technology and a connectivity hub that delivers 90W power charging over a single USB-C cable.',
    price: 519.99,
    originalPrice: 679.99,
    compareAtPrice: 679.99,
    discountPercent: 24,
    category: 'computers',
    categoryName: 'Computers & Accessories',
    brand: 'Dell',
    stock: 0, // OUT OF STOCK TEST PRODUCT
    status: 'out_of_stock',
    rating: 4.6,
    reviewCount: 3100,
    isPrimeEligible: false,
    isBestSeller: false,
    tags: ['monitor', 'dell', '4k', 'usb-c', 'ips-black'],
    features: [
      '27-inch 4K UHD (3840 x 2160) with IPS Black 2000:1 contrast ratio',
      'Wide color coverage: 98% DCI-P3 and VESA DisplayHDR 400',
      'Extensive connectivity: USB-C (up to 90W power delivery), RJ45 Ethernet, DP 1.4, HDMI',
      'ComfortView Plus reduces low blue light without sacrificing color accuracy',
    ],
    specifications: {
      Brand: 'Dell',
      'Screen Size': '27 Inches',
      Resolution: '4K UHD (3840 x 2160)',
      Panel: 'IPS Black',
      Ports: 'USB-C (90W), HDMI, DisplayPort, RJ45 Ethernet, 5x USB-A',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        alt: 'Dell UltraSharp 27 4K Monitor workspace setup',
        isPrimary: true,
      },
    ],
    deliveryInfo: {
      isFreeDelivery: false,
      estimatedDays: 7,
      fastestDeliveryDate: 'Currently Unavailable',
      standardDeliveryDate: 'Currently Unavailable',
    },
    seller: { id: 'seller-dell', name: 'Dell Technologies', rating: 4.6 },
    createdAt: '2026-09-07T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },

  // ── Fashion & Apparel ──────────────────────────────────────────────────────
  {
    id: 'prod-levis-511-slim',
    sku: 'LEV-511-SLIM-DK',
    title: "Levi's Men's 511 Slim Fit Stretch Denim Jeans",
    slug: 'levis-mens-511-slim-fit-jeans',
    description:
      "A modern slim with room to move. Added stretch for all-day comfort. Levi's 511 Slim Fit Jeans are cut close without being too tight, making them the classic versatile staple for casual everyday wear.",
    price: 49.99,
    originalPrice: 69.5,
    compareAtPrice: 69.5,
    discountPercent: 28,
    category: 'fashion',
    categoryName: 'Fashion & Apparel',
    brand: "Levi's",
    stock: 40,
    status: 'active',
    rating: 4.5,
    reviewCount: 22400,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['jeans', 'levis', 'mens', 'denim', 'clothing'],
    features: [
      '99% Cotton, 1% Elastane for slight flex stretch comfort',
      'Slim from hip to ankle with a low rise waist',
      'Zip fly with button closure and signature 5-pocket styling',
      'Machine washable',
    ],
    specifications: {
      Brand: "Levi's",
      Material: '99% Cotton, 1% Elastane',
      Fit: 'Slim Fit',
      Closure: 'Zipper fly',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
        alt: "Levi's 511 Slim Fit Jeans front",
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-levis-30-32',
        sku: 'LEV-511-30-32',
        title: '30W x 32L / Dark Blue',
        price: 49.99,
        compareAtPrice: 69.5,
        stock: 15,
        attributes: { Size: '30W x 32L', Color: 'Dark Wash' },
      },
      {
        id: 'var-levis-32-32',
        sku: 'LEV-511-32-32',
        title: '32W x 32L / Dark Blue',
        price: 49.99,
        compareAtPrice: 69.5,
        stock: 20,
        attributes: { Size: '32W x 32L', Color: 'Dark Wash' },
      },
      {
        id: 'var-levis-34-32',
        sku: 'LEV-511-34-32',
        title: '34W x 32L / Black Wash',
        price: 54.99,
        compareAtPrice: 69.5,
        stock: 5,
        attributes: { Size: '34W x 32L', Color: 'Black Wash' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 2,
      fastestDeliveryDate: 'Wednesday, Oct 14',
      standardDeliveryDate: 'Friday, Oct 16',
    },
    seller: { id: 'seller-levis', name: "Levi's Official Store", rating: 4.8 },
    createdAt: '2026-09-08T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-nike-air-force-1',
    sku: 'NKE-AF1-07-WHT',
    title: "Nike Men's Air Force 1 '07 Low Basketball Sneakers",
    slug: 'nike-air-force-1-07-sneakers',
    description:
      "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.",
    price: 115.0,
    originalPrice: 130.0,
    compareAtPrice: 130.0,
    discountPercent: 12,
    category: 'fashion',
    categoryName: 'Fashion & Apparel',
    brand: 'Nike',
    stock: 22,
    status: 'active',
    rating: 4.8,
    reviewCount: 36200,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['sneakers', 'shoes', 'nike', 'air-force', 'streetwear'],
    features: [
      'Stitched leather overlays on the upper add heritage style, durability and support',
      'Originally designed for performance hoops, Nike Air cushioning adds lightweight comfort',
      'Low-cut silhouette adds a clean, streamlined look',
      'Padded collar feels soft and comfortable around the ankle',
    ],
    specifications: {
      Brand: 'Nike',
      Silhouette: "Air Force 1 '07",
      Upper: 'Real & Synthetic Leather',
      Sole: 'Rubber Cupsole with Air unit',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        alt: "Nike Air Force 1 '07 athletic sneaker",
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-af1-sz9',
        sku: 'NKE-AF1-WHT-9',
        title: 'Size 9 / Triple White',
        price: 115.0,
        stock: 8,
        attributes: { Size: '9 US', Color: 'Triple White' },
      },
      {
        id: 'var-af1-sz10',
        sku: 'NKE-AF1-WHT-10',
        title: 'Size 10 / Triple White',
        price: 115.0,
        stock: 10,
        attributes: { Size: '10 US', Color: 'Triple White' },
      },
      {
        id: 'var-af1-sz11',
        sku: 'NKE-AF1-WHT-11',
        title: 'Size 11 / Triple White',
        price: 115.0,
        stock: 4,
        attributes: { Size: '11 US', Color: 'Triple White' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 9:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-nike', name: 'Nike Retail', rating: 4.9 },
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-rayban-aviator',
    sku: 'RBN-RB3025-GOLD',
    title: 'Ray-Ban Classic Aviator Sunglasses (RB3025) Polarized Metal Frame',
    slug: 'rayban-classic-aviator-sunglasses',
    description:
      'Currently one of the most iconic sunglass models in the world, Ray-Ban Aviator Classic sunglasses were originally designed for U.S. aviators in 1937. Combine great aviator styling with exceptional quality, performance and comfort.',
    price: 163.0,
    originalPrice: 210.0,
    compareAtPrice: 210.0,
    discountPercent: 22,
    category: 'fashion',
    categoryName: 'Fashion & Apparel',
    brand: 'Ray-Ban',
    stock: 14,
    status: 'active',
    rating: 4.7,
    reviewCount: 8900,
    isPrimeEligible: true,
    isBestSeller: false,
    tags: ['sunglasses', 'ray-ban', 'eyewear', 'polarized', 'accessories'],
    features: [
      'Classic crystal glass lenses provide 100% UV400 protection',
      'Durable polished gold metal frame with comfortable acetate temple tips',
      'Includes Ray-Ban branded protective case and cleaning cloth',
    ],
    specifications: {
      Brand: 'Ray-Ban',
      Frame: 'Polished Gold Metal',
      Lens: 'Green Classic G-15',
      'Lens Width': '58 mm',
      Polarization: 'Non-Polarized / Polarized option',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
        alt: 'Ray-Ban Classic Aviator Sunglasses on reflective table',
        isPrimary: true,
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 2,
      fastestDeliveryDate: 'Wednesday, Oct 14',
      standardDeliveryDate: 'Friday, Oct 16',
    },
    seller: { id: 'seller-rayban', name: 'Luxottica Group', rating: 4.7 },
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },

  // ── Home & Kitchen ─────────────────────────────────────────────────────────
  {
    id: 'prod-ninja-air-fryer-4qt',
    sku: 'NNJ-AF101-4QT',
    title: 'Ninja AF101 Air Fryer that Crisps, Roasts, Reheats, & Dehydrates, 4-Quart Capacity',
    slug: 'ninja-af101-air-fryer-4-quart',
    description:
      'Now there’s a fast and easy way to cook your favorite meals and snacks. The Ninja Air Fryer circulates super-hot air around your food to remove moisture from its surface to give it that golden-brown, crispy finish without all the fat.',
    price: 89.95,
    originalPrice: 129.99,
    compareAtPrice: 129.99,
    discountPercent: 31,
    category: 'home-kitchen',
    categoryName: 'Home & Kitchen',
    brand: 'Ninja',
    stock: 35,
    status: 'active',
    rating: 4.8,
    reviewCount: 48900,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['kitchen', 'air-fryer', 'ninja', 'appliances', 'cooking'],
    features: [
      'Guilt-free fried food: up to 75% less fat than traditional frying methods',
      'Wide temperature range: 105°F to 400°F for gentle dehydrating or quick crisping',
      '4-quart ceramic-coated nonstick basket and crisper plate fits 2 lbs of french fries',
      'Dishwasher-safe parts for effortless clean up',
    ],
    specifications: {
      Brand: 'Ninja',
      Capacity: '4 Quarts',
      Color: 'Black/Grey',
      Wattage: '1500 Watts',
      Dimensions: '13.6"D x 11"W x 13.3"H',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        alt: 'Modern kitchen counter with air fryer appliance',
        isPrimary: true,
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 4:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-ninja', name: 'SharkNinja Official', rating: 4.8 },
    createdAt: '2026-09-11T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-nespresso-vertuoplus',
    sku: 'NES-VRTPLUS-DEL',
    title: "Nespresso VertuoPlus Coffee and Espresso Machine by De'Longhi",
    slug: 'nespresso-vertuoplus-coffee-espresso-machine',
    description:
      'Nespresso VertuoPlus offers freshly brewed coffee with crema as well as delicious, authentic espresso. It conveniently makes five cup sizes at the touch of a button: Alto Coffee, Mug, Gran Lungo, Double Espresso, and Espresso.',
    price: 149.95,
    originalPrice: 199.0,
    compareAtPrice: 199.0,
    discountPercent: 25,
    category: 'home-kitchen',
    categoryName: 'Home & Kitchen',
    brand: 'Nespresso',
    stock: 16,
    status: 'active',
    rating: 4.6,
    reviewCount: 11200,
    isPrimeEligible: true,
    isBestSeller: false,
    tags: ['coffee', 'espresso', 'nespresso', 'kitchen'],
    features: [
      'Versatile automated coffee maker brews 5 cup sizes with Centrifusion extraction',
      'Precision brewing uses barcode technology on the rim of each capsule',
      'Moveable 60 oz. water tank can rotate to the side or rear to fit kitchen counter space',
      'Automatic opening and closing motorized brew head with fast 20-second heat up',
    ],
    specifications: {
      Brand: 'Nespresso',
      'Special Feature': 'Programmable, Removable Tank, Barcode Centrifusion',
      Capacity: '60 Fluid Ounces',
      Color: 'Matte Black',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
        alt: 'Nespresso espresso extraction with golden crema',
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-nesp-black',
        sku: 'NES-VRTPLUS-BLK',
        title: 'Matte Black',
        price: 149.95,
        stock: 10,
        attributes: { Color: 'Matte Black' },
      },
      {
        id: 'var-nesp-titan',
        sku: 'NES-VRTPLUS-TTN',
        title: 'Titan Grey',
        price: 149.95,
        stock: 6,
        attributes: { Color: 'Titan Grey' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 6:00 PM',
      standardDeliveryDate: 'Thursday, Oct 15',
    },
    seller: { id: 'seller-nespresso', name: "Nestlé Nespresso / De'Longhi", rating: 4.8 },
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },

  // ── Books ──────────────────────────────────────────────────────────────────
  {
    id: 'prod-atomic-habits',
    sku: 'BOK-ATMHAB-HC',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    slug: 'atomic-habits-james-clear',
    description:
      'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world’s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    price: 13.79,
    originalPrice: 27.0,
    compareAtPrice: 27.0,
    discountPercent: 49,
    category: 'books',
    categoryName: 'Books',
    brand: 'James Clear',
    stock: 120,
    status: 'active',
    rating: 4.9,
    reviewCount: 114500,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['books', 'bestseller', 'habits', 'psychology', 'self-help'],
    features: [
      '#1 New York Times Bestseller with over 15 million copies sold',
      'Learn how to make time for new habits, overcome lack of motivation and willpower',
      'Design your environment to make success easier',
      'Get back on track when you fall off course',
    ],
    specifications: {
      Author: 'James Clear',
      Publisher: 'Avery (Penguin Random House)',
      Language: 'English',
      'Print Length': '320 Pages',
      Dimensions: '6.25 x 1.1 x 9.3 inches',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        alt: 'Atomic Habits hardcover book on study desk',
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: 'var-ah-hardcover',
        sku: 'BOK-ATMHAB-HC',
        title: 'Hardcover',
        price: 13.79,
        compareAtPrice: 27.0,
        stock: 80,
        attributes: { Format: 'Hardcover' },
      },
      {
        id: 'var-ah-paperback',
        sku: 'BOK-ATMHAB-PB',
        title: 'Paperback',
        price: 11.99,
        compareAtPrice: 18.0,
        stock: 40,
        attributes: { Format: 'Paperback' },
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 12:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-amazon', name: 'Amazon.com', rating: 4.9 },
    createdAt: '2026-09-13T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'prod-psychology-of-money',
    sku: 'BOK-PSYMOM-PB',
    title: 'The Psychology of Money: Timeless lessons on wealth, greed, and happiness',
    slug: 'psychology-of-money-morgan-housel',
    description:
      'Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people. Award-winning author Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life’s most important topics.',
    price: 12.99,
    originalPrice: 19.99,
    compareAtPrice: 19.99,
    discountPercent: 35,
    category: 'books',
    categoryName: 'Books',
    brand: 'Morgan Housel',
    stock: 65,
    status: 'active',
    rating: 4.8,
    reviewCount: 52300,
    isPrimeEligible: true,
    isBestSeller: true,
    tags: ['books', 'finance', 'investing', 'psychology', 'bestseller'],
    features: [
      'Over 4 million copies sold globally',
      'Timeless wisdom on financial independence, risk, and long-term compound wealth',
      'Accessible, gripping storytelling divided into 19 digestible chapters',
    ],
    specifications: {
      Author: 'Morgan Housel',
      Publisher: 'Harriman House',
      Language: 'English',
      'Print Length': '256 Pages',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80',
        alt: 'The Psychology of Money book displayed on wooden shelf',
        isPrimary: true,
      },
    ],
    deliveryInfo: {
      isFreeDelivery: true,
      estimatedDays: 1,
      fastestDeliveryDate: 'Tomorrow, by 8:00 PM',
      standardDeliveryDate: 'Wednesday, Oct 14',
    },
    seller: { id: 'seller-amazon', name: 'Amazon.com', rating: 4.9 },
    createdAt: '2026-09-14T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  },
  {
    "id": "prod-keurig-coffee-maker",
    "sku": "HOM-KEURIG-ELITE",
    "title": "Keurig K-Elite Single-Serve Iced and Hot Coffee Maker, Brushed Slate",
    "slug": "keurig-k-elite-single-serve-coffee-maker",
    "description": "The Keurig K-Elite single serve coffee maker blends a premium brushed finish with programmable features to deliver ultimate beverage customization. Features iced setting for full-flavored iced coffee and hot water on demand.",
    "price": 149.99,
    "originalPrice": 189.99,
    "compareAtPrice": 189.99,
    "discountPercent": 21,
    "category": "home-garden",
    "categoryName": "Home & Garden",
    "brand": "Keurig",
    "stock": 42,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 38290,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "isFeatured": true,
    "tags": [
      "kitchen",
      "coffee",
      "coffee maker",
      "home",
      "appliances",
      "breakfast"
    ],
    "features": [
      "Strong Brew button increases strength and bold taste of your coffee",
      "Iced setting brews hot over ice at the touch of a button",
      "Large 75oz removable water reservoir brews 8 cups before refilling",
      "Multiple brew sizes: 4, 6, 8, 10, and 12 oz"
    ],
    "specifications": {
      "Brand": "Keurig",
      "Color": "Brushed Slate",
      "Capacity": "75 oz",
      "Material": "Stainless Steel"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
        "alt": "Keurig Coffee Maker on kitchen counter",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-cuisinart-cookware",
    "sku": "HOM-CUIS-11PC",
    "title": "Cuisinart 11-Piece Stainless Steel Kitchen Cookware Pots and Pans Set",
    "slug": "cuisinart-11-piece-cookware-set",
    "description": "Professional grade stainless steel cookware featuring aluminum encapsulated bases that heat quickly and spread heat evenly. Includes saucepans, sauté pan, stockpot, and non-stick skillet with tempered glass covers.",
    "price": 199.99,
    "originalPrice": 249.99,
    "compareAtPrice": 249.99,
    "discountPercent": 20,
    "category": "home-garden",
    "categoryName": "Home & Garden",
    "brand": "Cuisinart",
    "stock": 35,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 19400,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "kitchen",
      "cookware",
      "pots",
      "pans",
      "cooking",
      "home"
    ],
    "features": [
      "Classic stainless steel cooking surface will not discolor or alter flavors",
      "Aluminum encapsulated base heats evenly without hot spots",
      "Cool Grip riveted stick handles stay cool on the stovetop",
      "Dishwasher safe and oven safe up to 500°F"
    ],
    "specifications": {
      "Brand": "Cuisinart",
      "Pieces": "11-Piece",
      "Material": "Stainless Steel"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
        "alt": "Stainless steel cookware pots and pans",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-shark-robot-vacuum",
    "sku": "HOM-SHARK-MATRIX",
    "title": "Shark Matrix Self-Emptying Robot Vacuum & Mop with Precision Home Mapping",
    "slug": "shark-matrix-robot-vacuum-mop",
    "description": "Incredible suction power with Sonic Mopping that scrubs hard floors 100 times per minute. The bagless self-emptying base holds up to 60 days of dirt and debris.",
    "price": 399.99,
    "originalPrice": 499.99,
    "compareAtPrice": 499.99,
    "discountPercent": 20,
    "category": "home-garden",
    "categoryName": "Home & Garden",
    "brand": "Shark",
    "stock": 18,
    "status": "active",
    "rating": 4.6,
    "reviewCount": 8430,
    "isPrimeEligible": true,
    "tags": [
      "vacuum",
      "home",
      "living room",
      "cleaning",
      "robot",
      "smart home"
    ],
    "features": [
      "Precision Grid Clean takes 2 passes over dirt and pet hair",
      "Sonic Mopping scrubs hard floors 100x per minute for stubborn stains",
      "Bagless self-emptying base holds up to 60 days of dirt"
    ],
    "specifications": {
      "Brand": "Shark",
      "Type": "Robot Vacuum & Mop",
      "Battery": "120 min runtime"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
        "alt": "Living room with vacuum cleaner",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-beckham-pillows",
    "sku": "HOM-BECK-PLW-2PK",
    "title": "Beckham Hotel Collection Queen Bed Pillows Set of 2, Luxury Cooling Pillows",
    "slug": "beckham-hotel-bed-pillows-queen",
    "description": "Filled with down-alternative fibers and encased in a 250-thread count breathable cover, these luxury bed pillows provide superior comfort and support for back, side, and stomach sleepers.",
    "price": 49.99,
    "originalPrice": 69.99,
    "compareAtPrice": 69.99,
    "discountPercent": 28,
    "category": "home-garden",
    "categoryName": "Home & Garden",
    "brand": "Beckham Hotel Collection",
    "stock": 80,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 165000,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "bedding",
      "pillows",
      "bedroom",
      "home",
      "sleep"
    ],
    "features": [
      "250-Thread count cooling cotton cover",
      "OEKO-TEX Certified down-alternative plush filling",
      "Machine washable and bounce-back shape retention"
    ],
    "specifications": {
      "Brand": "Beckham Hotel Collection",
      "Size": "Queen (Set of 2)",
      "Fill": "Down Alternative"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
        "alt": "Luxury white bed pillows set",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-ceramic-vase",
    "sku": "HOM-CERAMIC-VASE",
    "title": "Modern Ceramic Ribbed Decorative Vase for Living Room & Table Decor",
    "slug": "modern-ceramic-ribbed-decorative-vase",
    "description": "Minimalist Nordic boho ribbed ceramic vase crafted with premium clay. Perfect for pampas grass, dried bouquets, modern dining tables, and entryway living room decor.",
    "price": 24.99,
    "originalPrice": 34.99,
    "compareAtPrice": 34.99,
    "discountPercent": 28,
    "category": "home-garden",
    "categoryName": "Home & Garden",
    "brand": "Nordic Living",
    "stock": 45,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 3200,
    "isPrimeEligible": true,
    "tags": [
      "decor",
      "home",
      "living room",
      "vase",
      "ceramic",
      "boho"
    ],
    "features": [
      "Handcrafted premium stoneware ceramic with matte beige finish",
      "Textured ribbed exterior with watertight glazed interior",
      "Ideal centerpiece for coffee tables, bookshelves, and mantels"
    ],
    "specifications": {
      "Brand": "Nordic Living",
      "Color": "Off-White / Beige",
      "Height": "8.5 inches"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
        "alt": "Modern minimalist ribbed ceramic vase",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-cosrx-snail-mucin",
    "sku": "BTY-COSRX-SNAIL96",
    "title": "COSRX Advanced Snail 96 Mucin Power Essence Hydrating Facial Serum",
    "slug": "cosrx-advanced-snail-96-mucin-power-essence",
    "description": "Formulated with 96.3% Snail Secretion Filtrate, this lightweight serum repairs and rejuvenates skin from dryness and aging. Improves skin elasticity, smooths uneven texture, and delivers long-lasting moisture without heavy residue.",
    "price": 16.99,
    "originalPrice": 25,
    "compareAtPrice": 25,
    "discountPercent": 32,
    "category": "beauty",
    "categoryName": "Beauty & Personal Care",
    "brand": "COSRX",
    "stock": 120,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 98400,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "isFeatured": true,
    "tags": [
      "beauty",
      "skincare",
      "serum",
      "snail mucin",
      "hydration",
      "face"
    ],
    "features": [
      "Contains 96.3% Snail Secretion Filtrate to repair and hydrate skin",
      "Soothes damaged skin, fades dark spots, and plumps fine lines",
      "100% cruelty-free, hypoallergenic, and dermatologist tested"
    ],
    "specifications": {
      "Brand": "COSRX",
      "Volume": "100ml / 3.38 fl.oz",
      "SkinType": "All Skin Types"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
        "alt": "COSRX Snail Mucin Serum on vanity",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-dyson-hair-dryer",
    "sku": "BTY-IONIC-DRYER",
    "title": "Professional Negative Ionic Salon Hair Dryer & Fast Drying Blower with Diffuser",
    "slug": "professional-ionic-hair-dryer-diffuser",
    "description": "Engineered with a 110,000 RPM high-speed brushless motor that produces 23m/s airflow for ultra-fast drying. Emits 200 million negative ions to eliminate frizz and leave hair silky smooth and radiant.",
    "price": 89.99,
    "originalPrice": 129.99,
    "compareAtPrice": 129.99,
    "discountPercent": 30,
    "category": "beauty",
    "categoryName": "Beauty & Personal Care",
    "brand": "SilkPro",
    "stock": 45,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 14200,
    "isPrimeEligible": true,
    "tags": [
      "beauty",
      "haircare",
      "hair dryer",
      "styling",
      "salon"
    ],
    "features": [
      "110,000 RPM ultra-fast brushless motor dries hair in minutes",
      "Thermo-Control intelligent heat sensor protects hair from heat damage",
      "Includes magnetic magnetic nozzle and curl-enhancing diffuser"
    ],
    "specifications": {
      "Brand": "SilkPro",
      "Color": "Rose Gold / Matte Grey",
      "Speeds": "3 Heat, 2 Speed"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
        "alt": "Professional salon hair styling and dryer",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-maybelline-lipstick",
    "sku": "BTY-VELVET-LIP-SET",
    "title": "Matte Velvet Long-Lasting Liquid Lipstick & Gloss Set (6 Vibrant Shades)",
    "slug": "matte-velvet-liquid-lipstick-set",
    "description": "High-pigment, transfer-proof matte liquid lipstick formula enriched with Vitamin E. Provides comfortable, non-drying 16-hour wear with an ultra-smooth velvety finish.",
    "price": 19.99,
    "originalPrice": 29.99,
    "compareAtPrice": 29.99,
    "discountPercent": 33,
    "category": "beauty",
    "categoryName": "Beauty & Personal Care",
    "brand": "Glamour Luxe",
    "stock": 90,
    "status": "active",
    "rating": 4.6,
    "reviewCount": 22100,
    "isPrimeEligible": true,
    "tags": [
      "beauty",
      "makeup",
      "lipstick",
      "cosmetics",
      "lips"
    ],
    "features": [
      "6 rich, complementary nude, berry, and classic red shades",
      "Waterproof and smudge-proof formula lasts up to 16 hours",
      "Cruelty-free formula enriched with moisturizing jojoba oil"
    ],
    "specifications": {
      "Brand": "Glamour Luxe",
      "Finish": "Matte Velvet",
      "Count": "6 Liquid Lipsticks"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
        "alt": "Luxury cosmetic lipsticks and makeup kit",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-chanel-parfum",
    "sku": "BTY-PARFUM-100ML",
    "title": "Luxury Eau De Parfum Spray 100ml / 3.4 fl.oz with Bergamot & Vanilla Notes",
    "slug": "luxury-eau-de-parfum-spray-100ml",
    "description": "An alluring, long-lasting oriental floral scent. Top notes of crisp Italian bergamot harmonize with delicate white jasmine, warm sandalwood, and creamy bourbon vanilla.",
    "price": 85,
    "originalPrice": 110,
    "compareAtPrice": 110,
    "discountPercent": 22,
    "category": "beauty",
    "categoryName": "Beauty & Personal Care",
    "brand": "Maison Royale",
    "stock": 40,
    "status": "active",
    "rating": 4.9,
    "reviewCount": 9340,
    "isPrimeEligible": true,
    "tags": [
      "beauty",
      "fragrances",
      "perfume",
      "scent",
      "luxury"
    ],
    "features": [
      "Signature scent profile: Bergamot, Jasmine, Cedarwood & Warm Vanilla",
      "Eau de Parfum concentration providing 12+ hour longevity",
      "Presented in a heavy multifaceted crystal spray bottle"
    ],
    "specifications": {
      "Brand": "Maison Royale",
      "Size": "100ml / 3.4 oz",
      "Type": "Eau de Parfum"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
        "alt": "Luxury perfume bottle with golden mist",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-mario-figures",
    "sku": "TOY-MARIO-PACK",
    "title": "Super Mario Deluxe Mushroom Kingdom Collectible Action Figures Pack",
    "slug": "super-mario-deluxe-figures-pack",
    "description": "Bring the Nintendo magic home with this deluxe multi-figure set including Mario, Luigi, Princess Peach, Yoshi, and Toad. Each articulated figure stands 2.5 to 4 inches tall with authentic video game details.",
    "price": 29.99,
    "originalPrice": 39.99,
    "compareAtPrice": 39.99,
    "discountPercent": 25,
    "category": "toys",
    "categoryName": "Toys & Games",
    "brand": "Nintendo",
    "stock": 60,
    "status": "active",
    "rating": 4.9,
    "reviewCount": 18900,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "isFeatured": true,
    "tags": [
      "toys",
      "mario",
      "figures",
      "nintendo",
      "kids",
      "games",
      "action figures"
    ],
    "features": [
      "Includes 5 iconic Mushroom Kingdom characters: Mario, Luigi, Peach, Yoshi, Toad",
      "Articulated head and arms for dynamic action poses",
      "Official licensed Nintendo collectible merchandise"
    ],
    "specifications": {
      "Brand": "Nintendo",
      "Age": "3+ Years",
      "Characters": "Mario, Luigi, Peach, Yoshi, Toad"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80",
        "alt": "Super Mario figures on display",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-wooden-blocks",
    "sku": "TOY-WOOD-BLKS-100",
    "title": "Melissa & Doug 100-Piece Classic Solid Wood Building Blocks Set",
    "slug": "melissa-doug-100-piece-wooden-building-blocks",
    "description": "100 solid wood blocks in 4 colors and 9 distinct geometric shapes. An indispensable classic early-learning toy for developing spatial intelligence, fine motor skills, and creative problem solving.",
    "price": 22.99,
    "originalPrice": 27.99,
    "compareAtPrice": 27.99,
    "discountPercent": 18,
    "category": "toys",
    "categoryName": "Toys & Games",
    "brand": "Melissa & Doug",
    "stock": 75,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 34100,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "toys",
      "blocks",
      "wooden",
      "kids",
      "toddlers",
      "learning",
      "educational"
    ],
    "features": [
      "100 durable wooden blocks in red, blue, green, and yellow",
      "Rounded smooth edges with non-toxic child-safe water-based paint",
      "Helps teach shape recognition, balance, and creative engineering"
    ],
    "specifications": {
      "Brand": "Melissa & Doug",
      "Age": "2 - 8 Years",
      "Count": "100 Pieces"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
        "alt": "Wooden colorful toy blocks for toddlers",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-gund-plush-bear",
    "sku": "TOY-GUND-BEAR-12",
    "title": "GUND Philbin Classic Stuffed Animal Plush Teddy Bear, 12 inches Soft Brown",
    "slug": "gund-philbin-classic-stuffed-animal-teddy-bear",
    "description": "Features a classic design with paw pad accents and a lovable, curious expression. Incredibly huggable and soft, meeting the highest GUND quality standards for plush toys.",
    "price": 26,
    "originalPrice": 30,
    "compareAtPrice": 30,
    "discountPercent": 13,
    "category": "toys",
    "categoryName": "Toys & Games",
    "brand": "GUND",
    "stock": 50,
    "status": "active",
    "rating": 4.9,
    "reviewCount": 28400,
    "isPrimeEligible": true,
    "tags": [
      "toys",
      "plush",
      "teddy bear",
      "stuffed animal",
      "baby",
      "kids"
    ],
    "features": [
      "Ultra-soft premium plush material built to high safety standards",
      "Surface-washable construction for easy, hygienic cleaning",
      "Appropriate for ages 1 and up"
    ],
    "specifications": {
      "Brand": "GUND",
      "Height": "12 inches",
      "Color": "Chocolate Brown"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&auto=format&fit=crop&q=80",
        "alt": "Soft fluffy plush teddy bear",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-rc-monster-truck",
    "sku": "TOY-RC-TRUCK-4WD",
    "title": "1:18 High Speed Remote Control 4WD All-Terrain Monster Truck 40+ km/h",
    "slug": "high-speed-rc-all-terrain-monster-truck",
    "description": "Equipped with a powerful RC380 motor reaching 40+ km/h speeds. 4-wheel independent suspension and anti-skid heavy-duty rubber tires conquer sand, mud, grass, and rocky terrains with ease.",
    "price": 49.99,
    "originalPrice": 69.99,
    "compareAtPrice": 69.99,
    "discountPercent": 28,
    "category": "toys",
    "categoryName": "Toys & Games",
    "brand": "TurboTrail",
    "stock": 32,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 6540,
    "isPrimeEligible": true,
    "tags": [
      "toys",
      "rc car",
      "monster truck",
      "remote control",
      "boys",
      "kids"
    ],
    "features": [
      "Speeds up to 40+ km/h with 2.4GHz proportional wireless controller",
      "Includes two 7.4V rechargeable batteries for 40+ minutes of run time",
      "Waterproof electronic speed controller and shockproof metal chassis"
    ],
    "specifications": {
      "Brand": "TurboTrail",
      "Scale": "1:18 4WD",
      "TopSpeed": "40 km/h"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80",
        "alt": "RC high speed monster truck",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-bowflex-dumbbells",
    "sku": "SPT-BOWFLEX-552",
    "title": "Bowflex SelectTech 552 Adjustable Dumbbells Pair (5 to 52.5 lbs Each)",
    "slug": "bowflex-selecttech-552-adjustable-dumbbells",
    "description": "Combines 15 sets of weights into one compact system with an intuitive selection dial. Adjusts in 2.5 lb increments up to the first 25 lbs, allowing you to gradually increase your strength.",
    "price": 379,
    "originalPrice": 429,
    "compareAtPrice": 429,
    "discountPercent": 12,
    "category": "sports",
    "categoryName": "Sports & Outdoors",
    "brand": "Bowflex",
    "stock": 22,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 31200,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "isFeatured": true,
    "tags": [
      "sports",
      "fitness",
      "dumbbells",
      "equipment",
      "weights",
      "workout"
    ],
    "features": [
      "Replaces 15 pairs of traditional dumbbells using a single rapid selection dial",
      "Weight range from 5 to 52.5 lbs per dumbbell",
      "Durable molding around metal plates creates smooth lift-off and quiet workouts"
    ],
    "specifications": {
      "Brand": "Bowflex",
      "WeightRange": "5 - 52.5 lbs each",
      "Material": "Steel / Thermoplastic Rubber"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "alt": "Adjustable dumbbells on gym floor",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-fitbit-charge-6",
    "sku": "SPT-FITBIT-CHG6",
    "title": "Fitbit Charge 6 Fitness & Health Tracker with Heart Rate, GPS, and 7-Day Battery",
    "slug": "fitbit-charge-6-fitness-tracker",
    "description": "Give your routine a boost with Fitbit Charge 6, featuring Google essentials like Maps and Wallet, 40+ exercise modes, real-time heart rate on compatible gym equipment, and ECG health sensors.",
    "price": 139.95,
    "originalPrice": 159.95,
    "compareAtPrice": 159.95,
    "discountPercent": 13,
    "category": "sports",
    "categoryName": "Sports & Outdoors",
    "brand": "Fitbit",
    "stock": 55,
    "status": "active",
    "rating": 4.6,
    "reviewCount": 16400,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "sports",
      "fitness",
      "trackers",
      "smartwatch",
      "running",
      "health"
    ],
    "features": [
      "Heart rate on equipment via Bluetooth connectivity",
      "Built-in GPS for pace and distance tracking during outdoor runs",
      "Up to 7 days of battery life on a single charge"
    ],
    "specifications": {
      "Brand": "Fitbit",
      "Model": "Charge 6",
      "Battery": "7 Days",
      "WaterResistance": "50 Meters"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80",
        "alt": "Smart fitness tracker band on wrist",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-under-armour-shirt",
    "sku": "SPT-UA-TECH20-BLK",
    "title": "Under Armour Men's Tech 2.0 Short-Sleeve Quick-Dry Athletic T-Shirt",
    "slug": "under-armour-mens-tech-2-athletic-tshirt",
    "description": "UA Tech fabric is quick-drying, ultra-soft, and delivers a natural feel. Material wicks sweat & dries really fast with anti-odor technology that prevents the growth of odor-causing microbes.",
    "price": 25,
    "originalPrice": 30,
    "compareAtPrice": 30,
    "discountPercent": 17,
    "category": "sports",
    "categoryName": "Sports & Outdoors",
    "brand": "Under Armour",
    "stock": 95,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 88000,
    "isPrimeEligible": true,
    "tags": [
      "sports",
      "clothing",
      "apparel",
      "workout",
      "t-shirt",
      "athletic"
    ],
    "features": [
      "Ultra-soft UA Tech fabric dries quickly with natural feel",
      "Moisture transport system wicks sweat away from the body",
      "Streamlined modern fit with shaped hem"
    ],
    "specifications": {
      "Brand": "Under Armour",
      "Material": "100% Polyester",
      "Fit": "Loose Athletic"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "alt": "Black athletic performance shirt",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-gaiam-yoga-mat",
    "sku": "SPT-GAIAM-YOGA-6MM",
    "title": "Gaiam Premium 6mm Extra Thick Non-Slip Reversible Yoga Mat for Exercise",
    "slug": "gaiam-premium-6mm-extra-thick-yoga-mat",
    "description": "Durable and lightweight 6mm thick exercise yoga mat provides extra joint cushioning for yoga, pilates, stretching, and floor workouts. Textured sticky non-slip surface provides excellent traction and superior grip.",
    "price": 29.99,
    "originalPrice": 39.99,
    "compareAtPrice": 39.99,
    "discountPercent": 25,
    "category": "sports",
    "categoryName": "Sports & Outdoors",
    "brand": "Gaiam",
    "stock": 65,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 24500,
    "isPrimeEligible": true,
    "tags": [
      "sports",
      "equipment",
      "yoga",
      "pilates",
      "fitness",
      "exercise"
    ],
    "features": [
      "6mm thickness provides superior joint support and spine protection",
      "Textured non-slip reversible design with dual distinct patterns",
      "Free from 6P phthalates, latex, and toxic heavy metals"
    ],
    "specifications": {
      "Brand": "Gaiam",
      "Thickness": "6mm",
      "Dimensions": "68\" x 24\""
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
        "alt": "Rolled yoga mat with water bottle",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-prettygarden-dress",
    "sku": "FAS-WOM-MAXI-DRS",
    "title": "PRETTYGARDEN Women's Floral Print Summer V-Neck Bohemian Maxi Dress",
    "slug": "prettygarden-womens-floral-boho-maxi-dress",
    "description": "Flowy, breathable chiffon maxi dress designed with a flattering wrap V-neckline, tie waist belt, and vibrant floral print. Effortlessly transitions from casual summer daytime to evening dinners.",
    "price": 38.99,
    "originalPrice": 50.99,
    "compareAtPrice": 50.99,
    "discountPercent": 24,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "PRETTYGARDEN",
    "stock": 50,
    "status": "active",
    "rating": 4.5,
    "reviewCount": 31200,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "fashion",
      "women",
      "dress",
      "apparel",
      "summer",
      "floral"
    ],
    "features": [
      "Lightweight, soft, and breathable chiffon fabric with smooth lining",
      "Elastic high waist with detachable self-tie belt",
      "Flattering ruffled A-line tiered maxi skirt hem"
    ],
    "specifications": {
      "Brand": "PRETTYGARDEN",
      "Material": "100% Polyester",
      "Pattern": "Floral"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80",
        "alt": "Woman wearing summer floral dress",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-coofandy-blazer",
    "sku": "FAS-MEN-SPORT-BLZ",
    "title": "COOFANDY Men's Casual Slim Fit Lightweight Sport Coat One-Button Blazer",
    "slug": "coofandy-mens-casual-slim-fit-blazer",
    "description": "Crafted with premium stretch cotton blend fabric. Features a modern notched lapel, one-button closure, dual flap pockets, and tailored silhouette. Pairs seamlessly with denim or chinos.",
    "price": 64.99,
    "originalPrice": 85,
    "compareAtPrice": 85,
    "discountPercent": 24,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "COOFANDY",
    "stock": 40,
    "status": "active",
    "rating": 4.6,
    "reviewCount": 17800,
    "isPrimeEligible": true,
    "tags": [
      "fashion",
      "men",
      "blazer",
      "apparel",
      "suit",
      "jacket"
    ],
    "features": [
      "Breathable lightweight twill fabric with subtle stretch for comfort",
      "Notch lapel and single breasted modern one-button closure",
      "Two patch pockets, one chest pocket, and two interior pockets"
    ],
    "specifications": {
      "Brand": "COOFANDY",
      "Material": "Cotton / Poly Blend",
      "Fit": "Slim Fit"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
        "alt": "Man wearing tailored blazer and sunglasses",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-carters-girls-outfit",
    "sku": "FAS-GRL-OUTFIT-2PC",
    "title": "Simple Joys by Carter's Girls' 2-Piece Ruffle Top and Shorts Summer Outfit",
    "slug": "carters-girls-2-piece-summer-outfit",
    "description": "Adorable 2-piece set featuring a flutter sleeve top with matching elastic-waist bloomers/shorts. Made with 100% soft certified organic cotton that stays soft wash after wash.",
    "price": 18.5,
    "originalPrice": 24,
    "compareAtPrice": 24,
    "discountPercent": 23,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "Carter's",
    "stock": 60,
    "status": "active",
    "rating": 4.9,
    "reviewCount": 12500,
    "isPrimeEligible": true,
    "tags": [
      "fashion",
      "girls",
      "kids",
      "apparel",
      "outfit",
      "summer"
    ],
    "features": [
      "100% breathable gentle combed cotton for sensitive skin",
      "Ruffle flutter sleeve top with covered elastic waistband shorts",
      "Machine washable and fade resistant"
    ],
    "specifications": {
      "Brand": "Carter's",
      "Material": "100% Cotton",
      "Pieces": "2-Piece Set"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
        "alt": "Cute two piece girls outfit flatlay",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-calvin-klein-boys-set",
    "sku": "FAS-BOY-DENIM-SET",
    "title": "Calvin Klein Boys' 2-Piece Denim Jacket and Stretch Jeans Casual Set",
    "slug": "calvin-klein-boys-denim-jacket-jeans-set",
    "description": "Timeless Calvin Klein cool. Includes a classic button-front blue denim trucker jacket paired with matching durable stretch denim pants engineered for active kids on the go.",
    "price": 39.99,
    "originalPrice": 55,
    "compareAtPrice": 55,
    "discountPercent": 27,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "Calvin Klein",
    "stock": 45,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 9400,
    "isPrimeEligible": true,
    "tags": [
      "fashion",
      "boys",
      "kids",
      "apparel",
      "denim",
      "jeans",
      "jacket"
    ],
    "features": [
      "Comfort-stretch denim allows unhindered active playtime",
      "Dual chest flap pockets on classic trucker jacket",
      "Adjustable inner elastic waistband on denim trousers"
    ],
    "specifications": {
      "Brand": "Calvin Klein",
      "Material": "98% Cotton, 2% Spandex",
      "Pieces": "2-Piece Set"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&auto=format&fit=crop&q=80",
        "alt": "Boys jacket and jeans casual wear set",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-pavoi-necklace",
    "sku": "FAS-PAVOI-GOLD-CH",
    "title": "PAVOI 14K Gold Plated Paperclip Chain Choker Necklace 16 inch",
    "slug": "pavoi-14k-gold-paperclip-chain-necklace",
    "description": "Minimalist statement paperclip link necklace plated in 14K yellow gold. Hypoallergenic, nickel-free, and lead-free. Perfect for solo daily wear or layered with dainty pendants.",
    "price": 14.95,
    "originalPrice": 19.99,
    "compareAtPrice": 19.99,
    "discountPercent": 25,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "PAVOI",
    "stock": 110,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 41200,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "fashion",
      "jewelry",
      "necklace",
      "gold",
      "accessories"
    ],
    "features": [
      "14K Yellow Gold plating with protective anti-tarnish e-coating",
      "Secure lobster claw clasp with 2-inch extender chain",
      "Crafted from 100% recycled materials in gift-ready jewelry box"
    ],
    "specifications": {
      "Brand": "PAVOI",
      "Plating": "14K Gold",
      "Length": "16\" + 2\" Extender"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80",
        "alt": "14k gold chain necklace displayed on stone",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-jwpei-handbag",
    "sku": "FAS-JWPEI-GABBI-BAG",
    "title": "JW PEI Gabbi Ruched Vegan Leather Shoulder Hobo Handbag",
    "slug": "jw-pei-gabbi-ruched-shoulder-handbag",
    "description": "The iconic celebrity-loved croissant silhouette. Crafted from smooth vegan leather made from recycled plastic bottles, with magnetic snap closure and gathered ruched handle.",
    "price": 79.99,
    "originalPrice": 99,
    "compareAtPrice": 99,
    "discountPercent": 19,
    "category": "fashion",
    "categoryName": "Fashion & Apparel",
    "brand": "JW PEI",
    "stock": 35,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 8900,
    "isPrimeEligible": true,
    "isFeatured": true,
    "tags": [
      "fashion",
      "handbag",
      "bag",
      "purse",
      "accessories",
      "luxury"
    ],
    "features": [
      "Sustainable vegan leather made with recycled plastic materials",
      "Chic retro 90s ruched croissant shape with magnetic closure",
      "Spacious interior comfortably holds phone, wallet, keys, and cosmetics"
    ],
    "specifications": {
      "Brand": "JW PEI",
      "Color": "Ivory Beige",
      "Dimensions": "9.6\" W x 4.7\" H x 2.4\" D"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        "alt": "Luxury beige shoulder handbag",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-ipad-10th-gen",
    "sku": "ELE-IPAD-10GEN-64",
    "title": "Apple iPad (10th Generation) 10.9-inch Liquid Retina Display, 64GB, Wi-Fi 6",
    "slug": "apple-ipad-10th-generation-64gb",
    "description": "Colorfully reimagined and more versatile than ever. Featuring an all-screen 10.9-inch Liquid Retina display, the powerful A14 Bionic chip, landscape 12MP Ultra Wide front camera, and fast USB-C connectivity.",
    "price": 349,
    "originalPrice": 399,
    "compareAtPrice": 399,
    "discountPercent": 13,
    "category": "electronics",
    "categoryName": "Electronics",
    "brand": "Apple",
    "stock": 45,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 54100,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "isFeatured": true,
    "tags": [
      "electronics",
      "tablets",
      "ipad",
      "apple",
      "tablet",
      "screen"
    ],
    "features": [
      "Striking 10.9-inch Liquid Retina display with True Tone",
      "A14 Bionic chip with 6-core CPU and 4-core GPU",
      "12MP Wide back camera and Landscape 12MP Ultra Wide front camera with Center Stage",
      "Touch ID built into top button for secure authentication"
    ],
    "specifications": {
      "Brand": "Apple",
      "Storage": "64GB",
      "Screen": "10.9-inch Liquid Retina",
      "Chip": "A14 Bionic"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
        "alt": "Apple iPad on desk with stylus pen",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-ps5-controller",
    "sku": "ELE-PS5-DUALSENSE",
    "title": "PlayStation DualSense Wireless Controller for PS5, Haptic Feedback & Adaptive Triggers",
    "slug": "playstation-dualsense-wireless-controller",
    "description": "Discover a deeper, highly immersive gaming experience that brings the action to life in the palms of your hands. Features dynamic haptic feedback, adaptive triggers, and a built-in microphone, all integrated into an iconic comfortable design.",
    "price": 69.99,
    "originalPrice": 74.99,
    "compareAtPrice": 74.99,
    "discountPercent": 7,
    "category": "electronics",
    "categoryName": "Electronics",
    "brand": "Sony",
    "stock": 65,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 92400,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "electronics",
      "gaming",
      "ps5",
      "controller",
      "playstation",
      "video games"
    ],
    "features": [
      "Haptic feedback replaces traditional rumble motors for realistic in-game touch sensations",
      "Dynamic adaptive triggers simulate varying levels of tension when drawing bows or braking",
      "Built-in microphone and 3.5mm headset jack with dedicated mute button"
    ],
    "specifications": {
      "Brand": "Sony PlayStation",
      "Connectivity": "Bluetooth / USB-C",
      "Platform": "PS5, PC, Mobile"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
        "alt": "PS5 DualSense Wireless Controller",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-jbl-flip-6",
    "sku": "ELE-JBL-FLIP6-BLK",
    "title": "JBL Flip 6 Portable Waterproof Bluetooth Speaker with Two-Way Speaker System",
    "slug": "jbl-flip-6-portable-waterproof-speaker",
    "description": "Louder, more powerful audio. The 2-way speaker system delivers bold clarity with deep bass via dual pumping passive radiators. IP67 waterproof and dustproof with up to 12 hours of playtime on a single charge.",
    "price": 99.95,
    "originalPrice": 129.95,
    "compareAtPrice": 129.95,
    "discountPercent": 23,
    "category": "electronics",
    "categoryName": "Electronics",
    "brand": "JBL",
    "stock": 50,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 42100,
    "isPrimeEligible": true,
    "tags": [
      "electronics",
      "speakers",
      "bluetooth",
      "audio",
      "waterproof",
      "portable"
    ],
    "features": [
      "Engineered 2-way speaker system with racetrack-shaped woofer and separate tweeter",
      "IP67 waterproof and dustproof design built for beach, pool, and outdoor trails",
      "Up to 12 hours of playtime with USB-C fast charging protection"
    ],
    "specifications": {
      "Brand": "JBL",
      "Battery": "12 Hours",
      "WaterResistance": "IP67 Waterproof"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
        "alt": "JBL Flip 6 portable speaker",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-dell-optiplex-desktop",
    "sku": "CMP-DELL-OPTI-PC",
    "title": "Dell OptiPlex Desktop Tower PC (Intel Core i7, 32GB RAM, 1TB NVMe SSD, Win 11 Pro)",
    "slug": "dell-optiplex-desktop-tower-pc-i7-32gb",
    "description": "Engineered for intensive business multitasking, productivity, and content creation. Equipped with a blazing fast Intel Core i7 processor, 32GB high-speed DDR4 RAM, and 1TB lightning-fast NVMe Solid State Drive.",
    "price": 649,
    "originalPrice": 799,
    "compareAtPrice": 799,
    "discountPercent": 19,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "Dell",
    "stock": 20,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 7800,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "computers",
      "desktops",
      "desktop",
      "pc",
      "tower",
      "dell",
      "workstation"
    ],
    "features": [
      "Intel Core i7 high performance processor up to 4.6 GHz",
      "32GB DDR4 RAM guarantees stutter-free multitasking with dozens of apps",
      "1TB ultra-fast PCIe NVMe SSD boots Windows 11 Pro in seconds",
      "Dual DisplayPort, HDMI, Wi-Fi 6, and Gigabit Ethernet support"
    ],
    "specifications": {
      "Brand": "Dell",
      "Processor": "Intel Core i7",
      "RAM": "32GB DDR4",
      "Storage": "1TB NVMe SSD"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80",
        "alt": "Dell Desktop PC Tower on desk",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 2,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Friday, Oct 16"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-asus-zenbook-laptop",
    "sku": "CMP-ASUS-ZEN-14",
    "title": "ASUS ZenBook 14 Ultra-Thin OLED Laptop, Intel Core Ultra 7, 16GB RAM, 1TB SSD",
    "slug": "asus-zenbook-14-ultra-thin-oled-laptop",
    "description": "Elevate your mobile productivity with the ultraportable ZenBook 14 OLED. Measuring just 14.9 mm thin and 2.6 lbs, it packs a gorgeous 3K 120Hz ASUS Lumina OLED display with all-day battery life.",
    "price": 999.99,
    "originalPrice": 1199.99,
    "compareAtPrice": 1199.99,
    "discountPercent": 17,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "ASUS",
    "stock": 15,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 5200,
    "isPrimeEligible": true,
    "isFeatured": true,
    "tags": [
      "computers",
      "laptops",
      "laptop",
      "asus",
      "oled",
      "notebook"
    ],
    "features": [
      "14-inch 3K (2880 x 1800) 120Hz 16:10 OLED display with 100% DCI-P3 color gamut",
      "Intel Core Ultra 7 processor with dedicated Intel AI Boost NPU",
      "Up to 15 hours of battery life with fast-charging technology"
    ],
    "specifications": {
      "Brand": "ASUS",
      "Display": "14\" 3K OLED 120Hz",
      "CPU": "Intel Core Ultra 7",
      "Weight": "2.6 lbs"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
        "alt": "Sleek silver laptop on desk",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-seagate-2tb-hdd",
    "sku": "CMP-SEAGATE-2TB",
    "title": "Seagate Portable 2TB External Hard Drive HDD, USB 3.0 for PC, Mac, PlayStation, Xbox",
    "slug": "seagate-portable-2tb-external-hard-drive",
    "description": "Easily store and access 2TB of photos, movies, music, and document archives on the go. Plug-and-play simplicity with drag-and-drop file saving right out of the box via included 18-inch USB 3.0 cable.",
    "price": 64.99,
    "originalPrice": 79.99,
    "compareAtPrice": 79.99,
    "discountPercent": 19,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "Seagate",
    "stock": 85,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 215000,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "computers",
      "hard drives",
      "storage",
      "hard drive",
      "hdd",
      "backup",
      "pc accessories"
    ],
    "features": [
      "Generous 2TB capacity holds hundreds of thousands of photos and files",
      "USB 3.0 plug-and-play simplicity without requiring external power",
      "Works seamlessly with Windows, Mac, and gaming consoles"
    ],
    "specifications": {
      "Brand": "Seagate",
      "Capacity": "2TB",
      "Interface": "USB 3.0",
      "FormFactor": "2.5 inch"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
        "alt": "Seagate external hard drive black",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-nulaxy-laptop-stand",
    "sku": "CMP-NULAXY-STAND",
    "title": "Nulaxy Ergonomic Aluminum Laptop Stand, Foldable Multi-Angle Cooling Riser",
    "slug": "nulaxy-ergonomic-aluminum-laptop-stand",
    "description": "Crafted from premium aluminum alloy that supports laptops up to 17.3 inches. Elevates your laptop screen to eye level to alleviate neck and shoulder tension while open ventilation prevents overheating.",
    "price": 26.99,
    "originalPrice": 35.99,
    "compareAtPrice": 35.99,
    "discountPercent": 25,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "Nulaxy",
    "stock": 70,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 68000,
    "isPrimeEligible": true,
    "isBestSeller": true,
    "tags": [
      "computers",
      "pc accessories",
      "laptop stand",
      "ergonomic",
      "accessories",
      "desk"
    ],
    "features": [
      "Universal compatibility fits all laptops from 10 to 17.3 inches",
      "Solid aluminum construction supports up to 22 lbs (10kg)",
      "Silicone anti-skid pads protect laptop from scratches and slipping"
    ],
    "specifications": {
      "Brand": "Nulaxy",
      "Material": "Aluminum Alloy",
      "Compatibility": "10 - 17.3\" Laptops"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
        "alt": "Ergonomic laptop stand on desk",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-samsung-odyssey-g5",
    "sku": "CMP-SMSG-ODY-G5",
    "title": "Samsung Odyssey G5 27\" Curved QHD (2560x1440) 165Hz 1ms Gaming Monitor",
    "slug": "samsung-odyssey-g5-27-curved-gaming-monitor",
    "description": "Immerse yourself in hyper-realistic gaming with the 1000R curved display that matches the human field of view. QHD resolution delivers 1.7 times the pixel density of Full HD, alongside a 165Hz refresh rate and AMD FreeSync Premium.",
    "price": 249.99,
    "originalPrice": 319.99,
    "compareAtPrice": 319.99,
    "discountPercent": 22,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "Samsung",
    "stock": 25,
    "status": "active",
    "rating": 4.6,
    "reviewCount": 14500,
    "isPrimeEligible": true,
    "isFeatured": true,
    "tags": [
      "computers",
      "monitors",
      "gaming",
      "monitor",
      "samsung",
      "curved display"
    ],
    "features": [
      "27-inch 1000R curvature wraps around your vision for total immersion",
      "QHD resolution with HDR10 for crystal-clear visuals and deep blacks",
      "165Hz refresh rate and 1ms response time eliminate lag and motion blur"
    ],
    "specifications": {
      "Brand": "Samsung",
      "Resolution": "2560 x 1440 QHD",
      "RefreshRate": "165Hz",
      "Curvature": "1000R"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
        "alt": "Curved gaming monitor setup with illumination",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 10:00 AM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-steelseries-keyboard",
    "sku": "CMP-STEEL-APEX-PRO",
    "title": "SteelSeries Apex Pro TKL Mechanical Gaming Keyboard, OmniPoint Adjustable Switches",
    "slug": "steelseries-apex-pro-mechanical-keyboard",
    "description": "The world’s fastest mechanical gaming keyboard. Features OmniPoint 2.0 adjustable hypermagnetic switches with 20x faster actuation and 11x faster response times, with an integrated smart OLED display.",
    "price": 189.99,
    "originalPrice": 219.99,
    "compareAtPrice": 219.99,
    "discountPercent": 14,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "SteelSeries",
    "stock": 30,
    "status": "active",
    "rating": 4.8,
    "reviewCount": 9200,
    "isPrimeEligible": true,
    "tags": [
      "computers",
      "keyboards",
      "keyboard",
      "mechanical keyboard",
      "gaming",
      "pc accessories"
    ],
    "features": [
      "OmniPoint 2.0 switches allow actuation depth customization from 0.2mm to 3.8mm",
      "OLED Smart Display delivers info straight from games and apps",
      "Aircraft-grade Series 5000 aluminum top plate for lifetime durability"
    ],
    "specifications": {
      "Brand": "SteelSeries",
      "SwitchType": "OmniPoint 2.0 Magnetic",
      "FormFactor": "Tenkeyless (TKL)"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
        "alt": "RGB mechanical gaming keyboard",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 8:00 PM",
      "standardDeliveryDate": "Thursday, Oct 15"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  },
  {
    "id": "prod-razer-deathadder-v3",
    "sku": "CMP-RAZER-DA-V3",
    "title": "Razer DeathAdder V3 Ultra-Lightweight Ergonomic Gaming Mouse 30,000 DPI",
    "slug": "razer-deathadder-v3-gaming-mouse",
    "description": "Refined in collaboration with top esports pros, the iconic ergonomic shape is now 25% lighter at just 59g. Powered by the Razer Focus Pro 30K Optical Sensor and Gen-3 Optical Switches with zero double-clicking.",
    "price": 69.99,
    "originalPrice": 79.99,
    "compareAtPrice": 79.99,
    "discountPercent": 13,
    "category": "computers",
    "categoryName": "Computers & Accessories",
    "brand": "Razer",
    "stock": 55,
    "status": "active",
    "rating": 4.7,
    "reviewCount": 16800,
    "isPrimeEligible": true,
    "tags": [
      "computers",
      "gaming mouse",
      "mouse",
      "pc accessories",
      "razer",
      "gaming"
    ],
    "features": [
      "59g ultra-lightweight ergonomic design optimized for competitive gaming",
      "Focus Pro 30K Optical Sensor delivers flawless tracking on any surface including glass",
      "Optical Mouse Switches Gen-3 rated for 90 million clicks with 0.2ms actuation"
    ],
    "specifications": {
      "Brand": "Razer",
      "DPI": "30,000 DPI",
      "Weight": "59 grams"
    },
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
        "alt": "Ultra lightweight gaming mouse",
        "isPrimary": true
      }
    ],
    "deliveryInfo": {
      "isFreeDelivery": true,
      "estimatedDays": 1,
      "fastestDeliveryDate": "Tomorrow, by 12:00 PM",
      "standardDeliveryDate": "Wednesday, Oct 14"
    },
    "seller": {
      "id": "seller-amazon",
      "name": "Amazon.com",
      "rating": 4.9
    },
    "createdAt": "2026-09-22T06:41:01.795Z",
    "updatedAt": "2026-09-22T06:41:01.795Z"
  }
];
