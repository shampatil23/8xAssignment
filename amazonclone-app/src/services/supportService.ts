// ============================================================================
// Customer Support Service — Help Center, Knowledge Base & Ticket Desk
// ============================================================================
import type {
  SupportTicket,
  SupportMessage,
  SupportTopic,
  SupportPriority,
  ApiResponse,
} from '@/types';
import {
  createSupportTicketInDB,
  getUserSupportTicketsFromDB,
  getSupportTicketByIdFromDB,
  addSupportMessageInDB,
  updateSupportTicketStatusInDB,
} from '@/lib/firebase/database';

export interface HelpTopicInfo {
  id: SupportTopic;
  title: string;
  description: string;
  iconName: string;
}

export const SUPPORT_TOPICS: HelpTopicInfo[] = [
  {
    id: 'orders',
    title: 'Your Orders',
    description: 'Track packages, edit addresses, or cancel orders',
    iconName: 'Package',
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    description: 'Return items, check refund status, and print labels',
    iconName: 'RotateCcw',
  },
  {
    id: 'payments',
    title: 'Payment Settings',
    description: 'Manage cards, UPI, billing addresses, and invoices',
    iconName: 'CreditCard',
  },
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Manage email, mobile numbers, passwords, and 2-step verification',
    iconName: 'ShieldCheck',
  },
  {
    id: 'delivery',
    title: 'Delivery & Shipping',
    description: 'Find shipping rates, delivery speeds, and tracking issues',
    iconName: 'Truck',
  },
  {
    id: 'seller',
    title: 'Selling on Amazon',
    description: 'Merchant onboarding, store verification, and listings',
    iconName: 'Store',
  },
];

export interface FaqItem {
  id: string;
  topic: SupportTopic;
  question: string;
  answer: string;
  relatedAction?: { label: string; href: string };
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    topic: 'orders',
    question: 'Where is my order and how can I track delivery?',
    answer:
      'You can check the real-time shipping status and estimated delivery date of any order in "Your Orders". Select the order and click "Track Package" for the carrier tracking timeline.',
    relatedAction: { label: 'Go to Your Orders', href: '/orders' },
  },
  {
    id: 'faq-2',
    topic: 'orders',
    question: 'Can I cancel an order after placing it?',
    answer:
      'You can cancel an order as long as it has not yet reached "Shipped" status. Head to Your Orders, select the order details, and click "Cancel Order". If it has already shipped, you can initiate a return upon arrival.',
    relatedAction: { label: 'View Orders', href: '/orders' },
  },
  {
    id: 'faq-3',
    topic: 'returns',
    question: 'What is Amazon Clone\'s return policy and window?',
    answer:
      'Most items fulfilled by Amazon Clone or certified marketplace sellers can be returned within 30 days of receipt for a full refund or replacement. Defective or incorrect items qualify for immediate prepaid return pickup.',
    relatedAction: { label: 'Start a Return', href: '/orders' },
  },
  {
    id: 'faq-4',
    topic: 'returns',
    question: 'How long does it take to receive my refund?',
    answer:
      'Refunds are processed within 2-4 business days after your returned item is received and inspected at our fulfillment center. Depending on your financial institution, funds appear on your original card or bank in 3-5 business days.',
    relatedAction: { label: 'Check Return Status', href: '/orders?tab=returns' },
  },
  {
    id: 'faq-5',
    topic: 'payments',
    question: 'What payment methods are supported on Amazon Clone?',
    answer:
      'We accept major credit/debit cards (Visa, Mastercard, RuPay, American Express), UPI (GPay, PhonePe, Paytm), Net Banking across 50+ banks, and Cash on Delivery (COD) for eligible pincodes.',
    relatedAction: { label: 'Checkout Guide', href: '/cart' },
  },
  {
    id: 'faq-6',
    topic: 'account',
    question: 'How do I change my registered email or account password?',
    answer:
      'Navigate to "Your Account" and click "Login & Security". Here you can update your name, email address, contact phone number, and change your account password securely.',
    relatedAction: { label: 'Login & Security', href: '/account/security' },
  },
  {
    id: 'faq-7',
    topic: 'delivery',
    question: 'What should I do if my package is marked delivered but not received?',
    answer:
      'Please check around your delivery location, mailbox, or with neighbors/building security. Carriers occasionally mark packages delivered up to 24 hours prior to arrival. If still not located, open a support ticket below.',
  },
  {
    id: 'faq-8',
    topic: 'seller',
    question: 'How do I become a seller on Amazon Clone?',
    answer:
      'Visit the "Sell on Amazon" portal from the top navigation or Your Account. Submit your store name, business email, and product category. Your application will be verified by an administrator within 24-48 hours.',
    relatedAction: { label: 'Open Seller Portal', href: '/sell' },
  },
];

export async function fetchUserTickets(userId: string): Promise<SupportTicket[]> {
  try {
    return await getUserSupportTicketsFromDB(userId);
  } catch (error) {
    console.error('[supportService.fetchUserTickets] error:', error);
    return [];
  }
}

export async function fetchTicketById(ticketId: string): Promise<SupportTicket | null> {
  try {
    return await getSupportTicketByIdFromDB(ticketId);
  } catch (error) {
    console.error('[supportService.fetchTicketById] error:', error);
    return null;
  }
}

export async function createTicket(
  userId: string,
  data: {
    userEmail: string;
    userName: string;
    subject: string;
    topic: SupportTopic;
    orderId?: string;
    priority?: SupportPriority;
    initialMessage: string;
  },
): Promise<ApiResponse<SupportTicket>> {
  if (!data.subject.trim() || data.subject.trim().length < 4) {
    return { success: false, error: 'Please enter a clear subject (minimum 4 characters).' };
  }
  if (!data.initialMessage.trim() || data.initialMessage.trim().length < 10) {
    return { success: false, error: 'Please describe your request in detail (minimum 10 characters).' };
  }

  try {
    const initialMsg: SupportMessage = {
      id: `msg-${Date.now()}-1`,
      senderId: userId,
      senderName: data.userName || 'Customer',
      senderRole: 'customer',
      message: data.initialMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    const ticket = await createSupportTicketInDB({
      userId,
      userEmail: data.userEmail,
      userName: data.userName || 'Customer',
      topic: data.topic,
      subject: data.subject.trim(),
      status: 'open',
      priority: data.priority || 'medium',
      orderId: data.orderId || undefined,
      messages: [initialMsg],
    });

    return {
      success: true,
      data: ticket,
      message: `Support ticket #${ticket.ticketNumber} submitted successfully!`,
    };
  } catch (error) {
    console.error('[supportService.createTicket] error:', error);
    return { success: false, error: 'Failed to submit support request. Please try again.' };
  }
}

export async function replyToTicket(
  ticketId: string,
  data: {
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'support' | 'admin';
    message: string;
  },
): Promise<ApiResponse<SupportMessage>> {
  if (!data.message.trim()) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const message = await addSupportMessageInDB(ticketId, {
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      message: data.message.trim(),
    });

    return { success: true, data: message };
  } catch (error) {
    console.error('[supportService.replyToTicket] error:', error);
    return { success: false, error: 'Failed to send reply.' };
  }
}

export async function closeTicket(ticketId: string): Promise<ApiResponse> {
  try {
    await updateSupportTicketStatusInDB(ticketId, 'closed');
    return { success: true, message: 'Ticket marked as closed.' };
  } catch (error) {
    console.error('[supportService.closeTicket] error:', error);
    return { success: false, error: 'Failed to close ticket.' };
  }
}
