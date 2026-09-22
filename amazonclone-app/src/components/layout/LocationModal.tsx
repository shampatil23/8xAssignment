'use client';
// ============================================================================
// LocationModal — Amazon "Choose your location" popover modal
// Allows selecting delivery country, postal/PIN code, or user's saved addresses
// ============================================================================
import React, { useState } from 'react';
import { X, MapPin, Check, Globe } from 'lucide-react';
import { useLocation, SUPPORTED_COUNTRIES } from '@/context/LocationContext';
import type { Address } from '@/types';

export function LocationModal() {
  const {
    country,
    setCountryCode,
    postalCode,
    setPostalCode,
    selectedAddress,
    setSelectedAddress,
    userAddresses,
    isLocationModalOpen,
    closeLocationModal,
  } = useLocation();

  const [inputPostal, setInputPostal] = useState(postalCode);
  const [selectedCountryCode, setSelectedCountryCode] = useState(country.code);
  const [tempAddressId, setTempAddressId] = useState<string>(selectedAddress?.id || '');

  if (!isLocationModalOpen) return null;

  const handleApplyPostal = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPostal.trim()) {
      setPostalCode(inputPostal.trim());
    }
  };

  const handleSelectAddress = (addr: Address) => {
    setTempAddressId(addr.id);
    setSelectedAddress(addr);
    if (addr.postalCode) {
      setPostalCode(addr.postalCode);
      setInputPostal(addr.postalCode);
    }
    if (addr.country) {
      const match = Object.values(SUPPORTED_COUNTRIES).find(
        (c) =>
          c.code.toLowerCase() === addr.country.toLowerCase() ||
          c.name.toLowerCase() === addr.country.toLowerCase()
      );
      if (match) {
        setSelectedCountryCode(match.code);
      }
    }
  };

  const handleDone = () => {
    setCountryCode(selectedCountryCode);
    if (inputPostal.trim()) {
      setPostalCode(inputPostal.trim());
    }
    closeLocationModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-[420px] rounded-lg bg-white shadow-2xl overflow-hidden border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
          <h2 id="location-modal-title" className="text-base font-bold text-gray-900">
            Choose your location
          </h2>
          <button
            onClick={closeLocationModal}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-gray-600">
          <p className="text-xs text-gray-600">
            Delivery options and delivery speeds may vary for different locations. Prices and currencies will update automatically.
          </p>

          {/* Saved Addresses (if any) */}
          {userAddresses.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                Deliver to your saved address
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {userAddresses.map((addr) => {
                  const isChosen = tempAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded border text-left transition-all ${
                        isChosen
                          ? 'border-[#007185] bg-[#f0f8ff] ring-1 ring-[#007185]'
                          : 'border-gray-200 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <MapPin
                        size={16}
                        className={isChosen ? 'text-[#007185] mt-0.5 shrink-0' : 'text-gray-400 mt-0.5 shrink-0'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 truncate">
                            {addr.fullName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 truncate">
                          {addr.street}, {addr.city} {addr.postalCode}
                        </p>
                      </div>
                      {isChosen && <Check size={16} className="text-[#007185] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-2 text-[11px] text-gray-400 uppercase tracking-wider absolute">
              or enter a PIN / postal code
            </span>
          </div>

          {/* Postal / PIN code input */}
          <form onSubmit={handleApplyPostal} className="flex gap-2 pt-2">
            <input
              type="text"
              value={inputPostal}
              onChange={(e) => setInputPostal(e.target.value)}
              placeholder="e.g. 400001 or 10001"
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
            />
            <button
              type="submit"
              className="rounded border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-2 text-[11px] text-gray-400 uppercase tracking-wider absolute">
              or select a country / currency
            </span>
          </div>

          {/* Country Selection */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Ship outside India / change country &amp; currency:
            </label>
            <div className="relative">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange cursor-pointer"
              >
                {Object.values(SUPPORTED_COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.symbol} {c.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
              <Globe size={13} className="text-gray-400" />
              <span>
                Current exchange rate: 1 USD = {SUPPORTED_COUNTRIES[selectedCountryCode]?.symbol}{' '}
                {SUPPORTED_COUNTRIES[selectedCountryCode]?.rate} {SUPPORTED_COUNTRIES[selectedCountryCode]?.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={handleDone}
            className="rounded-md bg-amazon-orange px-6 py-1.5 text-xs font-bold text-gray-900 shadow-sm hover:bg-[#e68a00] focus:outline-none focus:ring-2 focus:ring-amazon-orange transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
