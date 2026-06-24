import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaHistory,
  FaEdit,
  FaUsers,
  FaUserCog,
  FaClipboardList,
  FaChartBar,
  FaFileAlt,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaSignOutAlt,
  FaShieldAlt,
  FaBell,
  FaClock,
  FaRocket
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if sidebar should be collapsed based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const navItems = [
    {
      path: '/dashboard',
      icon: <FaHome />,
      label: 'Dashboard',
      roles: ['employee', 'hr', 'admin']
    },
    {
      path: '/history',
      icon: <FaHistory />,
      label: 'History',
      roles: ['employee', 'hr', 'admin']
    },
    {
      path: '/request-correction',
      icon: <FaEdit />,
      label: 'Request Correction',
      roles: ['employee']
    },
    {
      path: '/pending-requests',
      icon: <FaClipboardList />,
      label: 'Pending Requests',
      roles: ['hr', 'admin']
    },
    {
      path: '/team-attendance',
      icon: <FaUsers />,
      label: 'Team Attendance',
      roles: ['hr', 'admin']
    },
    {
      path: '/users',
      icon: <FaUserCog />,
      label: 'User Management',
      roles: ['admin']
    },
    {
      path: '/rules',
      icon: <FaCog />,
      label: 'Rules Configuration',
      roles: ['admin']
    },
    {
      path: '/audit-logs',
      icon: <FaFileAlt />,
      label: 'Audit Logs',
      roles: ['admin']
    }
  ];

  const filteredItems = navItems.filter(item =>
    item.roles.some(role => hasRole([role]))
  );

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    const colors = {
      admin: 'bg-gradient-to-r from-red-500 to-red-600',
      hr: 'bg-gradient-to-r from-blue-500 to-blue-600',
      employee: 'bg-gradient-to-r from-green-500 to-green-600'
    };
    return colors[user?.role] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  // Get role icon
  const getRoleIcon = () => {
    const icons = {
      admin: <FaShieldAlt />,
      hr: <FaUsers />,
      employee: <FaUserCircle />
    };
    return icons[user?.role] || <FaUserCircle />;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl" />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3 top-20 z-50 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 ${
          isCollapsed ? 'rotate-180' : ''
        }`}
      >
        {isCollapsed ? <FaChevronRight className="text-white text-xs" /> : <FaChevronLeft className="text-white text-xs" />}
      </button>

      {/* Logo/Brand */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-6 border-b border-gray-700/50`}>
        <div className="relative">
          <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/25">
            <FaClock className="text-white text-xl" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-3"
            >
              <div className="font-bold text-lg text-white">
                Attendance<span className="text-blue-400">System</span>
              </div>
              <div className="text-[10px] text-gray-400 tracking-wider uppercase">
                v2.0.0
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-4 border-b border-gray-700/50`}>
        <div className="relative">
          <div className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25`}>
            {getInitials()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 flex-1 min-w-0"
          >
            <div className="font-semibold text-white truncate">
              {user?.fullName || 'User'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${getRoleBadgeColor()}`}>
                {getRoleIcon()}
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4">
        <div className="space-y-1">
          {filteredItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={`group relative flex items-center ${
                    isCollapsed ? 'justify-center' : 'gap-3'
                  } px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-r-full"
                    />
                  )}

                  {/* Icon */}
                  <span className={`text-xl ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      className={`text-sm font-medium ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`}
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl border border-gray-700">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`absolute bottom-0 left-0 right-0 ${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-gray-700/50`}>
        <div className="space-y-2">
          {/* Quick Stats */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Today</span>
                <span className="text-green-400 font-semibold">● Online</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-gray-400">Hours</span>
                <span className="text-white font-medium">8.5h</span>
              </div>
            </motion.div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } w-full px-3 py-2.5 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-400 hover:bg-red-500/10 group`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl border border-gray-700">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;