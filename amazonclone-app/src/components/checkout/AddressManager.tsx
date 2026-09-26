'use client';
// ============================================================================
// AddressManager — Valenza Maison Destination Residence Manager
// Allows selecting, adding, editing, and deleting customer delivery addresses
// ============================================================================
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, MapPin, AlertCircle, Gem, Check } from 'lucide-react';
import type { Address } from '@/types';
import { validateAddress } from '@/services/addressService';

interface AddressManagerProps {
  addresses: Address[];
  selectedAddressId?: string;
  onSelectAddress: (address: Address) => void;
  onAddAddress: (data: Omit<Address, 'id'>) => Promise<boolean>;
  onUpdateAddress: (address: Address) => Promise<boolean>;
  onDeleteAddress: (addressId: string) => Promise<boolean>;
  className?: string;
}

export function AddressManager({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  className = '',
}: AddressManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(addresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName('');
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setPhone('');
    setIsDefault(false);
    setErrors({});
    setIsAddingNew(false);
    setEditingAddressId(null);
  };

  const handleStartEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsAddingNew(false);
    setFullName(addr.fullName);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsDefault(Boolean(addr.isDefault));
    setErrors({});
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const addressData: Omit<Address, 'id'> = {
      fullName: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
      isDefault,
    };

    const validation = validateAddress(addressData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAddressId) {
        const success = await onUpdateAddress({
          ...addressData,
          id: editingAddressId,
        });
        if (success) resetForm();
      } else {
        const success = await onAddAddress(addressData);
        if (success) resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── List of Saved Addresses ── */}
      {addresses.length > 0 && !isAddingNew && !editingAddressId && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;

              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[#c5a059] bg-[#fcfaf6] dark:bg-[#1a2130] ring-2 ring-[#c5a059]/30 shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
                      : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="selected_address"
                          checked={isSelected}
                          onChange={() => onSelectAddress(addr)}
                          className="h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
                        />
                        <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                          {addr.fullName}
                        </span>
                      </div>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f4ece0] dark:bg-[#2a261c] px-2.5 py-0.5 text-[10px] font-semibold text-[#9b8353] dark:text-[#d6be90] uppercase tracking-wider border border-[#e5d6be] dark:border-[#3e3422]">
                          <Gem size={10} className="text-[#c5a059]" />
                          Primary Residence
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#6e6353] dark:text-[#9e978b] pl-6.5 space-y-0.5 leading-relaxed font-sans">
                      <p className="font-medium text-[#141312] dark:text-[#e8e4dc]">{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p>{addr.country}</p>
                      <p className="text-[#9b8353] dark:text-[#c5a059] text-[11px] mt-1.5 font-mono">
                        Tel: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-[#f0eae0] dark:border-[#242b3d] pl-6.5 flex items-center justify-between text-xs">
                    {isSelected ? (
                      <span className="font-sans text-[11px] font-semibold text-[#9b8353] dark:text-[#d6be90] flex items-center gap-1">
                        <Check size={12} className="text-[#c5a059]" />
                        Selected for Dispatch
                      </span>
                    ) : (
                      <span className="text-[#9e978b] text-[11px]">
                        Click to select
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(addr);
                        }}
                        className="text-[#9b8353] dark:text-[#d6be90] hover:underline flex items-center gap-1 cursor-pointer text-xs transition-colors"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove destination residence for ${addr.fullName}?`)) {
                            onDeleteAddress(addr.id);
                          }
                        }}
                        className="text-[#a49987] hover:text-red-500 flex items-center gap-1 cursor-pointer text-xs transition-colors"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddingNew(true);
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9b8353] dark:text-[#d6be90] hover:text-[#c5a059] pt-2 cursor-pointer transition-colors"
          >
            <div className="w-5 h-5 rounded-full border border-[#c5a059]/40 flex items-center justify-center bg-[#faf6ee] dark:bg-[#1f2738]">
              <Plus size={12} className="text-[#c5a059]" />
            </div>
            <span>Register a new destination residence</span>
          </button>
        </div>
      )}

      {/* ── Add / Edit Address Form ── */}
      {(isAddingNew || editingAddressId) && (
        <form
          onSubmit={handleSubmitForm}
          className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] p-6 shadow-[0_8px_30px_rgba(26,23,20,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#242b3d] pb-3.5 mb-5">
            <h3 className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee] flex items-center gap-2">
              <MapPin size={16} className="text-[#c5a059]" />
              <span>{editingAddressId ? 'Edit Destination Residence' : 'Register New Destination Residence'}</span>
            </h3>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[#8a7f6e] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Country / Region */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                Country / Sovereign Territory
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Switzerland">Switzerland</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                Client Full Name (Recipient)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sham Patil"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.fullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                Residence Address / Villa / Estate / Suite
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Estate / Suite number, Street name, Locality"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.street
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.street && (
                <p className="mt-1 text-[11px] text-red-600">{errors.street}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                City / Metropolitan Area
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, New Delhi, Pune"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, Karnataka"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.state
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-[11px] text-red-600">{errors.state}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                Postal / PIN Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 411041 or 110001"
                maxLength={10}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.postalCode
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-[11px] text-red-600">{errors.postalCode}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                Confidential Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#12151f] text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:ring-1 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[#ebe2d1] dark:border-[#2f384d] focus:ring-[#c5a059] focus:border-[#c5a059]'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Default address checkbox */}
            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-[#4a4235] dark:text-[#d0c9bd] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-[#dfd6c5] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059]"
                />
                <span>Set as primary default destination residence</span>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f0eae0] dark:border-[#242b3d] flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving Residence...'
                : editingAddressId
                ? 'Save Changes'
                : 'Confirm & Use Residence'}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-[#8a7f6e] dark:text-[#9e978b] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
