import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaUser,
  FaSignOutAlt,
  FaClock,
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaCog,
  FaQuestionCircle,
  FaShieldAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaUserCheck,
  FaFileAlt,
  FaHistory,
  FaUsers,
  FaHome,
  FaTachometerAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Dummy notifications
  const notifications = [
    { id: 1, message: 'Your attendance request was approved ✅', time: '2 min ago', read: false },
    { id: 2, message: 'New correction request from Employee 3', time: '1 hour ago', read: false },
    { id: 3, message: 'Weekly attendance report is ready 📊', time: '3 hours ago', read: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('👋 Logged out successfully!', {
        icon: '🚀',
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast.success(isDarkMode ? '☀️ Light mode activated!' : '🌙 Dark mode activated!');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Navigation items based on role
  const getNavItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    ];
    
    items.push({ path: '/history', label: 'History', icon: <FaHistory /> });
    
    if (user?.role === 'employee') {
      items.push({ path: '/request-correction', label: 'Request Correction', icon: <FaFileAlt /> });
    }
    
    if (user?.role === 'hr' || user?.role === 'admin') {
      items.push({ path: '/pending-requests', label: 'Requests', icon: <FaUserCheck /> });
      items.push({ path: '/team-attendance', label: 'Team', icon: <FaUsers /> });
    }
    
    if (user?.role === 'admin') {
      items.push({ path: '/users', label: 'Users', icon: <FaUser /> });
      items.push({ path: '/rules', label: 'Rules', icon: <FaShieldAlt /> });
      items.push({ path: '/audit-logs', label: 'Audit', icon: <FaFileAlt /> });
    }
    
    return items;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl' 
        : 'bg-white dark:bg-gray-900 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <FaClock className="text-white text-xl" />
                </div>
              </div>
              <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:block">
                Attendance<span className="text-blue-600 dark:text-blue-400">System</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavItems().map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Toggle Theme"
            >
              {isDarkMode ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-lg" />}
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-lg shadow-red-500/25"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                            !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center">
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role?.toUpperCase()}
                  </p>
                </div>
                <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                          {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-semibold">
                            {user?.role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUserCircle className="text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaCog className="text-gray-400" />
                        Settings
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaQuestionCircle className="text-gray-400" />
                        Help & Support
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-3 space-y-1">
                {getNavItems().map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;