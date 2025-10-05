import React, { useState, useEffect } from 'react';
import { Users, LogOut, Plus, Settings, User, Shield, Search, Filter, TrendingUp, Activity, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PAGES } from '../../constants/pages';
import Alert from '../common/Alert';
import UserPermissionPanel from './UserPermissionPanel';
import CreateUserPanel from './CreateUserPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';

const AdminDashboard = () => {
  const { user: currentUser, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await api.getUsers(token);
    if (result.success) {
      setUsers(result.data);
    } else {
      setAlert({ type: 'error', message: 'Failed to load users' });
    }
    setLoading(false);
  };

  const handleCreateUser = async (userData) => {
    setAlert({ type: 'success', message: 'User created successfully!' });
    fetchUsers();
  };

  const handleSavePermissions = async (userId, permissions) => {
    setAlert({ type: 'success', message: 'Permissions updated successfully!' });
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    const result = await api.deleteUser(userToDelete.id, token);

    if (result.success) {
      setAlert({ type: 'success', message: result.data.message || 'User deleted successfully!' });
      fetchUsers();
    } else {
      setAlert({ type: 'error', message: result.error || 'Failed to delete user' });
    }

    setUserToDelete(null);
    setDeleting(false);
  };

  const canDeleteUser = (user) => {
  
    if (user.id === currentUser.id) return false;

    if (user.role === 'superadmin') return false;
    return true;
  };

  const getPermissionBadge = (perms) => {
    if (!perms) return <span className="text-gray-400 text-xs">No access</span>;

    const activeCount = Object.values(perms).filter(Boolean).length;
    if (activeCount === 0) return <span className="text-gray-400 text-xs">No access</span>;

    const colors = {
      0: 'bg-gray-100 text-gray-600',
      1: 'bg-amber-100 text-amber-700',
      2: 'bg-green-100 text-green-700'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[activeCount] || colors[2]}`}>
        {activeCount} {activeCount === 1 ? 'permission' : 'permissions'}
      </span>
    );
  };

  const getActivePermissionsCount = (user) => {
    if (!user.permissions) return 0;
    return Object.values(user.permissions).reduce((count, pagePerms) => {
      return count + Object.values(pagePerms).filter(Boolean).length;
    }, 0);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
  
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">User Access Control System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-2.5 border border-gray-200/50 shadow-sm">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.email}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>View as User</span>
                </a>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
                  <p className="text-indigo-100">Manage users and their permissions across all pages</p>
                </div>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create New User
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                      <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'user').length}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Regular Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'superadmin').length}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Super Admins</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {users.reduce((total, user) => total + getActivePermissionsCount(user), 0)}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">Active Permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="superadmin">Super Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User</th>
                  {PAGES.map(page => (
                    <th key={page.id} className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                      {page.name}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={PAGES.length + 2} className="px-6 py-8">
                      <LoadingSpinner text="Loading users..." />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={PAGES.length + 2} className="px-6 py-12 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl font-semibold text-gray-900 mb-2">
                        {users.length === 0 ? 'No users found' : 'No matching users'}
                      </p>
                      <p className="text-gray-600 mb-6">
                        {users.length === 0
                          ? 'Create your first user to get started.'
                          : 'Try adjusting your search or filters'}
                      </p>
                      {users.length === 0 && (
                        <button
                          onClick={() => setShowCreateUser(true)}
                          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                        >
                          <Plus className="w-4 h-4" />
                          Create User
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {u.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{u.email}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {u.role === 'superadmin' ? (
                                <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold border border-purple-200">
                                  Super Admin
                                </span>
                              ) : (
                                <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold border border-blue-200">
                                  User
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {getActivePermissionsCount(u)} permissions
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {PAGES.map(page => (
                        <td key={page.id} className="px-4 py-5 text-center">
                          {getPermissionBadge(u.permissions?.[page.id])}
                        </td>
                      ))}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {u.role === 'superadmin' ? (
                            <div className="relative group">
                              <button
                                disabled
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium shadow-sm"
                                title="Cannot edit super admin accounts"
                              >
                                <Settings className="w-4 h-4" />
                                Edit
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                Cannot edit super admin accounts
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                            >
                              <Settings className="w-4 h-4" />
                              Edit
                            </button>
                          )}

                          {canDeleteUser(u) ? (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:scale-105"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="relative group">
                              <button
                                disabled
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium shadow-sm"
                                title={u.id === currentUser.id ? "Cannot delete your own account" : "Cannot delete super admin accounts"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                {u.id === currentUser.id ? "Cannot delete your own account" : "Cannot delete super admin accounts"}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

  
      {selectedUser && (
        <UserPermissionPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSavePermissions}
        />
      )}

      {showCreateUser && (
        <CreateUserPanel
          onClose={() => setShowCreateUser(false)}
          onCreate={handleCreateUser}
        />
      )}

      {userToDelete && (
        <ConfirmationModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure you want to delete this user?
              </p>
              <p className="text-gray-600">
                This will permanently delete <strong>{userToDelete.email}</strong> and all their data.
                This action cannot be undone.
              </p>
            </div>
          }
          confirmText={deleting ? "Deleting..." : "Delete User"}
          confirmColor="red"
          isProcessing={deleting}
        />
      )}
    </div>
  );
};

export default AdminDashboard;