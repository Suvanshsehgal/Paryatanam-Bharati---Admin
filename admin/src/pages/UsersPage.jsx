import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { useToast } from '../context/ToastContext';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { USER_ROLES } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { Search, Shield, UserCheck, UserX, Loader2, Check } from 'lucide-react';

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [statusModalUser, setStatusModalUser] = useState(null);

  // Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page, limit, roleFilter, searchQuery],
    queryFn: () => usersApi.getUsers({ page, limit, role: roleFilter, search: searchQuery }),
  });

  // Role Assignment Mutation
  const roleMutation = useMutation({
    mutationFn: ({ userId, roles }) => usersApi.updateUserRoles(userId, roles),
    onSuccess: (res, variables) => {
      toast.success('Roles Updated', `Assigned roles [${variables.roles.join(', ')}] successfully.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRoleModalUser(null);
    },
    onError: (err) => {
      toast.error('Failed to Assign Roles', err.detail || err.message);
    },
  });

  // Status Update Mutation
  const statusMutation = useMutation({
    mutationFn: ({ userId, status }) => usersApi.updateUserStatus(userId, status),
    onSuccess: (res, variables) => {
      toast.success('Status Updated', `User account status changed to ${variables.status}.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusModalUser(null);
    },
    onError: (err) => {
      toast.error('Failed to Update Status', err.detail || err.message);
    },
  });

  const handleOpenRoleModal = (user) => {
    setRoleModalUser(user);
    setSelectedRoles([...(user.roles || [])]);
  };

  const handleToggleRoleCheckbox = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = () => {
    if (!roleModalUser) return;
    roleMutation.mutate({ userId: roleModalUser.id, roles: selectedRoles });
  };

  const handleConfirmStatusChange = () => {
    if (!statusModalUser) return;
    const isActive = statusModalUser.status?.toUpperCase() === 'ACTIVE';
    const newStatus = isActive ? 'SUSPENDED' : 'ACTIVE';
    statusMutation.mutate({ userId: statusModalUser.id, status: newStatus });
  };

  const columns = [
    {
      header: 'User / Enterprise',
      accessorKey: 'name',
      cell: (user) => (
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">{user.name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user.email}</p>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      accessorKey: 'phone',
      cell: (user) => <span className="font-mono text-xs">{user.phone || 'N/A'}</span>,
    },
    {
      header: 'Assigned Roles',
      accessorKey: 'roles',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {(user.roles || []).map((r) => (
            <StatusBadge key={r} status={r} className="text-[10px] py-0 px-2" />
          ))}
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessorKey: 'status',
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      header: 'Registered Date',
      accessorKey: 'created_at',
      cell: (user) => <span className="text-xs text-slate-500">{formatDate(user.created_at)}</span>,
    },
    {
      header: 'Governance Actions',
      key: 'actions',
      cell: (user) => {
        const isActive = user.status?.toUpperCase() === 'ACTIVE';
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenRoleModal(user)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs font-semibold"
              title="Manage User Roles"
            >
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              <span>Roles</span>
            </button>

            <button
              onClick={() => setStatusModalUser(user)}
              className={`p-1.5 rounded-lg border transition-colors flex items-center space-x-1 text-xs font-semibold ${
                isActive
                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/50'
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/50'
              }`}
              title={isActive ? 'Suspend user' : 'Activate user'}
            >
              {isActive ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  <span>Suspend</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          User & Access Governance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage platform users, system administrators, and business owners.
        </p>
      </div>

      {/* Controls / Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Role Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            <option value="">All Roles</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={data?.pagination || { page, limit, total_records: 0, total_pages: 1 }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
        emptyTitle="No platform users found"
        emptyDescription="No registered user profiles matched your active role or search filters."
      />

      {/* Role Assignment Modal */}
      <Modal
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        title="Role Assignment Governance"
        subtitle={`Update security access roles for ${roleModalUser?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select all system access privileges that apply to this user account:
          </p>

          <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/50">
            {USER_ROLES.map((role) => {
              const isChecked = selectedRoles.includes(role);
              return (
                <label
                  key={role}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleRoleCheckbox(role)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{role}</span>
                  </div>
                  <StatusBadge status={role} className="text-[10px]" />
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setRoleModalUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRoles}
              disabled={roleMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              {roleMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Assigned Roles</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Suspending / Activating */}
      <ConfirmationModal
        isOpen={Boolean(statusModalUser)}
        onClose={() => setStatusModalUser(null)}
        onConfirm={handleConfirmStatusChange}
        title={statusModalUser?.status === 'active' ? 'Suspend User Account' : 'Reactivate User Account'}
        description={`Are you sure you want to ${
          statusModalUser?.status === 'active' ? 'suspend' : 'activate'
        } ${statusModalUser?.name}? ${
          statusModalUser?.status === 'active'
            ? 'Suspended accounts will lose access to owner and platform actions immediately.'
            : 'Reactivating will restore full access to their registered privileges.'
        }`}
        confirmText={statusModalUser?.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        isDanger={statusModalUser?.status === 'active'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};
