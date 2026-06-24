import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaSearch, 
  FaSync, 
  FaUserCheck, 
  FaUserTimes,
  FaUserCircle,
  FaClock,
  FaBriefcase,
  FaChartBar,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaPrint,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaUserTie,
  FaRocket,
  FaShieldAlt
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
  Legend
} from 'recharts';
import { AttendanceCard, AttendanceCardGrid } from '../employee/AttendanceCard';

const TeamAttendance = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeamData();
  }, [selectedDate]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      const usersResponse = await api.get('/users', {
        params: { role: 'employee', limit: 100, isActive: true },
        timeout: 10000
      });
      
      const employees = usersResponse.data.data.users || [];
      setUsers(employees);

      if (employees.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch attendance for each employee with better error handling
      const attendancePromises = employees.map(emp =>
        api.get(`/attendance/history/${emp._id}`, {
          params: { from: selectedDate, to: selectedDate },
          timeout: 5000
        }).catch(err => {
          console.error(`Failed to fetch attendance for ${emp.email}:`, err.message);
          return { data: { data: { attendance: [] } } };
        })
      );
      
      const attendanceResponses = await Promise.all(attendancePromises);
      const attendanceMap = {};
      employees.forEach((emp, index) => {
        const records = attendanceResponses[index]?.data?.data?.attendance || [];
        attendanceMap[emp._id] = records[0] || null;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching team data:', error);
      if (error.response?.status === 403) {
        toast.error('You don\'t have permission to view team attendance');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Failed to fetch team data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeamData();
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterDepartment) {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(emp => {
        const record = attendance[emp._id];
        if (filterStatus === 'present') return record?.status === 'present';
        if (filterStatus === 'absent') return !record || record?.status === 'absent';
        if (filterStatus === 'half_day') return record?.status === 'half_day';
        return true;
      });
    }
    
    return filtered;
  }, [users, attendance, searchTerm, filterDepartment, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const present = Object.values(attendance).filter(a => a?.status === 'present').length;
    const absent = Object.values(attendance).filter(a => !a || a?.status === 'absent').length;
    const halfDay = Object.values(attendance).filter(a => a?.status === 'half_day').length;
    const holiday = Object.values(attendance).filter(a => a?.status === 'holiday').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    // Department distribution
    const deptStats = {};
    users.forEach(emp => {
      const dept = emp.department || 'Other';
      deptStats[dept] = (deptStats[dept] || 0) + 1;
    });
    
    return {
      total,
      present,
      absent,
      halfDay,
      holiday,
      attendanceRate,
      departmentStats: deptStats
    };
  }, [users, attendance]);

  // Chart data
  const chartData = useMemo(() => {
    return [
      { name: 'Present', value: stats.present },
      { name: 'Absent', value: stats.absent },
      { name: 'Half Day', value: stats.halfDay },
      { name: 'Holiday', value: stats.holiday }
    ].filter(d => d.value > 0);
  }, [stats]);

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  const getDepartmentOptions = () => {
    const depts = new Set(users.map(emp => emp.department).filter(Boolean));
    return Array.from(depts);
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800 border-green-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      half_day: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      holiday: 'bg-purple-100 text-purple-800 border-purple-200',
      weekend: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'present') return <FaUserCheck className="text-green-600" />;
    if (status === 'absent') return <FaUserTimes className="text-red-600" />;
    if (status === 'half_day') return <FaClock className="text-yellow-600" />;
    return null;
  };

  const exportCSV = () => {
    if (users.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Employee', 'Employee ID', 'Department', 'Clock In', 'Clock Out', 'Working Hours', 'Status'];
    const csvData = users.map(emp => {
      const record = attendance[emp._id];
      return [
        emp.fullName,
        emp.employeeId || 'N/A',
        emp.department || 'N/A',
        record?.clockIn?.time ? moment(record.clockIn.time).format('HH:mm') : '--:--',
        record?.clockOut?.time ? moment(record.clockOut.time).format('HH:mm') : '--:--',
        record?.workingHours ? record.workingHours.toFixed(1) : '0.0',
        record?.status?.toUpperCase() || 'ABSENT'
      ];
    });

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📊 CSV exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading team data...</p>
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
                  <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Team Attendance
                  </h1>
                  <p className="text-gray-500 mt-1">
                    View attendance for all team members
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {viewMode === 'table' ? <FaEye /> : <FaEyeSlash />}
                <span className="hidden sm:inline">
                  {viewMode === 'table' ? 'Card View' : 'Table View'}
                </span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
              >
                <FaDownload />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-500/25 text-white">
                  <p className="text-blue-100 text-xs uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-blue-100 text-xs">Employees</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg shadow-green-500/25 text-white">
                  <p className="text-green-100 text-xs uppercase tracking-wider">Present</p>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-green-100 text-xs">{stats.attendanceRate}% rate</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-lg shadow-red-500/25 text-white">
                  <p className="text-red-100 text-xs uppercase tracking-wider">Absent</p>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-red-100 text-xs">Employees</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 shadow-lg shadow-yellow-500/25 text-white">
                  <p className="text-yellow-100 text-xs uppercase tracking-wider">Half Day</p>
                  <p className="text-2xl font-bold">{stats.halfDay}</p>
                  <p className="text-yellow-100 text-xs">Employees</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg shadow-purple-500/25 text-white">
                  <p className="text-purple-100 text-xs uppercase tracking-wider">Holiday</p>
                  <p className="text-2xl font-bold">{stats.holiday}</p>
                  <p className="text-purple-100 text-xs">Employees</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-500/25 text-white">
                  <p className="text-indigo-100 text-xs uppercase tracking-wider">Departments</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.departmentStats).length}</p>
                  <p className="text-indigo-100 text-xs">Teams</p>
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
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Attendance Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
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
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaCalendarAlt className="inline mr-1 text-blue-500" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaSearch className="inline mr-1 text-purple-500" />
                Search
              </label>
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaBuilding className="inline mr-1 text-indigo-500" />
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">All Departments</option>
                {getDepartmentOptions().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FaFilter className="inline mr-1 text-pink-500" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('');
                  setFilterStatus('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaRocket className="text-gray-500" />
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{filteredUsers.length}</span> of{' '}
            <span className="font-medium text-gray-700">{users.length}</span> employees
          </p>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            {showStats ? <FaEyeSlash /> : <FaEye />}
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>

        {/* Team Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Clock In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Clock Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((emp, index) => {
                        const record = attendance[emp._id];
                        return (
                          <motion.tr
                            key={emp._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50/50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                  {emp.fullName?.charAt(0) || 'E'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{emp.fullName}</p>
                                  <p className="text-xs text-gray-500">{emp.employeeId || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {emp.department || 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              {record?.clockIn?.time ? (
                                <span className="text-sm text-gray-900">
                                  {moment(record.clockIn.time).format('HH:mm')}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">--:--</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {record?.clockOut?.time ? (
                                <span className="text-sm text-gray-900">
                                  {moment(record.clockOut.time).format('HH:mm')}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">--:--</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">
                                {record?.workingHours ? record.workingHours.toFixed(1) : '0.0'}h
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record?.status)}`}>
                                  {getStatusIcon(record?.status)}
                                  {record?.status?.toUpperCase() || 'ABSENT'}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FaUsers className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No employees found</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {searchTerm || filterDepartment || filterStatus 
                                ? 'Try adjusting your filters' 
                                : 'No team members available'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200/50 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length}
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaChevronLeft />
                    </motion.button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaChevronRight />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="cards-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AttendanceCardGrid 
                records={paginatedUsers.map(emp => {
                  const record = attendance[emp._id];
                  return {
                    ...record,
                    userId: emp._id,
                    date: selectedDate,
                    user: emp
                  };
                })}
                users={Object.fromEntries(paginatedUsers.map(emp => [emp._id, emp]))}
                compact={false}
                showUser={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <FaShieldAlt />
            <span>Data updated for {moment(selectedDate).format('DD MMM YYYY')}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>{users.length} employees • {stats.present} present</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendance;