import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, hasRole } = useAuth();

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

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
      <nav className="mt-5 px-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;