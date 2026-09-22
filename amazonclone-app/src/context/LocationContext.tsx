'use client';
// ============================================================================
// Location & Currency Context — Global Delivery Location, Currency & Product Filtering
// Manages active delivery country, currency exchange, postal codes, and modals
// ============================================================================
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Address, Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getUserAddresses } from '@/lib/firebase/database';

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  rate: number; // relative to USD base catalog prices
  locale: string;
  flag: string;
  freeShippingThreshold: number; // in local currency
  priceBrackets: Array<{ label: string; min?: number; max?: number }>;
  defaultPostal: string;
}

export const SUPPORTED_COUNTRIES: Record<string, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    rate: 83.0,
    locale: 'en-IN',
    flag: '🇮🇳',
    freeShippingThreshold: 499,
    defaultPostal: '400001',
    priceBrackets: [
      { label: 'Under ₹1,000', max: 1000 },
      { label: '₹1,000 to ₹5,000', min: 1000, max: 5000 },
      { label: '₹5,000 to ₹15,000', min: 5000, max: 15000 },
      { label: '₹15,000 to ₹30,000', min: 15000, max: 30000 },
      { label: '₹30,000 & Above', min: 30000 },
    ],
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    rate: 1.0,
    locale: 'en-US',
    flag: '🇺🇸',
    freeShippingThreshold: 35,
    defaultPostal: '10001',
    priceBrackets: [
      { label: 'Under $25', max: 25 },
      { label: '$25 to $50', min: 25, max: 50 },
      { label: '$50 to $100', min: 50, max: 100 },
      { label: '$100 to $300', min: 100, max: 300 },
      { label: '$300 & Above', min: 300 },
    ],
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    rate: 0.79,
    locale: 'en-GB',
    flag: '🇬🇧',
    freeShippingThreshold: 25,
    defaultPostal: 'SW1A 1AA',
    priceBrackets: [
      { label: 'Under £20', max: 20 },
      { label: '£20 to £50', min: 20, max: 50 },
      { label: '£50 to £100', min: 50, max: 100 },
      { label: '£100 to £250', min: 100, max: 250 },
      { label: '£250 & Above', min: 250 },
    ],
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    rate: 1.36,
    locale: 'en-CA',
    flag: '🇨🇦',
    freeShippingThreshold: 35,
    defaultPostal: 'M5V 2T6',
    priceBrackets: [
      { label: 'Under C$35', max: 35 },
      { label: 'C$35 to C$75', min: 35, max: 75 },
      { label: 'C$75 to C$150', min: 75, max: 150 },
      { label: 'C$150 to C$400', min: 150, max: 400 },
      { label: 'C$400 & Above', min: 400 },
    ],
  },
  DE: {
    code: 'DE',
    name: 'Germany / Europe',
    currency: 'EUR',
    symbol: '€',
    rate: 0.92,
    locale: 'de-DE',
    flag: '🇩🇪',
    freeShippingThreshold: 29,
    defaultPostal: '10115',
    priceBrackets: [
      { label: 'Unter 25 €', max: 25 },
      { label: '25 € bis 50 €', min: 25, max: 50 },
      { label: '50 € bis 100 €', min: 50, max: 100 },
      { label: '100 € bis 250 €', min: 100, max: 250 },
      { label: '250 € & mehr', min: 250 },
    ],
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    rate: 1.52,
    locale: 'en-AU',
    flag: '🇦🇺',
    freeShippingThreshold: 49,
    defaultPostal: '2000',
    priceBrackets: [
      { label: 'Under A$35', max: 35 },
      { label: 'A$35 to A$80', min: 35, max: 80 },
      { label: 'A$80 to A$160', min: 80, max: 160 },
      { label: 'A$160 to A$450', min: 160, max: 450 },
      { label: 'A$450 & Above', min: 450 },
    ],
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    symbol: 'AED ',
    rate: 3.67,
    locale: 'ar-AE',
    flag: '🇦🇪',
    freeShippingThreshold: 100,
    defaultPostal: '00000',
    priceBrackets: [
      { label: 'Under AED 100', max: 100 },
      { label: 'AED 100 to AED 200', min: 100, max: 200 },
      { label: 'AED 200 to AED 500', min: 200, max: 500 },
      { label: 'AED 500 to AED 1,000', min: 500, max: 1000 },
      { label: 'AED 1,000 & Above', min: 1000 },
    ],
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    rate: 155.0,
    locale: 'ja-JP',
    flag: '🇯🇵',
    freeShippingThreshold: 2000,
    defaultPostal: '100-0001',
    priceBrackets: [
      { label: '¥2,000以下', max: 2000 },
      { label: '¥2,000 - ¥5,000', min: 2000, max: 5000 },
      { label: '¥5,000 - ¥10,000', min: 5000, max: 10000 },
      { label: '¥10,000 - ¥30,000', min: 10000, max: 30000 },
      { label: '¥30,000以上', min: 30000 },
    ],
  },
};

