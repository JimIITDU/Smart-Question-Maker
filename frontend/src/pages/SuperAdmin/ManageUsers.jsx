import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getAdminUsers,
  updateUserStatus,
  resetUserPassword,
} from '../../services/api';
import { FiSearch, FiEye, FiToggleLeft, FiToggleRight, FiKey, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';

const roleConfig = {
  2: 'Coaching Admin',
  3: 'Teacher', 
  5: 'Student',
  6: 'Parent'
};

const roleColors = {
  2: 'from-indigo-500 to-blue-500',
  3: 'from-emerald-500 to-teal-500',
  5: 'from-purple-500 to-pink-500',
  6: 'from-orange-500 to-red-500'
};

const ManageUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState(searchParams.get('role') || 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({});
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [pwdModal, setPwdModal] = useState({ open: false, tempPwd: '' });

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearchParams({ search, role: filter, page: '1' });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, filter]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = { page: page.toString(), search, role: filter === 'all' ? '' : filter };
        const res = await getAdminUsers(params);
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search, filter, page]);

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      toast.success('Status updated');
      // Refresh
      const params = { page: page.toString(), search, role: filter === 'all' ? '' : filter };
      const res = await getAdminUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const res = await resetUserPassword(userId);
      setPwdModal({ open: true, tempPwd: res.data.data.temporary_password });
      toast.success('Password reset');
    } catch (err) {
      toast.error('Failed to reset password');
    }
  };

  const tabs = [
    { id: 'all', label: 'All', role: '' },
    { id: 'coaching', label: 'Coaching Admins', role: '2' },
    { id: 'teachers', label: 'Teachers', role: '3' },
    { id: 'students', label: 'Students', role: '5' },
    { id: 'parents', label: 'Parents', role: '6' }
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Users</span>
        </h1>
        <p className="text-gray-400">Platform user management with advanced filters</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-end">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.role)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filter === tab.role
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Center</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-white uppercase flex-shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300 truncate max-w-xs">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                          roleColors[user.role_id] ? `bg-gradient-to-r ${roleColors[user.role_id]} text-white` : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {roleConfig[user.role_id] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300">{user.center_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-300 text-sm">
                          {new Date(user.joined_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewModal({ open: true, user })}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(user.user_id, user.is_active)}
                            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-all"
                            title={user.is_active ? 'Deactivate' : 'Reactivate'}
                          >
                            {user.is_active ? <FiToggleLeft /> : <FiToggleRight />}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.user_id)}
                            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-white/10 rounded-lg transition-all"
                            title="Reset Password"
                          >
                            <FiKey />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white/5 px-6 py-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    Showing {((page - 1) * 20 + 1)} to {Math.min(page * 20, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 disabled:opacity-50 hover:bg-white/20 transition-all disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-gray-400">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 disabled:opacity-50 hover:bg-white/20 transition-all disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {viewModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewModal({ open: false, user: null })}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <button onClick={() => setViewModal({ open: false, user: null })} className="text-gray-400 hover:text-white p-1">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {viewModal.user && (
              <div className="space-y-4 text-gray-300">
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Name</label>
                  <p className="text-white font-semibold">{viewModal.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Email</label>
                  <p>{viewModal.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Role</label>
                  <p>{roleConfig[viewModal.user.role_id] || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Center</label>
                  <p>{viewModal.user.center_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Joined</label>
                  <p>{new Date(viewModal.user.joined_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    viewModal.user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {viewModal.user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {pwdModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPwdModal({ open: false, tempPwd: '' })}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset</h2>
            <p className="text-gray-300 mb-6">Temporary password generated successfully.</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 font-mono font-bold text-lg text-white">
              {pwdModal.tempPwd}
            </div>
            <p className="text-sm text-gray-400 mb-6">User must change password on next login.</p>
            <button
              onClick={() => setPwdModal({ open: false, tempPwd: '' })}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageUsers;

