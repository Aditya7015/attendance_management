import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCog,
  FaSave,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaClock,
  FaCalendarAlt,
  FaBriefcase,
  FaShieldAlt,
  FaRocket,
  FaFilter,
  FaSearch,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RuleManagement = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('ruleName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [formData, setFormData] = useState({
    ruleKey: '',
    ruleName: '',
    ruleValue: '',
    dataType: 'string',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rules');
      setRules(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch rules');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort rules
  const filteredRules = useMemo(() => {
    let filtered = rules;
    
    if (searchTerm) {
      filtered = filtered.filter(rule =>
        rule.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory) {
      filtered = filtered.filter(rule => rule.category === filterCategory);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(rule => 
        filterStatus === 'active' ? rule.isActive : !rule.isActive
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [rules, searchTerm, filterCategory, filterStatus, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.isActive).length;
    const inactive = total - active;
    const categories = {};
    rules.forEach(rule => {
      categories[rule.category] = (categories[rule.category] || 0) + 1;
    });
    return { total, active, inactive, categories };
  }, [rules]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/rules/${editingRule._id}`, formData);
        toast.success('✅ Rule updated successfully!', {
          icon: '🔄',
          style: {
            background: '#10B981',
            color: '#fff',
          }
        });
      } else {
        await api.post('/rules', formData);
        toast.success('🎉 Rule created successfully!', {
          icon: '🚀',
          style: {
            background: '#3B82F6',
            color: '#fff',
          }
        });
      }
      resetForm();
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (ruleId, isActive) => {
    try {
      await api.put(`/rules/${ruleId}`, { isActive: !isActive });
      toast.success(`Rule ${!isActive ? 'activated' : 'deactivated'}`, {
        icon: !isActive ? '✅' : '⏸️',
      });
      fetchRules();
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async (ruleId) => {
    try {
      await api.delete(`/rules/${ruleId}`);
      toast.success('🗑️ Rule deleted successfully!');
      setShowDeleteConfirm(null);
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const resetForm = () => {
    setFormData({
      ruleKey: '',
      ruleName: '',
      ruleValue: '',
      dataType: 'string',
      category: 'general',
      description: ''
    });
    setEditingRule(null);
    setShowModal(false);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      ruleKey: rule.ruleKey,
      ruleName: rule.ruleName,
      ruleValue: rule.ruleValue,
      dataType: rule.dataType || 'string',
      category: rule.category || 'general',
      description: rule.description || ''
    });
    setShowModal(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      time: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      leave: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      overtime: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      general: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      time: <FaClock />,
      leave: <FaCalendarAlt />,
      overtime: <FaBriefcase />,
      general: <FaShieldAlt />
    };
    return icons[category] || <FaCog />;
  };

  const renderValue = (rule) => {
    if (rule.dataType === 'boolean') {
      return rule.ruleValue ? (
        <span className="text-green-600">✓ Yes</span>
      ) : (
        <span className="text-red-600">✗ No</span>
      );
    } else if (rule.dataType === 'array') {
      return Array.isArray(rule.ruleValue) ? rule.ruleValue.join(', ') : rule.ruleValue;
    }
    return rule.ruleValue;
  };

  const getDataTypeIcon = (type) => {
    const icons = {
      string: '📝',
      number: '🔢',
      boolean: '🎯',
      time: '⏰',
      array: '📋'
    };
    return icons[type] || '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading rules...</p>
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
                  <FaCog className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Rules Configuration
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Manage attendance rules and system settings
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2"
            >
              <FaPlus />
              <span>Add Rule</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-500/25 text-white">
            <p className="text-indigo-100 text-xs uppercase tracking-wider">Total Rules</p>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-indigo-100 text-xs">Configured</p>
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
            <p className="text-purple-100 text-xs uppercase tracking-wider">Categories</p>
            <p className="text-2xl font-bold">{Object.keys(stats.categories).length}</p>
            <p className="text-purple-100 text-xs">Groups</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaSearch className="inline mr-1 text-indigo-500" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaFilter className="inline mr-1 text-purple-500" />
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="">All Categories</option>
                <option value="time">Time</option>
                <option value="leave">Leave</option>
                <option value="overtime">Overtime</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaToggleOn className="inline mr-1 text-green-500" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterStatus('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaRocket className="text-gray-500" />
                Reset Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Rules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRules.length > 0 ? (
            filteredRules.map((rule, index) => (
              <motion.div
                key={rule._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {rule.ruleName}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {rule.ruleKey}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                    {getCategoryIcon(rule.category)}
                    {rule.category.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-2xl font-bold text-indigo-600">
                    {renderValue(rule)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {getDataTypeIcon(rule.dataType)} Type: {rule.dataType}
                    </span>
                  </div>
                </div>

                {rule.description && (
                  <p className="text-sm text-gray-600 mb-3 bg-gray-50/50 p-2 rounded-lg">
                    {rule.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      rule.isActive 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleActive(rule._id, rule.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.isActive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={rule.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {rule.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(rule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeleteConfirm(rule._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <FaCog className="text-6xl mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium text-lg">No rules found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || filterCategory || filterStatus 
                    ? 'Try adjusting your filters' 
                    : 'Click "Add Rule" to create your first rule'}
                </p>
                {!searchTerm && !filterCategory && !filterStatus && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                  >
                    <FaPlus className="inline mr-2" />
                    Add Your First Rule
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Category Quick Stats */}
        {Object.keys(stats.categories).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-indigo-500" />
              Category Distribution
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div
                  key={category}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                  <span className="text-white font-medium">{category.toUpperCase()}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
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
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {editingRule ? (
                      <>
                        <FaEdit className="text-indigo-500" />
                        Edit Rule
                      </>
                    ) : (
                      <>
                        <FaPlus className="text-indigo-500" />
                        Add New Rule
                      </>
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
                      <span className="text-indigo-500 mr-1">🔑</span>
                      Rule Key (Unique Identifier)
                    </label>
                    <input
                      type="text"
                      name="ruleKey"
                      value={formData.ruleKey}
                      onChange={handleInputChange}
                      required
                      disabled={editingRule}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="work_start_time"
                    />
                    {editingRule && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <FaExclamationTriangle />
                        Rule key cannot be changed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-indigo-500 mr-1">📝</span>
                      Rule Name
                    </label>
                    <input
                      type="text"
                      name="ruleName"
                      value={formData.ruleName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="Work Start Time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-indigo-500 mr-1">📊</span>
                      Rule Value
                    </label>
                    <input
                      type="text"
                      name="ruleValue"
                      value={formData.ruleValue}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      placeholder="09:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-indigo-500 mr-1">📋</span>
                      Data Type
                    </label>
                    <select
                      name="dataType"
                      value={formData.dataType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="string">📝 String</option>
                      <option value="number">🔢 Number</option>
                      <option value="boolean">🎯 Boolean</option>
                      <option value="time">⏰ Time</option>
                      <option value="array">📋 Array</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-indigo-500 mr-1">🏷️</span>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="general">General</option>
                      <option value="time">⏰ Time</option>
                      <option value="leave">🏖️ Leave</option>
                      <option value="overtime">💼 Overtime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-indigo-500 mr-1">📄</span>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                      placeholder="Description of the rule"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaSave />
                      {editingRule ? 'Update Rule' : 'Create Rule'}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-red-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Rule?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this rule? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
                  >
                    Delete
                  </motion.button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RuleManagement;