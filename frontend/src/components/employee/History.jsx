import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import { 
  FaSearch, 
  FaFileExport, 
  FaChevronLeft, 
  FaChevronRight,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
  FaFilter,
  FaDownload,
  FaPrint,
  FaEye,
  FaEyeSlash,
  FaSortUp,
  FaSortDown,
  FaCalendarWeek,
  FaCalendarMonth,
  FaCalendarDay
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
  Legend
} from 'recharts';

const History = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: '',
    page: 1,
    limit: 20
  });

  // Statistics calculation
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const halfDay = records.filter(r => r.status === 'half_day').length;
    const totalHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0);
    const avgHours = total > 0 ? totalHours / total : 0;
    const lateCount = records.filter(r => r.isLate).length;
    const onTimeCount = total - lateCount;
    
    return {
      total,
      present,
      absent,
      halfDay,
      totalHours,
      avgHours,
      lateCount,
      onTimeCount,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [records]);

  // Chart data
  const chartData = useMemo(() => {
    const last7Days = records.slice(0, 7).reverse();
    return last7Days.map(r => ({
      date: moment(r.date).format('DD MMM'),
      hours: r.workingHours || 0,
      status: r.status
    }));
  }, [records]);

  const statusDistribution = useMemo(() => {
    const distribution = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      half_day: records.filter(r => r.status === 'half_day').length,
      holiday: records.filter(r => r.status === 'holiday').length,
    };
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  }, [records]);

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/history', {
        params: {
          from: filters.from,
          to: filters.to,
          status: filters.status || undefined,
          page: filters.page,
          limit: filters.limit
        }
      });
      setRecords(response.data.data.attendance);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch history');
      console.error('Error fetching history:', error);
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: { class: 'bg-green-100 text-green-800 border-green-200', icon: <FaCheckCircle className="text-green-500" /> },
      absent: { class: 'bg-red-100 text-red-800 border-red-200', icon: <FaTimesCircle className="text-red-500" /> },
      half_day: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <FaClock className="text-yellow-500" /> },
      holiday: { class: 'bg-purple-100 text-purple-800 border-purple-200', icon: <FaCalendarAlt className="text-purple-500" /> },
      weekend: { class: 'bg-gray-100 text-gray-800 border-gray-200', icon: <FaCalendarAlt className="text-gray-500" /> }
    };
    return badges[status] || badges.present;
  };

  const exportCSV = () => {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = ['Date', 'Clock In', 'Clock Out', 'Working Hours', 'Status', 'Late'];
    const csvData = records.map(r => [
      moment(r.date).format('DD/MM/YYYY'),
      r.clockIn ? moment(r.clockIn.time).format('HH:mm') : '--:--',
      r.clockOut ? moment(r.clockOut.time).format('HH:mm') : '--:--',
      r.workingHours ? r.workingHours.toFixed(1) : '0.0',
      r.status.toUpperCase(),
      r.isLate ? `${r.lateMinutes}m late` : 'On time'
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_history_${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📊 CSV exported successfully!');
  };

  const resetFilters = () => {
    setFilters({
      from: '',
      to: '',
      status: '',
      page: 1,
      limit: 20
    });
  };

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                  <FaCalendarAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Attendance History
                  </h1>
                  <p className="text-gray-500 mt-1">
                    View and manage your attendance records
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
              >
                <FaDownload />
                <span className="hidden sm:inline">Export CSV</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {showStats ? <FaEyeSlash /> : <FaEye />}
                <span className="hidden sm:inline">{showStats ? 'Hide' : 'Show'} Stats</span>
              </motion.button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg shadow-blue-500/25 text-white">
                  <p className="text-blue-100 text-xs uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-blue-100 text-xs">Records</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg shadow-green-500/25 text-white">
                  <p className="text-green-100 text-xs uppercase tracking-wider">Present</p>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-green-100 text-xs">{stats.attendanceRate}% rate</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-lg shadow-red-500/25 text-white">
                  <p className="text-red-100 text-xs uppercase tracking-wider">Absent</p>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-red-100 text-xs">Days</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 shadow-lg shadow-yellow-500/25 text-white">
                  <p className="text-yellow-100 text-xs uppercase tracking-wider">Half Day</p>
                  <p className="text-2xl font-bold">{stats.halfDay}</p>
                  <p className="text-yellow-100 text-xs">Days</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg shadow-purple-500/25 text-white">
                  <p className="text-purple-100 text-xs uppercase tracking-wider">Avg Hours</p>
                  <p className="text-2xl font-bold">{stats.avgHours.toFixed(1)}h</p>
                  <p className="text-purple-100 text-xs">Per day</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg shadow-indigo-500/25 text-white">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider">On Time</p>
                  <p className="text-2xl font-bold">{stats.onTimeCount}</p>
                  <p className="text-indigo-100 text-xs">
                    {stats.total > 0 ? Math.round((stats.onTimeCount / stats.total) * 100) : 0}% of days
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        {showStats && chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Working Hours</h3>
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
                    <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

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
              className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="from"
                      value={filters.from}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="to"
                      value={filters.to}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half Day</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchHistory}
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

        {/* Records Table */}
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
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Late
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length > 0 ? (
                  records.map((record, index) => {
                    const statusBadge = getStatusBadge(record.status);
                    return (
                      <motion.tr
                        key={record._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {moment(record.date).format('DD MMM YYYY')}
                          </span>
                          <p className="text-xs text-gray-400">
                            {moment(record.date).format('dddd')}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.clockIn ? (
                            <div className="flex items-center gap-2">
                              <FaClock className="text-blue-400 text-xs" />
                              <span className="text-gray-700">
                                {moment(record.clockIn.time).format('HH:mm')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">--:--</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.clockOut ? (
                            <div className="flex items-center gap-2">
                              <FaClock className="text-green-400 text-xs" />
                              <span className="text-gray-700">
                                {moment(record.clockOut.time).format('HH:mm')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">--:--</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {record.workingHours ? record.workingHours.toFixed(1) : '0.0'}h
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                            {statusBadge.icon}
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.isLate ? (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <FaTimesCircle className="text-xs" />
                              {record.lateMinutes}m late
                            </span>
                          ) : record.clockIn ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <FaCheckCircle className="text-xs" />
                              On time
                            </span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No attendance records found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex items-center gap-2">
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
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
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
      </div>
    </div>
  );
};

export default History;