import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

interface UserRole {
  id: number;
  role_name: string;
  permissions: any;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  source: 'profile' | 'admin';
}

const UserRolesSettings = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);

  // ✅ Fetch current logged-in admin role
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Look up in admin_users table
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        setCurrentAdminRole(data?.role || null);
      } catch (err) {
        console.error('Failed to fetch current admin role', err);
      }
    };

    fetchCurrentAdmin();
  }, []);

  // ✅ Fetch role definitions
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('user_roles').select('*');
        if (error) throw error;
        setRoles(data || []);
      } catch {
        toast.error('Failed to fetch user roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // ✅ Fetch users (profiles + admin_users via view)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_and_profiles_view')
          .select('id, email, full_name, role, source');
        if (error) throw error;
        setUsers(data || []);
      } catch {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  // ✅ Save role definitions
  const saveRole = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      if (editingRole.id) {
        const { error } = await supabase
          .from('user_roles')
          .update(editingRole)
          .eq('id', editingRole.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([editingRole]);
        if (error) throw error;
      }
      toast.success('Role saved');
      setEditingRole(null);
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Assign roles to users (decides based on source + enforce permissions)
  const updateUserRole = async (user: User, newRole: string) => {
    // Restriction: only superadmin can modify admin/superadmin roles
    if (
      currentAdminRole !== 'superadmin' &&
      (user.source === 'admin' || ['admin', 'superadmin'].includes(newRole))
    ) {
      toast.error('Only superadmin can assign/remove admin roles');
      return;
    }

    try {
      let error;

      if (user.source === 'profile') {
        // Customer (profiles table)
        const { error: e } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', user.id);
        error = e;
      } else {
        // Admin (admin_users table)
        const { error: e } = await supabase
          .from('admin_users')
          .upsert(
            {
              id: user.id,
              email: user.email,
              role: newRole,
              full_name: user.full_name,
            },
            { onConflict: 'id' }
          );
        error = e;
      }

      if (error) throw error;

      toast.success('User role updated');
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch {
      toast.error('Failed to update user role');
    }
  };

  if (loading) return <p>Loading user roles...</p>;

  return (
    <div className="space-y-8">
      {/* ================== Manage Roles (definitions) ================== */}
      <div>
        <h2 className="text-xl font-bold mb-4">Role Definitions</h2>
        <button
          onClick={() =>
            setEditingRole({ id: 0, role_name: '', permissions: {} })
          }
          className="btn-premium mb-4"
        >
          Add Role
        </button>
        {roles.map((role) => (
          <div key={role.id} className="p-3 border rounded mb-2">
            <h3>{role.role_name}</h3>
            <button
              onClick={() => setEditingRole(role)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}

        {editingRole && (
          <div className="mt-4 p-4 border rounded bg-white">
            <label className="block font-semibold">Role Name</label>
            <input
              value={editingRole.role_name}
              onChange={(e) =>
                setEditingRole({ ...editingRole, role_name: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            <label className="block font-semibold">Permissions (JSON)</label>
            <textarea
              rows={6}
              value={JSON.stringify(editingRole.permissions, null, 2)}
              onChange={(e) => {
                try {
                  const perms = JSON.parse(e.target.value);
                  setEditingRole({ ...editingRole, permissions: perms });
                } catch {
                  // Ignore invalid JSON
                }
              }}
              className="w-full border p-2 rounded mb-3"
            />
            <button
              onClick={saveRole}
              disabled={saving}
              className="btn-premium w-full"
            >
              {saving ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        )}
      </div>

      {/* ================== Manage User Assignments ================== */}
      <div>
        <h2 className="text-xl font-bold mb-4">Assign Roles to Users</h2>
        {users.map((user) => {
          // Dropdown options depend on current admin's permissions
          const roleOptions =
            currentAdminRole === 'superadmin'
              ? ['customer', 'admin', 'superadmin', 'productmanager', 'ordermanager']
              : ['customer', 'productmanager', 'ordermanager'];

          return (
            <div
              key={user.id}
              className="p-3 border rounded mb-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{user.full_name || user.email}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs italic text-gray-400">
                  Source: {user.source}
                </p>
              </div>
              <select
                value={user.role || 'customer'}
                onChange={(e) => updateUserRole(user, e.target.value)}
                className="border rounded px-2 py-1"
                disabled={
                  currentAdminRole !== 'superadmin' && user.source === 'admin'
                }
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserRolesSettings;
