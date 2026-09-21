'use client';
// ============================================================================
// Admin Orders Oversight — Global Transaction Queue & Status Overrides
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { fetchAdminOrders, updateAdminOrderStatus } from '@/services/adminService';
import type { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Confirmation Modal for Status Override
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [targetNextStatus, setTargetNextStatus] = useState<OrderStatus>('processing');
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminOrders();
    if (res.success && res.data) {
      setOrders(res.data);
    } else {
      setError(res.error || 'Failed to load orders.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        o.id.toLowerCase().includes(q) ||
        (o.shippingAddress?.fullName?.toLowerCase().includes(q) ?? false) ||
        o.items.some((i) => i.title.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleOpenStatusChange = (order: Order, nextStatus: OrderStatus) => {
    setTargetOrder(order);
    setTargetNextStatus(nextStatus);
    setStatusModalOpen(true);
  };

  const handleExecuteStatusChange = async () => {
    if (!targetOrder) return;
    setActionLoading(true);
    try {
      const res = await updateAdminOrderStatus(targetOrder.id, targetNextStatus);
      if (res.success) {
        setSuccessMessage(`Order #${targetOrder.id.slice(-8)} status changed to ${targetNextStatus}.`);
        setOrders((prev) =>
          prev.map((o) => (o.id === targetOrder.id ? { ...o, status: targetNextStatus } : o)),
        );
        if (selectedOrder && selectedOrder.id === targetOrder.id) {
          setSelectedOrder({ ...selectedOrder, status: targetNextStatus });
        }
      } else {
        setError(res.error || 'Failed to update order status.');
      }
    } finally {
      setActionLoading(false);
      setStatusModalOpen(false);
      setTargetOrder(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-[#ebf8fa] text-[#007600] border border-[#a2d8df] rounded px-2 py-0.5 text-[10px] font-bold uppercase">Delivered</span>;
      case 'shipped':
      case 'out_for_delivery':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 rounded px-2 py-0.5 text-[10px] font-bold uppercase">{status.replace('_', ' ')}</span>;
      case 'cancelled':
        return <span className="bg-red-50 text-red-800 border border-red-200 rounded px-2 py-0.5 text-[10px] font-bold uppercase">Cancelled</span>;
      case 'RETURN_REQUESTED':
      case 'RETURN_APPROVED':
      case 'REFUNDED':
      case 'refunded':
        return <span className="bg-amber-50 text-[#b12704] border border-amber-200 rounded px-2 py-0.5 text-[10px] font-bold uppercase">{status}</span>;
      default:
        return <span className="bg-amber-50 text-[#b12704] border border-amber-200 rounded px-2 py-0.5 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-amazon-orange" />
              Global Orders Oversight
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Track real-time transactions, customer shipments, seller fulfillments, and admin status overrides.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] border-[#d5d9d9] hover:bg-[#f7fafa] cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between text-emerald-900 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#007600]" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-center justify-between text-red-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg border border-[#d5d9d9] shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#565959]" />
            <input
              type="text"
              placeholder="Search by order ID, recipient name, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#565959]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="RETURN_REQUESTED">Return Requested</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading marketplace orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No orders found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{o.id.slice(-8)}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {o.shippingAddress?.fullName || 'Customer'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {o.shippingAddress?.city}, {o.shippingAddress?.state}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {o.items.length} item{o.items.length > 1 ? 's' : ''}
                      </td>

                      <td className="py-3 px-4 font-black text-slate-900">
                        {formatPrice(o.total)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(o.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded text-[#565959] hover:text-[#007185] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect Order Details"
                          >
                            <Eye size={15} />
                          </button>

                          <select
                            value={o.status}
                            onChange={(e) => handleOpenStatusChange(o, e.target.value as OrderStatus)}
                            className="text-[10px] py-1 px-1.5 rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden cursor-pointer"
                            title="Admin Status Override"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Order Details Modal ── */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl z-10 border border-[#d5d9d9] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeded]">
                <div>
                  <h3 className="text-base font-bold text-[#0f1111] flex items-center gap-2">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-[#565959]">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-[#0f1111] p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status & Total Banner */}
              <div className="flex items-center justify-between rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#565959]">Current Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#565959]">Grand Total: </span>
                  <span className="text-base font-bold text-[#007600]">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Shipping & Payment Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-[#d5d9d9] p-3 bg-white">
                  <h4 className="font-bold text-[#0f1111] flex items-center gap-1.5 mb-1.5">
                    <MapPin size={14} className="text-amazon-orange" />
                    Shipping Destination
                  </h4>
                  <p className="font-semibold text-[#0f1111]">
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-[#565959]">
                    {selectedOrder.shippingAddress?.street}
                  </p>
                  <p className="text-[#565959]">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                    {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>

                <div className="rounded border border-[#d5d9d9] p-3 bg-white">
                  <h4 className="font-bold text-[#0f1111] flex items-center gap-1.5 mb-1.5">
                    <CreditCard size={14} className="text-amazon-orange" />
                    Payment Summary
                  </h4>
                  <p className="text-[#565959] capitalize">
                    Method: {selectedOrder.paymentMethod?.type || 'Card'}
                  </p>
                  <div className="space-y-1 mt-2 text-[11px] text-[#565959]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPrice(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased Items */}
              <div>
                <h4 className="text-xs font-bold text-[#0f1111] mb-2 flex items-center gap-1.5">
                  <Package size={14} className="text-amazon-orange" />
                  Purchased Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                          {item.image && (
                            <Image src={item.image} alt={item.title} fill className="object-contain p-0.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-sm">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Quantity: {item.quantity} • Unit: {formatPrice(item.price)}
                            {item.sellerId && ` • Seller: ${item.sellerId.slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-slate-900 shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Status Override Confirmation ── */}
        <ConfirmationModal
          isOpen={statusModalOpen}
          title="Override Order Status"
          message={`Are you sure you want to change status of Order #${targetOrder?.id.slice(-8)} to "${targetNextStatus}"? This update will immediately sync with the customer and seller views.`}
          confirmText="Confirm Status Update"
          variant="primary"
          isLoading={actionLoading}
          onConfirm={handleExecuteStatusChange}
          onCancel={() => {
            setStatusModalOpen(false);
            setTargetOrder(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}
