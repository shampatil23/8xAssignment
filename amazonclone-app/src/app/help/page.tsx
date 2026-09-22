'use client';
// ============================================================================
// Customer Service & Help Center — /help & /customer-service
// Browse FAQs, get help with real orders, submit tickets, and chat with support
// ============================================================================
import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Truck,
  Store,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrdersFromDB } from '@/lib/firebase/database';
import {
  SUPPORT_TOPICS,
  FAQ_ITEMS,
  fetchUserTickets,
  createTicket,
  replyToTicket,
  type HelpTopicInfo,
  type FaqItem,
} from '@/services/supportService';
import type { Order, SupportTicket, SupportTopic, SupportPriority } from '@/types';

export default function HelpCenterPage() {
  return (
    <MainLayout>
      <React.Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading Help Center...</div>}>
        <HelpCenterContent />
      </React.Suspense>
    </MainLayout>
  );
}

function HelpCenterContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTicketParam = searchParams.get('ticket');

  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'tickets'>(
    initialTicketParam ? 'tickets' : 'browse',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<SupportTopic | 'all'>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Orders for order assistance
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(initialTicketParam);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Create ticket form
  const [formData, setFormData] = useState<{
    topic: SupportTopic;
    orderId: string;
    subject: string;
    priority: SupportPriority;
    message: string;
  }>({
    topic: 'orders',
    orderId: '',
    subject: '',
    priority: 'medium',
    message: '',
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Load user orders and tickets if logged in
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      getUserOrdersFromDB(user.uid)
        .then((orders) => setUserOrders(orders))
        .finally(() => setLoadingOrders(false));

      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    const list = await fetchUserTickets(user.uid);
    setTickets(list);
    setLoadingTickets(false);
  };

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || null;

  // Filter FAQs
  const filteredFaqs = FAQ_ITEMS.filter((faq) => {
    const matchesTopic = selectedTopic === 'all' || faq.topic === selectedTopic;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const getTopicIcon = (id: SupportTopic) => {
    switch (id) {
      case 'orders':
        return <Package className="h-6 w-6 text-amazon-orange" />;
      case 'returns':
        return <RotateCcw className="h-6 w-6 text-amazon-orange" />;
      case 'payments':
        return <CreditCard className="h-6 w-6 text-amazon-orange" />;
      case 'account':
        return <ShieldCheck className="h-6 w-6 text-amazon-orange" />;
      case 'delivery':
        return <Truck className="h-6 w-6 text-amazon-orange" />;
      case 'seller':
        return <Store className="h-6 w-6 text-amazon-orange" />;
      default:
        return <MessageSquare className="h-6 w-6 text-amazon-orange" />;
    }
  };

  const handleSelectOrderForHelp = (order: Order) => {
    setFormData({
      topic: 'orders',
      orderId: order.id,
      subject: `Assistance needed with Order #${order.id.slice(-8).toUpperCase()}`,
      priority: 'medium',
      message: `I need help with my order placed on ${new Date(order.createdAt).toLocaleDateString()}. Items: ${order.items
        .map((i) => i.title)
        .join(', ')}. `,
    });
    setActiveTab('create');
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingTicket(true);
    setTicketError(null);

    const res = await createTicket(user.uid, {
      userEmail: user.email || 'customer@amazonclone.com',
      userName: user.displayName || 'Customer',
      topic: formData.topic,
      orderId: formData.orderId || undefined,
      subject: formData.subject,
      priority: formData.priority,
      initialMessage: formData.message,
    });

    setSubmittingTicket(false);
    if (res.success && res.data) {
      setTicketSuccessMessage(res.message || 'Ticket submitted successfully!');
      setFormData({
        topic: 'orders',
        orderId: '',
        subject: '',
        priority: 'medium',
        message: '',
      });
      await loadTickets();
      setActiveTicketId(res.data.id);
      setActiveTab('tickets');
      setTimeout(() => setTicketSuccessMessage(null), 5000);
    } else {
      setTicketError(res.error || 'Failed to submit ticket.');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTicketId || !replyMessage.trim()) return;
    setSubmittingReply(true);

    const res = await replyToTicket(activeTicketId, {
      senderId: user.uid,
      senderName: user.displayName || 'Customer',
      senderRole: 'customer',
      message: replyMessage.trim(),
    });

    setSubmittingReply(false);
    if (res.success && res.data) {
      setReplyMessage('');
      // update local ticket messages
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicketId
            ? { ...t, messages: [...(t.messages || []), res.data!] }
            : t,
        ),
      );
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pb-16">
      {/* Top Banner Hero */}
      <div className="bg-[#232f3e] text-white py-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}. What can we help you with?
          </h1>
          <p className="mt-2 text-xs text-gray-300">
            Search our knowledge base or select an issue below to get immediate assistance.
          </p>

          {/* Search Box */}
          <div className="mt-6 mx-auto max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'browse') setActiveTab('browse');
              }}
              placeholder="Type keywords like 'return', 'delivery', 'payment', 'cancel'..."
              className="w-full rounded-md border border-gray-300 bg-white py-3 pl-11 pr-4 text-xs text-gray-900 shadow-md focus:border-amazon-orange focus:outline-hidden"
            />
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-300 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`rounded-md px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-amazon-yellow text-gray-900 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Help Topics &amp; FAQs
          </button>

          {user && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`rounded-md px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-amazon-yellow text-gray-900 shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <PlusCircle size={14} />
                <span>Contact Us / New Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`rounded-md px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tickets'
                    ? 'bg-amazon-yellow text-gray-900 shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <MessageSquare size={14} />
                <span>My Inquiries ({tickets.length})</span>
              </button>
            </>
          )}
        </div>

        {ticketSuccessMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200 text-xs font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{ticketSuccessMessage}</span>
          </div>
        )}

        {/* ── TAB 1: BROWSE TOPICS & FAQS ── */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Connected to Real Orders Section */}
            {user && userOrders.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-amazon-orange" />
                    <h2 className="text-sm font-bold text-gray-900">
                      Need help with a recent order?
                    </h2>
                  </div>
                  <Link href="/orders" className="text-xs text-amazon-link hover:underline">
                    View all orders &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span>Order #{order.id.slice(-8).toUpperCase()}</span>
                          <span className="font-semibold text-gray-700 capitalize">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 my-2">
                          {order.items[0]?.image && (
                            <img
                              src={order.items[0].image}
                              alt={order.items[0].title}
                              className="h-10 w-10 object-contain rounded border p-0.5"
                            />
                          )}
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                            {order.items[0]?.title}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectOrderForHelp(order)}
                        className="mt-2 w-full rounded bg-gray-100 hover:bg-gray-200 py-1.5 text-[11px] font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        Get Help with this Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Tiles Grid */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Recommended Help Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {SUPPORT_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() =>
                      setSelectedTopic(selectedTopic === topic.id ? 'all' : topic.id)
                    }
                    className={`flex items-start gap-3.5 rounded-lg border p-4 text-left transition-all cursor-pointer ${
                      selectedTopic === topic.id
                        ? 'border-amazon-orange bg-orange-50/40 shadow-xs ring-1 ring-amazon-orange'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{getTopicIcon(topic.id)}</div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{topic.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Frequently Asked Questions
                  {selectedTopic !== 'all' && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Filtered by {selectedTopic})
                    </span>
                  )}
                </h2>
                {selectedTopic !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopic('all')}
                    className="text-xs text-amazon-link hover:underline cursor-pointer"
                  >
                    Show all FAQs
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">
                  No help topics found matching your query.
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaq === faq.id;
                    return (
                      <div key={faq.id} className="py-3.5">
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                          className="flex w-full items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-amazon-link cursor-pointer"
                        >
                          <span className="pr-4">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 pl-1 pr-4 text-xs text-gray-600 leading-relaxed space-y-2 animate-fadeIn">
                            <p>{faq.answer}</p>
                            {faq.relatedAction && (
                              <Link
                                href={faq.relatedAction.href}
                                className="inline-flex items-center gap-1 font-bold text-amazon-link hover:underline text-xs"
                              >
                                <span>{faq.relatedAction.label}</span>
                                <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Contact Channels Banner */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-2">
                Still need help?
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Our specialized Amazon Clone customer support associates are available around the clock.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 flex items-start gap-3 bg-gray-50">
                  <MessageSquare className="h-6 w-6 text-amazon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Submit Support Ticket</h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Direct ticket escalation to resolution specialists.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab(user ? 'create' : 'browse')}
                      className="mt-2 text-xs font-bold text-amazon-link hover:underline block"
                    >
                      {user ? 'Open a Ticket &rarr;' : 'Sign in to open ticket'}
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 flex items-start gap-3 bg-gray-50">
                  <Mail className="h-6 w-6 text-amazon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Email Customer Service</h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      support@amazonclone.com
                    </p>
                    <span className="mt-2 text-[11px] text-gray-400 block">
                      Responses within 4-6 hours
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 flex items-start gap-3 bg-gray-50">
                  <Phone className="h-6 w-6 text-amazon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Customer Helpline</h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      1800-3000-9009 (Toll Free)
                    </p>
                    <span className="mt-2 text-[11px] text-gray-400 block">
                      24 hours a day, 7 days a week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: CREATE SUPPORT TICKET ── */}
        {activeTab === 'create' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl mx-auto">
            <div className="border-b pb-4 mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Submit a Customer Support Request
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tell us about your issue and our resolution team will assist you.
              </p>
            </div>

            {ticketError && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs font-semibold text-red-800 border border-red-200">
                {ticketError}
              </div>
            )}

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Issue Category</label>
                <select
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, topic: e.target.value as SupportTopic }))
                  }
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                >
                  <option value="orders">Your Orders &amp; Shipment Tracking</option>
                  <option value="returns">Returns, Refunds &amp; Replacements</option>
                  <option value="payments">Payment Issues &amp; Invoices</option>
                  <option value="account">Account Settings &amp; Security</option>
                  <option value="delivery">Delivery Coordination &amp; Address</option>
                  <option value="seller">Selling on Amazon Clone</option>
                  <option value="other">Other Inquiries</option>
                </select>
              </div>

              {/* Associate with Order */}
              {userOrders.length > 0 && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Related Order (Optional)
                  </label>
                  <select
                    value={formData.orderId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, orderId: e.target.value }))
                    }
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                  >
                    <option value="">None / Not order related</option>
                    {userOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id.slice(-8).toUpperCase()} ({o.items[0]?.title.slice(0, 30)}...) - ₹{o.total.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as SupportPriority,
                    }))
                  }
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Standard order inquiry</option>
                  <option value="high">High - Urgent delivery or payment issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  required
                  placeholder="e.g. Package marked delivered but not received"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description &amp; Details</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  required
                  placeholder="Please describe what happened, any tracking numbers, and how we can best assist you..."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="rounded bg-amazon-yellow hover:bg-amazon-yellow-hover px-6 py-2 text-xs font-bold text-gray-900 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Support Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: TICKET HISTORY & THREAD VIEW ── */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ticket List Sidebar */}
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                <span>Your Inquiries ({tickets.length})</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="text-xs font-semibold text-amazon-link hover:underline flex items-center gap-1"
                >
                  <PlusCircle size={12} />
                  <span>New</span>
                </button>
              </h2>

              {loadingTickets ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
                  <p className="text-xs text-gray-500">You have no active support requests.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="mt-3 rounded bg-amazon-yellow px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover"
                  >
                    Open a Ticket
                  </button>
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = t.id === activeTicketId;
                  const statusColors = {
                    open: 'bg-blue-100 text-blue-800',
                    in_progress: 'bg-amber-100 text-amber-800',
                    resolved: 'bg-green-100 text-green-800',
                    closed: 'bg-gray-100 text-gray-700',
                  }[t.status];

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full text-left rounded-lg border p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amazon-orange bg-orange-50/20 ring-1 ring-amazon-orange shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="font-bold text-gray-700">#{t.ticketNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${statusColors}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{t.subject}</h3>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="capitalize">{t.topic}</span>
                        <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Ticket Conversation View */}
            <div className="md:col-span-2">
              {activeTicket ? (
                <div className="rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col h-[550px]">
                  {/* Header */}
                  <div className="border-b p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amazon-orange">
                          #{activeTicket.ticketNumber}
                        </span>
                        <h2 className="text-sm font-bold text-gray-900">
                          {activeTicket.subject}
                        </h2>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                        <span>Category: <strong className="capitalize">{activeTicket.topic}</strong></span>
                        {activeTicket.orderId && (
                          <span>
                            Order: <Link href={`/orders/${activeTicket.orderId}`} className="text-amazon-link hover:underline font-bold">#{activeTicket.orderId.slice(-8).toUpperCase()}</Link>
                          </span>
                        )}
                        <span>Priority: <strong className="capitalize">{activeTicket.priority}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTicket.messages?.map((msg) => {
                      const isCustomer = msg.senderRole === 'customer';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-500">
                            <span className="font-bold text-gray-700">
                              {isCustomer ? 'You' : `${msg.senderName} (Customer Support)`}
                            </span>
                            <span>•</span>
                            <Clock size={10} />
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`rounded-xl px-4 py-2.5 text-xs max-w-lg leading-relaxed ${
                              isCustomer
                                ? 'bg-[#232f3e] text-white'
                                : 'bg-gray-100 text-gray-900 border border-gray-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Box */}
                  <form onSubmit={handleSendReply} className="border-t p-3 bg-gray-50 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply to support..."
                      className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-xs focus:border-amazon-orange focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={submittingReply || !replyMessage.trim()}
                      className="rounded bg-amazon-yellow hover:bg-amazon-yellow-hover px-4 py-2 text-xs font-bold text-gray-900 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send size={13} />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white h-[400px] flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare size={36} className="text-gray-300 mb-2" />
                  <h3 className="text-sm font-bold text-gray-700">No inquiry selected</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Select a support ticket from the list to view the conversation thread or submit a new inquiry.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
