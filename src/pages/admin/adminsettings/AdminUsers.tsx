// src/pages/admin/adminsettings/AdminUsers.tsx
import React, { useEffect, useState } from 'react';
import { Search, XCircle } from 'lucide-react';
import { supabase } from '../../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// -------------------- Types --------------------
interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  active: boolean;
  source_table: 'profiles' | 'admin_users';
}

// -------------------- Constants --------------------
const ROLES = ['superadmin', 'productmanager', 'ordermanager', 'customer', 'moderator', ''];
const PAGE_SIZE = 10;

// -------------------- Helpers --------------------
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

// ---------------- User Detail Modal ----------------
// ---------------- User Detail Modal ----------------
const UserDetailModal = ({
  user,
  onClose,
  onSave,
  saving,
  onResetPassword,
  onDeleteUser,
  onToggleActive,
}: {
  user: User | null;
  onClose: () => void;
  onSave: (user: Partial<User>, source: User['source_table']) => Promise<void>;
  saving: boolean;
  onResetPassword: (user: User) => Promise<void>;
  onDeleteUser: (user: User) => Promise<void>;
  onToggleActive: (user: User) => Promise<void>;
}) => {
  const [editableUser, setEditableUser] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) setEditableUser(user);
  }, [user]);

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative transform scale-100 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <XCircle size={28} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 text-white">User Details</h2>

        {/* Avatar + Info */}
        <div className="flex items-center space-x-6 mb-6">
          {editableUser.avatar_url ? (
            <img
              src={editableUser.avatar_url}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 font-bold text-xl uppercase">
              {editableUser.full_name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-lg text-white">{editableUser.email || 'N/A'}</p>
            <p className="text-gray-400 text-sm mt-1">ID: {editableUser.id}</p>
            <p className="text-gray-400 text-sm italic mt-0.5">
              Source: {editableUser.source_table}
            </p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-medium mb-1 text-gray-300">Full Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-700 p-3 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={editableUser.full_name || ''}
              onChange={(e) => setEditableUser({ ...editableUser, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          {/* Note about role updates */}
          <p className="text-yellow-400 text-sm italic">
            ⚠️ To change a user's role, please delete and recreate the admin with the desired role.
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (!editableUser.full_name?.trim()) {
                toast.error('Full name cannot be empty');
                return;
              }
              onSave(editableUser, editableUser.source_table!);
            }}
            disabled={saving}
            className="w-full py-3 text-black font-semibold rounded-xl bg-green-400 hover:bg-green-500 transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={() => user && onResetPassword(user)}
            className="w-full py-3 text-black font-semibold rounded-xl bg-blue-400 hover:bg-blue-500 transition-all"
          >
            Reset Password
          </button>

          <button
            onClick={() => user && onToggleActive(user)}
            className={`w-full py-3 font-semibold rounded-xl transition-all ${
              user?.active
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                : 'bg-green-500 hover:bg-green-600 text-black'
            }`}
          >
            {user?.active ? 'Deactivate' : 'Activate'}
          </button>

          <button
            onClick={() => user && onDeleteUser(user)}
            className="w-full py-3 text-black font-semibold rounded-xl bg-red-500 hover:bg-red-600 transition-all"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};




// ---------------- Create Admin Modal ----------------
const CreateAdminModal = ({
  open,
  onClose,
  onCreate,
  creating,
  allowedRoles,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { email: string; full_name: string; role: string; password: string }) => Promise<void>;
  creating: boolean;
  allowedRoles: string[];
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('productmanager');
  const [password, setPassword] = useState('');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Create New Admin</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-gray-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-xl border border-gray-600 p-3 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full rounded-xl border border-gray-600 p-3 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              className="w-full rounded-xl border border-gray-600 p-3 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-600 p-3 bg-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {allowedRoles.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="w-full py-3 mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl text-lg transition-colors disabled:opacity-50"
          onClick={() => {
            if (!fullName.trim()) return toast.error('Full name cannot be empty');
            if (!email.trim() || !isValidEmail(email)) return toast.error('Invalid email');
            if (!role) return toast.error('Please select a role');
            if (!password.trim()) return toast.error('Password cannot be empty');

            onCreate({ email, full_name: fullName, role, password });
          }}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Admin'}
        </button>
      </div>
    </div>
  );
};


// ---------------- AdminUsers Page ----------------
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState(ROLES);

  // ---------------- Toggle Active/Deactivate ----------------
// toggle active user
const toggleActive = async (user: User) => {
  const newActive = !user.active; // compute the new state first
  try {
    const res = await fetch(
      'https://bvnjxbbwxsibslembmty.supabase.co/functions/v1/toggle-admin-active-proxy',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, active: newActive }),
      }
    );

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Failed to change status');

    // use newActive for toast
    toast.success(`User ${user.email} has been ${newActive ? 'activated' : 'deactivated'}`);

    // update the selected user state so modal shows correct button text
    setSelectedUser({ ...user, active: newActive });

    // refresh table
    fetchUsers();
  } catch (err: any) {
    console.error('Toggle active error:', err);
    toast.error(`Failed to change status for ${user.email}`);
  }
};







  // ---------------- Fetch Users ----------------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Not logged in');

      const currentUserRole = session.user.user_metadata?.role || 'customer';
      setAllowedRoles(ROLES.filter((role) => role !== 'superadmin' || currentUserRole === 'superadmin'));

      let query = supabase
        .from('admin_and_profiles_view')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        const term = searchTerm.replace(/'/g, "''");
        query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
      }

      if (roleFilter !== 'all' && roleFilter !== '') {
        query = query.eq('role', roleFilter);
      }

      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      setUsers(data || []);
      setTotalUsers(count ?? 0);
    } catch (err: any) {
      console.error('❌ Fetch Users Error:', err);
      toast.error('Failed to fetch users. See console for details.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers();
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // ---------------- Save User ----------------
// ---------------- Save User ----------------
 const saveUser = async (userUpdate: Partial<User>, source: User['source_table']) => {
  if (!userUpdate.id) return;
  setSaving(true);

  try {
    if (source === 'admin_users') {
      toast.info('Admin user name cannot be updated directly. Delete and recreate with desired name.');
      return;
    }

    // Only update full_name for profiles
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: userUpdate.full_name })
      .eq('id', userUpdate.id);

    if (error) throw error;

    toast.success('User updated successfully.');
    setSelectedUser(null);
    fetchUsers();
  } catch (err: any) {
    console.error('Failed to save user:', err);
    toast.error('Failed to update user name.');
  } finally {
    setSaving(false);
  }
};




  // ---------------- Toggle User Selection ----------------
  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedUserIds(newSet);
  };

  // ---------------- Bulk Update Role ----------------
  const bulkUpdateRole = async (newRole: string) => {
    if (!newRole) return;
    if (selectedUserIds.size === 0) {
      toast.info('No users selected for bulk update.');
      return;
    }
    setSaving(true);
    try {
      const usersToUpdate = users.filter((u) => selectedUserIds.has(u.id));
      const byTable = usersToUpdate.reduce(
        (acc, u) => {
          acc[u.source_table].push(u.id);
          return acc;
        },
        { admin_users: [] as string[], profiles: [] as string[] }
      );

      if (byTable.profiles.length > 0) {
        const { error } = await supabase.from('profiles').update({ role: newRole }).in('id', byTable.profiles);
        if (error) throw error;
      }

      if (byTable.admin_users.length > 0) {
        const { error } = await supabase.from('admin_users').update({ role: newRole }).in('id', byTable.admin_users);
        if (error) throw error;
      }

      toast.success(`Updated role to '${newRole}' for ${selectedUserIds.size} users.`);
      setSelectedUserIds(new Set());
      fetchUsers();
    } catch {
      toast.error('Failed bulk update.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Create Admin ----------------
  const createAdminUser = async (data: { email: string; full_name: string; role: string; password: string }) => {
    setCreatingAdmin(true);
    try {
      const res = await fetch(
        'https://bvnjxbbwxsibslembmty.supabase.co/functions/v1/create-admin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Server error while creating admin');
      }

      const result = await res.json().catch(() => ({
        error: 'Invalid JSON response from server',
      }));

      if (result.error) throw new Error(result.error);

      toast.success(`Admin user ${data.email} created successfully`);
      setShowCreateModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to create admin:', err);
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // ---------------- Reset Password ----------------
  const resetPassword = async (user: User) => {
    try {
      const res = await fetch(
        'https://bvnjxbbwxsibslembmty.supabase.co/functions/v1/send-reset-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!res.ok) throw new Error('Failed to send reset email');
      toast.success(`Reset password email sent to ${user.email}`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(`Failed to send reset email to ${user.email}`);
    }
  };

  // ---------------- Hard Delete User ----------------
const deleteUser = async (user: User): Promise<void> => {
  return new Promise((resolve) => {
    const ToastContent = ({ closeToast }: { closeToast?: () => void }) => (
      <div className="flex flex-col space-y-2">
        <span>Are you sure you want to permanently delete <b>{user.email}</b>?</span>
        <div className="flex space-x-2 mt-2">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={async () => {
              closeToast?.();
              try {
                const res = await fetch(
                  'https://bvnjxbbwxsibslembmty.supabase.co/functions/v1/delete-admin-user-proxy',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, email: user.email }),
                  }
                );

                const data = await res.json();
                if (!res.ok || data.error) throw new Error(data.error || 'Failed to delete user');

                toast.success(`User ${user.email} deleted successfully`);
                setSelectedUser(null);
                fetchUsers();
              } catch (err: any) {
                console.error('Delete user error:', err);
                toast.error(`Failed to delete ${user.email}`);
              } finally {
                resolve(); // Resolve the promise after the API finishes
              }
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
            onClick={() => {
              closeToast?.();
              resolve(); // Resolve even if user cancels
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );

    toast.info(<ToastContent />, { autoClose: false, closeOnClick: false });
  });
};

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="luxury-card glass p-8 rounded-3xl shadow-xl max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-tamoor-charcoal">
            Users
          </h1>
          <button className="btn-premium w-full sm:w-auto">
            + Create New Admin
          </button>
        </div>


        {/* Search + Role Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-6 gap-4">
          <div className="relative w-full">
            <input
              type="text"
              className="neomorphism w-full rounded-full py-3 pl-10 pr-4 text-tamoor-charcoal placeholder-tamoor-charcoal"
              placeholder="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-tamoor-charcoal" />
          </div>

          <select
            className="w-full sm:w-auto rounded-full border border-gray-300 p-3 text-tamoor-charcoal"
            aria-label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {allowedRoles.filter(Boolean).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>


        {/* Users Table */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="min-w-full text-sm sm:text-base text-left border-collapse border border-slate-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-tamoor-gold-light text-white">
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.size === users.length && users.length > 0}
                    onChange={(e) =>
                      setSelectedUserIds(e.target.checked ? new Set(users.map((u) => u.id)) : new Set())
                    }
                  />
                </th>
                <th className="p-3">Avatar</th>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-tamoor-charcoal font-semibold">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-tamoor-charcoal font-semibold">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer hover:bg-white/20 transition-colors ${
                      selectedUserIds.has(user.id) ? 'bg-white/30' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="border border-slate-300 p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleUserSelection(user.id);
                        }}
                      />
                    </td>
                    <td className="border border-slate-300 p-3 text-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg uppercase">
                          {user.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 p-3">{user.email || 'N/A'}</td>
                    <td className="border border-slate-300 p-3">{user.full_name || 'N/A'}</td>
                    <td className="border border-slate-300 p-3">{user.role || 'None'}</td>
                    <td className="border border-slate-300 p-3">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            className="btn-premium px-4 py-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-sm sm:text-base">
            Page {page} of {Math.ceil(totalUsers / PAGE_SIZE) || 1}
          </span>
          <button
            className="btn-premium px-4 py-2"
            disabled={page >= Math.ceil(totalUsers / PAGE_SIZE)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>

        {/* Bulk Role Update */}
        <div className="mt-6 w-full sm:max-w-xs flex items-center space-x-3 max-w-xs">
          <select
            className="w-full rounded border border-gray-300 p-3 text-sm sm:text-base"
            onChange={(e) => bulkUpdateRole(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Bulk Update Role...
            </option>
            {allowedRoles.filter(Boolean).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modals */}
      <div className="bg-gray-900 rounded-2xl p-6 w-[95%] max-w-lg sm:max-w-md ...">
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={saveUser}
        saving={saving}
        //allowedRoles={allowedRoles}
        onResetPassword={resetPassword}
        onDeleteUser={deleteUser}
        onToggleActive={toggleActive}
      />

      <CreateAdminModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createAdminUser}
        creating={creatingAdmin}
        allowedRoles={allowedRoles}
      />
      </div>
    </>
  );
};

export default AdminUsers;