interface LocationContextValue {
  country: CountryConfig;
  setCountryCode: (code: string) => void;
  postalCode: string;
  setPostalCode: (code: string) => void;
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  userAddresses: Address[];
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  convertPrice: (baseUsdPrice: number) => number;
  formatPrice: (baseUsdPrice: number, options?: { showCode?: boolean }) => string;
  getDeliveryText: (product?: Product) => string;
  isAvailableInLocation: (product: Product) => boolean;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY_COUNTRY = 'amazon_clone_delivery_country';
const STORAGE_KEY_POSTAL = 'amazon_clone_delivery_postal';

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Default to India (as requested and shown in header "Deliver to India")
  const [countryCode, setCountryCodeState] = useState<string>('IN');
  const [postalCode, setPostalCode] = useState<string>('400001');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Initialize from localStorage or user address
  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      const savedPostal = localStorage.getItem(STORAGE_KEY_POSTAL);

      if (savedCountry && SUPPORTED_COUNTRIES[savedCountry]) {
        setCountryCodeState(savedCountry);
      } else {
        // Default to India
        setCountryCodeState('IN');
      }

      if (savedPostal) {
        setPostalCode(savedPostal);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch user addresses if logged in
  useEffect(() => {
    if (user?.uid) {
      getUserAddresses(user.uid)
        .then((addrs) => {
          setUserAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
            if (defaultAddr.country) {
              const matchedCountry = Object.values(SUPPORTED_COUNTRIES).find(
                (c) =>
                  c.code.toLowerCase() === defaultAddr.country.toLowerCase() ||
                  c.name.toLowerCase() === defaultAddr.country.toLowerCase()
              );
              if (matchedCountry) {
                setCountryCodeState(matchedCountry.code);
              }
            }
            if (defaultAddr.postalCode) {
              setPostalCode(defaultAddr.postalCode);
            }
          }
        })
        .catch(() => {});
    } else {
      setUserAddresses([]);
      setSelectedAddress(null);
    }
  }, [user]);

  const setCountryCode = useCallback((code: string) => {
    if (SUPPORTED_COUNTRIES[code]) {
      setCountryCodeState(code);
      setPostalCode(SUPPORTED_COUNTRIES[code].defaultPostal);
      try {
        localStorage.setItem(STORAGE_KEY_COUNTRY, code);
        localStorage.setItem(STORAGE_KEY_POSTAL, SUPPORTED_COUNTRIES[code].defaultPostal);
      } catch {}
    }
  }, []);

  const country = useMemo(
    () => SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.IN,
    [countryCode]
  );

  const openLocationModal = useCallback(() => setIsLocationModalOpen(true), []);
  const closeLocationModal = useCallback(() => setIsLocationModalOpen(false), []);

  // Convert base USD price to active country's currency
  const convertPrice = useCallback(
    (baseUsdPrice: number): number => {
      if (typeof baseUsdPrice !== 'number' || isNaN(baseUsdPrice)) return 0;
      const converted = baseUsdPrice * country.rate;
      // For currencies like INR or JPY, round to integer; for USD/EUR/GBP, round to 2 decimals
      if (country.currency === 'INR' || country.currency === 'JPY') {
        return Math.round(converted);
      }
      return Math.round(converted * 100) / 100;
    },
    [country]
  );

  // Format base USD price into local currency string with correct symbol & grouping
  const formatPrice = useCallback(
    (baseUsdPrice: number, options?: { showCode?: boolean }): string => {
      const converted = convertPrice(baseUsdPrice);
      try {
        const formatted = new Intl.NumberFormat(country.locale, {
          style: 'currency',
          currency: country.currency,
          minimumFractionDigits: country.currency === 'INR' || country.currency === 'JPY' ? 0 : 2,
          maximumFractionDigits: country.currency === 'INR' || country.currency === 'JPY' ? 0 : 2,
        }).format(converted);

        if (options?.showCode) {
          return `${formatted} (${country.currency})`;
        }
        return formatted;
      } catch {
        return `${country.symbol}${converted.toLocaleString()}`;
      }
    },
    [country, convertPrice]
  );

  // Location-based delivery promise
  const getDeliveryText = useCallback(
    (product?: Product): string => {
      if (!product) return `Deliver to ${country.name}`;
      if (product.deliveryInfo?.isFreeDelivery || product.isPrimeEligible) {
        return `FREE delivery to ${country.name}`;
      }
      return `Delivery to ${country.name}`;
    },
    [country]
  );

  // Check product availability for location
  const isAvailableInLocation = useCallback(
    (product: Product): boolean => {
      // Products with active status deliver to all supported locations
      if (product.status === 'out_of_stock') return false;
      return true;
    },
    []
  );

  const value = useMemo<LocationContextValue>(
    () => ({
      country,
      setCountryCode,
      postalCode,
      setPostalCode,
      selectedAddress,
      setSelectedAddress,
      userAddresses,
      isLocationModalOpen,
      openLocationModal,
      closeLocationModal,
      convertPrice,
      formatPrice,
      getDeliveryText,
      isAvailableInLocation,
    }),
    [
      country,
      setCountryCode,
      postalCode,
      selectedAddress,
      userAddresses,
      isLocationModalOpen,
      openLocationModal,
      closeLocationModal,
      convertPrice,
      formatPrice,
      getDeliveryText,
      isAvailableInLocation,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
