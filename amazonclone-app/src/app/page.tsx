import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Amazon Clone — Shop Online',
  description:
    'Shop millions of products at great prices. Fast delivery, easy returns.',
};

export default function HomePage() {
  return (
    <MainLayout>
      {/* ── Phase 2+ content will go here ── */}
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        {/* Hero placeholder */}
        <div className="rounded-xl bg-gradient-to-br from-amazon-dark to-amazon-dark-light text-white p-12 text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            Welcome to <span className="text-amazon-orange">Amazon</span> Clone
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            The foundation is in place. Products, cart, checkout and more coming in the next phases.
          </p>
        </div>

        {/* Category grid placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['Electronics', 'Fashion', 'Home & Kitchen', 'Books'].map((cat) => (
            <div
              key={cat}
              className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-24 rounded bg-gray-100 mb-3 flex items-center justify-center text-gray-400 text-sm">
                Image
              </div>
              <h2 className="font-bold text-sm text-gray-800">{cat}</h2>
              <p className="text-amazon-link text-xs mt-1 hover:text-amazon-link-hover hover:underline cursor-pointer">
                Shop now
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
