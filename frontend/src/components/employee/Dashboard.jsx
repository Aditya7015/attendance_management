import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaClock, 
  FaCalendarCheck, 
  FaCalendarTimes, 
  FaChartLine,
  FaUserCircle,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaRocket,
  FaShieldAlt,
  FaBell,
  FaUserFriends,
  FaBriefcase,
  FaCalendarDay,
  FaClock as FaClockIcon
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-3 border border-white/10">
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-semibold">
          {payload[0].value.toFixed(1)} hours
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [chartData, setChartData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'You clocked in on time today! ✅', time: '2 min ago', type: 'success' },
    { id: 2, message: 'Your attendance streak is 5 days! 🔥', time: '1 hour ago', type: 'info' },
  ]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    fetchTodayStatus();
    fetchStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchTodayStatus();
      fetchStats();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today-status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      if (error.response?.status !== 500) {
        toast.error('Failed to fetch today\'s status');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/attendance/history', {
        params: { limit: 30 }
      });
      const records = response.data.data.attendance || [];
      
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const total = records.length;
      
      setStats({ present, absent, total });
      
      // Prepare chart data
      const chart = records.slice(0, 7).reverse().map(r => ({
        date: moment(r.date).format('DD MMM'),
        hours: r.workingHours || 0,
        status: r.status
      }));
      setChartData(chart);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch attendance history');
      }
    }
  };

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in');
      toast.success('🌟 Clocked in successfully!', {
        icon: '🚀',
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
      fetchTodayStatus();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clock in';
      toast.error(message);
      console.error('Clock in error:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out');
      toast.success('🎯 Clocked out successfully!', {
        icon: '✅',
        style: {
          background: '#3B82F6',
          color: '#fff',
        }
      });
      fetchTodayStatus();
      fetchStats();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clock out';
      toast.error(message);
      console.error('Clock out error:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTodayStatus(), fetchStats()]);
    setIsRefreshing(false);
    toast.success('🔄 Dashboard refreshed!', {
      icon: '✨',
      style: {
        background: '#8B5CF6',
        color: '#fff',
      }
    });
  };

  // Calculate attendance percentage
  const attendancePercentage = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
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

      {/* Header Section */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{getGreeting()}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user?.fullName}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <FaBell className="text-gray-600 text-lg" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <FaClockIcon className={`text-gray-600 text-lg ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/25 text-white hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium opacity-80">Present Days</p>
                <p className="text-3xl font-bold mt-1">{stats.present}</p>
                <p className="text-blue-100 text-xs mt-1 opacity-75">
                  {attendancePercentage}% attendance rate
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FaCalendarCheck className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg shadow-red-500/25 text-white hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-100 text-sm font-medium opacity-80">Absent Days</p>
                <p className="text-3xl font-bold mt-1">{stats.absent}</p>
                <p className="text-red-100 text-xs mt-1 opacity-75">
                  {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absence rate
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FaCalendarTimes className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg shadow-purple-500/25 text-white hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-medium opacity-80">Total Days</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-purple-100 text-xs mt-1 opacity-75">
                  Last 30 days
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FaChartLine className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-2xl p-6 shadow-lg text-white hover:shadow-xl transition-shadow ${
            status?.isClockedIn && !status?.isClockedOut 
              ? 'from-green-500 to-green-600 shadow-green-500/25' 
              : status?.isClockedOut 
              ? 'from-blue-500 to-blue-600 shadow-blue-500/25' 
              : 'from-gray-500 to-gray-600 shadow-gray-500/25'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium">Current Status</p>
                <p className="text-2xl font-bold mt-1">
                  {status?.isClockedIn && !status?.isClockedOut ? 'Working' : 
                   status?.isClockedOut ? 'Completed' : 'Not Started'}
                </p>
                <p className="text-white/75 text-xs mt-1">
                  {status?.workingHours ? `${status.workingHours.toFixed(1)} hours today` : 'No hours yet'}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <FaRocket className="text-white text-xl" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Attendance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCalendarDay className="text-blue-500" />
                  Today's Attendance
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {moment().format('dddd, MMMM D, YYYY')}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    status?.isClockedIn && !status?.isClockedOut ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">
                    {status?.isClockedIn && !status?.isClockedOut ? 'Active' : 
                     status?.isClockedOut ? 'Completed' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Clock In</p>
                <p className="text-2xl font-bold text-blue-900">
                  {status?.clockInTime ? moment(status.clockInTime).format('HH:mm') : '--:--'}
                </p>
              </div>
              <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Clock Out</p>
                <p className="text-2xl font-bold text-green-900">
                  {status?.clockOutTime ? moment(status.clockOutTime).format('HH:mm') : '--:--'}
                </p>
              </div>
              <div className="bg-purple-50/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Working Hours</p>
                <p className="text-2xl font-bold text-purple-900">
                  {status?.workingHours ? status.workingHours.toFixed(1) : '0.0'}h
                </p>
              </div>
              <div className="bg-yellow-50/80 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xs text-yellow-600 font-medium uppercase tracking-wider">Status</p>
                <p className={`text-2xl font-bold ${
                  status?.status === 'present' ? 'text-green-600' : 
                  status?.status === 'weekend' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {status?.status?.toUpperCase() || 'ABSENT'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockIn}
                disabled={status?.isClockedIn && !status?.isClockedOut}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  status?.isClockedIn && !status?.isClockedOut
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
                }`}
              >
                <FaArrowRight className="text-sm" />
                Clock In
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockOut}
                disabled={!status?.isClockedIn || status?.isClockedOut}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  !status?.isClockedIn || status?.isClockedOut
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105'
                }`}
              >
                <FaArrowLeft className="text-sm" />
                Clock Out
              </motion.button>
            </div>

            {status?.isLate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl flex items-center gap-3"
              >
                <FaClock className="text-yellow-600 text-lg" />
                <p className="text-sm text-yellow-800">
                  ⚠️ You were late by <span className="font-bold">{status.lateMinutes}</span> minutes today
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Attendance Ring */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Attendance Rate</h3>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-blue-500 transition-all duration-1000"
                      strokeWidth="8"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 * (1 - attendancePercentage / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
                      <p className="text-xs text-gray-500">Attendance</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">{stats.present} Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-xs text-gray-600">{stats.absent} Absent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center group">
                  <FaShieldAlt className="text-blue-500 text-xl mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-gray-600 mt-1">Request Leave</p>
                </button>
                <button className="p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center group">
                  <FaUserFriends className="text-purple-500 text-xl mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-gray-600 mt-1">Team View</p>
                </button>
                <button className="p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center group">
                  <FaBriefcase className="text-green-500 text-xl mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-gray-600 mt-1">Reports</p>
                </button>
                <button className="p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center group">
                  <FaClock className="text-yellow-500 text-xl mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-gray-600 mt-1">History</p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart Section */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  Weekly Performance
                </h3>
                <p className="text-sm text-gray-500 mt-1">Last 7 days working hours</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-600">Working Hours</span>
                </div>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    domain={[0, 10]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;