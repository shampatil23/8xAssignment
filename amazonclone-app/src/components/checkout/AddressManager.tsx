'use client';
// ============================================================================
// AddressManager — Amazon-style Delivery Address Picker & Form
// Allows selecting, adding, editing, and deleting customer delivery addresses
// ============================================================================
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;

              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  className={`relative flex flex-col justify-between rounded-lg border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amazon-orange bg-amber-50/30 ring-2 ring-amazon-orange shadow-xs'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="selected_address"
                          checked={isSelected}
                          onChange={() => onSelectAddress(addr)}
                          className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-900">
                          {addr.fullName}
                        </span>
                      </div>
                      {addr.isDefault && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-700 pl-6 space-y-0.5 leading-relaxed">
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p>{addr.country}</p>
                      <p className="text-gray-500 mt-1">Phone: {addr.phone}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 pl-6 flex items-center justify-between text-xs">
                    {isSelected ? (
                      <span className="font-semibold text-amazon-orange text-xs">
                        Delivering to this address
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">
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
                        className="text-amazon-link hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove address for ${addr.fullName}?`)) {
                            onDeleteAddress(addr.id);
                          }
                        }}
                        className="text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
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
            className="flex items-center gap-1.5 text-xs font-semibold text-amazon-link hover:underline pt-2 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add a new delivery address</span>
          </button>
        </div>
      )}

      {/* ── Add / Edit Address Form ── */}
      {(isAddingNew || editingAddressId) && (
        <form
          onSubmit={handleSubmitForm}
          className="rounded-lg border border-gray-300 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h3 className="text-base font-bold text-gray-900">
              {editingAddressId ? 'Edit delivery address' : 'Add a new address'}
            </h3>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Country / Region */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-800 mb-1">
                Country / Region
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-800 mb-1">
                Full name (First and Last name)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sham Patil"
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.fullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-800 mb-1">
                Street address / Flat / Building / Apartment
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Flat No, House No, Street name, Locality"
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.street
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.street && (
                <p className="mt-1 text-[11px] text-red-600">{errors.street}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, New Delhi"
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, California"
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.state
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.state && (
                <p className="mt-1 text-[11px] text-red-600">{errors.state}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Postal / ZIP code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 400001 or 90210"
                maxLength={10}
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.postalCode
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-[11px] text-red-600">{errors.postalCode}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full rounded border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amazon-orange'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Default address checkbox */}
            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                />
                <span>Make this my default address</span>
              </label>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center gap-3">
            <Button
              type="submit"
              variant="buy-now"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-bold"
            >
              {isSubmitting
                ? 'Saving...'
                : editingAddressId
                ? 'Save Changes'
                : 'Use this address'}
            </Button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-600 hover:underline"
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
