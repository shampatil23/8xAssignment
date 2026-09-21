// ============================================================================
// Application-wide constants
// ============================================================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Amazon Clone';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Navigation categories (nav bar)
export const NAV_LINKS = [
  { label: 'Wishlist', href: '/wishlist' },
  { label: "Today's Deals", href: '/deals' },
  { label: 'Prime Video', href: '/prime-video' },
  { label: 'Coupons', href: '/coupons' },
  { label: 'Customer Service', href: '/customer-service' },
  { label: 'Registry', href: '/registry' },
  { label: 'Gift Cards', href: '/gift-cards' },
  { label: 'Sell', href: '/sell' },
] as const;

// Product categories for search dropdown
export const SEARCH_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'computers', label: 'Computers' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'grocery', label: 'Grocery' },
] as const;

// Footer links
export const FOOTER_SECTIONS = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Releases', href: '/press' },
      { label: 'Amazon Science', href: '/science' },
    ],
  },
  {
    title: 'Make Money with Us',
    links: [
      { label: 'Sell on Amazon', href: '/sell' },
      { label: 'Sell under Amazon Accelerator', href: '/accelerator' },
      { label: 'Protect and Build Your Brand', href: '/brand' },
      { label: 'Advertise Your Products', href: '/advertise' },
    ],
  },
  {
    title: 'Amazon Payment Products',
    links: [
      { label: 'Amazon Business Card', href: '/business-card' },
      { label: 'Shop with Points', href: '/points' },
      { label: 'Reload Your Balance', href: '/reload' },
      { label: 'Amazon Currency Converter', href: '/currency' },
    ],
  },
  {
    title: 'Let Us Help You',
    links: [
      { label: 'Your Account', href: '/account' },
      { label: 'Your Orders', href: '/orders' },
      { label: 'Shipping Rates & Policies', href: '/shipping' },
      { label: 'Return & Replacements', href: '/returns' },
      { label: 'Manage Your Content', href: '/content' },
      { label: 'Help', href: '/help' },
    ],
  },
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// Image
export const PLACEHOLDER_PRODUCT_IMAGE = '/images/placeholder-product.png';
export const PLACEHOLDER_USER_IMAGE = '/images/placeholder-user.png';

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'amazon_clone_products';

// Delivery
export const PRIME_FREE_DELIVERY_THRESHOLD = 0; // Prime always free
export const FREE_DELIVERY_THRESHOLD = 499; // Free delivery above this price (INR)
