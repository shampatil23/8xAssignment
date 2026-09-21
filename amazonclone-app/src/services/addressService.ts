// ============================================================================
// Address Service — Customer Delivery Address Management
// Handles validation, defaults, and Firebase RTDB persistence under users/${uid}/addresses
// ============================================================================
import type { Address, ApiResponse } from '@/types';
import {
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  setDefaultAddress,
} from '@/lib/firebase/database';

export function validateAddress(data: Partial<Address>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).';
  }

  if (!data.street || data.street.trim().length < 5) {
    errors.street = 'Street address / flat / building is required.';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'City is required.';
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.state = 'State / Province is required.';
  }

  if (!data.postalCode || data.postalCode.trim().length < 3) {
    errors.postalCode = 'Postal / ZIP code is required.';
  }

  if (!data.phone || !/^\+?[0-9\s\-()]{7,15}$/.test(data.phone.trim())) {
    errors.phone = 'Valid phone number is required for delivery coordination.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  try {
    const addresses = await getUserAddresses(userId);
    return addresses;
  } catch (error) {
    console.error('[addressService.fetchAddresses] error:', error);
    return [];
  }
}

export async function addAddress(
  userId: string,
  data: Omit<Address, 'id'>,
): Promise<ApiResponse<Address>> {
  const validation = validateAddress(data);
  if (!validation.isValid) {
    return {
      success: false,
      error: Object.values(validation.errors)[0] || 'Invalid address details.',
    };
  }

  try {
    const existing = await getUserAddresses(userId);
    // If it's the user's first address, mark as default automatically
    const isFirst = existing.length === 0;

    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isDefault: isFirst ? true : Boolean(data.isDefault),
    };

    await saveUserAddress(userId, newAddress);

    return {
      success: true,
      data: newAddress,
      message: 'Address saved successfully.',
    };
  } catch (error) {
    console.error('[addressService.addAddress] error:', error);
    return {
      success: false,
      error: 'Failed to save delivery address.',
    };
  }
}

export async function updateAddress(
  userId: string,
  address: Address,
): Promise<ApiResponse<Address>> {
  const validation = validateAddress(address);
  if (!validation.isValid) {
    return {
      success: false,
      error: Object.values(validation.errors)[0] || 'Invalid address details.',
    };
  }

  try {
    await saveUserAddress(userId, address);
    return {
      success: true,
      data: address,
      message: 'Address updated successfully.',
    };
  } catch (error) {
    console.error('[addressService.updateAddress] error:', error);
    return {
      success: false,
      error: 'Failed to update delivery address.',
    };
  }
}

export async function removeAddress(
  userId: string,
  addressId: string,
): Promise<ApiResponse<void>> {
  try {
    await deleteUserAddress(userId, addressId);
    return {
      success: true,
      message: 'Address removed successfully.',
    };
  } catch (error) {
    console.error('[addressService.removeAddress] error:', error);
    return {
      success: false,
      error: 'Failed to delete address.',
    };
  }
}

export async function setAsDefaultAddress(
  userId: string,
  addressId: string,
): Promise<ApiResponse<void>> {
  try {
    await setDefaultAddress(userId, addressId);
    return {
      success: true,
      message: 'Default delivery address updated.',
    };
  } catch (error) {
    console.error('[addressService.setAsDefaultAddress] error:', error);
    return {
      success: false,
      error: 'Failed to set default address.',
    };
  }
}
