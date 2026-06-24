import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaBuilding,
  FaBriefcase,
  FaPhone,
  FaShieldAlt,
  FaRocket,
  FaFilter,
  FaTimes,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaChartPie,
  FaDownload
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee',
    department: '',
    designation: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        role: filters.role,
        page: filters.page,
        limit: filters.limit
      };
      if (filters.status) {
        params.isActive = filters.status === 'active';
      }
      const response = await api.get('/users', { params });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const admins = users.filter(u => u.role === 'admin').length;
    const hrs = users.filter(u => u.role === 'hr').length;
    const employees = users.filter(u => u.role === 'employee').length;
    return { total, active, inactive, admins, hrs, employees };
  }, [users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        toast.success('✅ User updated successfully!', {
          icon: '🎉',
          style: {
            background: '#10B981',
            color: '#fff',
          }
        });
      } else {
        await api.post('/users', formData);
        toast.success('🎉 User created successfully!', {
          icon: '🚀',
          style: {
            background: '#3B82F6',
            color: '#fff',
          }
        });
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('🔄 Role updated successfully!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !currentStatus });
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('⚠️ Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'employee',
      department: '',
      designation: '',
      phoneNumber: ''
    });
    setEditingUser(null);
    setShowModal(false);
    setShowPassword(false);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role,
      department: user.department || '',
      designation: user.designation || '',
      phoneNumber: user.phoneNumber || ''
    });
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      hr: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      employee: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FaShieldAlt className="text-white" />,
      hr: <FaUserCheck className="text-white" />,
      employee: <FaUser className="text-white" />
    };
    return icons[role] || <FaUser className="text-white" />;
  };

  const exportUsers = () => {
    if (users.length === 0) {
      toast.error('No users to export');
      return;
    }

    const headers = ['Name', 'Email', 'Employee ID', 'Role', 'Department', 'Designation', 'Phone', 'Status'];
    const csvData = users.map(u => [
      u.fullName,
      u.email,
      u.employeeId || 'N/A',
      u.role.toUpperCase(),
      u.department || 'N/A',
      u.designation || 'N/A',
      u.phoneNumber || 'N/A',
      u.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📊 Users exported successfully!');
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    User Management
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Manage system users and their roles
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
              >
                <FaDownload />
                <span className="hidden sm:inline">Export</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2"
              >
                <FaPlus />
                <span>Add User</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-500/25 text-white">
            <p className="text-blue-100 text-xs uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-blue-100 text-xs">Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg shadow-green-500/25 text-white">
            <p className="text-green-100 text-xs uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-green-100 text-xs">{Math.round((stats.active/stats.total)*100)}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-red-500/25 text-white">
            <p className="text-red-100 text-xs uppercase tracking-wider">Inactive</p>
            <p className="text-2xl font-bold">{stats.inactive}</p>
            <p className="text-red-100 text-xs">{Math.round((stats.inactive/stats.total)*100)}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg shadow-purple-500/25 text-white">
            <p className="text-purple-100 text-xs uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-bold">{stats.admins}</p>
            <p className="text-purple-100 text-xs">Users</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 shadow-lg shadow-blue-500/25 text-white">
            <p className="text-blue-100 text-xs uppercase tracking-wider">HR</p>
            <p className="text-2xl font-bold">{stats.hrs}</p>
            <p className="text-blue-100 text-xs">Users</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/25 text-white">
            <p className="text-green-100 text-xs uppercase tracking-wider">Employees</p>
            <p className="text-2xl font-bold">{stats.employees}</p>
            <p className="text-green-100 text-xs">Users</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors"
            >
              <FaFilter />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setFilters({ search: '', role: '', status: '', page: 1, limit: 10 });
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaSearch className="inline mr-1 text-indigo-500" />
                      Search
                    </label>
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="Name or email..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaUserTag className="inline mr-1 text-purple-500" />
                      Role
                    </label>
                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="hr">HR</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaUserCheck className="inline mr-1 text-green-500" />
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchUsers}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <FaSearch />
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.fullName}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.employeeId || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                          {getRoleIcon(u.role)}
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {u.department || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          u.isActive 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.isActive 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <FaUserTimes /> : <FaUserCheck />}
                          </motion.button>
                          {u.role !== 'admin' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(u._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deactivate User"
                            >
                              <FaTrash />
                            </motion.button>
                          )}
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-sm border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            disabled={u.role === 'admin' && users.filter(usr => usr.role === 'admin').length === 1}
                          >
                            <option value="employee">Employee</option>
                            <option value="hr">HR</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaUsers className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {filters.search || filters.role || filters.status 
                            ? 'Try adjusting your filters' 
                            : 'Click "Add User" to create your first user'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="px-4 py-3 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> users
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </motion.button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === pagination.page;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingUser ? (
                      <span className="flex items-center gap-2">
                        <FaEdit className="text-indigo-500" />
                        Edit User
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FaPlus className="text-indigo-500" />
                        Add New User
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaUser className="inline mr-1 text-indigo-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaEnvelope className="inline mr-1 text-indigo-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="john@company.com"
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <FaLock className="inline mr-1 text-indigo-500" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingUser}
                          className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-10"
                          placeholder="Minimum 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaUserTag className="inline mr-1 text-indigo-500" />
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaBuilding className="inline mr-1 text-indigo-500" />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaBriefcase className="inline mr-1 text-indigo-500" />
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaPhone className="inline mr-1 text-indigo-500" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                    >
                      {editingUser ? 'Update User' : 'Create User'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;