'use client';
// ============================================================================
// Admin Users Management — User Directory, Role Elevation & Account Suspension
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Eye,
  X,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { fetchAdminUsers, updateAdminUserStatus } from '@/services/adminService';
import type { User as AppUser, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<AppUser | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'change_role'>('suspend');
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setError(res.error || 'Failed to load user accounts.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery === '' ||
        (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        u.uid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'suspended' ? u.status === 'suspended' : u.status !== 'suspended');

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleOpenConfirm = (
    user: AppUser,
    type: 'suspend' | 'activate' | 'change_role',
    role?: UserRole,
  ) => {
    setTargetUser(user);
    setActionType(type);
    if (role) setNewRole(role);
    setConfirmModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!targetUser) return;
    setActionLoading(true);

    try {
      if (actionType === 'suspend') {
        const res = await updateAdminUserStatus(targetUser.uid, 'suspended');
        if (res.success) {
          setSuccessMessage(`Account ${targetUser.email} has been suspended.`);
          setUsers((prev) =>
            prev.map((u) => (u.uid === targetUser.uid ? { ...u, status: 'suspended' } : u)),
          );
        } else {
          setError(res.error || 'Failed to suspend account.');
        }
      } else if (actionType === 'activate') {
        const res = await updateAdminUserStatus(targetUser.uid, 'active');
        if (res.success) {
          setSuccessMessage(`Account ${targetUser.email} has been activated.`);
          setUsers((prev) =>
            prev.map((u) => (u.uid === targetUser.uid ? { ...u, status: 'active' } : u)),
          );
        } else {
          setError(res.error || 'Failed to activate account.');
        }
      } else if (actionType === 'change_role') {
        const res = await updateAdminUserStatus(targetUser.uid, targetUser.status || 'active', newRole);
        if (res.success) {
          setSuccessMessage(`Account ${targetUser.email} role updated to ${newRole}.`);
          setUsers((prev) =>
            prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u)),
          );
        } else {
          setError(res.error || 'Failed to update account role.');
        }
      }
    } finally {
      setActionLoading(false);
      setConfirmModalOpen(false);
      setTargetUser(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <Users className="h-6 w-6 text-[#007185]" />
              User Accounts Directory
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Search, filter, manage roles, and review security status for customer and seller accounts.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] border-[#d5d9d9] hover:bg-[#f7fafa] cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
            <span>Refresh</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-center gap-3 text-red-900 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900 text-xs">
            <UserCheck size={18} className="shrink-0 text-[#007600]" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-[#d5d9d9] shadow-xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#565959]" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#d5d9d9] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-hidden text-[#0f1111]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[#565959]">
              <Filter size={14} />
              <span>Role:</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white focus:border-[#e77600] focus:outline-hidden text-[#0f1111]"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>

            <div className="flex items-center gap-1 text-xs text-[#565959] ml-2">
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs rounded border border-[#d5d9d9] bg-white focus:border-[#e77600] focus:outline-hidden text-[#0f1111]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-[#d5d9d9] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#565959]">Loading user accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#565959]">
              No user accounts found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d5d9d9] bg-[#f0f2f2] text-[#565959] font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Addresses</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeded]">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-[#f7fafa] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-200 text-[#0f1111] font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                            {u.displayName ? u.displayName[0] : (u.email ? u.email[0] : 'U')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#0f1111] truncate">
                              {u.displayName || 'Customer'}
                            </p>
                            <p className="text-[11px] text-[#565959] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-[#131921] text-white border border-[#131921]'
                              : u.role === 'seller'
                                ? 'bg-amber-100 text-[#b12704] border border-amber-300'
                                : 'bg-[#f0f2f2] text-[#0f1111] border border-[#d5d9d9]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                            u.status === 'suspended' ? 'text-red-600' : 'text-[#007600]'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              u.status === 'suspended' ? 'bg-red-500' : 'bg-[#007600]'
                            }`}
                          />
                          {u.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#0f1111]">
                        {u.addresses ? `${u.addresses.length} saved` : '0 saved'}
                      </td>

                      <td className="py-3 px-4 text-[#565959] text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded text-[#565959] hover:text-[#007185] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Role Toggle */}
                          {u.role !== 'admin' && (
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleOpenConfirm(u, 'change_role', e.target.value as UserRole)
                              }
                              className="text-[10px] py-1 px-1.5 rounded border border-[#d5d9d9] bg-white text-[#0f1111] focus:border-[#e77600] focus:outline-hidden"
                              title="Assign Role"
                            >
                              <option value="customer">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}

                          {/* Suspend / Activate Toggle */}
                          {u.status === 'suspended' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenConfirm(u, 'activate')}
                              className="p-1.5 rounded text-[#007600] hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Activate Account"
                            >
                              <UserCheck size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenConfirm(u, 'suspend')}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Suspend Account"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── User Details Modal ── */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedUser(null)}
            />
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl z-10 border border-[#d5d9d9] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaeded]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-[#007185] font-extrabold flex items-center justify-center text-sm border border-[#d5d9d9]">
                    {selectedUser.displayName ? selectedUser.displayName[0] : 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f1111]">
                      {selectedUser.displayName || 'Customer Account'}
                    </h3>
                    <p className="text-xs text-[#565959] font-mono">UID: {selectedUser.uid}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-[#0f1111] p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[#565959] text-[10px] uppercase font-bold">Email</span>
                  <p className="font-semibold text-[#0f1111] mt-0.5 truncate">
                    {selectedUser.email || 'None'}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[#565959] text-[10px] uppercase font-bold">Role</span>
                  <p className="font-bold text-[#b12704] uppercase mt-0.5">
                    {selectedUser.role}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[#565959] text-[10px] uppercase font-bold">Status</span>
                  <p className="font-semibold text-[#0f1111] mt-0.5">
                    {selectedUser.status === 'suspended' ? 'Suspended' : 'Active'}
                  </p>
                </div>
                <div className="rounded bg-[#f7fafa] p-3 border border-[#d5d9d9]">
                  <span className="text-[#565959] text-[10px] uppercase font-bold">Created</span>
                  <p className="font-semibold text-[#0f1111] mt-0.5">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Addresses List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  Saved Shipping Addresses ({selectedUser.addresses?.length || 0})
                </h4>
                {(!selectedUser.addresses || selectedUser.addresses.length === 0) ? (
                  <p className="text-[11px] text-slate-400">No addresses on file.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {selectedUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px]"
                      >
                        <p className="font-bold text-slate-800">{addr.fullName}</p>
                        <p className="text-slate-600">
                          {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirmation Modal ── */}
        <ConfirmationModal
          isOpen={confirmModalOpen}
          title={
            actionType === 'suspend'
              ? 'Suspend User Account'
              : actionType === 'activate'
                ? 'Activate User Account'
                : 'Change User Role'
          }
          message={
            actionType === 'suspend'
              ? `Are you sure you want to suspend account for ${targetUser?.email}? The user will be barred from placing orders or creating products.`
              : actionType === 'activate'
                ? `Re-activate account for ${targetUser?.email}? They will regain full marketplace access.`
                : `Are you sure you want to change role for ${targetUser?.email} to "${newRole}"?`
          }
          confirmText={
            actionType === 'suspend'
              ? 'Yes, Suspend Account'
              : actionType === 'activate'
                ? 'Activate Account'
                : 'Confirm Role Change'
          }
          variant={actionType === 'suspend' ? 'danger' : 'primary'}
          isLoading={actionLoading}
          onConfirm={handleExecuteAction}
          onCancel={() => {
            setConfirmModalOpen(false);
            setTargetUser(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}
