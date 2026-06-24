import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
  FaTimes,
  FaClock,
  FaUser,
  FaUserCircle,
  FaShieldAlt,
  FaChartBar,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaPrint,
  FaRocket,
  FaHistory,
  FaSync,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    status: '',
    from: '',
    to: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [actions, setActions] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetchActions();
    fetchLogs();
  }, [filters]);

  const fetchActions = async () => {
    try {
      const response = await api.get('/audit-logs/actions');
      setActions(response.data.data || []);
      // Extract unique resources from logs
      if (logs.length > 0) {
        const uniqueResources = [...new Set(logs.map(log => log.resource))];
        setResources(uniqueResources);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit-logs', {
        params: filters
      });
      setLogs(response.data.data.logs || []);
      setPagination(response.data.data.pagination || {});
      // Extract unique resources
      const uniqueResources = [...new Set((response.data.data.logs || []).map(log => log.resource))];
      setResources(uniqueResources);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      resource: '',
      status: '',
      from: '',
      to: '',
      search: '',
      page: 1,
      limit: 20
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const failure = logs.filter(l => l.status === 'failure').length;
    const actionsCount = {};
    logs.forEach(log => {
      actionsCount[log.action] = (actionsCount[log.action] || 0) + 1;
    });
    const topActions = Object.entries(actionsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return { total, success, failure, topActions, successRate: total > 0 ? Math.round((success/total)*100) : 0 };
  }, [logs]);

  // Chart data
  const chartData = useMemo(() => {
    const last7Days = {};
    const days = 7;
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('DD MMM');
      last7Days[date] = 0;
    }
    logs.forEach(log => {
      const date = moment(log.timestamp).format('DD MMM');
      if (last7Days[date] !== undefined) {
        last7Days[date]++;
      }
    });
    return Object.entries(last7Days).map(([date, count]) => ({ date, count }));
  }, [logs]);

  const statusData = useMemo(() => {
    return [
      { name: 'Success', value: stats.success },
      { name: 'Failure', value: stats.failure }
    ].filter(d => d.value > 0);
  }, [stats]);

  const COLORS = ['#10B981', '#EF4444'];

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      LOGOUT: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      CLOCK_IN: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      CLOCK_OUT: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      CREATE_CORRECTION: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      APPROVE_CORRECTION: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      REJECT_CORRECTION: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      CREATE_USER: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
      UPDATE_USER: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
      DELETE_USER: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      UPDATE_ROLE: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
      CREATE_RULE: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
      UPDATE_RULE: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
      DELETE_RULE: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      VIEW_AUDIT_LOGS: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    };
    return colors[action] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getActionIcon = (action) => {
    const icons = {
      LOGIN: <FaCheckCircle />,
      LOGOUT: <FaTimesCircle />,
      CLOCK_IN: <FaClock />,
      CLOCK_OUT: <FaClock />,
      CREATE_CORRECTION: <FaInfoCircle />,
      APPROVE_CORRECTION: <FaCheckCircle />,
      REJECT_CORRECTION: <FaTimesCircle />,
      CREATE_USER: <FaUser />,
      UPDATE_USER: <FaUser />,
      DELETE_USER: <FaUser />,
      UPDATE_ROLE: <FaShieldAlt />,
      CREATE_RULE: <FaShieldAlt />,
      UPDATE_RULE: <FaShieldAlt />,
      DELETE_RULE: <FaShieldAlt />
    };
    return icons[action] || <FaInfoCircle />;
  };

  const exportLogs = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'Status', 'Details', 'IP'];
    const csvData = logs.map(l => [
      moment(l.timestamp).format('DD/MM/YYYY HH:mm:ss'),
      l.user?.fullName || 'Unknown',
      l.userEmail || 'Unknown',
      l.action,
      l.resource,
      l.status,
      l.details?.message || JSON.stringify(l.details || {}),
      l.ip || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📊 Audit logs exported successfully!');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading audit logs...</p>
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
                  <FaHistory className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Audit Logs
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Complete audit trail of all system actions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
              >
                <FaDownload />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {showStats ? <FaEyeSlash /> : <FaEye />}
                <span className="hidden sm:inline">{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-500/25 text-white">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider">Total Logs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-indigo-100 text-xs">Records</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg shadow-green-500/25 text-white">
                  <p className="text-green-100 text-xs uppercase tracking-wider">Success</p>
                  <p className="text-2xl font-bold">{stats.success}</p>
                  <p className="text-green-100 text-xs">{stats.successRate}% rate</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-red-500/25 text-white">
                  <p className="text-red-100 text-xs uppercase tracking-wider">Failure</p>
                  <p className="text-2xl font-bold">{stats.failure}</p>
                  <p className="text-red-100 text-xs">{100 - stats.successRate}% rate</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg shadow-purple-500/25 text-white">
                  <p className="text-purple-100 text-xs uppercase tracking-wider">Actions</p>
                  <p className="text-2xl font-bold">{actions.length}</p>
                  <p className="text-purple-100 text-xs">Unique</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        {showStats && (chartData.length > 0 || statusData.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            {chartData.length > 0 && (
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(20px)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {statusData.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Top Actions */}
        {showStats && stats.topActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaChartBar className="text-indigo-500" />
              Top Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.topActions.map(([action, count]) => (
                <div
                  key={action}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getActionColor(action)}`}
                >
                  {getActionIcon(action)}
                  <span className="text-white font-medium">{action}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs text-white">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
                onClick={resetFilters}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      placeholder="Search logs..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaFilter className="inline mr-1 text-purple-500" />
                      Action
                    </label>
                    <select
                      name="action"
                      value={filters.action}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    >
                      <option value="">All Actions</option>
                      {actions.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaShieldAlt className="inline mr-1 text-green-500" />
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    >
                      <option value="">All</option>
                      <option value="success">Success</option>
                      <option value="failure">Failure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <FaCalendarAlt className="inline mr-1 text-orange-500" />
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="from"
                        value={filters.from}
                        onChange={handleFilterChange}
                        className="flex-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      />
                      <input
                        type="date"
                        name="to"
                        value={filters.to}
                        onChange={handleFilterChange}
                        className="flex-1 px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-900">
                            {moment(log.timestamp).format('DD MMM YYYY HH:mm:ss')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {log.user?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {log.user?.fullName || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          <FaShieldAlt className="text-gray-500" />
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 max-w-xs truncate">
                          {log.details?.message || 
                           (log.details && Object.keys(log.details).length > 0 ? 
                             JSON.stringify(log.details).slice(0, 50) + '...' : 
                             'No details')}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaHistory className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No logs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {filters.search || filters.action || filters.status || filters.from || filters.to
                            ? 'Try adjusting your filters'
                            : 'Audit logs will appear here as system activity occurs'}
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
                <span className="font-medium">{pagination.total}</span> logs
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
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
                        onClick={() => handlePageChange(pageNum)}
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
                  {pagination.pages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(pagination.pages)}
                        className="w-10 h-10 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-700"
                      >
                        {pagination.pages}
                      </motion.button>
                    </>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
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

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <FaShieldAlt />
            <span>Audit trail for all system actions</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{logs.length} logs loaded</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>Last updated: {moment().format('HH:mm:ss')}</span>
          </p>
        </div>
      </div>

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaInfoCircle className="text-indigo-500" />
                    Log Details
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Timestamp</p>
                      <p className="font-medium text-gray-900">
                        {moment(selectedLog.timestamp).format('DD MMM YYYY HH:mm:ss')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        selectedLog.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedLog.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">User</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {selectedLog.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedLog.user?.fullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Action</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                        {getActionIcon(selectedLog.action)}
                        {selectedLog.action}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Resource</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <FaShieldAlt className="text-gray-500" />
                        {selectedLog.resource}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Details</p>
                    <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                      {selectedLog.details?.message || 
                       (selectedLog.details && Object.keys(selectedLog.details).length > 0 ? 
                         JSON.stringify(selectedLog.details, null, 2) : 
                         'No details available')}
                    </div>
                  </div>

                  {selectedLog.ip && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">IP Address</p>
                      <p className="font-medium text-gray-900">{selectedLog.ip}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogs;