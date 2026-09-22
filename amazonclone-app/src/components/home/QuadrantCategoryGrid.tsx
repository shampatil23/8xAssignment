'use client';
// ============================================================================
// Quadrant Category Grid Component — matching home2.png
// 4-in-1 multi-item product cards with category links, headers & right chevrons
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface QuadrantSubItem {
  id: string;
  name: string;
  image: string;
  href: string;
  bgColor?: string;
}

interface QuadrantCardData {
  id: string;
  title: string;
  headerHref: string;
  items: QuadrantSubItem[];
}

const QUADRANT_SECTIONS: QuadrantCardData[] = [
  // Card 1: Plug in with our electronics
  {
    id: 'electronics',
    title: 'Plug in with our electronics',
    headerHref: '/category/electronics',
    items: [
      {
        id: 'headphones',
        name: 'Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=headphones',
        bgColor: '#f7ebe6',
      },
      {
        id: 'tablets',
        name: 'Tablets',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=tablet',
        bgColor: '#eceaf4',
      },
      {
        id: 'gaming',
        name: 'Gaming',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=gaming',
        bgColor: '#fae3ec',
      },
      {
        id: 'speakers',
        name: 'Speakers',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=speaker',
        bgColor: '#fdece2',
      },
    ],
  },
  // Card 2: Score the top PCs & Accessories
  {
    id: 'computers',
    title: 'Score the top PCs & Accessories',
    headerHref: '/category/computers',
    items: [
      {
        id: 'desktops',
        name: 'Desktops',
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=desktop',
        bgColor: '#deefec',
      },
      {
        id: 'laptops',
        name: 'Laptops',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=laptop',
        bgColor: '#e2f2ef',
      },
      {
        id: 'hard-drives',
        name: 'Hard Drives',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=hard+drive',
        bgColor: '#e3f1e9',
      },
      {
        id: 'pc-accessories',
        name: 'PC Accessories',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=pc+accessories',
        bgColor: '#ddf3e7',
      },
    ],
  },
  // Card 3: Gear up to get fit
  {
    id: 'fitness',
    title: 'Gear up to get fit',
    headerHref: '/category/sports',
    items: [
      {
        id: 'clothing',
        name: 'Clothing',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=athletic+clothing',
        bgColor: '#fcf6dd',
      },
      {
        id: 'trackers',
        name: 'Trackers',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=smartwatch',
        bgColor: '#fcf6dd',
      },
      {
        id: 'equipment',
        name: 'Equipment',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=dumbbells',
        bgColor: '#fcf6dd',
      },
      {
        id: 'deals',
        name: 'Deals',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
        href: '/deals',
        bgColor: '#fcf6dd',
      },
    ],
  },
  // Card 4: Apparel under ₹999
  {
    id: 'apparel',
    title: 'Apparel under ₹999',
    headerHref: '/category/fashion',
    items: [
      {
        id: 'women',
        name: 'Women',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=fashion&q=women',
        bgColor: '#fbe4eb',
      },
      {
        id: 'men',
        name: 'Men',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=fashion&q=men',
        bgColor: '#edeae5',
      },
      {
        id: 'girls',
        name: 'Girls',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=fashion&q=girls',
        bgColor: '#f6eee5',
      },
      {
        id: 'boys',
        name: 'Boys',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=fashion&q=boys',
        bgColor: '#dae8f5',
      },
    ],
  },
  // Card 5: Fantastic Finds for Home
  {
    id: 'home-finds',
    title: 'Fantastic Finds for Home',
    headerHref: '/category/home-garden',
    items: [
      {
        id: 'kitchen',
        name: 'Kitchen',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=home-garden&q=kitchen',
        bgColor: '#edf2f0',
      },
      {
        id: 'living-room',
        name: 'Living Room',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=home-garden&q=living+room',
        bgColor: '#efeae4',
      },
      {
        id: 'bedding',
        name: 'Bedding',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=home-garden&q=bedding',
        bgColor: '#f6f0eb',
      },
      {
        id: 'decor',
        name: 'Decor',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=home-garden&q=decor',
        bgColor: '#eef1f4',
      },
    ],
  },
  // Card 6: Shine brighter with your fashion faves
  {
    id: 'fashion-faves',
    title: 'Shine brighter with your fashion faves',
    headerHref: '/category/fashion',
    items: [
      {
        id: 'jewelry',
        name: 'Jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=jewelry',
        bgColor: '#f9eee6',
      },
      {
        id: 'handbags',
        name: 'Handbags',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=handbag',
        bgColor: '#f4ede7',
      },
      {
        id: 'footwear',
        name: 'Footwear',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=shoes',
        bgColor: '#fbe7de',
      },
      {
        id: 'sunglasses',
        name: 'Sunglasses',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=sunglasses',
        bgColor: '#e8ecf2',
      },
    ],
  },
  // Card 7: Unveil your radiance
  {
    id: 'beauty-radiance',
    title: 'Unveil your radiance',
    headerHref: '/category/beauty',
    items: [
      {
        id: 'skincare',
        name: 'Skincare',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=beauty&q=skincare',
        bgColor: '#faeae3',
      },
      {
        id: 'makeup',
        name: 'Makeup',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=beauty&q=makeup',
        bgColor: '#fde5eb',
      },
      {
        id: 'haircare',
        name: 'Haircare',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=beauty&q=haircare',
        bgColor: '#f3e8df',
      },
      {
        id: 'fragrances',
        name: 'Fragrances',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80',
        href: '/search?category=beauty&q=perfume',
        bgColor: '#ebedf5',
      },
    ],
  },
  // Card 8: Level up your PC here
  {
    id: 'pc-gaming',
    title: 'Level up your PC here',
    headerHref: '/category/computers',
    items: [
      {
        id: 'monitors',
        name: 'Monitors',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=monitor',
        bgColor: '#e3e8f2',
      },
      {
        id: 'keyboards',
        name: 'Keyboards',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=keyboard',
        bgColor: '#e7eaf0',
      },
      {
        id: 'graphics',
        name: 'Graphics Cards',
        image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=graphics+card',
        bgColor: '#f1e6f5',
      },
      {
        id: 'mice',
        name: 'Gaming Mice',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80',
        href: '/search?q=gaming+mouse',
        bgColor: '#f3e6e8',
      },
    ],
  },
];

export function QuadrantCategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {QUADRANT_SECTIONS.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          {/* Section Header */}
          <Link
            href={section.headerHref}
            className="group/header flex items-center justify-between mb-3"
          >
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover/header:text-amazon-link transition-colors">
              {section.title}
            </h2>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover/header:text-amazon-orange group-hover/header:translate-x-0.5 transition-all flex-shrink-0"
            />
          </Link>

          {/* 2x2 Sub-items Grid */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {section.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group/item flex flex-col cursor-pointer"
              >
                {/* Image Box */}
                <div
                  className="w-full h-28 sm:h-32 rounded-lg p-2 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover/item:scale-102"
                  style={{ backgroundColor: item.bgColor || '#f3f4f6' }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply group-hover/item:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Sub-item Label */}
                <span className="mt-1.5 text-xs font-semibold text-gray-800 leading-tight group-hover/item:text-amazon-link transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
