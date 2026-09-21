// ============================================================================
// Checkout Service — Validation, Totals Calculation, and Order Placement
// Simulates demo payments (CARD, UPI, COD) without storing sensitive credentials
// ============================================================================
import type {
  Cart,
  Address,
  PaymentMethod,
  ShippingOption,
  Order,
  OrderItem,
  ApiResponse,
  Product,
} from '@/types';
import { getAllProducts, saveOrder, saveUserCart } from '@/lib/firebase/database';

export interface CheckoutTotals {
  subtotal: number;
  itemCount: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}

export const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'ship-standard',
    title: 'Standard Delivery',
    description: 'FREE on orders over $35 or with Prime. Delivered in 4-5 business days.',
    estimatedDate: '4-5 business days',
    price: 0,
  },
  {
    id: 'ship-express',
    title: 'Two-Day Delivery',
    description: 'Fast track courier delivery within 2 business days.',
    estimatedDate: '2 business days',
    price: 4.99,
  },
  {
    id: 'ship-priority',
    title: 'One-Day / Priority Delivery',
    description: 'Guaranteed delivery tomorrow by 8:00 PM.',
    estimatedDate: 'Tomorrow by 8 PM',
    price: 9.99,
  },
];

/**
 * Calculates accurate order financial totals
 */
export function calculateCheckoutTotals(
  cart: Cart | null,
  shippingOption: ShippingOption,
  discount = 0,
): CheckoutTotals {
  if (!cart || cart.items.length === 0) {
    return {
      subtotal: 0,
      itemCount: 0,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: 0,
    };
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Free standard shipping if subtotal >= 35 or item has prime
  let effectiveShippingCost = shippingOption.price;
  if (shippingOption.id === 'ship-standard' && subtotal >= 35) {
    effectiveShippingCost = 0;
  }

  // 5% standard estimated tax
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number(
    Math.max(0, subtotal + effectiveShippingCost - discount + tax).toFixed(2),
  );

  return {
    subtotal,
    itemCount,
    shippingCost: effectiveShippingCost,
    tax,
    discount,
    total,
  };
}

/**
 * Comprehensive pre-checkout validation
 */
export async function validateOrderPlacement(
  cart: Cart | null,
  address: Address | null,
  payment: PaymentMethod | null,
): Promise<{
  isValid: boolean;
  errorMessage?: string;
}> {
  if (!cart || cart.items.length === 0) {
    return { isValid: false, errorMessage: 'Your shopping cart is empty.' };
  }

  if (!address) {
    return { isValid: false, errorMessage: 'Please select a valid delivery address.' };
  }

  if (!payment) {
    return { isValid: false, errorMessage: 'Please select a payment method.' };
  }

  // Validate live inventory
  try {
    const liveProducts = await getAllProducts();
    const productMap = new Map<string, Product>();
    liveProducts.forEach((p) => productMap.set(p.id, p));

    for (const item of cart.items) {
      const liveProduct = productMap.get(item.productId);
      if (!liveProduct || liveProduct.status === 'out_of_stock') {
        return {
          isValid: false,
          errorMessage: `"${item.product.title}" is no longer available. Please remove it from your cart.`,
        };
      }

      let availableStock = liveProduct.stock;
      if (item.variantId && liveProduct.variants) {
        const variant = liveProduct.variants.find((v) => v.id === item.variantId);
        if (variant) availableStock = variant.stock;
      }

      if (availableStock <= 0) {
        return {
          isValid: false,
          errorMessage: `"${item.product.title}" (${item.variantTitle || 'Selected option'}) is currently out of stock.`,
        };
      }

      if (item.quantity > availableStock) {
        return {
          isValid: false,
          errorMessage: `Only ${availableStock} units of "${item.product.title}" are available. Please update your cart quantity.`,
        };
      }
    }
  } catch (err) {
    console.warn('[checkoutService.validateOrderPlacement] inventory check warning:', err);
  }

  return { isValid: true };
}

/**
 * Executes demo checkout and places order in RTDB
 */
export async function placeOrder(
  userId: string,
  cart: Cart,
  shippingAddress: Address,
  shippingOption: ShippingOption,
  paymentMethod: PaymentMethod,
  discount = 0,
): Promise<ApiResponse<Order>> {
  // Pre-validate
  const validation = await validateOrderPlacement(cart, shippingAddress, paymentMethod);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errorMessage || 'Order validation failed.',
    };
  }

  const totals = calculateCheckoutTotals(cart, shippingOption, discount);

  // Map CartItems to OrderItems
  const orderItems: OrderItem[] = cart.items.map((item) => ({
    productId: item.productId,
    title: item.variantTitle
      ? `${item.product.title} (${item.variantTitle})`
      : item.product.title,
    image:
      item.product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    price: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  // Non-sensitive payment record
  const sanitizedPayment: PaymentMethod = {
    type: paymentMethod.type,
    brand: paymentMethod.brand || 'Visa',
    last4: paymentMethod.last4 || '4242',
    cardHolder: paymentMethod.cardHolder || 'Customer',
    upiId: paymentMethod.upiId,
  };

  const now = new Date();
  const orderId = `ord-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    id: orderId,
    userId,
    items: orderItems,
    shippingAddress,
    paymentMethod: sanitizedPayment,
    status: 'confirmed',
    subtotal: totals.subtotal,
    shippingCost: totals.shippingCost,
    tax: totals.tax,
    total: totals.total,
    estimatedDelivery: shippingOption.estimatedDate,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    // 1. Save order to RTDB
    await saveOrder(newOrder);

    // 2. Clear customer's active items in cart
    await saveUserCart(userId, {
      id: cart.id,
      userId,
      items: [],
      savedItems: cart.savedItems || [],
      subtotal: 0,
      itemCount: 0,
      updatedAt: now.toISOString(),
    });

    return {
      success: true,
      data: newOrder,
      message: 'Order placed successfully.',
    };
  } catch (error) {
    console.error('[checkoutService.placeOrder] error:', error);
    return {
      success: false,
      error: 'Failed to place order. Please try again.',
    };
  }
}
